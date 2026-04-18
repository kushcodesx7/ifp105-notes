import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// /api/admin/courses/[slug]/modules/[num]/topics
//   GET  — list topics in the module
//   POST — create a new topic (content_json defaults to [])
//
// Phase 4 creates empty topics; Phase 5 will add the rich block editor
// that populates content_json.

type RouteContext = {
  params: Promise<{ slug: string; num: string }>;
};

async function resolveModuleId(
  slug: string,
  num: string
): Promise<
  | { ok: true; moduleId: string }
  | { ok: false; response: Response }
> {
  const moduleNumber = parseInt(num, 10);
  if (Number.isNaN(moduleNumber)) {
    return {
      ok: false,
      response: Response.json({ error: "Invalid module number" }, { status: 400 }),
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
  const { data: mod, error: modErr } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .eq("number", moduleNumber)
    .maybeSingle();
  if (modErr && /relation.*modules.*does not exist|42P01/i.test(modErr.message)) {
    return {
      ok: false,
      response: Response.json(
        {
          error:
            "modules table missing — run scripts/migration-phase4-course-content-tables.sql",
        },
        { status: 503 }
      ),
    };
  }
  if (!mod) {
    return {
      ok: false,
      response: Response.json({ error: "Module not found" }, { status: 404 }),
    };
  }
  return { ok: true, moduleId: (mod as { id: string }).id };
}

// ─── GET — list topics in a module ────────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num } = await ctx.params;
  const res = await resolveModuleId(slug, num);
  if (!res.ok) return res.response;

  const { data, error } = await supabase
    .from("topics")
    .select(
      "id, number, title, time_min, hook, order_index, created_at, updated_at"
    )
    .eq("module_id", res.moduleId)
    .order("order_index", { ascending: true })
    .order("number", { ascending: true });

  if (error) {
    if (/relation.*topics.*does not exist|42P01/i.test(error.message)) {
      return Response.json(
        {
          topics: [],
          migrationPending:
            "topics table missing — run scripts/migration-phase4-course-content-tables.sql",
        },
        { status: 200 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  const topics = (data || []).map((t) => ({
    id: t.id,
    number: t.number,
    title: t.title,
    timeMin: t.time_min,
    hook: t.hook,
    orderIndex: t.order_index,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));
  return Response.json({ topics });
}

// ─── POST — create a topic ────────────────────────────────────
// Body: { title, number?, timeMin?, hook?, orderIndex? }
export async function POST(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num } = await ctx.params;
  const res = await resolveModuleId(slug, num);
  if (!res.ok) return res.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  if (!title) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  let number: number;
  if (typeof body.number === "number" && Number.isInteger(body.number) && body.number > 0) {
    number = body.number;
  } else {
    const { data: maxRow } = await supabase
      .from("topics")
      .select("number")
      .eq("module_id", res.moduleId)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();
    number = ((maxRow as { number: number } | null)?.number ?? 0) + 1;
  }

  const insertRow: Record<string, unknown> = {
    module_id: res.moduleId,
    number,
    title,
    time_min:
      typeof body.timeMin === "number" && Number.isInteger(body.timeMin)
        ? body.timeMin
        : null,
    hook: typeof body.hook === "string" ? body.hook.trim() || null : null,
    // content_json defaults to '[]'::jsonb at the DB level.
    order_index:
      typeof body.orderIndex === "number" && Number.isInteger(body.orderIndex)
        ? body.orderIndex
        : number,
  };

  const { data, error } = await supabase
    .from("topics")
    .insert(insertRow)
    .select(
      "id, number, title, time_min, hook, order_index, created_at, updated_at"
    )
    .single();

  if (error) {
    if (/duplicate key|unique.*module_id.*number|23505/i.test(error.message)) {
      return Response.json(
        { error: `Topic ${number} already exists in module ${num}.` },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "create_topic",
    subjectEmail: null,
    details: { courseSlug: slug, moduleNumber: parseInt(num, 10), topicNumber: number, title },
  });

  return Response.json(
    {
      topic: {
        id: data.id,
        number: data.number,
        title: data.title,
        timeMin: data.time_min,
        hook: data.hook,
        orderIndex: data.order_index,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    },
    { status: 201 }
  );
}
