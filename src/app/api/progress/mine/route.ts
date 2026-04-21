import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/verify-google-token";
import { getCourseIdBySlug } from "@/lib/course-registry";

// GET /api/progress/mine?course=ict
//
// Returns the caller's completion state across ALL modules of a course
// in ONE round trip. Used by the home page (and anywhere else that
// wants a "full picture" view of the student's progress) to hydrate
// client state on mount — without this, the home page was reading
// only from localStorage, which meant a student signing in on a
// fresh device/browser saw an empty progress bar on every module card
// even though their server-side completions were fine.
//
// Shape:
//   {
//     resetEpoch: string | null,
//     byModule: Record<number, number[]>, // module -> completed topic IDs
//     summary: {
//       moduleNumber: number,
//       completed: number,
//       mcqCount: number,   // quizzes with a score
//       mcqPctAvg: number   // avg % across those
//     }[]
//   }
//
// Auth: signed-in students only (Google OR password session). The
// caller's email is inferred from the token — no body / query param
// needed. This avoids a whole class of "can I read someone else's
// progress?" footguns.
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const email = auth.user.email;

  const courseSlug = (req.nextUrl.searchParams.get("course") || "ict").trim();
  const courseId = await getCourseIdBySlug(courseSlug);

  // Progress rows — minimal columns
  let q = supabase
    .from("student_progress")
    .select("module_number, topic_id, completed, mcq_score, mcq_total")
    .eq("student_email", email);
  if (courseId) q = q.eq("course_id", courseId);

  let { data, error } = await q;
  // Graceful fallback if the course_id column hasn't been added yet.
  if (error && /course_id|PGRST204|PGRST102/i.test(error.message)) {
    const fb = await supabase
      .from("student_progress")
      .select("module_number, topic_id, completed, mcq_score, mcq_total")
      .eq("student_email", email);
    data = fb.data;
    error = fb.error;
  }
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  type Row = {
    module_number: number | null;
    topic_id: number | null;
    completed: boolean | null;
    mcq_score: number | null;
    mcq_total: number | null;
  };
  const rows = (data || []) as Row[];

  const byModule: Record<number, number[]> = {};
  const mcqByModule: Record<number, { sum: number; count: number }> = {};

  for (const r of rows) {
    if (typeof r.module_number !== "number") continue;
    if (r.completed && typeof r.topic_id === "number") {
      if (!byModule[r.module_number]) byModule[r.module_number] = [];
      byModule[r.module_number].push(r.topic_id);
    }
    if (
      typeof r.mcq_score === "number" &&
      typeof r.mcq_total === "number" &&
      r.mcq_total > 0
    ) {
      if (!mcqByModule[r.module_number]) {
        mcqByModule[r.module_number] = { sum: 0, count: 0 };
      }
      mcqByModule[r.module_number].sum += (r.mcq_score / r.mcq_total) * 100;
      mcqByModule[r.module_number].count += 1;
    }
  }

  // Sort topic IDs inside each module for stable output. Matches the
  // Set → Array shape the client-side localStorage hydration expects.
  for (const k of Object.keys(byModule)) {
    byModule[Number(k)].sort((a, b) => a - b);
  }

  const summary = Object.keys(byModule)
    .map(Number)
    .sort((a, b) => a - b)
    .map((mn) => {
      const mcq = mcqByModule[mn];
      return {
        moduleNumber: mn,
        completed: byModule[mn].length,
        mcqCount: mcq?.count ?? 0,
        mcqPctAvg: mcq && mcq.count > 0 ? Math.round(mcq.sum / mcq.count) : 0,
      };
    });

  // Reset epoch: matches the shape /api/progress (single-module GET)
  // returns, so the same client logic for "wipe local after server
  // reset" works from the home page too.
  const emailLower = email.toLowerCase();
  let resetEpoch: string | null = null;
  const { data: resetRows } = await supabase
    .from("admin_actions")
    .select("created_at, action, subject_email")
    .in("action", ["reset_progress_all", "reset_progress"])
    .or(`subject_email.is.null,subject_email.eq.${emailLower}`)
    .order("created_at", { ascending: false })
    .limit(1);
  if (resetRows && resetRows.length > 0) {
    resetEpoch = (resetRows[0] as { created_at: string }).created_at;
  }

  return Response.json(
    { resetEpoch, byModule, summary },
    {
      headers: {
        // Per-student so private cache. 30s is enough to coalesce the
        // inevitable "student refreshes the home page twice in a row"
        // burst while staying near-fresh after a progress save (which
        // already calls revalidatePath on /api/progress).
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}
