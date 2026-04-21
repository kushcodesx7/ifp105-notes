import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { SKILLS, MAX_SKILLS, MAX_BIO_LENGTH } from "@/lib/skills";
import { requireSelf } from "@/lib/verify-google-token";
import {
  fetchLinkedInMeta,
  fetchImageBytes,
  isLinkedInUrl,
} from "@/lib/linkedin-fetch";

// POST /api/students/profile
//
// Body: { email, name?, bio?, skills?, linkedinUrl?, photoUrl? }
//
// Updates the caller's OWN student row on the `students` table. Every
// field is optional — only the fields the client sends get updated.
//
// Auth: requires a valid Google ID token (x-id-token header) where the
// verified email matches the `email` in the body. Nobody can edit
// another student's profile. Pre-launch audit gate.
//
// LinkedIn auto-fetch (Apr 2026):
// When the client sends `linkedinUrl` AND doesn't send a `photoUrl`,
// the server fetches the LinkedIn profile page server-side, parses
// its og:image tag, downloads the image bytes, uploads them to our
// Supabase storage (so we're not pinned to LinkedIn's signed/rotating
// CDN URLs), and stores OUR photo URL on the student's row. If any step
// fails — the URL isn't LinkedIn, LinkedIn serves a login wall, the
// image can't be downloaded — we save the profile anyway, just without
// auto-filling the photo. Students can always upload a photo manually.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, bio, skills, linkedinUrl, photoUrl } = body;

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

  // LinkedIn auto-fetch: if the student provided a LinkedIn URL but
  // NO photo (either didn't send photoUrl at all, or sent empty), try
  // to grab their profile photo from LinkedIn's og:image and re-host
  // it on our Supabase storage. Best-effort — save still succeeds if
  // LinkedIn blocks us.
  let linkedInPhotoFetched = false;
  const wantsAutoFetch =
    typeof linkedinUrl === "string" &&
    linkedinUrl !== "" &&
    isLinkedInUrl(linkedinUrl) &&
    // Auto-fetch only when the client didn't send a photo themselves.
    // If they DID send one (e.g. they uploaded via /api/profiles/upload),
    // respect that choice.
    (photoUrl === undefined || photoUrl === null || photoUrl === "");
  if (wantsAutoFetch) {
    const fetched = await fetchAndStoreLinkedInPhoto(linkedinUrl, email);
    if (fetched) {
      updates.photo_url = fetched;
      linkedInPhotoFetched = true;
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
    linkedInPhotoFetched,
    photoUrl: typeof updates.photo_url === "string" ? updates.photo_url : null,
  });
}

// ─── LinkedIn photo re-host helper ───────────────────────────────
//
// Pipeline:
//   1. GET the LinkedIn profile URL → extract og:image.
//   2. GET the og:image bytes.
//   3. Upload to Supabase `profile-photos` bucket under a stable
//      per-student path (so repeat calls replace the same object
//      and don't leak storage).
//   4. Return the public URL of our re-hosted copy.
//
// Any failure along the way returns null — the caller then saves the
// profile without the auto-photo.
async function fetchAndStoreLinkedInPhoto(
  linkedinUrl: string,
  email: string
): Promise<string | null> {
  const meta = await fetchLinkedInMeta(linkedinUrl);
  if (!meta?.imageUrl) return null;
  const img = await fetchImageBytes(meta.imageUrl);
  if (!img) return null;

  // Stable filename keyed to the student's email + a date stamp.
  // The date stamp means re-running auto-fetch produces a NEW object
  // (never silently replaces a customised photo — upsert=false below
  // enforces this) and the old URLs keep working for a bit if cached
  // in a page somewhere.
  const safeEmail = email
    .toLowerCase()
    .replace(/[^a-z0-9.@_-]/g, "_")
    .slice(0, 80);
  const ext = img.contentType === "image/png" ? "png"
    : img.contentType === "image/webp" ? "webp"
    : img.contentType === "image/gif" ? "gif"
    : "jpg";
  const filename = `li-${safeEmail}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("profile-photos")
    .upload(filename, img.bytes, {
      contentType: img.contentType,
      upsert: false,
    });
  if (upErr) return null;

  const supabaseBase = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(
    /\/+$/,
    ""
  );
  if (!supabaseBase) return null;
  return `${supabaseBase}/storage/v1/object/public/profile-photos/${filename}`;
}
