import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface MarketInsight {
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

// Map Finnhub categories to display categories
const categoryMapping: Record<string, string> = {
  'general': 'Market Analysis',
  'forex': 'Forex & Currency',
  'crypto': 'Cryptocurrency',
  'merger': 'M&A News',
  'company news': 'Company Updates',
};

// Estimate read time based on summary length
const estimateReadTime = (summary: string): string => {
  const words = summary.split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 200));
  return `${minutes} min read`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    
    if (!FINNHUB_API_KEY) {
      console.error('FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'News service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body for optional parameters
    let category = 'general';
    let limit = 6;
    
    try {
      const body = await req.json();
      if (body.category) category = body.category;
      if (body.limit && typeof body.limit === 'number') limit = Math.min(body.limit, 20);
    } catch {
      // Use defaults if no body or invalid JSON
    }

    console.log(`Fetching ${limit} news articles for category: ${category}`);

    // Fetch market news from Finnhub
    const newsUrl = `https://finnhub.io/api/v1/news?category=${encodeURIComponent(category)}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(newsUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Finnhub API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch news from provider' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newsData: FinnhubNews[] = await response.json();
    
    if (!Array.isArray(newsData)) {
      console.error('Invalid response from Finnhub:', newsData);
      return new Response(
        JSON.stringify({ error: 'Invalid news data received' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Received ${newsData.length} articles from Finnhub`);

    // Transform and filter news articles
    const insights: MarketInsight[] = newsData
      .slice(0, limit)
      .map((article, index) => ({
        category: categoryMapping[article.category?.toLowerCase()] || 'Market News',
        title: article.headline,
        excerpt: article.summary?.slice(0, 200) + (article.summary?.length > 200 ? '...' : '') || '',
        image: article.image || `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop`,
        readTime: estimateReadTime(article.summary || ''),
        trending: index < 3, // First 3 articles are marked as trending
        source: article.source || 'Financial News',
        publishedAt: new Date(article.datetime * 1000).toISOString(),
        url: article.url,
      }));

    // Also fetch market indices data for Sensex/Nifty simulation
    // Note: Finnhub free tier doesn't have Indian indices, so we return null
    const marketData = null;

    console.log(`Returning ${insights.length} processed articles`);

    return new Response(
      JSON.stringify({ 
        insights, 
        marketData,
        fetchedAt: new Date().toISOString(),
        source: 'finnhub'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        } 
      }
    );
  } catch (error) {
    console.error('Error in market-news function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
