import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";

// GET /api/admin/students/restorable-resets
//
// Returns the recent `reset_progress_all` admin actions that haven't
// been restored yet — these are the ones a teacher can still undo.
// Powers the "Restore" list on /admin/tools.
//
// Each row carries:
//   - id: the admin_actions row id (pass to /restore-progress)
//   - createdAt: when the reset happened
//   - actorEmail: who clicked the button
//   - moduleNumber: the module scope (null = all modules)
//   - deletedRows: how many rows were wiped
//   - scope: human-readable scope label
//   - snapshotSize: how many rows are in the snapshot (usually ==
//     deletedRows unless the snapshot was trimmed)
//
// The raw `snapshot` is intentionally NOT returned — it can be multi-MB
// and the UI doesn't need it to decide whether to restore.
//
// Auth: admin-only.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { data, error } = await supabase
    .from("admin_actions")
    .select("id, actor_email, details, created_at")
    .eq("action", "reset_progress_all")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    // Table missing = migration pending. Return empty list so the
    // UI shows "no restorable resets yet" instead of erroring.
    if (/relation.*admin_actions|42P01/i.test(error.message)) {
      return Response.json({ rows: [], migrationPending: true });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  type Row = {
    id: number;
    actor_email: string;
    details: {
      restored?: boolean;
      restoredAt?: string;
      deletedRows?: number;
      moduleNumber?: number | null;
      topicId?: number | null;
      scope?: string;
      snapshot?: unknown[];
    } | null;
    created_at: string;
  };

  const rows = ((data ?? []) as Row[])
    .filter((r) => !r.details?.restored)
    // Must have a snapshot present — legacy entries (before snapshot
    // storage was added) can't be restored.
    .filter((r) => Array.isArray(r.details?.snapshot) && (r.details!.snapshot!.length ?? 0) > 0)
    .map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      actorEmail: r.actor_email,
      moduleNumber: r.details?.moduleNumber ?? null,
      // topicId is only present on per-topic resets (newer ones). Null
      // on module-wide and all-modules resets so the UI shows the
      // right label variant.
      topicId: r.details?.topicId ?? null,
      deletedRows: r.details?.deletedRows ?? 0,
      scope: r.details?.scope ?? "unknown",
      snapshotSize: Array.isArray(r.details?.snapshot)
        ? r.details!.snapshot!.length
        : 0,
    }));

  return Response.json({ rows });
}
