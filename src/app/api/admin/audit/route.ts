import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import type { AdminActionKind } from "@/lib/admin-audit";

// GET /api/admin/audit
//
// Returns the admin_actions log with optional filters. Powers the audit log
// UI under /admin/tools. Graceful degrade: if the admin_actions table
// doesn't exist yet (migration not run), returns an empty array with a
// flag so the UI can show a 'run the migration' hint instead of crashing.
//
// Query params:
//   actor    — filter by actor_email (partial match)
//   action   — filter by action kind (exact)
//   subject  — filter by subject_email (partial match)
//   limit    — max rows (default 50, cap 500)
//   before   — ISO timestamp; only rows created before this (cursor for paging)
//
// Shape:
//   { rows: [...], migrationPending: false, nextBefore: string | null }

interface AuditRow {
  id: number;
  actor_email: string;
  action: AdminActionKind;
  subject_email: string | null;
  subject_batch_id: string | null;
  subject_section: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(req.url);
  // Cap inbound filter strings at a sane length. supabase-js parameterises
  // queries so SQL is safe, but there's no reason to let a 50KB `actor`
  // value travel all the way to the DB.
  const MAX_FILTER_LEN = 120;
  const actor =
    (searchParams.get("actor")?.trim() || "").slice(0, MAX_FILTER_LEN);
  const action =
    (searchParams.get("action")?.trim() || "").slice(0, MAX_FILTER_LEN);
  const subject =
    (searchParams.get("subject")?.trim() || "").slice(0, MAX_FILTER_LEN);
  const before =
    (searchParams.get("before")?.trim() || "").slice(0, MAX_FILTER_LEN);
  const limitRaw = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Math.max(1, Math.min(500, isNaN(limitRaw) ? 50 : limitRaw));

  let query = supabase
    .from("admin_actions")
    .select(
      "id, actor_email, action, subject_email, subject_batch_id, subject_section, details, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (actor) query = query.ilike("actor_email", `%${actor}%`);
  if (action) query = query.eq("action", action);
  if (subject) query = query.ilike("subject_email", `%${subject}%`);
  if (before) query = query.lt("created_at", before);

  const { data, error } = await query;

  if (error) {
    // Migration not applied yet → return well-formed empty payload + hint
    if (/relation.*admin_actions|42P01/i.test(error.message)) {
      return Response.json({ rows: [], migrationPending: true, nextBefore: null });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as AuditRow[];
  const nextBefore =
    rows.length === limit ? rows[rows.length - 1].created_at : null;

  return Response.json(
    { rows, migrationPending: false, nextBefore },
    {
      headers: {
        "Cache-Control": "private, max-age=10",
      },
    }
  );
}
