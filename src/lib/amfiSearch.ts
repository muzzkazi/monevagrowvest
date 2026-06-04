import { fundHouses, MutualFundInfo } from "@/data/mutualFundDatabase";

// ────────────────────────────────────────────────────────────────────────────
// AMFI scheme classification helpers (shared across screener + overlap)
// ────────────────────────────────────────────────────────────────────────────

export const inferSubCategory = (name: string): string => {
  const n = name.toLowerCase();
  // Order matters — most specific first
  if (n.includes("large & mid") || n.includes("large and mid") || n.includes("large&mid")) return "Large & Mid Cap";
  if (n.includes("small cap") || n.includes("smallcap")) return "Small Cap";
  if (n.includes("mid cap") || n.includes("midcap") || n.includes("emerging")) return "Mid Cap";
  if (n.includes("flexi cap") || n.includes("flexicap")) return "Flexi Cap";
  if (n.includes("multi cap") || n.includes("multicap")) return "Multi Cap";
  if (n.includes("elss") || n.includes("tax saver") || n.includes("tax plan") || n.includes("long term equity")) return "ELSS";
  if (n.includes("value")) return "Value";
  if (n.includes("liquid")) return "Liquid";
  if (n.includes("ultra short")) return "Ultra Short Duration";
  if (n.includes("short duration") || n.includes("short term")) return "Short Duration";
  if (n.includes("gilt")) return "Gilt";
  if (n.includes("corporate bond")) return "Corporate Bond";
  if (n.includes("arbitrage")) return "Arbitrage";
  if (n.includes("balanced advantage")) return "Balanced Advantage";
  if (n.includes("hybrid")) return "Aggressive Hybrid";
  if (n.includes("index") || n.includes("nifty") || n.includes("sensex")) return "Index Fund";
  if (n.includes("pharma") || n.includes("tech") || n.includes("digital") || n.includes("banking") || n.includes("infra") || n.includes("fmcg") || n.includes("energy") || n.includes("sectoral")) return "Sectoral";
  if (n.includes("large cap") || n.includes("bluechip") || n.includes("blue chip") || n.includes("top 100")) return "Large Cap";
  return "Flexi Cap";
};

export const inferFundHouse = (name: string): string => {
  const n = name.toLowerCase();
  // 1) Try to match a known canonical fund-house entry first.
  const known = fundHouses.find((house) => {
    if (house === "All") return false;
    const norm = house.toLowerCase().replace(/\bmutual fund\b/g, "").trim();
    return norm.length > 0 && n.includes(norm);
  });
  if (known) return known;

  // 2) Fallback: take the first 1-2 words of the scheme name and append
  // " Mutual Fund" so it's visually consistent with curated rows
  // (avoids "Tata" vs "Tata Mutual Fund" looking like two different houses).
  const head = name.split(/\s+/).slice(0, 2).join(" ").trim();
  if (!head) return "Unknown";
  return /mutual fund/i.test(head) ? head : `${head} Mutual Fund`;
};

const DEBT_SUBS = new Set([
  "Liquid", "Short Duration", "Long Duration", "Gilt", "Corporate Bond",
  "Banking & PSU", "Ultra Short Duration", "Medium Duration",
]);
const HYBRID_SUBS = new Set(["Aggressive Hybrid", "Conservative Hybrid", "Arbitrage", "Balanced Advantage", "Multi Asset Allocation"]);

export const fromAmfiScheme = (s: { schemeCode: number | string; schemeName: string }): MutualFundInfo => {
  const sub = inferSubCategory(s.schemeName);
  const category = DEBT_SUBS.has(sub) ? "Debt" : HYBRID_SUBS.has(sub) ? "Hybrid" : "Equity";
  return {
    schemeCode: String(s.schemeCode),
    schemeName: s.schemeName,
    category,
    subCategory: sub,
    fundHouse: inferFundHouse(s.schemeName),
    plan: s.schemeName.toLowerCase().includes("direct") ? "Direct" : "Regular",
    nav: 0,
    aum: 0,
    expenseRatio: 0,
    rating: 0,
    riskLevel: category === "Debt" ? "Low" : "High",
    returns1Y: 0, returns3Y: 0, returns5Y: 0, returns10Y: 0,
    sipMinimum: 500, lumpSumMinimum: 5000,
    exitLoad: "—", benchmark: "—", fundManager: "—", inceptionDate: "—",
  };
};

// ────────────────────────────────────────────────────────────────────────────
// Sub-category & category → AMFI search keywords
// ────────────────────────────────────────────────────────────────────────────

export const SUB_CATEGORY_QUERIES: Record<string, string[]> = {
  "Large Cap": ["large cap", "bluechip", "blue chip", "top 100"],
  "Mid Cap": ["mid cap", "midcap", "emerging"],
  "Small Cap": ["small cap", "smallcap"],
  "Large & Mid Cap": ["large & mid", "large and mid", "large midcap", "large mid cap"],
  "Multi Cap": ["multi cap", "multicap"],
  "Flexi Cap": ["flexi cap", "flexicap"],
  "ELSS": ["elss", "tax saver", "tax plan", "long term equity"],
  "Sectoral": ["pharma", "tech", "digital", "banking", "infra", "fmcg", "energy", "sectoral"],
  "Index Fund": ["index", "nifty", "sensex"],
  "Value": ["value"],
  "Liquid": ["liquid"],
  "Ultra Short Duration": ["ultra short"],
  "Short Duration": ["short duration", "short term"],
  "Medium Duration": ["medium duration"],
  "Long Duration": ["long duration"],
  "Corporate Bond": ["corporate bond"],
  "Gilt": ["gilt"],
  "Banking & PSU": ["banking psu", "banking and psu", "psu debt"],
  "Aggressive Hybrid": ["hybrid", "equity hybrid", "balanced"],
  "Conservative Hybrid": ["conservative hybrid", "regular savings", "monthly income"],
  "Balanced Advantage": ["balanced advantage", "dynamic asset"],
  "Multi Asset Allocation": ["multi asset"],
  "Arbitrage": ["arbitrage"],
  "Retirement": ["retirement"],
  "Children's Fund": ["children", "child"],
  "International": ["nasdaq", "us equity", "global", "international"],
  "Fund of Funds": ["fund of funds", "fof"],
  "ETF": ["etf"],
};

// Broader keyword lists when the user only picks a Category.
// Curated to surface the most-popular sub-categories per umbrella category.
export const CATEGORY_QUERIES: Record<string, string[]> = {
  Equity: ["large cap", "mid cap", "small cap", "flexi cap", "multi cap", "elss", "index", "value", "sectoral"],
  Debt: ["liquid", "ultra short", "short duration", "corporate bond", "gilt", "banking psu", "long duration"],
  Hybrid: ["hybrid", "balanced advantage", "arbitrage", "multi asset", "conservative hybrid"],
  "Solution Oriented": ["retirement", "children"],
  Other: ["international", "fund of funds", "etf"],
};

// ────────────────────────────────────────────────────────────────────────────
// In-memory + localStorage cache for AMFI search responses (keyed by query)
// ────────────────────────────────────────────────────────────────────────────

type AmfiSearchHit = { schemeCode: number | string; schemeName: string };

const SEARCH_CACHE = new Map<string, AmfiSearchHit[]>();
const INFLIGHT = new Map<string, Promise<AmfiSearchHit[]>>();
const MAX_CACHE_KEYS = 200;
// Edge truncates at this many results — only narrow from a cached set if it
// wasn't truncated, otherwise we'd return an incomplete list.
const EDGE_RESULT_CAP = 80;

// ── Persistent cache (localStorage) ────────────────────────────────────────
// Persisting prior query results means returning visitors get instant
// (network-free) answers for queries they've already run.
const LS_KEY = "moneva.amfiSearchCache.v1";
const LS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
let lsDirty = false;
let lsFlushTimer: ReturnType<typeof setTimeout> | null = null;

const hydrateFromLocalStorage = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { ts: number; entries: Array<[string, AmfiSearchHit[]]> };
    if (!parsed || typeof parsed.ts !== "number") return;
    if (Date.now() - parsed.ts > LS_TTL_MS) {
      window.localStorage.removeItem(LS_KEY);
      return;
    }
    for (const [k, v] of parsed.entries) {
      if (typeof k === "string" && Array.isArray(v)) SEARCH_CACHE.set(k, v);
    }
  } catch {
    /* corrupt cache — ignore */
  }
};

const scheduleLocalStorageFlush = () => {
  if (typeof window === "undefined") return;
  lsDirty = true;
  if (lsFlushTimer) return;
  lsFlushTimer = setTimeout(() => {
    lsFlushTimer = null;
    if (!lsDirty) return;
    lsDirty = false;
    try {
      const entries = Array.from(SEARCH_CACHE.entries());
      window.localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), entries }));
    } catch {
      /* quota exceeded — drop silently */
    }
  }, 800);
};

// Hydrate on module load (browser only) so the next visit starts instantly.
hydrateFromLocalStorage();

// ────────────────────────────────────────────────────────────────────────────
// Full AMFI scheme list (downloaded once, cached in IndexedDB)
// ────────────────────────────────────────────────────────────────────────────
// Once the full list is loaded, every search is instant and 100% local — no
// edge function call at all. ~2MB payload, cached for 24h.

import { idbGet, idbSet } from "./idbKv";

// IDB schema version — bump to invalidate all cached payloads atomically.
const IDB_VERSION = 2;
const IDB_KEY = `amfi.schemes.v${IDB_VERSION}`;
// Soft refresh interval — the list rarely changes, so we just probe a tiny
// `action=version` endpoint and skip the full re-download when unchanged.
const IDB_REFRESH_AFTER_MS = 60 * 60 * 1000;        // 1h → check version
const IDB_HARD_REFRESH_AFTER_MS = 7 * 24 * 3600 * 1000; // 7d → force refetch

type CompactScheme = [number | string, string]; // [code, name]
type CachedPayload = {
  schemaVersion: number;
  version: string;        // server-supplied content hash
  ts: number;             // last full-refresh timestamp
  checkedAt: number;      // last version-probe timestamp
  schemes: CompactScheme[];
};
type ChunkPayload = {
  ts: number;
  version: string;
  total: number;
  part: number;
  of: number;
  schemes: CompactScheme[];
};
type VersionPayload = { version: string; count: number; ts: number };

const CHUNK_COUNT = 4;

let allSchemes: AmfiSearchHit[] | null = null;
let allSchemesVersion = "";
let allSchemesPromise: Promise<AmfiSearchHit[] | null> | null = null;
let isPartial = false;

// ── Pub/sub so search UIs can re-render as chunks stream in ────────────────
const subscribers = new Set<() => void>();
const notifySubscribers = () => subscribers.forEach((cb) => { try { cb(); } catch { /* noop */ } });

/** Subscribe to scheme-list updates (initial hydrate + each streamed chunk). */
export const subscribeAmfiUpdates = (cb: () => void): (() => void) => {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
};

const expandCompact = (rows: CompactScheme[]): AmfiSearchHit[] =>
  rows.map(([code, name]) => ({ schemeCode: code, schemeName: name }));

// ── Network-condition helpers (Wi-Fi-aware, idle-aware) ────────────────────

const onSlowOrMeteredNetwork = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as any).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  const t = String(conn.effectiveType || "");
  return t === "slow-2g" || t === "2g";
};

const runWhenIdle = (fn: () => void) => {
  if (typeof window === "undefined") return;
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined;
  if (ric) ric(fn, { timeout: 3000 });
  else setTimeout(fn, 250);
};

// ── Edge endpoints ─────────────────────────────────────────────────────────

const edgeUrl = (params: Record<string, string>) => {
  const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
  const qs = new URLSearchParams(params).toString();
  return `${SUPABASE_URL}/functions/v1/mutual-funds?${qs}`;
};

const fetchServerVersion = async (): Promise<VersionPayload | null> => {
  try {
    const res = await fetch(edgeUrl({ action: "version" }));
    if (!res.ok) return null;
    return (await res.json()) as VersionPayload;
  } catch { return null; }
};

const fetchChunk = async (part: number, of: number): Promise<ChunkPayload | null> => {
  try {
    const res = await fetch(edgeUrl({ action: "all", part: String(part), of: String(of) }));
    if (!res.ok) return null;
    return (await res.json()) as ChunkPayload;
  } catch { return null; }
};

/**
 * Stream the full list in N parallel chunks. As each chunk arrives, the
 * in-memory list grows and subscribers are notified, so the picker can show
 * partial results while the rest of the download is still in flight.
 */
const streamAllSchemes = async (
  expectedVersion?: string,
): Promise<AmfiSearchHit[] | null> => {
  const merged = new Map<string, AmfiSearchHit>();
  // Seed with existing data so a partial refresh doesn't visibly shrink results.
  if (allSchemes) {
    for (const s of allSchemes) merged.set(String(s.schemeCode), s);
  }

  let serverVersion = expectedVersion || "";

  const tasks = Array.from({ length: CHUNK_COUNT }, (_, i) =>
    fetchChunk(i, CHUNK_COUNT).then((chunk) => {
      if (!chunk || !Array.isArray(chunk.schemes)) return;
      if (!serverVersion) serverVersion = chunk.version;
      // If a fresher version arrived mid-flight, drop stale chunks.
      if (serverVersion && chunk.version !== serverVersion) return;
      for (const [code, name] of chunk.schemes) {
        merged.set(String(code), { schemeCode: code, schemeName: name });
      }
      // Publish progressive update so search UIs can re-run their query.
      allSchemes = Array.from(merged.values());
      isPartial = true;
      notifySubscribers();
    }),
  );

  await Promise.all(tasks);

  if (merged.size < 1000) return null;

  allSchemes = Array.from(merged.values());
  allSchemesVersion = serverVersion;
  isPartial = false;
  notifySubscribers();

  // Persist atomically once fully assembled.
  const compact: CompactScheme[] = allSchemes.map((s) => [s.schemeCode, s.schemeName]);
  const payload: CachedPayload = {
    schemaVersion: IDB_VERSION,
    version: serverVersion,
    ts: Date.now(),
    checkedAt: Date.now(),
    schemes: compact,
  };
  void idbSet(IDB_KEY, payload);

  return allSchemes;
};

/**
 * Check the server's version hash. If unchanged, just bump `checkedAt` in the
 * IDB cache — no re-download. If changed, stream the new list.
 */
const refreshIfStale = async (cached: CachedPayload): Promise<void> => {
  const probe = await fetchServerVersion();
  if (!probe) return;
  if (probe.version && probe.version === cached.version) {
    // Same content — just touch the freshness marker.
    void idbSet(IDB_KEY, { ...cached, checkedAt: Date.now() });
    allSchemesVersion = probe.version;
    return;
  }
  await streamAllSchemes(probe.version);
};

const loadAllSchemes = async (): Promise<AmfiSearchHit[] | null> => {
  if (allSchemes && !isPartial) return allSchemes;
  if (allSchemesPromise) return allSchemesPromise;

  allSchemesPromise = (async () => {
    // 1) Try IDB first — instant hydrate from previous session.
    try {
      const cached = await idbGet<CachedPayload>(IDB_KEY);
      if (
        cached &&
        cached.schemaVersion === IDB_VERSION &&
        Array.isArray(cached.schemes) &&
        cached.schemes.length > 1000
      ) {
        allSchemes = expandCompact(cached.schemes);
        allSchemesVersion = cached.version || "";
        isPartial = false;
        notifySubscribers();

        const now = Date.now();
        const age = now - (cached.ts || 0);
        const sinceCheck = now - (cached.checkedAt || 0);

        if (age > IDB_HARD_REFRESH_AFTER_MS) {
          // Cache is ancient — refetch in the background.
          if (!onSlowOrMeteredNetwork()) {
            runWhenIdle(() => { void streamAllSchemes().catch(() => undefined); });
          }
        } else if (sinceCheck > IDB_REFRESH_AFTER_MS) {
          // Light version probe — cheap, no re-download if unchanged.
          if (!onSlowOrMeteredNetwork()) {
            runWhenIdle(() => { void refreshIfStale(cached).catch(() => undefined); });
          }
        }
        return allSchemes;
      }
    } catch { /* ignore */ }

    // 2) No cache — defer to idle so we don't fight the initial page render.
    //    On slow/metered links, skip the chunked prewarm and let `searchAmfi`
    //    fall back to the per-query edge endpoint.
    if (onSlowOrMeteredNetwork()) return null;
    return new Promise<AmfiSearchHit[] | null>((resolve) => {
      runWhenIdle(() => { void streamAllSchemes().then(resolve); });
    });
  })();

  return allSchemesPromise;
};

/** True if the full scheme list (or a partial of it) is in memory. */
export const isAmfiFullListReady = (): boolean => allSchemes !== null && !isPartial;
export const isAmfiPartialReady = (): boolean => allSchemes !== null;

const localSearch = (q: string): AmfiSearchHit[] => {
  if (!allSchemes) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const matches = allSchemes.filter((s) => {
    const name = String(s.schemeName || "").toLowerCase();
    return words.every((w) => name.includes(w));
  });
  matches.sort((a, b) => {
    const aName = String(a.schemeName || "").toLowerCase();
    const bName = String(b.schemeName || "").toLowerCase();
    const aStarts = aName.startsWith(q) ? 1 : 0;
    const bStarts = bName.startsWith(q) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    const aDirect = aName.includes("direct") ? 1 : 0;
    const bDirect = bName.includes("direct") ? 1 : 0;
    if (aDirect !== bDirect) return bDirect - aDirect;
    return aName.localeCompare(bName);
  });
  return matches.slice(0, 80);
};

const buildSearchUrl = (q: string) => edgeUrl({ action: "search", q });

/**
 * Look for a cached shorter query whose result set fully contains the answer
 * for `q` (so we can filter client-side and skip the network entirely).
 */
const narrowFromCache = (q: string): AmfiSearchHit[] | null => {
  const words = q.split(/\s+/).filter(Boolean);
  // Try progressively shorter prefixes of the same query first (cheapest hit).
  for (let len = q.length - 1; len >= 3; len--) {
    const prefix = q.slice(0, len);
    const cached = SEARCH_CACHE.get(prefix);
    if (cached && cached.length < EDGE_RESULT_CAP) {
      return cached.filter((s) => {
        const name = String(s.schemeName || "").toLowerCase();
        return words.every((w) => name.includes(w));
      });
    }
  }
  return null;
};

/** True if `searchAmfi(q)` will resolve synchronously from cache. */
export const isAmfiQueryCached = (rawQuery: string): boolean => {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  if (allSchemes) return true; // local list (full or partial) — instant
  if (SEARCH_CACHE.has(q)) return true;
  return narrowFromCache(q) !== null;
};

/** Coarse estimate of expected wait in ms for UI hint text. */
export const estimateAmfiSearchMs = (rawQuery: string): number => {
  if (isAmfiQueryCached(rawQuery)) return 0;
  // Empty in-memory cache → likely cold edge function (~30k scheme fetch).
  return SEARCH_CACHE.size === 0 ? 2500 : 800;
};

/** Cached AMFI search. Returns [] on errors. Re-uses in-flight requests. */
export const searchAmfi = async (
  rawQuery: string,
  signal?: AbortSignal,
): Promise<AmfiSearchHit[]> => {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  // Fastest path: local list (even partial) → search locally, no network.
  if (allSchemes) return localSearch(q);

  if (SEARCH_CACHE.has(q)) return SEARCH_CACHE.get(q)!;

  // Try to answer locally from a previously-cached shorter query.
  const narrowed = narrowFromCache(q);
  if (narrowed) {
    SEARCH_CACHE.set(q, narrowed);
    scheduleLocalStorageFlush();
    return narrowed;
  }

  // If the full list is loading right now, wait briefly for the first chunk —
  // much faster than the per-query edge endpoint once partial data lands.
  if (allSchemesPromise) {
    const loaded = await Promise.race([
      allSchemesPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 400)),
    ]);
    if (loaded || allSchemes) return localSearch(q);
  }

  const inflight = INFLIGHT.get(q);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const res = await fetch(buildSearchUrl(q), { signal });
      if (!res.ok) return [];
      const data = await res.json();
      const arr: AmfiSearchHit[] = Array.isArray(data) ? data : [];
      // Simple FIFO cap to keep memory bounded
      if (SEARCH_CACHE.size >= MAX_CACHE_KEYS) {
        const firstKey = SEARCH_CACHE.keys().next().value;
        if (firstKey) SEARCH_CACHE.delete(firstKey);
      }
      SEARCH_CACHE.set(q, arr);
      scheduleLocalStorageFlush();
      return arr;
    } catch {
      return [];
    } finally {
      INFLIGHT.delete(q);
    }
  })();

  INFLIGHT.set(q, promise);
  return promise;
};

/**
 * Kick off the full AMFI scheme list download. Runs during browser idle and
 * skips the chunked prewarm on metered / slow connections (we still fall back
 * to the per-query edge endpoint in that case).
 */
export const prewarmAmfiSearch = () => {
  if ((allSchemes && !isPartial) || allSchemesPromise) return;
  void loadAllSchemes();
};


/** Run multiple cached searches in parallel and de-dupe by schemeCode. */
export const searchAmfiMany = async (
  queries: string[],
  signal?: AbortSignal,
): Promise<AmfiSearchHit[]> => {
  const all = await Promise.all(queries.map((q) => searchAmfi(q, signal)));
  const seen = new Set<string>();
  const merged: AmfiSearchHit[] = [];
  for (const arr of all) {
    for (const s of arr) {
      const code = String(s?.schemeCode ?? "");
      if (!code || seen.has(code)) continue;
      seen.add(code);
      merged.push(s);
    }
  }
  return merged;
};

// ────────────────────────────────────────────────────────────────────────────
// NAV enrichment via the mutual-funds edge function
// ────────────────────────────────────────────────────────────────────────────

const parseDate = (s: string): Date => {
  const [d, m, y] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const navOnOrBefore = (history: Array<{ date: string; nav: string }>, target: Date) => {
  for (let i = 0; i < history.length; i++) {
    const d = parseDate(history[i].date);
    if (d <= target) {
      const v = parseFloat(history[i].nav);
      return isNaN(v) ? null : v;
    }
  }
  return null;
};

const cagr = (start: number, end: number, years: number) =>
  start > 0 && end > 0 ? (Math.pow(end / start, 1 / years) - 1) * 100 : 0;

/** Batch-fetch latest NAV only (cheap). Returns map of code → nav. */
export const fetchLatestNAVs = async (
  codes: string[],
  signal?: AbortSignal,
): Promise<Map<string, number>> => {
  const out = new Map<string, number>();
  if (codes.length === 0) return out;

  const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
  const PUBLISHABLE_KEY = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY;

  for (let i = 0; i < codes.length; i += 30) {
    const chunk = codes.slice(i, i + 30);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/mutual-funds?action=batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: PUBLISHABLE_KEY },
        body: JSON.stringify({ codes: chunk }),
        signal,
      });
      const json = await res.json();
      if (Array.isArray(json?.results)) {
        for (const r of json.results) {
          if (Array.isArray(r?.data) && r.data[0]?.nav) {
            const v = parseFloat(r.data[0].nav);
            if (!isNaN(v)) out.set(String(r.code), v);
          }
        }
      }
    } catch {
      // continue with next chunk
    }
  }
  return out;
};

/** Batch-fetch full NAV history and return enriched fund data (NAV + CAGR). */
export const enrichFundsWithHistory = async (
  funds: MutualFundInfo[],
  signal?: AbortSignal,
): Promise<MutualFundInfo[]> => {
  if (funds.length === 0) return funds;

  const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
  const PUBLISHABLE_KEY = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const enriched: MutualFundInfo[] = funds.map((f) => ({ ...f }));
  const codes = enriched.map((f) => f.schemeCode);

  for (let i = 0; i < codes.length; i += 20) {
    const chunk = codes.slice(i, i + 20);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/mutual-funds?action=batch-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: PUBLISHABLE_KEY },
        body: JSON.stringify({ codes: chunk }),
        signal,
      });
      const json = await res.json();
      if (!Array.isArray(json?.results)) continue;

      for (const r of json.results) {
        const idx = enriched.findIndex((e) => e.schemeCode === r.code);
        if (idx < 0 || !Array.isArray(r.data) || r.data.length === 0) continue;

        const latestNav = parseFloat(r.data[0].nav);
        if (isNaN(latestNav)) continue;

        const now = parseDate(r.data[0].date);
        const oneY = new Date(now); oneY.setFullYear(now.getFullYear() - 1);
        const threeY = new Date(now); threeY.setFullYear(now.getFullYear() - 3);
        const fiveY = new Date(now); fiveY.setFullYear(now.getFullYear() - 5);

        const nav1Y = navOnOrBefore(r.data, oneY);
        const nav3Y = navOnOrBefore(r.data, threeY);
        const nav5Y = navOnOrBefore(r.data, fiveY);

        enriched[idx] = {
          ...enriched[idx],
          nav: latestNav,
          returns1Y: nav1Y ? +cagr(nav1Y, latestNav, 1).toFixed(2) : 0,
          returns3Y: nav3Y ? +cagr(nav3Y, latestNav, 3).toFixed(2) : 0,
          returns5Y: nav5Y ? +cagr(nav5Y, latestNav, 5).toFixed(2) : 0,
        };
      }
    } catch {
      // continue
    }
  }
  return enriched;
};