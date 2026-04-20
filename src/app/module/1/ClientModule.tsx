"use client";

import dynamic from "next/dynamic";
import ModulePage from "@/components/module/ModulePage";
import { getCurrentCourse, getCourseModule, CURRENT_COURSE_SLUG } from "@/lib/course-registry";
import { useInlineEditMode } from "@/lib/use-inline-edit";
import type { Topic } from "@/types/content";
import { mcqData as _mcqData1 } from "@/data/module1-mcq";
// Live count of MCQs for the hero stats badge. Reading the TS
// module's array at render so admin deletes in the admin panel
// still show the original count (Mon fix: prefer LIVE DB count).
// For now, this beats the hardcoded number it used to show and
// stays correct so long as admins don't hot-edit the TS files.
const _mcqCount1 = Object.values(_mcqData1).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);

// Inline editor is dynamically loaded — keeps the editor JS out of the
// student bundle entirely. Students who navigate to ?edit=1 without
// being an admin hit `useInlineEditMode()` → false → never request the
// chunk.
const InlineModuleEditor = dynamic(
  () => import("@/components/admin/InlineModuleEditor"),
  { ssr: false }
);

// Client-side wrapper that renders the Module 1 UI.
//
// Split out of page.tsx so that page.tsx can be a pure async server
// component that reads content from the DB (with TS fallback) and
// passes the resulting topics in as a prop. This is the student-facing
// half of the Phase 5.5 read-through-DB adapter.
//
// Phase 6: when an admin hits the page with `?edit=1`, the same route
// renders InlineModuleEditor instead of the student ModulePage — no
// URL change, no reload.
export default function Module1Client({ topics }: { topics: Topic[] }) {
  const isEditing = useInlineEditMode();
  if (isEditing) {
    return <InlineModuleEditor slug={CURRENT_COURSE_SLUG} moduleNumber={1} />;
  }
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
        { n: String(_mcqCount1), l: "Practice Qs" },
      ]}
    />
  );
}
