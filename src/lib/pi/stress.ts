// Deterministic stress testing.
//
// Two modes, and the mode is always reported:
//  - "computed"    : every equity/debt bucket in the portfolio has real NAV
//                    history, so shocks are driven by the observed worst
//                    rolling 1-year return and max drawdown of the actual funds.
//  - "assumption"  : NAV history is missing for at least one bucket, so the
//                    scenario uses the published asset-class shock set below.
//                    These are labelled as assumptions, never as measurements.

import { AllocationRow, AssetBucket } from "./types";
import { NavMetrics } from "./navMetrics";

export type ScenarioKey = "base" | "downside" | "upside" | "severe";

export interface ScenarioDefinition {
  key: ScenarioKey;
  label: string;
  description: string;
}

export const SCENARIOS: ScenarioDefinition[] = [
  { key: "base", label: "Base", description: "Long-run average behaviour of each asset class over one year." },
  { key: "downside", label: "Downside", description: "A normal bad year — a correction without a systemic crisis." },
  { key: "upside", label: "Upside", description: "A strong year, of the kind that follows a recovery." },
  { key: "severe", label: "Severe drawdown", description: "A 2008/2020-style shock measured peak to trough." },
];

/** Asset-class shock set used only when real NAV history is unavailable. */
const ASSUMED_SHOCKS: Record<AssetBucket, Record<ScenarioKey, number>> = {
  "Indian Equity": { base: 11, downside: -20, upside: 28, severe: -45 },
  "International Equity": { base: 9, downside: -18, upside: 24, severe: -40 },
  Debt: { base: 7, downside: -2, upside: 10, severe: -6 },
  Hybrid: { base: 9, downside: -10, upside: 16, severe: -25 },
  Gold: { base: 8, downside: -8, upside: 20, severe: 5 },
  Silver: { base: 8, downside: -15, upside: 30, severe: -10 },
  Cash: { base: 6, downside: 6, upside: 6, severe: 6 },
};

export interface BucketImpact {
  bucket: AssetBucket;
  weightPct: number;
  shockPct: number;
  valueChange: number;
  source: "computed" | "assumption";
}

export interface ScenarioResult {
  key: ScenarioKey;
  label: string;
  description: string;
  portfolioReturnPct: number;
  endValue: number;
  valueChange: number;
  buckets: BucketImpact[];
  basis: "computed" | "assumption" | "mixed";
  recoveryNote: string;
  goalNote: string | null;
}

export interface StressInput {
  allocation: AllocationRow[];
  portfolioValue: number;
  monthlySip: number;
  /** Real metrics keyed by asset bucket, aggregated from the funds in that bucket. */
  bucketMetrics?: Partial<Record<AssetBucket, NavMetrics[]>>;
  /** Nearest essential goal in years, used for the recovery commentary. */
  nearestEssentialGoalYears?: number | null;
}

export interface StressOutput {
  asOf: string;
  basis: "computed" | "assumption" | "mixed";
  scenarios: ScenarioResult[];
  notes: string[];
  dataGaps: string[];
}

const weightedShockFromMetrics = (metrics: NavMetrics[], key: ScenarioKey): number | null => {
  const usable = metrics.filter((m) => m.observations >= 30);
  if (!usable.length) return null;

  const pick = (m: NavMetrics): number | null => {
    switch (key) {
      case "base":
        return m.return3yCagrPct ?? m.return1yPct;
      case "downside":
        return m.worst1yPct;
      case "upside":
        return m.best1yPct;
      case "severe":
        return m.maxDrawdownPct;
    }
  };

  const vals = usable.map(pick).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
};

export const runStressTest = (input: StressInput): StressOutput => {
  const { allocation, portfolioValue, monthlySip, bucketMetrics, nearestEssentialGoalYears } = input;
  const dataGaps: string[] = [];
  let anyComputed = false;
  let anyAssumed = false;

  const scenarios: ScenarioResult[] = SCENARIOS.map((def) => {
    const buckets: BucketImpact[] = allocation
      .filter((row) => row.currentPct > 0)
      .map((row) => {
        const metrics = bucketMetrics?.[row.bucket] ?? [];
        const computed = weightedShockFromMetrics(metrics, def.key);
        const shockPct = computed ?? ASSUMED_SHOCKS[row.bucket][def.key];
        if (computed !== null) anyComputed = true;
        else {
          anyAssumed = true;
          const gap = `${row.bucket}: no usable NAV history — ${def.label.toLowerCase()} shock uses the published asset-class assumption.`;
          if (!dataGaps.includes(gap)) dataGaps.push(gap);
        }
        return {
          bucket: row.bucket,
          weightPct: row.currentPct,
          shockPct,
          valueChange: +((portfolioValue * (row.currentPct / 100) * shockPct) / 100).toFixed(0),
          source: (computed !== null ? "computed" : "assumption") as "computed" | "assumption",
        };
      });

    const valueChange = buckets.reduce((s, b) => s + b.valueChange, 0);
    const portfolioReturnPct = portfolioValue > 0 ? +((valueChange / portfolioValue) * 100).toFixed(2) : 0;
    const basis: ScenarioResult["basis"] = buckets.length === 0
      ? "assumption"
      : buckets.every((b) => b.source === "computed")
        ? "computed"
        : buckets.every((b) => b.source === "assumption")
          ? "assumption"
          : "mixed";

    const monthsToRecover =
      valueChange < 0 && monthlySip > 0 ? Math.ceil(Math.abs(valueChange) / monthlySip) : 0;

    const recoveryNote =
      valueChange >= 0
        ? "No recovery needed in this scenario."
        : monthlySip > 0
          ? `Ongoing SIP of ₹${monthlySip.toLocaleString("en-IN")}/month replaces the fall in about ${monthsToRecover} month(s) of contributions, before any market rebound.`
          : "No ongoing SIP captured, so recovery depends entirely on market rebound.";

    const goalNote =
      nearestEssentialGoalYears != null && valueChange < 0
        ? nearestEssentialGoalYears <= 3
          ? `Nearest essential goal is ${nearestEssentialGoalYears} year(s) away — a fall of this size would not have time to recover. Reduce equity for that goal's corpus.`
          : `Nearest essential goal is ${nearestEssentialGoalYears} years away, which leaves room for a recovery.`
        : null;

    return {
      key: def.key,
      label: def.label,
      description: def.description,
      portfolioReturnPct,
      endValue: Math.round(portfolioValue + valueChange),
      valueChange: Math.round(valueChange),
      buckets,
      basis,
      recoveryNote,
      goalNote,
    };
  });

  const basis: StressOutput["basis"] =
    anyComputed && anyAssumed ? "mixed" : anyComputed ? "computed" : "assumption";

  return {
    asOf: new Date().toISOString(),
    basis,
    scenarios,
    notes: [
      "Scenarios apply a one-year shock to the current allocation. They are not forecasts and no probability is attached.",
      "Where a bucket has real NAV history, the downside uses the worst observed rolling 1-year return and the severe case uses the observed max drawdown of the actual funds held.",
      "Ongoing SIP instalments are treated as unchanged through the shock.",
    ],
    dataGaps,
  };
};
