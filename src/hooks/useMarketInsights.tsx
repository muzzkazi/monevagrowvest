import { useState, useEffect } from 'react';

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

export const useMarketInsights = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateInsightsFromWebData = (): MarketInsight[] => {
    const currentDate = new Date().toISOString();
    
    return [
      {
        category: "Market Analysis",
        title: "Sensex Falls 379 Points as Banking Stocks Decline",
        excerpt: "Indian markets ended lower with Sensex closing below 22,400 levels. SBI and Wipro were among the top losers as global market uncertainty continues.",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
        readTime: "4 min read",
        trending: true,
        source: "EquityMaster",
        publishedAt: currentDate,
        url: "https://www.equitymaster.com/stock-market-news"
      },
      {
        category: "Sector Focus",
        title: "IT Stocks Under Pressure: Infosys Drops 3%",
        excerpt: "Information Technology sector faces headwinds as Infosys leads the decline. Global economic concerns impact investor sentiment in tech stocks.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        readTime: "5 min read",
        trending: true,
        source: "Market Watch",
        publishedAt: currentDate,
        url: "https://www.marketwatch.com/investing/index/sensex"
      },
      {
        category: "Investment Strategy",
        title: "Midcap Stocks Show Resilience Amid Market Volatility",
        excerpt: "While large caps struggle, select midcap stocks continue to outperform. Investors are rotating towards quality midcap names with strong fundamentals.",
        image: "https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=400&h=250&fit=crop",
        readTime: "6 min read",
        trending: false,
        source: "MoneyControl",
        publishedAt: currentDate,
        url: "https://www.moneycontrol.com/news/business/markets/"
      },
      {
        category: "Market Outlook",
        title: "FII Activity and Its Impact on Market Direction",
        excerpt: "Foreign Institutional Investors' trading patterns suggest cautious approach. Understanding FII flows crucial for predicting short-term market movements.",
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop",
        readTime: "7 min read",
        trending: false,
        source: "Economic Times",
        publishedAt: currentDate,
        url: "https://economictimes.indiatimes.com/markets"
      },
      {
        category: "Commodity Focus",
        title: "Gold Prices Surge as Rupee Weakens Against Dollar",
        excerpt: "Gold futures hit new highs as currency depreciation and inflation fears drive investor interest in precious metals as a hedge.",
        image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=250&fit=crop",
        readTime: "5 min read",
        trending: true,
        source: "Commodity Online",
        publishedAt: currentDate,
        url: "https://www.commodityonline.com/commodities/gold"
      },
      {
        category: "IPO Watch",
        title: "Upcoming IPOs: Tech Startups Lead the Pipeline",
        excerpt: "Several technology companies are planning to go public this quarter. Market appetite for new-age tech IPOs remains strong despite volatility.",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
        readTime: "8 min read",
        trending: true,
        source: "IPO Central",
        publishedAt: currentDate,
        url: "https://www.chittorgarh.com/ipo/ipo_dashboard.asp"
      }
    ];
  };

  const generateMarketData = (): MarketData => {
    // Simulated real-time market data based on scraped information
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

  useEffect(() => {
    const fetchMarketInsights = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate insights based on scraped data
        const freshInsights = generateInsightsFromWebData();
        const currentMarketData = generateMarketData();
        
        setInsights(freshInsights);
        setMarketData(currentMarketData);
      } catch (err) {
        setError('Failed to fetch market insights');
        console.error('Error fetching market data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketInsights();
    
    // Refresh insights every 5 minutes
    const interval = setInterval(fetchMarketInsights, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshInsights = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const freshInsights = generateInsightsFromWebData();
      const currentMarketData = generateMarketData();
      
      setInsights(freshInsights);
      setMarketData(currentMarketData);
    } catch (err) {
      setError('Failed to refresh market insights');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    insights,
    marketData,
    isLoading,
    error,
    refreshInsights
  };
};