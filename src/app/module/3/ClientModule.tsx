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

export default function Module3Client({ topics }: { topics: Topic[] }) {
  const isEditing = useInlineEditMode();
  if (isEditing) {
    return <InlineModuleEditor slug={CURRENT_COURSE_SLUG} moduleNumber={3} />;
  }
  return (
    <ModulePage
      courseSlug={CURRENT_COURSE_SLUG}
      moduleNumber={3}
      moduleTitle="Social Media"
      moduleSubtitle="Foundation"
      moduleDescription="Social media platforms, modern tools & automation, metrics, advertising, LinkedIn, and personal branding."
      accentFrom="#3B82F6"
      accentTo="#2563EB"
      orbColor1="rgba(59,130,246,0.15)"
      orbColor2="rgba(37,99,235,0.1)"
      topics={topics}
      stats={[
        { n: "7", l: "Topics" },
        { n: "~40", l: "Minutes" },
        { n: "49", l: "Practice Qs" },
      ]}
    />
  );
}
