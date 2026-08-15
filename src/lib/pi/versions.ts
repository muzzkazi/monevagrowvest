// Version history for saved Portfolio Intelligence runs.
//
// Every save appends an immutable, numbered snapshot of the captured inputs and
// the engine output at that moment. Comparing two versions is a pure function
// over those snapshots — nothing is recomputed or inferred during a diff.

import { supabase } from "@/integrations/supabase/client";
import { PiRunInputs } from "./runs";
import { ClientProfile, Constraints, EngineOutput, Goal, PortfolioFund, RiskAnswers } from "./types";

export interface PiRunVersion {
  id: string;
  runId: string;
  versionNo: number;
  runName: string;
  clientId: string | null;
  createdAt: string;
  changeNote: string | null;
  assumedReturnPct: number | null;
  inputs: PiRunInputs;
  output: EngineOutput | null;
}

const toVersion = (row: Record<string, unknown>): PiRunVersion => ({
  id: row.id as string,
  runId: row.run_id as string,
  versionNo: Number(row.version_no),
  runName: (row.run_name as string) ?? "Untitled run",
  clientId: (row.client_id as string | null) ?? null,
  createdAt: row.created_at as string,
  changeNote: (row.change_note as string | null) ?? null,
  assumedReturnPct: row.assumed_return_pct != null ? Number(row.assumed_return_pct) : null,
  inputs: {
    profile: row.profile as ClientProfile,
    goals: (row.goals as Goal[]) ?? [],
    riskAnswers: row.risk_answers as RiskAnswers,
    constraints: row.constraints as Constraints,
    funds: (row.funds as PortfolioFund[]) ?? [],
    additionalSip: Number(row.additional_sip ?? 0),
    declaredSipBudget: Number(row.declared_sip_budget ?? 0),
  },
  output: (row.output as EngineOutput | null) ?? null,
});

export const listVersions = async (runId: string): Promise<PiRunVersion[]> => {
  const { data, error } = await supabase
    .from("pi_run_versions")
    .select("*")
    .eq("run_id", runId)
    .order("version_no", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toVersion(r as Record<string, unknown>));
};

export const appendVersion = async (params: {
  runId: string;
  runName: string;
  clientId: string | null;
  inputs: PiRunInputs;
  assumedReturnPct: number;
  output: EngineOutput | null;
  changeNote?: string | null;
}): Promise<number> => {
  const { data: auth } = await supabase.auth.getUser();
  const { data: last } = await supabase
    .from("pi_run_versions")
    .select("version_no")
    .eq("run_id", params.runId)
    .order("version_no", { ascending: false })
    .limit(1);
  const nextNo = ((last?.[0] as { version_no?: number } | undefined)?.version_no ?? 0) + 1;
  const asJson = (v: unknown) => JSON.parse(JSON.stringify(v ?? null)) as never;

  const { error } = await supabase.from("pi_run_versions").insert({
    run_id: params.runId,
    version_no: nextNo,
    run_name: params.runName,
    client_id: params.clientId,
    profile: asJson(params.inputs.profile),
    goals: asJson(params.inputs.goals),
    risk_answers: asJson(params.inputs.riskAnswers),
    constraints: asJson(params.inputs.constraints),
    funds: asJson(params.inputs.funds),
    additional_sip: params.inputs.additionalSip,
    declared_sip_budget: params.inputs.declaredSipBudget,
    assumed_return_pct: params.assumedReturnPct,
    output: asJson(params.output),
    change_note: params.changeNote ?? null,
    created_by: auth.user?.id ?? null,
  });
  if (error) throw new Error(error.message);
  return nextNo;
};

/* ------------------------------------------------------------------ */
/* Diffing                                                            */
/* ------------------------------------------------------------------ */

export interface FieldChange {
  label: string;
  from: string;
  to: string;
}

export interface HoldingChange {
  scheme: string;
  kind: "added" | "removed" | "changed";
  changes: FieldChange[];
}

export interface VersionDiff {
  from: PiRunVersion;
  to: PiRunVersion;
  profile: FieldChange[];
  risk: FieldChange[];
  goals: FieldChange[];
  holdings: HoldingChange[];
  outputs: FieldChange[];
  unchanged: boolean;
}

const inr = (n: number) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;
const num = (n: number | null | undefined) => (n === null || n === undefined ? "—" : String(n));

const PROFILE_FIELDS: Array<[keyof ClientProfile, string, "money" | "plain"]> = [
  ["age", "Age", "plain"],
  ["annualIncome", "Annual income", "money"],
  ["monthlyIncome", "Monthly income", "money"],
  ["monthlyExpenses", "Monthly expenses", "money"],
  ["dependents", "Dependents", "plain"],
  ["emergencyFund", "Emergency fund", "money"],
  ["liabilities", "Liabilities", "money"],
  ["monthlyEmi", "Monthly EMI", "money"],
  ["insuranceCover", "Insurance cover", "money"],
];

const RISK_FIELDS: Array<[keyof RiskAnswers, string]> = [
  ["drawdownReaction", "Drawdown reaction"],
  ["experience", "Experience"],
  ["volatilityComfort", "Volatility comfort"],
  ["lossHorizon", "Loss horizon"],
  ["incomeStability", "Income stability"],
];

export const diffVersions = (from: PiRunVersion, to: PiRunVersion): VersionDiff => {
  const profile: FieldChange[] = [];
  PROFILE_FIELDS.forEach(([key, label, kind]) => {
    const a = from.inputs.profile?.[key];
    const b = to.inputs.profile?.[key];
    if (Number(a) !== Number(b)) {
      profile.push({
        label,
        from: kind === "money" ? inr(Number(a)) : num(Number(a)),
        to: kind === "money" ? inr(Number(b)) : num(Number(b)),
      });
    }
  });

  const risk: FieldChange[] = [];
  RISK_FIELDS.forEach(([key, label]) => {
    const a = from.inputs.riskAnswers?.[key];
    const b = to.inputs.riskAnswers?.[key];
    if (Number(a) !== Number(b)) risk.push({ label, from: `${a}/5`, to: `${b}/5` });
  });

  const goals: FieldChange[] = [];
  const goalKey = (g: Goal) => g.name || g.category;
  const fromGoals = new Map((from.inputs.goals ?? []).map((g) => [goalKey(g), g]));
  const toGoals = new Map((to.inputs.goals ?? []).map((g) => [goalKey(g), g]));
  toGoals.forEach((g, k) => {
    const prev = fromGoals.get(k);
    if (!prev) {
      goals.push({ label: `${k} (added)`, from: "—", to: `${inr(g.currentCost)} by ${g.targetYear}` });
      return;
    }
    if (prev.currentCost !== g.currentCost || prev.targetYear !== g.targetYear || prev.monthlyContribution !== g.monthlyContribution) {
      goals.push({
        label: k,
        from: `${inr(prev.currentCost)} by ${prev.targetYear}, ${inr(prev.monthlyContribution)}/m`,
        to: `${inr(g.currentCost)} by ${g.targetYear}, ${inr(g.monthlyContribution)}/m`,
      });
    }
  });
  fromGoals.forEach((g, k) => {
    if (!toGoals.has(k)) goals.push({ label: `${k} (removed)`, from: `${inr(g.currentCost)} by ${g.targetYear}`, to: "—" });
  });

  const holdings: HoldingChange[] = [];
  const fromFunds = new Map((from.inputs.funds ?? []).map((f) => [f.schemeName, f]));
  const toFunds = new Map((to.inputs.funds ?? []).map((f) => [f.schemeName, f]));
  toFunds.forEach((f, name) => {
    const prev = fromFunds.get(name);
    if (!prev) {
      holdings.push({
        scheme: name,
        kind: "added",
        changes: [{ label: "SIP", from: "—", to: `${inr(f.sipAmount)}/m` }, { label: "Value", from: "—", to: inr(f.currentValue) }],
      });
      return;
    }
    const changes: FieldChange[] = [];
    if (prev.sipAmount !== f.sipAmount) changes.push({ label: "Monthly SIP", from: `${inr(prev.sipAmount)}/m`, to: `${inr(f.sipAmount)}/m` });
    if (prev.currentValue !== f.currentValue) changes.push({ label: "Current value", from: inr(prev.currentValue), to: inr(f.currentValue) });
    if (prev.investedAmount !== f.investedAmount) changes.push({ label: "Invested", from: inr(prev.investedAmount), to: inr(f.investedAmount) });
    if (prev.assetBucket !== f.assetBucket) changes.push({ label: "Bucket", from: prev.assetBucket, to: f.assetBucket });
    if (prev.role !== f.role) changes.push({ label: "Role", from: prev.role, to: f.role });
    if (changes.length) holdings.push({ scheme: name, kind: "changed", changes });
  });
  fromFunds.forEach((f, name) => {
    if (!toFunds.has(name)) {
      holdings.push({
        scheme: name,
        kind: "removed",
        changes: [{ label: "SIP", from: `${inr(f.sipAmount)}/m`, to: "—" }, { label: "Value", from: inr(f.currentValue), to: "—" }],
      });
    }
  });

  const outputs: FieldChange[] = [];
  const a = from.output;
  const b = to.output;
  if (a && b) {
    const push = (label: string, x: string | number, y: string | number) => {
      if (String(x) !== String(y)) outputs.push({ label, from: String(x), to: String(y) });
    };
    push("Fit score", `${a.scores.fitScore}/100`, `${b.scores.fitScore}/100`);
    push("Complexity", `${a.scores.complexityScore} (${a.scores.complexityBand})`, `${b.scores.complexityScore} (${b.scores.complexityBand})`);
    push("Risk profile", a.risk.finalProfile, b.risk.finalProfile);
    push("Binding constraint", a.risk.bindingConstraint, b.risk.bindingConstraint);
    push("Equity range", `${a.risk.equityRange[0]}–${a.risk.equityRange[1]}%`, `${b.risk.equityRange[0]}–${b.risk.equityRange[1]}%`);
    push("Portfolio value", inr(a.totals.currentValue), inr(b.totals.currentValue));
    push("Monthly SIP", `${inr(a.totals.currentSip)}/m`, `${inr(b.totals.currentSip)}/m`);
    push("Actions raised", a.sipPlan.filter((s) => s.action !== "KEEP").length, b.sipPlan.filter((s) => s.action !== "KEEP").length);
  } else if (a || b) {
    outputs.push({ label: "Engine output", from: a ? "captured" : "not captured", to: b ? "captured" : "not captured" });
  }

  return {
    from,
    to,
    profile,
    risk,
    goals,
    holdings,
    outputs,
    unchanged: !profile.length && !risk.length && !goals.length && !holdings.length && !outputs.length,
  };
};
