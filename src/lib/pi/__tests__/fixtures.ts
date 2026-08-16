// Frozen fixture set used by the determinism tests. Nothing here uses
// Date.now(), Math.random() or crypto.randomUUID(), so a run is reproducible.

import { NavMetrics } from "../navMetrics";
import { ClientProfile, Constraints, Goal, PortfolioFund, RiskAnswers } from "../types";

export const FIXED_NOW = new Date("2026-08-15T00:00:00.000Z");

export const profile: ClientProfile = {
  clientName: "Test Client",
  age: 38,
  countryOfResidence: "India",
  taxResidency: "India",
  employmentType: "Salaried",
  annualIncome: 2400000,
  monthlyIncome: 200000,
  monthlyExpenses: 90000,
  dependents: 2,
  maritalStatus: "Married",
  emergencyFund: 600000,
  liabilities: 3000000,
  monthlyEmi: 35000,
  insuranceCover: 15000000,
  epf: 1200000,
  ppf: 400000,
  nps: 250000,
  fixedDeposits: 500000,
  directEquity: 350000,
  bonds: 0,
  realEstate: 0,
  otherInvestments: 0,
};

export const goals: Goal[] = [
  {
    id: "goal-retirement",
    name: "Retirement",
    category: "Retirement",
    currentCost: 30000000,
    targetYear: 2046,
    currentAllocated: 1500000,
    monthlyContribution: 40000,
    inflationPct: 6,
    priority: 1,
    essential: true,
  },
  {
    id: "goal-education",
    name: "Child education",
    category: "Child education",
    currentCost: 5000000,
    targetYear: 2034,
    currentAllocated: 400000,
    monthlyContribution: 15000,
    inflationPct: 8,
    priority: 1,
    essential: true,
  },
];

export const riskAnswers: RiskAnswers = {
  drawdownReaction: 4,
  experience: 4,
  volatilityComfort: 3,
  lossHorizon: 4,
  incomeStability: 4,
};

export const constraints: Constraints = {
  shariah: "No preference",
  excludedSectors: [],
  geography: "India + International",
  esg: false,
  taxSaving: false,
  incomeNeed: false,
  capitalPreservation: false,
};

export const funds: PortfolioFund[] = [
  {
    id: "f1",
    schemeName: "Alpha Flexi Cap Fund",
    fundHouse: "Alpha AMC",
    category: "Equity",
    subCategory: "Flexi Cap",
    assetBucket: "Indian Equity",
    role: "Flexi Cap",
    currentValue: 1200000,
    investedAmount: 900000,
    sipAmount: 20000,
    purchaseDate: "2022-06-15",
  },
  {
    id: "f2",
    schemeName: "Beta Small Cap Fund",
    fundHouse: "Beta AMC",
    category: "Equity",
    subCategory: "Small Cap",
    assetBucket: "Indian Equity",
    role: "Small Cap",
    currentValue: 800000,
    investedAmount: 500000,
    sipAmount: 15000,
    purchaseDate: "2025-12-01",
  },
  {
    id: "f3",
    schemeName: "Gamma Short Duration Fund",
    fundHouse: "Gamma AMC",
    category: "Debt",
    subCategory: "Short Duration",
    assetBucket: "Debt",
    role: "Debt",
    currentValue: 400000,
    investedAmount: 370000,
    sipAmount: 5000,
    purchaseDate: "2024-01-10",
  },
  {
    id: "f4",
    schemeName: "Delta Gold ETF FoF",
    fundHouse: "Delta AMC",
    category: "Other",
    subCategory: "Gold",
    assetBucket: "Gold",
    role: "Gold",
    currentValue: 200000,
    investedAmount: 150000,
    sipAmount: 3000,
    purchaseDate: "2025-05-20",
  },
];

export const engineInput = {
  profile,
  goals,
  riskAnswers,
  constraints,
  funds,
  additionalSip: 12000,
  declaredSipBudget: 60000,
  assumedReturnPct: 11,
  now: FIXED_NOW,
};

export const navMetric = (schemeCode: string, seed: number): NavMetrics => ({
  schemeCode,
  asOfNavDate: "2026-08-14",
  fetchedAt: "2026-08-15T00:00:00.000Z",
  observations: 900 + seed,
  return1yPct: 12 + seed,
  return3yCagrPct: 14 + seed,
  return5yCagrPct: 13 + seed,
  annualisedVolPct: 16 + seed,
  maxDrawdownPct: -38 - seed,
  sharpe: 0.6,
  sortino: 0.9,
  worst1yPct: -22 - seed,
  best1yPct: 34 + seed,
  unavailable: [],
});
