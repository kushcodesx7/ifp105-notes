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
  // ── People / roster (Phase 1-2) ──
  | "change_section"
  | "change_roll"
  | "change_email"
  | "change_name"
  | "reset_progress"
  | "unlink"
  | "delete_student"
  | "create_batch"
  | "add_rolls"
  | "remove_rolls"
  | "rename_section"
  | "delete_section"
  // ── Course CMS (Phase 4) ──
  | "create_course"
  | "update_course"
  | "delete_course"
  | "create_module"
  | "update_module"
  | "delete_module"
  | "create_topic"
  | "update_topic"
  | "delete_topic"
  | "create_question"
  | "update_question"
  | "delete_question"
  // ── Trash (soft-delete layer) ──
  // Soft-delete variants fire from the regular DELETE endpoints when
  // the `?permanent=1` flag is absent. The `purge_*` + `restore_*`
  // pair fire from the /api/admin/trash/* endpoints.
  | "soft_delete_topic"
  | "soft_delete_question"
  | "restore_topic"
  | "restore_question"
  | "restore_flashcard"
  | "purge_topic"
  | "purge_question"
  | "purge_flashcard"
  // ── Content migration / one-shot actions (Phase 5.5) ──
  | "seed_ict"
  | "migrate_ts_flashcards";

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
        // eslint-disable-next-line no-console
        console.warn(
          "[admin-audit] admin_actions table missing — run migration-add-admin-actions.sql"
        );
      } else {
        const { logError } = await import("@/lib/log-error");
        logError("admin-audit.insert", new Error(error.message), {
          action: input.action,
          actorEmail: input.actorEmail,
        });
      }
    }
  } catch (e) {
    // Never let audit logging break the actual operation
    const { logError } = await import("@/lib/log-error");
    logError("admin-audit.threw", e, { action: input.action });
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
