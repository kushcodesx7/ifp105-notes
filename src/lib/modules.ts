// Single source of truth for module metadata.
// Previously TOTAL_TOPICS = 48 was hard-coded in /api/connect, /api/connect/glimpse,
// /api/admin/summary, and /api/progress/admin. Change one module's topic
// count and four files silently drift. Never again.

export interface ModuleMeta {
  id: number;
  title: string;
  subtitle: string;
  accent: string;
  topicCount: number;
}

export const MODULES: ModuleMeta[] = [
  { id: 1, title: "Hardware", subtitle: "Computer fundamentals",    accent: "#6366F1", topicCount: 11 },
  { id: 2, title: "Office",   subtitle: "Word, Excel, PowerPoint",  accent: "#10B981", topicCount: 9 },
  { id: 3, title: "Social",   subtitle: "Internet & web basics",    accent: "#3B82F6", topicCount: 7 },
  { id: 4, title: "HTML",     subtitle: "Building web pages",       accent: "#06B6D4", topicCount: 11 },
  { id: 5, title: "Tech",     subtitle: "Modern tech landscape",    accent: "#8B5CF6", topicCount: 10 },
];

export const TOTAL_TOPICS = MODULES.reduce((sum, m) => sum + m.topicCount, 0);

// Lookup helpers
export const MODULE_TOTALS: Record<number, number> = Object.fromEntries(
  MODULES.map((m) => [m.id, m.topicCount])
);

export function getModule(id: number): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}
