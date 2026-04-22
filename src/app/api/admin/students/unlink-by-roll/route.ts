import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/admin/students/unlink-by-roll
// Body: { enrollmentNo, batchId?, dryRun? }
//
// Teacher-friendly companion to /api/admin/students/unlink. Instead of
// needing the student's email (which the teacher usually doesn't
// know when the problem is "someone else claimed their roll"), this
// endpoint takes a ROLL NUMBER and returns who owns it. If dryRun is
// true, it JUST returns the lookup result. Otherwise it also deletes
// the claiming students row so the real owner can re-register.
//
// Use case (Apr 2026):
//   Student Bexzod tries to register with roll A85456325219 but sees
//   a 'duplicate key' error because another email already claimed
//   that roll. Teacher opens /admin/tools, types the roll number into
//   the "Unlink stuck roll" card, sees 'currently owned by X@gmail.com
//   (name Y)'. If that's wrong, clicks Unlink → row deleted →
//   Bexzod retries → succeeds.
//
// Safe by design:
//   - Dry-run first so the admin SEES the owner before confirming
//   - Same underlying behaviour as /api/admin/students/unlink
//     (deletes students row, leaves student_progress rows intact —
//     if the real owner later re-registers with the same email +
//     same roll, their historical progress auto-reattaches)
//   - Audit log entry is identical to unlink, so /admin/tools log
//     view shows "Account unlinked" for either path
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  // Defense-in-depth rate limit — mirrors /admin/students/unlink.
  // Dry-run calls also consume quota so a script can't enumerate
  // the whole roll_list by hammering the lookup path.
  const rl = await rateLimit({
    bucket: "admin:destructive:unlink-by-roll",
    id: actorFromAuth(admin),
    limit: 60,
    windowSec: 300,
  });
  if (!rl.ok) return rateLimitResponse(rl, 60);

  const body = await req.json().catch(() => ({}));
  const enrollmentNo =
    typeof body.enrollmentNo === "string" && body.enrollmentNo.trim()
      ? body.enrollmentNo.trim().toUpperCase()
      : null;
  const batchId =
    typeof body.batchId === "string" && body.batchId.trim()
      ? body.batchId.trim()
      : null;
  const dryRun = !!body.dryRun;

  if (!enrollmentNo) {
    return Response.json(
      { error: "enrollmentNo required (the roll number)" },
      { status: 400 }
    );
  }

  // Look up who's currently registered with this roll number. If
  // batchId is omitted, search globally (useful when the admin doesn't
  // remember which batch the student is supposed to be in). The
  // UNIQUE constraint is on (batch_id, enrollment_no) so global
  // lookup can return multiple rows — rare but possible if the same
  // roll number is used in two batches.
  let q = supabase
    .from("students")
    .select("email, name, batch_id, section, enrollment_no, added_at")
    .eq("enrollment_no", enrollmentNo);
  if (batchId) q = q.eq("batch_id", batchId);
  const { data: matches, error: lookupErr } = await q;
  if (lookupErr) {
    return Response.json({ error: lookupErr.message }, { status: 500 });
  }

  const rows = (matches ?? []) as Array<{
    email: string;
    name: string | null;
    batch_id: string | null;
    section: string | null;
    enrollment_no: string;
    added_at: string | null;
  }>;

  if (rows.length === 0) {
    return Response.json({
      ok: true,
      dryRun,
      enrollmentNo,
      owners: [],
      message:
        "No one is currently registered with this roll number. It's free — the student can register now.",
    });
  }

  // Always return the owner list so the caller can display them.
  const owners = rows.map((r) => ({
    email: r.email,
    name: r.name,
    batchId: r.batch_id,
    section: r.section,
    addedAt: r.added_at,
  }));

  if (dryRun) {
    return Response.json({
      ok: true,
      dryRun: true,
      enrollmentNo,
      owners,
      message: `${rows.length} account${rows.length === 1 ? "" : "s"} currently own${rows.length === 1 ? "s" : ""} this roll number.`,
    });
  }

  // Actual unlink: delete every matching students row. Same rules as
  // the per-email unlink — progress (student_progress) + sessions
  // stay under the old email. If the real owner later re-registers
  // with their email + this roll, their history reattaches.
  const emailsToUnlink = rows.map((r) => r.email);
  const { error: delErr } = await supabase
    .from("students")
    .delete()
    .in("email", emailsToUnlink);
  if (delErr) {
    return Response.json({ error: delErr.message }, { status: 500 });
  }

  // One audit-log entry per unlinked email so the log view shows
  // each account separately. Matches the shape /api/admin/students/
  // unlink uses, so /admin/tools formatter works unchanged.
  for (const row of rows) {
    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "unlink",
      subjectEmail: row.email,
      subjectBatchId: row.batch_id,
      subjectSection: row.section,
      details: {
        name: row.name,
        enrollmentNo: row.enrollment_no,
        via: "unlink-by-roll",
      },
    });
  }

  return Response.json({
    ok: true,
    enrollmentNo,
    unlinkedCount: rows.length,
    owners,
    message:
      rows.length === 1
        ? `Unlinked ${rows[0].email}. The real owner can register now.`
        : `Unlinked ${rows.length} accounts. The real owner can register now.`,
  });
}
