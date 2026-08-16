// Layer A — deterministic portfolio engine.
// No LLM involvement. Every number the UI (and later the AI layer) shows must
// come from here. Where a metric cannot be computed from available data the
// engine returns null and the UI must render "Insufficient current data".

import {
  AllocationRow,
  AssetBucket,
  ClientProfile,
  ConcentrationFlag,
  Constraints,
  EngineOutput,
  EquitySleeve,
  Goal,
  GoalMath,
  HorizonClass,
  PortfolioFund,
  PortfolioScores,
  RedundancyFlag,
  RiskAnswers,
  RiskAssessment,
  RiskDimension,
  RiskProfile,
  SipAction,
} from "./types";

export const RISK_ORDER: RiskProfile[] = [
  "Conservative",
  "Moderate",
  "Moderately Aggressive",
  "Aggressive",
  "Very Aggressive",
];

// Starting equity ranges. The engine adjusts them for horizon / capacity below.
export const EQUITY_RANGES: Record<RiskProfile, [number, number]> = {
  Conservative: [30, 50],
  Moderate: [45, 65],
  "Moderately Aggressive": [60, 80],
  Aggressive: [75, 95],
  "Very Aggressive": [85, 100],
};

export const SMALL_CAP_RANGES: Record<RiskProfile, [number, number]> = {
  Conservative: [0, 5],
  Moderate: [0, 7],
  "Moderately Aggressive": [5, 12],
  Aggressive: [8, 15],
  "Very Aggressive": [10, 20],
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round1 = (n: number) => +n.toFixed(1);
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const scoreToProfile = (score: number): RiskProfile => {
  if (score < 25) return "Conservative";
  if (score < 45) return "Moderate";
  if (score < 65) return "Moderately Aggressive";
  if (score < 85) return "Aggressive";
  return "Very Aggressive";
};

export const classifyHorizon = (years: number): HorizonClass => {
  if (years < 3) return "Short term";
  if (years < 7) return "Medium term";
  if (years < 10) return "Long term";
  return "Very long term";
};

/* ------------------------------------------------------------------ */
/* Risk engine — three independent dimensions, weakest one binds      */
/* ------------------------------------------------------------------ */

const riskTolerance = (a: RiskAnswers): RiskDimension => {
  const answers = [a.drawdownReaction, a.experience, a.volatilityComfort, a.lossHorizon, a.incomeStability];
  const raw = sum(answers) / (answers.length * 5); // 0-1
  const score = Math.round(raw * 100);
  return {
    score,
    label: scoreToProfile(score),
    drivers: [
      `Behavioural questionnaire average ${(sum(answers) / answers.length).toFixed(1)}/5`,
      a.drawdownReaction <= 2 ? "Reacts defensively to a 30% drawdown" : "Holds or adds during drawdowns",
    ],
  };
};

const riskCapacity = (p: ClientProfile, goals: Goal[], year: number): RiskDimension => {
  const drivers: string[] = [];
  let score = 50;

  const surplus = p.monthlyIncome - p.monthlyExpenses - p.monthlyEmi;
  const surplusRatio = p.monthlyIncome > 0 ? surplus / p.monthlyIncome : 0;
  if (surplusRatio > 0.35) { score += 12; drivers.push("Strong monthly surplus"); }
  else if (surplusRatio < 0.1) { score -= 15; drivers.push("Thin monthly surplus"); }

  const emergencyMonths = p.monthlyExpenses > 0 ? p.emergencyFund / p.monthlyExpenses : 0;
  if (emergencyMonths >= 6) { score += 10; drivers.push(`Emergency fund ~${emergencyMonths.toFixed(0)} months`); }
  else { score -= 12; drivers.push(`Emergency fund only ~${emergencyMonths.toFixed(1)} months`); }

  const emiRatio = p.monthlyIncome > 0 ? p.monthlyEmi / p.monthlyIncome : 0;
  if (emiRatio > 0.4) { score -= 15; drivers.push("EMI above 40% of income"); }
  else if (emiRatio < 0.15) { score += 5; }

  if (p.age < 35) { score += 10; drivers.push("Long accumulation runway"); }
  else if (p.age >= 55) { score -= 15; drivers.push("Close to retirement"); }
  else if (p.age >= 45) { score -= 5; }

  if (p.dependents >= 3) { score -= 6; drivers.push(`${p.dependents} dependents`); }

  const fixedIncome = p.epf + p.ppf + p.nps + p.fixedDeposits + p.bonds;
  if (fixedIncome > 0) { score += 6; drivers.push("Existing fixed-income assets outside MFs"); }

  if (p.insuranceCover <= 0) { score -= 5; drivers.push("No insurance cover recorded"); }

  const nearEssential = goals.some(
    (g) => g.essential && g.targetYear - year <= 3,
  );
  if (nearEssential) { score -= 12; drivers.push("Essential goal due within 3 years"); }

  score = clamp(score, 0, 100);
  return { score, label: scoreToProfile(score), drivers };
};

const riskNeed = (goals: Goal[], monthlySip: number, currentCorpus: number, year: number): RiskDimension => {
  const drivers: string[] = [];
  if (goals.length === 0) {
    return { score: 50, label: "Moderate", drivers: ["No goals captured — risk need not measurable"] };
  }
  const required = goals
    .map((g) => solveRequiredReturn(g, monthlySip, currentCorpus, year))
    .filter((r): r is number => r !== null);

  if (required.length === 0) {
    return { score: 50, label: "Moderate", drivers: ["Insufficient current data to solve required return"] };
  }
  const maxRequired = Math.max(...required);
  drivers.push(`Highest required return across goals ${maxRequired.toFixed(1)}% p.a.`);
  // 6% required → conservative is enough; 15%+ → very aggressive would be needed
  const score = Math.round(clamp(((maxRequired - 6) / 9) * 100, 0, 100));
  return { score, label: scoreToProfile(score), drivers };
};

// Solve the annual return that makes existing corpus + SIP reach the inflated goal cost.
const solveRequiredReturn = (goal: Goal, monthlySip: number, corpus: number, year: number): number | null => {
  const years = goal.targetYear - year;
  if (years <= 0) return null;
  const target = goal.currentCost * Math.pow(1 + goal.inflationPct / 100, years);
  const start = goal.currentAllocated || corpus * 0;
  const sip = goal.monthlyContribution || monthlySip;
  if (target <= 0 || (start <= 0 && sip <= 0)) return null;

  const project = (r: number) => {
    const m = r / 12 / 100;
    const n = years * 12;
    const fvStart = start * Math.pow(1 + m, n);
    const fvSip = m === 0 ? sip * n : sip * ((Math.pow(1 + m, n) - 1) / m) * (1 + m);
    return fvStart + fvSip;
  };
  let lo = 0;
  let hi = 40;
  if (project(hi) < target) return null; // not achievable with sane returns
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (project(mid) < target) lo = mid;
    else hi = mid;
  }
  return round1((lo + hi) / 2);
};

export const assessRisk = (
  profile: ClientProfile,
  goals: Goal[],
  answers: RiskAnswers,
  monthlySip: number,
  corpus: number,
): RiskAssessment => {
  const tolerance = riskTolerance(answers);
  const capacity = riskCapacity(profile, goals);
  const need = riskNeed(goals, monthlySip, corpus);

  // Ceiling = weakest of tolerance / capacity. Need can only pull the profile
  // DOWN (a low need means no reason to take more risk), never above the ceiling.
  const ceilingIdx = Math.min(
    RISK_ORDER.indexOf(tolerance.label),
    RISK_ORDER.indexOf(capacity.label),
  );
  const needIdx = RISK_ORDER.indexOf(need.label);
  const finalIdx = Math.min(ceilingIdx, Math.max(needIdx, 0));
  const finalProfile = RISK_ORDER[finalIdx];

  const bindingConstraint =
    finalIdx === needIdx && needIdx < ceilingIdx
      ? "Need"
      : RISK_ORDER.indexOf(capacity.label) <= RISK_ORDER.indexOf(tolerance.label)
        ? "Capacity"
        : "Tolerance";

  let [lo, hi] = EQUITY_RANGES[finalProfile];
  const notes: string[] = [];

  // Horizon adjustment — the shortest essential goal caps equity.
  const essential = goals.filter((g) => g.essential);
  if (essential.length) {
    const minYears = Math.min(...essential.map((g) => g.targetYear - new Date().getFullYear()));
    if (minYears < 3) {
      hi = Math.min(hi, 40); lo = Math.min(lo, 20);
      notes.push("Essential goal under 3 years — equity ceiling reduced");
    } else if (minYears < 7) {
      hi = Math.min(hi, 70);
      notes.push("Nearest essential goal is medium term — equity ceiling trimmed");
    }
  }
  if (profile.age >= 58) {
    hi = Math.min(hi, 60);
    notes.push("Retirement proximity — defensive allocation increased");
  }
  if (bindingConstraint === "Need") {
    notes.push("Required return is lower than risk capacity allows — no need to take extra risk");
  }

  return {
    tolerance,
    capacity,
    need,
    finalProfile,
    bindingConstraint,
    equityRange: [Math.round(lo), Math.round(hi)],
    notes,
  };
};

/* ------------------------------------------------------------------ */
/* Goal maths                                                          */
/* ------------------------------------------------------------------ */

export const computeGoal = (goal: Goal, assumedReturnPct: number, monthlySip: number): GoalMath => {
  const years = Math.max(0, goal.targetYear - new Date().getFullYear());
  const futureCost = goal.currentCost * Math.pow(1 + goal.inflationPct / 100, years);
  const m = assumedReturnPct / 12 / 100;
  const n = years * 12;
  const sip = goal.monthlyContribution;
  const projectedFromExisting = goal.currentAllocated * Math.pow(1 + m, n);
  const projectedFromSip = m === 0 ? sip * n : sip * ((Math.pow(1 + m, n) - 1) / m) * (1 + m);
  const projectedCorpus = projectedFromExisting + projectedFromSip;

  return {
    goal,
    yearsToGoal: years,
    horizonClass: classifyHorizon(years),
    futureCost,
    projectedFromExisting,
    projectedFromSip,
    projectedCorpus,
    fundingGap: futureCost - projectedCorpus,
    fundedPct: futureCost > 0 ? round1((projectedCorpus / futureCost) * 100) : 0,
    requiredReturnPct: solveRequiredReturn(goal, monthlySip, goal.currentAllocated),
  };
};

/* ------------------------------------------------------------------ */
/* Allocation engine                                                   */
/* ------------------------------------------------------------------ */

const BUCKETS: AssetBucket[] = [
  "Indian Equity",
  "International Equity",
  "Debt",
  "Hybrid",
  "Gold",
  "Silver",
  "Cash",
];

export const targetAllocation = (
  risk: RiskAssessment,
  profile: ClientProfile,
  constraints: Constraints,
): Record<AssetBucket, number> => {
  const equityMid = (risk.equityRange[0] + risk.equityRange[1]) / 2;

  // International share of total equity: 0 when India-only.
  const intlShare =
    constraints.geography === "India only" ? 0
      : constraints.geography === "Global" ? 0.3
        : constraints.geography === "US" || constraints.geography === "Emerging Markets" ? 0.25
          : 0.2;

  const indianEquity = equityMid * (1 - intlShare);
  const intlEquity = equityMid * intlShare;

  // Diversifiers: gold-led, 5-10% combined.
  let gold = risk.finalProfile === "Conservative" ? 6 : 5;
  let silver = risk.finalProfile === "Very Aggressive" ? 3 : 2;

  let remaining = 100 - indianEquity - intlEquity - gold - silver;

  // Existing fixed-income outside MFs reduces the MF debt requirement.
  const outsideFixedIncome = profile.epf + profile.ppf + profile.nps + profile.fixedDeposits + profile.bonds;
  const investableTotal = outsideFixedIncome + profile.directEquity + profile.otherInvestments;
  const outsideShare = investableTotal > 0 ? outsideFixedIncome / investableTotal : 0;
  const debtShift = clamp(outsideShare, 0, 0.5); // up to half the MF debt need is already met

  let cash = constraints.capitalPreservation ? 5 : 3;
  remaining -= cash;
  let hybrid = clamp(remaining * 0.3, 0, remaining);
  let debt = Math.max(0, remaining - hybrid);
  const relieved = debt * debtShift;
  debt -= relieved;
  hybrid += relieved * 0.4;
  cash += relieved * 0.2;
  const spillToEquity = relieved * 0.4;

  const out: Record<AssetBucket, number> = {
    "Indian Equity": round1(indianEquity + spillToEquity * 0.8),
    "International Equity": round1(intlEquity + spillToEquity * 0.2),
    Debt: round1(debt),
    Hybrid: round1(hybrid),
    Gold: round1(gold),
    Silver: round1(silver),
    Cash: round1(cash),
  };

  // Normalise to exactly 100.
  const total = sum(Object.values(out));
  if (total !== 100) {
    out["Indian Equity"] = round1(out["Indian Equity"] + (100 - total));
  }
  return out;
};

export const currentAllocation = (funds: PortfolioFund[]): Record<AssetBucket, number> => {
  const total = sum(funds.map((f) => f.currentValue));
  const out = Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Record<AssetBucket, number>;
  if (total <= 0) return out;
  funds.forEach((f) => {
    out[f.assetBucket] = round1(out[f.assetBucket] + (f.currentValue / total) * 100);
  });
  return out;
};

const CORE_SUBS = ["Large Cap", "Flexi Cap", "Multi Cap", "Large & Mid Cap", "Index Fund", "Value", "ELSS"];

export const sleeveOf = (fund: PortfolioFund): EquitySleeve | null => {
  if (fund.assetBucket !== "Indian Equity") return null;
  if (fund.subCategory === "Mid Cap") return "Mid Cap";
  if (fund.subCategory === "Small Cap") return "Small Cap";
  if (fund.subCategory === "Sectoral" || fund.role === "Sector" || fund.role === "Thematic") return "Satellite";
  if (CORE_SUBS.includes(fund.subCategory)) return "Core";
  return "Core";
};

/* ------------------------------------------------------------------ */
/* Concentration + redundancy                                          */
/* ------------------------------------------------------------------ */

export const concentrationFlags = (funds: PortfolioFund[]): ConcentrationFlag[] => {
  const total = sum(funds.map((f) => f.currentValue));
  const flags: ConcentrationFlag[] = [];
  if (total <= 0) return flags;

  funds.forEach((f) => {
    const pct = round1((f.currentValue / total) * 100);
    const severity = pct > 20 ? "Warning" : pct >= 15 ? "Monitor" : "Normal";
    if (severity !== "Normal") {
      flags.push({
        label: f.schemeName,
        pct,
        severity,
        note: severity === "Warning"
          ? "Above the 20% single-fund threshold — reduce unless there is a documented reason"
          : "Between 15-20% of the portfolio — monitor",
      });
    }
  });

  const thematic = funds.filter((f) => f.role === "Sector" || f.role === "Thematic" || f.subCategory === "Sectoral");
  if (thematic.length) {
    const pct = round1((sum(thematic.map((f) => f.currentValue)) / total) * 100);
    const severity = pct > 20 ? "Warning" : pct > 15 ? "Warning" : pct > 10 ? "High" : pct > 5 ? "Monitor" : "Normal";
    flags.push({
      label: "Sector / thematic exposure",
      pct,
      severity,
      note: pct > 15
        ? "Strong concentration — recommend reducing unless client-specific reason is documented"
        : pct > 10
          ? "High satellite concentration"
          : pct > 5
            ? "Meaningful satellite allocation"
            : "Normal satellite allocation",
    });
  }

  const gs = funds.filter((f) => f.assetBucket === "Gold" || f.assetBucket === "Silver");
  if (gs.length) {
    const pct = round1((sum(gs.map((f) => f.currentValue)) / total) * 100);
    if (pct > 10) {
      flags.push({
        label: "Gold + Silver",
        pct,
        severity: "High",
        note: "Above 10% combined — diversifier allocation requires justification",
      });
    }
  }

  return flags;
};

export const redundancyFlags = (funds: PortfolioFund[]): RedundancyFlag[] => {
  const byRole = new Map<string, string[]>();
  funds.forEach((f) => {
    const key = f.role || f.subCategory;
    byRole.set(key, [...(byRole.get(key) ?? []), f.schemeName]);
  });
  return [...byRole.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([role, names]) => ({
      role,
      funds: names,
      note: `${names.length} funds share the ${role} role — likely overlapping. Stock-level overlap is modelled, not from disclosed holdings.`,
    }));
};

/* ------------------------------------------------------------------ */
/* SIP optimisation — gap-first, never fund-first                       */
/* ------------------------------------------------------------------ */

export const optimiseSip = (
  funds: PortfolioFund[],
  allocation: AllocationRow[],
  additionalSip: number,
): SipAction[] => {
  const totalSip = sum(funds.map((f) => f.sipAmount));
  const totalValue = sum(funds.map((f) => f.currentValue));
  const gapByBucket = new Map<AssetBucket, number>(allocation.map((r) => [r.bucket, r.gapPct]));

  // Underweight buckets ranked by gap size take the new money first.
  const underweight = allocation.filter((r) => r.gapPct > 1).sort((a, b) => b.gapPct - a.gapPct);
  const gapTotal = sum(underweight.map((r) => r.gapPct));

  const allocPerBucket = new Map<AssetBucket, number>();
  underweight.forEach((r) => {
    allocPerBucket.set(r.bucket, gapTotal > 0 ? (r.gapPct / gapTotal) * additionalSip : 0);
  });

  const actions: SipAction[] = funds.map((f) => {
    const weight = totalValue > 0 ? round1((f.currentValue / totalValue) * 100) : 0;
    const gap = gapByBucket.get(f.assetBucket) ?? 0;
    const bucketRow = allocation.find((r) => r.bucket === f.assetBucket);
    const targetRange: [number, number] = bucketRow
      ? [Math.max(0, round1(bucketRow.targetPct - 5)), round1(bucketRow.targetPct + 5)]
      : [0, 0];

    const bucketFunds = funds.filter((x) => x.assetBucket === f.assetBucket);
    const bucketSip = sum(bucketFunds.map((x) => x.sipAmount));
    const share = bucketSip > 0 ? f.sipAmount / bucketSip : 1 / Math.max(1, bucketFunds.length);
    const addForBucket = allocPerBucket.get(f.assetBucket) ?? 0;

    let action: SipAction["action"] = "KEEP";
    let recommended = f.sipAmount;
    let why = "Weight is inside the target range for its asset class — no change needed.";

    if (gap > 1 && addForBucket > 0) {
      recommended = Math.round((f.sipAmount + addForBucket * share) / 500) * 500;
      action = recommended > f.sipAmount ? "INCREASE" : "KEEP";
      why = `${f.assetBucket} is ${round1(gap)}% underweight against target. New SIP is directed here before anywhere else.`;
    } else if (gap < -5) {
      action = weight > 20 ? "STOP SIP" : "REDUCE";
      recommended = action === "STOP SIP" ? 0 : Math.round((f.sipAmount * 0.5) / 500) * 500;
      why = `${f.assetBucket} is ${round1(Math.abs(gap))}% overweight. Redirecting contributions is cheaper than switching units (no capital-gains event).`;
    }

    return {
      fundId: f.id,
      schemeName: f.schemeName,
      action,
      currentSip: f.sipAmount,
      recommendedSip: recommended,
      change: recommended - f.sipAmount,
      currentWeightPct: weight,
      targetRange,
      gapPct: round1(gap),
      role: f.role,
      why,
      portfolioImpact:
        action === "INCREASE"
          ? "Moves the portfolio toward the target asset allocation without a taxable switch."
          : action === "KEEP"
            ? "Preserves the existing allocation; no rebalancing needed from this holding."
            : "Reduces an overweight sleeve gradually through contribution flow.",
      riskImpact:
        f.assetBucket === "Indian Equity" || f.assetBucket === "International Equity"
          ? action === "INCREASE" ? "Raises portfolio equity beta." : action === "KEEP" ? "Neutral." : "Lowers portfolio equity beta."
          : action === "INCREASE" ? "Lowers portfolio volatility." : "Neutral to slightly higher volatility.",
      confidence: totalValue > 0 && totalSip > 0 ? "High" : "Low",
    };
  });

  // Buckets with a gap but no existing fund → a new role must be added.
  underweight.forEach((r) => {
    if (!funds.some((f) => f.assetBucket === r.bucket) && (allocPerBucket.get(r.bucket) ?? 0) > 0) {
      const amount = Math.round((allocPerBucket.get(r.bucket) ?? 0) / 500) * 500;
      actions.push({
        fundId: `new-${r.bucket}`,
        schemeName: `New ${r.bucket} allocation`,
        action: "ADD",
        currentSip: 0,
        recommendedSip: amount,
        change: amount,
        currentWeightPct: 0,
        targetRange: [Math.max(0, round1(r.targetPct - 5)), round1(r.targetPct + 5)],
        gapPct: round1(r.gapPct),
        role: r.bucket,
        why: `No fund currently fills the ${r.bucket} role and it is ${round1(r.gapPct)}% underweight. Fund shortlisting for this role is pending live fund data.`,
        portfolioImpact: "Adds a missing strategic role rather than duplicating an existing one.",
        riskImpact: r.bucket === "Debt" || r.bucket === "Hybrid" ? "Lowers portfolio volatility." : "Adds diversifying risk exposure.",
        confidence: "Medium",
      });
    }
  });

  return actions;
};

/* ------------------------------------------------------------------ */
/* Scores                                                              */
/* ------------------------------------------------------------------ */

export const computeScores = (
  funds: PortfolioFund[],
  allocation: AllocationRow[],
  concentration: ConcentrationFlag[],
  redundancy: RedundancyFlag[],
  goals: GoalMath[],
  constraints: Constraints,
): PortfolioScores => {
  const categories = new Set(funds.map((f) => f.subCategory)).size;
  const thematicCount = funds.filter((f) => f.role === "Sector" || f.role === "Thematic").length;

  // Complexity: more funds / duplicates / themes = worse.
  let complexity =
    funds.length * 3 +
    categories * 2 +
    redundancy.length * 8 +
    thematicCount * 6 +
    concentration.filter((c) => c.severity === "Warning").length * 5;
  complexity = Math.round(clamp(complexity, 0, 120));
  const complexityBand =
    complexity <= 20 ? "Simple" : complexity <= 40 ? "Moderate" : complexity <= 60 ? "Complex" : "Over-engineered";

  const allocDrift = sum(allocation.map((r) => Math.abs(r.gapPct)));
  const allocScore = Math.round(clamp(100 - allocDrift * 2, 0, 100));

  const goalScore = goals.length
    ? Math.round(clamp(sum(goals.map((g) => Math.min(100, g.fundedPct))) / goals.length, 0, 100))
    : 50;

  const concentrationScore = Math.round(
    clamp(100 - concentration.filter((c) => c.severity !== "Normal").length * 15, 0, 100),
  );
  const diversificationScore = Math.round(clamp(100 - redundancy.length * 18, 0, 100));
  const simplicityScore = Math.round(clamp(100 - complexity, 0, 100));
  const constraintScore = constraints.shariah === "No preference" && constraints.excludedSectors.length === 0
    ? 100
    : 60; // screening needs verified current holdings data — capped until wired

  const fitBreakdown = [
    { label: "Goal alignment", score: goalScore, weight: 0.2 },
    { label: "Asset allocation", score: allocScore, weight: 0.25 },
    { label: "Concentration control", score: concentrationScore, weight: 0.15 },
    { label: "Diversification", score: diversificationScore, weight: 0.15 },
    { label: "Portfolio simplicity", score: simplicityScore, weight: 0.1 },
    { label: "Client constraints", score: constraintScore, weight: 0.15 },
  ];
  const fitScore = Math.round(sum(fitBreakdown.map((b) => b.score * b.weight)));

  return { fitScore, fitBreakdown, complexityScore: complexity, complexityBand };
};

/* ------------------------------------------------------------------ */
/* Data integrity                                                      */
/* ------------------------------------------------------------------ */

export const integrityChecks = (
  funds: PortfolioFund[],
  declaredSipBudget: number,
): string[] => {
  const issues: string[] = [];
  const totalSip = sum(funds.map((f) => f.sipAmount));
  if (funds.length === 0) issues.push("No holdings captured — nothing to analyse.");
  if (funds.some((f) => f.currentValue <= 0)) issues.push("One or more funds have no current value.");
  if (funds.some((f) => f.investedAmount <= 0)) issues.push("One or more funds have no invested amount — return metrics unavailable.");
  if (declaredSipBudget > 0 && Math.abs(totalSip - declaredSipBudget) > 1) {
    issues.push(
      `Fund SIPs total ₹${totalSip.toLocaleString("en-IN")} but the declared monthly SIP is ₹${declaredSipBudget.toLocaleString("en-IN")}.`,
    );
  }
  const names = funds.map((f) => f.schemeName.trim().toLowerCase());
  if (new Set(names).size !== names.length) issues.push("Duplicate scheme entries detected.");
  if (funds.some((f) => !f.purchaseDate)) issues.push("Missing purchase dates — XIRR cannot be computed for every holding.");
  return issues;
};

/* ------------------------------------------------------------------ */
/* Orchestration                                                       */
/* ------------------------------------------------------------------ */

export interface EngineInput {
  profile: ClientProfile;
  goals: Goal[];
  constraints: Constraints;
  funds: PortfolioFund[];
  riskAnswers: RiskAnswers;
  additionalSip: number;
  declaredSipBudget: number;
  assumedReturnPct: number;
}

export const runEngine = (input: EngineInput): EngineOutput => {
  const { profile, goals, constraints, funds, riskAnswers, additionalSip, declaredSipBudget, assumedReturnPct } = input;

  const currentValue = sum(funds.map((f) => f.currentValue));
  const invested = sum(funds.map((f) => f.investedAmount));
  const currentSip = sum(funds.map((f) => f.sipAmount));
  const totalOtherAssets =
    profile.epf + profile.ppf + profile.nps + profile.fixedDeposits + profile.directEquity +
    profile.bonds + profile.realEstate + profile.otherInvestments;

  const risk = assessRisk(profile, goals, riskAnswers, currentSip + additionalSip, currentValue);
  const target = targetAllocation(risk, profile, constraints);
  const current = currentAllocation(funds);

  const allocation: AllocationRow[] = BUCKETS.map((bucket) => ({
    bucket,
    currentPct: current[bucket],
    targetPct: target[bucket],
    gapPct: round1(target[bucket] - current[bucket]),
    currentValue: sum(funds.filter((f) => f.assetBucket === bucket).map((f) => f.currentValue)),
  }));

  const equityValue = sum(funds.filter((f) => f.assetBucket === "Indian Equity").map((f) => f.currentValue));
  const sleeveTargets: Record<EquitySleeve, number> = (() => {
    const [scLo, scHi] = SMALL_CAP_RANGES[risk.finalProfile];
    const small = (scLo + scHi) / 2;
    const mid = clamp(small * 1.6, 5, 25);
    const satellite = risk.finalProfile === "Conservative" ? 0 : 5;
    return { Core: round1(100 - small - mid - satellite), "Mid Cap": round1(mid), "Small Cap": round1(small), Satellite: satellite };
  })();

  const equitySleeves = (["Core", "Mid Cap", "Small Cap", "Satellite"] as EquitySleeve[]).map((sleeve) => {
    const val = sum(funds.filter((f) => sleeveOf(f) === sleeve).map((f) => f.currentValue));
    const currentPct = equityValue > 0 ? round1((val / equityValue) * 100) : 0;
    return { sleeve, currentPct, targetPct: sleeveTargets[sleeve], gapPct: round1(sleeveTargets[sleeve] - currentPct) };
  });

  const concentration = concentrationFlags(funds);
  const redundancy = redundancyFlags(funds);
  const goalMaths = goals.map((g) => computeGoal(g, assumedReturnPct, currentSip + additionalSip));
  const sipPlan = optimiseSip(funds, allocation, additionalSip);
  const scores = computeScores(funds, allocation, concentration, redundancy, goalMaths, constraints);

  const dataFlags = [
    "Fund-level NAV, returns, AUM and expense ratio are not yet wired to a live feed — those metrics show as 'Insufficient current data'.",
    "Stock, sector and market-cap overlap is modelled from category profiles, not disclosed holdings.",
    "Beta, Sharpe, Sortino, drawdown and rolling returns require NAV history — pending data source integration.",
  ];

  return {
    asOf: new Date().toISOString(),
    dataFlags,
    totals: { currentValue, invested, currentSip, additionalSip, totalOtherAssets },
    risk,
    goals: goalMaths,
    allocation,
    equitySleeves,
    concentration,
    redundancy,
    sipPlan,
    scores,
    integrity: integrityChecks(funds, declaredSipBudget),
  };
};
