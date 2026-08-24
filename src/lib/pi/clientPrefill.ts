import { supabase } from "@/integrations/supabase/client";
import { emptyConstraints, emptyProfile, emptyRiskAnswers, newFund } from "./defaults";
import { classifyScheme } from "./schemeClassify";
import type { ClientProfile, Constraints, Goal, GoalCategory, PortfolioFund, RiskAnswers } from "./types";

export type ClientPrefill = {
  clientId: string;
  runName: string;
  profile: ClientProfile;
  goals: Goal[];
  riskAnswers: RiskAnswers;
  constraints: Constraints;
  funds: PortfolioFund[];
  declaredSipBudget: number;
  /** Fields the client record does not hold — the advisor must still confirm these. */
  missing: string[];
};

const yearsFromDob = (dob: string | null): number | null => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age > 0 && age < 120 ? age : null;
};

/** Behavioural sliders seeded from the recorded risk profile — advisor confirms them on step 3. */
const riskFromProfile = (risk: string | null): RiskAnswers => {
  const base = emptyRiskAnswers();
  const level =
    /very aggressive/i.test(risk ?? "") ? 5
      : /aggressive/i.test(risk ?? "") ? 4
      : /conservative/i.test(risk ?? "") ? 2
      : 3;
  return {
    ...base,
    drawdownReaction: level,
    experience: level,
    volatilityComfort: level,
    lossHorizon: level,
    incomeStability: base.incomeStability,
  };
};

const GOAL_CATEGORIES: GoalCategory[] = [
  "Retirement", "Child education", "Child marriage", "Property",
  "Wealth creation", "Financial independence", "Emergency corpus", "Other",
];

const toGoalCategory = (name: string): GoalCategory => {
  const n = name.toLowerCase();
  if (/retire/.test(n)) return "Retirement";
  if (/educat|college|school/.test(n)) return "Child education";
  if (/marriage|wedding/.test(n)) return "Child marriage";
  if (/home|house|property|flat/.test(n)) return "Property";
  if (/emergency/.test(n)) return "Emergency corpus";
  if (/independen|fire/.test(n)) return "Financial independence";
  const exact = GOAL_CATEGORIES.find((c) => c.toLowerCase() === n);
  return exact ?? "Wealth creation";
};

/**
 * Load a client record from the client book and map it onto Portfolio
 * Intelligence inputs. Nothing is invented — anything the client record does
 * not hold is left at the wizard default and reported in `missing`.
 */
export const loadClientPrefill = async (clientId: string): Promise<ClientPrefill | null> => {
  const [clientRes, goalsRes, fundsRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
    supabase.from("client_goals").select("*").eq("client_id", clientId).order("created_at"),
    supabase.from("client_funds").select("*").eq("client_id", clientId).order("created_at"),
  ]);

  const client = clientRes.data;
  if (!client) return null;

  const missing: string[] = [];
  const base = emptyProfile();
  const age = yearsFromDob(client.date_of_birth);
  if (age === null) missing.push("date of birth (age)");
  if (client.monthly_income === null) missing.push("monthly income");
  missing.push("monthly expenses, dependents and the wider asset / liability position");

  const monthlyIncome = Number(client.monthly_income ?? 0) || base.monthlyIncome;

  const profile: ClientProfile = {
    ...base,
    clientName: client.full_name,
    age: age ?? base.age,
    employmentType: client.occupation || base.employmentType,
    monthlyIncome,
    annualIncome: monthlyIncome * 12,
    monthlyExpenses: base.monthlyExpenses,
  };

  const currentYear = new Date().getFullYear();
  const goals: Goal[] = (goalsRes.data ?? []).map((g) => ({
    id: g.id,
    name: g.goal_name,
    category: toGoalCategory(g.goal_name),
    currentCost: Number(g.target_amount ?? 0),
    targetYear: g.target_date ? new Date(g.target_date).getFullYear() : currentYear + 10,
    currentAllocated: 0,
    monthlyContribution: 0,
    inflationPct: 6,
    priority: g.priority === "high" ? 1 : g.priority === "low" ? 3 : 2,
    essential: g.priority === "high",
  }));

  const funds: PortfolioFund[] = (fundsRes.data ?? [])
    .filter((f) => f.status !== "stopped")
    .map((f) => {
      const c = classifyScheme(f.fund_name, f.scheme_code ?? undefined);
      return {
        ...newFund(),
        id: f.id,
        schemeName: f.fund_name,
        schemeCode: f.scheme_code ?? c.schemeCode,
        fundHouse: c.fundHouse,
        category: f.category || c.category,
        subCategory: c.subCategory,
        assetBucket: c.assetBucket,
        role: c.role,
        currentValue: Number(f.lumpsum_amount ?? 0),
        investedAmount: Number(f.lumpsum_amount ?? 0),
        sipAmount: Number(f.monthly_sip ?? 0),
        purchaseDate: f.start_date ?? undefined,
      };
    });

  const declaredSipBudget = funds.reduce((s, f) => s + f.sipAmount, 0);

  return {
    clientId,
    runName: `${client.full_name} — portfolio review ${new Date().toISOString().slice(0, 10)}`,
    profile,
    goals,
    riskAnswers: riskFromProfile(client.risk_profile),
    constraints: emptyConstraints(),
    funds,
    declaredSipBudget,
    missing,
  };
};
