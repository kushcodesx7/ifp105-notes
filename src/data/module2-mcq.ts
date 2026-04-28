// Module 2 — Office Automation (Gamma · NotebookLM · Excel)
//
// 2026-04-27 rewrite: Module 2 was refocused on AI tools (Gamma,
// NotebookLM) plus Excel basics. The teacher chose to drop MCQs
// for this module — the topics are exposure-based and self-read,
// not exam-tested. Keeping the file with empty arrays (rather than
// deleting it) so the existing import in /api/public/mcq/2 keeps
// returning a valid shape and the home-page question count stays
// accurate.

import type { Question } from "./module1-mcq";

export const mcqData: Record<number, Question[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
};
