import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CACHE_ID = "latest";

function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function loadCachedRecos(): Promise<{ recos: BrokerReco[]; fetched_at: string } | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("broker_recos_cache")
      .select("recos, fetched_at")
      .eq("id", CACHE_ID)
      .maybeSingle();
    if (error || !data) return null;
    return { recos: (data.recos as BrokerReco[]) || [], fetched_at: data.fetched_at as string };
  } catch (e) {
    console.error("loadCachedRecos failed:", e);
    return null;
  }
}

async function saveCachedRecos(recos: BrokerReco[]): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("broker_recos_cache")
      .upsert({ id: CACHE_ID, recos, fetched_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    if (error) console.error("saveCachedRecos error:", error);
  } catch (e) {
    console.error("saveCachedRecos failed:", e);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrokerReco {
  stock: string;
  ticker: string;
  recommendation: "Buy" | "Hold" | "Sell" | "Accumulate" | "Reduce" | "Neutral";
  targetPrice: number;
  broker: string;
  date: string;
  rationale: string;
  sourceUrl: string;
}

// RSS feeds that publish brokerage recommendations
// RSS feeds that publish brokerage recommendations.
const RECO_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=%22target+of+Rs%22+%28Buy+OR+Sell+OR+Hold+OR+Accumulate+OR+Reduce+OR+Neutral%29+site%3Amoneycontrol.com&hl=en-IN&gl=IN&ceid=IN:en',
    source: 'Moneycontrol via Google News',
  },
  {
    url: 'https://economictimes.indiatimes.com/markets/stocks/recos/rssfeeds/2146843.cms',
    source: 'Economic Times',
  },
  {
    url: 'https://economictimes.indiatimes.com/markets/stocks/news/rssfeeds/2146842.cms',
    source: 'Economic Times',
  },
];

// Minimal stock-name -> NSE ticker map for live-price linkage.
// Unmapped names still render; they just won't show a live price.
const NAME_TO_TICKER: Record<string, string> = {
  'hdfc bank': 'HDFCBANK',
  'icici bank': 'ICICIBANK',
  'axis bank': 'AXISBANK',
  'kotak mahindra bank': 'KOTAKBANK',
  'state bank of india': 'SBIN',
  'sbi': 'SBIN',
  'bank of baroda': 'BANKBARODA',
  'punjab national bank': 'PNB',
  'reliance industries': 'RELIANCE',
  'reliance': 'RELIANCE',
  'tcs': 'TCS',
  'tata consultancy services': 'TCS',
  'infosys': 'INFY',
  'wipro': 'WIPRO',
  'hcl technologies': 'HCLTECH',
  'tech mahindra': 'TECHM',
  'lti mindtree': 'LTIM',
  'larsen & toubro': 'LT',
  'l&t': 'LT',
  'itc': 'ITC',
  'hindustan unilever': 'HINDUNILVR',
  'nestle india': 'NESTLEIND',
  'britannia': 'BRITANNIA',
  'tata motors': 'TATAMOTORS',
  'maruti suzuki': 'MARUTI',
  'mahindra & mahindra': 'M&M',
  'bajaj auto': 'BAJAJ-AUTO',
  'hero motocorp': 'HEROMOTOCO',
  'eicher motors': 'EICHERMOT',
  'sun pharma': 'SUNPHARMA',
  'cipla': 'CIPLA',
  'dr reddys': 'DRREDDY',
  "dr reddy's": 'DRREDDY',
  'divis labs': 'DIVISLAB',
  "divi's laboratories": 'DIVISLAB',
  'asian paints': 'ASIANPAINT',
  'ultratech cement': 'ULTRACEMCO',
  'grasim': 'GRASIM',
  'jsw steel': 'JSWSTEEL',
  'tata steel': 'TATASTEEL',
  'hindalco': 'HINDALCO',
  'hindalco industries': 'HINDALCO',
  'coal india': 'COALINDIA',
  'ongc': 'ONGC',
  'ntpc': 'NTPC',
  'power grid': 'POWERGRID',
  'adani enterprises': 'ADANIENT',
  'adani ports': 'ADANIPORTS',
  'bharti airtel': 'BHARTIARTL',
  'titan': 'TITAN',
  'titan company': 'TITAN',
  'bajaj finance': 'BAJFINANCE',
  'bajaj finserv': 'BAJAJFINSV',
  'hdfc life': 'HDFCLIFE',
  'sbi life': 'SBILIFE',
  'hdfc amc': 'HDFCAMC',
  'voltas': 'VOLTAS',
  'havells': 'HAVELLS',
  'pidilite': 'PIDILITIND',
  'dlf': 'DLF',
  'godrej properties': 'GODREJPROP',
  'zomato': 'ZOMATO',
  'paytm': 'PAYTM',
  'nykaa': 'NYKAA',
  'irctc': 'IRCTC',
  'indigo': 'INDIGO',
  '3m india': '3MINDIA',
};

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    // Decode entities FIRST so encoded tags (&lt;a&gt;) become real tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#?\w+;/g, ' ')
    // THEN strip all HTML tags (handles Google News' anchor-wrapped descriptions)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function guessTicker(stockName: string): string {
  const key = stockName.toLowerCase().trim();
  if (NAME_TO_TICKER[key]) return NAME_TO_TICKER[key];
  // Try without common suffixes
  const stripped = key.replace(/\b(ltd|limited|industries|company|corporation|corp|inc)\b\.?/g, '').trim();
  if (NAME_TO_TICKER[stripped]) return NAME_TO_TICKER[stripped];
  return '';
}

// Parses titles like:
// "Buy HDFC Bank; target of Rs 2350: ICICI Securities"
// "Sell Tata Steel; target of Rs. 120 - Motilal Oswal"
// "Accumulate Voltas; target of Rs 1450: Emkay Global"
function parseRecoTitle(title: string, link: string, description: string, pubDate: string, source: string): BrokerReco | null {
  // Strip trailing " - Source.com" (added by Google News aggregation)
  const cleaned = title.replace(/\s+-\s+[^-]+\.(com|in|net|org)\s*$/i, '').trim();
  const re = /^\s*(Buy|Sell|Hold|Accumulate|Reduce|Neutral)\s+(.+?)[;,]\s*target\s+(?:of\s+)?Rs\.?\s*([\d,]+(?:\.\d+)?)\s*[:\-–]\s*(.+?)\s*$/i;
  const m = cleaned.match(re);
  if (!m) return null;

  const action = (m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase()) as BrokerReco['recommendation'];
  const stock = m[2].trim().replace(/\s+/g, ' ');
  const target = parseFloat(m[3].replace(/,/g, ''));
  const broker = m[4].trim().replace(/\s+/g, ' ');

  if (!stock || !broker || !isFinite(target) || target <= 0) return null;

  // Build a short rationale from the description. Google News descriptions are
  // just an anchor-wrapped duplicate of the title + source name, so drop them
  // and fall back to a generated sentence in that case.
  const desc = cleanText(description);
  const looksLikeTitleEcho = !desc || desc.toLowerCase().includes(stock.toLowerCase());
  const firstSentence = looksLikeTitleEcho ? '' : (desc.split(/(?<=[.!?])\s+/)[0] || desc);
  const rationale = firstSentence.length > 160 ? firstSentence.slice(0, 157) + '...' : firstSentence;

  return {
    stock,
    ticker: guessTicker(stock),
    recommendation: action,
    targetPrice: target,
    broker,
    date: pubDate,
    rationale: rationale || `${broker} recommends ${action} on ${stock}`,
    sourceUrl: link,
  };
}

async function fetchFeed(feed: { url: string; source: string }): Promise<BrokerReco[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });
    if (!res.ok) {
      console.error(`Feed ${feed.source} failed: ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const out: BrokerReco[] = [];
    for (const item of items) {
      const title = cleanText((item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]) || '');
      const link = cleanText((item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]) || '');
      const desc = (item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1]) || '';
      const pubDate = parseDate((item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]) || '');
      if (!title || !link) continue;
      const reco = parseRecoTitle(title, link, desc, pubDate, feed.source);
      if (reco) out.push(reco);
    }
    return out;
  } catch (e) {
    console.error(`Error fetching ${feed.source}:`, e);
    return [];
  }
}

// Scrape Moneycontrol's broker-recommendations tag page through Firecrawl.
// This bypasses Google News' 503s and Moneycontrol's own bot blocks.
const MONEYCONTROL_RECO_PAGES = [
  'https://www.moneycontrol.com/news/tags/recommendations.html',
  'https://www.moneycontrol.com/news/tags/broker-research.html',
];

async function fetchMoneycontrolViaFirecrawl(): Promise<BrokerReco[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.log('FIRECRAWL_API_KEY not set, skipping Firecrawl');
    return [];
  }
  const out: BrokerReco[] = [];
  for (const pageUrl of MONEYCONTROL_RECO_PAGES) {
    try {
      const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: pageUrl,
          formats: ['markdown', 'links'],
          onlyMainContent: true,
        }),
      });
      if (!res.ok) {
        console.error(`Firecrawl ${pageUrl} failed: ${res.status} ${await res.text().catch(() => '')}`);
        continue;
      }
      const json = await res.json();
      const markdown: string = json?.data?.markdown || json?.markdown || '';
      const links: string[] = json?.data?.links || json?.links || [];
      // Build link map: anchor text -> href, by scanning markdown links [text](href)
      const linkPairs: Array<{ text: string; href: string }> = [];
      const linkRe = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let m: RegExpExecArray | null;
      while ((m = linkRe.exec(markdown)) !== null) {
        linkPairs.push({ text: m[1].trim(), href: m[2].trim() });
      }
      const now = new Date().toISOString();
      for (const { text, href } of linkPairs) {
        if (!/moneycontrol\.com/i.test(href)) continue;
        const reco = parseRecoTitle(text, href, '', now, 'Moneycontrol');
        if (reco) out.push(reco);
      }
      // Also try plain link list (some pages render titles as anchor-only)
      for (const href of links) {
        if (typeof href !== 'string') continue;
        // Title is usually in the URL slug: /news/business/markets/buy-hdfc-bank-...
        const slugMatch = href.match(/\/([^/]+?)-\d+\.html$/);
        if (!slugMatch) continue;
        const slugTitle = slugMatch[1].replace(/-/g, ' ');
        const reco = parseRecoTitle(slugTitle, href, '', now, 'Moneycontrol');
        if (reco) out.push(reco);
      }
    } catch (e) {
      console.error(`Firecrawl error ${pageUrl}:`, e);
    }
  }
  console.log(`Firecrawl returned ${out.length} Moneycontrol recos`);
  return out;
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let limit = 9;
    try {
      const body = await req.json();
      if (body?.limit && typeof body.limit === 'number') {
        limit = Math.max(1, Math.min(Math.floor(body.limit), 200));
      }
    } catch {
      // GET / no body
    }

    const [rssResults, fcResults] = await Promise.all([
      Promise.all(RECO_FEEDS.map(fetchFeed)).then((r) => r.flat()),
      fetchMoneycontrolViaFirecrawl(),
    ]);
    const all = [...rssResults, ...fcResults];


    // Dedupe by stock+broker, keep newest
    const seen = new Map<string, BrokerReco>();
    for (const r of all) {
      const key = `${r.stock.toLowerCase()}|${r.broker.toLowerCase()}`;
      const prev = seen.get(key);
      if (!prev || new Date(r.date).getTime() > new Date(prev.date).getTime()) {
        seen.set(key, r);
      }
    }

    const sorted = Array.from(seen.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let recos = sorted.slice(0, limit);
    let source: 'rss' | 'cache' = 'rss';
    let fetchedAt = new Date().toISOString();
    let cacheAge: number | null = null;

    if (recos.length > 0) {
      // Fresh data: persist it for future fallback
      await saveCachedRecos(recos);
    } else {
      // No fresh items — fall back to last cached batch
      const cached = await loadCachedRecos();
      if (cached && cached.recos.length > 0) {
        recos = cached.recos.slice(0, limit);
        source = 'cache';
        fetchedAt = cached.fetched_at;
        cacheAge = Math.max(0, Date.now() - new Date(cached.fetched_at).getTime());
        console.log(`Serving ${recos.length} cached recos from ${cached.fetched_at}`);
      }
    }

    return new Response(
      JSON.stringify({
        recos,
        count: recos.length,
        fetchedAt,
        source,
        cacheAgeMs: cacheAge,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=180',
        },
      }
    );
  } catch (err) {
    console.error('broker-recos error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
