// Deterministic data-quality gate for Portfolio Intelligence.
//
// Two jobs:
//  1. Tell the advisor exactly which inputs are missing or stale, in plain words.
//  2. Decide whether a taxable switch may be recommended at all. A switch is
//     only ever allowed when the tax inputs are complete AND the NAV data
//     backing the analysis is present and fresh. Nothing is estimated here.

import { PortfolioFund } from "./types";
import { marginalSlab, treatmentOf } from "./tax";

export const NAV_STALE_WARNING_HOURS = 24;
export const NAV_STALE_BLOCK_HOURS = 168; // 7 days

export type IssueSeverity = "blocker" | "warning";
export type IssueArea = "NAV" | "Tax" | "Portfolio";

export interface DataQualityIssue {
  id: string;
  severity: IssueSeverity;
  area: IssueArea;
  message: string;
  fix: string;
}

export interface DataQualityReport {
  issues: DataQualityIssue[];
  blockers: DataQualityIssue[];
  warnings: DataQualityIssue[];
  /** True only when nothing blocks a taxable switch recommendation. */
  switchingAllowed: boolean;
  navAgeHours: number | null;
  navFreshness: "fresh" | "stale" | "expired" | "unknown";
  fundsWithoutNav: string[];
  taxInputsComplete: boolean;
}

export interface DataQualityInput {
  funds: PortfolioFund[];
  annualIncome: number;
  nav: {
    requestedCodes: string[];
    unavailable: string[];
    oldestFetchedAt: string | null;
    error?: string | null;
  };
  /** Injected in tests so the report is deterministic. */
  now?: Date;
}

const hoursSince = (iso: string, now: Date) =>
  Math.max(0, Math.round(((now.getTime() - new Date(iso).getTime()) / 3_600_000) * 10) / 10);

export const buildDataQualityReport = (input: DataQualityInput): DataQualityReport => {
  const now = input.now ?? new Date();
  const issues: DataQualityIssue[] = [];
  const funds = input.funds;

  /* ---------- Tax inputs ---------- */
  const slab = marginalSlab(input.annualIncome);
  if (!slab) {
    issues.push({
      id: "tax-income",
      severity: "blocker",
      area: "Tax",
      message: "Annual income is not captured, so the marginal slab rate cannot be derived.",
      fix: "Enter the client's annual income on step 1 (Client).",
    });
  }

  funds.forEach((f) => {
    const label = f.schemeName || "Unnamed scheme";
    const missing: string[] = [];
    if (!f.purchaseDate) missing.push("purchase date");
    if (!(f.investedAmount > 0)) missing.push("invested amount");
    if (!(f.currentValue > 0)) missing.push("current value");
    if (missing.length) {
      issues.push({
        id: `tax-holding-${f.id}`,
        severity: "blocker",
        area: "Tax",
        message: `${label}: missing ${missing.join(", ")} — holding period and gain cannot be computed.`,
        fix: "Complete the holding row on step 5 (Portfolio & SIP).",
      });
    }
    if (treatmentOf(f) === "Unknown") {
      issues.push({
        id: `tax-treatment-${f.id}`,
        severity: "blocker",
        area: "Tax",
        message: `${label}: the scheme's equity share is not derivable from the sub-category, so its tax treatment is unknown.`,
        fix: "Set a specific hybrid sub-category (e.g. Aggressive Hybrid, Balanced Advantage, Equity Savings, Arbitrage).",
      });
    }
  });

  /* ---------- NAV coverage and freshness ---------- */
  const fundsWithoutNav = funds
    .filter((f) => {
      const code = String((f as PortfolioFund & { schemeCode?: string }).schemeCode ?? "").trim();
      return !/^\d{1,8}$/.test(code) || input.nav.unavailable.includes(code);
    })
    .map((f) => f.schemeName || "Unnamed scheme");

  if (input.nav.error) {
    issues.push({
      id: "nav-error",
      severity: "blocker",
      area: "NAV",
      message: `NAV service error: ${input.nav.error}`,
      fix: "Retry the NAV refresh before acting on returns, risk metrics or switch pricing.",
    });
  }

  if (funds.length > 0 && fundsWithoutNav.length > 0) {
    issues.push({
      id: "nav-coverage",
      severity: "blocker",
      area: "NAV",
      message: `No usable NAV history for ${fundsWithoutNav.length} of ${funds.length} holding(s): ${fundsWithoutNav.join(", ")}.`,
      fix: "Add the AMFI scheme code for each holding, then refresh NAV data.",
    });
  }

  const navAgeHours = input.nav.oldestFetchedAt ? hoursSince(input.nav.oldestFetchedAt, now) : null;
  let navFreshness: DataQualityReport["navFreshness"] = "unknown";
  if (navAgeHours === null) {
    if (funds.length > 0) {
      issues.push({
        id: "nav-missing",
        severity: "warning",
        area: "NAV",
        message: "No NAV data has been loaded, so stress scenarios fall back to published asset-class assumptions.",
        fix: "Load NAV data to replace assumptions with measured fund behaviour.",
      });
    }
  } else if (navAgeHours > NAV_STALE_BLOCK_HOURS) {
    navFreshness = "expired";
    issues.push({
      id: "nav-expired",
      severity: "blocker",
      area: "NAV",
      message: `NAV data is ${Math.round(navAgeHours / 24)} day(s) old — too stale to price an exit or size a switch.`,
      fix: "Refresh NAV data.",
    });
  } else if (navAgeHours > NAV_STALE_WARNING_HOURS) {
    navFreshness = "stale";
    issues.push({
      id: "nav-stale",
      severity: "warning",
      area: "NAV",
      message: `NAV data was fetched ${navAgeHours} hours ago — returns and drawdowns may lag the market.`,
      fix: "Refresh NAV data for the latest published NAVs.",
    });
  } else {
    navFreshness = "fresh";
  }

  /* ---------- Portfolio completeness ---------- */
  if (funds.length === 0) {
    issues.push({
      id: "portfolio-empty",
      severity: "blocker",
      area: "Portfolio",
      message: "No holdings captured, so there is nothing to switch out of.",
      fix: "Add the client's existing schemes on step 5 (Portfolio & SIP).",
    });
  }

  const blockers = issues.filter((i) => i.severity === "blocker");
  const warnings = issues.filter((i) => i.severity === "warning");

  return {
    issues,
    blockers,
    warnings,
    switchingAllowed: blockers.length === 0,
    navAgeHours,
    navFreshness,
    fundsWithoutNav,
    taxInputsComplete: blockers.every((b) => b.area !== "Tax"),
  };
};
