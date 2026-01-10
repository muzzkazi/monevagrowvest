import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface IndexData {
  name: string;
  symbol: string;
  value: string;
  change: string;
  changePercent: string;
}

interface StockData {
  symbol: string;
  price: string;
  change: string;
  percent: string;
}

// Index symbols for Yahoo Finance
const indexSymbols = [
  { name: "NIFTY 50", symbol: "^NSEI" },
  { name: "SENSEX", symbol: "^BSESN" },
  { name: "NIFTY BANK", symbol: "^NSEBANK" },
  { name: "NIFTY IT", symbol: "^CNXIT" },
];

// Default indices with fallback values
const defaultIndices: IndexData[] = [
  { name: "NIFTY 50", symbol: "^NSEI", value: "---", change: "---", changePercent: "---" },
  { name: "SENSEX", symbol: "^BSESN", value: "---", change: "---", changePercent: "---" },
  { name: "NIFTY BANK", symbol: "^NSEBANK", value: "---", change: "---", changePercent: "---" },
  { name: "NIFTY IT", symbol: "^CNXIT", value: "---", change: "---", changePercent: "---" },
];

// NIFTY 50 stock symbols to fetch
const stockSymbols = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "ITC", "SBIN",
  "BHARTIARTL", "KOTAKBANK", "LT", "ASIANPAINT", "MARUTI", "TITAN", "WIPRO",
  "NESTLEIND", "POWERGRID", "NTPC", "ONGC", "COALINDIA", "HCLTECH", "TECHM",
  "BAJFINANCE", "BAJAJFINSV", "SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB",
  "HEROMOTOCO", "M&M", "TATAMOTORS", "TATASTEEL", "JSWSTEEL", "HINDALCO",
  "ADANIPORTS", "ULTRACEMCO", "GRASIM", "SBILIFE", "HDFCLIFE", "INDUSINDBK",
  "AXISBANK", "APOLLOHOSP", "BRITANNIA", "TATACONSUM", "EICHERMOT", "BPCL"
];

const SecondaryBand = () => {
  const [indices, setIndices] = useState<IndexData[]>(defaultIndices);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatPercent = (percent: number): string => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const fetchStockPrices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stock-prices', {
        body: { symbols: stockSymbols }
      });

      if (error) {
        console.error('Error fetching stock prices:', error);
        return;
      }

      if (data?.quotes) {
        const formattedStocks: StockData[] = data.quotes.map((quote: StockQuote) => ({
          symbol: quote.symbol,
          price: formatPrice(quote.price),
          change: formatChange(quote.change),
          percent: formatPercent(quote.changePercent)
        }));
        setStocks(formattedStocks);
      }
    } catch (error) {
      console.error('Error fetching stock prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIndices = async () => {
    try {
      // Fetch actual index data using Yahoo Finance symbols
      const symbols = indexSymbols.map(i => i.symbol);
      const { data, error } = await supabase.functions.invoke('stock-prices', {
        body: { symbols }
      });

      if (error || !data?.quotes) {
        console.error('Error fetching indices:', error);
        return;
      }

      // Map fetched data to index format
      const updatedIndices: IndexData[] = indexSymbols.map(idx => {
        const quote = data.quotes.find((q: StockQuote) => q.symbol === idx.symbol);
        if (quote) {
          return {
            name: idx.name,
            symbol: idx.symbol,
            value: formatPrice(quote.price),
            change: formatChange(quote.change),
            changePercent: formatPercent(quote.changePercent)
          };
        }
        return defaultIndices.find(d => d.symbol === idx.symbol) || defaultIndices[0];
      });
      
      setIndices(updatedIndices);
    } catch (error) {
      console.error('Error fetching indices:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStockPrices();
    fetchIndices();

    // Refresh every 60 seconds
    const interval = setInterval(() => {
      fetchStockPrices();
      fetchIndices();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Show loading skeleton or fallback data while loading
  const displayStocks = stocks.length > 0 ? stocks : stockSymbols.slice(0, 20).map(symbol => ({
    symbol,
    price: "---",
    change: "---",
    percent: "---"
  }));

  return (
    <div className="bg-financial-primary text-white pt-4 pb-2 w-full z-20 overflow-hidden flex flex-col justify-center">
      {/* First line - Indices */}
      <div className="relative mb-2 overflow-hidden">
        <div className="flex animate-scroll will-change-transform">
          {/* Continuous loop - multiple copies for seamless scrolling */}
          {[...indices, ...indices, ...indices, ...indices].map((item, index) => {
            const isPositive = !item.change.startsWith('-');
            return (
              <div key={`index-${index}`} className="flex items-center whitespace-nowrap flex-shrink-0">
                <div className="flex items-center gap-2 px-6">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-base font-bold">{item.value}</span>
                  <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <span>{isPositive ? '↗' : '↘'}</span>
                    <span>{item.change}</span>
                    <span>({item.changePercent})</span>
                  </span>
                </div>
                <span className="text-white/40 mx-4">|</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Second line - NIFTY 50 Stocks */}
      <div className="relative overflow-hidden">
        <div className="flex animate-scroll-fast will-change-transform">
          {/* Continuous loop - multiple copies for seamless scrolling */}
          {[...displayStocks, ...displayStocks, ...displayStocks, ...displayStocks].map((stock, index) => {
            const isPositive = !stock.change.startsWith('-');
            const isLoaded = stock.price !== "---";
            return (
              <div key={`stock-${index}`} className="flex items-center whitespace-nowrap flex-shrink-0">
                <div className="flex items-center gap-2 px-3">
                  <span className="font-medium text-xs text-white/90">{stock.symbol}</span>
                  <span className={`text-sm font-semibold ${!isLoaded ? 'animate-pulse' : ''}`}>
                    {isLoaded ? `₹${stock.price}` : stock.price}
                  </span>
                  {isLoaded && (
                    <>
                      <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change}
                      </span>
                      <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        ({stock.percent})
                      </span>
                    </>
                  )}
                </div>
                <span className="text-white/30 mx-2">•</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live indicator */}
      {stocks.length > 0 && (
        <div className="absolute top-1 right-2 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/60">Live</span>
        </div>
      )}
    </div>
  );
};

export default SecondaryBand;