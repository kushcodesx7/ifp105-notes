"use client";
import ModulePage from "@/components/module/ModulePage";
import { topics } from "@/data/module5-topics";
// mcqData loaded dynamically by ModulePage; see src/data/load-mcq.ts.

export default function Module5() {
  return (
    <ModulePage
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
