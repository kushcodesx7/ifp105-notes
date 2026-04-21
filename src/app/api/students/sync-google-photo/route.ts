import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/verify-google-token";

// POST /api/students/sync-google-photo
//
// Zero-body passive sync. The client (typically /profile/edit on mount)
// calls this whenever a student is signed in with Google. The server:
//   · verifies the Google ID token,
//   · checks the student's row for an existing photo_url,
//   · if empty → writes the token's `picture` claim (a stable
//     lh3.googleusercontent.com URL) as the photo.
//
// Idempotent — calling it when the student already has a photo is a
// no-op. Safe to hit on every page load; cheap in practice (one SELECT,
// at most one UPDATE).
//
// Why this endpoint exists: LinkedIn server-side OG scraping failed
// basically 100% of the time from Vercel (LinkedIn blocks cloud IPs).
// Google sign-in, on the other hand, already hands us the student's
// profile picture URL for free in the JWT. This endpoint is how we
// cash that in without requiring the student to edit/save their
// profile first.
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.toLowerCase();
  const picture = auth.user.picture;

  if (!email) {
    return Response.json(
      { error: "Token missing email" },
      { status: 400 }
    );
  }
  if (!picture) {
    // Password-session tokens don't carry `picture`. Silent no-op is
    // the right behaviour here — the client can call this blindly on
    // every auth change without caring which sign-in path was used.
    return Response.json({ synced: false, reason: "no-google-picture" });
  }

  // Only overwrite if empty. Never clobber a student's uploaded photo.
  const { data: existing, error: readErr } = await supabase
    .from("students")
    .select("photo_url")
    .eq("email", email)
    .maybeSingle();
  if (readErr) {
    return Response.json({ error: readErr.message }, { status: 500 });
  }
  if (!existing) {
    // Student hasn't finished enrollment yet — nothing to update.
    return Response.json({ synced: false, reason: "no-student-row" });
  }
  const existingPhoto = (existing as { photo_url?: string | null }).photo_url;
  if (existingPhoto && existingPhoto.trim() !== "") {
    return Response.json({ synced: false, reason: "already-has-photo" });
  }

  const { error: writeErr } = await supabase
    .from("students")
    .update({ photo_url: picture })
    .eq("email", email);
  if (writeErr) {
    return Response.json({ error: writeErr.message }, { status: 500 });
  }

  // Nudge the aggregate caches so the new photo appears on /connect
  // and the home glimpse widget within the next CDN tick.
  try {
    revalidatePath("/connect");
    revalidatePath("/");
    revalidatePath("/api/connect");
    revalidatePath("/api/connect/glimpse");
  } catch {}

  return Response.json({
    synced: true,
    photoUrl: picture,
  });
}
