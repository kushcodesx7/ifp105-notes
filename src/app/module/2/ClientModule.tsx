"use client";
import dynamic from "next/dynamic";
import ModulePage from "@/components/module/ModulePage";
import ExcelSimulator from "@/components/module/ExcelSimulator";
import { CURRENT_COURSE_SLUG } from "@/lib/course-registry";
import { useInlineEditMode } from "@/lib/use-inline-edit";
import type { Topic } from "@/types/content";

const InlineModuleEditor = dynamic(
  () => import("@/components/admin/InlineModuleEditor"),
  { ssr: false }
);

// Excel challenges for topic 4 (the only Excel topic in the rewritten
// Apr 27 2026 module). Old topics 5/6 (Formulas & Functions, Data
// Management) were dropped along with the Word/PowerPoint topics, so
// their challenges are gone — but the most useful ones (SUM, AVERAGE,
// MAX, MIN, simple multiplication) survive on the new topic 4.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const excelChallenges: Record<number, any[]> = {
  4: [
    { title: "Your first formula!", description: "Cell A1 has 10 and A2 has 20. Add them together in cell B1.", hint: "Type =A1+A2 in cell B1", initialData: { A1: "10", A2: "20" }, targetCell: "B1", expectedFormula: ["=A1+A2", "=a1+a2"], expectedResult: "30" },
    { title: "Add up a column", description: "Add all the numbers in A1 to A4 using the SUM formula. Put the answer in A5.", hint: "Use =SUM(A1:A4)", initialData: { A1: "5", A2: "10", A3: "15", A4: "20" }, targetCell: "A5", expectedFormula: ["=SUM(A1:A4)", "=sum(a1:a4)"], expectedResult: "50" },
    { title: "Calculate the average", description: "Find the average of all marks in A1 to A5.", hint: "Use =AVERAGE(A1:A5)", initialData: { A1: "80", A2: "90", A3: "70", A4: "85", A5: "75" }, targetCell: "B1", expectedFormula: ["=AVERAGE(A1:A5)", "=average(a1:a5)"], expectedResult: "80" },
    { title: "Find the highest score", description: "Which student scored the most? Use MAX to find out.", hint: "Use =MAX(A1:A5)", initialData: { A1: "72", A2: "88", A3: "95", A4: "61", A5: "83" }, targetCell: "B1", expectedFormula: ["=MAX(A1:A5)", "=max(a1:a5)"], expectedResult: "95" },
    { title: "Find the lowest", description: "Find the minimum temperature from the week's data.", hint: "Use =MIN(A1:A5)", initialData: { A1: "32", A2: "28", A3: "35", A4: "22", A5: "30" }, targetCell: "B1", expectedFormula: ["=MIN(A1:A5)", "=min(a1:a5)"], expectedResult: "22" },
  ],
};

export default function Module2Client({ topics }: { topics: Topic[] }) {
  const isEditing = useInlineEditMode();
  if (isEditing) {
    return <InlineModuleEditor slug={CURRENT_COURSE_SLUG} moduleNumber={2} />;
  }
  return (
    <ModulePage
      courseSlug={CURRENT_COURSE_SLUG}
      moduleNumber={2}
      moduleTitle="Office Automation"
      moduleSubtitle="Gamma · NotebookLM · Excel"
      moduleDescription="The two AI tools we use in class to make presentations and study smarter — plus a quick Excel basics topic so you know your way around a spreadsheet."
      accentFrom="#10B981"
      accentTo="#059669"
      orbColor1="rgba(16,185,129,0.15)"
      orbColor2="rgba(5,150,105,0.1)"
      topics={topics}
      stats={[
        { n: "4", l: "Topics" },
        { n: "~15", l: "Minutes" },
        { n: "Self-read", l: "Format" },
      ]}
      renderAfterContent={(topicId) => (
        <>
          {excelChallenges[topicId] && (
            <ExcelSimulator challenges={excelChallenges[topicId]} />
          )}
        </>
      )}
    />
  );
}
