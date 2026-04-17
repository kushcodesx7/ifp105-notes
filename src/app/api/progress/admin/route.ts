import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Total topics per module (for accurate completion %)
const MODULE_TOTALS: Record<number, number> = {
  1: 11,
  2: 9,
  3: 7,
  4: 11,
  5: 10,
};
const TOTAL_TOPICS = 48; // 11+9+7+11+10

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
    .order("student_email");

  if (progressError) {
    return Response.json({ error: progressError.message }, { status: 500 });
  }

  // Get last active times from sessions
  const { data: sessions } = await supabase
    .from("student_sessions")
    .select("student_email, last_active_at");

  const sessionMap: Record<string, string> = {};
  for (const s of sessions || []) {
    if (s.student_email) sessionMap[s.student_email] = s.last_active_at;
  }

  // Get student master data from students table (has real batch_id and enrollment_no)
  const { data: studentsList } = await supabase
    .from("students")
    .select("email, name, enrollment_no, batch_id");

  const studentMetaMap: Record<
    string,
    { name: string; enrollmentNo: string; batchId: string }
  > = {};
  for (const s of studentsList || []) {
    if (s.email) {
      studentMetaMap[s.email] = {
        name: s.name || "",
        enrollmentNo: s.enrollment_no || "",
        batchId: s.batch_id || "",
      };
    }
  }

  // Group by student email
  interface TopicProgress {
    moduleNumber: number;
    topicId: number;
    completed: boolean;
    mcqScore: number | null;
    mcqTotal: number | null;
    challengeAttempted: boolean;
    updatedAt: string;
  }

  interface StudentData {
    name: string;
    email: string;
    enrollmentNo: string;
    batchId: string;
    topics: Record<string, TopicProgress>;
    lastActive: string | null;
  }

  const studentMap: Record<string, StudentData> = {};

  for (const row of progressRows || []) {
    const email = row.student_email;
    if (!email) continue;

    // Use metadata from students table first (it has real batch/enrollment data)
    const meta = studentMetaMap[email];

    if (!studentMap[email]) {
      studentMap[email] = {
        name: meta?.name || row.student_name || "Unknown",
        email,
        enrollmentNo: meta?.enrollmentNo || (row.enrollment_no !== "N/A" ? row.enrollment_no : ""),
        batchId: meta?.batchId || row.batch_id || "",
        topics: {},
        lastActive: sessionMap[email] || null,
      };
    }

    // Keep name updated if we get better data
    if (meta?.name) studentMap[email].name = meta.name;
    else if (row.student_name && studentMap[email].name === "Unknown") {
      studentMap[email].name = row.student_name;
    }

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

    // Per-module stats
    const moduleStats: Record<number, { done: number; total: number; pct: number }> = {};
    for (const moduleNum of [1, 2, 3, 4, 5]) {
      const moduleTopics = topicEntries.filter((t) => t.moduleNumber === moduleNum);
      const done = moduleTopics.filter((t) => t.completed).length;
      const total = MODULE_TOTALS[moduleNum];
      moduleStats[moduleNum] = {
        done,
        total,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    }

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
      totalTopics: TOTAL_TOPICS,
      completionPct: Math.round((completedCount / TOTAL_TOPICS) * 100),
      moduleStats,
      avgMcqScore: avgMcqScore !== null ? Math.round(avgMcqScore) : null,
      lastActive: s.lastActive,
      topics: s.topics,
    };
  });

  return Response.json({ students });
}
