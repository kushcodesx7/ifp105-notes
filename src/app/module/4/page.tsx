"use client";
import ModulePage from "@/components/module/ModulePage";
import { topics } from "@/data/module4-topics";
import { mcqData } from "@/data/module4-mcq";

export default function Module4() {
  return (
    <ModulePage
      moduleNumber={4}
      moduleTitle="HTML & Web"
      moduleSubtitle="Development"
      moduleDescription="Build web pages from scratch. Tags, elements, attributes, tables, lists, links, images — with hands-on examples."
      accentFrom="#06B6D4"
      accentTo="#0891B2"
      orbColor1="rgba(6,182,212,0.15)"
      orbColor2="rgba(8,145,178,0.1)"
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
