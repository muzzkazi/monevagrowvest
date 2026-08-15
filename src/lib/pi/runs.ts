// Per-client persistence for Portfolio Intelligence wizard runs.
//
// Only the captured INPUTS are the source of truth. The engine output is stored
// alongside them purely as a snapshot of what the advisor saw; re-opening a run
// re-runs the deterministic engine on the saved inputs so the outputs shown are
// always reproducible from the same code path.

import { supabase } from "@/integrations/supabase/client";
import { ClientProfile, Constraints, EngineOutput, Goal, PortfolioFund, RiskAnswers } from "./types";

export interface PiRunInputs {
  profile: ClientProfile;
  goals: Goal[];
  riskAnswers: RiskAnswers;
  constraints: Constraints;
  funds: PortfolioFund[];
  additionalSip: number;
  declaredSipBudget: number;
}

export interface PiRunSummary {
  id: string;
  clientId: string | null;
  runName: string;
  createdAt: string;
  updatedAt: string;
  assumedReturnPct: number | null;
  snapshotFitScore: number | null;
}

export interface PiRun extends PiRunSummary {
  inputs: PiRunInputs;
  snapshot: EngineOutput | null;
}

const toSummary = (row: Record<string, unknown>): PiRunSummary => ({
  id: row.id as string,
  clientId: (row.client_id as string | null) ?? null,
  runName: (row.run_name as string) ?? "Untitled run",
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
  assumedReturnPct: row.assumed_return_pct != null ? Number(row.assumed_return_pct) : null,
  snapshotFitScore:
    (row.output as EngineOutput | null)?.scores?.fitScore != null
      ? Number((row.output as EngineOutput).scores.fitScore)
      : null,
});

export const listRuns = async (clientId?: string | null): Promise<PiRunSummary[]> => {
  let query = supabase
    .from("pi_runs")
    .select("id, client_id, run_name, created_at, updated_at, assumed_return_pct, output")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toSummary(r as Record<string, unknown>));
};

export const loadRun = async (id: string): Promise<PiRun> => {
  const { data, error } = await supabase.from("pi_runs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Saved run not found");
  const row = data as Record<string, unknown>;

  return {
    ...toSummary(row),
    inputs: {
      profile: row.profile as ClientProfile,
      goals: (row.goals as Goal[]) ?? [],
      riskAnswers: row.risk_answers as RiskAnswers,
      constraints: row.constraints as Constraints,
      funds: (row.funds as PortfolioFund[]) ?? [],
      additionalSip: Number(row.additional_sip ?? 0),
      declaredSipBudget: Number(row.declared_sip_budget ?? 0),
    },
    snapshot: (row.output as EngineOutput | null) ?? null,
  };
};

export const saveRun = async (params: {
  id?: string | null;
  clientId?: string | null;
  runName: string;
  inputs: PiRunInputs;
  assumedReturnPct: number;
  output: EngineOutput | null;
}): Promise<string> => {
  const { data: auth } = await supabase.auth.getUser();
  // The jsonb columns accept any serialisable structure; the generated types
  // model them as Json, so the captured domain objects are cast once here.
  const asJson = (v: unknown) => JSON.parse(JSON.stringify(v ?? null)) as never;
  const payload = {
    client_id: params.clientId ?? null,
    run_name: params.runName.trim() || "Untitled run",
    profile: asJson(params.inputs.profile),
    goals: asJson(params.inputs.goals),
    risk_answers: asJson(params.inputs.riskAnswers),
    constraints: asJson(params.inputs.constraints),
    funds: asJson(params.inputs.funds),
    additional_sip: params.inputs.additionalSip,
    declared_sip_budget: params.inputs.declaredSipBudget,
    assumed_return_pct: params.assumedReturnPct,
    output: asJson(params.output),
    created_by: auth.user?.id ?? null,
  };

  if (params.id) {
    const { error } = await supabase.from("pi_runs").update(payload).eq("id", params.id);
    if (error) throw new Error(error.message);
    return params.id;
  }

  const { data, error } = await supabase.from("pi_runs").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
};

export const deleteRun = async (id: string) => {
  const { error } = await supabase.from("pi_runs").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
