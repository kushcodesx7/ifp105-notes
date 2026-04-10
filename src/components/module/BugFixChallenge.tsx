"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addXP, XP_REWARDS } from "@/lib/gamification";
import type { BugFixChallenge as BugFixData } from "@/data/module4-bugfix";

interface BugFixChallengeProps {
  challenge: BugFixData;
  accentFrom?: string;
  accentTo?: string;
}

/** Normalize code for flexible comparison: collapse whitespace, lowercase tag names */
function normalize(code: string): string {
  return code
    .replace(/\s+/g, " ") // collapse whitespace
    .trim()
    .replace(/<\/?[a-zA-Z][a-zA-Z0-9]*/g, (m) => m.toLowerCase()); // lowercase tags
}

export default function BugFixChallenge({
  challenge,
  accentFrom = "#06B6D4",
  accentTo = "#0891B2",
}: BugFixChallengeProps) {
  const [userCode, setUserCode] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleCheck() {
    if (!userCode.trim()) return;

    const isCorrect = normalize(userCode) === normalize(challenge.correctCode);

    if (isCorrect) {
      setResult("correct");
      if (!xpAwarded) {
        addXP(XP_REWARDS.TOPIC_DONE);
        setXpAwarded(true);
      }
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setResult("wrong");
      if (next >= 2) {
        setShowAnswer(true);
      }
    }
  }

  function handleReset() {
    setUserCode("");
    setResult(null);
    setAttempts(0);
    setShowAnswer(false);
    setShowHint(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = userCode.substring(0, start) + "  " + userCode.substring(end);
      setUserCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }

  const isCorrect = result === "correct";
  const isWrong = result === "wrong";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="my-6 rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${isCorrect ? "rgba(34,197,94,0.4)" : isWrong ? "rgba(239,68,68,0.4)" : `${accentFrom}30`}`,
        boxShadow: isCorrect
          ? "0 0 30px rgba(34,197,94,0.15)"
          : isWrong
            ? "0 0 20px rgba(239,68,68,0.1)"
            : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${accentFrom}15, ${accentTo}10)`,
          borderBottom: `1px solid ${accentFrom}20`,
        }}
      >
        <span className="text-lg">&#x1F41B;</span>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">Fix the Bug!</h3>
          <p className="text-xs text-zinc-400">{challenge.title}</p>
        </div>
        {isCorrect && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30"
          >
            +{XP_REWARDS.TOPIC_DONE} XP
          </motion.span>
        )}
      </div>

      {/* Broken code display */}
      <div className="px-5 py-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
          Broken Code
        </p>
        <div
          className="rounded-xl p-4 font-mono text-sm text-red-300 leading-relaxed overflow-x-auto"
          style={{
            background: "#0D0D1F",
            borderLeft: "3px solid rgba(239,68,68,0.5)",
          }}
        >
          <code>{challenge.brokenCode}</code>
        </div>

        {/* Hint toggle */}
        <div className="mt-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showHint ? "&#x1F648; Hide Hint" : "&#x1F4A1; Need a Hint?"}
          </button>
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-xs text-amber-400/80 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  &#x1F4A1; {challenge.hint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Student input area */}
      <div
        className="px-5 py-4"
        style={{ borderTop: `1px solid ${accentFrom}15`, background: "rgba(255,255,255,0.01)" }}
      >
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
          Your Fix
        </p>
        <div
          className="rounded-xl overflow-hidden transition-all duration-300"
          style={{
            border: userCode.trim()
              ? "1px solid rgba(34,197,94,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <textarea
            ref={inputRef}
            value={userCode}
            onChange={(e) => {
              setUserCode(e.target.value);
              if (result) setResult(null);
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            disabled={isCorrect}
            className="w-full h-20 p-4 bg-[#0D0D1F] text-[12px] text-zinc-300 font-mono leading-relaxed resize-none focus:outline-none placeholder:text-zinc-600 disabled:opacity-60"
            placeholder="Type the corrected HTML here..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCheck}
            disabled={!userCode.trim() || isCorrect}
            className="text-[11px] font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
              color: "#fff",
            }}
          >
            Check My Fix
          </motion.button>
          {(isWrong || isCorrect) && (
            <button
              onClick={handleReset}
              className="text-[11px] font-medium px-3 py-2 rounded-lg bg-white/[0.04] text-zinc-500 border border-white/[0.08] hover:text-zinc-300 transition-colors"
            >
              &#x21BA; Try Another Attempt
            </button>
          )}
        </div>
      </div>

      {/* Result feedback */}
      <AnimatePresence mode="wait">
        {isCorrect && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-5 py-4"
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.05))",
                borderTop: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              {/* Celebration particles */}
              <div className="relative">
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      y: -(30 + Math.random() * 40),
                      x: (Math.random() - 0.5) * 80,
                      scale: 0,
                    }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="absolute text-sm pointer-events-none"
                    style={{ left: `${15 + i * 14}%`, top: 0 }}
                  >
                    {["\u2728", "\uD83C\uDF89", "\u2B50", "\uD83C\uDF1F", "\uD83C\uDFAF", "\uD83D\uDD25"][i]}
                  </motion.span>
                ))}
              </div>
              <p className="text-sm font-bold text-green-400 mb-1">
                Nice catch! &#x1F389;
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {challenge.explanation}
              </p>
            </div>
          </motion.div>
        )}

        {isWrong && !isCorrect && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="px-5 py-3"
              style={{
                background: "rgba(239,68,68,0.06)",
                borderTop: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <p className="text-xs font-bold text-red-400">
                Not quite right — try again! &#x1F914;
              </p>
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-[11px] text-zinc-500 mt-2 mb-1">
                    Correct answer:
                  </p>
                  <div
                    className="rounded-lg p-3 font-mono text-[12px] text-green-300"
                    style={{
                      background: "#0D0D1F",
                      borderLeft: "3px solid rgba(34,197,94,0.5)",
                    }}
                  >
                    <code>{challenge.correctCode}</code>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {challenge.explanation}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
