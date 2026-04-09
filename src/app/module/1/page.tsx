"use client";
import ModulePage from "@/components/module/ModulePage";
import { topics } from "@/data/module1-topics";
import { mcqData } from "@/data/module1-mcq";

export default function Module1() {
  return (
    <ModulePage
      moduleNumber={1}
      moduleTitle="Hardware & Software"
      moduleSubtitle="The Big Picture"
      moduleDescription="Everything your computer does — from Netflix to assignments — comes down to hardware and software working together."
      accentFrom="#6366F1"
      accentTo="#7C3AED"
      orbColor1="rgba(99,102,241,0.15)"
      orbColor2="rgba(124,58,237,0.1)"
      topics={topics}
      mcqData={mcqData}
      stats={[
        { n: "11", l: "Topics" },
        { n: "~55", l: "Minutes" },
        { n: "110", l: "Practice Qs" },
      ]}
    />
  );
}
