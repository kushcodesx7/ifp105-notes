"use client";
import ModulePage from "@/components/module/ModulePage";
import { topics } from "@/data/module2-topics";
import { mcqData } from "@/data/module2-mcq";

export default function Module2() {
  return (
    <ModulePage
      moduleNumber={2}
      moduleTitle="Number Systems"
      moduleSubtitle="& Logic Gates"
      moduleDescription="Binary, decimal, octal, hexadecimal conversions and Boolean logic gates. The math behind the machine."
      accentFrom="#10B981"
      accentTo="#059669"
      orbColor1="rgba(16,185,129,0.15)"
      orbColor2="rgba(5,150,105,0.1)"
      topics={topics}
      mcqData={mcqData}
      stats={[
        { n: "8", l: "Topics" },
        { n: "~40", l: "Minutes" },
        { n: "80", l: "Practice Qs" },
      ]}
    />
  );
}
