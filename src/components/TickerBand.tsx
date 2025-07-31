import { useState, useEffect, useRef } from 'react';
import yahooFinance from 'yahoo-finance2';

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
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        // Popular US stocks
        const symbols = [
          'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V',
          'PG', 'UNH', 'HD', 'MA', 'BAC', 'ABBV', 'PFE', 'KO', 'AVGO', 'XOM',
          'WMT', 'LLY', 'TMO', 'COST', 'DIS', 'ABT', 'ACN', 'VZ', 'ADBE', 'DHR',
          'NKE', 'TXN', 'CMCSA', 'CVX', 'NEE', 'QCOM', 'PM', 'SPGI', 'HON', 'UPS',
          'LOW', 'IBM', 'AMGN', 'RTX', 'ELV', 'SBUX', 'GILD', 'CAT', 'AMT', 'BKNG'
        ];

        // Fetch data from Yahoo Finance
        const tickerPromises = symbols.map(async (symbol) => {
          try {
            const quote = await yahooFinance.quote(symbol);
            
            if (quote && quote.regularMarketPrice) {
              return {
                symbol: symbol,
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange || 0,
                changePercent: quote.regularMarketChangePercent || 0,
              };
            } else {
              console.warn(`No data received for ${symbol}`);
              return null;
            }
          } catch (err) {
            console.error(`Error fetching data for ${symbol}:`, err);
            return null;
          }
        });

        const results = await Promise.all(tickerPromises);
        const validResults = results.filter((result): result is TickerData => result !== null);
        
        if (validResults.length > 0) {
          setTickerData(validResults);
        } else {
          setError('No market data available');
        }
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
        ref={tickerRef}
        className="flex whitespace-nowrap"
        style={{
          animation: 'continuous-scroll 200s linear infinite',
          willChange: 'transform'
        }}
      >
        {/* All 50 stocks repeated 3 times for seamless loop */}
        {[1, 2, 3].map(setNum => 
          tickerData.map((ticker, index) => (
            <div key={`set${setNum}-${ticker.symbol}-${index}`} className="flex items-center mr-8 flex-shrink-0">
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
