"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Course picker — rendered above the home-page hero when more than
// one course is active on the platform. With a single course (ICT
// today) this component renders nothing so nothing changes visually
// for the current deployment.
//
// Client component that fetches `/api/public/courses` on mount. The
// endpoint is cached aggressively (5 min s-maxage + 30 min SWR) so
// the fetch lands from the Vercel edge for the typical student.
// Server-rendering this was the first choice but the home page is
// a client component, and mixing server children into a client
// parent requires a server-layout refactor that's out of scope for
// this PR.

interface ActiveCourse {
  slug: string;
  code: string;
  name: string;
  description: string | null;
  accent: string | null;
}

export default function CoursePicker() {
  const [courses, setCourses] = useState<ActiveCourse[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/public/courses")
      .then((r) => (r.ok ? r.json() : { courses: [] }))
      .then((d) => {
        if (alive) setCourses(d.courses || []);
      })
      .catch(() => {
        if (alive) setCourses([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Hide entirely during the first paint and for single-course setups.
  // The picker should feel like progressive enhancement, not a flash
  // of half-loaded UI.
  if (!courses || courses.length < 2) return null;

  return (
    <section className="relative px-6 pt-20 pb-6 z-10">
      {/* pt-20 pushes below the 14-high fixed navbar (56px) + a small
          breathing gap. z-10 lifts the picker above the animated orbs
          that the hero paints behind — without it, glow from the
          orbs bleeds over the card borders on Safari. */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Pick your course
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            {courses.length} courses live at Amity Tashkent
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((c) => {
            const href = c.slug === "ict" ? "/" : `/c/${c.slug}`;
            const accent = c.accent || "#6366F1";
            return (
              <Link
                key={c.slug}
                href={href}
                className="rounded-2xl p-5 transition-all hover:scale-[1.02] active:scale-[0.99] group"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: accent }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    {c.code}
                  </span>
                </div>
                <div className="text-base font-bold mb-1">{c.name}</div>
                {c.description && (
                  <p className="text-[12px] text-zinc-400 line-clamp-2">
                    {c.description}
                  </p>
                )}
                <div className="text-[11px] text-zinc-600 mt-3 group-hover:text-zinc-400 transition-colors">
                  Enter course →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
