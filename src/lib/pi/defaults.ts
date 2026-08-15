import { ClientProfile, Constraints, Goal, PortfolioFund, RiskAnswers } from "./types";

export const emptyProfile = (): ClientProfile => ({
  clientName: "",
  age: 35,
  countryOfResidence: "India",
  taxResidency: "India",
  employmentType: "Salaried",
  annualIncome: 1800000,
  monthlyIncome: 150000,
  monthlyExpenses: 70000,
  dependents: 2,
  maritalStatus: "Married",
  emergencyFund: 400000,
  liabilities: 2500000,
  monthlyEmi: 30000,
  insuranceCover: 10000000,
  epf: 800000,
  ppf: 300000,
  nps: 200000,
  fixedDeposits: 500000,
  directEquity: 300000,
  bonds: 0,
  realEstate: 0,
  otherInvestments: 0,
});

export const emptyConstraints = (): Constraints => ({
  shariah: "No preference",
  excludedSectors: [],
  geography: "India + International",
  esg: false,
  taxSaving: false,
  incomeNeed: false,
  capitalPreservation: false,
});

export const emptyRiskAnswers = (): RiskAnswers => ({
  drawdownReaction: 3,
  experience: 3,
  volatilityComfort: 3,
  lossHorizon: 3,
  incomeStability: 3,
});

export const newGoal = (): Goal => ({
  id: crypto.randomUUID(),
  name: "",
  category: "Wealth creation",
  currentCost: 2000000,
  targetYear: new Date().getFullYear() + 10,
  currentAllocated: 0,
  monthlyContribution: 10000,
  inflationPct: 6,
  priority: 2,
  essential: false,
});

export const newFund = (): PortfolioFund => ({
  id: crypto.randomUUID(),
  schemeName: "",
  fundHouse: "",
  category: "Equity",
  subCategory: "Flexi Cap",
  assetBucket: "Indian Equity",
  role: "Flexi Cap",
  currentValue: 0,
  investedAmount: 0,
  sipAmount: 5000,
  purchaseDate: "",
});

export const SECTOR_EXCLUSIONS = [
  "Banking/Financial Services",
  "Alcohol",
  "Tobacco",
  "Gambling",
  "Weapons",
  "Conventional insurance",
];

export const RISK_QUESTIONS: Array<{ key: keyof RiskAnswers; question: string; labels: string[] }> = [
  {
    key: "drawdownReaction",
    question: "A ₹10 lakh equity portfolio falls to ₹7 lakh. What does the client do?",
    labels: ["Sell everything", "Sell part", "Hold", "Continue SIP", "Increase SIP"],
  },
  {
    key: "experience",
    question: "Investment experience with market-linked products",
    labels: ["None", "Under 2 years", "2-5 years", "5-10 years", "10+ years"],
  },
  {
    key: "volatilityComfort",
    question: "Acceptable worst-year fall in portfolio value",
    labels: ["0-5%", "5-10%", "10-20%", "20-30%", "Over 30%"],
  },
  {
    key: "lossHorizon",
    question: "How long is the client willing to stay invested through a loss?",
    labels: ["Under 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"],
  },
  {
    key: "incomeStability",
    question: "How stable and predictable is the client's income?",
    labels: ["Very unstable", "Unstable", "Moderate", "Stable", "Very stable"],
  },
];
