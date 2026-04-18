import Module5Client from "./ClientModule";
import { topics as fallbackTopics } from "@/data/module5-topics";
import { loadModuleFromDB } from "@/lib/module-loader";

export const revalidate = 30;

export default async function Module5Page() {
  const db = await loadModuleFromDB("ict", 5);
  return <Module5Client topics={db?.topics ?? fallbackTopics} />;
}
