import { useState, useEffect } from 'react';
import { NseIndia } from 'stock-nse-india';

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const TickerBand = () => {
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const nseIndia = new NseIndia();
        
        // Fetch data for top 50 NSE stocks
        const symbols = [
          'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK', 'LT', 'SBIN', 'BHARTIARTL',
          'ASIANPAINT', 'ITC', 'AXISBANK', 'BAJFINANCE', 'MARUTI', 'NESTLEIND', 'HCLTECH', 'WIPRO', 'ULTRACEMCO', 'TITAN',
          'SUNPHARMA', 'ONGC', 'NTPC', 'POWERGRID', 'BAJAJFINSV', 'M&M', 'TECHM', 'TATAMOTORS', 'COALINDIA', 'JSWSTEEL',
          'GRASIM', 'INDUSINDBK', 'ADANIENT', 'HINDALCO', 'TATASTEEL', 'CIPLA', 'DRREDDY', 'BRITANNIA', 'BPCL', 'EICHERMOT',
          'APOLLOHOSP', 'DIVISLAB', 'TATACONSUM', 'BAJAJ-AUTO', 'HEROMOTOCO', 'PIDILITIND', 'GODREJCP', 'SBILIFE', 'HDFCLIFE', 'ADANIPORTS'
        ];
        const tickerPromises = symbols.map(async (symbol) => {
          try {
            const data = await nseIndia.getEquityDetails(symbol);
            return {
              symbol: symbol,
              price: data.priceInfo?.lastPrice || 0,
              change: data.priceInfo?.change || 0,
              changePercent: data.priceInfo?.pChange || 0,
            };
          } catch (err) {
            console.error(`Error fetching data for ${symbol}:`, err);
            return null;
          }
        });

        const results = await Promise.all(tickerPromises);
        const validResults = results.filter((result): result is TickerData => result !== null);
        
        setTickerData(validResults);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ticker data:', err);
        setError('Failed to load market data');
        setLoading(false);
      }
    };

    fetchTickerData();
    
    // Update data every 30 seconds
    const interval = setInterval(fetchTickerData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-financial-dark text-white py-3 overflow-hidden relative w-full z-10" style={{ minHeight: '40px' }}>
        <div className="flex items-center justify-center px-4">
          <span className="text-sm opacity-80">Loading market data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-financial-dark text-white py-3 overflow-hidden relative w-full z-10" style={{ minHeight: '40px' }}>
        <div className="flex items-center justify-center px-4">
          <span className="text-sm opacity-80">Market Updates - {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-financial-dark text-white py-3 overflow-hidden relative w-full z-10" style={{ minHeight: '40px' }}>
      <div 
        className="flex whitespace-nowrap"
        style={{
          animation: 'marquee 240s linear infinite',
          width: 'max-content'
        }}
      >
        {/* Repeat ticker data 8 times to ensure no gaps */}
        {Array.from({ length: 8 }, (_, repeatIndex) =>
          tickerData.map((ticker, index) => (
            <div key={`${repeatIndex}-${ticker.symbol}-${index}`} className="flex items-center mr-8 flex-shrink-0">
              <span className="text-sm font-medium">{ticker.symbol}</span>
              <span className="text-sm ml-2">₹{ticker.price.toFixed(2)}</span>
              <span 
                className={`text-sm ml-2 ${
                  ticker.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)} 
                ({ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%)
              </span>
              <span className="text-sm opacity-50 ml-4">•</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TickerBand;
