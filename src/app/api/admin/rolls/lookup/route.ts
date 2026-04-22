import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";

// GET /api/admin/rolls/lookup?enrollmentNo=A85456325293
//     /api/admin/rolls/lookup?name=komron
//
// Student-side counterpart to /api/admin/students/unlink-by-roll.
// That endpoint searches the `students` (registered) table; this one
// searches `roll_list` (the teacher-managed roster). Together they
// cover every "where is this roll?" question the teacher might have.
//
// Supports two query modes:
//   - enrollmentNo=XYZ  exact roll lookup (uppercased)
//   - name=komron       case-insensitive substring match on name
//
// Common use case (Apr 2026): during class a student gets the error
// "your roll isn't in Section 3 of 2025-2026." Teacher needs to find
// out whether the roll is:
//   (a) in a different section of the same batch  — student picked
//       the wrong section on the registration form
//   (b) in a different batch  — roll lives under last year's intake
//   (c) not in the roll_list at all  — genuine typo or unimported
//
// Name search handles the reverse case: student says "I'm Komron, I
// can't sign in" — teacher doesn't know the roll, wants to look up
// by name to find the correct one.
//
// Admin-only. Read-only.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const rawRoll = req.nextUrl.searchParams.get("enrollmentNo");
  const rawName = req.nextUrl.searchParams.get("name");
  const enrollmentNo = rawRoll && rawRoll.trim() ? rawRoll.trim().toUpperCase() : null;
  const name = rawName && rawName.trim() ? rawName.trim() : null;

  if (!enrollmentNo && !name) {
    return Response.json(
      { error: "enrollmentNo or name query param is required" },
      { status: 400 }
    );
  }

  // Build queries based on which param was provided. Using ilike for
  // case-insensitive substring match on name.
  const rollListQuery = supabase
    .from("roll_list")
    .select("batch_id, section, enrollment_no, name")
    .limit(50);
  const studentsQuery = supabase
    .from("students")
    .select("email, name, batch_id, section, enrollment_no, added_at")
    .limit(50);

  if (enrollmentNo) {
    rollListQuery.eq("enrollment_no", enrollmentNo);
    studentsQuery.eq("enrollment_no", enrollmentNo);
  } else if (name) {
    rollListQuery.ilike("name", `%${name}%`);
    studentsQuery.ilike("name", `%${name}%`);
  }

  const [rollListRes, studentsRes] = await Promise.all([
    rollListQuery,
    studentsQuery,
  ]);

  if (rollListRes.error) {
    return Response.json({ error: rollListRes.error.message }, { status: 500 });
  }
  if (studentsRes.error) {
    return Response.json({ error: studentsRes.error.message }, { status: 500 });
  }

  const rollListMatches = (rollListRes.data || []).map((r) => ({
    batchId: (r as { batch_id: string }).batch_id,
    section: (r as { section: string }).section,
    enrollmentNo: (r as { enrollment_no: string }).enrollment_no,
    name: (r as { name: string | null }).name ?? null,
  }));

  const studentsMatches = (studentsRes.data || []).map((r) => ({
    email: (r as { email: string }).email,
    name: (r as { name: string | null }).name ?? null,
    batchId: (r as { batch_id: string | null }).batch_id ?? null,
    section: (r as { section: string | null }).section ?? null,
    enrollmentNo: (r as { enrollment_no: string }).enrollment_no,
    addedAt: (r as { added_at: string | null }).added_at ?? null,
  }));

  // Short summary so the admin UI doesn't have to re-derive it.
  const query = enrollmentNo || `name "${name}"`;
  const summary =
    rollListMatches.length === 0 && studentsMatches.length === 0
      ? `Not found. ${query} isn't in the roll list AND isn't a registered student. Likely a typo, or a roll the teacher hasn't imported yet.`
      : rollListMatches.length > 0 && studentsMatches.length === 0
        ? `On the roll list but NOT registered. Student hasn't signed up yet.`
        : rollListMatches.length === 0 && studentsMatches.length > 0
          ? `Registered but NOT in the roll list. Someone registered with a roll the teacher never imported.`
          : `On the roll list AND registered.`;

  return Response.json({
    query: { enrollmentNo, name },
    rollListMatches,
    studentsMatches,
    summary,
  });
}
