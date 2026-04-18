import { Suspense } from "react";
import Module4Client from "./ClientModule";
import { topics as fallbackTopics } from "@/data/module4-topics";
import { loadModuleFromDB } from "@/lib/module-loader";

export const revalidate = 30;

export default async function Module4Page() {
  const db = await loadModuleFromDB("ict", 4);
  return (
    <Suspense fallback={null}>
      <Module4Client topics={db?.topics ?? fallbackTopics} />
    </Suspense>
  );
}
