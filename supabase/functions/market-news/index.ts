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

// Indian financial news RSS feeds
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
  },
  {
    url: 'https://www.livemint.com/rss/money',
    source: 'Mint',
    category: 'Money & Markets'
  },
  {
    url: 'https://www.livemint.com/rss/companies',
    source: 'Mint Companies',
    category: 'Corporate News'
  },
  {
    url: 'https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms',
    source: 'ET Industry',
    category: 'Industry News'
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

// Extract image from RSS item with multiple fallback strategies
function extractImage(item: string, description: string): string {
  // Strategy 1: media:content or media:thumbnail (common RSS media namespace)
  const mediaMatch = item.match(/<media:(?:content|thumbnail)[^>]*url="([^"]+)"/i);
  if (mediaMatch?.[1]) {
    console.log('Found media:content image');
    return mediaMatch[1];
  }

  // Strategy 2: enclosure tag (podcasts/media RSS)
  const enclosureMatch = item.match(/<enclosure[^>]*url="([^"]+)"/i);
  if (enclosureMatch?.[1] && enclosureMatch[1].match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    console.log('Found enclosure image');
    return enclosureMatch[1];
  }

  // Strategy 3: ET-specific - extract msid from img tag in description
  const etImgMatch = item.match(/img\.etimg\.com\/[^"]*msid-(\d+)/);
  if (etImgMatch?.[1]) {
    console.log('Found ET msid image');
    return `https://img.etimg.com/thumb/msid-${etImgMatch[1]},width-400,height-250,resizemode-4/.jpg`;
  }

  // Strategy 4: NDTV Profit image pattern
  const ndtvMatch = item.match(/https?:\/\/[^"'\s]*ndtv[^"'\s]*\.(jpg|jpeg|png|webp)/i);
  if (ndtvMatch) {
    console.log('Found NDTV image');
    return ndtvMatch[0];
  }

  // Strategy 5: Mint/LiveMint image pattern
  const mintMatch = item.match(/https?:\/\/[^"'\s]*livemint[^"'\s]*\.(jpg|jpeg|png|webp)/i);
  if (mintMatch) {
    console.log('Found Mint image');
    return mintMatch[0];
  }

  // Strategy 6: Moneycontrol image pattern
  const mcMatch = item.match(/https?:\/\/[^"'\s]*moneycontrol[^"'\s]*\.(jpg|jpeg|png|webp)/i);
  if (mcMatch) {
    console.log('Found Moneycontrol image');
    return mcMatch[0];
  }

  // Strategy 7: Any img tag with src in the item or description
  const imgMatch = item.match(/<img[^>]*src=["']([^"']+)["']/i) || 
                   description.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgMatch?.[1] && !imgMatch[1].includes('pixel') && !imgMatch[1].includes('tracking') && !imgMatch[1].includes('icon')) {
    console.log('Found img src');
    return imgMatch[1];
  }

  // Strategy 8: Business Standard specific pattern
  const bsMatch = item.match(/bsmedia\.business-standard\.com[^"'\s]+/);
  if (bsMatch) {
    console.log('Found BS image');
    return `https://${bsMatch[0]}`;
  }

  // Strategy 9: Extract article ID from URL and construct ET image URL
  const articleIdMatch = item.match(/articleshow\/(\d+)\.cms/);
  if (articleIdMatch?.[1]) {
    console.log('Constructed ET image from article ID');
    return `https://img.etimg.com/thumb/msid-${articleIdMatch[1]},width-400,height-250,resizemode-4/.jpg`;
  }

  return '';
}

// Parse RSS XML to extract articles
function parseRSSItem(item: string, source: string, category: string): MarketInsight | null {
  try {
    const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/);
    const descMatch = item.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    
    const rawDescription = descMatch?.[1] || '';
    const image = extractImage(item, rawDescription);

    const title = cleanText(titleMatch?.[1] || '');
    const link = cleanText(linkMatch?.[1] || '');
    const description = cleanText(rawDescription);
    const pubDate = parseDate(pubDateMatch?.[1] || '');

    if (!title || !link) return null;
    
    // Estimate read time
    const words = description.split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(words / 200));

    // Use category-specific fallback images if no image found
    const fallbackImages: Record<string, string> = {
      'Market Analysis': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
      'Market News': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop',
      'Stock Updates': 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=250&fit=crop',
      'Finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
      'Money & Markets': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop',
      'Corporate News': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop',
      'Industry News': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=250&fit=crop'
    };

    return {
      category,
      title,
      excerpt: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
      image: image || fallbackImages[category] || fallbackImages['Market Analysis'],
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
    
    // Group articles by source
    const articlesBySource: Map<string, MarketInsight[]> = new Map();
    
    feedResults.forEach(articles => {
      articles.forEach(article => {
        const existing = articlesBySource.get(article.source) || [];
        existing.push(article);
        articlesBySource.set(article.source, existing);
      });
    });

    // Sort articles within each source by date (newest first)
    articlesBySource.forEach((articles, source) => {
      articles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });

    // Helper to check if article has real image
    const hasRealImage = (img: string) => !img.includes('unsplash.com');

    // STEP 1: Get the LATEST article with an image from EACH source
    const diverseArticles: MarketInsight[] = [];
    const usedSources = new Set<string>();

    // First pass: get one article (preferably with image) from each source
    for (const [source, articles] of articlesBySource) {
      // Prefer article with real image, otherwise take the first one
      const articleWithImage = articles.find(a => hasRealImage(a.image));
      const selectedArticle = articleWithImage || articles[0];
      
      if (selectedArticle) {
        diverseArticles.push({ ...selectedArticle, trending: true });
        usedSources.add(source);
      }
    }

    console.log(`Selected ${diverseArticles.length} articles from different sources`);

    // STEP 2: If we need more articles, add second-best from each source
    if (diverseArticles.length < limit) {
      for (const [source, articles] of articlesBySource) {
        if (diverseArticles.length >= limit) break;
        
        // Get second article from this source if available
        const remainingArticles = articles.filter((_, idx) => idx > 0);
        for (const article of remainingArticles) {
          if (diverseArticles.length >= limit) break;
          // Avoid duplicates by checking URL
          if (!diverseArticles.some(a => a.url === article.url)) {
            diverseArticles.push({ ...article, trending: false });
          }
        }
      }
    }

    // Sort final list: first by source diversity, then by date
    const finalArticles = diverseArticles
      .slice(0, limit)
      .sort((a, b) => {
        // Trending (one per source) comes first
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        // Then by date
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

    console.log(`Returning ${finalArticles.length} diverse Indian market articles from ${usedSources.size} sources`);

    return new Response(
      JSON.stringify({ 
        insights: finalArticles, 
        marketData: null,
        fetchedAt: new Date().toISOString(),
        source: 'indian-rss',
        sourcesCount: usedSources.size
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
