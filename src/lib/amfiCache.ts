// localStorage cache for AMFI-enriched mutual fund metadata.
// Stores NAV / returns / fundHouse keyed by schemeCode with a 1-hour TTL,
// so reloads of the screener feel instant instead of refetching from AMFI.

import type { MutualFundInfo } from "@/data/mutualFundDatabase";

const KEY = "amfi-meta-cache:v1";
const TTL_MS = 60 * 60 * 1000; // 1 hour

type CachedFund = Pick<
  MutualFundInfo,
  "schemeCode" | "schemeName" | "category" | "subCategory" | "fundHouse" |
  "plan" | "nav" | "returns1Y" | "returns3Y" | "returns5Y" | "riskLevel"
>;

interface CacheShape {
  savedAt: number;
  funds: CachedFund[];
}

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

export const loadAmfiCache = (): MutualFundInfo[] | null => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (!parsed?.savedAt || !Array.isArray(parsed.funds)) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    // Re-hydrate to full MutualFundInfo with safe defaults for fields we don't cache.
    return parsed.funds.map((f) => ({
      ...f,
      aum: 0,
      expenseRatio: 0,
      rating: 0,
      returns10Y: 0,
      sipMinimum: 500,
      lumpSumMinimum: 5000,
      exitLoad: "—",
      benchmark: "—",
      fundManager: "—",
      inceptionDate: "—",
    })) as MutualFundInfo[];
  } catch {
    return null;
  }
};

export const saveAmfiCache = (funds: MutualFundInfo[]): void => {
  if (!isBrowser()) return;
  try {
    const slim: CachedFund[] = funds.map((f) => ({
      schemeCode: f.schemeCode,
      schemeName: f.schemeName,
      category: f.category,
      subCategory: f.subCategory,
      fundHouse: f.fundHouse,
      plan: f.plan,
      nav: f.nav,
      returns1Y: f.returns1Y,
      returns3Y: f.returns3Y,
      returns5Y: f.returns5Y,
      riskLevel: f.riskLevel,
    }));
    const payload: CacheShape = { savedAt: Date.now(), funds: slim };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded or serialization issue — drop silently.
  }
};

export const clearAmfiCache = (): void => {
  if (!isBrowser()) return;
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
};
