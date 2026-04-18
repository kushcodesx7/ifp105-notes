import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

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
  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("module_id", moduleId)
    .eq("number", topicNumber)
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

  const { data, error } = await supabase
    .from("topics")
    .select(
      "id, number, title, time_min, hook, content_json, order_index, created_at, updated_at"
    )
    .eq("id", res.topicId)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({
    topic: {
      id: data.id,
      number: data.number,
      title: data.title,
      timeMin: data.time_min,
      hook: data.hook,
      contentJson: data.content_json,
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
  // array here; the block editor will validate structure client-side.
  if (Array.isArray(body.contentJson)) patch.content_json = body.contentJson;

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

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "update_topic" as unknown as Parameters<typeof logAdminAction>[0]["action"],
    subjectEmail: null,
    details: {
      courseSlug: slug,
      moduleNumber: res.moduleNumber,
      topicNumber: res.topicNumber,
      patch,
    },
  });

  return Response.json({
    topic: {
      id: data.id,
      number: data.number,
      title: data.title,
      timeMin: data.time_min,
      hook: data.hook,
      contentJson: data.content_json,
      orderIndex: data.order_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}

// ─── DELETE ──────────────────────────────────────────────────
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum } = await ctx.params;
  const res = await resolveTopicId(slug, num, topicNum);
  if (!res.ok) return res.response;

  const { error } = await supabase.from("topics").delete().eq("id", res.topicId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "delete_topic" as unknown as Parameters<typeof logAdminAction>[0]["action"],
    subjectEmail: null,
    details: {
      courseSlug: slug,
      moduleNumber: res.moduleNumber,
      topicNumber: res.topicNumber,
    },
  });

  return Response.json({ ok: true });
}
