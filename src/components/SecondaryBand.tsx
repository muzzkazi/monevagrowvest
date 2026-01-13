import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
}

interface IndexData {
  name: string;
  symbol: string;
  value: string;
  change: string;
  changePercent: string;
  rawChange: number;
}

interface StockData {
  symbol: string;
  price: string;
  change: string;
  percent: string;
  rawChangePercent: number;
  isUpdating?: boolean;
}

interface TradeData {
  s: string;
  p: number;
  v: number;
  t: number;
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
  { name: "NIFTY 50", symbol: "^NSEI", value: "---", change: "---", changePercent: "---", rawChange: 0 },
  { name: "SENSEX", symbol: "^BSESN", value: "---", change: "---", changePercent: "---", rawChange: 0 },
  { name: "NIFTY BANK", symbol: "^NSEBANK", value: "---", change: "---", changePercent: "---", rawChange: 0 },
  { name: "NIFTY IT", symbol: "^CNXIT", value: "---", change: "---", changePercent: "---", rawChange: 0 },
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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const previousPricesRef = useRef<Record<string, number>>({});
  const previousCloseRef = useRef<Record<string, number>>({});

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

  // Fetch stock prices with update detection
  const fetchStockPrices = async (isInitial: boolean = false) => {
    try {
      const { data, error } = await supabase.functions.invoke('stock-prices', {
        body: { symbols: stockSymbols }
      });

      if (error) {
        console.error('Error fetching stock prices:', error);
        return;
      }

      if (data?.quotes) {
        const formattedStocks: StockData[] = data.quotes.map((quote: StockQuote) => {
          // Store previous close for calculations
          previousCloseRef.current[quote.symbol] = quote.previousClose || quote.price;
          
          // Check if price changed
          const prevPrice = previousPricesRef.current[quote.symbol];
          const hasChanged = prevPrice !== undefined && prevPrice !== quote.price;
          
          // Update price tracking
          previousPricesRef.current[quote.symbol] = quote.price;
          
          return {
            symbol: quote.symbol,
            price: formatPrice(quote.price),
            change: formatChange(quote.change),
            percent: formatPercent(quote.changePercent),
            rawChangePercent: quote.changePercent,
            isUpdating: hasChanged && !isInitial
          };
        });
        
        setStocks(formattedStocks);
        setLastUpdate(new Date());
        
        // Clear updating flags after animation
        if (!isInitial) {
          setTimeout(() => {
            setStocks(current => 
              current.map(s => ({ ...s, isUpdating: false }))
            );
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error fetching stock prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIndices = async () => {
    try {
      const symbols = indexSymbols.map(i => i.symbol);
      const { data, error } = await supabase.functions.invoke('stock-prices', {
        body: { symbols }
      });

      if (error || !data?.quotes) {
        console.error('Error fetching indices:', error);
        return;
      }

      const updatedIndices: IndexData[] = indexSymbols.map(idx => {
        const quote = data.quotes.find((q: StockQuote) => q.symbol === idx.symbol);
        if (quote) {
          return {
            name: idx.name,
            symbol: idx.symbol,
            value: formatPrice(quote.price),
            change: formatChange(quote.change),
            changePercent: formatPercent(quote.changePercent),
            rawChange: quote.change
          };
        }
        return defaultIndices.find(d => d.symbol === idx.symbol) || defaultIndices[0];
      });
      
      setIndices(updatedIndices);
    } catch (error) {
      console.error('Error fetching indices:', error);
    }
  };

  // Initial data fetch and fast polling for near real-time updates
  useEffect(() => {
    fetchStockPrices(true);
    fetchIndices();

    // Fast polling every 5 seconds for near real-time updates
    // (Finnhub doesn't support NSE real-time, so we use polling)
    const stocksInterval = setInterval(() => fetchStockPrices(false), 5000);
    const indicesInterval = setInterval(fetchIndices, 10000);

    return () => {
      clearInterval(stocksInterval);
      clearInterval(indicesInterval);
    };
  }, []);

  const displayStocks = stocks.length > 0 ? stocks : stockSymbols.map(symbol => ({
    symbol,
    price: "---",
    change: "---",
    percent: "---",
    rawChangePercent: 0,
    isUpdating: false
  }));

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 backdrop-blur-md text-white py-1.5 w-full z-20 overflow-hidden flex flex-col justify-center relative border-y border-blue-500/20 shadow-lg shadow-blue-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-400/30">
      {/* Update status indicator */}
      <div className="absolute top-1 right-2 flex items-center gap-1.5 z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] text-white/50">LIVE</span>
        {lastUpdate && (
          <span className="text-[10px] text-white/30 hidden sm:inline">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* First line - Indices */}
      <div className="relative mb-1 overflow-hidden">
        <div className="inline-flex w-max animate-scroll-indices will-change-transform hover:[animation-play-state:paused]">
          {[...indices, ...indices].map((item, index) => {
            const isPositive = !item.change.startsWith('-');
            return (
              <div key={`index-${index}`} className="flex items-center whitespace-nowrap flex-shrink-0">
                <div className="flex items-center gap-2 px-6">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-base font-bold">{item.value}</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
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

      {/* Second line - NIFTY 50 Stocks with real-time updates */}
      <div className="relative overflow-hidden">
        <div className="inline-flex w-max animate-scroll-stocks will-change-transform hover:[animation-play-state:paused]">
          {[...displayStocks, ...displayStocks].map((stock, index) => {
            const isPositive = !stock.change.startsWith('-');
            const isLoaded = stock.price !== "---";
            return (
              <div key={`stock-${index}`} className="flex items-center whitespace-nowrap flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 transition-all duration-300 ${stock.isUpdating ? 'scale-105' : ''}`}>
                  <span className="font-medium text-xs text-white/90">{stock.symbol}</span>
                  <span className={`text-sm font-semibold transition-all duration-300 ${
                    !isLoaded ? 'animate-pulse' : ''
                  } ${stock.isUpdating ? (isPositive ? 'text-emerald-200' : 'text-rose-200') : ''}`}>
                    {isLoaded ? `₹${stock.price}` : stock.price}
                  </span>
                  {isLoaded && (
                    <>
                      <span className={`text-xs font-medium transition-all duration-300 ${
                        isPositive ? 'text-emerald-300' : 'text-rose-300'
                      } ${stock.isUpdating ? 'font-bold' : ''}`}>
                        {stock.change}
                      </span>
                      <span className={`text-xs font-medium transition-all duration-300 ${
                        isPositive ? 'text-emerald-300' : 'text-rose-300'
                      } ${stock.isUpdating ? 'font-bold' : ''}`}>
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
    </div>
  );
};

export default SecondaryBand;
