import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireSelf } from "@/lib/verify-google-token";
import { getCourseIdBySlug, CURRENT_COURSE_SLUG } from "@/lib/course-registry";

// GET — return all batches with public student listings.
//
// Public endpoint (no auth). So we must NOT expose student emails — those
// go through /api/connect which strips/controls PII. Emails are harvestable
// spam fuel and also the key to impersonation elsewhere.
//
// Also: was N+1 (per-batch student query). Collapsed to a single query that
// groups in-memory. Monday load = 218 × first-page hit, so this matters.
export async function GET() {
  // One query for batches + one for ALL students. O(batches + students).
  const [batchRes, studentsRes] = await Promise.all([
    supabase
      .from("batches")
      .select("id, name, accent, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("students")
      .select("enrollment_no, name, linkedin_url, added_at, batch_id")
      .order("added_at", { ascending: true }),
  ]);

  if (batchRes.error) {
    return Response.json({ error: batchRes.error.message }, { status: 500 });
  }

  const byBatch = new Map<string, typeof studentsRes.data>();
  for (const s of studentsRes.data || []) {
    const key = s.batch_id as string;
    if (!byBatch.has(key)) byBatch.set(key, []);
    byBatch.get(key)!.push(s);
  }

  const result = (batchRes.data || []).map((batch) => {
    const students = byBatch.get(batch.id) || [];
    return {
      id: batch.id,
      name: batch.name,
      accent: batch.accent,
      studentCount: students.length,
      students: students.map((s) => ({
        enrollmentNo: s.enrollment_no,
        name: s.name,
        // email intentionally omitted — see /api/connect for auth'd feed
        linkedinUrl: s.linkedin_url,
        addedAt: s.added_at,
      })),
    };
  });

  return Response.json(
    { batches: result },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}

// POST — student registers (batch + section + roll number + name + linkedin)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { batchId, section, enrollmentNo, name, email, linkedinUrl, photoUrl } = body;

  if (!batchId || !section || !enrollmentNo || !name || !email) {
    return Response.json(
      { error: "Missing required fields: batchId, section, enrollmentNo, name, email" },
      { status: 400 }
    );
  }

  // Auth: registering student must own the email they claim
  const auth = await requireSelf(req, email);
  if (!auth.ok) return auth.response;

  // LinkedIn URL is optional but if provided, validate it.
  // Permissive: accepts query strings, trailing slashes, non-Latin handles.
  if (linkedinUrl && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[^/\s?#]+/i.test(linkedinUrl)) {
    return Response.json(
      { error: "Invalid LinkedIn URL. Use format: https://linkedin.com/in/yourname" },
      { status: 400 }
    );
  }

  // Check batch exists
  const { data: batch } = await supabase
    .from("batches")
    .select("id")
    .eq("id", batchId)
    .single();

  if (!batch) {
    return Response.json({ error: "Batch not found" }, { status: 404 });
  }

  // Roll-list validation is a TWO-STEP check so students aren't blocked when
  // the teacher hasn't imported their section's roll list yet.
  //
  // Step 1: look for the student's enrollment in roll_list for the chosen
  //         section. If found → great, proceed.
  // Step 2: if not found, check whether the section has ANY roll_list entries.
  //         - Section has entries: the student's roll is genuinely missing →
  //           block them (prevents typos and impersonation for sections that
  //           ARE imported).
  //         - Section is empty: teacher hasn't imported it yet → allow
  //           registration as a graceful fallback (teacher reconciles later
  //           via /admin/batches).
  const { data: roll } = await supabase
    .from("roll_list")
    .select("id")
    .eq("batch_id", batchId)
    .eq("section", section)
    .eq("enrollment_no", enrollmentNo.toUpperCase())
    .maybeSingle();

  if (!roll) {
    // Step 2: does this section have any roll_list entries at all?
    const { count: sectionRollCount } = await supabase
      .from("roll_list")
      .select("id", { count: "exact", head: true })
      .eq("batch_id", batchId)
      .eq("section", section);

    if ((sectionRollCount || 0) > 0) {
      // Section is populated but this roll isn't in it → real mismatch
      return Response.json(
        {
          error: `Roll number ${enrollmentNo.toUpperCase()} is not in ${section} of ${batchId}. Please double-check your section and enrollment number with your teacher.`,
        },
        { status: 403 }
      );
    }
    // Section has zero roll_list entries — roll list hasn't been imported yet.
    // Allow registration; teacher can verify/reconcile later via /admin/roster.
  }

  // Check if this email is already registered with a DIFFERENT roll number
  // (prevents using someone else's account to fake identity)
  const { data: existing } = await supabase
    .from("students")
    .select("enrollment_no, batch_id, section")
    .eq("email", email)
    .maybeSingle();

  if (existing && existing.enrollment_no !== enrollmentNo.toUpperCase()) {
    return Response.json(
      {
        error: `This email is already registered with roll ${existing.enrollment_no}. Roll number is locked and cannot be changed. Contact your instructor if this is a mistake.`,
      },
      { status: 409 }
    );
  }

  // Also block silent batch/section changes via re-registration. If someone
  // already registered their email to BatchA/Section2, don't let them quietly
  // re-run the flow and move themselves to BatchB/Section1. The onConflict
  // upsert below would do that silently otherwise.
  if (
    existing &&
    (existing.batch_id !== batchId || existing.section !== section)
  ) {
    return Response.json(
      {
        error: `Your account is already registered in ${existing.batch_id} / ${existing.section}. Contact your instructor to change batch or section.`,
      },
      { status: 409 }
    );
  }

  // Upsert student (legacy per-student table — kept as identity source).
  const { error } = await supabase.from("students").upsert(
    {
      batch_id: batchId,
      section,
      enrollment_no: enrollmentNo.toUpperCase(),
      name,
      email,
      linkedin_url: linkedinUrl || null,
      photo_url: photoUrl || null,
      added_at: new Date().toISOString().split("T")[0],
    },
    { onConflict: "email" }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Phase 3: also write to the `enrollments` junction table so the DB
  // tracks (student, course, batch) tuples. Existing registrations are
  // backfilled as part of the Phase 3 migration — this write handles
  // NEW registrations going forward.
  //
  // Graceful degrade: if the enrollments table or `course_id` lookup
  // fails (migration not applied), skip the write and log a warning.
  // The student row above is the authoritative source today; enrollments
  // is additive data that becomes authoritative in Phase 4.
  try {
    const courseId = await getCourseIdBySlug(CURRENT_COURSE_SLUG);
    if (courseId) {
      const { error: enrollErr } = await supabase.from("enrollments").upsert(
        {
          student_email: email,
          course_id: courseId,
          batch_id: batchId,
          section,
          enrollment_no: enrollmentNo.toUpperCase(),
          added_at: new Date().toISOString().split("T")[0],
          active: true,
        },
        { onConflict: "student_email,course_id,batch_id" }
      );
      if (enrollErr) {
        console.warn(
          "[register] enrollments upsert failed — skipping. Run migration-phase3-multi-course.sql if this is new.",
          enrollErr.message
        );
      }
    }
  } catch (e) {
    console.warn("[register] enrollments write threw — ignoring:", e);
  }

  return Response.json({ success: true });
}
