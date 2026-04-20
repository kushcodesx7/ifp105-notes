import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireSelf } from "@/lib/verify-google-token";
import { getCourseIdBySlug } from "@/lib/course-registry";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { parseBody, ProgressSaveSchema } from "@/lib/schemas";

// GET — Load student progress for a module in a specific course.
//
// Multi-course: `course` query param is optional and defaults to the
// platform's current course slug ("ict") for backward compat. If the
// courses table doesn't exist yet (Phase 3 migration not run), the
// filter degrades gracefully to email+module only — same rows return.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  // Renamed from `module` to `moduleParam` — the bare name `module`
  // shadows Node's CommonJS module global and is flagged by Next's
  // no-assign-module-variable lint rule (it has historically caused
  // weird bundler crashes on edge runtime targets).
  const moduleParam = searchParams.get("module");
  const courseSlug = (searchParams.get("course") || "ict").trim();

  if (!email || !moduleParam) {
    return Response.json(
      { error: "email and module query params required" },
      { status: 400 }
    );
  }

  const moduleNumber = parseInt(moduleParam, 10);
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

  // Reset epoch — the timestamp of the most recent global
  // `reset_progress_all` admin action. Clients store the last value
  // they've seen in localStorage; when a fresh epoch arrives, they
  // wipe their local progress before the silent-fail recovery runs.
  // This prevents students from silently re-uploading pre-wipe
  // progress after a bulk reset. If the admin_actions query fails
  // we silently return null — the wipe still works via the server;
  // only the local re-upload guard is skipped.
  let resetEpoch: string | null = null;
  try {
    const { data: resetRows } = await supabase
      .from("admin_actions")
      .select("created_at")
      .eq("action", "reset_progress_all")
      .order("created_at", { ascending: false })
      .limit(1);
    resetEpoch = resetRows?.[0]?.created_at ?? null;
  } catch {
    // admin_actions table might not exist yet on older deployments —
    // fall through with null. Not critical.
  }

  return Response.json({ progress, resetEpoch });
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
  // Rate limit per IP. Progress saves fire on every topic completion
  // + MCQ answer — a legitimate student might hit this 50 times in a
  // 45-minute module. 200/min is generous enough to never trigger for
  // honest users while still bounding abuse. Fail-open on Redis outage.
  const rl = await rateLimit({
    bucket: "auth:progress",
    id: ipFromRequest(req),
    limit: 200,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, 200);

  const parsed = await parseBody(req, ProgressSaveSchema);
  if (!parsed.ok) return parsed.response;
  const {
    email,
    name,
    moduleNumber,
    topicId,
    completed,
    mcqScore,
    mcqTotal,
    challengeAttempted,
    // Phase 3: Bloom's per-level stats and confidence calibration from
    // the quiz. Both are JSON-shaped payloads — the caller computes
    // them so the server stays dumb.
    bloomStats,
    confidenceStats,
    // Optional course slug; client passes it via the ModulePage prop
    // chain. Defaults to "ict" for pre-multi-course clients.
    courseSlug,
  } = parsed.data;

  // Auth: caller must own the email they're writing progress for
  const auth = await requireSelf(req, email);
  if (!auth.ok) return auth.response;

  // courseSlug passed through zod as optional — default to "ict".
  const slug = courseSlug && courseSlug.trim() ? courseSlug.trim() : "ict";
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
