import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  lastUpdated: string;
}

interface UseStockPricesResult {
  prices: Record<string, StockQuote>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshPrices: () => Promise<void>;
}

export const useStockPrices = (symbols: string[]): UseStockPricesResult => {
  const [prices, setPrices] = useState<Record<string, StockQuote>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching stock prices for:', symbols);

      const { data, error: fnError } = await supabase.functions.invoke('stock-prices', {
        body: { symbols }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message);
      }

      if (data?.quotes) {
        const priceMap: Record<string, StockQuote> = {};
        data.quotes.forEach((quote: StockQuote) => {
          priceMap[quote.symbol] = quote;
        });
        setPrices(priceMap);
        setLastUpdated(new Date(data.timestamp));
        console.log('Prices updated:', priceMap);
      }
    } catch (err) {
      console.error('Error fetching stock prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchPrices();

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  return {
    prices,
    isLoading,
    error,
    lastUpdated,
    refreshPrices: fetchPrices
  };
};
