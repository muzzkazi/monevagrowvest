// Layer B input contract for FUND-SELECTION COMMENTARY.
// Same guardrail as aiFacts: built exclusively from deterministic engine output
// plus the advisor's captured inputs. The AI may interpret these facts and must
// never compute a figure or name a fund that is not listed here.

import { EngineOutput, Goal, PortfolioFund, Constraints } from "@/lib/pi/types";

export interface FundFact {
  schemeName: string;
  fundHouse: string;
  category: string;
  subCategory: string;
  assetBucket: string;
  role: string;
  currentValue: number;
  weightPct: number;
  investedAmount: number;
  currentSip: number;
  recommendedSip: number | null;
  sipChange: number | null;
  action: string | null;
  engineWhy: string | null;
  confidence: string | null;
  bucketGapPct: number | null;
  concentrationFlags: Array<{ label: string; pct: number; severity: string; note: string }>;
  duplicateRolePeers: string[];
}

export interface FundSelectionFacts {
  runName: string;
  asOf: string;
  assumedReturnPct: number;
  riskProfile: string;
  equityRangeLowPct: number;
  equityRangeHighPct: number;
  bindingConstraint: string;
  constraints: {
    shariah: string;
    geography: string;
    excludedSectors: string[];
    esg: boolean;
    taxSaving: boolean;
    incomeNeed: boolean;
    capitalPreservation: boolean;
  };
  goals: Array<{
    name: string;
    category: string;
    targetYear: number;
    yearsToGoal: number;
    horizonClass: string;
    essential: boolean;
    fundedPct: number;
    fundingGap: number;
  }>;
  allocation: Array<{ bucket: string; currentPct: number; targetPct: number; gapPct: number }>;
  funds: FundFact[];
  dataFlags: string[];
  switchingAllowed: boolean;
  blockers: string[];
}

const r = (n: number, dp = 0) => {
  const v = Number.isFinite(n) ? n : 0;
  const f = Math.pow(10, dp);
  return Math.round(v * f) / f;
};

export const buildFundSelectionFacts = ({
  runName,
  assumedReturnPct,
  funds,
  goals,
  constraints,
  output,
  switchingAllowed,
  blockers,
}: {
  runName: string;
  assumedReturnPct: number;
  funds: PortfolioFund[];
  goals: Goal[];
  constraints: Constraints;
  output: EngineOutput;
  switchingAllowed: boolean;
  blockers: string[];
}): FundSelectionFacts => {
  const total = output.totals.currentValue || 0;
  const goalMathByName = new Map(output.goals.map((g) => [g.goal.id, g]));

  return {
    runName,
    asOf: output.asOf,
    assumedReturnPct: r(assumedReturnPct, 1),
    riskProfile: output.risk.finalProfile,
    equityRangeLowPct: r(output.risk.equityRange[0]),
    equityRangeHighPct: r(output.risk.equityRange[1]),
    bindingConstraint: output.risk.bindingConstraint,
    constraints: {
      shariah: constraints.shariah,
      geography: constraints.geography,
      excludedSectors: constraints.excludedSectors,
      esg: constraints.esg,
      taxSaving: constraints.taxSaving,
      incomeNeed: constraints.incomeNeed,
      capitalPreservation: constraints.capitalPreservation,
    },
    goals: goals.map((g) => {
      const m = goalMathByName.get(g.id);
      return {
        name: g.name || g.category,
        category: g.category,
        targetYear: g.targetYear,
        yearsToGoal: r(m?.yearsToGoal ?? 0, 1),
        horizonClass: m?.horizonClass ?? "Not assessable",
        essential: g.essential,
        fundedPct: r(m?.fundedPct ?? 0),
        fundingGap: r(m?.fundingGap ?? 0),
      };
    }),
    allocation: output.allocation.map((a) => ({
      bucket: a.bucket,
      currentPct: r(a.currentPct, 1),
      targetPct: r(a.targetPct, 1),
      gapPct: r(a.gapPct, 1),
    })),
    funds: funds.map((f) => {
      const action = output.sipPlan.find((a) => a.fundId === f.id) ?? null;
      const bucket = output.allocation.find((a) => a.bucket === f.assetBucket) ?? null;
      return {
        schemeName: f.schemeName,
        fundHouse: f.fundHouse,
        category: f.category,
        subCategory: f.subCategory,
        assetBucket: String(f.assetBucket),
        role: String(f.role),
        currentValue: r(f.currentValue),
        weightPct: total > 0 ? r((f.currentValue / total) * 100, 1) : 0,
        investedAmount: r(f.investedAmount),
        currentSip: r(f.sipAmount),
        recommendedSip: action ? r(action.recommendedSip) : null,
        sipChange: action ? r(action.change) : null,
        action: action?.action ?? null,
        engineWhy: action?.why ?? null,
        confidence: action?.confidence ?? null,
        bucketGapPct: bucket ? r(bucket.gapPct, 1) : null,
        concentrationFlags: output.concentration
          .filter((c) => c.label === f.schemeName)
          .map((c) => ({ label: c.label, pct: r(c.pct, 1), severity: c.severity, note: c.note })),
        duplicateRolePeers: output.redundancy
          .filter((x) => x.funds.includes(f.schemeName))
          .flatMap((x) => x.funds.filter((n) => n !== f.schemeName)),
      };
    }),
    dataFlags: output.dataFlags,
    switchingAllowed,
    blockers,
  };
};
