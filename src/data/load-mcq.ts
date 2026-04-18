// Lazy-loaded MCQ dispatcher.
//
// Each module's MCQ bank is 30-50 KB gzipped. Previously every module
// route eagerly bundled its own bank at the top of module/N/page.tsx,
// which lands in the initial paint chunk. MCQs are only needed when a
// student scrolls to the Quiz block of a topic — so we delay loading
// until the ModulePage actually renders McqQuiz.
//
// Webpack/turbopack creates one separate chunk per branch of the switch
// below (literal string specifiers = static analysis = code-split).
// Dynamic template strings (e.g. \`./module${n}-mcq\`) would NOT split
// cleanly, so keep the explicit switch.
//
// The returned type matches the existing \`mcqData: Record<number, Question[]>\`
// shape so callers don't care whether it came from a static or dynamic
// import.

import type { BloomLevel } from "@/lib/blooms";

export interface Question {
  q: string;
  opts: string[];
  ans: number;
  why: string;
  bloom?: BloomLevel;
}

export async function loadMcqData(
  moduleNumber: number
): Promise<Record<number, Question[]>> {
  switch (moduleNumber) {
    case 1:
      return (await import("@/data/module1-mcq")).mcqData;
    case 2:
      return (await import("@/data/module2-mcq")).mcqData;
    case 3:
      return (await import("@/data/module3-mcq")).mcqData;
    case 4:
      return (await import("@/data/module4-mcq")).mcqData;
    case 5:
      return (await import("@/data/module5-mcq")).mcqData;
    default:
      return {};
  }
}
