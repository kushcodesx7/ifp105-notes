import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(req: NextRequest): boolean {
  if (!ADMIN_PASSWORD) return false;
  const pw = req.headers.get("x-admin-password");
  return pw === ADMIN_PASSWORD;
}

// GET — Return all student progress grouped by student
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all progress rows
  const { data: progressRows, error: progressError } = await supabase
    .from("student_progress")
    .select("*")
    .order("email");

  if (progressError) {
    return Response.json({ error: progressError.message }, { status: 500 });
  }

  // Get last active times
  const { data: sessions } = await supabase
    .from("student_sessions")
    .select("email, last_active_at");

  const sessionMap: Record<string, string> = {};
  for (const s of sessions || []) {
    sessionMap[s.email] = s.last_active_at;
  }

  // Group by student email
  const studentMap: Record<
    string,
    {
      name: string;
      email: string;
      enrollmentNo: string;
      batchId: string;
      topics: Record<
        string,
        {
          moduleNumber: number;
          topicId: number;
          completed: boolean;
          mcqScore: number | null;
          mcqTotal: number | null;
          challengeAttempted: boolean;
          updatedAt: string;
        }
      >;
      lastActive: string | null;
    }
  > = {};

  for (const row of progressRows || []) {
    const email = row.email;
    if (!studentMap[email]) {
      studentMap[email] = {
        name: row.name || "Unknown",
        email,
        enrollmentNo: row.enrollment_no || "",
        batchId: row.batch_id || "",
        topics: {},
        lastActive: sessionMap[email] || null,
      };
    }

    // Update name if we find a non-null one
    if (row.name) studentMap[email].name = row.name;
    if (row.enrollment_no)
      studentMap[email].enrollmentNo = row.enrollment_no;
    if (row.batch_id) studentMap[email].batchId = row.batch_id;

    const key = `${row.module_number}-${row.topic_id}`;
    studentMap[email].topics[key] = {
      moduleNumber: row.module_number,
      topicId: row.topic_id,
      completed: row.completed,
      mcqScore: row.mcq_score,
      mcqTotal: row.mcq_total,
      challengeAttempted: row.challenge_attempted,
      updatedAt: row.updated_at,
    };
  }

  // Convert to array and compute summary stats
  const students = Object.values(studentMap).map((s) => {
    const topicEntries = Object.values(s.topics);
    const completedCount = topicEntries.filter((t) => t.completed).length;
    const totalTopics = topicEntries.length;
    const mcqEntries = topicEntries.filter(
      (t) => t.mcqScore !== null && t.mcqTotal !== null
    );
    const avgMcqScore =
      mcqEntries.length > 0
        ? mcqEntries.reduce(
            (sum, t) => sum + (t.mcqScore! / t.mcqTotal!) * 100,
            0
          ) / mcqEntries.length
        : null;

    return {
      name: s.name,
      email: s.email,
      enrollmentNo: s.enrollmentNo,
      batchId: s.batchId,
      completedCount,
      totalTopics,
      completionPct: totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0,
      avgMcqScore: avgMcqScore !== null ? Math.round(avgMcqScore) : null,
      lastActive: s.lastActive,
      topics: s.topics,
    };
  });

  return Response.json({ students });
}
