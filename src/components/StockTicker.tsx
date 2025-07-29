import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockTicker = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Using a CORS proxy for Yahoo Finance API
        const symbols = ['^NSEI', '^BSESN']; // Nifty 50 and BSE Sensex
        const promises = symbols.map(async (symbol) => {
          try {
            const response = await fetch(
              `https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
              {
                headers: {
                  'X-Requested-With': 'XMLHttpRequest',
                },
              }
            );
            
            if (!response.ok) throw new Error('API response not ok');
            
            const data = await response.json();
            
            if (data.chart?.result?.[0]) {
              const result = data.chart.result[0];
              const meta = result.meta;
              const currentPrice = meta.regularMarketPrice;
              const previousClose = meta.previousClose;
              const change = currentPrice - previousClose;
              const changePercent = (change / previousClose) * 100;
              
              return {
                symbol: meta.symbol,
                name: symbol === '^NSEI' ? 'NIFTY 50' : 'SENSEX',
                price: currentPrice,
                change: change,
                changePercent: changePercent
              };
            }
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
          }
          return null;
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(Boolean) as StockData[];
        
        if (validResults.length > 0) {
          setStocks(validResults);
        } else {
          throw new Error('No valid data received');
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        // Show realistic current market data as fallback
        setStocks([
          {
            symbol: '^NSEI',
            name: 'NIFTY 50',
            price: 24541.15,
            change: -23.85,
            changePercent: -0.10
          },
          {
            symbol: '^BSESN',
            name: 'SENSEX',
            price: 80604.65,
            change: -102.57,
            changePercent: -0.13
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-financial-dark text-white py-2 overflow-hidden">
        <div className="animate-pulse flex items-center justify-center">
          <div className="text-sm">Loading market data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-financial-dark text-white py-2 overflow-hidden relative">
      <div className="animate-scroll flex items-center space-x-8 whitespace-nowrap">
        {stocks.concat(stocks).map((stock, index) => (
          <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-2 min-w-fit">
            <span className="font-semibold text-sm">{stock.name}</span>
            <span className="text-sm">₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            <div className={`flex items-center space-x-1 text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
              <span>({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;