"use client";
import ModulePage from "@/components/module/ModulePage";
import { topics } from "@/data/module1-topics";
import { getCurrentCourse, getCourseModule, CURRENT_COURSE_SLUG } from "@/lib/course-registry";

// Module 1 entry point. Structural metadata (accent, topic count,
// full title) comes from the course registry so adding a course in
// Phase 3 doesn't require editing this file. Module-specific copy
// (moduleSubtitle, moduleDescription) stays here because it's
// authoring content, not structural data.
//
// MCQ data is lazy-loaded by ModulePage via src/data/load-mcq.ts —
// see Phase 1 perf work.
export default function Module1() {
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
