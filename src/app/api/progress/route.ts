import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

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
  } = body;

  if (!email || !moduleNumber || !topicId) {
    return Response.json(
      { error: "email, moduleNumber, and topicId are required" },
      { status: 400 }
    );
  }

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

  const { error } = await supabase.from("student_progress").upsert(
    upsertData,
    {
      onConflict: "student_email,module_number,topic_id",
    }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Update student_sessions last_active_at
  await supabase.from("student_sessions").upsert(
    {
      student_email: email,
      student_name: name || "Student",
      enrollment_no: "N/A",
      last_active_at: new Date().toISOString(),
    },
    { onConflict: "student_email" }
  );

  return Response.json({ ok: true });
}
