import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { cleanupModuleImages } from "@/lib/storage-cleanup";

// /api/admin/courses/[slug]/modules/[num]
//   GET    — module detail + its topics (with question counts)
//   PATCH  — update editable fields
//   DELETE — hard delete the module (CASCADE drops topics + questions).
//            We allow hard delete here because modules don't have any
//            FK from student_progress — progress references module_number
//            as a plain int, so deleting a module row doesn't cascade
//            into student history.

type RouteContext = {
  params: Promise<{ slug: string; num: string }>;
};

interface TopicLite {
  id: string;
  number: number;
  title: string;
  timeMin: number | null;
  hook: string | null;
  orderIndex: number;
  questionCount: number;
  // Number of flashcards stored for this topic. Shown in the collapsed
  // topic row so admins know the deck exists without expanding — the
  // flashcards editor itself lives inside the expander. Falls back to
  // 0 on pre-flashcards-migration DBs (column doesn't exist yet).
  flashcardCount: number;
  createdAt: string;
  updatedAt: string;
}

async function resolveCourseAndModule(
  slug: string,
  num: string
): Promise<
  | { ok: true; courseId: string; moduleId: string; moduleNumber: number }
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

  return {
    ok: true,
    courseId,
    moduleId: (mod as { id: string }).id,
    moduleNumber,
  };
}

// ─── GET — module detail + topics ─────────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num } = await ctx.params;
  const res = await resolveCourseAndModule(slug, num);
  if (!res.ok) return res.response;

  const { data: moduleRow, error: modErr } = await supabase
    .from("modules")
    .select(
      "id, number, title, full_title, subtitle, description, accent, order_index, created_at, updated_at"
    )
    .eq("id", res.moduleId)
    .single();

  if (modErr) {
    return Response.json({ error: modErr.message }, { status: 500 });
  }

  const { data: topicRows } = await supabase
    .from("topics")
    .select(
      "id, number, title, time_min, hook, order_index, created_at, updated_at"
    )
    .eq("module_id", res.moduleId)
    .order("order_index", { ascending: true })
    .order("number", { ascending: true });

  // Question counts per topic, in one round trip.
  const topicIds = (topicRows || []).map((t) => t.id);
  const questionCounts = new Map<string, number>();
  if (topicIds.length > 0) {
    const { data: qRows } = await supabase
      .from("questions")
      .select("topic_id")
      .in("topic_id", topicIds);
    for (const q of (qRows || []) as { topic_id: string }[]) {
      questionCounts.set(q.topic_id, (questionCounts.get(q.topic_id) || 0) + 1);
    }
  }

  // Flashcard counts per topic. Separate select because flashcards_json
  // is a JSONB array inside the topics table — the cheapest way to get
  // card counts without pulling the entire JSONB payload across the
  // wire is to use jsonb_array_length via a SQL expression. We wrap it
  // in try/catch so pre-migration DBs (column doesn't exist) fall
  // through to 0 counts without breaking the modules page.
  const flashcardCounts = new Map<string, number>();
  if (topicIds.length > 0) {
    const { data: fcRows, error: fcErr } = await supabase
      .from("topics")
      .select("id, flashcards_json")
      .in("id", topicIds);
    if (!fcErr && fcRows) {
      for (const row of fcRows as { id: string; flashcards_json: unknown }[]) {
        const arr = row.flashcards_json;
        flashcardCounts.set(row.id, Array.isArray(arr) ? arr.length : 0);
      }
    }
  }

  const topics: TopicLite[] = (topicRows || []).map((t) => ({
    id: t.id,
    number: t.number,
    title: t.title,
    timeMin: t.time_min,
    hook: t.hook,
    orderIndex: t.order_index,
    questionCount: questionCounts.get(t.id) || 0,
    flashcardCount: flashcardCounts.get(t.id) || 0,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));

  return Response.json({
    module: {
      id: moduleRow.id,
      number: moduleRow.number,
      title: moduleRow.title,
      fullTitle: moduleRow.full_title,
      subtitle: moduleRow.subtitle,
      description: moduleRow.description,
      accent: moduleRow.accent,
      orderIndex: moduleRow.order_index,
      createdAt: moduleRow.created_at,
      updatedAt: moduleRow.updated_at,
    },
    topics,
  });
}

// ─── PATCH — update module metadata ───────────────────────────
// Editable: title, fullTitle, subtitle, description, accent, orderIndex,
// number. Moving `number` may collide with another module in the same
// course — DB UNIQUE (course_id, number) catches that and we return 409.
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num } = await ctx.params;
  const res = await resolveCourseAndModule(slug, num);
  if (!res.ok) return res.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.fullTitle === "string")
    patch.full_title = body.fullTitle.trim() || null;
  if (typeof body.subtitle === "string")
    patch.subtitle = body.subtitle.trim() || null;
  if (typeof body.description === "string")
    patch.description = body.description.trim() || null;
  if (typeof body.accent === "string")
    patch.accent = body.accent.trim() || null;
  if (typeof body.orderIndex === "number" && Number.isInteger(body.orderIndex))
    patch.order_index = body.orderIndex;
  if (typeof body.number === "number" && Number.isInteger(body.number) && body.number > 0)
    patch.number = body.number;

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No editable fields in body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("modules")
    .update(patch)
    .eq("id", res.moduleId)
    .select(
      "id, number, title, full_title, subtitle, description, accent, order_index, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    if (/duplicate key|unique.*course_id.*number|23505/i.test(error.message)) {
      return Response.json(
        { error: `Another module with that number already exists in "${slug}".` },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "Module not found" }, { status: 404 });
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "update_module",
    subjectEmail: null,
    details: { courseSlug: slug, moduleNumber: res.moduleNumber, patch },
  });

  return Response.json({
    module: {
      id: data.id,
      number: data.number,
      title: data.title,
      fullTitle: data.full_title,
      subtitle: data.subtitle,
      description: data.description,
      accent: data.accent,
      orderIndex: data.order_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}

// ─── DELETE — hard delete module (+ topics + questions cascade) ─
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num } = await ctx.params;
  const res = await resolveCourseAndModule(slug, num);
  if (!res.ok) return res.response;

  // Clean orphan images from all topics under this module BEFORE the
  // DB cascade removes the rows we need to find URLs on.
  const cleanedImages = await cleanupModuleImages(res.moduleId);

  const { error } = await supabase.from("modules").delete().eq("id", res.moduleId);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "delete_module",
    subjectEmail: null,
    details: {
      courseSlug: slug,
      moduleNumber: res.moduleNumber,
      cleanedImages,
    },
  });

  return Response.json({ ok: true, cleanedImages });
}
