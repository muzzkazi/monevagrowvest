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
  entryPrice?: number;
  stopLoss?: number;
  broker: string;
  date: string;
  rationale: string;
  sourceUrl: string;
  sector?: string;
}

function extractRsAmount(text: string, pattern: RegExp): number | undefined {
  const m = text.match(pattern);
  if (!m) return undefined;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return isFinite(n) && n > 0 ? n : undefined;
}

function extractEntryAndSL(haystack: string): { entryPrice?: number; stopLoss?: number } {
  const text = haystack.replace(/\s+/g, ' ');
  const stopLoss = extractRsAmount(
    text,
    /(?:stop[\s-]?loss|stoploss|\bSL\b)\s*(?:of|at|:)?\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i,
  );
  const entryPrice =
    extractRsAmount(text, /\bCMP\s*(?:of|:)?\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i) ??
    extractRsAmount(text, /\bcurrent market price\s*(?:of)?\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i) ??
    extractRsAmount(text, /\b(?:entry|buy)\s*(?:price|around|at|near)?\s*(?:of)?\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i);
  return { entryPrice, stopLoss };
}

const TICKER_TO_SECTOR: Record<string, string> = {
  HDFCBANK: 'Banking', ICICIBANK: 'Banking', AXISBANK: 'Banking', KOTAKBANK: 'Banking',
  SBIN: 'Banking', BANKBARODA: 'Banking', PNB: 'Banking',
  BAJFINANCE: 'NBFC', BAJAJFINSV: 'NBFC', HDFCAMC: 'NBFC', HDFCLIFE: 'Insurance', SBILIFE: 'Insurance',
  TCS: 'IT', INFY: 'IT', WIPRO: 'IT', HCLTECH: 'IT', TECHM: 'IT', LTIM: 'IT',
  RELIANCE: 'Energy', ONGC: 'Energy', COALINDIA: 'Energy', NTPC: 'Power', POWERGRID: 'Power',
  TATAMOTORS: 'Auto', MARUTI: 'Auto', 'M&M': 'Auto', 'BAJAJ-AUTO': 'Auto', HEROMOTOCO: 'Auto', EICHERMOT: 'Auto',
  SUNPHARMA: 'Pharma', CIPLA: 'Pharma', DRREDDY: 'Pharma', DIVISLAB: 'Pharma',
  ITC: 'FMCG', HINDUNILVR: 'FMCG', NESTLEIND: 'FMCG', BRITANNIA: 'FMCG',
  ASIANPAINT: 'Paints', ULTRACEMCO: 'Cement', GRASIM: 'Cement',
  JSWSTEEL: 'Metals', TATASTEEL: 'Metals', HINDALCO: 'Metals',
  LT: 'Infra', ADANIENT: 'Conglomerate', ADANIPORTS: 'Infra',
  BHARTIARTL: 'Telecom', TITAN: 'Consumer', VOLTAS: 'Consumer', HAVELLS: 'Consumer',
  PIDILITIND: 'Chemicals', DLF: 'Realty', GODREJPROP: 'Realty',
  ZOMATO: 'Internet', PAYTM: 'Internet', NYKAA: 'Internet', IRCTC: 'Travel', INDIGO: 'Aviation',
};


// RSS feeds that publish brokerage recommendations.
// NOTE: Google News RSS removed — it returns redirector URLs that browsers
// refuse to open (ERR_BLOCKED_BY_RESPONSE) and the endpoint frequently 503s.
const RECO_FEEDS = [
  {
    url: 'https://economictimes.indiatimes.com/markets/stocks/recos/rssfeeds/2146843.cms',
    source: 'Economic Times',
  },
  {
    url: 'https://economictimes.indiatimes.com/markets/stocks/news/rssfeeds/2146842.cms',
    source: 'Economic Times',
  },
];

function getGoogleNewsArticleId(url: string): string | null {
  return url.match(/news\.google\.com\/(?:rss\/)?articles\/([^?#/]+)/i)?.[1] ?? null;
}

// Decode older Google News redirector URLs where the source URL is embedded
// directly in the base64 payload. Newer AU_yqL IDs require a server lookup.
function resolveGoogleNewsUrlOffline(url: string): string {
  try {
    const id = getGoogleNewsArticleId(url);
    if (!id) return url;
    const b64 = id.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    const urlMatch = text.match(/https?:\/\/[^\s\x00-\x1f"']+/);
    if (urlMatch) return urlMatch[0].replace(/[)\].,;]+$/, '');
    return url;
  } catch {
    return url;
  }
}

async function resolveGoogleNewsUrl(url: string): Promise<string> {
  const id = getGoogleNewsArticleId(url);
  if (!id) return url;

  const offline = resolveGoogleNewsUrlOffline(url);
  if (!getGoogleNewsArticleId(offline)) return offline;

  try {
    const articleRes = await fetch(`https://news.google.com/articles/${id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-IN,en;q=0.9' },
    });
    const html = await articleRes.text();
    const signature = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
    const timestamp = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
    if (!articleRes.ok || !signature || !timestamp) return url;

    const payload = [[[
      'Fbv4je',
      JSON.stringify([
        'garturlreq',
        [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1], 'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
        id,
        timestamp,
        signature,
      ]),
      null,
      'generic',
    ]]];
    const decodeRes = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': 'Mozilla/5.0' },
      body: `f.req=${encodeURIComponent(JSON.stringify(payload))}`,
    });
    const text = await decodeRes.text();
    const jsonLine = text.split('\n').find((line) => line.trim().startsWith('[['));
    if (!decodeRes.ok || !jsonLine) return url;
    const decoded = JSON.parse(jsonLine);
    const nested = decoded?.[0]?.[2] ? JSON.parse(decoded[0][2]) : null;
    const directUrl = typeof nested?.[1] === 'string' ? nested[1] : null;
    return directUrl?.startsWith('http') ? directUrl : url;
  } catch (e) {
    console.error('Google News URL decode failed:', e);
    return url;
  }
}


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
  // Extended mid/small-cap mappings so live prices show for more recos
  'computer age management services': 'CAMS',
  'cams': 'CAMS',
  'lloyds metals and energy': 'LLOYDSME',
  'lloyds metals': 'LLOYDSME',
  'cyient': 'CYIENT',
  'suzlon energy': 'SUZLON',
  'suzlon': 'SUZLON',
  'equitas small finance bank': 'EQUITASBNK',
  'mahanagar gas': 'MGL',
  'nuvama wealth': 'NUVAMA',
  'nuvama wealth management': 'NUVAMA',
  'jindal stainless': 'JSL',
  'cera sanitaryware': 'CERA',
  'ajmera realty and infra india': 'AJMERA',
  'ajmera realty': 'AJMERA',
  'honasa consumer': 'HONASA',
  'elecon engineering': 'ELECON',
  'privi speciality chemicals': 'PRIVISCL',
  'aurionpro solutions': 'AURIONPRO',
  'aegis logistics': 'AEGISLOG',
  'interglobe aviation': 'INDIGO',
  'premier energies': 'PREMIERENE',
  'jsw infrastructure': 'JSWINFRA',
  'gabriel india': 'GABRIEL',
  'ltm': 'LTIM',
  'beml': 'BEML',
  'elgi equipments': 'ELGIEQUIP',
  'pg electroplast': 'PGEL',
  'alkem laboratories': 'ALKEM',
  'sumitomo chemicals': 'SUMICHEM',
  'sumitomo chemical': 'SUMICHEM',
  'sumitomo chemical india': 'SUMICHEM',
  'midwest': 'MIDWEST',
  'ircon international': 'IRCON',
  'ircon': 'IRCON',
  'bharat electronics': 'BEL',
  'bel': 'BEL',
  'hindustan aeronautics': 'HAL',
  'hal': 'HAL',
  'mazagon dock shipbuilders': 'MAZDOCK',
  'cochin shipyard': 'COCHINSHIP',
  'rail vikas nigam': 'RVNL',
  'rvnl': 'RVNL',
  'indian railway finance corporation': 'IRFC',
  'irfc': 'IRFC',
  'power finance corporation': 'PFC',
  'rec': 'RECLTD',
  'rec limited': 'RECLTD',
  'oil india': 'OIL',
  'gail india': 'GAIL',
  'gail': 'GAIL',
  'indian oil corporation': 'IOC',
  'ioc': 'IOC',
  'bharat petroleum': 'BPCL',
  'bpcl': 'BPCL',
  'hindustan petroleum': 'HINDPETRO',
  'hpcl': 'HINDPETRO',
  'siemens': 'SIEMENS',
  'abb india': 'ABB',
  'abb': 'ABB',
  'cummins india': 'CUMMINSIND',
  'bharat forge': 'BHARATFORG',
  'ashok leyland': 'ASHOKLEY',
  'tvs motor': 'TVSMOTOR',
  'tvs motor company': 'TVSMOTOR',
  'mrf': 'MRF',
  'balkrishna industries': 'BALKRISIND',
  'apollo tyres': 'APOLLOTYRE',
  'ceat': 'CEATLTD',
  'page industries': 'PAGEIND',
  'trent': 'TRENT',
  'avenue supermarts': 'DMART',
  'dmart': 'DMART',
  'jubilant foodworks': 'JUBLFOOD',
  'westlife foodworld': 'WESTLIFE',
  'devyani international': 'DEVYANI',
  'sapphire foods india': 'SAPPHIRE',
  'varun beverages': 'VBL',
  'dabur india': 'DABUR',
  'dabur': 'DABUR',
  'marico': 'MARICO',
  'godrej consumer products': 'GODREJCP',
  'colgate palmolive india': 'COLPAL',
  'colgate': 'COLPAL',
  'emami': 'EMAMILTD',
  'tata consumer products': 'TATACONSUM',
  'united spirits': 'MCDOWELL-N',
  'united breweries': 'UBL',
  'pi industries': 'PIIND',
  'upl': 'UPL',
  'srf': 'SRF',
  'aarti industries': 'AARTIIND',
  'navin fluorine international': 'NAVINFLUOR',
  'deepak nitrite': 'DEEPAKNTR',
  'tata chemicals': 'TATACHEM',
  'gujarat fluorochemicals': 'FLUOROCHEM',
  'syngene international': 'SYNGENE',
  'lupin': 'LUPIN',
  'aurobindo pharma': 'AUROPHARMA',
  'torrent pharmaceuticals': 'TORNTPHARM',
  'glenmark pharmaceuticals': 'GLENMARK',
  'biocon': 'BIOCON',
  'zydus lifesciences': 'ZYDUSLIFE',
  'mankind pharma': 'MANKIND',
  'ipca laboratories': 'IPCALAB',
  'apollo hospitals': 'APOLLOHOSP',
  'fortis healthcare': 'FORTIS',
  'max healthcare': 'MAXHEALTH',
  'max healthcare institute': 'MAXHEALTH',
  'narayana hrudayalaya': 'NH',
  'dr lal pathlabs': 'LALPATHLAB',
  'metropolis healthcare': 'METROPOLIS',
  'persistent systems': 'PERSISTENT',
  'coforge': 'COFORGE',
  'mphasis': 'MPHASIS',
  'tata elxsi': 'TATAELXSI',
  'kpit technologies': 'KPITTECH',
  'firstsource solutions': 'FSL',
  'oracle financial services software': 'OFSS',
  'route mobile': 'ROUTE',
  'happiest minds technologies': 'HAPPSTMNDS',
  'idfc first bank': 'IDFCFIRSTB',
  'au small finance bank': 'AUBANK',
  'bandhan bank': 'BANDHANBNK',
  'indusind bank': 'INDUSINDBK',
  'federal bank': 'FEDERALBNK',
  'rbl bank': 'RBLBANK',
  'canara bank': 'CANBK',
  'union bank of india': 'UNIONBANK',
  'indian bank': 'INDIANB',
  'bank of india': 'BANKINDIA',
  'cholamandalam investment and finance': 'CHOLAFIN',
  'cholamandalam': 'CHOLAFIN',
  'shriram finance': 'SHRIRAMFIN',
  'muthoot finance': 'MUTHOOTFIN',
  'manappuram finance': 'MANAPPURAM',
  'sbi cards and payment services': 'SBICARD',
  'sbi cards': 'SBICARD',
  'lic housing finance': 'LICHSGFIN',
  'piramal enterprises': 'PEL',
  'icici prudential life insurance': 'ICICIPRULI',
  'icici lombard general insurance': 'ICICIGI',
  'life insurance corporation of india': 'LICI',
  'lic': 'LICI',
  'star health and allied insurance': 'STARHEALTH',
  'ambuja cements': 'AMBUJACEM',
  'shree cement': 'SHREECEM',
  'acc': 'ACC',
  'dalmia bharat': 'DALBHARAT',
  'jk cement': 'JKCEMENT',
  'ramco cements': 'RAMCOCEM',
  'jsw energy': 'JSWENERGY',
  'tata power': 'TATAPOWER',
  'adani power': 'ADANIPOWER',
  'adani green energy': 'ADANIGREEN',
  'adani transmission': 'ADANIENSOL',
  'adani total gas': 'ATGL',
  'torrent power': 'TORNTPOWER',
  'cesc': 'CESC',
  'sjvn': 'SJVN',
  'nhpc': 'NHPC',
  'indraprastha gas': 'IGL',
  'gujarat gas': 'GUJGASLTD',
  'petronet lng': 'PETRONET',
  'jsw holdings': 'JSWHL',
  'vedanta': 'VEDL',
  'sail': 'SAIL',
  'nmdc': 'NMDC',
  'jindal steel & power': 'JINDALSTEL',
  'jindal steel and power': 'JINDALSTEL',
  'apl apollo tubes': 'APLAPOLLO',
  'polycab india': 'POLYCAB',
  'kei industries': 'KEI',
  'finolex cables': 'FINCABLES',
  'crompton greaves consumer': 'CROMPTON',
  'bajaj electricals': 'BAJAJELEC',
  'orient electric': 'ORIENTELEC',
  'symphony': 'SYMPHONY',
  'whirlpool of india': 'WHIRLPOOL',
  'blue star': 'BLUESTARCO',
  'dixon technologies': 'DIXON',
  'amber enterprises india': 'AMBER',
  'kajaria ceramics': 'KAJARIACER',
  'somany ceramics': 'SOMANYCERA',
  'astral': 'ASTRAL',
  'supreme industries': 'SUPREMEIND',
  'havells india': 'HAVELLS',
  'oberoi realty': 'OBEROIRLTY',
  'prestige estates projects': 'PRESTIGE',
  'macrotech developers': 'LODHA',
  'lodha': 'LODHA',
  'phoenix mills': 'PHOENIXLTD',
  'brigade enterprises': 'BRIGADE',
  'sobha': 'SOBHA',
  'container corporation of india': 'CONCOR',
  'concor': 'CONCOR',
  'gmr airports infrastructure': 'GMRINFRA',
  'irctc': 'IRCTC',
  'paytm': 'PAYTM',
  'one 97 communications': 'PAYTM',
  'fsn e-commerce ventures': 'NYKAA',
  'nykaa': 'NYKAA',
  'pb fintech': 'POLICYBZR',
  'policybazaar': 'POLICYBZR',
  'cartrade tech': 'CARTRADE',
  'delhivery': 'DELHIVERY',
  'mapmyindia': 'MAPMYINDIA',
  'ce info systems': 'MAPMYINDIA',
  'zee entertainment enterprises': 'ZEEL',
  'sun tv network': 'SUNTV',
  'pvr inox': 'PVRINOX',
  'info edge india': 'NAUKRI',
  'naukri': 'NAUKRI',
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

  const ticker = guessTicker(stock);
  const { entryPrice, stopLoss } = extractEntryAndSL(`${cleaned} ${desc}`);
  return {
    stock,
    ticker,
    recommendation: action,
    targetPrice: target,
    entryPrice,
    stopLoss,
    broker,
    date: pubDate,
    rationale: rationale || `${broker} recommends ${action} on ${stock}`,
    sourceUrl: resolveGoogleNewsUrlOffline(link),
    sector: ticker ? TICKER_TO_SECTOR[ticker] : undefined,
  };
}

async function hydrateSourceUrls(recos: BrokerReco[]): Promise<BrokerReco[]> {
  return Promise.all(recos.map(async (r) => ({ ...r, sourceUrl: await resolveGoogleNewsUrl(r.sourceUrl || '') })));
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

    let recos = await hydrateSourceUrls(sorted.slice(0, limit));
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
        // Reprocess cached items so old rows benefit from the latest URL
        // decoder + ticker map without needing to clear the cache.
        recos = await Promise.all(cached.recos.slice(0, limit).map(async (r) => {
          const sourceUrl = await resolveGoogleNewsUrl(r.sourceUrl || '');
          const ticker = r.ticker || guessTicker(r.stock || '');
          const sector = r.sector || (ticker ? TICKER_TO_SECTOR[ticker] : undefined);
          return { ...r, sourceUrl, ticker, sector };
        }));
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
