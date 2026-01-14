import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  lastUpdated: string;
}

// Input validation constants
const MAX_SYMBOLS = 50;
const SYMBOL_PATTERN = /^[A-Z0-9^.&-]{1,20}$/;

// Validate and sanitize symbol input
const validateSymbol = (symbol: unknown): string | null => {
  if (typeof symbol !== 'string') return null;
  const trimmed = symbol.trim().toUpperCase();
  if (!SYMBOL_PATTERN.test(trimmed)) return null;
  return trimmed;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { symbols } = body;
    
    // Validate symbols is an array
    if (!symbols || !Array.isArray(symbols)) {
      return new Response(
        JSON.stringify({ error: 'Symbols must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate array length
    if (symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Symbols array cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (symbols.length > MAX_SYMBOLS) {
      return new Response(
        JSON.stringify({ error: `Too many symbols. Maximum allowed: ${MAX_SYMBOLS}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize each symbol
    const validSymbols: string[] = [];
    for (const symbol of symbols) {
      const validated = validateSymbol(symbol);
      if (validated) {
        validSymbols.push(validated);
      } else {
        console.warn(`Invalid symbol rejected: ${JSON.stringify(symbol).slice(0, 50)}`);
      }
    }

    if (validSymbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid symbols provided. Symbols must be 1-20 alphanumeric characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching prices for ${validSymbols.length} validated symbols`);

    // Fetch prices from Yahoo Finance chart API (reliable, no auth)
    const quotes: StockQuote[] = [];

    const toYahooSymbol = (symbol: string) => {
      // Index symbols use Yahoo's format directly (e.g. ^NSEI)
      if (symbol.startsWith('^')) return symbol;
      // Stocks: NSE uses .NS
      return `${symbol}.NS`;
    };

    const round2 = (n: number) => Math.round(n * 100) / 100;

    const requestedAt = new Date();
    const lastUpdated = requestedAt.toISOString();

    const fetchChart = async (symbol: string, yahooSymbol: string): Promise<StockQuote | null> => {
      try {
        // interval=1m gives intraday updates when available
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1m&range=1d`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json,text/plain,*/*'
          }
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${symbol} (${yahooSymbol}): ${response.status}`);
          return null;
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];
        if (!result?.meta) {
          console.error(`No chart meta returned for ${symbol} (${yahooSymbol})`);
          return null;
        }

        const meta = result.meta;

        const price = Number(meta.regularMarketPrice ?? 0);
        const previousClose = Number(meta.previousClose ?? meta.chartPreviousClose ?? price);
        const change = price - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

        if (!Number.isFinite(price) || price <= 0) {
          console.error(`Invalid price for ${symbol} (${yahooSymbol}):`, price);
          return null;
        }

        return {
          symbol,
          price: round2(price),
          change: round2(change),
          changePercent: round2(changePercent),
          previousClose: round2(previousClose),
          lastUpdated,
        };
      } catch (error) {
        console.error(`Error fetching ${symbol} (${yahooSymbol}):`, error);
        return null;
      }
    };

    // Concurrency limit to keep latency low without overloading Yahoo
    const CONCURRENCY = 10;
    const tasks = validSymbols.map((symbol) => {
      const yahooSymbol = toYahooSymbol(symbol);
      return () => fetchChart(symbol, yahooSymbol);
    });

    for (let i = 0; i < tasks.length; i += CONCURRENCY) {
      const slice = tasks.slice(i, i + CONCURRENCY);
      const results = await Promise.all(slice.map((fn) => fn()));
      for (const q of results) {
        if (!q) continue;
        quotes.push(q);
        console.log(`${q.symbol}: ₹${q.price.toFixed(2)} (${q.change >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`);
      }
    }

    console.log(`Successfully fetched ${quotes.length}/${validSymbols.length} quotes`);

    return new Response(
      JSON.stringify({ quotes, timestamp: lastUpdated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error in stock-prices function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
