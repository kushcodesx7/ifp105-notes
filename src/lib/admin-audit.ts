import { supabase } from "@/lib/supabase";

// Admin action log — writes every destructive/sensitive action to the
// admin_actions table. Used by every admin-mutation endpoint so the
// teacher can reconstruct what changed and when.
//
// Gracefully degrades if the admin_actions migration hasn't run yet —
// logs a warning to the server console and returns without throwing.
// The mutating action itself still succeeds; only the audit trail is
// missing until the migration is applied.

export type AdminActionKind =
  | "change_section"
  | "change_roll"
  | "change_email"
  | "reset_progress"
  | "unlink"
  | "delete_student"
  | "create_batch"
  | "add_rolls"
  | "remove_rolls"
  | "rename_section"
  | "delete_section";

export interface LogAdminActionInput {
  actorEmail: string;
  action: AdminActionKind;
  subjectEmail?: string | null;
  subjectBatchId?: string | null;
  subjectSection?: string | null;
  details?: Record<string, unknown>;
}

export async function logAdminAction(input: LogAdminActionInput): Promise<void> {
  try {
    const { error } = await supabase.from("admin_actions").insert({
      actor_email: input.actorEmail,
      action: input.action,
      subject_email: input.subjectEmail ?? null,
      subject_batch_id: input.subjectBatchId ?? null,
      subject_section: input.subjectSection ?? null,
      details: input.details ?? {},
    });

    if (error) {
      // "relation does not exist" means the migration hasn't run yet.
      // Don't explode — just note it and move on.
      if (/relation.*admin_actions|42P01/i.test(error.message)) {
        console.warn(
          "[admin-audit] admin_actions table missing — run migration-add-admin-actions.sql"
        );
      } else {
        console.error("[admin-audit] insert failed:", error.message);
      }
    }
  } catch (e) {
    // Never let audit logging break the actual operation
    console.error("[admin-audit] threw:", e);
  }
}

/**
 * Extracts the best actor identifier from the auth outcome.
 * - If Google ID token: the verified admin's email.
 * - If legacy password (no token): a stable "password-admin" label.
 */
export function actorFromAuth(info: {
  email?: string | null;
  viaPassword?: boolean;
}): string {
  if (info.email) return info.email;
  if (info.viaPassword) return "password-admin";
  return "unknown-admin";
}
