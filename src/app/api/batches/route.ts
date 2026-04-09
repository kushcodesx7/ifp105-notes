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

// POST — student adds their LinkedIn profile
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { batchId, enrollmentNo, name, email, linkedinUrl } = body;

  if (!batchId || !enrollmentNo || !name || !email || !linkedinUrl) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(linkedinUrl)) {
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

  // Check enrollment number is in roll list
  const { data: roll } = await supabase
    .from("roll_list")
    .select("id")
    .eq("batch_id", batchId)
    .eq("enrollment_no", enrollmentNo.toUpperCase())
    .single();

  if (!roll) {
    return Response.json(
      { error: "Enrollment number not found. Contact your instructor." },
      { status: 403 }
    );
  }

  // Upsert student
  const { error } = await supabase.from("students").upsert(
    {
      batch_id: batchId,
      enrollment_no: enrollmentNo.toUpperCase(),
      name,
      email,
      linkedin_url: linkedinUrl,
      added_at: new Date().toISOString().split("T")[0],
    },
    { onConflict: "batch_id,enrollment_no" }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
