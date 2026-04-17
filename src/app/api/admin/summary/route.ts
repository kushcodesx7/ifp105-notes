import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { TOTAL_TOPICS } from "@/lib/modules";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(req: NextRequest): boolean {
  if (!ADMIN_PASSWORD) return false;
  const pw = req.headers.get("x-admin-password");
  return pw === ADMIN_PASSWORD;
}

// GET /api/admin/summary
// Lightweight endpoint for the /admin landing page — returns only the 4 KPIs
// the page displays. Avoids fetching the full student list (hundreds of KB)
// just to compute "Total Students" etc.
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // All four queries run in parallel.
  // - Total students: count query on students (head: true = no rows returned)
  // - Active this week: count student_sessions updated in last 7d (unique emails)
  // - Completion + MCQ: we still need progress rows to aggregate, but only
  //   the columns used for the math (completed, mcq_score, mcq_total).
  const [studentsCountRes, sessionsRes, progressRes] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase
      .from("student_sessions")
      .select("student_email, last_active_at")
      .gte("last_active_at", weekAgoIso),
    supabase
      .from("student_progress")
      .select("student_email, completed, mcq_score, mcq_total"),
  ]);

  const totalStudents = studentsCountRes.count ?? 0;

  // Unique active emails in the last 7 days
  const activeSet = new Set<string>();
  for (const s of sessionsRes.data || []) {
    if (s.student_email) activeSet.add(s.student_email);
  }
  const activeThisWeek = activeSet.size;

  // Aggregate completion + MCQ per-student from the progress rows.
  type Agg = { completed: number; mcqSum: number; mcqCount: number };
  const byStudent = new Map<string, Agg>();
  for (const row of progressRes.data || []) {
    if (!row.student_email) continue;
    let agg = byStudent.get(row.student_email);
    if (!agg) {
      agg = { completed: 0, mcqSum: 0, mcqCount: 0 };
      byStudent.set(row.student_email, agg);
    }
    if (row.completed) agg.completed += 1;
    if (row.mcq_score !== null && row.mcq_total !== null && row.mcq_total > 0) {
      agg.mcqSum += (row.mcq_score / row.mcq_total) * 100;
      agg.mcqCount += 1;
    }
  }

  let completionSum = 0;
  let mcqSumAll = 0;
  let mcqStudentCount = 0;
  for (const agg of byStudent.values()) {
    completionSum += (agg.completed / TOTAL_TOPICS) * 100;
    if (agg.mcqCount > 0) {
      mcqSumAll += agg.mcqSum / agg.mcqCount;
      mcqStudentCount += 1;
    }
  }

  const denom = byStudent.size || 1;
  const avgCompletion = Math.round(completionSum / denom);
  const avgMcq =
    mcqStudentCount > 0 ? Math.round(mcqSumAll / mcqStudentCount) : 0;

  return Response.json(
    {
      totalStudents,
      activeThisWeek,
      avgCompletion,
      avgMcq,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
      },
    }
  );
}
