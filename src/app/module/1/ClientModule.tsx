"use client";

import ModulePage from "@/components/module/ModulePage";
import { getCurrentCourse, getCourseModule, CURRENT_COURSE_SLUG } from "@/lib/course-registry";
import type { Topic } from "@/types/content";

// Client-side wrapper that renders the Module 1 UI.
//
// Split out of page.tsx so that page.tsx can be a pure async server
// component that reads content from the DB (with TS fallback) and
// passes the resulting topics in as a prop. This is the student-facing
// half of the Phase 5.5 read-through-DB adapter.
export default function Module1Client({ topics }: { topics: Topic[] }) {
  const course = getCurrentCourse();
  const meta = getCourseModule(CURRENT_COURSE_SLUG, 1);
  return (
    <ModulePage
      courseSlug={course.slug}
      moduleNumber={1}
      moduleTitle={meta?.fullTitle ?? "Hardware & Software"}
      moduleSubtitle="The Big Picture"
      moduleDescription="Everything your computer does — from Netflix to assignments — comes down to hardware and software working together."
      accentFrom={meta?.accent ?? "#6366F1"}
      accentTo="#7C3AED"
      orbColor1="rgba(99,102,241,0.15)"
      orbColor2="rgba(124,58,237,0.1)"
      topics={topics}
      stats={[
        { n: String(meta?.topicCount ?? topics.length), l: "Topics" },
        { n: `~${(meta?.topicCount ?? topics.length) * 5}`, l: "Minutes" },
        { n: String((meta?.topicCount ?? topics.length) * 7), l: "Practice Qs" },
      ]}
    />
  );
}
