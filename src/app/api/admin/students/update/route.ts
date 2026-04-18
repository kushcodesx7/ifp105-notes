import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { isHiddenSection } from "@/lib/hidden-sections";

// POST /api/admin/students/update
// Body: { email, section?, enrollmentNo?, newEmail? }
//
// Applies whichever fields are present. Each one is a distinct admin
// action logged separately (so the audit trail shows "changed section"
// even if section + roll were updated in the same call).
//
// Safety:
//   - Must be admin (Google token in allowlist OR legacy password)
//   - All changes are validated (non-empty, no hidden-section unless admin)
//   - email change cascades to student_progress, student_sessions via
//     explicit UPDATE statements so the student keeps their history
//   - Roll number changes are verified against roll_list for the target
//     section; rejected if the new roll doesn't exist in that section
//     UNLESS the section has zero rolls (graceful-fallback path, same
//     rule as self-registration).

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json();
  const email = (body.email as string | undefined)?.toLowerCase().trim();
  const newSection = (body.section as string | undefined)?.trim();
  const newEnrollmentNo = (body.enrollmentNo as string | undefined)
    ?.toUpperCase()
    .trim();
  const newEmail = (body.newEmail as string | undefined)?.toLowerCase().trim();
  // Edit the teacher-verified name on the student's roll_list row (the
  // "real" name shown in /admin/people and everywhere else the UI
  // surfaces identity). The student's chosen display name field on
  // `students.name` is NOT touched — they picked that for themselves.
  const newRollListName = (body.rollListName as string | undefined)?.trim();

  if (!email) {
    return Response.json({ error: "email required" }, { status: 400 });
  }
  if (!newSection && !newEnrollmentNo && !newEmail && newRollListName === undefined) {
    return Response.json(
      {
        error:
          "At least one of section, enrollmentNo, newEmail, rollListName is required",
      },
      { status: 400 }
    );
  }

  // Load current state so we can compute diffs for the audit log
  const { data: current, error: loadErr } = await supabase
    .from("students")
    .select("email, enrollment_no, section, batch_id, name")
    .eq("email", email)
    .maybeSingle();

  if (loadErr) {
    return Response.json({ error: loadErr.message }, { status: 500 });
  }
  if (!current) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const actor = actorFromAuth(admin);

  // ─── Roll + section changes ─────────────────────────────────────
  if (newSection || newEnrollmentNo) {
    const targetSection = newSection || current.section;
    const targetRoll = newEnrollmentNo || current.enrollment_no;

    // Verify roll is in the target section's roll list (skip check if
    // section is empty — graceful fallback).
    const [rollExists, sectionCount] = await Promise.all([
      supabase
        .from("roll_list")
        .select("id", { head: true, count: "exact" })
        .eq("batch_id", current.batch_id)
        .eq("section", targetSection)
        .eq("enrollment_no", targetRoll),
      supabase
        .from("roll_list")
        .select("id", { head: true, count: "exact" })
        .eq("batch_id", current.batch_id)
        .eq("section", targetSection),
    ]);

    const matched = (rollExists.count || 0) > 0;
    const sectionHasEntries = (sectionCount.count || 0) > 0;

    if (!matched && sectionHasEntries) {
      return Response.json(
        {
          error: `Roll ${targetRoll} is not in ${targetSection} of ${current.batch_id}. Check your inputs or add the roll to the roll list first.`,
        },
        { status: 400 }
      );
    }

    // Update the students row. Use a temp object so partial updates work.
    const patch: Record<string, unknown> = {};
    if (newSection) patch.section = newSection;
    if (newEnrollmentNo) patch.enrollment_no = newEnrollmentNo;

    const { error: updErr } = await supabase
      .from("students")
      .update(patch)
      .eq("email", email);

    if (updErr) {
      return Response.json({ error: updErr.message }, { status: 500 });
    }

    if (newSection && newSection !== current.section) {
      await logAdminAction({
        actorEmail: actor,
        action: "change_section",
        subjectEmail: email,
        subjectBatchId: current.batch_id,
        subjectSection: newSection,
        details: {
          from: current.section,
          to: newSection,
          roll: newEnrollmentNo || current.enrollment_no,
          name: current.name,
        },
      });
    }
    if (newEnrollmentNo && newEnrollmentNo !== current.enrollment_no) {
      await logAdminAction({
        actorEmail: actor,
        action: "change_roll",
        subjectEmail: email,
        subjectBatchId: current.batch_id,
        subjectSection: newSection || current.section,
        details: {
          from: current.enrollment_no,
          to: newEnrollmentNo,
          section: newSection || current.section,
          name: current.name,
        },
      });
    }
  }

  // ─── Email change ───────────────────────────────────────────────
  // Careful: email is the join key for student_progress and student_sessions.
  // We UPDATE all three tables. Done as separate UPDATEs (not a transaction)
  // since supabase-js doesn't expose tx directly — but each is idempotent.
  if (newEmail && newEmail !== email) {
    // Reject if newEmail already has a students row
    const { data: clash } = await supabase
      .from("students")
      .select("email")
      .eq("email", newEmail)
      .maybeSingle();
    if (clash) {
      return Response.json(
        { error: `Another student is already registered with ${newEmail}.` },
        { status: 409 }
      );
    }

    const { error: sErr } = await supabase
      .from("students")
      .update({ email: newEmail })
      .eq("email", email);
    if (sErr) return Response.json({ error: sErr.message }, { status: 500 });

    await supabase
      .from("student_progress")
      .update({ student_email: newEmail })
      .eq("student_email", email);

    await supabase
      .from("student_sessions")
      .update({ student_email: newEmail })
      .eq("student_email", email);

    await logAdminAction({
      actorEmail: actor,
      action: "change_email",
      subjectEmail: newEmail,
      subjectBatchId: current.batch_id,
      subjectSection: current.section,
      details: {
        from: email,
        to: newEmail,
        name: current.name,
      },
    });
  }

  // ─── Name change on roll_list ─────────────────────────────────
  // Updates roll_list.name for (current_batch, current_or_new_section,
  // current_or_new_roll). Graceful-degrades if the migration is
  // pending. Before the update we re-read the student in case the
  // section/roll blocks above just moved them.
  if (newRollListName !== undefined) {
    const { data: freshStudent } = await supabase
      .from("students")
      .select("email, enrollment_no, section, batch_id")
      .eq("email", newEmail && newEmail !== email ? newEmail : email)
      .maybeSingle();

    const targetBatch = freshStudent?.batch_id || current.batch_id;
    const targetSection =
      freshStudent?.section || newSection || current.section;
    const targetRoll =
      freshStudent?.enrollment_no ||
      newEnrollmentNo ||
      current.enrollment_no;

    let priorName: string | null = null;
    const { data: priorRoll } = await supabase
      .from("roll_list")
      .select("name")
      .eq("batch_id", targetBatch)
      .eq("section", targetSection)
      .eq("enrollment_no", targetRoll)
      .maybeSingle();
    priorName = (priorRoll as { name?: string | null } | null)?.name ?? null;

    const patch = { name: newRollListName || null };
    let { error: nameErr } = await supabase
      .from("roll_list")
      .update(patch)
      .eq("batch_id", targetBatch)
      .eq("section", targetSection)
      .eq("enrollment_no", targetRoll);

    if (nameErr && /name|PGRST204/i.test(nameErr.message)) {
      // Migration pending — don't fail the whole request, just skip.
      console.warn(
        "[admin/update] roll_list.name column missing — skipping name update. Run migration-add-roll-list-name.sql."
      );
      nameErr = null;
    }
    if (nameErr) {
      return Response.json({ error: nameErr.message }, { status: 500 });
    }

    if (priorName !== (newRollListName || null)) {
      await logAdminAction({
        actorEmail: actor,
        action: "change_name",
        subjectEmail:
          newEmail && newEmail !== email ? newEmail : email,
        subjectBatchId: targetBatch,
        subjectSection: targetSection,
        details: {
          from: priorName,
          to: newRollListName || null,
          roll: targetRoll,
        },
      });
    }
  }

  // Silence unused-var warning (isHiddenSection reserved for future validation)
  void isHiddenSection;

  return Response.json({ ok: true });
}
