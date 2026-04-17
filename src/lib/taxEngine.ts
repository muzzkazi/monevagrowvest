// Tax calculation engine for FY 2024-25 (AY 2025-26)
// Old vs New regime comparison for Indian individual taxpayers

export type IncomeType = "salaried" | "self-employed";
export type CityType = "metro" | "non-metro";

export interface TaxInputs {
  totalIncome: number;
  incomeType: IncomeType;
  // Salary details
  basicSalary: number;
  hraReceived: number;
  rentPerMonth: number;
  cityType: CityType;
  // Other income
  interestIncome: number;
  rentalIncome: number;
  businessIncome: number;
  // Capital gains
  shortTermGains: number;
  longTermGains: number;
  // Deductions
  invested80C: number;
  healthInsuranceSelf: number;
  healthInsuranceParents: number;
  parentsSenior: boolean;
  homeLoanInterest: number;
  npsAmount: number;
}

export const defaultInputs = (income: number): Partial<TaxInputs> => ({
  basicSalary: Math.round(income * 0.4),
  hraReceived: Math.round(income * 0.2),
  rentPerMonth: 15000,
  cityType: "metro",
  interestIncome: 0,
  rentalIncome: 0,
  businessIncome: 0,
  shortTermGains: 0,
  longTermGains: 0,
  invested80C: 0,
  healthInsuranceSelf: 25000,
  healthInsuranceParents: 0,
  parentsSenior: false,
  homeLoanInterest: 0,
  npsAmount: 0,
});

// HRA exemption = min(HRA received, rent - 10% of basic, 50%/40% of basic)
export function calculateHRAExemption(
  basic: number,
  hra: number,
  rentPerMonth: number,
  city: CityType
): number {
  const annualRent = rentPerMonth * 12;
  const rentMinusBasic = Math.max(0, annualRent - 0.1 * basic);
  const cityPct = city === "metro" ? 0.5 : 0.4;
  return Math.max(0, Math.min(hra, rentMinusBasic, cityPct * basic));
}

// Old regime slabs (FY 24-25) for individuals < 60 — pre-rebate slab tax
function oldRegimeSlabTax(taxable: number): number {
  if (taxable <= 250000) return 0;
  if (taxable <= 500000) return (taxable - 250000) * 0.05;
  if (taxable <= 1000000) return 12500 + (taxable - 500000) * 0.2;
  return 12500 + 100000 + (taxable - 1000000) * 0.3;
}

// New regime slabs (FY 24-25) — pre-rebate slab tax
function newRegimeSlabTax(taxable: number): number {
  if (taxable <= 300000) return 0;
  if (taxable <= 700000) return (taxable - 300000) * 0.05;
  if (taxable <= 1000000) return 20000 + (taxable - 700000) * 0.1;
  if (taxable <= 1200000) return 50000 + (taxable - 1000000) * 0.15;
  if (taxable <= 1500000) return 80000 + (taxable - 1200000) * 0.2;
  return 140000 + (taxable - 1500000) * 0.3;
}

// Slab definitions exposed for UI tooltips
export interface SlabRow {
  range: string;
  rate: string;
}

export const oldRegimeSlabs: SlabRow[] = [
  { range: "Up to ₹2,50,000", rate: "Nil" },
  { range: "₹2,50,001 – ₹5,00,000", rate: "5%" },
  { range: "₹5,00,001 – ₹10,00,000", rate: "20%" },
  { range: "Above ₹10,00,000", rate: "30%" },
];

export const newRegimeSlabs: SlabRow[] = [
  { range: "Up to ₹3,00,000", rate: "Nil" },
  { range: "₹3,00,001 – ₹7,00,000", rate: "5%" },
  { range: "₹7,00,001 – ₹10,00,000", rate: "10%" },
  { range: "₹10,00,001 – ₹12,00,000", rate: "15%" },
  { range: "₹12,00,001 – ₹15,00,000", rate: "20%" },
  { range: "Above ₹15,00,000", rate: "30%" },
];

export interface RegimeBreakdown {
  grossIncome: number;
  standardDeduction: number;
  hraExemption: number;
  deduction80C: number;
  deduction80D: number;
  deductionHomeLoan: number;
  deductionNPS: number;
  totalDeductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate87A: number;
  capitalGainsTax: number;
  taxBeforeCess: number;
  cess: number;
  totalTax: number;
}

export interface TaxResult {
  oldTax: number;
  newTax: number;
  recommended: "old" | "new";
  savings: number;
  remaining80C: number;
  potentialTaxSaving: number;
  marginalRate: number;
  suggestedMonthlySIP: number;
  oldBreakdown: RegimeBreakdown;
  newBreakdown: RegimeBreakdown;
}

export function computeTax(i: TaxInputs): TaxResult {
  const grossIncome =
    i.totalIncome +
    i.interestIncome +
    i.rentalIncome +
    i.businessIncome;

  const capitalGainsTaxRaw = i.shortTermGains * 0.15 + i.longTermGains * 0.1;
  const capitalGainsTax = Math.round(capitalGainsTaxRaw * 1.04);

  // OLD REGIME
  const oldStandardDeduction = i.incomeType === "salaried" ? 50000 : 0;
  const hraExemption =
    i.incomeType === "salaried"
      ? calculateHRAExemption(i.basicSalary, i.hraReceived, i.rentPerMonth, i.cityType)
      : 0;
  const cap80C = Math.min(i.invested80C, 150000);
  const cap80D = Math.min(
    i.healthInsuranceSelf,
    25000
  ) + Math.min(i.healthInsuranceParents, i.parentsSenior ? 50000 : 25000);
  const capHomeLoan = Math.min(i.homeLoanInterest, 200000);
  const capNPS = Math.min(i.npsAmount, 50000);
  const oldTotalDeductions =
    oldStandardDeduction + hraExemption + cap80C + cap80D + capHomeLoan + capNPS;

  const oldTaxable = Math.max(0, grossIncome - oldTotalDeductions);
  const oldSlabTaxRaw = oldRegimeSlabTax(oldTaxable);
  const oldRebate = oldTaxable <= 500000 ? oldSlabTaxRaw : 0;
  const oldSlabTaxAfterRebate = Math.max(0, oldSlabTaxRaw - oldRebate);
  const oldCess = Math.round((oldSlabTaxAfterRebate + capitalGainsTaxRaw) * 0.04);
  const oldTax = Math.round(oldSlabTaxAfterRebate + capitalGainsTaxRaw + oldCess);

  const oldBreakdown: RegimeBreakdown = {
    grossIncome,
    standardDeduction: oldStandardDeduction,
    hraExemption,
    deduction80C: cap80C,
    deduction80D: cap80D,
    deductionHomeLoan: capHomeLoan,
    deductionNPS: capNPS,
    totalDeductions: oldTotalDeductions,
    taxableIncome: oldTaxable,
    slabTax: Math.round(oldSlabTaxRaw),
    rebate87A: Math.round(oldRebate),
    capitalGainsTax,
    taxBeforeCess: Math.round(oldSlabTaxAfterRebate + capitalGainsTaxRaw),
    cess: oldCess,
    totalTax: oldTax,
  };

  // NEW REGIME (standard deduction available for salaried under FY 24-25)
  const newStandardDeduction = i.incomeType === "salaried" ? 50000 : 0;
  const newTaxable = Math.max(0, grossIncome - newStandardDeduction);
  const newSlabTaxRaw = newRegimeSlabTax(newTaxable);
  const newRebate = newTaxable <= 700000 ? newSlabTaxRaw : 0;
  const newSlabTaxAfterRebate = Math.max(0, newSlabTaxRaw - newRebate);
  const newCess = Math.round((newSlabTaxAfterRebate + capitalGainsTaxRaw) * 0.04);
  const newTax = Math.round(newSlabTaxAfterRebate + capitalGainsTaxRaw + newCess);

  const newBreakdown: RegimeBreakdown = {
    grossIncome,
    standardDeduction: newStandardDeduction,
    hraExemption: 0,
    deduction80C: 0,
    deduction80D: 0,
    deductionHomeLoan: 0,
    deductionNPS: 0,
    totalDeductions: newStandardDeduction,
    taxableIncome: newTaxable,
    slabTax: Math.round(newSlabTaxRaw),
    rebate87A: Math.round(newRebate),
    capitalGainsTax,
    taxBeforeCess: Math.round(newSlabTaxAfterRebate + capitalGainsTaxRaw),
    cess: newCess,
    totalTax: newTax,
  };

  const recommended: "old" | "new" = oldTax <= newTax ? "old" : "new";
  const savings = Math.abs(oldTax - newTax);

  // Gap analysis
  const remaining80C = Math.max(0, 150000 - i.invested80C);

  // Marginal rate based on old regime taxable income
  let marginalRate = 0.05;
  if (oldTaxable > 1000000) marginalRate = 0.3;
  else if (oldTaxable > 500000) marginalRate = 0.2;
  else if (oldTaxable > 250000) marginalRate = 0.05;
  else marginalRate = 0;

  const potentialTaxSaving = Math.round(remaining80C * marginalRate * 1.04);
  const suggestedMonthlySIP = Math.round(remaining80C / 12);

  return {
    oldTax,
    newTax,
    recommended,
    savings,
    remaining80C,
    potentialTaxSaving,
    marginalRate,
    suggestedMonthlySIP,
    oldBreakdown,
    newBreakdown,
  };
}
