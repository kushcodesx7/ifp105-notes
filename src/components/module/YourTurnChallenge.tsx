"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Challenge {
  instruction: string;
  hint: string;
  starterCode: string;
}

interface YourTurnChallengeProps {
  challenge: Challenge;
  accentFrom?: string;
  accentTo?: string;
}

export default function YourTurnChallenge({
  challenge,
  accentFrom = "#06B6D4",
  accentTo = "#0891B2",
}: YourTurnChallengeProps) {
  const [code, setCode] = useState(challenge.starterCode);
  const [previewHtml, setPreviewHtml] = useState(challenge.starterCode);
  const [showHint, setShowHint] = useState(false);

  function handleRun() {
    setPreviewHtml(code);
  }

  function handleReset() {
    setCode(challenge.starterCode);
    setPreviewHtml(challenge.starterCode);
    setShowHint(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="my-6 rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${accentFrom}30` }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${accentFrom}15, ${accentTo}10)`,
          borderBottom: `1px solid ${accentFrom}20`,
        }}
      >
        <span className="text-lg">✍️</span>
        <div>
          <h3 className="text-sm font-bold text-white">Your Turn!</h3>
          <p className="text-xs text-zinc-400">Try it yourself in the editor below</p>
        </div>
      </div>

      {/* Instruction */}
      <div className="px-5 py-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p
          className="text-sm text-zinc-300 leading-relaxed [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cyan-300 [&_code]:text-xs"
          dangerouslySetInnerHTML={{ __html: challenge.instruction }}
        />

        {/* Hint toggle */}
        <div className="mt-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showHint ? "🙈 Hide Hint" : "💡 Need a Hint?"}
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
                  💡 {challenge.hint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-col md:flex-row" style={{ borderTop: `1px solid ${accentFrom}15` }}>
        {/* Code editor */}
        <div className="flex-1 relative" style={{ background: "#0D0D1A" }}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono text-zinc-500">index.html</span>
            <div className="flex gap-2">
              <button
                onClick={handleRun}
                className="text-[10px] font-medium px-2.5 py-1 rounded bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 transition-colors"
              >
                ▶ Run
              </button>
              <button
                onClick={handleReset}
                className="text-[10px] font-medium px-2.5 py-1 rounded bg-white/[0.04] text-zinc-500 border border-white/[0.08] hover:text-zinc-300 transition-colors"
              >
                ↺ Reset
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full h-48 md:h-64 p-4 bg-transparent text-[12px] text-zinc-300 font-mono leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700"
            placeholder="Type your HTML code here..."
          />
        </div>

        {/* Preview */}
        <div
          className="flex-1 relative"
          style={{
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "#FAFAFA",
          }}
        >
          <div className="flex items-center px-3 py-2 border-b" style={{ borderColor: "#E5E7EB", background: "#F3F4F6" }}>
            <span className="text-[10px] font-mono text-zinc-500">Preview</span>
          </div>
          <iframe
            srcDoc={previewHtml}
            title="Preview"
            className="w-full h-48 md:h-64"
            sandbox="allow-scripts"
            style={{ border: "none" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
