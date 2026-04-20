"use client";
import dynamic from "next/dynamic";
import ModulePage from "@/components/module/ModulePage";
import { CURRENT_COURSE_SLUG } from "@/lib/course-registry";
import { useInlineEditMode } from "@/lib/use-inline-edit";
import type { Topic } from "@/types/content";
import { mcqData as _mcqData5 } from "@/data/module5-mcq";
// Live count of MCQs for the hero stats badge. Reading the TS
// module's array at render so admin deletes in the admin panel
// still show the original count (Mon fix: prefer LIVE DB count).
// For now, this beats the hardcoded number it used to show and
// stays correct so long as admins don't hot-edit the TS files.
const _mcqCount5 = Object.values(_mcqData5).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);

const InlineModuleEditor = dynamic(
  () => import("@/components/admin/InlineModuleEditor"),
  { ssr: false }
);

export default function Module5Client({ topics }: { topics: Topic[] }) {
  const isEditing = useInlineEditMode();
  if (isEditing) {
    return <InlineModuleEditor slug={CURRENT_COURSE_SLUG} moduleNumber={5} />;
  }
  return (
    <ModulePage
      courseSlug={CURRENT_COURSE_SLUG}
      moduleNumber={5}
      moduleTitle="Tech Trends"
      moduleSubtitle="AI, Cloud & Beyond"
      moduleDescription="AI, Machine Learning, Cloud, Blockchain, VR/AR, IoT, Generative AI — the technologies shaping our future."
      accentFrom="#8B5CF6"
      accentTo="#7C3AED"
      orbColor1="rgba(139,92,246,0.15)"
      orbColor2="rgba(124,58,237,0.1)"
      topics={topics}
      stats={[
        { n: "10", l: "Topics" },
        { n: "~50", l: "Minutes" },
        { n: String(_mcqCount5), l: "Practice Qs" },
      ]}
    />
  );
}
