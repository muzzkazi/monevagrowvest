import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const symbolsKey = symbols.join(',');

  const fetchPrices = useCallback(async (signal?: AbortSignal) => {
    if (symbols.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Fetching stock prices for:', symbols.length, 'symbols');

      const { data, error: fnError } = await supabase.functions.invoke('stock-prices', {
        body: { symbols }
      });

      // Check if request was aborted
      if (signal?.aborted) {
        return;
      }

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message);
      }

      if (data?.quotes) {
        const priceMap: Record<string, StockQuote> = {};
        data.quotes.forEach((quote: StockQuote) => {
          priceMap[quote.symbol] = quote;
        });
        setPrices(prev => ({ ...prev, ...priceMap }));
        setLastUpdated(new Date(data.timestamp));
        setError(null); // Clear error on success
        console.log('Prices updated:', Object.keys(priceMap).length, 'quotes');
      }
    } catch (err) {
      // Don't set error for abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Don't set error for fetch errors during unmount
      if (signal?.aborted) {
        return;
      }
      console.error('Error fetching stock prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [symbolsKey]); // Use stable key instead of array

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Debounce the fetch to avoid rapid calls
    const timeoutId = setTimeout(() => {
      fetchPrices(abortController.signal);
    }, 100);

    // Set up interval for periodic refresh (every 30 seconds)
    const interval = setInterval(() => {
      if (!abortController.signal.aborted) {
        fetchPrices(abortController.signal);
      }
    }, 30000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
      abortController.abort();
    };
  }, [fetchPrices]);

  const refreshPrices = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    await fetchPrices(abortController.signal);
  }, [fetchPrices]);

  return {
    prices,
    isLoading,
    error,
    lastUpdated,
    refreshPrices
  };
};
