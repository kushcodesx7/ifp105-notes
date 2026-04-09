// XP, Streaks, and Badges — all localStorage-based, no backend needed

const LS_PREFIX = "ifp105_";

// ── XP System ──
export function getXP(): number {
  return parseInt(localStorage.getItem(`${LS_PREFIX}xp`) || "0", 10);
}

export function addXP(amount: number): number {
  const current = getXP();
  const next = current + amount;
  localStorage.setItem(`${LS_PREFIX}xp`, String(next));
  return next;
}

// XP rewards
export const XP_REWARDS = {
  TOPIC_DONE: 50,
  QUIZ_PERFECT: 100,
  QUIZ_GOOD: 50, // 80%+
  QUIZ_PASS: 25, // 60%+
  STREAK_BONUS: 25, // per day of streak
} as const;

// Level from XP
export function getLevel(xp: number): { level: number; title: string; nextLevelXP: number; progress: number } {
  const levels = [
    { xp: 0, title: "Beginner" },
    { xp: 100, title: "Learner" },
    { xp: 300, title: "Explorer" },
    { xp: 600, title: "Scholar" },
    { xp: 1000, title: "Expert" },
    { xp: 1500, title: "Master" },
    { xp: 2500, title: "Legend" },
  ];

  let level = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) { level = i; break; }
  }

  const currentLevelXP = levels[level].xp;
  const nextLevelXP = level < levels.length - 1 ? levels[level + 1].xp : levels[level].xp;
  const progress = nextLevelXP > currentLevelXP
    ? (xp - currentLevelXP) / (nextLevelXP - currentLevelXP)
    : 1;

  return { level: level + 1, title: levels[level].title, nextLevelXP, progress };
}

// ── Streak System ──
export function getStreak(): { count: number; lastDate: string | null } {
  const count = parseInt(localStorage.getItem(`${LS_PREFIX}streak`) || "0", 10);
  const lastDate = localStorage.getItem(`${LS_PREFIX}streak_date`);
  return { count, lastDate };
}

export function updateStreak(): { count: number; isNew: boolean } {
  const today = new Date().toISOString().split("T")[0];
  const { count, lastDate } = getStreak();

  if (lastDate === today) return { count, isNew: false };

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newCount = lastDate === yesterday ? count + 1 : 1;

  localStorage.setItem(`${LS_PREFIX}streak`, String(newCount));
  localStorage.setItem(`${LS_PREFIX}streak_date`, today);

  // Streak bonus XP
  if (newCount > 1) addXP(XP_REWARDS.STREAK_BONUS);

  return { count: newCount, isNew: true };
}

// ── Badges ──
export interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
}

export function getBadges(): Badge[] {
  const earned = JSON.parse(localStorage.getItem(`${LS_PREFIX}badges`) || "[]") as string[];

  const all: Badge[] = [
    { id: "first_topic", icon: "🎯", title: "First Steps", description: "Complete your first topic", earned: earned.includes("first_topic") },
    { id: "perfect_quiz", icon: "💯", title: "Perfect Score", description: "Get 10/10 on any quiz", earned: earned.includes("perfect_quiz") },
    { id: "module_done", icon: "🏆", title: "Module Master", description: "Complete all topics in a module", earned: earned.includes("module_done") },
    { id: "streak_3", icon: "🔥", title: "On Fire", description: "Study 3 days in a row", earned: earned.includes("streak_3") },
    { id: "streak_7", icon: "⚡", title: "Unstoppable", description: "Study 7 days in a row", earned: earned.includes("streak_7") },
    { id: "html_coder", icon: "💻", title: "HTML Coder", description: "Use the HTML editor in Module 4", earned: earned.includes("html_coder") },
    { id: "halfway", icon: "🌟", title: "Halfway There", description: "Complete 25 topics across all modules", earned: earned.includes("halfway") },
    { id: "all_done", icon: "👑", title: "ICT Champion", description: "Complete all 47 topics", earned: earned.includes("all_done") },
  ];

  return all;
}

export function earnBadge(id: string): boolean {
  const earned = JSON.parse(localStorage.getItem(`${LS_PREFIX}badges`) || "[]") as string[];
  if (earned.includes(id)) return false;
  earned.push(id);
  localStorage.setItem(`${LS_PREFIX}badges`, JSON.stringify(earned));
  return true; // newly earned
}

// ── Stats Summary ──
export function getStats() {
  const xp = getXP();
  const level = getLevel(xp);
  const streak = getStreak();
  const badges = getBadges();
  const earnedBadges = badges.filter((b) => b.earned).length;

  return { xp, ...level, streak: streak.count, badges: earnedBadges, totalBadges: badges.length };
}
