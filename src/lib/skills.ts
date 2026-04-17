// Curated skill/interest tags for IFS Connect profiles.
// Keep the list short and broad — students pick up to 3.

export interface Skill {
  id: string;
  label: string;
  emoji: string;
  color: string; // Tailwind gradient stops
}

export const SKILLS: Skill[] = [
  { id: "python", label: "Python", emoji: "🐍", color: "from-yellow-500 to-amber-600" },
  { id: "webdev", label: "Web Dev", emoji: "💻", color: "from-cyan-500 to-blue-600" },
  { id: "ai", label: "AI / ML", emoji: "🤖", color: "from-indigo-500 to-violet-600" },
  { id: "data", label: "Data", emoji: "📊", color: "from-emerald-500 to-teal-600" },
  { id: "design", label: "Design", emoji: "🎨", color: "from-pink-500 to-rose-600" },
  { id: "startup", label: "Startup", emoji: "🚀", color: "from-orange-500 to-red-600" },
  { id: "gaming", label: "Gaming", emoji: "🎮", color: "from-violet-500 to-purple-600" },
  { id: "photo", label: "Photography", emoji: "📸", color: "from-sky-500 to-indigo-600" },
  { id: "music", label: "Music", emoji: "🎵", color: "from-pink-500 to-violet-600" },
  { id: "sports", label: "Sports", emoji: "⚽", color: "from-green-500 to-emerald-600" },
  { id: "writing", label: "Writing", emoji: "✍️", color: "from-amber-500 to-orange-600" },
  { id: "film", label: "Film", emoji: "🎬", color: "from-red-500 to-pink-600" },
  { id: "reading", label: "Reading", emoji: "📖", color: "from-stone-500 to-amber-700" },
  { id: "languages", label: "Languages", emoji: "🌍", color: "from-blue-500 to-cyan-600" },
  { id: "fitness", label: "Fitness", emoji: "💪", color: "from-lime-500 to-green-600" },
  { id: "speaking", label: "Public Speaking", emoji: "🎤", color: "from-fuchsia-500 to-pink-600" },
  { id: "art", label: "Art", emoji: "🖌️", color: "from-rose-500 to-red-600" },
  { id: "cooking", label: "Cooking", emoji: "🍳", color: "from-yellow-500 to-orange-600" },
];

export const MAX_SKILLS = 3;
export const MAX_BIO_LENGTH = 120;

export function getSkill(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}
