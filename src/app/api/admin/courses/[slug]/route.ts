import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { cleanupCourseImages } from "@/lib/storage-cleanup";

// /api/admin/courses/[slug]
//   GET    — course detail + modules list (for the course-edit page)
//   PATCH  — update editable fields (code, name, description, accent,
//            icon, institution, active). Slug is NOT editable — it's the
//            stable identifier that lives in URLs and FKs; changing it
//            would break every deep link.
//   DELETE — soft delete (sets active=false). We keep the row + all
//            child content because `student_progress.course_id` FK
//            references it and hard-deleting would cascade-erase years
//            of student history.
//
// All three endpoints require admin auth and graceful-degrade when the
// Phase 3 / Phase 4 migrations haven't run.

type RouteContext = { params: Promise<{ slug: string }> };

interface ModuleLite {
  id: string;
  number: number;
  title: string;
  fullTitle: string | null;
  subtitle: string | null;
  description: string | null;
  accent: string | null;
  orderIndex: number;
  topicCount: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── GET — course detail + modules ─────────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id, slug, code, name, description, accent, icon, institution, active, created_at, updated_at"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (/relation.*courses.*does not exist|42P01/i.test(error.message)) {
      return Response.json(
        { error: "courses table missing — run migration-phase3-multi-course.sql" },
        { status: 503 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  // Load modules, topics counts, and questions counts. If the Phase 4
  // tables don't exist yet, return zero-module view with a hint so the
  // UI can guide the teacher to run the migration.
  let modules: ModuleLite[] = [];
  let migrationHint: string | null = null;

  const { data: moduleRows, error: modErr } = await supabase
    .from("modules")
    .select(
      "id, number, title, full_title, subtitle, description, accent, order_index, created_at, updated_at"
    )
    .eq("course_id", course.id)
    .order("order_index", { ascending: true })
    .order("number", { ascending: true });

  if (modErr && /relation.*modules.*does not exist|42P01/i.test(modErr.message)) {
    migrationHint =
      "modules table missing — run scripts/migration-phase4-course-content-tables.sql";
  } else if (modErr) {
    return Response.json({ error: modErr.message }, { status: 500 });
  } else {
    // Fetch counts in two grouped queries, cheaper than N+1.
    const moduleIds = (moduleRows || []).map((m) => m.id);
    const topicCounts = new Map<string, number>();
    const questionCounts = new Map<string, number>();

    if (moduleIds.length > 0) {
      // Live topics only — soft-deleted ones don't count toward
      // per-module totals shown on the courses list.
      const { data: topicRows } = await supabase
        .from("topics")
        .select("id, module_id")
        .in("module_id", moduleIds)
        .is("deleted_at", null);
      const topicIds = (topicRows || []).map((t) => t.id);
      for (const t of (topicRows || []) as { id: string; module_id: string }[]) {
        topicCounts.set(t.module_id, (topicCounts.get(t.module_id) || 0) + 1);
      }

      if (topicIds.length > 0) {
        const { data: qRows } = await supabase
          .from("questions")
          .select("topic_id")
          .in("topic_id", topicIds)
          .is("deleted_at", null);
        // Map question → module via topic_id→module_id lookup.
        const topicToModule = new Map<string, string>();
        for (const t of (topicRows || []) as { id: string; module_id: string }[]) {
          topicToModule.set(t.id, t.module_id);
        }
        for (const q of (qRows || []) as { topic_id: string }[]) {
          const mid = topicToModule.get(q.topic_id);
          if (!mid) continue;
          questionCounts.set(mid, (questionCounts.get(mid) || 0) + 1);
        }
      }
    }

    modules = (moduleRows || []).map((m) => ({
      id: m.id,
      number: m.number,
      title: m.title,
      fullTitle: m.full_title,
      subtitle: m.subtitle,
      description: m.description,
      accent: m.accent,
      orderIndex: m.order_index,
      topicCount: topicCounts.get(m.id) || 0,
      questionCount: questionCounts.get(m.id) || 0,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));
  }

  return Response.json({
    course: {
      id: course.id,
      slug: course.slug,
      code: course.code,
      name: course.name,
      description: course.description,
      accent: course.accent,
      icon: course.icon,
      institution: course.institution,
      active: course.active,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    },
    modules,
    migrationPending: migrationHint,
  });
}

// ─── PATCH — update course metadata ────────────────────────────
// Editable: code, name, description, accent, icon, institution, active.
// Slug is frozen (stable identifier). Pass any subset of fields.
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.code === "string") patch.code = body.code.trim();
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.description === "string")
    patch.description = body.description.trim() || null;
  if (typeof body.accent === "string")
    patch.accent = body.accent.trim() || null;
  if (typeof body.icon === "string") patch.icon = body.icon.trim() || null;
  if (typeof body.institution === "string")
    patch.institution = body.institution.trim() || null;
  if (typeof body.active === "boolean") patch.active = body.active;

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No editable fields in body" }, { status: 400 });
  }

  // Touch updated_at so the list view can sort by "recently edited".
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("courses")
    .update(patch)
    .eq("slug", slug)
    .select(
      "id, slug, code, name, description, accent, icon, institution, active, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "update_course",
    subjectEmail: null,
    details: { slug, patch },
  });

  return Response.json({
    course: {
      id: data.id,
      slug: data.slug,
      code: data.code,
      name: data.name,
      description: data.description,
      accent: data.accent,
      icon: data.icon,
      institution: data.institution,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}

// ─── DELETE — soft delete (active=false) ───────────────────────
// We never hard-delete a course: `student_progress.course_id` FK's it
// with ON DELETE CASCADE, so a hard delete would vaporize years of
// student history. Soft-delete hides it from the student-facing course
// picker while keeping the row for historical progress.
//
// Accept ?hard=true in the query string for a true cascade (for the
// dev case of cleaning up a course created by accident that nobody
// touched). Safe because the row count is small and the caller is
// admin-authenticated; still, require an explicit opt-in.
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const hard = url.searchParams.get("hard") === "true";

  if (hard) {
    // Before the DB cascade, resolve course_id and sweep orphan images
    // from every topic under every module in this course. Soft-delete
    // (below) skips this — the rows stick around and so do the files.
    const { data: courseRow } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    const courseId = (courseRow as { id: string } | null)?.id ?? null;
    const cleanedImages = courseId
      ? await cleanupCourseImages(courseId)
      : 0;

    const { error } = await supabase.from("courses").delete().eq("slug", slug);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "delete_course",
      subjectEmail: null,
      details: { slug, hard: true, cleanedImages },
    });
    return Response.json({ ok: true, hard: true, cleanedImages });
  }

  const { error } = await supabase
    .from("courses")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "delete_course",
    subjectEmail: null,
    details: { slug, hard: false, softDelete: true },
  });

  return Response.json({ ok: true, hard: false });
}
