import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import {
  fetchLinkedInMeta,
  fetchImageBytes,
  isLinkedInUrl,
} from "@/lib/linkedin-fetch";

// POST /api/admin/students/backfill-linkedin-photos
//
// One-click fill-in-the-gaps for the teacher. Scans every student who:
//   (a) has a non-null `linkedin_url`, AND
//   (b) has NO `photo_url` yet,
// then — for each one — fetches the LinkedIn profile's og:image,
// downloads the bytes, uploads to our Supabase `profile-photos`
// bucket, and writes the resulting public URL onto the student row.
//
// Also handles cohort scoping so the teacher can backfill just
// Section 2 if they want, matching the reset-all-progress endpoint
// shape (batchId + section). Absent = every eligible student.
//
// Body (all optional):
//   { batchId?: string, section?: string, dryRun?: boolean }
//
// Rate / safety:
//   - Admin-only. requireAdmin.
//   - Rate-limited: 2 runs per 5 minutes per admin. LinkedIn blocks
//     IPs that hammer og:image; a backfill across 200 students is
//     already a noticeable burst — we don't want a second burst
//     landing while the first is still going.
//   - 250ms between fetches to look like a human click pattern rather
//     than a scraper. With ~200 students that's ~60 seconds wall-time
//     in the worst case — acceptable for an admin action that runs
//     behind a "are you sure?" confirmation.
//   - dryRun=true: count who WOULD be updated without actually
//     fetching or writing. Used to preview the blast radius.
//
// Returns: { scanned, updated, failed, skipped, details[] }
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { rateLimit, rateLimitResponse } = await import("@/lib/rate-limit");
  const rl = await rateLimit({
    bucket: "admin:backfill-li-photos",
    id: admin.email || "unknown-admin",
    limit: 2,
    windowSec: 300,
  });
  if (!rl.ok) return rateLimitResponse(rl, 2);

  const body = await req.json().catch(() => ({}));
  const batchId =
    typeof body.batchId === "string" && body.batchId.trim()
      ? body.batchId.trim()
      : null;
  const section =
    typeof body.section === "string" && body.section.trim()
      ? body.section.trim()
      : null;
  const dryRun = !!body.dryRun;

  // Pick candidates: linkedin_url set, photo_url empty/null.
  let q = supabase
    .from("students")
    .select("email, name, linkedin_url, photo_url, section, batch_id")
    .not("linkedin_url", "is", null)
    .neq("linkedin_url", "")
    .or("photo_url.is.null,photo_url.eq.");
  if (batchId) q = q.eq("batch_id", batchId);
  if (section) q = q.eq("section", section);

  const { data: candidates, error: fetchErr } = await q;
  if (fetchErr) {
    return Response.json({ error: fetchErr.message }, { status: 500 });
  }

  const rows = (candidates || []) as Array<{
    email: string;
    name: string | null;
    linkedin_url: string | null;
    section: string | null;
    batch_id: string | null;
  }>;

  if (dryRun) {
    return Response.json({
      dryRun: true,
      scanned: rows.length,
      candidates: rows.map((r) => ({
        email: r.email,
        name: r.name,
        section: r.section,
        batchId: r.batch_id,
      })),
    });
  }

  const supabaseBase = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(
    /\/+$/,
    ""
  );
  if (!supabaseBase) {
    return Response.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL not configured" },
      { status: 500 }
    );
  }

  let updated = 0;
  let failed = 0;
  let skipped = 0;
  const details: {
    email: string;
    status: "updated" | "failed" | "skipped";
    reason?: string;
  }[] = [];

  for (const row of rows) {
    // Skip non-LinkedIn URLs defensively — the DB can contain rubbish.
    if (!row.linkedin_url || !isLinkedInUrl(row.linkedin_url)) {
      skipped++;
      details.push({
        email: row.email,
        status: "skipped",
        reason: "URL isn't LinkedIn",
      });
      continue;
    }

    const meta = await fetchLinkedInMeta(row.linkedin_url);
    if (!meta?.imageUrl) {
      failed++;
      details.push({
        email: row.email,
        status: "failed",
        reason: "No og:image on LinkedIn page (private profile or blocked)",
      });
      await sleep(250);
      continue;
    }

    const img = await fetchImageBytes(meta.imageUrl);
    if (!img) {
      failed++;
      details.push({
        email: row.email,
        status: "failed",
        reason: "Couldn't download og:image bytes",
      });
      await sleep(250);
      continue;
    }

    const safeEmail = row.email
      .toLowerCase()
      .replace(/[^a-z0-9.@_-]/g, "_")
      .slice(0, 80);
    const ext =
      img.contentType === "image/png" ? "png"
      : img.contentType === "image/webp" ? "webp"
      : img.contentType === "image/gif" ? "gif"
      : "jpg";
    const filename = `li-backfill-${safeEmail}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("profile-photos")
      .upload(filename, img.bytes, {
        contentType: img.contentType,
        upsert: false,
      });
    if (upErr) {
      failed++;
      details.push({
        email: row.email,
        status: "failed",
        reason: `Upload: ${upErr.message}`,
      });
      await sleep(250);
      continue;
    }

    const publicUrl = `${supabaseBase}/storage/v1/object/public/profile-photos/${filename}`;
    const { error: writeErr } = await supabase
      .from("students")
      .update({ photo_url: publicUrl })
      .eq("email", row.email.toLowerCase());
    if (writeErr) {
      failed++;
      details.push({
        email: row.email,
        status: "failed",
        reason: `DB write: ${writeErr.message}`,
      });
      await sleep(250);
      continue;
    }

    updated++;
    details.push({ email: row.email, status: "updated" });
    // Breathe between LinkedIn requests. Not a formal rate-limit,
    // just enough to avoid looking like a scraper.
    await sleep(250);
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "backfill_linkedin_photos",
    subjectEmail: null,
    details: {
      scanned: rows.length,
      updated,
      failed,
      skipped,
      batchId,
      section,
    },
  });

  // Fresh CDN aggregates so the updated photos appear on /connect and
  // the home-page top-learners widget straight away.
  try {
    revalidatePath("/connect");
    revalidatePath("/");
    revalidatePath("/api/connect");
    revalidatePath("/api/connect/glimpse");
  } catch {}

  return Response.json({
    ok: true,
    scanned: rows.length,
    updated,
    failed,
    skipped,
    details: details.slice(0, 200), // cap response size
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
