import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// GET — return all batches with students (public)
export async function GET() {
  const { data: batches, error } = await supabase
    .from("batches")
    .select("id, name, accent")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Fetch students for each batch
  const result = await Promise.all(
    batches.map(async (batch) => {
      const { data: students } = await supabase
        .from("students")
        .select("enrollment_no, name, email, linkedin_url, added_at")
        .eq("batch_id", batch.id)
        .order("added_at", { ascending: true });

      return {
        id: batch.id,
        name: batch.name,
        accent: batch.accent,
        studentCount: students?.length || 0,
        students: (students || []).map((s) => ({
          enrollmentNo: s.enrollment_no,
          name: s.name,
          email: s.email,
          linkedinUrl: s.linkedin_url,
          addedAt: s.added_at,
        })),
      };
    })
  );

  return Response.json({ batches: result });
}

// POST — student registers (batch + section + roll number + name + linkedin)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { batchId, section, enrollmentNo, name, email, linkedinUrl, photoUrl } = body;

  if (!batchId || !section || !enrollmentNo || !name || !email) {
    return Response.json(
      { error: "Missing required fields: batchId, section, enrollmentNo, name, email" },
      { status: 400 }
    );
  }

  // LinkedIn URL is optional but if provided, validate it
  if (linkedinUrl && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(linkedinUrl)) {
    return Response.json(
      { error: "Invalid LinkedIn URL. Use format: https://linkedin.com/in/yourname" },
      { status: 400 }
    );
  }

  // Check batch exists
  const { data: batch } = await supabase
    .from("batches")
    .select("id")
    .eq("id", batchId)
    .single();

  if (!batch) {
    return Response.json({ error: "Batch not found" }, { status: 404 });
  }

  // Check enrollment number is in roll list for THIS specific section
  const { data: roll } = await supabase
    .from("roll_list")
    .select("id")
    .eq("batch_id", batchId)
    .eq("section", section)
    .eq("enrollment_no", enrollmentNo.toUpperCase())
    .maybeSingle();

  if (!roll) {
    return Response.json(
      {
        error: `Roll number ${enrollmentNo.toUpperCase()} is not in ${section} of ${batchId}. Please check your section and enrollment number.`,
      },
      { status: 403 }
    );
  }

  // Check if this email is already registered with a DIFFERENT roll number
  // (prevents using someone else's account to fake identity)
  const { data: existing } = await supabase
    .from("students")
    .select("enrollment_no, batch_id, section")
    .eq("email", email)
    .maybeSingle();

  if (existing && existing.enrollment_no !== enrollmentNo.toUpperCase()) {
    return Response.json(
      {
        error: `This email is already registered with roll ${existing.enrollment_no}. Roll number is locked and cannot be changed. Contact your instructor if this is a mistake.`,
      },
      { status: 409 }
    );
  }

  // Upsert student
  const { error } = await supabase.from("students").upsert(
    {
      batch_id: batchId,
      section,
      enrollment_no: enrollmentNo.toUpperCase(),
      name,
      email,
      linkedin_url: linkedinUrl || null,
      photo_url: photoUrl || null,
      added_at: new Date().toISOString().split("T")[0],
    },
    { onConflict: "email" }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
