import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface WatchlistItem {
  id: string;
  stock_symbol: string;
  stock_name: string;
  added_at: string;
}

export const useWatchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async (symbol: string, name: string) => {
    if (!user) {
      return { error: new Error('Please sign in to add to watchlist') };
    }

    try {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          stock_symbol: symbol,
          stock_name: name,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info(`${symbol} is already in your watchlist`);
          return { error: null };
        }
        throw error;
      }

      toast.success(`${symbol} added to watchlist`);
      await fetchWatchlist();
      return { error: null };
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
      return { error: error as Error };
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('stock_symbol', symbol);

      if (error) throw error;

      toast.success(`${symbol} removed from watchlist`);
      await fetchWatchlist();
      return { error: null };
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
      return { error: error as Error };
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.stock_symbol === symbol);
  };

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refreshWatchlist: fetchWatchlist,
  };
};
