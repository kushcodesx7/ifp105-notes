import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { isHiddenSection } from "@/lib/hidden-sections";

// Keep in sync with /api/progress/admin and /api/admin/summary
const TOTAL_TOPICS = 48; // 11+9+7+11+10

// GET /api/connect — list of all registered students for IFS Connect
// Optional query params:
//   batchId — filter by batch
//   section — filter by section
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");
  const section = searchParams.get("section");

  const studentQuery = supabase
    .from("students")
    .select(
      "enrollment_no, name, email, batch_id, section, linkedin_url, photo_url, bio, skills, added_at"
    )
    .order("added_at", { ascending: false });
  if (batchId) studentQuery.eq("batch_id", batchId);
  if (section) studentQuery.eq("section", section);

  const rollQuery = supabase
    .from("roll_list")
    .select("batch_id, section", { count: "exact" });
  if (batchId) rollQuery.eq("batch_id", batchId);
  if (section) rollQuery.eq("section", section);

  // Pull completion data so each card can show a progress bar.
  // Only the minimum columns we need to compute a percentage.
  const progressQuery = supabase
    .from("student_progress")
    .select("student_email, completed");

  // All three queries in parallel (borrowed from the admin perf work)
  const [studentsRes, rollRes, progressRes] = await Promise.all([
    studentQuery,
    rollQuery,
    progressQuery,
  ]);

  if (studentsRes.error) {
    return Response.json({ error: studentsRes.error.message }, { status: 500 });
  }

  // Aggregate per-email completion count
  const doneByEmail: Record<string, number> = {};
  for (const row of progressRes.data || []) {
    if (!row.student_email || !row.completed) continue;
    doneByEmail[row.student_email] = (doneByEmail[row.student_email] || 0) + 1;
  }

  // Filter out test/hidden sections before mapping
  const visibleStudentRows = (studentsRes.data || []).filter(
    (s) => !isHiddenSection(s.section)
  );

  // Map to public shape (email never leaves the server side).
  // Progress is always public — no opt-out.
  const students = visibleStudentRows.map((s) => {
    const done = s.email ? doneByEmail[s.email] || 0 : 0;
    const completionPct = Math.min(100, Math.round((done / TOTAL_TOPICS) * 100));
    return {
      enrollmentNo: s.enrollment_no,
      name: s.name,
      batchId: s.batch_id,
      section: s.section,
      linkedinUrl: s.linkedin_url,
      photoUrl: s.photo_url,
      bio: s.bio,
      skills: (s as { skills?: string[] }).skills || [],
      addedAt: s.added_at,
      lastThree: (s.enrollment_no || "").slice(-3),
      completionPct,
    };
  });

  const perSectionTotals: Record<string, number> = {};
  let visibleRollCount = 0;
  for (const r of rollRes.data || []) {
    const sec = (r as { section?: string }).section || "";
    if (!sec || isHiddenSection(sec)) continue;
    perSectionTotals[sec] = (perSectionTotals[sec] || 0) + 1;
    visibleRollCount += 1;
  }

  return Response.json(
    {
      students,
      totalRolls: visibleRollCount,
      perSectionTotals,
    },
    {
      headers: {
        // Public cache — profile + progress data. 2min fresh, 10min stale.
        "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
      },
    }
  );
}
