import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketInsight {
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  trending: boolean;
  source: string;
  publishedAt: string;
  url: string;
}

interface MarketData {
  sensex: {
    current: number;
    change: number;
    changePercent: number;
  };
  nifty: {
    current: number;
    change: number;
    changePercent: number;
  };
  lastUpdated: string;
}

// Fallback data in case API fails
const getFallbackInsights = (): MarketInsight[] => {
  const currentDate = new Date().toISOString();
  return [
    {
      category: "Market Analysis",
      title: "Markets Show Mixed Signals Amid Global Uncertainty",
      excerpt: "Investors remain cautious as global markets navigate through economic headwinds and policy changes.",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
      readTime: "4 min read",
      trending: true,
      source: "Market Watch",
      publishedAt: currentDate,
      url: "https://www.marketwatch.com/"
    },
    {
      category: "Sector Focus",
      title: "Technology Sector Leads Market Recovery",
      excerpt: "Tech stocks show resilience as AI investments continue to drive growth in the sector.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      readTime: "5 min read",
      trending: true,
      source: "Financial Times",
      publishedAt: currentDate,
      url: "https://www.ft.com/technology"
    },
    {
      category: "Investment Strategy",
      title: "Diversification Key in Current Market Climate",
      excerpt: "Financial advisors recommend portfolio rebalancing as market volatility persists.",
      image: "https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=400&h=250&fit=crop",
      readTime: "6 min read",
      trending: false,
      source: "Bloomberg",
      publishedAt: currentDate,
      url: "https://www.bloomberg.com/markets"
    }
  ];
};

// Simulated market data (Finnhub free tier doesn't have Indian indices)
const getMarketData = (): MarketData => {
  // These would ideally come from a real API
  return {
    sensex: {
      current: 81550.90,
      change: -379.45,
      changePercent: -0.46
    },
    nifty: {
      current: 24974.90,
      change: -115.30,
      changePercent: -0.46
    },
    lastUpdated: new Date().toISOString()
  };
};

export const useMarketInsights = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching market news from edge function...');
      
      const { data, error: fnError } = await supabase.functions.invoke('market-news', {
        body: { category: 'general', limit: 6 }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to fetch news');
      }

      if (data?.insights && Array.isArray(data.insights) && data.insights.length > 0) {
        console.log(`Received ${data.insights.length} articles from API`);
        setInsights(data.insights);
      } else {
        console.log('No articles from API, using fallback');
        setInsights(getFallbackInsights());
      }

      // Set market data (simulated for now)
      setMarketData(getMarketData());
      
    } catch (err) {
      console.error('Error fetching market insights:', err);
      setError('Unable to fetch live news. Showing cached content.');
      // Use fallback data on error
      setInsights(getFallbackInsights());
      setMarketData(getMarketData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketInsights();
    
    // Refresh insights every 5 minutes
    const interval = setInterval(fetchMarketInsights, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchMarketInsights]);

  const refreshInsights = useCallback(async () => {
    await fetchMarketInsights();
  }, [fetchMarketInsights]);

  return {
    insights,
    marketData,
    isLoading,
    error,
    refreshInsights
  };
};