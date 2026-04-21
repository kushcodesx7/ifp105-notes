import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { SKILLS, MAX_SKILLS, MAX_BIO_LENGTH } from "@/lib/skills";
import { requireSelf } from "@/lib/verify-google-token";
import { isLinkedInUrl } from "@/lib/linkedin-fetch";

// POST /api/students/profile
//
// Body: { email, name?, bio?, skills?, linkedinUrl?, photoUrl? }
//
// Updates the caller's OWN student row on the `students` table. Every
// field is optional — only the fields the client sends get updated.
//
// Auth: requires a valid Google ID token (x-id-token header) OR a
// password-session JWT where the email matches the `email` in the body.
// Nobody can edit another student's profile. Pre-launch audit gate.
//
// Photo resolution order (Apr 2026 revision):
//   1. If the client sent a non-empty `photoUrl` → use that (manual upload).
//   2. Otherwise, if the request is authenticated with a Google token
//      that carries a `picture` claim → save the Google profile photo
//      URL. These URLs (lh3.googleusercontent.com/...) are stable and
//      public; no download/rehost needed.
//   3. Otherwise → leave photo_url untouched.
//
// LinkedIn auto-fetch was tried here first and removed: LinkedIn blocks
// server-side OG scraping from cloud IPs, so every fetch from Vercel
// came back empty. The `linkedin_url` field is still saved (just as a
// clickable link on the student's card) — we just don't pull the photo
// from it anymore.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, bio, skills, linkedinUrl, photoUrl } = body;

  if (!email || typeof email !== "string") {
    return Response.json({ error: "Missing email" }, { status: 400 });
  }

  // Verify the caller owns this email. The returned `user` has the
  // decoded Google claims (including `picture` for Google sign-ins).
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

  // Validate LinkedIn URL if provided. Accepts linkedin.com +
  // regional variants (uk.linkedin.com, m.linkedin.com). Empty string
  // is treated as "clear the LinkedIn URL" — that's intentional so
  // students can remove their LinkedIn later.
  if (linkedinUrl !== undefined && linkedinUrl !== null && linkedinUrl !== "") {
    if (typeof linkedinUrl !== "string") {
      return Response.json({ error: "linkedinUrl must be a string" }, { status: 400 });
    }
    if (!isLinkedInUrl(linkedinUrl)) {
      return Response.json(
        { error: "linkedinUrl must look like https://linkedin.com/in/yourname" },
        { status: 400 }
      );
    }
  }

  // Validate name if provided. Kept loose — any string 1-120 chars —
  // because Uzbek names have a wide character range and we don't want
  // to reject a legitimate name on a regex technicality.
  if (name !== undefined && name !== null) {
    if (typeof name !== "string") {
      return Response.json({ error: "name must be a string" }, { status: 400 });
    }
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 120) {
      return Response.json(
        { error: "name must be between 1 and 120 characters" },
        { status: 400 }
      );
    }
  }

  // Validate photoUrl if provided. Empty string = "remove my photo".
  if (photoUrl !== undefined && photoUrl !== null && photoUrl !== "") {
    if (typeof photoUrl !== "string" || photoUrl.length > 2048) {
      return Response.json({ error: "photoUrl must be a URL string ≤ 2048 chars" }, { status: 400 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (bio !== undefined) updates.bio = bio || null;
  if (cleanSkills !== undefined) updates.skills = cleanSkills;
  if (linkedinUrl !== undefined) updates.linkedin_url = linkedinUrl || null;
  if (photoUrl !== undefined) updates.photo_url = photoUrl || null;

  // Google photo auto-fill: when the client didn't send a photoUrl AND
  // the caller is authenticated via Google (so we have `picture` on
  // their verified token), use Google's profile picture URL. These
  // come from lh3.googleusercontent.com and are stable + public, so we
  // can store the URL directly without downloading/re-hosting.
  //
  // ONLY fire if the student doesn't already have a photo — we read
  // the current row first to check. Otherwise re-saving the form
  // would keep re-stamping photo_url back to the Google photo even
  // if the student had uploaded something custom later.
  let googlePhotoFilled = false;
  const sentNoPhoto = photoUrl === undefined || photoUrl === null || photoUrl === "";
  const googlePicture = auth.user.picture;
  if (sentNoPhoto && googlePicture) {
    const { data: existing } = await supabase
      .from("students")
      .select("photo_url")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    const existingPhoto = (existing as { photo_url?: string | null } | null)
      ?.photo_url;
    if (!existingPhoto) {
      updates.photo_url = googlePicture;
      googlePhotoFilled = true;
    }
  }

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

  // Bust the aggregated-view caches so the student's updated profile
  // propagates to /connect and the home-page glimpse widget within
  // the 60s CDN TTL instead of whenever the next forced fetch lands.
  try {
    revalidatePath("/connect");
    revalidatePath("/");
    revalidatePath("/api/connect");
    revalidatePath("/api/connect/glimpse");
  } catch {}

  return Response.json({
    success: true,
    googlePhotoFilled,
    photoUrl: typeof updates.photo_url === "string" ? updates.photo_url : null,
  });
}
