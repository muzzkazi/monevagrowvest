import { supabase } from "@/integrations/supabase/client";
import type { PiRunInputs } from "@/lib/pi/runs";

/* ── Server-side draft store ────────────────────────────────────────────────
 * The in-progress Portfolio Intelligence form is mirrored to `pi_drafts` so a
 * review can be resumed on another device/browser, or after localStorage is
 * cleared. One draft per client (plus one unlinked draft per advisor). */

export type ServerDraft = PiRunInputs & {
  runName: string;
  tab?: string;
  updatedAt: string;
};

type Row = {
  run_name: string;
  step: string | null;
  profile: unknown;
  goals: unknown;
  risk_answers: unknown;
  constraints: unknown;
  funds: unknown;
  additional_sip: number | string | null;
  declared_sip_budget: number | string | null;
  updated_at: string;
};

const toDraft = (row: Row): ServerDraft => ({
  runName: row.run_name ?? "Untitled run",
  tab: row.step ?? undefined,
  profile: (row.profile ?? {}) as ServerDraft["profile"],
  goals: (row.goals ?? []) as ServerDraft["goals"],
  riskAnswers: (row.risk_answers ?? {}) as ServerDraft["riskAnswers"],
  constraints: (row.constraints ?? {}) as ServerDraft["constraints"],
  funds: (row.funds ?? []) as ServerDraft["funds"],
  additionalSip: Number(row.additional_sip ?? 0),
  declaredSipBudget: Number(row.declared_sip_budget ?? 0),
  updatedAt: row.updated_at,
});

const SELECT =
  "run_name, step, profile, goals, risk_answers, constraints, funds, additional_sip, declared_sip_budget, updated_at";

/** Fetch the stored draft for a client (or the advisor's unlinked draft). */
export const fetchServerDraft = async (clientId: string | null): Promise<ServerDraft | null> => {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  let q = supabase.from("pi_drafts").select(SELECT);
  q = clientId ? q.eq("client_id", clientId) : q.is("client_id", null).eq("owner_id", uid);

  const { data, error } = await q.order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error || !data) return null;
  return toDraft(data as Row);
};

/** Upsert the draft. Silently no-ops for read-only advisors (RLS denies write). */
export const saveServerDraft = async (
  clientId: string | null,
  draft: PiRunInputs & { runName: string; tab?: string },
): Promise<Date | null> => {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  const payload = {
    client_id: clientId,
    owner_id: uid,
    run_name: draft.runName ?? "Untitled run",
    step: draft.tab ?? null,
    profile: draft.profile as unknown as Record<string, unknown>,
    goals: draft.goals as unknown as Record<string, unknown>[],
    risk_answers: draft.riskAnswers as unknown as Record<string, unknown>,
    constraints: draft.constraints as unknown as Record<string, unknown>,
    funds: draft.funds as unknown as Record<string, unknown>[],
    additional_sip: draft.additionalSip ?? 0,
    declared_sip_budget: draft.declaredSipBudget ?? 0,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("pi_drafts")
    .upsert(payload as never, { onConflict: clientId ? "client_id" : "owner_id" });
  if (error) return null;
  return new Date();
};

/** Remove the stored draft (used by "Clear draft"). */
export const deleteServerDraft = async (clientId: string | null): Promise<void> => {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  let q = supabase.from("pi_drafts").delete();
  q = clientId ? q.eq("client_id", clientId) : q.is("client_id", null).eq("owner_id", uid);
  await q;
};

/** Client ids that currently have a resumable draft, with last-updated time. */
export const fetchDraftClientIds = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase
    .from("pi_drafts")
    .select("client_id, updated_at")
    .not("client_id", "is", null);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  data.forEach((r) => {
    if (r.client_id) map[r.client_id] = r.updated_at as string;
  });
  return map;
};
