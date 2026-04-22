import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireSelf } from "@/lib/verify-google-token";

// GET /api/students/check?email=user@example.com
// Returns whether a signed-in student has completed registration.
//
// SECURITY: auth'd via requireSelf. Anonymous access would let anyone
// enumerate "is X registered" for any email (registration = PII signal +
// reveals name/roll/section). Audit-flagged CRITICAL pre-launch (Apr 2026).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return Response.json({ registered: false }, { status: 400 });
  }

  const auth = await requireSelf(req, email);
  if (!auth.ok) return auth.response;

  const { data } = await supabase
    .from("students")
    .select(
      "enrollment_no, name, batch_id, section, linkedin_url, photo_url, bio, skills"
    )
    .eq("email", email)
    .maybeSingle();

  if (!data) {
    return Response.json({ registered: false });
  }

  return Response.json({
    registered: true,
    name: data.name,
    enrollmentNo: data.enrollment_no,
    batchId: data.batch_id,
    section: data.section,
    linkedinUrl: data.linkedin_url,
    photoUrl: data.photo_url,
    // bio + skills added Apr 2026 so /profile/edit can pre-fill the
    // full form from a single auth-gated query. Previously the page
    // read from /api/connect, which intentionally strips `email` from
    // the response — so the `.find(s => s.email === user.email)` match
    // always returned undefined and the form rendered empty even for
    // students who had saved a bio/skills before. Re-saving from the
    // empty form would wipe their bio/skills.
    bio: data.bio,
    skills: Array.isArray(data.skills) ? data.skills : [],
  });
}
