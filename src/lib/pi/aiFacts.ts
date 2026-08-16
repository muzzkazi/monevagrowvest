// Layer B input contract.
// The AI advisor layer NEVER computes. It receives this read-only fact sheet,
// built exclusively from deterministic engine output, and may only interpret it.
// Any figure that appears in AI text must already exist here — verifyNarrativeNumbers
// enforces that, so hallucinated numbers are surfaced instead of shipped to a client.

import { DataQualityReport } from "@/lib/pi/dataQuality";
import { StressOutput } from "@/lib/pi/stress";
import { EngineOutput } from "@/lib/pi/types";
import { PiRunInputs } from "@/lib/pi/runs";

export interface NarrativeFacts {
  runName: string;
  asOf: string;
  assumedReturnPct: number;
  client: {
    name: string;
    age: number;
    dependents: number;
    annualIncome: number;
    monthlySurplus: number;
  };
  risk: {
    finalProfile: string;
    bindingConstraint: string;
    toleranceScore: number;
    capacityScore: number;
    needScore: number;
    equityRangeLowPct: number;
    equityRangeHighPct: number;
    notes: string[];
  };
  totals: EngineOutput["totals"];
  scores: {
    fitScore: number;
    complexityScore: number;
    complexityBand: string;
    fitBreakdown: Array<{ label: string; score: number }>;
  };
  allocation: Array<{ bucket: string; currentPct: number; targetPct: number; gapPct: number }>;
  goals: Array<{
    name: string;
    category: string;
    targetYear: number;
    yearsToGoal: number;
    futureCost: number;
    projectedCorpus: number;
    fundingGap: number;
    fundedPct: number;
    essential: boolean;
  }>;
  concentration: Array<{ label: string; pct: number; severity: string; note: string }>;
  redundancy: Array<{ role: string; funds: string[]; note: string }>;
  sipPlan: Array<{
    schemeName: string;
    role: string;
    action: string;
    currentSip: number;
    recommendedSip: number;
    change: number;
    currentWeightPct: number;
    why: string;
    confidence: string;
  }>;
  stress: {
    basis: string;
    scenarios: Array<{
      scenario: string;
      description: string;
      portfolioReturnPct: number;
      endValue: number;
      valueChange: number;
      basis: string;
      recoveryNote: string;
      goalNote: string | null;
    }>;
    dataGaps: string[];
  } | null;
  dataQuality: {
    navFreshness: string;
    navAgeHours: number | null;
    taxInputsComplete: boolean;
    switchingAllowed: boolean;
    blockers: string[];
  };
  dataFlags: string[];
  integrity: string[];
}

const r = (n: number, dp = 0) => {
  const v = Number.isFinite(n) ? n : 0;
  const f = Math.pow(10, dp);
  return Math.round(v * f) / f;
};

export const buildNarrativeFacts = ({
  runName,
  inputs,
  assumedReturnPct,
  output,
  quality,
  stress,
}: {
  runName: string;
  inputs: PiRunInputs;
  assumedReturnPct: number;
  output: EngineOutput;
  quality: DataQualityReport;
  stress: StressOutput | null;
}): NarrativeFacts => {
  const p = inputs.profile;
  return {
    runName,
    asOf: output.asOf,
    assumedReturnPct: r(assumedReturnPct, 1),
    client: {
      name: p.clientName || "Client",
      age: r(p.age),
      dependents: r(p.dependents),
      annualIncome: r(p.annualIncome),
      monthlySurplus: r((p.monthlyIncome || 0) - (p.monthlyExpenses || 0) - (p.monthlyEmi || 0)),
    },
    risk: {
      finalProfile: output.risk.finalProfile,
      bindingConstraint: output.risk.bindingConstraint,
      toleranceScore: r(output.risk.tolerance.score),
      capacityScore: r(output.risk.capacity.score),
      needScore: r(output.risk.need.score),
      equityRangeLowPct: r(output.risk.equityRange[0]),
      equityRangeHighPct: r(output.risk.equityRange[1]),
      notes: output.risk.notes,
    },
    totals: {
      currentValue: r(output.totals.currentValue),
      invested: r(output.totals.invested),
      currentSip: r(output.totals.currentSip),
      additionalSip: r(output.totals.additionalSip),
      totalOtherAssets: r(output.totals.totalOtherAssets),
    },
    scores: {
      fitScore: r(output.scores.fitScore),
      complexityScore: r(output.scores.complexityScore),
      complexityBand: output.scores.complexityBand,
      fitBreakdown: output.scores.fitBreakdown.map((b) => ({ label: b.label, score: r(b.score) })),
    },
    allocation: output.allocation.map((a) => ({
      bucket: a.bucket,
      currentPct: r(a.currentPct, 1),
      targetPct: r(a.targetPct, 1),
      gapPct: r(a.gapPct, 1),
    })),
    goals: output.goals.map((g) => ({
      name: g.goal.name || g.goal.category,
      category: g.goal.category,
      targetYear: g.goal.targetYear,
      yearsToGoal: r(g.yearsToGoal, 1),
      futureCost: r(g.futureCost),
      projectedCorpus: r(g.projectedCorpus),
      fundingGap: r(g.fundingGap),
      fundedPct: r(g.fundedPct),
      essential: g.goal.essential,
    })),
    concentration: output.concentration.map((c) => ({
      label: c.label,
      pct: r(c.pct, 1),
      severity: c.severity,
      note: c.note,
    })),
    redundancy: output.redundancy.map((x) => ({ role: String(x.role), funds: x.funds, note: x.note })),
    sipPlan: output.sipPlan.map((a) => ({
      schemeName: a.schemeName,
      role: String(a.role),
      action: a.action,
      currentSip: r(a.currentSip),
      recommendedSip: r(a.recommendedSip),
      change: r(a.change),
      currentWeightPct: r(a.currentWeightPct, 1),
      why: a.why,
      confidence: a.confidence,
    })),
    stress: stress
      ? {
          basis: stress.basis,
          scenarios: stress.scenarios.map((s) => ({
            scenario: s.label,
            description: s.description,
            portfolioReturnPct: r(s.portfolioReturnPct, 2),
            endValue: r(s.endValue),
            valueChange: r(s.valueChange),
            basis: s.basis,
            recoveryNote: s.recoveryNote,
            goalNote: s.goalNote,
          })),
          dataGaps: stress.dataGaps,
        }
      : null,
    dataQuality: {
      navFreshness: quality.navFreshness,
      navAgeHours: quality.navAgeHours,
      taxInputsComplete: quality.taxInputsComplete,
      switchingAllowed: quality.switchingAllowed,
      blockers: (quality.blockers ?? []).map((b) => `${b.area}: ${b.message}`),
    },
    dataFlags: output.dataFlags,
    integrity: output.integrity,
  };
};

/* ---------------- numeric guardrail ---------------- */

const walkNumbers = (value: unknown, sink: Set<number>) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    sink.add(value);
    sink.add(Math.round(value));
    sink.add(Math.round(value * 10) / 10);
    // Advisors read large amounts in lakh/crore — allow those restatements.
    if (Math.abs(value) >= 100000) {
      sink.add(Math.round((value / 100000) * 10) / 10);
      sink.add(Math.round(value / 100000));
    }
    if (Math.abs(value) >= 10000000) {
      sink.add(Math.round((value / 10000000) * 10) / 10);
      sink.add(Math.round(value / 10000000));
    }
    if (Math.abs(value) >= 1000) {
      sink.add(Math.round(value / 1000));
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => walkNumbers(v, sink));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((v) => walkNumbers(v, sink));
  }
};

export const collectAllowedNumbers = (facts: NarrativeFacts): Set<string> => {
  const nums = new Set<number>();
  walkNumbers(facts, nums);
  // Small integers are list ordinals / counts, not claims about money.
  for (let i = 0; i <= 12; i++) nums.add(i);
  const out = new Set<string>();
  nums.forEach((n) => out.add(String(n)));
  return out;
};

/** Returns numeric tokens in AI text that do not exist in the deterministic facts. */
export const verifyNarrativeNumbers = (text: string, allowed: Set<string>): string[] => {
  const found = text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
  const bad = new Set<string>();
  found.forEach((raw) => {
    const clean = raw.replace(/,/g, "");
    const n = Number(clean);
    if (!Number.isFinite(n)) return;
    if (allowed.has(String(n))) return;
    if (allowed.has(String(Math.round(n)))) return;
    if (allowed.has(String(Math.round(n * 10) / 10))) return;
    bad.add(raw);
  });
  return [...bad];
};
