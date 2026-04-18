import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireSelf } from "@/lib/verify-google-token";

// GET — Load student progress for a module
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const module = searchParams.get("module");

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

  const { data, error } = await supabase
    .from("student_progress")
    .select(
      "topic_id, completed, mcq_score, mcq_total, challenge_attempted, updated_at"
    )
    .eq("student_email", email)
    .eq("module_number", moduleNumber);

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

// POST — Save/update progress for a topic
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

  // Upsert progress row
  const upsertData: Record<string, unknown> = {
    student_email: email,
    student_name: name || "Student",
    enrollment_no: "N/A",
    module_number: moduleNumber,
    topic_id: topicId,
    updated_at: new Date().toISOString(),
  };

  if (completed !== undefined) upsertData.completed = completed;
  if (mcqScore !== undefined) upsertData.mcq_score = mcqScore;
  if (mcqTotal !== undefined) upsertData.mcq_total = mcqTotal;
  if (challengeAttempted !== undefined)
    upsertData.challenge_attempted = challengeAttempted;
  if (bloomStats !== undefined && bloomStats !== null)
    upsertData.bloom_stats = bloomStats;
  if (confidenceStats !== undefined && confidenceStats !== null)
    upsertData.confidence_stats = confidenceStats;

  // Run the progress upsert AND the session-ping in parallel. Previous
  // version awaited them sequentially — every student click cost 2
  // Supabase round-trips (~300ms on 4G Tashkent). They share no causal
  // dependency; Promise.all cuts the request to ~1 RTT.
  const progressPromise = supabase.from("student_progress").upsert(
    upsertData,
    {
      onConflict: "student_email,module_number,topic_id",
    }
  );
  const sessionPromise = supabase.from("student_sessions").upsert(
    {
      student_email: email,
      student_name: name || "Student",
      enrollment_no: "N/A",
      last_active_at: new Date().toISOString(),
    },
    { onConflict: "student_email" }
  );

  let [progressRes] = await Promise.all([progressPromise, sessionPromise]);
  let error = progressRes.error;

  // Graceful degradation: if the Bloom's migration hasn't run yet, Supabase
  // returns PGRST204 / PGRST116 complaining about an unknown column. Retry
  // once without the new JSONB fields so the student's progress still saves.
  // (Session upsert above doesn't reference those columns, so it's fine.)
  if (error && /bloom_stats|confidence_stats/i.test(error.message)) {
    console.warn(
      "[progress] bloom_stats/confidence_stats columns missing — retrying without them. Run migration-add-bloom-stats.sql to enable Bloom's radar."
    );
    delete upsertData.bloom_stats;
    delete upsertData.confidence_stats;
    progressRes = await supabase.from("student_progress").upsert(upsertData, {
      onConflict: "student_email,module_number,topic_id",
    });
    error = progressRes.error;
  }

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
