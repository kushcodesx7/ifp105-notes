import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";

// POST /api/admin/students/preview-reset
// Body: {
//   moduleNumber?: number | null,
//   topicId?: number | null,
//   batchId?: string | null,
//   section?: string | null
// }
//
// Dry-run helper for the reset-all-progress card on /admin/tools.
// Returns the row count that WOULD be deleted for the given scope,
// WITHOUT touching any data. Teacher can confirm the damage before
// typing the arm phrase.
//
// Scope semantics match the real reset endpoint:
//   all null          → count every row in student_progress
//   moduleNumber      → count that module across all students
//   + topicId         → count just that topic in that module
//   + batchId/section → narrow to a specific cohort's students
//
// Auth: admin-only.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json().catch(() => ({}));

  const rawMod = body.moduleNumber;
  const moduleNumber =
    typeof rawMod === "number" && Number.isFinite(rawMod) && rawMod > 0
      ? Math.floor(rawMod)
      : null;

  const rawTopic = body.topicId;
  const topicId =
    typeof rawTopic === "number" &&
    Number.isFinite(rawTopic) &&
    rawTopic > 0 &&
    moduleNumber != null
      ? Math.floor(rawTopic)
      : null;

  const batchId =
    typeof body.batchId === "string" && body.batchId.trim()
      ? body.batchId.trim()
      : null;
  const section =
    typeof body.section === "string" && body.section.trim()
      ? body.section.trim()
      : null;

  // Resolve the cohort first (if scoped). Mirrors the real reset
  // endpoint so the preview number matches exactly.
  let cohortEmails: string[] | null = null;
  let cohortSize: number | null = null;
  if (batchId || section) {
    let studentQuery = supabase.from("students").select("email");
    if (batchId) studentQuery = studentQuery.eq("batch_id", batchId);
    if (section) studentQuery = studentQuery.eq("section", section);
    const { data: cohort, error: cohortErr } = await studentQuery;
    if (cohortErr) {
      return Response.json({ error: cohortErr.message }, { status: 500 });
    }
    cohortEmails = (cohort ?? [])
      .map((r) => (r as { email: string | null }).email)
      .filter((e): e is string => !!e);
    cohortSize = cohortEmails.length;
    // Empty cohort → no rows match. Short-circuit; the Supabase
    // `.in([])` call with an empty array returns an error.
    if (cohortEmails.length === 0) {
      return Response.json({
        count: 0,
        moduleNumber,
        topicId,
        batchId,
        section,
        cohortSize: 0,
      });
    }
  }

  // HEAD query with exact count — no row transfer, just a number.
  // Matches the same filters the real reset uses, so the preview is
  // always the exact count that would be deleted if the admin
  // confirmed right now.
  let q = supabase
    .from("student_progress")
    .select("*", { count: "exact", head: true });
  if (cohortEmails) q = q.in("student_email", cohortEmails);
  else q = q.neq("student_email", "");
  if (moduleNumber != null) q = q.eq("module_number", moduleNumber);
  if (topicId != null) q = q.eq("topic_id", topicId);

  const { count, error } = await q;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    count: count ?? 0,
    moduleNumber,
    topicId,
    batchId,
    section,
    cohortSize,
  });
}
