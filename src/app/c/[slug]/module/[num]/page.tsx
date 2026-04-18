import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { loadModuleFromDB } from "@/lib/module-loader";
import { getActiveCourseBySlug } from "@/lib/active-courses";
import { supabase } from "@/lib/supabase";
import ModuleClient from "./ModuleClient";

// /c/[slug]/module/[num] — canonical multi-course module page.
//
// Server component, ISR 30s. Resolves course + module metadata + topic
// content in 2 round-trips (via loadModuleFromDB). Passes everything
// to ModuleClient, the generic student-facing view.
//
// Legacy handling:
//   - `/c/ict/module/N` redirects to the existing `/module/N` route so
//     ICT keeps its canonical URLs (bookmarks, SEO, per-module widgets
//     like the HTML editor for module 4 that aren't worth re-porting
//     here).
//   - Future courses (Python, etc.) land on this route directly.

export const revalidate = 30;

export default async function CourseModulePage({
  params,
}: {
  params: Promise<{ slug: string; num: string }>;
}) {
  const { slug, num } = await params;
  const moduleNumber = parseInt(num, 10);
  if (Number.isNaN(moduleNumber)) notFound();

  // Keep ICT's existing URLs as canonical. Phase 7+ can unify if we
  // want ICT on the new pattern.
  if (slug === "ict") redirect(`/module/${moduleNumber}`);

  const course = await getActiveCourseBySlug(slug);
  if (!course) notFound();

  const loaded = await loadModuleFromDB(slug, moduleNumber);
  if (!loaded) notFound();

  // Fetch module row separately — we need accent/subtitle metadata
  // that loadModuleFromDB doesn't surface.
  const { data: moduleRow } = await supabase
    .from("modules")
    .select("title, full_title, subtitle, description, accent")
    .eq("course_id", course.id)
    .eq("number", moduleNumber)
    .maybeSingle();
  const m = moduleRow as {
    title: string;
    full_title: string | null;
    subtitle: string | null;
    description: string | null;
    accent: string | null;
  } | null;

  return (
    <Suspense fallback={null}>
      <ModuleClient
        courseSlug={slug}
        courseCode={course.code}
        moduleNumber={moduleNumber}
        moduleTitle={m?.full_title ?? m?.title ?? `Module ${moduleNumber}`}
        moduleSubtitle={m?.subtitle ?? ""}
        moduleDescription={
          m?.description ?? course.description ?? "Learn at your pace."
        }
        accent={m?.accent ?? course.accent ?? "#6366F1"}
        topics={loaded.topics}
      />
    </Suspense>
  );
}
