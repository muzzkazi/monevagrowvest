import { useState, useEffect, useRef } from 'react';

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
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const symbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V',
      'PG', 'UNH', 'HD', 'MA', 'BAC', 'ABBV', 'PFE', 'KO', 'AVGO', 'XOM',
      'WMT', 'LLY', 'TMO', 'COST', 'DIS', 'ABT', 'ACN', 'VZ', 'ADBE', 'DHR',
      'NKE', 'TXN', 'CMCSA', 'CVX', 'NEE', 'QCOM', 'PM', 'SPGI', 'HON', 'UPS',
      'LOW', 'IBM', 'AMGN', 'RTX', 'ELV', 'SBUX', 'GILD', 'CAT', 'AMT', 'BKNG'
    ];

    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial ticker data...');
        
        // Using a financial data API that provides better real-time data
        const tickerPromises = symbols.map(async (symbol) => {
          try {
            // Using Finnhub API for real-time data (free tier available)
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=demo`
            );
            const data = await response.json();
            
            console.log(`Data for ${symbol}:`, data);
            
            if (data && data.c) {
              const change = data.c - data.pc;
              const changePercent = (change / data.pc) * 100;
              
              return {
                symbol: symbol,
                price: data.c, // current price
                change: change,
                changePercent: changePercent,
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
        
        console.log('Valid results:', validResults);
        
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

    // WebSocket for real-time updates
    const connectWebSocket = () => {
      try {
        // Using a WebSocket service for real-time updates
        // Note: This is a mock implementation - replace with actual WebSocket endpoint
        const ws = new WebSocket('wss://ws.finnhub.io?token=demo');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          // Subscribe to symbols
          symbols.forEach(symbol => {
            ws.send(JSON.stringify({type: 'subscribe', symbol: symbol}));
          });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket data:', data);
            
            if (data.type === 'trade' && data.data) {
              data.data.forEach((trade: any) => {
                setTickerData(prev => prev.map(ticker => {
                  if (ticker.symbol === trade.s) {
                    const change = trade.p - ticker.price;
                    const changePercent = (change / ticker.price) * 100;
                    return {
                      ...ticker,
                      price: trade.p,
                      change: change,
                      changePercent: changePercent
                    };
                  }
                  return ticker;
                }));
              });
            }
          } catch (err) {
            console.error('Error parsing WebSocket data:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected, attempting to reconnect...');
          setTimeout(connectWebSocket, 5000);
        };
      } catch (err) {
        console.error('Error connecting WebSocket:', err);
        // Fallback to polling
        const interval = setInterval(fetchInitialData, 10000);
        return () => clearInterval(interval);
      }
    };

    fetchInitialData();
    
    // Start WebSocket connection after initial data load
    setTimeout(connectWebSocket, 2000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
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
              <span className="text-sm ml-2">${ticker.price.toFixed(2)}</span>
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
