import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";

// GET /api/admin/trash
//
// Lists every soft-deleted topic and question across the platform,
// ordered by most recently deleted first. Used by /admin/tools/trash
// to show "what's in the bin" with Restore + Delete Permanently
// buttons.
//
// Admin-only (requireAdmin). Deliberately no caching — teachers expect
// to see just-deleted items immediately and the volume is tiny.

export interface TrashedTopicItem {
  kind: "topic";
  id: string;
  topicNumber: number;
  title: string;
  moduleNumber: number;
  moduleTitle: string;
  courseSlug: string;
  courseTitle: string;
  deletedAt: string;
}

export interface TrashedQuestionItem {
  kind: "question";
  id: string;
  questionNumber: number;
  question: string;
  topicNumber: number;
  topicTitle: string;
  moduleNumber: number;
  moduleTitle: string;
  courseSlug: string;
  courseTitle: string;
  deletedAt: string;
}

export type TrashItem = TrashedTopicItem | TrashedQuestionItem;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  // Topics in the bin. Embed module → course so the UI can show the
  // full breadcrumb ("ICT › Module 1 › Topic 6") without extra lookups.
  const { data: topicRows, error: tErr } = await supabase
    .from("topics")
    .select(
      `id, number, title, deleted_at,
       module:modules!inner(number, title,
         course:courses!inner(slug, title))`
    )
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (tErr) {
    // Pre-migration: column doesn't exist. Return empty + signal.
    if (/column.*deleted_at.*does not exist/i.test(tErr.message)) {
      return Response.json({
        items: [],
        migrationPending:
          "soft-delete columns missing — run scripts/migration-add-soft-delete.sql",
      });
    }
    return Response.json({ error: tErr.message }, { status: 500 });
  }

  const { data: questionRows, error: qErr } = await supabase
    .from("questions")
    .select(
      `id, number, question, deleted_at,
       topic:topics!inner(number, title, deleted_at,
         module:modules!inner(number, title,
           course:courses!inner(slug, title)))`
    )
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (qErr) return Response.json({ error: qErr.message }, { status: 500 });

  // PostgREST returns nested joins as single-object or array-of-one.
  // `pickOne` normalises both shapes.
  function pickOne<T>(v: T | T[] | null | undefined): T | null {
    if (!v) return null;
    return Array.isArray(v) ? v[0] ?? null : v;
  }

  const topics: TrashedTopicItem[] = (topicRows || [])
    .map((t) => {
      const row = t as unknown as {
        id: string;
        number: number;
        title: string;
        deleted_at: string;
        module: unknown;
      };
      const mod = pickOne<{
        number: number;
        title: string;
        course: unknown;
      }>(row.module as never);
      if (!mod) return null;
      const course = pickOne<{ slug: string; title: string }>(mod.course as never);
      if (!course) return null;
      return {
        kind: "topic" as const,
        id: row.id,
        topicNumber: row.number,
        title: row.title,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        courseSlug: course.slug,
        courseTitle: course.title,
        deletedAt: row.deleted_at,
      };
    })
    .filter((t): t is TrashedTopicItem => t !== null);

  // Hide questions whose parent topic is ALSO trashed — restoring
  // the topic already brings its questions back, so listing them
  // separately would be noisy and invite confusing partial restores.
  const questions: TrashedQuestionItem[] = (questionRows || [])
    .map((q) => {
      const row = q as unknown as {
        id: string;
        number: number;
        question: string;
        deleted_at: string;
        topic: unknown;
      };
      const topic = pickOne<{
        number: number;
        title: string;
        deleted_at: string | null;
        module: unknown;
      }>(row.topic as never);
      if (!topic) return null;
      if (topic.deleted_at) return null; // parent topic is trashed
      const mod = pickOne<{ number: number; title: string; course: unknown }>(
        topic.module as never
      );
      if (!mod) return null;
      const course = pickOne<{ slug: string; title: string }>(mod.course as never);
      if (!course) return null;
      return {
        kind: "question" as const,
        id: row.id,
        questionNumber: row.number,
        question: row.question,
        topicNumber: topic.number,
        topicTitle: topic.title,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        courseSlug: course.slug,
        courseTitle: course.title,
        deletedAt: row.deleted_at,
      };
    })
    .filter((q): q is TrashedQuestionItem => q !== null);

  // Unified list sorted by most-recent-deletion.
  const items: TrashItem[] = [...topics, ...questions].sort((a, b) =>
    b.deletedAt.localeCompare(a.deletedAt)
  );

  return Response.json({ items });
}
