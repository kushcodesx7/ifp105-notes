import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";

// POST /api/admin/students/preview-reset
// Body: { moduleNumber?: number | null, topicId?: number | null }
//
// Dry-run helper for the reset-all-progress card on /admin/tools.
// Returns the row count that WOULD be deleted for the given scope,
// WITHOUT touching any data. Teacher can confirm the damage before
// typing the arm phrase.
//
// Scope semantics match the real reset endpoint:
//   both null     → count every row in student_progress
//   moduleNumber  → count that module across all students
//   + topicId     → count just that topic in that module
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

  // HEAD query with exact count — no row transfer, just a number.
  // Matches the same .neq("student_email", "") + optional module +
  // optional topic filters the real reset uses, so the preview is
  // always the exact count that would be deleted if the admin
  // confirmed right now.
  let q = supabase
    .from("student_progress")
    .select("*", { count: "exact", head: true })
    .neq("student_email", "");
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
  });
}
