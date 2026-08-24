// Moneva AI Portfolio Intelligence — domain types.
// Layer A (deterministic engine) owns every number. The AI layer (phase 2)
// only ever receives these structures and explains them.

export type RiskProfile =
  | "Conservative"
  | "Moderate"
  | "Moderately Aggressive"
  | "Aggressive"
  | "Very Aggressive";

export type AssetBucket =
  | "Indian Equity"
  | "International Equity"
  | "Debt"
  | "Hybrid"
  | "Gold"
  | "Silver"
  | "Cash";

export type EquitySleeve =
  | "Core"
  | "Mid Cap"
  | "Small Cap"
  | "Satellite";

export type FundRole =
  | "Core"
  | "Large Cap"
  | "Flexi Cap"
  | "Mid Cap"
  | "Small Cap"
  | "International Developed"
  | "International Emerging"
  | "Diversifier"
  | "Gold"
  | "Silver"
  | "Debt"
  | "Hybrid"
  | "Sector"
  | "Thematic"
  | "Satellite";

export type GoalCategory =
  | "Retirement"
  | "Child education"
  | "Child marriage"
  | "Property"
  | "Wealth creation"
  | "Financial independence"
  | "Emergency corpus"
  | "Other";

export type HorizonClass = "Short term" | "Medium term" | "Long term" | "Very long term";

export type ShariahPreference =
  | "No preference"
  | "Meaningful Shariah"
  | "Majority Shariah"
  | "Strict Shariah";

export type GeographyPreference =
  | "India only"
  | "India + International"
  | "US"
  | "Emerging Markets"
  | "Global";

export interface ClientProfile {
  clientName: string;
  age: number;
  countryOfResidence: string;
  taxResidency: string;
  employmentType: string;
  annualIncome: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  dependents: number;
  maritalStatus: string;
  // Broader financial position (drives risk capacity, not decoration)
  emergencyFund: number;
  liabilities: number;
  monthlyEmi: number;
  insuranceCover: number;
  epf: number;
  ppf: number;
  nps: number;
  fixedDeposits: number;
  directEquity: number;
  bonds: number;
  realEstate: number;
  otherInvestments: number;
}

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  currentCost: number;
  targetYear: number;
  currentAllocated: number;
  monthlyContribution: number;
  inflationPct: number;
  priority: 1 | 2 | 3;
  essential: boolean;
}

export interface GoalMath {
  goal: Goal;
  yearsToGoal: number;
  horizonClass: HorizonClass;
  futureCost: number;
  projectedFromExisting: number;
  projectedFromSip: number;
  projectedCorpus: number;
  fundingGap: number;
  fundedPct: number;
  requiredReturnPct: number | null; // null = insufficient data
}

export interface Constraints {
  shariah: ShariahPreference;
  excludedSectors: string[];
  geography: GeographyPreference;
  esg: boolean;
  taxSaving: boolean;
  incomeNeed: boolean;
  capitalPreservation: boolean;
}

export interface PortfolioFund {
  id: string;
  schemeName: string;
  /** AMFI scheme code when the scheme was picked from search. */
  schemeCode?: string;
  fundHouse: string;

  category: string; // Equity / Debt / Hybrid / Other
  subCategory: string; // Large Cap, Mid Cap, ...
  assetBucket: AssetBucket;
  role: FundRole;
  currentValue: number;
  investedAmount: number;
  sipAmount: number; // current monthly SIP
  purchaseDate?: string;
}

export interface RiskAnswers {
  // Behavioural — each 1 (most risk averse) to 5 (most risk seeking)
  drawdownReaction: number;
  experience: number;
  volatilityComfort: number;
  lossHorizon: number;
  incomeStability: number;
}

export interface RiskDimension {
  score: number; // 0-100
  label: RiskProfile;
  drivers: string[];
}

export interface RiskAssessment {
  tolerance: RiskDimension;
  capacity: RiskDimension;
  need: RiskDimension;
  finalProfile: RiskProfile;
  bindingConstraint: "Tolerance" | "Capacity" | "Need";
  equityRange: [number, number];
  notes: string[];
}

export interface AllocationRow {
  bucket: AssetBucket;
  currentPct: number;
  targetPct: number;
  gapPct: number; // target - current (positive = underweight)
  currentValue: number;
}

export interface ConcentrationFlag {
  label: string;
  pct: number;
  severity: "Normal" | "Monitor" | "High" | "Warning";
  note: string;
}

export interface RedundancyFlag {
  role: FundRole | string;
  funds: string[];
  note: string;
}

export interface SipAction {
  fundId: string;
  schemeName: string;
  action: "KEEP" | "INCREASE" | "REDUCE" | "STOP SIP" | "ADD";
  currentSip: number;
  recommendedSip: number;
  change: number;
  currentWeightPct: number;
  targetRange: [number, number];
  gapPct: number;
  role: FundRole | string;
  why: string;
  portfolioImpact: string;
  riskImpact: string;
  confidence: "High" | "Medium" | "Low";
}

export interface PortfolioScores {
  fitScore: number; // 0-100 primary score
  fitBreakdown: Array<{ label: string; score: number; weight: number }>;
  complexityScore: number; // 0-100+
  complexityBand: "Simple" | "Moderate" | "Complex" | "Over-engineered";
}

export interface EngineOutput {
  asOf: string;
  dataFlags: string[];
  totals: {
    currentValue: number;
    invested: number;
    currentSip: number;
    additionalSip: number;
    totalOtherAssets: number;
  };
  risk: RiskAssessment;
  goals: GoalMath[];
  allocation: AllocationRow[];
  equitySleeves: Array<{ sleeve: EquitySleeve; currentPct: number; targetPct: number; gapPct: number }>;
  concentration: ConcentrationFlag[];
  redundancy: RedundancyFlag[];
  sipPlan: SipAction[];
  scores: PortfolioScores;
  integrity: string[];
}
