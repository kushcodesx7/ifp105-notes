import Module3Client from "./ClientModule";
import { topics as fallbackTopics } from "@/data/module3-topics";
import { loadModuleFromDB } from "@/lib/module-loader";

export const revalidate = 30;

export default async function Module3Page() {
  const db = await loadModuleFromDB("ict", 3);
  return <Module3Client topics={db?.topics ?? fallbackTopics} />;
}
