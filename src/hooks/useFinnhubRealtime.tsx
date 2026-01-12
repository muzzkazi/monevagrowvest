import { useState, useEffect, useRef, useCallback } from 'react';

interface TradeData {
  s: string;  // symbol
  p: number;  // price
  v: number;  // volume
  t: number;  // timestamp
}

interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

interface UseFinnhubRealtimeResult {
  prices: Record<string, PriceUpdate>;
  isConnected: boolean;
  error: string | null;
}

export const useFinnhubRealtime = (
  symbols: string[],
  initialPrices?: Record<string, { price: number; previousClose: number }>
): UseFinnhubRealtimeResult => {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousCloseRef = useRef<Record<string, number>>({});

  // Store initial previous close values
  useEffect(() => {
    if (initialPrices) {
      Object.entries(initialPrices).forEach(([symbol, data]) => {
        previousCloseRef.current[symbol] = data.previousClose;
        // Initialize prices with initial data
        setPrices(prev => ({
          ...prev,
          [symbol]: {
            symbol,
            price: data.price,
            change: data.price - data.previousClose,
            changePercent: ((data.price - data.previousClose) / data.previousClose) * 100,
            lastUpdated: new Date()
          }
        }));
      });
    }
  }, [initialPrices]);

  const connect = useCallback(() => {
    if (symbols.length === 0) return;

    try {
      // Connect to our edge function relay
      const wsUrl = `wss://gwbsqeamidtxcaxeboqx.supabase.co/functions/v1/finnhub-realtime`;
      console.log('Connecting to Finnhub relay:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to Finnhub relay');
        setIsConnected(true);
        setError(null);

        // Subscribe to symbols (Finnhub uses US symbols, we need to map NSE symbols)
        // For Indian stocks, we'll use NSE: prefix
        const finnhubSymbols = symbols.map(s => {
          if (s.startsWith('^')) {
            // Index symbols - not supported in real-time
            return null;
          }
          return `NSE:${s}`;
        }).filter(Boolean);

        if (finnhubSymbols.length > 0) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            symbols: finnhubSymbols
          }));
          console.log('Subscribed to:', finnhubSymbols);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'trade' && data.data) {
            const trades: TradeData[] = data.data;
            
            setPrices(prev => {
              const updated = { ...prev };
              
              trades.forEach(trade => {
                // Convert NSE:SYMBOL back to SYMBOL
                const symbol = trade.s.replace('NSE:', '');
                const previousClose = previousCloseRef.current[symbol] || trade.p;
                const change = trade.p - previousClose;
                const changePercent = (change / previousClose) * 100;

                updated[symbol] = {
                  symbol,
                  price: trade.p,
                  change,
                  changePercent,
                  lastUpdated: new Date(trade.t)
                };
              });

              return updated;
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to connect');
    }
  }, [symbols]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    prices,
    isConnected,
    error
  };
};
