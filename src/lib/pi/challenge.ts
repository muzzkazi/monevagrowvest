// Challenge / sanity review — deterministic pre-checks (Layer A).
//
// This module cross-examines the engine's own output against the recommendations
// the advisor is about to show, and flags contradictions BEFORE the AI writes
// (or the advisor sends) the client-facing note. It never recomputes portfolio
// figures: every number it quotes already exists in the engine output.

import { DataQualityReport } from "./dataQuality";
import { StressOutput } from "./stress";
import { SwitchPlan } from "./tax";
import { PiRunInputs } from "./runs";
import { EngineOutput } from "./types";

export type ChallengeSeverity = "blocker" | "inconsistency" | "watch";

export interface ChallengeFinding {
  id: string;
  severity: ChallengeSeverity;
  area: "SIP plan" | "Allocation" | "Risk" | "Goals" | "Tax" | "Data" | "Stress" | "Concentration";
  statement: string;
  expected: string;
  observed: string;
  question: string;
}

export interface ChallengeReport {
  findings: ChallengeFinding[];
  blockers: ChallengeFinding[];
  inconsistencies: ChallengeFinding[];
  watchItems: ChallengeFinding[];
  /** No blocker and no inconsistency — the note may be generated. */
  consistent: boolean;
}

export interface ChallengeInput {
  inputs: PiRunInputs;
  output: EngineOutput;
  quality: DataQualityReport | null;
  switchPlan?: SwitchPlan | null;
  stress?: StressOutput | null;
  assumedReturnPct: number;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const EQUITY_BUCKETS = ["Indian Equity", "International Equity"];
const ACTIONABLE_SWITCH = ["Switch now", "Stagger the switch"];

export const runChallengeChecks = ({
  inputs,
  output,
  quality,
  switchPlan = null,
  stress = null,
}: ChallengeInput): ChallengeReport => {
  const f: ChallengeFinding[] = [];

  const plan = output.sipPlan ?? [];
  const recommendedTotal = plan.reduce((s, a) => s + (a.recommendedSip || 0), 0);
  const currentTotal = plan.reduce((s, a) => s + (a.currentSip || 0), 0);
  const availableTotal = (output.totals.currentSip || 0) + (output.totals.additionalSip || 0);
  const gapByBucket = new Map(output.allocation.map((a) => [a.bucket, a.gapPct]));
  const bucketOfFund = new Map(inputs.funds.map((x) => [x.schemeName, x.assetBucket]));

  /* 1. Recommended SIP must not exceed what the engine says is available. */
  if (recommendedTotal - availableTotal > 1) {
    f.push({
      id: "sip-exceeds-available",
      severity: "inconsistency",
      area: "SIP plan",
      statement: "The recommended SIP total is above the monthly amount the engine was given to allocate.",
      expected: `Recommended total at or below ${inr(availableTotal)}`,
      observed: `Recommended total ${inr(recommendedTotal)}`,
      question: "Is the extra monthly amount actually available, or should the plan be re-run with the real surplus?",
    });
  }

  /* 2. Declared budget contradiction. */
  if (inputs.declaredSipBudget > 0 && recommendedTotal - inputs.declaredSipBudget > 1) {
    f.push({
      id: "sip-exceeds-declared-budget",
      severity: "inconsistency",
      area: "SIP plan",
      statement: "The plan recommends more monthly SIP than the client's declared budget.",
      expected: `Within declared budget of ${inr(inputs.declaredSipBudget)}`,
      observed: `Recommended total ${inr(recommendedTotal)}`,
      question: "Has the client agreed to raise the monthly budget, or must the plan fit the declared figure?",
    });
  }

  /* 3. Direction checks — money must move towards the target, not away from it. */
  plan.forEach((a) => {
    const bucket = bucketOfFund.get(a.schemeName);
    const gap = bucket ? gapByBucket.get(bucket) : undefined;
    if (gap === undefined) return;
    if (a.action === "INCREASE" && gap < -1) {
      f.push({
        id: `increase-into-overweight-${a.fundId ?? a.schemeName}`,
        severity: "inconsistency",
        area: "Allocation",
        statement: `${a.schemeName} is being increased while its bucket is already above target.`,
        expected: `${bucket} needs no addition (gap ${gap}%)`,
        observed: `Action INCREASE, ${inr(a.currentSip)} to ${inr(a.recommendedSip)}`,
        question: `Why add to ${bucket} when the engine shows it overweight?`,
      });
    }
    if (a.action === "REDUCE" && gap > 1) {
      f.push({
        id: `reduce-from-underweight-${a.fundId ?? a.schemeName}`,
        severity: "inconsistency",
        area: "Allocation",
        statement: `${a.schemeName} is being reduced while its bucket is below target.`,
        expected: `${bucket} needs an addition (gap +${gap}%)`,
        observed: `Action REDUCE, ${inr(a.currentSip)} to ${inr(a.recommendedSip)}`,
        question: `Is this reduction driven by fund quality rather than allocation, and is that stated?`,
      });
    }
  });

  /* 4. Target equity must sit inside the risk band the engine derived. */
  const targetEquity = output.allocation
    .filter((a) => EQUITY_BUCKETS.includes(a.bucket))
    .reduce((s, a) => s + a.targetPct, 0);
  const [lo, hi] = output.risk.equityRange;
  if (output.allocation.length > 0 && (targetEquity < lo - 1 || targetEquity > hi + 1)) {
    f.push({
      id: "target-equity-outside-band",
      severity: "inconsistency",
      area: "Risk",
      statement: "Target equity allocation sits outside the risk band derived for this client.",
      expected: `Equity target between ${lo}% and ${hi}%`,
      observed: `Equity target ${Math.round(targetEquity)}%`,
      question: `Which is wrong — the ${output.risk.finalProfile} risk assessment or the target allocation?`,
    });
  }

  /* 5. No taxable switch may be recommended on incomplete data. */
  if (quality && !quality.switchingAllowed && switchPlan) {
    const actionable = switchPlan.options.filter((o) => ACTIONABLE_SWITCH.includes(o.verdict));
    if (actionable.length > 0) {
      f.push({
        id: "switch-recommended-while-blocked",
        severity: "blocker",
        area: "Tax",
        statement: "A switch is being recommended while the data-quality gate blocks switching.",
        expected: "No actionable switch verdict until NAV and tax inputs are complete",
        observed: `${actionable.length} actionable switch verdict(s): ${actionable.map((o) => o.schemeName).join(", ")}`,
        question: "Complete the missing tax/NAV inputs, or restate this as SIP redirection only?",
      });
    }
  }

  /* 6. Data-quality blockers are challenge blockers too. */
  (quality?.blockers ?? []).forEach((b) => {
    f.push({
      id: `data-${b.id}`,
      severity: "blocker",
      area: "Data",
      statement: b.message,
      expected: "Required input present before a client note is produced",
      observed: `${b.area} requirement not met`,
      question: b.fix,
    });
  });

  /* 7. Essential goal materially short with no SIP increase anywhere. */
  const shortEssential = output.goals.filter((g) => g.goal.essential && g.fundingGap > 0 && g.fundedPct < 80);
  const hasIncrease = plan.some((a) => a.action === "INCREASE" || a.action === "ADD");
  if (shortEssential.length > 0 && !hasIncrease && (output.totals.additionalSip || 0) > 0) {
    f.push({
      id: "short-essential-goal-no-increase",
      severity: "inconsistency",
      area: "Goals",
      statement: "An essential goal is materially underfunded, yet no SIP is being increased or added.",
      expected: `Additional ${inr(output.totals.additionalSip)} deployed against the shortfall`,
      observed: `${shortEssential.map((g) => `${g.goal.name || g.goal.category} funded ${g.fundedPct}%`).join("; ")}`,
      question: "Where is the additional monthly amount going, and why not to the essential goal?",
    });
  }

  /* 8. High-severity concentration with nothing being trimmed. */
  const severe = output.concentration.filter((c) => c.severity === "high" || c.severity === "High");
  if (severe.length > 0 && !plan.some((a) => a.action === "REDUCE" || a.action === "STOP")) {
    f.push({
      id: "concentration-not-addressed",
      severity: "watch",
      area: "Concentration",
      statement: "A high concentration flag is open but no holding is being reduced or stopped.",
      expected: "Concentration addressed or explicitly accepted in the note",
      observed: severe.map((c) => `${c.label} at ${c.pct}%`).join("; "),
      question: "Is this concentration deliberate, and is the client being told it stays?",
    });
  }

  /* 9. Severe stress scenario endangering the nearest essential goal. */
  (stress?.scenarios ?? []).forEach((s) => {
    if (s.goalNote) {
      f.push({
        id: `stress-goal-${s.label}`,
        severity: "watch",
        area: "Stress",
        statement: `${s.label}: ${s.goalNote}`,
        expected: "Near-term essential goals protected from a drawdown",
        observed: `Portfolio return ${s.portfolioReturnPct}% in this scenario`,
        question: "Should the near-term goal be de-risked before this plan is sent?",
      });
    }
  });

  /* 10. Engine's own data flags and integrity notes must be surfaced, not silently dropped. */
  (output.dataFlags ?? []).forEach((flag, i) => {
    f.push({
      id: `engine-dataflag-${i}`,
      severity: "watch",
      area: "Data",
      statement: flag,
      expected: "Gap disclosed in the client note",
      observed: "Raised by the engine as a data flag",
      question: "Is this gap disclosed, or does it change the recommendation?",
    });
  });
  (output.integrity ?? []).forEach((note, i) => {
    f.push({
      id: `engine-integrity-${i}`,
      severity: "watch",
      area: "Data",
      statement: note,
      expected: "Integrity note reviewed before sending",
      observed: "Raised by the engine as an integrity note",
      question: "Has this been reviewed and accepted?",
    });
  });

  /* 11. Recommended total must reconcile with current SIP plus the additional amount. */
  if (plan.length > 0 && Math.abs(recommendedTotal - currentTotal - (output.totals.additionalSip || 0)) > 1) {
    f.push({
      id: "sip-total-not-reconciled",
      severity: "watch",
      area: "SIP plan",
      statement: "Recommended SIP total does not reconcile with current SIP plus the additional amount.",
      expected: `${inr(currentTotal)} + ${inr(output.totals.additionalSip || 0)}`,
      observed: inr(recommendedTotal),
      question: "Is the difference intentional (a deliberate cut or a partial deployment)?",
    });
  }

  const blockers = f.filter((x) => x.severity === "blocker");
  const inconsistencies = f.filter((x) => x.severity === "inconsistency");
  const watchItems = f.filter((x) => x.severity === "watch");

  return {
    findings: f,
    blockers,
    inconsistencies,
    watchItems,
    consistent: blockers.length === 0 && inconsistencies.length === 0,
  };
};
