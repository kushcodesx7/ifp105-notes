"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addXP, XP_REWARDS } from "@/lib/gamification";

interface TagPair {
  tag: string;
  description: string;
}

const pairs: TagPair[] = [
  { tag: "<h1>", description: "Heading" },
  { tag: "<p>", description: "Paragraph" },
  { tag: "<table>", description: "Table" },
  { tag: "<a>", description: "Link" },
  { tag: "<img>", description: "Image" },
  { tag: "<ul>", description: "Unordered List" },
  { tag: "<ol>", description: "Ordered List" },
  { tag: "<b>", description: "Bold" },
  { tag: "<i>", description: "Italic" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TagMatchGame() {
  const [shuffledTags] = useState(() => shuffle(pairs.map((p) => p.tag)));
  const [shuffledDescs] = useState(() => shuffle(pairs.map((p) => p.description)));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ tag: string; desc: string } | null>(null);
  const [completed, setCompleted] = useState(false);

  const totalPairs = pairs.length;
  const matchedCount = matched.size;

  const getCorrectDesc = useCallback((tag: string): string => {
    return pairs.find((p) => p.tag === tag)?.description || "";
  }, []);

  function handleTagClick(tag: string) {
    if (matched.has(tag) || wrongFlash) return;
    setSelectedTag((prev) => (prev === tag ? null : tag));
  }

  function handleDescClick(desc: string) {
    if (!selectedTag || wrongFlash) return;
    // Check if this description is already matched
    const alreadyMatchedTag = pairs.find((p) => p.description === desc && matched.has(p.tag));
    if (alreadyMatchedTag) return;

    const correctDesc = getCorrectDesc(selectedTag);
    if (correctDesc === desc) {
      // Correct match!
      const newMatched = new Set([...matched, selectedTag]);
      setMatched(newMatched);
      setSelectedTag(null);

      if (newMatched.size === totalPairs) {
        setCompleted(true);
        addXP(XP_REWARDS.TOPIC_DONE);
      }
    } else {
      // Wrong match - flash red
      setWrongFlash({ tag: selectedTag, desc });
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedTag(null);
      }, 600);
    }
  }

  function getTagState(tag: string) {
    if (matched.has(tag)) return "matched";
    if (wrongFlash?.tag === tag) return "wrong";
    if (selectedTag === tag) return "selected";
    return "idle";
  }

  function getDescState(desc: string) {
    const pair = pairs.find((p) => p.description === desc);
    if (pair && matched.has(pair.tag)) return "matched";
    if (wrongFlash?.desc === desc) return "wrong";
    return "idle";
  }

  return (
    <div className="mt-8 mb-4">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{"\uD83C\uDFAE"}</span>
              <h3 className="text-base font-bold tracking-tight">Tag Match Challenge</h3>
            </div>
            <span className="text-sm font-bold" style={{ color: '#06B6D4' }}>
              {matchedCount}/{totalPairs} matched
            </span>
          </div>

          <p className="text-xs text-zinc-500 mb-5">
            Click a tag on the left, then click its matching description on the right.
          </p>

          {/* Game grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Tags */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">HTML Tags</div>
              {shuffledTags.map((tag) => {
                const state = getTagState(tag);
                let style: React.CSSProperties = {};
                let classes = "w-full px-4 py-2.5 rounded-xl text-sm font-mono font-semibold text-left transition-all ";

                if (state === "matched") {
                  style = { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' };
                  classes += "cursor-default";
                } else if (state === "wrong") {
                  style = { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' };
                  classes += "cursor-pointer";
                } else if (state === "selected") {
                  style = { background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)', color: '#22d3ee' };
                  classes += "cursor-pointer";
                } else {
                  style = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };
                  classes += "cursor-pointer text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]";
                }

                return (
                  <motion.button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={classes}
                    style={style}
                    animate={state === "wrong" ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                    transition={state === "wrong" ? { duration: 0.4 } : {}}
                    disabled={state === "matched"}
                  >
                    {state === "matched" ? `\u2713 ${tag}` : tag}
                  </motion.button>
                );
              })}
            </div>

            {/* Right: Descriptions */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Descriptions</div>
              {shuffledDescs.map((desc) => {
                const state = getDescState(desc);
                let style: React.CSSProperties = {};
                let classes = "w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all ";

                if (state === "matched") {
                  style = { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' };
                  classes += "cursor-default";
                } else if (state === "wrong") {
                  style = { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' };
                  classes += "cursor-pointer";
                } else {
                  style = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };
                  classes += "cursor-pointer text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]";
                }

                return (
                  <motion.button
                    key={desc}
                    onClick={() => handleDescClick(desc)}
                    className={classes}
                    style={style}
                    animate={state === "wrong" ? { x: [0, 6, -6, 6, -6, 0] } : {}}
                    transition={state === "wrong" ? { duration: 0.4 } : {}}
                    disabled={state === "matched"}
                  >
                    {state === "matched" ? `\u2713 ${desc}` : desc}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              animate={{ width: `${(matchedCount / totalPairs) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #06B6D4, #0891B2)' }}
            />
          </div>

          {/* Completion message */}
          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-5 rounded-xl text-center"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <div className="text-3xl mb-2">{"\uD83C\uDF89"}</div>
                <p className="text-sm font-bold text-emerald-400 mb-1">All tags matched! Amazing!</p>
                <p className="text-xs text-zinc-500">+{XP_REWARDS.TOPIC_DONE} XP earned</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
