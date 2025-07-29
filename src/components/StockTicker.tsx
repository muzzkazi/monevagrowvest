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
        // Yahoo Finance API endpoints for Indian indices
        const symbols = ['^NSEI', '^BSESN']; // Nifty 50 and BSE Sensex
        const promises = symbols.map(async (symbol) => {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
          );
          const data = await response.json();
          
          if (data.chart?.result?.[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            const quote = result.indicators.quote[0];
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
          return null;
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(Boolean) as StockData[];
        setStocks(validResults);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        // Fallback data
        setStocks([
          {
            symbol: '^NSEI',
            name: 'NIFTY 50',
            price: 24500.00,
            change: 125.50,
            changePercent: 0.51
          },
          {
            symbol: '^BSESN',
            name: 'SENSEX',
            price: 80800.00,
            change: 245.75,
            changePercent: 0.30
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 30000); // Update every 30 seconds

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