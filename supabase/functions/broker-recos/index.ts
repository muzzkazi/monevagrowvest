import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
// Google News RSS aggregates Moneycontrol's broker-call headlines, which use a
// strict "<Action> <Stock>; target of Rs <N>: <Broker>" pattern we can parse.
const RECO_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=%22target+of+Rs%22+%28Buy+OR+Sell+OR+Hold+OR+Accumulate+OR+Reduce+OR+Neutral%29+site%3Amoneycontrol.com&hl=en-IN&gl=IN&ceid=IN:en',
    source: 'Moneycontrol via Google News',
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
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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
  const re = /^\s*(Buy|Sell|Hold|Accumulate|Reduce|Neutral)\s+(.+?)[;,]\s*target\s+(?:of\s+)?Rs\.?\s*([\d,]+(?:\.\d+)?)\s*[:\-–]\s*(.+?)\s*$/i;
  const m = title.match(re);
  if (!m) return null;

  const action = (m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase()) as BrokerReco['recommendation'];
  const stock = m[2].trim().replace(/\s+/g, ' ');
  const target = parseFloat(m[3].replace(/,/g, ''));
  const broker = m[4].trim().replace(/\s+/g, ' ');

  if (!stock || !broker || !isFinite(target) || target <= 0) return null;

  // Build a short rationale from description (first sentence, max ~140 chars)
  const desc = cleanText(description);
  const firstSentence = desc.split(/(?<=[.!?])\s+/)[0] || desc;
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
        'User-Agent': 'Mozilla/5.0 (compatible; MonevaBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let limit = 9;
    try {
      const body = await req.json();
      if (body?.limit && typeof body.limit === 'number') {
        limit = Math.max(1, Math.min(Math.floor(body.limit), 30));
      }
    } catch {
      // GET / no body
    }

    const results = await Promise.all(RECO_FEEDS.map(fetchFeed));
    const all = results.flat();

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

    const recos = sorted.slice(0, limit);

    return new Response(
      JSON.stringify({
        recos,
        count: recos.length,
        fetchedAt: new Date().toISOString(),
        source: 'rss',
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
