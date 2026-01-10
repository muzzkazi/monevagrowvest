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

// Default indices with fallback values
const defaultIndices: IndexData[] = [
  { name: "NIFTY 50", symbol: "^NSEI", value: "24,837.00", change: "-225.10", changePercent: "-0.90%" },
  { name: "SENSEX", symbol: "^BSESN", value: "81,463.09", change: "-721.08", changePercent: "-0.88%" },
  { name: "NIFTY BANK", symbol: "^NSEBANK", value: "56,528.90", change: "-534.20", changePercent: "-0.94%" },
  { name: "NIFTY IT", symbol: "^CNXIT", value: "44,256.85", change: "-187.45", changePercent: "-0.42%" },
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
      // Fetch index data using common ETFs/proxies
      const indexSymbols = ["NIFTYBEES", "BANKBEES", "ITBEES"];
      const { data, error } = await supabase.functions.invoke('stock-prices', {
        body: { symbols: indexSymbols }
      });

      if (error || !data?.quotes) return;

      // Map ETF data to approximate index values
      const updatedIndices = [...defaultIndices];
      data.quotes.forEach((quote: StockQuote) => {
        if (quote.symbol === "NIFTYBEES") {
          // NIFTYBEES tracks NIFTY 50 at ~1/100th value
          updatedIndices[0] = {
            ...updatedIndices[0],
            value: formatPrice(quote.price * 100),
            change: formatChange(quote.change * 100),
            changePercent: formatPercent(quote.changePercent)
          };
        }
        if (quote.symbol === "BANKBEES") {
          updatedIndices[2] = {
            ...updatedIndices[2],
            value: formatPrice(quote.price * 100),
            change: formatChange(quote.change * 100),
            changePercent: formatPercent(quote.changePercent)
          };
        }
        if (quote.symbol === "ITBEES") {
          updatedIndices[3] = {
            ...updatedIndices[3],
            value: formatPrice(quote.price * 100),
            change: formatChange(quote.change * 100),
            changePercent: formatPercent(quote.changePercent)
          };
        }
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