import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// /api/admin/courses/[slug]/modules — list + create modules in a course.
//
// Modules live in the DB per Phase 4. ICT (slug "ict") is the historical
// exception — its modules still live in TS files under src/data/ and
// the app reads from course-registry. New courses (Python, etc.) are
// fully DB-driven.
//
// Creating a module:
//   - `number` is assigned by the caller (typical: next available int).
//   - `UNIQUE(course_id, number)` at the DB layer guards against dupes.
//   - Returns 409 on duplicate with a clear message.

type RouteContext = { params: Promise<{ slug: string }> };

interface ModuleRow {
  id: string;
  number: number;
  title: string;
  fullTitle: string | null;
  subtitle: string | null;
  description: string | null;
  accent: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

async function resolveCourseId(slug: string): Promise<string | null> {
  const { data } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

// ─── GET — list modules in a course ───────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;
  const courseId = await resolveCourseId(slug);
  if (!courseId) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("modules")
    .select(
      "id, number, title, full_title, subtitle, description, accent, order_index, created_at, updated_at"
    )
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })
    .order("number", { ascending: true });

  if (error) {
    if (/relation.*modules.*does not exist|42P01/i.test(error.message)) {
      return Response.json(
        {
          modules: [],
          migrationPending:
            "modules table missing — run scripts/migration-phase4-course-content-tables.sql",
        },
        { status: 200 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  const modules: ModuleRow[] = (data || []).map((m) => ({
    id: m.id,
    number: m.number,
    title: m.title,
    fullTitle: m.full_title,
    subtitle: m.subtitle,
    description: m.description,
    accent: m.accent,
    orderIndex: m.order_index,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  }));
  return Response.json({ modules });
}

// ─── POST — create a module ───────────────────────────────────
// Body: { number, title, fullTitle?, subtitle?, description?, accent?,
//         orderIndex? }
// If `number` is omitted we pick the next int ≥ existing max + 1.
export async function POST(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;
  const courseId = await resolveCourseId(slug);
  if (!courseId) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

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
    // Auto-assign: max(number) + 1, starting at 1.
    const { data: maxRow } = await supabase
      .from("modules")
      .select("number")
      .eq("course_id", courseId)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();
    number = ((maxRow as { number: number } | null)?.number ?? 0) + 1;
  }

  const insertRow: Record<string, unknown> = {
    course_id: courseId,
    number,
    title,
    full_title:
      typeof body.fullTitle === "string" ? body.fullTitle.trim() || null : null,
    subtitle:
      typeof body.subtitle === "string" ? body.subtitle.trim() || null : null,
    description:
      typeof body.description === "string" ? body.description.trim() || null : null,
    accent: typeof body.accent === "string" ? body.accent.trim() || null : null,
    order_index:
      typeof body.orderIndex === "number" && Number.isInteger(body.orderIndex)
        ? body.orderIndex
        : number, // fall back to matching the module number
  };

  const { data, error } = await supabase
    .from("modules")
    .insert(insertRow)
    .select(
      "id, number, title, full_title, subtitle, description, accent, order_index, created_at, updated_at"
    )
    .single();

  if (error) {
    if (/relation.*modules.*does not exist|42P01/i.test(error.message)) {
      return Response.json(
        {
          error:
            "modules table missing — run scripts/migration-phase4-course-content-tables.sql",
        },
        { status: 503 }
      );
    }
    if (/duplicate key|unique.*course_id.*number|23505/i.test(error.message)) {
      return Response.json(
        { error: `Module ${number} already exists in "${slug}".` },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "create_module",
    subjectEmail: null,
    details: { courseSlug: slug, moduleNumber: number, title },
  });

  return Response.json(
    {
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
    },
    { status: 201 }
  );
}
