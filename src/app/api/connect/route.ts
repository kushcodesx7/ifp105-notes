import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/connect — list of all registered students for IFS Connect
// Optional query params:
//   batchId — filter by batch
//   section — filter by section
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");
  const section = searchParams.get("section");

  let query = supabase
    .from("students")
    .select("enrollment_no, name, email, batch_id, section, linkedin_url, photo_url, bio, added_at")
    .order("added_at", { ascending: false });

  if (batchId) query = query.eq("batch_id", batchId);
  if (section) query = query.eq("section", section);

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Map to public shape (don't expose email publicly — only for signed-in user's own record)
  const students = (data || []).map((s) => ({
    enrollmentNo: s.enrollment_no,
    name: s.name,
    batchId: s.batch_id,
    section: s.section,
    linkedinUrl: s.linkedin_url,
    photoUrl: s.photo_url,
    bio: s.bio,
    addedAt: s.added_at,
    lastThree: (s.enrollment_no || "").slice(-3),
  }));

  // Roll-list totals: overall + per section (used for "X of Y registered" progress)
  let rollQuery = supabase.from("roll_list").select("batch_id, section", { count: "exact" });
  if (batchId) rollQuery = rollQuery.eq("batch_id", batchId);
  if (section) rollQuery = rollQuery.eq("section", section);
  const { data: rollData, count: totalRolls } = await rollQuery;

  const perSectionTotals: Record<string, number> = {};
  for (const r of rollData || []) {
    const sec = (r as { section?: string }).section || "";
    if (sec) perSectionTotals[sec] = (perSectionTotals[sec] || 0) + 1;
  }

  return Response.json({
    students,
    totalRolls: totalRolls ?? 0,
    perSectionTotals,
  });
}
