import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { MODULE_TOTALS, TOTAL_TOPICS } from "@/lib/course-registry";
import { requireAdmin } from "@/lib/verify-google-token";

// GET — Return all student progress grouped by student.
// Auth: either an admin Google ID token OR the legacy admin password.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  // Run all three Supabase queries in parallel (was sequential).
  // Drop select("*") — list only the columns this endpoint actually reads.
  const [progressRes, sessionsRes, studentsRes] = await Promise.all([
    supabase
      .from("student_progress")
      .select(
        "student_email, student_name, enrollment_no, batch_id, module_number, topic_id, completed, mcq_score, mcq_total, challenge_attempted, updated_at"
      )
      .order("student_email"),
    supabase.from("student_sessions").select("student_email, last_active_at"),
    supabase.from("students").select("email, name, enrollment_no, batch_id, section"),
  ]);

  if (progressRes.error) {
    return Response.json({ error: progressRes.error.message }, { status: 500 });
  }

  const progressRows = progressRes.data;
  const sessions = sessionsRes.data;
  const studentsList = studentsRes.data;

  const sessionMap: Record<string, string> = {};
  for (const s of sessions || []) {
    if (s.student_email) sessionMap[s.student_email] = s.last_active_at;
  }

  const studentMetaMap: Record<
    string,
    { name: string; enrollmentNo: string; batchId: string; section: string }
  > = {};
  for (const s of studentsList || []) {
    if (s.email) {
      studentMetaMap[s.email] = {
        name: s.name || "",
        enrollmentNo: s.enrollment_no || "",
        batchId: s.batch_id || "",
        section: (s as { section?: string }).section || "",
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
    section: string;
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
        section: meta?.section || "",
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

  // Perf (Apr 2026): single-pass aggregation per student. Was doing 6
  // array scans (1 for completedCount + 5 per-module filters + 1 for
  // mcqEntries). Now one pass populates all counters. See the matching
  // optimisation in /api/admin/people/route.ts for the full rationale.
  const students = Object.values(studentMap).map((s) => {
    const topicEntries = Object.values(s.topics);

    let completedCount = 0;
    let mcqPctSum = 0;
    let mcqCount = 0;
    const modDone: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const t of topicEntries) {
      if (t.completed) {
        completedCount += 1;
        if (t.moduleNumber in modDone) modDone[t.moduleNumber] += 1;
      }
      if (
        t.mcqScore !== null &&
        t.mcqTotal !== null &&
        (t.mcqTotal || 0) > 0
      ) {
        mcqPctSum += (t.mcqScore / t.mcqTotal) * 100;
        mcqCount += 1;
      }
    }

    const moduleStats: Record<number, { done: number; total: number; pct: number }> = {};
    for (const moduleNum of [1, 2, 3, 4, 5]) {
      const total = MODULE_TOTALS[moduleNum];
      const done = modDone[moduleNum];
      moduleStats[moduleNum] = {
        done,
        total,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    }

    const avgMcqScore = mcqCount > 0 ? mcqPctSum / mcqCount : null;

    return {
      name: s.name,
      email: s.email,
      enrollmentNo: s.enrollmentNo,
      batchId: s.batchId,
      section: s.section,
      completedCount,
      totalTopics: TOTAL_TOPICS,
      completionPct: Math.round((completedCount / TOTAL_TOPICS) * 100),
      moduleStats,
      avgMcqScore: avgMcqScore !== null ? Math.round(avgMcqScore) : null,
      lastActive: s.lastActive,
      topics: s.topics,
    };
  });

  return Response.json(
    { students },
    {
      headers: {
        // Private: don't let CDN cache admin data.
        // max-age=10: browser serves instantly on re-visit within 10s.
        // stale-while-revalidate=30: after that, serve stale and refresh in bg.
        "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
      },
    }
  );
}
