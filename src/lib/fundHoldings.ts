// Deterministic synthetic holdings for mutual funds.
// Real holdings APIs require AMFI scheme-wise disclosures which aren't wired yet.
// We generate stable, realistic-looking holdings keyed off schemeCode + subCategory
// so that overlap calculations are consistent across renders and meaningfully differ
// across funds in the same / different categories.

import { MutualFundInfo } from "@/data/mutualFundDatabase";

export interface Holding {
  symbol: string;
  name: string;
  sector: string;
  weight: number; // percentage
}

// Stock pools by category — overlap is naturally higher within the same pool.
const STOCK_POOLS: Record<string, Array<Omit<Holding, "weight">>> = {
  "Large Cap": [
    { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy" },
    { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Financials" },
    { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Financials" },
    { symbol: "INFY", name: "Infosys", sector: "IT" },
    { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom" },
    { symbol: "ITC", name: "ITC Ltd", sector: "FMCG" },
    { symbol: "LT", name: "Larsen & Toubro", sector: "Construction" },
    { symbol: "AXISBANK", name: "Axis Bank", sector: "Financials" },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Financials" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG" },
    { symbol: "SBIN", name: "State Bank of India", sector: "Financials" },
    { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto" },
    { symbol: "ASIANPAINT", name: "Asian Paints", sector: "Consumer" },
    { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Healthcare" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Financials" },
    { symbol: "TITAN", name: "Titan Company", sector: "Consumer" },
    { symbol: "ULTRACEMCO", name: "UltraTech Cement", sector: "Cement" },
    { symbol: "NESTLEIND", name: "Nestle India", sector: "FMCG" },
    { symbol: "WIPRO", name: "Wipro", sector: "IT" },
  ],
  "Mid Cap": [
    { symbol: "PIIND", name: "PI Industries", sector: "Chemicals" },
    { symbol: "TVSMOTOR", name: "TVS Motor Company", sector: "Auto" },
    { symbol: "MPHASIS", name: "Mphasis", sector: "IT" },
    { symbol: "CUMMINSIND", name: "Cummins India", sector: "Industrials" },
    { symbol: "PERSISTENT", name: "Persistent Systems", sector: "IT" },
    { symbol: "TRENT", name: "Trent Ltd", sector: "Retail" },
    { symbol: "AUROPHARMA", name: "Aurobindo Pharma", sector: "Healthcare" },
    { symbol: "VOLTAS", name: "Voltas Ltd", sector: "Consumer Durables" },
    { symbol: "FEDERALBNK", name: "Federal Bank", sector: "Financials" },
    { symbol: "BHARATFORG", name: "Bharat Forge", sector: "Auto Anc" },
    { symbol: "ASHOKLEY", name: "Ashok Leyland", sector: "Auto" },
    { symbol: "JUBLFOOD", name: "Jubilant FoodWorks", sector: "Consumer" },
    { symbol: "POLYCAB", name: "Polycab India", sector: "Cap Goods" },
    { symbol: "COFORGE", name: "Coforge", sector: "IT" },
    { symbol: "MAXHEALTH", name: "Max Healthcare", sector: "Healthcare" },
    { symbol: "INDIANB", name: "Indian Bank", sector: "Financials" },
    { symbol: "LUPIN", name: "Lupin", sector: "Healthcare" },
    { symbol: "ASTRAL", name: "Astral Ltd", sector: "Industrials" },
  ],
  "Small Cap": [
    { symbol: "KPITTECH", name: "KPIT Technologies", sector: "IT" },
    { symbol: "CDSL", name: "Central Depository Services", sector: "Financials" },
    { symbol: "BSE", name: "BSE Ltd", sector: "Financials" },
    { symbol: "RADICO", name: "Radico Khaitan", sector: "Consumer" },
    { symbol: "AMBER", name: "Amber Enterprises", sector: "Cap Goods" },
    { symbol: "CYIENT", name: "Cyient", sector: "IT" },
    { symbol: "BLUEDART", name: "Blue Dart Express", sector: "Logistics" },
    { symbol: "JBCHEPHARM", name: "JB Chemicals", sector: "Healthcare" },
    { symbol: "SONATSOFTW", name: "Sonata Software", sector: "IT" },
    { symbol: "RATNAMANI", name: "Ratnamani Metals", sector: "Metals" },
    { symbol: "NH", name: "Narayana Hrudayalaya", sector: "Healthcare" },
    { symbol: "CARBORUNIV", name: "Carborundum Universal", sector: "Industrials" },
    { symbol: "BIRLASOFT", name: "Birlasoft", sector: "IT" },
    { symbol: "GRINDWELL", name: "Grindwell Norton", sector: "Industrials" },
    { symbol: "TIMKEN", name: "Timken India", sector: "Industrials" },
    { symbol: "NAVNETEDUL", name: "Navneet Education", sector: "Consumer" },
  ],
  ELSS: [
    { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Financials" },
    { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Financials" },
    { symbol: "INFY", name: "Infosys", sector: "IT" },
    { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Financials" },
    { symbol: "AVENUE", name: "Avenue Supermarts", sector: "Retail" },
    { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
    { symbol: "AXISBANK", name: "Axis Bank", sector: "Financials" },
    { symbol: "TITAN", name: "Titan Company", sector: "Consumer" },
    { symbol: "LT", name: "Larsen & Toubro", sector: "Construction" },
    { symbol: "PIIND", name: "PI Industries", sector: "Chemicals" },
    { symbol: "TRENT", name: "Trent Ltd", sector: "Retail" },
    { symbol: "PERSISTENT", name: "Persistent Systems", sector: "IT" },
    { symbol: "NESTLEIND", name: "Nestle India", sector: "FMCG" },
  ],
  "Index Fund": [
    { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy" },
    { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Financials" },
    { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Financials" },
    { symbol: "INFY", name: "Infosys", sector: "IT" },
    { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom" },
    { symbol: "ITC", name: "ITC Ltd", sector: "FMCG" },
    { symbol: "LT", name: "Larsen & Toubro", sector: "Construction" },
    { symbol: "AXISBANK", name: "Axis Bank", sector: "Financials" },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Financials" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG" },
    { symbol: "SBIN", name: "State Bank of India", sector: "Financials" },
    { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto" },
  ],
};

const FALLBACK_POOL = STOCK_POOLS["Large Cap"];

const getPoolForFund = (fund: MutualFundInfo): Array<Omit<Holding, "weight">> => {
  const subPool = STOCK_POOLS[fund.subCategory];
  if (subPool) return subPool;
  // Flexi/Multi cap blend large + mid
  if (["Flexi Cap", "Multi Cap", "Large & Mid Cap", "Value"].includes(fund.subCategory)) {
    return [...STOCK_POOLS["Large Cap"], ...STOCK_POOLS["Mid Cap"].slice(0, 8)];
  }
  return FALLBACK_POOL;
};

// Mulberry32 — fast deterministic PRNG.
const mulberry32 = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const seedFrom = (schemeCode: string): number => {
  let h = 2166136261;
  for (let i = 0; i < schemeCode.length; i++) {
    h ^= schemeCode.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
};

export const getFundHoldings = (fund: MutualFundInfo, count = 12): Holding[] => {
  const pool = getPoolForFund(fund);
  const rand = mulberry32(seedFrom(fund.schemeCode));

  // Shuffle pool deterministically, then pick first `count`.
  const shuffled = [...pool].sort(() => rand() - 0.5);
  const picks = shuffled.slice(0, Math.min(count, shuffled.length));

  // Weights: top stock 8-10%, decay to ~2%. Normalize so total <= ~70% (rest = others).
  const rawWeights = picks.map((_, i) => {
    const base = 9 - i * 0.55;
    const jitter = rand() * 1.2 - 0.6;
    return Math.max(1.5, base + jitter);
  });
  const sum = rawWeights.reduce((a, b) => a + b, 0);
  const targetTotal = 65 + rand() * 10; // 65-75% top holdings
  const scale = targetTotal / sum;

  return picks
    .map((p, i) => ({ ...p, weight: +(rawWeights[i] * scale).toFixed(2) }))
    .sort((a, b) => b.weight - a.weight);
};

export interface OverlapResult {
  commonStocks: Array<{
    symbol: string;
    name: string;
    sector: string;
    weights: number[]; // weight in each fund (0 if absent)
    minWeight: number; // for overlap %
  }>;
  overlapPercent: number; // 0-100, sum of min weights
  fundACount: number;
  fundBCount: number;
}

export const calculateOverlap = (
  fundA: MutualFundInfo,
  fundB: MutualFundInfo,
): OverlapResult => {
  const holdingsA = getFundHoldings(fundA);
  const holdingsB = getFundHoldings(fundB);
  const mapB = new Map(holdingsB.map((h) => [h.symbol, h]));

  const common = holdingsA
    .filter((h) => mapB.has(h.symbol))
    .map((h) => {
      const b = mapB.get(h.symbol)!;
      return {
        symbol: h.symbol,
        name: h.name,
        sector: h.sector,
        weights: [h.weight, b.weight],
        minWeight: Math.min(h.weight, b.weight),
      };
    })
    .sort((a, b) => b.minWeight - a.minWeight);

  const overlapPercent = +common.reduce((sum, c) => sum + c.minWeight, 0).toFixed(1);

  return {
    commonStocks: common,
    overlapPercent,
    fundACount: holdingsA.length,
    fundBCount: holdingsB.length,
  };
};
