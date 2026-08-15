// Deterministic Indian mutual-fund tax engine (Layer A).
//
// Hard rule: this module NEVER invents a missing input. If holding period,
// invested amount, current value or the client's marginal slab cannot be
// derived from captured data, it returns an `insufficient` result listing the
// exact missing inputs, and the UI renders "Insufficient current data".
//
// Rule set encoded (FY 2025-26, post Finance Act 2024/2025):
//  - Equity-oriented schemes (>=65% domestic equity):
//      holding < 12 months  -> STCG @ 20%
//      holding >= 12 months -> LTCG @ 12.5% above a ₹1,25,000 annual exemption
//  - Debt schemes bought on/after 01-Apr-2023 -> gains taxed at the marginal
//    slab rate regardless of holding period (no indexation).
//  - Debt schemes bought before 01-Apr-2023 -> < 24m slab, >= 24m @ 12.5%.
//  - Gold / Silver ETFs and FoFs (units bought on/after 01-Apr-2025):
//      < 12 months slab, >= 12 months @ 12.5%.
//  - Hybrid schemes follow their equity share; when the equity share of the
//    scheme is not known the engine refuses to guess.
//  - International equity funds are taxed as non-equity (debt) schemes.
//
// Surcharge is not modelled (it depends on total income composition) — that
// limitation is returned as an explicit assumption string, never silently.

import { AssetBucket, PortfolioFund } from "./types";

export const LTCG_EQUITY_EXEMPTION = 125000;
export const EQUITY_STCG_RATE = 20;
export const EQUITY_LTCG_RATE = 12.5;
export const SPECIAL_LTCG_RATE = 12.5;
const CESS = 0.04;

export type TaxTreatment = "Equity-oriented" | "Non-equity (slab)" | "Special rate asset" | "Unknown";

export interface SlabResult {
  marginalRatePct: number;
  effectiveRatePct: number; // including 4% cess
  band: string;
}

/** Marginal slab under the new regime, derived from captured annual income. */
export const marginalSlab = (annualIncome: number): SlabResult | null => {
  if (!Number.isFinite(annualIncome) || annualIncome <= 0) return null;
  const bands: Array<[number, number, string]> = [
    [400000, 0, "Up to ₹4L"],
    [800000, 5, "₹4L–₹8L"],
    [1200000, 10, "₹8L–₹12L"],
    [1600000, 15, "₹12L–₹16L"],
    [2000000, 20, "₹16L–₹20L"],
    [2400000, 25, "₹20L–₹24L"],
    [Infinity, 30, "Above ₹24L"],
  ];
  const hit = bands.find(([ceiling]) => annualIncome <= ceiling)!;
  return {
    marginalRatePct: hit[1],
    effectiveRatePct: +(hit[1] * (1 + CESS)).toFixed(2),
    band: hit[2],
  };
};

export const treatmentOf = (fund: PortfolioFund): TaxTreatment => {
  const bucket: AssetBucket = fund.assetBucket;
  if (bucket === "Indian Equity") return "Equity-oriented";
  if (bucket === "International Equity") return "Non-equity (slab)";
  if (bucket === "Debt" || bucket === "Cash") return "Non-equity (slab)";
  if (bucket === "Gold" || bucket === "Silver") return "Special rate asset";
  if (bucket === "Hybrid") {
    const sub = fund.subCategory.toLowerCase();
    // Only sub-categories whose SEBI definition mandates >=65% equity are
    // treated as equity-oriented. Anything else is not assumed.
    if (sub.includes("aggressive hybrid") || sub.includes("equity savings") || sub.includes("balanced advantage") || sub.includes("arbitrage")) {
      return "Equity-oriented";
    }
    return "Unknown";
  }
  return "Unknown";
};

export interface HoldingTax {
  fundId: string;
  schemeName: string;
  treatment: TaxTreatment;
  status: "computed" | "insufficient";
  missing: string[];
  holdingMonths: number | null;
  gain: number | null;
  gainPct: number | null;
  isLongTerm: boolean | null;
  ratePct: number | null;
  exemptionUsed: number;
  taxIfExitedFully: number | null;
  notes: string[];
}

const monthsBetween = (fromIso: string, to: Date) => {
  const from = new Date(fromIso);
  if (Number.isNaN(from.getTime())) return null;
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    (to.getDate() >= from.getDate() ? 0 : -1);
  return months < 0 ? null : months;
};

export interface TaxContext {
  annualIncome: number;
  /** Equity LTCG exemption already consumed elsewhere this financial year. */
  exemptionAlreadyUsed?: number;
  asOf?: Date;
}

/**
 * Per-holding tax position for a full exit. Consumes the shared ₹1.25L equity
 * LTCG exemption in the order funds are passed in, so totals never double-count it.
 */
export const computeHoldingTaxes = (funds: PortfolioFund[], ctx: TaxContext): HoldingTax[] => {
  const asOf = ctx.asOf ?? new Date();
  const slab = marginalSlab(ctx.annualIncome);
  let exemptionLeft = Math.max(0, LTCG_EQUITY_EXEMPTION - (ctx.exemptionAlreadyUsed ?? 0));

  return funds.map((f) => {
    const treatment = treatmentOf(f);
    const missing: string[] = [];
    const notes: string[] = [];

    if (!f.purchaseDate) missing.push("purchase date");
    if (!(f.investedAmount > 0)) missing.push("invested amount");
    if (!(f.currentValue > 0)) missing.push("current value");
    if (treatment === "Unknown") missing.push("scheme equity share (hybrid category not specific enough)");

    const holdingMonths = f.purchaseDate ? monthsBetween(f.purchaseDate, asOf) : null;
    if (f.purchaseDate && holdingMonths === null) missing.push("valid purchase date");

    const needsSlab = treatment === "Non-equity (slab)" || treatment === "Special rate asset";
    if (needsSlab && !slab) missing.push("annual income (needed for the slab rate)");

    if (missing.length) {
      return {
        fundId: f.id,
        schemeName: f.schemeName,
        treatment,
        status: "insufficient" as const,
        missing,
        holdingMonths,
        gain: null,
        gainPct: null,
        isLongTerm: null,
        ratePct: null,
        exemptionUsed: 0,
        taxIfExitedFully: null,
        notes: ["Insufficient current data — tax on exit not computed."],
      };
    }

    const gain = f.currentValue - f.investedAmount;
    const gainPct = +((gain / f.investedAmount) * 100).toFixed(1);
    const months = holdingMonths as number;

    let isLongTerm: boolean;
    let ratePct: number;

    if (treatment === "Equity-oriented") {
      isLongTerm = months >= 12;
      ratePct = isLongTerm ? EQUITY_LTCG_RATE : EQUITY_STCG_RATE;
    } else if (treatment === "Special rate asset") {
      isLongTerm = months >= 12;
      ratePct = isLongTerm ? SPECIAL_LTCG_RATE : (slab as SlabResult).marginalRatePct;
      notes.push("Gold/silver units are taxed at 12.5% only after 12 months (units acquired on/after 01-Apr-2025).");
    } else {
      const boughtAfterApr2023 = new Date(f.purchaseDate as string) >= new Date("2023-04-01");
      isLongTerm = boughtAfterApr2023 ? false : months >= 24;
      ratePct = boughtAfterApr2023
        ? (slab as SlabResult).marginalRatePct
        : isLongTerm
          ? SPECIAL_LTCG_RATE
          : (slab as SlabResult).marginalRatePct;
      notes.push(
        boughtAfterApr2023
          ? "Debt/non-equity units bought on/after 01-Apr-2023 are slab-taxed with no indexation, whatever the holding period."
          : "Grandfathered debt units — 12.5% applies beyond 24 months.",
      );
    }

    let taxable = Math.max(0, gain);
    let exemptionUsed = 0;
    if (treatment === "Equity-oriented" && isLongTerm && taxable > 0) {
      exemptionUsed = Math.min(exemptionLeft, taxable);
      exemptionLeft -= exemptionUsed;
      taxable -= exemptionUsed;
      if (exemptionUsed > 0) {
        notes.push(`₹${Math.round(exemptionUsed).toLocaleString("en-IN")} of the ₹1.25L equity LTCG exemption applied.`);
      }
    }

    if (gain < 0) notes.push("Holding is at a loss — an exit books a capital loss that can be set off, not a tax cost.");

    const tax = +(taxable * (ratePct / 100) * (1 + CESS)).toFixed(0);

    return {
      fundId: f.id,
      schemeName: f.schemeName,
      treatment,
      status: "computed" as const,
      missing: [],
      holdingMonths: months,
      gain: +gain.toFixed(0),
      gainPct,
      isLongTerm,
      ratePct,
      exemptionUsed: Math.round(exemptionUsed),
      taxIfExitedFully: tax,
      notes,
    };
  });
};

export type SwitchVerdict =
  | "Redirect SIP instead"
  | "Switch now"
  | "Stagger the switch"
  | "Wait for long-term"
  | "Insufficient current data";

export interface SwitchOption {
  fundId: string;
  schemeName: string;
  reason: string; // why an exit is on the table at all (from the engine, never invented)
  amountConsidered: number;
  verdict: SwitchVerdict;
  taxCost: number | null;
  taxCostPctOfAmount: number | null;
  monthsToLongTerm: number | null;
  sipRedirectionAlternative: string;
  rationale: string[];
}

export interface SwitchPlan {
  asOf: string;
  slab: SlabResult | null;
  exemptionRemaining: number;
  options: SwitchOption[];
  totalTaxIfAllSwitched: number | null;
  assumptions: string[];
  dataGaps: string[];
}

/**
 * Tax-aware switch plan. Candidates come only from the engine's own overweight /
 * redundancy / concentration findings — this function never decides on its own
 * that a fund is "bad", it only prices the exit and compares it with the
 * zero-tax alternative of redirecting future SIP instalments.
 */
export const buildSwitchPlan = (
  funds: PortfolioFund[],
  candidates: Array<{ fundId: string; reason: string; amount?: number }>,
  ctx: TaxContext,
): SwitchPlan => {
  const taxes = computeHoldingTaxes(funds, ctx);
  const byId = new Map(taxes.map((t) => [t.fundId, t]));
  const fundById = new Map(funds.map((f) => [f.id, f]));
  const slab = marginalSlab(ctx.annualIncome);

  const options: SwitchOption[] = candidates.map((c) => {
    const fund = fundById.get(c.fundId);
    const tax = byId.get(c.fundId);
    const amount = c.amount ?? fund?.currentValue ?? 0;

    if (!fund || !tax || tax.status === "insufficient") {
      return {
        fundId: c.fundId,
        schemeName: fund?.schemeName ?? c.fundId,
        reason: c.reason,
        amountConsidered: amount,
        verdict: "Insufficient current data",
        taxCost: null,
        taxCostPctOfAmount: null,
        monthsToLongTerm: null,
        sipRedirectionAlternative:
          "Redirect future SIP instalments away from this fund — that has no tax impact and needs no additional data.",
        rationale: [
          `Cannot price the exit: missing ${tax?.missing.join(", ") ?? "holding data"}.`,
          "Capture the missing inputs before recommending a switch.",
        ],
      };
    }

    const share = fund.currentValue > 0 ? Math.min(1, amount / fund.currentValue) : 0;
    const taxCost = Math.round((tax.taxIfExitedFully ?? 0) * share);
    const taxPct = amount > 0 ? +((taxCost / amount) * 100).toFixed(2) : 0;
    const monthsToLongTerm =
      tax.isLongTerm === false && tax.treatment !== "Non-equity (slab)"
        ? Math.max(0, 12 - (tax.holdingMonths ?? 0))
        : null;

    const rationale: string[] = [
      `Exit reason from the engine: ${c.reason}`,
      tax.gain !== null && tax.gain < 0
        ? `Holding is ₹${Math.abs(tax.gain).toLocaleString("en-IN")} below cost — exiting books a set-offable loss, not a tax bill.`
        : `Gain of ₹${(tax.gain ?? 0).toLocaleString("en-IN")} taxed at ${tax.ratePct}% (${tax.isLongTerm ? "long term" : "short term"}) plus 4% cess.`,
      ...tax.notes,
    ];

    let verdict: SwitchVerdict;
    if ((tax.gain ?? 0) <= 0) {
      verdict = "Switch now";
      rationale.push("No tax leakage, so there is no reason to delay the correction.");
    } else if (taxPct <= 1) {
      verdict = "Switch now";
      rationale.push(`Tax cost is only ${taxPct}% of the amount moved — cheaper than carrying the misallocation.`);
    } else if (monthsToLongTerm !== null && monthsToLongTerm <= 6) {
      verdict = "Wait for long-term";
      rationale.push(`${monthsToLongTerm} month(s) short of long-term treatment; waiting cuts the rate from ${tax.ratePct}% to ${EQUITY_LTCG_RATE}%.`);
    } else if (taxPct <= 4) {
      verdict = "Stagger the switch";
      rationale.push("Split the exit across financial years to reuse the ₹1.25L exemption and keep the tax drag low.");
    } else {
      verdict = "Redirect SIP instead";
      rationale.push(`Tax cost of ${taxPct}% of the amount is high — fix the allocation through contribution flow, not a switch.`);
    }

    return {
      fundId: c.fundId,
      schemeName: fund.schemeName,
      reason: c.reason,
      amountConsidered: Math.round(amount),
      verdict,
      taxCost,
      taxCostPctOfAmount: taxPct,
      monthsToLongTerm,
      sipRedirectionAlternative: `Stop or reduce the ₹${fund.sipAmount.toLocaleString("en-IN")}/month SIP here and route it to the largest underweight bucket — zero tax event.`,
      rationale,
    };
  });

  const priced = options.filter((o) => o.taxCost !== null);
  const dataGaps = options
    .filter((o) => o.verdict === "Insufficient current data")
    .map((o) => `${o.schemeName}: exit tax not computable from captured data.`);

  return {
    asOf: new Date().toISOString(),
    slab,
    exemptionRemaining: Math.max(0, LTCG_EQUITY_EXEMPTION - (ctx.exemptionAlreadyUsed ?? 0)),
    options,
    totalTaxIfAllSwitched: priced.length ? priced.reduce((s, o) => s + (o.taxCost ?? 0), 0) : null,
    assumptions: [
      "Rates are FY 2025-26 statutory rates; surcharge on high total income is not modelled.",
      "Marginal slab is derived from the captured annual income under the new regime.",
      "The ₹1.25L equity LTCG exemption is applied once across the whole portfolio, in the order shown.",
      "Exit load and stamp duty are not included — check the scheme document before executing.",
    ],
    dataGaps,
  };
};
