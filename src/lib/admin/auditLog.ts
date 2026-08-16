import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "role_granted"
  | "role_revoked"
  | "invite_created"
  | "invite_revoked"
  | "scenario_export";

/**
 * Writes an entry to the admin audit trail. Role grants/revokes are also logged
 * by a database trigger, so this is used for app-level actions (exports, invites).
 * Failures are swallowed — auditing must never block the user's action.
 */
export const logAdminAction = async (
  action: AuditAction,
  details: string,
  metadata: Record<string, unknown> = {},
  targetEmail?: string | null,
) => {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      action,
      actor_id: user.id,
      actor_email: user.email ?? null,
      target_email: targetEmail ?? null,
      details,
      metadata: metadata as never,
    });
  } catch {
    // no-op
  }
};
