import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/students/check?email=user@example.com
// Returns whether a student has completed registration
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return Response.json({ registered: false }, { status: 400 });
  }

  const { data } = await supabase
    .from("students")
    .select("enrollment_no, name, batch_id, section, linkedin_url, photo_url")
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
  });
}
