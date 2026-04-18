import Module1Client from "./ClientModule";
import { topics as fallbackTopics } from "@/data/module1-topics";
import { loadModuleFromDB } from "@/lib/module-loader";

// Module 1 entry point — SERVER COMPONENT (Phase 5.5).
//
// Reads topics from the DB first (Phase 4/5 tables via module-loader).
// If the DB is empty for ICT module 1 — because the teacher hasn't
// run the seeder yet, or the tables aren't populated — falls back to
// the legacy `src/data/module1-topics.ts`. Either way, the student
// sees content.
//
// `revalidate = 30` makes the page ISR: regenerated at most once every
// 30s, so teacher edits in /admin propagate to students within half a
// minute. Between regenerations, the page is served from the Vercel
// edge cache — no DB round-trip per page view.
export const revalidate = 30;

export default async function Module1Page() {
  const db = await loadModuleFromDB("ict", 1);
  return <Module1Client topics={db?.topics ?? fallbackTopics} />;
}
