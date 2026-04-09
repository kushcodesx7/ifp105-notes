"use client";
import ModulePage from "@/components/module/ModulePage";
import ExcelSimulator from "@/components/module/ExcelSimulator";
import ShortcutTrainer from "@/components/module/ShortcutTrainer";
import { topics } from "@/data/module2-topics";
import { mcqData } from "@/data/module2-mcq";

// Excel challenges for topics 4, 5, 6
const excelChallenges: Record<number, any[]> = {
  4: [ // Excel Basics
    {
      title: "Your first formula!",
      description: "Cell A1 has 10 and A2 has 20. Add them together in cell B1.",
      hint: "Type =A1+A2 in cell B1",
      initialData: { A1: "10", A2: "20" },
      targetCell: "B1",
      expectedFormula: ["=A1+A2", "=a1+a2"],
      expectedResult: "30",
    },
    {
      title: "Add up a column",
      description: "Add all the numbers in A1 to A4 using the SUM formula. Put the answer in A5.",
      hint: "Use =SUM(A1:A4)",
      initialData: { A1: "5", A2: "10", A3: "15", A4: "20" },
      targetCell: "A5",
      expectedFormula: ["=SUM(A1:A4)", "=sum(a1:a4)"],
      expectedResult: "50",
    },
  ],
  5: [ // Formulas & Functions
    {
      title: "Calculate the average",
      description: "Find the average of all marks in A1 to A5.",
      hint: "Use =AVERAGE(A1:A5)",
      initialData: { A1: "80", A2: "90", A3: "70", A4: "85", A5: "75" },
      targetCell: "B1",
      expectedFormula: ["=AVERAGE(A1:A5)", "=average(a1:a5)"],
      expectedResult: "80",
    },
    {
      title: "Find the highest score",
      description: "Which student scored the most? Use MAX to find out.",
      hint: "Use =MAX(A1:A5)",
      initialData: { A1: "72", A2: "88", A3: "95", A4: "61", A5: "83" },
      targetCell: "B1",
      expectedFormula: ["=MAX(A1:A5)", "=max(a1:a5)"],
      expectedResult: "95",
    },
    {
      title: "Count the students",
      description: "How many scores are there? Use COUNT.",
      hint: "Use =COUNT(A1:A5)",
      initialData: { A1: "72", A2: "88", A3: "95", A4: "61", A5: "83" },
      targetCell: "B1",
      expectedFormula: ["=COUNT(A1:A5)", "=count(a1:a5)"],
      expectedResult: "5",
    },
    {
      title: "Multiply two numbers",
      description: "A1 has the price (50) and B1 has the quantity (3). Calculate the total in C1.",
      hint: "Use =A1*B1",
      initialData: { A1: "50", B1: "3" },
      targetCell: "C1",
      expectedFormula: ["=A1*B1", "=a1*b1"],
      expectedResult: "150",
    },
  ],
  6: [ // Data Management
    {
      title: "Find the lowest",
      description: "Find the minimum temperature from the week's data.",
      hint: "Use =MIN(A1:A5)",
      initialData: { A1: "32", A2: "28", A3: "35", A4: "22", A5: "30" },
      targetCell: "B1",
      expectedFormula: ["=MIN(A1:A5)", "=min(a1:a5)"],
      expectedResult: "22",
    },
  ],
};

// Keyboard shortcuts for topics 2, 3
const wordShortcuts = [
  { keys: "Ctrl+B", action: "Make text Bold", app: "Word" },
  { keys: "Ctrl+I", action: "Make text Italic", app: "Word" },
  { keys: "Ctrl+U", action: "Underline text", app: "Word" },
  { keys: "Ctrl+S", action: "Save the document", app: "Word" },
  { keys: "Ctrl+Z", action: "Undo last action", app: "Word" },
  { keys: "Ctrl+Y", action: "Redo last action", app: "Word" },
  { keys: "Ctrl+A", action: "Select ALL text", app: "Word" },
  { keys: "Ctrl+C", action: "Copy selected text", app: "Word" },
  { keys: "Ctrl+V", action: "Paste copied text", app: "Word" },
  { keys: "Ctrl+X", action: "Cut selected text", app: "Word" },
  { keys: "Ctrl+P", action: "Print the document", app: "Word" },
  { keys: "Ctrl+N", action: "Create new document", app: "Word" },
];

export default function Module2() {
  return (
    <ModulePage
      moduleNumber={2}
      moduleTitle="Office Automation"
      moduleSubtitle="Word, Excel & PowerPoint"
      moduleDescription="Learn to create documents, spreadsheets, and presentations — step by step, super simple."
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
      renderAfterContent={(topicId) => (
        <>
          {/* Shortcut Trainer for Word topics */}
          {(topicId === 2 || topicId === 3) && (
            <ShortcutTrainer
              shortcuts={wordShortcuts}
              title="Practice Word Shortcuts"
            />
          )}

          {/* Excel Simulator for Excel topics */}
          {excelChallenges[topicId] && (
            <ExcelSimulator challenges={excelChallenges[topicId]} />
          )}
        </>
      )}
    />
  );
}
