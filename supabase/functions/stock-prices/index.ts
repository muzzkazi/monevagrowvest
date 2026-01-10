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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Symbols array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching prices for symbols:', symbols);

    // Fetch prices from Yahoo Finance quote API (batch-friendly)
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

    const yahooSymbols = symbols.map(toYahooSymbol);

    // Yahoo quote endpoint supports multiple symbols in one call; keep batches small to avoid URL limits
    const BATCH_SIZE = 25;
    const resultsByYahooSymbol = new Map<string, any>();

    for (let i = 0; i < yahooSymbols.length; i += BATCH_SIZE) {
      const batch = yahooSymbols.slice(i, i + BATCH_SIZE);
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${batch.map(encodeURIComponent).join(',')}`;

      console.log(`Fetching batch ${i / BATCH_SIZE + 1} (${batch.length} symbols) from Yahoo Finance quote API...`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json,text/plain,*/*'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch batch: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const results = data?.quoteResponse?.result ?? [];

      for (const r of results) {
        if (r?.symbol) resultsByYahooSymbol.set(r.symbol, r);
      }
    }

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      const yahooSymbol = yahooSymbols[i];

      const q = resultsByYahooSymbol.get(yahooSymbol);
      if (!q) {
        console.error(`No quote returned for ${symbol} (${yahooSymbol})`);
        continue;
      }

      const price = Number(q.regularMarketPrice ?? q.postMarketPrice ?? 0);
      const previousClose = Number(q.regularMarketPreviousClose ?? q.previousClose ?? price);
      const change = Number(q.regularMarketChange ?? (price - previousClose));
      const changePercent = Number(
        q.regularMarketChangePercent ?? (previousClose > 0 ? (change / previousClose) * 100 : 0)
      );

      if (!Number.isFinite(price) || price <= 0) {
        console.error(`Invalid price for ${symbol} (${yahooSymbol}):`, price);
        continue;
      }

      quotes.push({
        symbol,
        price: round2(price),
        change: round2(change),
        changePercent: round2(changePercent),
        previousClose: round2(previousClose),
        lastUpdated
      });

      console.log(`${symbol}: ₹${price.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
    }

    console.log(`Successfully fetched ${quotes.length}/${symbols.length} quotes`);

    return new Response(
      JSON.stringify({ quotes, timestamp: lastUpdated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error in stock-prices function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
