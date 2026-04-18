import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  requireAdmin,
  requireAuth,
  requireSelf,
} from "@/lib/verify-google-token";

// GET — load profiles for a batch.
//
// SECURITY (pre-launch re-audit Apr 2026):
//   - Anonymous callers get 401. Before this change, anyone could
//     `curl .../api/profiles?batchId=all` and scrape every student's
//     email, name, bio, LinkedIn, etc.
//   - `?email=<me>` returns exactly one row (the caller's own). Used by
//     /profile/edit to pre-fill the form. `requireSelf` enforces it.
//   - `?batchId=all` (cross-batch dump) is admin-only. Accepts either
//     Google-admin token OR legacy admin password.
//   - `?batchId=<id>` for a specific batch is available to any signed-in
//     student — this is the within-class roster.
//   - The public payload drops `studentEmail`. Only the self-lookup path
//     (`?email=<me>`) echoes the email back — same privacy posture as
//     /api/connect and /api/batches.
export async function GET(req: NextRequest) {
  const batchId = req.nextUrl.searchParams.get("batchId");
  const email = req.nextUrl.searchParams.get("email");

  if (email) {
    // Single-row self-lookup. requireSelf verifies caller == email.
    const auth = await requireSelf(req, email);
    if (!auth.ok) return auth.response;
  } else if (batchId === "all") {
    // Cross-batch dump → admin only.
    const admin = await requireAdmin(req);
    if (!admin.ok) return admin.response;
  } else {
    // Per-batch roster → any signed-in student.
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
  }

  let query = supabase
    .from("student_profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (email) {
    query = query.eq("student_email", email);
  } else if (batchId && batchId !== "all") {
    query = query.eq("batch_id", batchId);
  }

  const { data: profiles, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // `studentEmail` is intentionally dropped from the public response to
  // prevent scraping. The caller can still identify "their own" profile
  // via enrollmentNo + name (and explicitly when they pass ?email=<me>
  // — in that case the response has a single row so no leak concern).
  return Response.json({
    profiles: (profiles || []).map((p) => ({
      id: p.id,
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
      // Include email ONLY on the caller's own single-row lookup so the
      // profile-edit form can match and pre-fill.
      studentEmail: email ? p.student_email : undefined,
    })),
  });
}

// POST — create or update profile (upsert by student_email)
// SECURITY: requireSelf ensures a signed-in student can only edit their own
// profile. Without this, anyone could POST with any email and impersonate
// another student — or overwrite their bio/photo/linkedin. Audit-flagged
// CRITICAL pre-launch (Apr 2026).
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

  // Caller must own the profile they're editing
  const auth = await requireSelf(req, studentEmail);
  if (!auth.ok) return auth.response;

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
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
