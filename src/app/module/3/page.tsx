"use client";
import ModulePage from "@/components/module/ModulePage";
import { topics } from "@/data/module3-topics";
import { mcqData } from "@/data/module3-mcq";

export default function Module3() {
  return (
    <ModulePage
      moduleNumber={3}
      moduleTitle="MS Office"
      moduleSubtitle="& Productivity"
      moduleDescription="Word processing, spreadsheets, presentations — the tools you'll use in every job and assignment."
      accentFrom="#3B82F6"
      accentTo="#2563EB"
      orbColor1="rgba(59,130,246,0.15)"
      orbColor2="rgba(37,99,235,0.1)"
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
