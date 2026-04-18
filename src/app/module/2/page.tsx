import { Suspense } from "react";
import Module2Client from "./ClientModule";
import { topics as fallbackTopics } from "@/data/module2-topics";
import { loadModuleFromDB } from "@/lib/module-loader";

// Module 2 — see module/1/page.tsx for the Phase 5.5 + Phase 6 pattern.
export const revalidate = 30;

export default async function Module2Page() {
  const db = await loadModuleFromDB("ict", 2);
  return (
    <Suspense fallback={null}>
      <Module2Client topics={db?.topics ?? fallbackTopics} />
    </Suspense>
  );
}
