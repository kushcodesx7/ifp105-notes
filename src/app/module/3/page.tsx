"use client";
import ModulePage from "@/components/module/ModulePage";
import { topics } from "@/data/module3-topics";
import { mcqData } from "@/data/module3-mcq";

export default function Module3() {
  return (
    <ModulePage
      moduleNumber={3}
      moduleTitle="Social Media"
      moduleSubtitle="Foundation"
      moduleDescription="Social media platforms, modern tools & automation, metrics, advertising, LinkedIn, and personal branding."
      accentFrom="#3B82F6"
      accentTo="#2563EB"
      orbColor1="rgba(59,130,246,0.15)"
      orbColor2="rgba(37,99,235,0.1)"
      topics={topics}
      mcqData={mcqData}
      stats={[
        { n: "7", l: "Topics" },
        { n: "~40", l: "Minutes" },
        { n: "70", l: "Practice Qs" },
      ]}
    />
  );
}
