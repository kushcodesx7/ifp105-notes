import "server-only";
import { supabase } from "@/lib/supabase";

// Active-course lookup — used by the root home page + course picker to
// decide whether we have more than one course and by /c/[slug] to
// resolve the metadata for the course landing page.
//
// Cached per request implicitly by Supabase's PostgREST response
// caching. Small table (one row per course) so we never worry about
// pagination.

export interface ActiveCourse {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string | null;
  accent: string | null;
  icon: string | null;
  institution: string | null;
}

/** List all courses with `active = true`. Empty array on DB miss. */
export async function listActiveCourses(): Promise<ActiveCourse[]> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(
        "id, slug, code, name, description, accent, icon, institution, active"
      )
      .eq("active", true)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as ActiveCourse[]).filter((c) => c.slug && c.name);
  } catch {
    return [];
  }
}

/** Look up a single course by slug. Returns null if inactive / missing. */
export async function getActiveCourseBySlug(
  slug: string
): Promise<ActiveCourse | null> {
  try {
    const { data } = await supabase
      .from("courses")
      .select(
        "id, slug, code, name, description, accent, icon, institution"
      )
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    return (data as ActiveCourse | null) ?? null;
  } catch {
    return null;
  }
}
