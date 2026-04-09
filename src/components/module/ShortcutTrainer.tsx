"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Shortcut {
  keys: string; // e.g. "Ctrl+B"
  action: string; // e.g. "Bold"
  app: string; // e.g. "Word"
}

interface ShortcutTrainerProps {
  shortcuts: Shortcut[];
  title?: string;
}

export default function ShortcutTrainer({ shortcuts, title = "Keyboard Shortcut Trainer" }: ShortcutTrainerProps) {
  const [current, setCurrent] = useState(0);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffled, setShuffled] = useState<Shortcut[]>([]);

  // Shuffle on mount
  useEffect(() => {
    setShuffled([...shortcuts].sort(() => Math.random() - 0.5));
  }, [shortcuts]);

  const shortcut = shuffled[current];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!shortcut || result) return;
    const key = e.key.toUpperCase();

    // Ignore standalone modifier presses (Ctrl, Shift, Alt alone)
    if (["CONTROL", "SHIFT", "ALT", "META"].includes(key)) return;

    e.preventDefault();

    const modifiers: string[] = [];
    if (e.ctrlKey || e.metaKey) modifiers.push("Ctrl");
    if (e.shiftKey) modifiers.push("Shift");
    if (e.altKey) modifiers.push("Alt");

    // Only evaluate combos that have a modifier + letter (like Ctrl+B)
    // This prevents standalone letter presses from triggering
    if (modifiers.length === 0) return;

    const combo = [...modifiers, key].join("+");
    setUserInput([...modifiers, key]);

    const expected = shortcut.keys.toUpperCase();
    if (combo === expected) {
      setResult("correct");
      setScore(s => s + 1);
    } else {
      setResult("wrong");
    }
    setTotal(t => t + 1);
  }, [shortcut, result]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function next() {
    setResult(null);
    setUserInput([]);
    setShowAnswer(false);
    if (current < shuffled.length - 1) {
      setCurrent(c => c + 1);
    } else {
      // Reshuffle
      setShuffled([...shortcuts].sort(() => Math.random() - 0.5));
      setCurrent(0);
    }
  }

  function reveal() {
    setShowAnswer(true);
    setResult("wrong");
    setTotal(t => t + 1);
  }

  if (!shortcut) return null;

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-2xl overflow-hidden"
      style={{ background: "#0d1117", border: "1px solid #2a2a33" }}
    >
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-3" style={{ background: "#161b22", borderBottom: "1px solid #2a2a33" }}>
        <span className="text-lg">⌨️</span>
        <span className="text-[11px] font-bold text-zinc-500 tracking-wider">{title.toUpperCase()}</span>
        <div className="ml-auto flex items-center gap-3 text-[11px]">
          <span className="font-bold text-emerald-400">{score} correct</span>
          <span className="text-zinc-600">|</span>
          <span className="font-bold text-zinc-400">{accuracy}% accuracy</span>
        </div>
      </div>

      {/* Challenge */}
      <div className="px-6 py-8 text-center">
        <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2">
          {shortcut.app} · {current + 1}/{shuffled.length}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h3 className="text-xl font-bold text-zinc-200 mb-6">
              {shortcut.action}
            </h3>

            <p className="text-sm text-zinc-500 mb-4">Press the keyboard shortcut now...</p>

            {/* Key display */}
            <div className="flex items-center justify-center gap-2 mb-6 min-h-[48px]">
              {result ? (
                userInput.map((key, i) => (
                  <span key={i} className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-bold border ${
                    result === "correct"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {key}
                    {i < userInput.length - 1 && <span className="mx-1 text-zinc-600">+</span>}
                  </span>
                ))
              ) : (
                <div className="flex items-center gap-1">
                  {["?", "+", "?"].map((k, i) => (
                    <span key={i} className="inline-flex items-center justify-center w-12 h-12 rounded-lg text-lg font-bold border border-dashed border-zinc-700 text-zinc-600 animate-pulse">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Result feedback */}
            {result === "correct" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-emerald-400 font-bold mb-4">✅ Correct! <span className="text-zinc-500 font-normal">{shortcut.keys}</span></p>
                <button onClick={next} className="px-6 py-2 rounded-full text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                  Next →
                </button>
              </motion.div>
            )}

            {result === "wrong" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-red-400 font-bold mb-1">
                  ❌ {showAnswer ? "The answer is:" : "Not quite!"}
                </p>
                <p className="text-lg font-bold text-zinc-200 mb-4">
                  {shortcut.keys.split("+").map((k, i) => (
                    <span key={i}>
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                        {k}
                      </span>
                      {i < shortcut.keys.split("+").length - 1 && <span className="mx-1 text-zinc-600">+</span>}
                    </span>
                  ))}
                </p>
                <button onClick={next} className="px-6 py-2 rounded-full text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                  Next →
                </button>
              </motion.div>
            )}

            {!result && (
              <button onClick={reveal} className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
                Don&apos;t know? Show answer
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
