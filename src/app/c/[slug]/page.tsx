import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getActiveCourseBySlug } from "@/lib/active-courses";
import { supabase } from "@/lib/supabase";

// /c/[slug] — canonical course landing page.
//
// Shows the course's modules in a grid (DB-driven) with a short hero.
// For the legacy "ict" slug we redirect to the existing root home `/`
// so existing bookmarks + SEO don't break. Other slugs land here.
//
// Server component + ISR revalidate=30 so teacher edits to a course's
// metadata or its module list propagate to students within 30 seconds
// without us having to rebuild on every save.

export const revalidate = 30;

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Legacy redirect: ICT's canonical page is still `/` for now. The
  // homepage is a student-facing course-specific experience (cheat
  // sheets, compare-with-class, etc.) that doesn't generalize cleanly
  // yet. Phase 7 will unify — for now keep /c/ict → /.
  if (slug === "ict") redirect("/");

  const course = await getActiveCourseBySlug(slug);
  if (!course) notFound();

  // Module list for this course — cheap single query.
  const { data: modules } = await supabase
    .from("modules")
    .select("id, number, title, full_title, subtitle, accent, order_index")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true })
    .order("number", { ascending: true });

  const rows = (modules || []) as {
    id: string;
    number: number;
    title: string;
    full_title: string | null;
    subtitle: string | null;
    accent: string | null;
    order_index: number;
  }[];

  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <Navbar title={course.code} />
      </Suspense>

      <section className="relative pt-24 pb-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[11px] font-semibold text-zinc-400"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {course.institution || "Course"} · {course.code}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-3">
            <span
              style={{
                background: `linear-gradient(135deg, ${course.accent || "#6366F1"}, #8B5CF6)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {course.name}
            </span>
          </h1>
          {course.description && (
            <p className="text-sm text-zinc-400 max-w-lg mx-auto">
              {course.description}
            </p>
          )}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold mb-4">Modules</h2>
          {rows.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center text-sm text-zinc-400"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.08)",
              }}
            >
              No modules published for this course yet. Check back soon.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {rows.map((m) => {
                const accent = m.accent || course.accent || "#6366F1";
                return (
                  <Link
                    key={m.id}
                    href={`/c/${course.slug}/module/${m.number}`}
                    className="rounded-2xl p-5 transition-all hover:scale-[1.01] active:scale-[0.99] group"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          background: `${accent}22`,
                          color: accent,
                        }}
                      >
                        {m.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {m.full_title ?? m.title}
                        </div>
                        {m.subtitle && (
                          <div className="text-[11px] text-zinc-500 truncate">
                            {m.subtitle}
                          </div>
                        )}
                      </div>
                      <span className="text-zinc-500 group-hover:text-white transition-colors">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
