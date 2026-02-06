import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Indian financial news RSS feeds (tested and working)
const RSS_FEEDS = [
  {
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    source: 'Economic Times',
    category: 'Market Analysis'
  },
  {
    url: 'https://www.business-standard.com/rss/markets-106.rss',
    source: 'Business Standard',
    category: 'Market News'
  },
  {
    url: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms',
    source: 'ET Stocks',
    category: 'Stock Updates'
  },
  {
    url: 'https://www.business-standard.com/rss/finance-111.rss',
    source: 'BS Finance',
    category: 'Finance'
  }
];

// Clean CDATA and HTML from text
function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Safe date parsing
function parseDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// Parse RSS XML to extract articles
function parseRSSItem(item: string, source: string, category: string): MarketInsight | null {
  try {
    const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/);
    const descMatch = item.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    
    // Try multiple image patterns
    const imgPatterns = [
      /<media:content[^>]*url="([^"]+)"/,
      /<enclosure[^>]*url="([^"]+)"/,
      /msid-(\d+),imgsize/,
      /<img[^>]*src="([^"]+)"/
    ];
    
    let image = '';
    for (const pattern of imgPatterns) {
      const match = item.match(pattern);
      if (match?.[1]) {
        if (pattern.source.includes('msid')) {
          image = `https://img.etimg.com/photo/msid-${match[1]}.cms`;
        } else {
          image = match[1];
        }
        break;
      }
    }

    const title = cleanText(titleMatch?.[1] || '');
    const link = cleanText(linkMatch?.[1] || '');
    const description = cleanText(descMatch?.[1] || '');
    const pubDate = parseDate(pubDateMatch?.[1] || '');

    if (!title || !link) return null;
    
    // Estimate read time
    const words = description.split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(words / 200));

    return {
      category,
      title,
      excerpt: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
      image: image || `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop`,
      readTime: `${minutes} min read`,
      trending: false,
      source,
      publishedAt: pubDate,
      url: link
    };
  } catch (e) {
    console.error('Error parsing RSS item:', e);
    return null;
  }
}

// Fetch and parse RSS feed
async function fetchRSSFeed(feedConfig: typeof RSS_FEEDS[0]): Promise<MarketInsight[]> {
  try {
    console.log(`Fetching RSS from ${feedConfig.source}...`);
    
    const response = await fetch(feedConfig.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${feedConfig.source}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    
    // Extract items from RSS
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    const articles: MarketInsight[] = [];
    for (const itemXml of itemMatches.slice(0, 5)) {
      const article = parseRSSItem(itemXml, feedConfig.source, feedConfig.category);
      if (article) {
        articles.push(article);
      }
    }

    console.log(`Got ${articles.length} articles from ${feedConfig.source}`);
    return articles;
  } catch (error) {
    console.error(`Error fetching ${feedConfig.source}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let limit = 6;
    
    try {
      const body = await req.json();
      if (body.limit && typeof body.limit === 'number') limit = Math.min(body.limit, 20);
    } catch {
      // Use defaults
    }

    console.log(`Fetching Indian market news, limit: ${limit}`);

    const feedPromises = RSS_FEEDS.map(feed => fetchRSSFeed(feed));
    const feedResults = await Promise.all(feedPromises);
    
    let allArticles: MarketInsight[] = feedResults.flat();
    
    // Sort by published date (newest first)
    allArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Mark first 3 as trending
    allArticles = allArticles.slice(0, limit).map((article, index) => ({
      ...article,
      trending: index < 3
    }));

    console.log(`Returning ${allArticles.length} Indian market articles`);

    return new Response(
      JSON.stringify({ 
        insights: allArticles, 
        marketData: null,
        fetchedAt: new Date().toISOString(),
        source: 'indian-rss'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
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
