import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireSelf } from "@/lib/verify-google-token";
import { getCourseIdBySlug } from "@/lib/course-registry";

// GET — Load student progress for a module in a specific course.
//
// Multi-course: `course` query param is optional and defaults to the
// platform's current course slug ("ict") for backward compat. If the
// courses table doesn't exist yet (Phase 3 migration not run), the
// filter degrades gracefully to email+module only — same rows return.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const module = searchParams.get("module");
  const courseSlug = (searchParams.get("course") || "ict").trim();

  if (!email || !module) {
    return Response.json(
      { error: "email and module query params required" },
      { status: 400 }
    );
  }

  const moduleNumber = parseInt(module, 10);
  if (isNaN(moduleNumber)) {
    return Response.json({ error: "Invalid module number" }, { status: 400 });
  }

  // Only a student can read their own progress. Audit-flagged pre-launch.
  const auth = await requireSelf(req, email);
  if (!auth.ok) return auth.response;

  // Resolve slug → UUID (cached). Null means either the course doesn't
  // exist or the migration hasn't run yet — in both cases we skip the
  // filter and fall back to email+module, matching legacy behaviour.
  const courseId = await getCourseIdBySlug(courseSlug);

  let query = supabase
    .from("student_progress")
    .select(
      "topic_id, completed, mcq_score, mcq_total, challenge_attempted, updated_at"
    )
    .eq("student_email", email)
    .eq("module_number", moduleNumber);

  if (courseId) query = query.eq("course_id", courseId);

  let { data, error } = await query;

  // If the filter fails because the `course_id` column doesn't exist
  // yet (migration pending), retry without it. PGRST102 is Supabase's
  // "column does not exist" response.
  if (
    error &&
    /course_id.*does not exist|column.*course_id|PGRST204|PGRST102/i.test(error.message)
  ) {
    console.warn(
      "[progress] course_id column missing — retrying without. Run migration-phase3-multi-course.sql."
    );
    ({ data, error } = await supabase
      .from("student_progress")
      .select(
        "topic_id, completed, mcq_score, mcq_total, challenge_attempted, updated_at"
      )
      .eq("student_email", email)
      .eq("module_number", moduleNumber));
  }

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const progress: Record<
    number,
    {
      completed: boolean;
      mcqScore: number | null;
      mcqTotal: number | null;
      challengeAttempted: boolean;
      updatedAt: string;
    }
  > = {};

  for (const row of data || []) {
    progress[row.topic_id] = {
      completed: row.completed,
      mcqScore: row.mcq_score,
      mcqTotal: row.mcq_total,
      challengeAttempted: row.challenge_attempted,
      updatedAt: row.updated_at,
    };
  }

  return Response.json({ progress });
}

// POST — Save/update progress for a topic.
//
// Multi-course: accepts an optional `courseSlug` in the body (defaults
// to "ict"). The upsert now uniquely keys on
// (student_email, course_id, module_number, topic_id) so Python's
// "Module 1 Topic 1" doesn't overwrite ICT's. If the migration hasn't
// run yet (`course_id` column missing) we fall back to the legacy
// key and log a one-line warning.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    name,
    moduleNumber,
    topicId,
    completed,
    mcqScore,
    mcqTotal,
    challengeAttempted,
    // Phase 3: Bloom's per-level stats and confidence calibration from the
    // quiz. Both are JSON-shaped payloads — the caller computes them so the
    // server stays dumb. Safe to omit; older clients don't send them.
    bloomStats,
    confidenceStats,
    // Optional course slug; client passes it via the ModulePage prop chain.
    // Defaults to "ict" for pre-multi-course clients.
    courseSlug,
  } = body;

  if (!email || !moduleNumber || !topicId) {
    return Response.json(
      { error: "email, moduleNumber, and topicId are required" },
      { status: 400 }
    );
  }

  // Auth: caller must own the email they're writing progress for
  const auth = await requireSelf(req, email);
  if (!auth.ok) return auth.response;

  const slug = typeof courseSlug === "string" && courseSlug.trim() ? courseSlug.trim() : "ict";
  const courseId = await getCourseIdBySlug(slug);

  // Upsert progress row
  const upsertData: Record<string, unknown> = {
    student_email: email,
    student_name: name || "Student",
    enrollment_no: "N/A",
    module_number: moduleNumber,
    topic_id: topicId,
    updated_at: new Date().toISOString(),
  };

  if (courseId) upsertData.course_id = courseId;
  if (completed !== undefined) upsertData.completed = completed;
  if (mcqScore !== undefined) upsertData.mcq_score = mcqScore;
  if (mcqTotal !== undefined) upsertData.mcq_total = mcqTotal;
  if (challengeAttempted !== undefined)
    upsertData.challenge_attempted = challengeAttempted;
  if (bloomStats !== undefined && bloomStats !== null)
    upsertData.bloom_stats = bloomStats;
  if (confidenceStats !== undefined && confidenceStats !== null)
    upsertData.confidence_stats = confidenceStats;

  // onConflict key reflects the CURRENT unique index. If the Phase 3
  // migration has rebuilt it to include course_id, we key on the
  // new 4-tuple; otherwise fall back to the legacy 3-tuple. The retry
  // logic below catches "column does not exist" errors either way so
  // this decision doesn't have to be perfect.
  const newOnConflict = "student_email,course_id,module_number,topic_id";
  const legacyOnConflict = "student_email,module_number,topic_id";

  // Run the progress upsert AND the session-ping in parallel. Previous
  // version awaited them sequentially — every student click cost 2
  // Supabase round-trips (~300ms on 4G Tashkent). They share no causal
  // dependency; Promise.all cuts the request to ~1 RTT.
  const progressPromise = supabase.from("student_progress").upsert(
    upsertData,
    { onConflict: courseId ? newOnConflict : legacyOnConflict }
  );
  const sessionPayload: Record<string, unknown> = {
    student_email: email,
    student_name: name || "Student",
    enrollment_no: "N/A",
    last_active_at: new Date().toISOString(),
  };
  if (courseId) sessionPayload.course_id = courseId;
  const sessionPromise = supabase
    .from("student_sessions")
    .upsert(sessionPayload, { onConflict: "student_email" });

  let [progressRes] = await Promise.all([progressPromise, sessionPromise]);
  let error = progressRes.error;

  // Graceful degradation #1: Bloom's migration not applied.
  if (error && /bloom_stats|confidence_stats/i.test(error.message)) {
    console.warn(
      "[progress] bloom_stats/confidence_stats columns missing — retrying without. Run migration-add-bloom-stats.sql."
    );
    delete upsertData.bloom_stats;
    delete upsertData.confidence_stats;
    progressRes = await supabase.from("student_progress").upsert(upsertData, {
      onConflict: courseId ? newOnConflict : legacyOnConflict,
    });
    error = progressRes.error;
  }

  // Graceful degradation #2: Phase 3 migration not applied.
  // Drop course_id from both the payload and the onConflict key and
  // retry once. Existing ICT-only deployments survive.
  if (
    error &&
    /course_id|student_progress_course_module_topic_key|PGRST204|PGRST102/i.test(
      error.message
    )
  ) {
    console.warn(
      "[progress] course_id column/constraint missing — retrying without. Run migration-phase3-multi-course.sql."
    );
    delete upsertData.course_id;
    progressRes = await supabase.from("student_progress").upsert(upsertData, {
      onConflict: legacyOnConflict,
    });
    error = progressRes.error;
  }

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
