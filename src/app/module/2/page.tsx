"use client";
import ModulePage from "@/components/module/ModulePage";
import { topics } from "@/data/module2-topics";
import { mcqData } from "@/data/module2-mcq";

export default function Module2() {
  return (
    <ModulePage
      moduleNumber={2}
      moduleTitle="Office Automation"
      moduleSubtitle="Word, Excel & PowerPoint"
      moduleDescription="Editing, formatting, formulas, charts, presentations, and slide shows — the tools you'll use in every job."
      accentFrom="#10B981"
      accentTo="#059669"
      orbColor1="rgba(16,185,129,0.15)"
      orbColor2="rgba(5,150,105,0.1)"
      topics={topics}
      mcqData={mcqData}
      stats={[
        { n: "9", l: "Topics" },
        { n: "~45", l: "Minutes" },
        { n: "90", l: "Practice Qs" },
      ]}
    />
  );
}
