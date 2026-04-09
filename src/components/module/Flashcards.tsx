"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardData {
  front: string;
  back: string;
}

interface FlashcardsProps {
  cards: FlashcardData[];
  title?: string;
}

export default function Flashcards({ cards, title = "Quick Review Flashcards" }: FlashcardsProps) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const card = cards[current];
  const remaining = cards.length - known.size;

  function flip() { setFlipped(!flipped); }

  function next(didKnow: boolean) {
    if (didKnow) setKnown((prev) => new Set([...prev, current]));
    setFlipped(false);
    setTimeout(() => {
      // Find next unreviewed card
      let next = (current + 1) % cards.length;
      let attempts = 0;
      while (known.has(next) && !didKnow && attempts < cards.length) {
        next = (next + 1) % cards.length;
        attempts++;
      }
      setCurrent(next);
    }, 150);
  }

  function reset() {
    setKnown(new Set());
    setCurrent(0);
    setFlipped(false);
  }

  const allDone = known.size === cards.length;

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🃏</span>
        <h3 className="text-sm font-bold text-zinc-300">{title}</h3>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
          {known.size}/{cards.length} known
        </span>
      </div>

      {allDone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 rounded-2xl card-glass"
        >
          <div className="text-4xl mb-3">🎉</div>
          <h4 className="text-lg font-bold text-zinc-200 mb-1">All cards reviewed!</h4>
          <p className="text-sm text-zinc-500 mb-5">You knew all {cards.length} cards.</p>
          <button onClick={reset}
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white focus-glow"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            Shuffle &amp; Restart
          </button>
        </motion.div>
      ) : (
        <>
          {/* Card */}
          <div
            className="relative cursor-pointer select-none"
            onClick={flip}
            style={{ perspective: "1000px", minHeight: "200px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${current}-${flipped}`}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                style={{
                  minHeight: "200px",
                  background: flipped
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))'
                    : '#151518',
                  border: `1px solid ${flipped ? 'rgba(99,102,241,0.2)' : '#2a2a33'}`,
                }}
              >
                <div className="text-[9px] font-bold tracking-widest uppercase mb-3"
                  style={{ color: flipped ? '#818CF8' : '#71717a' }}>
                  {flipped ? "Answer" : "Question"} · {current + 1}/{cards.length}
                </div>
                <div className={`text-base font-semibold leading-relaxed max-w-md ${
                  flipped ? 'text-indigo-200' : 'text-zinc-200'
                }`}>
                  {flipped ? card.back : card.front}
                </div>
                <div className="text-[10px] text-zinc-600 mt-4">
                  {flipped ? "" : "Tap to reveal answer"}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mt-3"
            >
              <button
                onClick={() => next(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                ❌ Still learning
              </button>
              <button
                onClick={() => next(true)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
              >
                ✅ Got it!
              </button>
            </motion.div>
          )}

          {/* Progress dots */}
          <div className="flex gap-1 justify-center mt-4">
            {cards.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: known.has(i) ? '#22c55e' : i === current ? '#6366F1' : '#2a2a33',
                  boxShadow: i === current ? '0 0 6px rgba(99,102,241,0.4)' : 'none',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
