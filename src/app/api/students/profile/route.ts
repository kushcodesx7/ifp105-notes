import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { SKILLS, MAX_SKILLS, MAX_BIO_LENGTH } from "@/lib/skills";
import { requireSelf } from "@/lib/verify-google-token";

// POST /api/students/profile
// Body: { email, bio?, skills?, linkedinUrl? }
// Updates bio / skills / linkedin_url on the caller's OWN student row.
// Auth: the caller must supply a valid Google ID token (x-id-token header)
// and the token's verified email must match the `email` in the body. No one
// can edit another student's profile.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, bio, skills, linkedinUrl } = body;

  if (!email || typeof email !== "string") {
    return Response.json({ error: "Missing email" }, { status: 400 });
  }

  // Verify the caller owns this email
  const auth = await requireSelf(req, email);
  if (!auth.ok) return auth.response;

  // Validate bio length
  if (bio !== undefined && bio !== null) {
    if (typeof bio !== "string") {
      return Response.json({ error: "bio must be a string" }, { status: 400 });
    }
    if (bio.length > MAX_BIO_LENGTH) {
      return Response.json(
        { error: `bio must be ≤ ${MAX_BIO_LENGTH} characters` },
        { status: 400 }
      );
    }
  }

  // Validate skills list against whitelist
  const validSkillIds = new Set(SKILLS.map((s) => s.id));
  let cleanSkills: string[] | undefined;
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      return Response.json({ error: "skills must be an array" }, { status: 400 });
    }
    cleanSkills = skills
      .filter((s: unknown): s is string => typeof s === "string" && validSkillIds.has(s))
      .slice(0, MAX_SKILLS);
  }

  // Validate LinkedIn URL if provided
  if (linkedinUrl !== undefined && linkedinUrl !== null && linkedinUrl !== "") {
    if (typeof linkedinUrl !== "string") {
      return Response.json({ error: "linkedinUrl must be a string" }, { status: 400 });
    }
    if (!/^https?:\/\/(www\.)?linkedin\.com\//i.test(linkedinUrl)) {
      return Response.json({ error: "linkedinUrl must be a linkedin.com URL" }, { status: 400 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (bio !== undefined) updates.bio = bio || null;
  if (cleanSkills !== undefined) updates.skills = cleanSkills;
  if (linkedinUrl !== undefined) updates.linkedin_url = linkedinUrl || null;

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("students")
    .update(updates)
    .eq("email", email.toLowerCase());

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
