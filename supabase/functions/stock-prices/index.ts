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

    // Fetch prices from Yahoo Finance API (works with .NS suffix for NSE stocks)
    const quotes: StockQuote[] = [];
    
    for (const symbol of symbols) {
      try {
        // Handle index symbols differently - they use Yahoo's format directly
        let yahooSymbol = symbol;
        
        // Check if it's an index symbol (starts with ^) or a stock
        if (!symbol.startsWith('^')) {
          yahooSymbol = `${symbol}.NS`;
        }
        
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
        
        console.log(`Fetching ${yahooSymbol} from Yahoo Finance...`);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${symbol}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];
        
        if (result) {
          const meta = result.meta;
          const price = meta.regularMarketPrice || 0;
          const previousClose = meta.previousClose || meta.chartPreviousClose || price;
          const change = price - previousClose;
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

          quotes.push({
            symbol,
            price: Math.round(price * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            previousClose: Math.round(previousClose * 100) / 100,
            lastUpdated: new Date().toISOString()
          });

          console.log(`${symbol}: ₹${price.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    console.log(`Successfully fetched ${quotes.length}/${symbols.length} quotes`);

    return new Response(
      JSON.stringify({ quotes, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in stock-prices function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
