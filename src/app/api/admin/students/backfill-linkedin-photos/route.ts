import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { isLinkedInUrl } from "@/lib/linkedin-fetch";

// POST /api/admin/students/backfill-linkedin-photos
//
// NOTE (Apr 2026 revision): this endpoint USED to try to scrape
// LinkedIn og:image tags from Vercel and re-host the photos. It
// didn't work: LinkedIn aggressively blocks cloud-IP requests, so
// ~100% of fetches failed. Kept the URL path for backwards-compat,
// but the endpoint now returns a DIAGNOSTIC report only — no fetching.
//
// What it tells the admin:
//   · totalStudents       — visible roster size
//   · withPhoto           — how many have a non-empty photo_url
//   · withoutPhoto        — how many are missing a photo
//   · withLinkedInAnyUrl  — how many have linkedin_url populated at all
//   · withLinkedInValid   — how many of those have a URL shape we accept
//   · withLinkedInInvalid — URL set but not linkedin.com (typo, paste error)
//   · candidatesNoPhoto[] — students missing a photo (with their LinkedIn
//                           URL if present), so the teacher knows who to
//                           nudge to sign in with Google
//
// The REAL backfill path is passive: students sign in with Google →
// /api/students/sync-google-photo quietly saves their Google profile
// picture. So "missing a photo" == "hasn't opened the profile page
// while signed in with Google."
//
// Supports cohort scoping { batchId?, section? } to match the reset
// endpoint shape — teacher can get a diagnostic for just Section 2.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json().catch(() => ({}));
  const batchId =
    typeof body.batchId === "string" && body.batchId.trim()
      ? body.batchId.trim()
      : null;
  const section =
    typeof body.section === "string" && body.section.trim()
      ? body.section.trim()
      : null;

  let q = supabase
    .from("students")
    .select("email, name, linkedin_url, photo_url, section, batch_id");
  if (batchId) q = q.eq("batch_id", batchId);
  if (section) q = q.eq("section", section);

  const { data, error } = await q;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  type Row = {
    email: string;
    name: string | null;
    linkedin_url: string | null;
    photo_url: string | null;
    section: string | null;
    batch_id: string | null;
  };
  const rows = (data || []) as Row[];

  const hasPhoto = (r: Row) => !!r.photo_url && r.photo_url.trim() !== "";
  const hasLinkedInAny = (r: Row) =>
    !!r.linkedin_url && r.linkedin_url.trim() !== "";
  const hasLinkedInValid = (r: Row) =>
    hasLinkedInAny(r) && isLinkedInUrl(r.linkedin_url);

  const totalStudents = rows.length;
  const withPhoto = rows.filter(hasPhoto).length;
  const withoutPhoto = totalStudents - withPhoto;
  const withLinkedInAnyUrl = rows.filter(hasLinkedInAny).length;
  const withLinkedInValid = rows.filter(hasLinkedInValid).length;
  const withLinkedInInvalid = withLinkedInAnyUrl - withLinkedInValid;

  // Candidates: students still missing a photo. Sorted so anyone who
  // already pasted a LinkedIn URL (most-complete profile) shows first —
  // those are the students who clearly engaged with the profile page.
  const candidatesNoPhoto = rows
    .filter((r) => !hasPhoto(r))
    .sort((a, b) => {
      const aLi = hasLinkedInAny(a) ? 1 : 0;
      const bLi = hasLinkedInAny(b) ? 1 : 0;
      if (aLi !== bLi) return bLi - aLi;
      return (a.name || a.email).localeCompare(b.name || b.email);
    })
    .map((r) => ({
      email: r.email,
      name: r.name,
      section: r.section,
      batchId: r.batch_id,
      linkedinUrl: r.linkedin_url,
      linkedinUrlValid: hasLinkedInValid(r),
    }));

  return Response.json({
    ok: true,
    // Diagnostic counts
    totalStudents,
    withPhoto,
    withoutPhoto,
    withLinkedInAnyUrl,
    withLinkedInValid,
    withLinkedInInvalid,
    // Students still missing a photo (capped)
    candidatesNoPhoto: candidatesNoPhoto.slice(0, 500),
    // Scope echo
    batchId,
    section,
    // Explanation the admin card can show verbatim
    note:
      "LinkedIn server-side fetching from Vercel doesn't work — LinkedIn blocks cloud IPs. Students get their photo automatically when they sign in with Google and visit /profile/edit (the page quietly pulls Google's profile picture).",
  });
}
