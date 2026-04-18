import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";

// POST /api/admin/upload
//
// Accepts multipart/form-data with a `file` field. Uploads the file to
// the `course-content` Supabase Storage bucket and returns the public
// URL for the block editor to stash into `content_json[i].src`.
//
// Admin-only. Size + type limits are enforced at the bucket level too
// (scripts/migration-phase5-course-content-storage.sql), but we check
// here first so we can return friendly messages instead of Supabase's
// generic "bucket rules" error.

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json(
      { error: "Expected multipart/form-data body" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { error: "No file uploaded (expected `file` field)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      {
        error: `File too large (${(file.size / 1024 / 1024).toFixed(
          1
        )} MB). Max is 5 MB.`,
      },
      { status: 413 }
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      {
        error: `File type "${file.type}" not allowed. Use PNG, JPEG, WEBP, GIF, or SVG.`,
      },
      { status: 415 }
    );
  }

  // Optional context so uploads get organised under course/module/topic
  // prefixes — makes housekeeping and per-course cleanup easier later.
  const courseSlug =
    (form.get("courseSlug") as string | null)?.trim() || "general";
  const moduleNumber =
    (form.get("moduleNumber") as string | null)?.trim() || "0";
  const topicNumber =
    (form.get("topicNumber") as string | null)?.trim() || "0";

  // Filename: keep the original extension but replace the basename with
  // a timestamp + short random suffix so two uploads with the same name
  // don't collide, and so the URL in content_json is stable even if the
  // teacher later re-uploads under the same display name.
  const ext = (() => {
    const dot = file.name.lastIndexOf(".");
    return dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  })();
  const slug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const path = `${courseSlug}/m${moduleNumber}/t${topicNumber}/${slug}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await supabase.storage
    .from("course-content")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: "31536000", // immutable — the random slug means the URL is unique per upload
    });

  if (uploadErr) {
    if (/Bucket not found|404|row-level security/i.test(uploadErr.message)) {
      return Response.json(
        {
          error:
            "course-content bucket missing or RLS blocking the write. Run scripts/migration-phase5-course-content-storage.sql.",
        },
        { status: 503 }
      );
    }
    return Response.json({ error: uploadErr.message }, { status: 500 });
  }

  // Build the public URL. Supabase's getPublicUrl is just string
  // concatenation so it's safe to call synchronously here.
  const { data: publicUrlData } = supabase.storage
    .from("course-content")
    .getPublicUrl(path);

  return Response.json({
    url: publicUrlData.publicUrl,
    path,
    size: file.size,
    contentType: file.type,
  });
}
