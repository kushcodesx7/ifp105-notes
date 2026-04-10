import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// GET — load profiles for a batch
export async function GET(req: NextRequest) {
  const batchId = req.nextUrl.searchParams.get("batchId");

  if (!batchId) {
    return Response.json(
      { error: "batchId query parameter is required" },
      { status: 400 }
    );
  }

  const { data: profiles, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("batch_id", batchId)
    .order("updated_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    profiles: (profiles || []).map((p) => ({
      id: p.id,
      studentEmail: p.student_email,
      name: p.name,
      enrollmentNo: p.enrollment_no,
      batchId: p.batch_id,
      photoUrl: p.photo_url,
      status: p.status,
      company: p.company,
      jobTitle: p.job_title,
      description: p.description,
      university: p.university,
      program: p.program,
      country: p.country,
      freelanceArea: p.freelance_area,
      lookingFor: p.looking_for,
      skills: p.skills,
      linkedinUrl: p.linkedin_url,
      githubUrl: p.github_url,
      telegramUrl: p.telegram_url,
      portfolioUrl: p.portfolio_url,
      updatedAt: p.updated_at,
    })),
  });
}

// POST — create or update profile (upsert by student_email)
export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    studentEmail,
    name,
    enrollmentNo,
    batchId,
    photoUrl,
    status,
    company,
    jobTitle,
    description,
    university,
    program,
    country,
    freelanceArea,
    lookingFor,
    skills,
    linkedinUrl,
    githubUrl,
    telegramUrl,
    portfolioUrl,
  } = body;

  // Validate required fields
  if (!studentEmail || !name || !enrollmentNo || !linkedinUrl) {
    return Response.json(
      { error: "Missing required fields: studentEmail, name, enrollmentNo, linkedinUrl" },
      { status: 400 }
    );
  }

  if (
    status &&
    !["working", "studying", "freelancing", "looking"].includes(status)
  ) {
    return Response.json(
      { error: "Invalid status. Must be: working, studying, freelancing, or looking" },
      { status: 400 }
    );
  }

  // If batchId is empty string, treat as null
  const safeBatchId = batchId && batchId.trim() ? batchId.trim() : null;

  const { error } = await supabase.from("student_profiles").upsert(
    {
      student_email: studentEmail,
      name,
      enrollment_no: enrollmentNo,
      batch_id: safeBatchId,
      photo_url: photoUrl || null,
      status: status || null,
      company: company || null,
      job_title: jobTitle || null,
      description: description || null,
      university: university || null,
      program: program || null,
      country: country || null,
      freelance_area: freelanceArea || null,
      looking_for: lookingFor || null,
      skills: skills || null,
      linkedin_url: linkedinUrl,
      github_url: githubUrl || null,
      telegram_url: telegramUrl || null,
      portfolio_url: portfolioUrl || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_email" }
  );

  if (error) {
    console.error("[profiles] upsert error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
