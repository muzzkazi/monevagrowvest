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

// Old regime slabs (FY 24-25) for individuals < 60
function oldRegimeTax(taxable: number): number {
  let tax = 0;
  if (taxable <= 250000) return 0;
  if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
  else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.2;
  else tax = 12500 + 100000 + (taxable - 1000000) * 0.3;
  // Section 87A rebate (taxable up to 5L)
  if (taxable <= 500000) tax = 0;
  return tax;
}

// New regime slabs (FY 24-25)
function newRegimeTax(taxable: number): number {
  let tax = 0;
  if (taxable <= 300000) return 0;
  if (taxable <= 700000) tax = (taxable - 300000) * 0.05;
  else if (taxable <= 1000000) tax = 20000 + (taxable - 700000) * 0.1;
  else if (taxable <= 1200000) tax = 50000 + (taxable - 1000000) * 0.15;
  else if (taxable <= 1500000) tax = 80000 + (taxable - 1200000) * 0.2;
  else tax = 140000 + (taxable - 1500000) * 0.3;
  // 87A rebate up to 7L
  if (taxable <= 700000) tax = 0;
  return tax;
}

const cess = (tax: number) => tax * 1.04;

export interface TaxResult {
  oldTax: number;
  newTax: number;
  recommended: "old" | "new";
  savings: number;
  remaining80C: number;
  potentialTaxSaving: number;
  marginalRate: number;
  suggestedMonthlySIP: number;
}

export function computeTax(i: TaxInputs): TaxResult {
  const grossIncome =
    i.totalIncome +
    i.interestIncome +
    i.rentalIncome +
    i.businessIncome;

  // OLD REGIME
  const standardDeduction = i.incomeType === "salaried" ? 50000 : 0;
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

  const oldTaxable = Math.max(
    0,
    grossIncome - standardDeduction - hraExemption - cap80C - cap80D - capHomeLoan - capNPS
  );
  const oldBaseTax = oldRegimeTax(oldTaxable);
  const oldTax = Math.round(cess(oldBaseTax) + i.shortTermGains * 0.15 * 1.04 + i.longTermGains * 0.1 * 1.04);

  // NEW REGIME
  const newTaxable = Math.max(0, grossIncome - 50000);
  const newBaseTax = newRegimeTax(newTaxable);
  const newTax = Math.round(cess(newBaseTax) + i.shortTermGains * 0.15 * 1.04 + i.longTermGains * 0.1 * 1.04);

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
  };
}
