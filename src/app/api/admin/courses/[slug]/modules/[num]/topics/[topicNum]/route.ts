import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { cleanupTopicImages } from "@/lib/storage-cleanup";
import { sanitizeContentBlocks } from "@/lib/sanitize-html";

// /api/admin/courses/[slug]/modules/[num]/topics/[topicNum]
//   GET    — topic detail (includes content_json for Phase 5 block editor)
//   PATCH  — update title/hook/timeMin/content_json/orderIndex/number
//   DELETE — cascade-deletes the topic and all its questions

type RouteContext = {
  params: Promise<{ slug: string; num: string; topicNum: string }>;
};

async function resolveTopicId(
  slug: string,
  num: string,
  topicNum: string
): Promise<
  | { ok: true; topicId: string; moduleNumber: number; topicNumber: number }
  | { ok: false; response: Response }
> {
  const moduleNumber = parseInt(num, 10);
  const topicNumber = parseInt(topicNum, 10);
  if (Number.isNaN(moduleNumber) || Number.isNaN(topicNumber)) {
    return {
      ok: false,
      response: Response.json({ error: "Invalid module or topic number" }, { status: 400 }),
    };
  }
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  const courseId = (course as { id: string } | null)?.id;
  if (!courseId) {
    return {
      ok: false,
      response: Response.json({ error: "Course not found" }, { status: 404 }),
    };
  }
  const { data: mod } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .eq("number", moduleNumber)
    .maybeSingle();
  const moduleId = (mod as { id: string } | null)?.id;
  if (!moduleId) {
    return {
      ok: false,
      response: Response.json({ error: "Module not found" }, { status: 404 }),
    };
  }
  // Only resolve LIVE (non-trashed) topics here. The trash API
  // reaches deleted rows directly via a separate path. This keeps
  // editors + student-facing APIs from accidentally re-hydrating a
  // topic the teacher put in the bin.
  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("module_id", moduleId)
    .eq("number", topicNumber)
    .is("deleted_at", null)
    .maybeSingle();
  const topicId = (topic as { id: string } | null)?.id;
  if (!topicId) {
    return {
      ok: false,
      response: Response.json({ error: "Topic not found" }, { status: 404 }),
    };
  }
  return { ok: true, topicId, moduleNumber, topicNumber };
}

// ─── GET ─────────────────────────────────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum } = await ctx.params;
  const res = await resolveTopicId(slug, num, topicNum);
  if (!res.ok) return res.response;

  // Two-step fetch so the core topic load survives even if the
  // flashcards migration hasn't been run yet. First SELECT pulls
  // everything we know has existed for months; second optional SELECT
  // attempts flashcards_json and swallows the "column does not exist"
  // error, returning [] instead. After the migration runs this just
  // becomes one extra cheap row read.
  const { data, error } = await supabase
    .from("topics")
    .select(
      "id, number, title, time_min, hook, content_json, order_index, created_at, updated_at"
    )
    .eq("id", res.topicId)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Flashcards may now carry a `deletedAt` field (in-array trash, layer
  // 2). Editor and student need the FULL array (live + trash) so the
  // editor can preserve trash on saves and the trash UI can list it.
  // The student-facing /api/public/flashcards endpoint filters out
  // trashed cards before returning to students.
  let flashcardsJson: Array<{ front: string; back: string; deletedAt?: string | null }> = [];
  let flashcardsSource: "db" | "ts" | "empty" = "empty";
  const { data: fcData, error: fcError } = await supabase
    .from("topics")
    .select("flashcards_json")
    .eq("id", res.topicId)
    .maybeSingle();
  if (!fcError && fcData) {
    const raw = (fcData as { flashcards_json: unknown }).flashcards_json;
    if (Array.isArray(raw) && raw.length > 0) {
      flashcardsJson = raw as typeof flashcardsJson;
      flashcardsSource = "db";
    }
  }

  // TS fallback — if DB has nothing for this topic, look up the
  // bundled hard-coded deck in src/data/flashcards.ts. Lets the admin
  // SEE what students currently see (the TS deck) and migrate it to
  // DB by hitting Save. Only runs for ICT today; future courses
  // author straight into DB so won't have a TS file to fall back to.
  if (flashcardsSource === "empty" && slug === "ict") {
    try {
      const { getTsFlashcardDeck } = await import("@/lib/flashcards-lookup");
      const tsCards = getTsFlashcardDeck(res.moduleNumber, res.topicNumber);
      if (tsCards.length > 0) {
        flashcardsJson = tsCards.map((c) => ({ front: c.front, back: c.back }));
        flashcardsSource = "ts";
      }
    } catch {
      // Bundled file missing — leave empty.
    }
  }

  return Response.json({
    topic: {
      id: data.id,
      number: data.number,
      title: data.title,
      timeMin: data.time_min,
      hook: data.hook,
      contentJson: data.content_json,
      flashcardsJson,
      // "db" → editable normally
      // "ts" → bundled in source; first Save migrates to DB
      // "empty" → no cards anywhere
      flashcardsSource,
      orderIndex: data.order_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}

// ─── PATCH ───────────────────────────────────────────────────
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum } = await ctx.params;
  const res = await resolveTopicId(slug, num, topicNum);
  if (!res.ok) return res.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.hook === "string") patch.hook = body.hook.trim() || null;
  if (body.timeMin === null) patch.time_min = null;
  else if (typeof body.timeMin === "number" && Number.isInteger(body.timeMin))
    patch.time_min = body.timeMin;
  if (typeof body.orderIndex === "number" && Number.isInteger(body.orderIndex))
    patch.order_index = body.orderIndex;
  if (typeof body.number === "number" && Number.isInteger(body.number) && body.number > 0)
    patch.number = body.number;
  // content_json is the Phase 5 content-block array. We accept any JSON
  // array here; the block editor validates structure client-side.
  //
  // Every `html` field in the tree is run through the allowlist
  // sanitizer server-side so a compromised admin account can't store
  // `<img src=x onerror=…>` or similar. The student renderer still
  // uses dangerouslySetInnerHTML for performance; this is the only
  // line of defense.
  if (Array.isArray(body.contentJson)) {
    patch.content_json = sanitizeContentBlocks(body.contentJson);
  }
  // flashcards_json — array of { front, back, deletedAt? }. The optional
  // deletedAt field (ISO string) marks the card as in-trash (layer 2).
  // Validate the inner shape so malformed payloads can't reach the DB
  // and break the student render. Drop anything that isn't a trimmed
  // non-empty front+back pair; preserve deletedAt as-is when present
  // (it's only ever set by our own delete handler).
  if (Array.isArray(body.flashcardsJson)) {
    const cleaned = body.flashcardsJson
      .map((c: unknown) => {
        if (!c || typeof c !== "object") return null;
        const obj = c as Record<string, unknown>;
        const front = typeof obj.front === "string" ? obj.front.trim() : "";
        const back = typeof obj.back === "string" ? obj.back.trim() : "";
        if (!front || !back) return null;
        const out: { front: string; back: string; deletedAt?: string } = {
          front,
          back,
        };
        if (typeof obj.deletedAt === "string" && obj.deletedAt.length > 0) {
          out.deletedAt = obj.deletedAt;
        }
        return out;
      })
      .filter(Boolean);
    patch.flashcards_json = cleaned;
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No editable fields in body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("topics")
    .update(patch)
    .eq("id", res.topicId)
    .select(
      "id, number, title, time_min, hook, content_json, order_index, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    if (/duplicate key|unique.*module_id.*number|23505/i.test(error.message)) {
      return Response.json(
        { error: "Another topic with that number already exists in this module." },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) return Response.json({ error: "Topic not found" }, { status: 404 });

  // Audit log — skip auto-save-only patches (content_json OR
  // flashcards_json) to avoid flooding the log with every 2-second
  // save the inline editor fires while the admin is typing. Meta
  // changes (title / hook / timeMin / order / number) still get
  // logged so we can reconstruct structural edits.
  const patchKeys = Object.keys(patch);
  const autosaveOnly =
    patchKeys.length > 0 &&
    patchKeys.every((k) => k === "content_json" || k === "flashcards_json");

  if (!autosaveOnly) {
    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "update_topic",
      subjectEmail: null,
      details: {
        courseSlug: slug,
        moduleNumber: res.moduleNumber,
        topicNumber: res.topicNumber,
        patchKeys,
      },
    });
  }

  // Optional follow-up read for flashcards_json so pre-migration DBs
  // still return a successful PATCH instead of a 500 on the select.
  let flashcardsJson: Array<{ front: string; back: string }> = [];
  const { data: fcData, error: fcError } = await supabase
    .from("topics")
    .select("flashcards_json")
    .eq("id", res.topicId)
    .maybeSingle();
  if (!fcError && fcData) {
    const raw = (fcData as { flashcards_json: unknown }).flashcards_json;
    if (Array.isArray(raw)) flashcardsJson = raw as typeof flashcardsJson;
  }

  // Cache-bust the public endpoints this edit touches so the CDN
  // serves fresh data on the very next student request. Without
  // this, up to 30 seconds of stale data could be served from the
  // edge after a teacher hits Save. Safe to call even for content-
  // only edits — the flashcard endpoint caches separately per
  // topic, so revalidating it costs nothing when flashcards
  // weren't touched.
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/api/public/mcq/${res.moduleNumber}`);
    revalidatePath(
      `/api/public/flashcards/${res.moduleNumber}/${res.topicNumber}`
    );
  } catch {
    /* revalidatePath missing in unusual runtimes — TTL fallback OK */
  }

  return Response.json({
    topic: {
      id: data.id,
      number: data.number,
      title: data.title,
      timeMin: data.time_min,
      hook: data.hook,
      contentJson: data.content_json,
      flashcardsJson,
      orderIndex: data.order_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}

// ─── DELETE ──────────────────────────────────────────────────
// Now soft-deletes by default. Pass ?permanent=1 to hard-delete (used
// by the /admin/tools/trash permanent-delete button; still gated by
// admin auth + a password re-prompt on the client). Soft-deleted
// topics disappear from the normal module view and appear in the
// trash list until restored or purged.
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum } = await ctx.params;
  const res = await resolveTopicId(slug, num, topicNum);
  if (!res.ok) return res.response;

  const url = new URL(req.url);
  const permanent = url.searchParams.get("permanent") === "1";

  if (!permanent) {
    // Soft delete. Cascade to questions in the same topic — marking
    // them deleted_at too keeps the trash UI consistent (question
    // counts don't show inside a deleted topic) and makes Restore
    // straightforward (flip both back).
    const now = new Date().toISOString();
    const { error: topicErr } = await supabase
      .from("topics")
      .update({ deleted_at: now })
      .eq("id", res.topicId);
    if (topicErr) {
      if (/column.*deleted_at.*does not exist/i.test(topicErr.message)) {
        return Response.json(
          { error: "soft-delete column missing — run scripts/migration-add-soft-delete.sql" },
          { status: 503 }
        );
      }
      return Response.json({ error: topicErr.message }, { status: 500 });
    }
    await supabase
      .from("questions")
      .update({ deleted_at: now })
      .eq("topic_id", res.topicId)
      .is("deleted_at", null);

    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "soft_delete_topic",
      subjectEmail: null,
      details: {
        courseSlug: slug,
        moduleNumber: res.moduleNumber,
        topicNumber: res.topicNumber,
      },
    });

    // Cache-bust public endpoints so students see the disappearance
    // on the next load instead of waiting for the 30s CDN TTL.
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/api/public/mcq/${res.moduleNumber}`);
      revalidatePath(
        `/api/public/flashcards/${res.moduleNumber}/${res.topicNumber}`
      );
    } catch {}

    return Response.json({ ok: true, softDeleted: true });
  }

  // Permanent path — same behaviour as before this migration. Images
  // cleaned first so the cascade doesn't orphan them.
  const cleanedImages = await cleanupTopicImages(res.topicId);

  const { error } = await supabase.from("topics").delete().eq("id", res.topicId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "delete_topic",
    subjectEmail: null,
    details: {
      courseSlug: slug,
      moduleNumber: res.moduleNumber,
      topicNumber: res.topicNumber,
      cleanedImages,
    },
  });

  return Response.json({ ok: true, cleanedImages });
}
