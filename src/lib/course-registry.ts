// Course registry — the SINGLE source of truth for which course(s)
// this deployment is running and what they contain.
//
// Today (Phase 1): one course, ICT. Everything derives from here.
// Navbar's module dropdown, the home page's module grid, API routes
// that iterate module numbers, SEO metadata — all should eventually
// read from `getCurrentCourse()` instead of hard-coding literals.
//
// Phase 3+: this file becomes a thin shim over a `courses` DB table
// populated by the admin editor. `getCurrentCourse()` stays as the
// same function signature; only the implementation changes.

import { MODULES, TOTAL_TOPICS, MODULE_TOTALS } from "@/lib/modules";
import type { Course, ModuleMeta } from "@/types/content";

// The one and only course this app serves today. Editable display
// strings (name, code, description) — when the editor lands in Phase 4
// these will become DB fields the teacher can rename per semester.
const ICT_COURSE: Course = {
  slug: "ict",
  code: "IFP105",
  name: "ICT Fundamentals",
  description:
    "Everything your computer does — from Netflix to assignments — comes down to hardware and software working together.",
  accent: "#6366F1",
  modules: MODULES,
};

// ── Registry API ───────────────────────────────────────────────

/** Every course currently served by this deployment. */
export function listCourses(): Course[] {
  return [ICT_COURSE];
}

/** Look up a course by slug. Returns undefined for unknown slugs. */
export function getCourse(slug: string): Course | undefined {
  return listCourses().find((c) => c.slug === slug);
}

/**
 * The "current" course shown to logged-in and anonymous users.
 *
 * Phase 1: always ICT. Phase 2+: could become the student's most
 * recently visited course, or the query-param course, or the
 * course registered to the student's current batch.
 */
export function getCurrentCourse(): Course {
  return ICT_COURSE;
}

/** Short convenience — the slug of the current course. */
export const CURRENT_COURSE_SLUG = ICT_COURSE.slug;

// ── Helpers around module metadata (forwarded from lib/modules) ──
// Re-export so callers don't have to know whether a helper lives in
// modules.ts or course-registry.ts.

export type { ModuleMeta };
export { MODULES, TOTAL_TOPICS, MODULE_TOTALS };

/**
 * Total topic count for a course. Accepts either a slug or a Course.
 * Falls back to the current course if the slug is unknown.
 */
export function getCourseTotalTopics(slugOrCourse?: string | Course): number {
  if (!slugOrCourse) return TOTAL_TOPICS;
  const course =
    typeof slugOrCourse === "string" ? getCourse(slugOrCourse) : slugOrCourse;
  if (!course) return TOTAL_TOPICS;
  return course.modules.reduce((sum, m) => sum + m.topicCount, 0);
}

/** Look up a module within a specific course. */
export function getCourseModule(
  slug: string,
  moduleId: number
): ModuleMeta | undefined {
  const course = getCourse(slug);
  return course?.modules.find((m) => m.id === moduleId);
}

// ── Course ID resolver (DB-backed) ─────────────────────────────
//
// Multi-course tables (`student_progress`, `batches`, `enrollments`,
// `student_sessions`) have a `course_id UUID` foreign key to the
// `courses` table. The DB is the source of truth for that UUID;
// the `slug` is the stable identifier the code knows.
//
// `getCourseIdBySlug` does a single lookup per cold start and caches
// the result in-process. In practice this is called a handful of
// times per API request (upserts + filters), and the `courses` table
// has 1 row, so the cache is effectively free and correct.
//
// IMPORTANT — do NOT add a top-level `import { supabase } from "@/lib/supabase"`
// to this file. `@/lib/supabase` is constructed with
// `process.env.SUPABASE_SERVICE_KEY` (server-only, no NEXT_PUBLIC_ prefix);
// importing it at module scope pulls it into every client bundle that
// pulls in course-registry (Navbar, home page, ModulePage, …) and
// `createClient(url, undefined)` throws "supabaseKey is required" at
// module-evaluation time, killing hydration site-wide. The dynamic
// import below keeps the supabase client strictly server-side (these
// functions are only called from API routes).

const slugToIdCache = new Map<string, string | null>();

/**
 * Resolve a course slug to its DB-generated UUID. Returns null if the
 * course doesn't exist in the DB yet (e.g. the Phase 3 migration
 * hasn't been applied). Callers should handle null by falling back
 * to the legacy no-course-id code path (same pattern as bloom_stats
 * graceful degrade elsewhere in the codebase).
 */
export async function getCourseIdBySlug(
  slug: string
): Promise<string | null> {
  if (slugToIdCache.has(slug)) {
    return slugToIdCache.get(slug) ?? null;
  }
  try {
    // Lazy import so the supabase client module (which hard-requires
    // the server-only service key at construction time) only loads
    // when this function is actually called — i.e. inside a server API
    // route. Client bundles that import course-registry for its
    // sync helpers never touch supabase.
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) {
      slugToIdCache.set(slug, null);
      return null;
    }
    const id = (data as { id: string }).id;
    slugToIdCache.set(slug, id);
    return id;
  } catch {
    slugToIdCache.set(slug, null);
    return null;
  }
}

/** Convenience: current course's UUID. */
export async function getCurrentCourseId(): Promise<string | null> {
  return getCourseIdBySlug(CURRENT_COURSE_SLUG);
}
