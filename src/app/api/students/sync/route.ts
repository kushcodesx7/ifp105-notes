import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireSelf } from "@/lib/verify-google-token";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { parseBody, SyncStudentSchema } from "@/lib/schemas";

// POST /api/students/sync
// Keeps the student's profile photo fresh after Google auth. If the photo URL
// from Google differs from what we have in the DB, update the DB. Called
// silently by the Navbar on login so a student's avatar stays current.
//
// Body: { email, photoUrl }
// Auth: caller must own the email (Google ID token check).
export async function POST(req: NextRequest) {
  // Rate limit — called once per login, so 30/min is plenty for any
  // legitimate user and bounds repeated re-auth spam.
  const rl = await rateLimit({
    bucket: "auth:sync",
    id: ipFromRequest(req),
    limit: 30,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, 30);

  const parsed = await parseBody(req, SyncStudentSchema);
  if (!parsed.ok) return parsed.response;
  const { email, photoUrl } = parsed.data;
  if (!photoUrl) {
    return Response.json({ error: "Missing photoUrl" }, { status: 400 });
  }

  // Verify caller owns this email
  const auth = await requireSelf(req, email);
  if (!auth.ok) return auth.response;

  // Only accept Google / trusted hosts to avoid someone POSTing arbitrary URLs
  if (!/^https?:\/\/(lh\d\.googleusercontent\.com|lh[\w-]+\.googleusercontent\.com)\//i.test(photoUrl)) {
    return Response.json({ error: "Unsupported photo host" }, { status: 400 });
  }

  // No-op update if nothing changed (saves a write)
  const { data: existing } = await supabase
    .from("students")
    .select("photo_url")
    .eq("email", email)
    .maybeSingle();

  if (!existing) {
    // Not registered yet — nothing to sync
    return Response.json({ success: true, updated: false });
  }
  if (existing.photo_url === photoUrl) {
    return Response.json({ success: true, updated: false });
  }

  const { error } = await supabase
    .from("students")
    .update({ photo_url: photoUrl })
    .eq("email", email);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, updated: true });
}
