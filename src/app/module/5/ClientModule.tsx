"use client";
import dynamic from "next/dynamic";
import ModulePage from "@/components/module/ModulePage";
import { CURRENT_COURSE_SLUG } from "@/lib/course-registry";
import { useInlineEditMode } from "@/lib/use-inline-edit";
import type { Topic } from "@/types/content";

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
        { n: "70", l: "Practice Qs" },
      ]}
    />
  );
}
