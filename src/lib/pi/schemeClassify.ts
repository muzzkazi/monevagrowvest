import { inferFundHouse, inferSubCategory } from "@/lib/amfiSearch";
import type { AssetBucket, FundRole, PortfolioFund } from "./types";

/** Deterministic sub-category → asset bucket mapping. */
const BUCKET_BY_SUB: Record<string, AssetBucket> = {
  Liquid: "Debt",
  "Ultra Short Duration": "Debt",
  "Short Duration": "Debt",
  "Medium Duration": "Debt",
  "Long Duration": "Debt",
  "Corporate Bond": "Debt",
  Gilt: "Debt",
  "Banking & PSU": "Debt",
  "Aggressive Hybrid": "Hybrid",
  "Conservative Hybrid": "Hybrid",
  "Balanced Advantage": "Hybrid",
  "Multi Asset Allocation": "Hybrid",
  Arbitrage: "Hybrid",
};

/** Deterministic sub-category → portfolio role mapping. */
const ROLE_BY_SUB: Record<string, FundRole> = {
  "Large Cap": "Large Cap",
  "Large & Mid Cap": "Core",
  "Mid Cap": "Mid Cap",
  "Small Cap": "Small Cap",
  "Flexi Cap": "Flexi Cap",
  "Multi Cap": "Flexi Cap",
  ELSS: "Core",
  Value: "Diversifier",
  "Index Fund": "Core",
  Sectoral: "Sector",
  Liquid: "Debt",
  "Ultra Short Duration": "Debt",
  "Short Duration": "Debt",
  "Medium Duration": "Debt",
  "Long Duration": "Debt",
  "Corporate Bond": "Debt",
  Gilt: "Debt",
  "Banking & PSU": "Debt",
  "Aggressive Hybrid": "Hybrid",
  "Conservative Hybrid": "Hybrid",
  "Balanced Advantage": "Hybrid",
  "Multi Asset Allocation": "Hybrid",
  Arbitrage: "Hybrid",
};

export type SchemeClassification = {
  schemeName: string;
  schemeCode?: string;
  fundHouse: string;
  category: string;
  subCategory: string;
  assetBucket: AssetBucket;
  role: FundRole;
};

/**
 * Classify a scheme purely from its AMFI name — no guessing of figures, only
 * classification fields the advisor would otherwise type by hand.
 */
export const classifyScheme = (
  schemeName: string,
  schemeCode?: string | number,
): SchemeClassification => {
  const n = schemeName.toLowerCase();
  const subCategory = inferSubCategory(schemeName);

  let assetBucket: AssetBucket = BUCKET_BY_SUB[subCategory] ?? "Indian Equity";
  let role: FundRole = ROLE_BY_SUB[subCategory] ?? "Flexi Cap";

  // Name-level overrides that the sub-category cannot express.
  if (/\bgold\b/.test(n)) { assetBucket = "Gold"; role = "Gold"; }
  else if (/\bsilver\b/.test(n)) { assetBucket = "Silver"; role = "Silver"; }
  else if (/(nasdaq|us equity|u\.s\.|global|international|overseas|world|china|emerging market)/.test(n)) {
    assetBucket = "International Equity";
    role = /(emerging|china|asia)/.test(n) ? "International Emerging" : "International Developed";
  }

  const category =
    assetBucket === "Debt" ? "Debt"
      : assetBucket === "Hybrid" ? "Hybrid"
      : assetBucket === "Gold" || assetBucket === "Silver" ? "Commodity"
      : "Equity";

  return {
    schemeName,
    schemeCode: schemeCode === undefined ? undefined : String(schemeCode),
    fundHouse: inferFundHouse(schemeName),
    category,
    subCategory,
    assetBucket,
    role,
  };
};

/** Patch to apply on a holding when a scheme is picked from search. */
export const schemePatch = (
  schemeName: string,
  schemeCode?: string | number,
): Partial<PortfolioFund> & { schemeCode?: string } => {
  const c = classifyScheme(schemeName, schemeCode);
  return {
    schemeName: c.schemeName,
    schemeCode: c.schemeCode,
    fundHouse: c.fundHouse,
    category: c.category,
    subCategory: c.subCategory,
    assetBucket: c.assetBucket,
    role: c.role,
  };
};
