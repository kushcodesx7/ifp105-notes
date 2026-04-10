"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addXP, XP_REWARDS, earnBadge } from "@/lib/gamification";

interface Question {
  q: string;
  opts: string[];
  ans: number;
  why: string;
}

interface McqQuizProps {
  topicId: number;
  questions: Question[];
  onComplete?: (score: number, total: number) => void;
}

const letters = ["A", "B", "C", "D"];

// Shuffle options for each question, returning shuffled opts and the new correct answer index
function shuffleQuestions(questions: Question[], seed: number): { opts: string[]; ans: number }[] {
  return questions.map((q, qi) => {
    // Create index array [0, 1, 2, 3] and shuffle deterministically per question
    const indices = q.opts.map((_, i) => i);
    // Fisher-Yates shuffle with seed
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.abs(((seed + qi * 7 + i * 13) * 2654435761) % (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return {
      opts: indices.map((i) => q.opts[i]),
      ans: indices.indexOf(q.ans),
    };
  });
}

export default function McqQuiz({ topicId, questions, onComplete }: McqQuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());

  // Shuffle options on mount and on retry
  const shuffled = useMemo(() => shuffleQuestions(questions, shuffleSeed), [questions, shuffleSeed]);

  const total = questions.length;
  const q = questions[currentQ];
  const sq = shuffled[currentQ]; // shuffled version
  const picked = answered[currentQ];
  const isAnswered = picked !== null;
  const isCorrect = picked === sq.ans;

  function handlePick(oi: number) {
    if (isAnswered) return;
    const newAnswered = [...answered];
    newAnswered[currentQ] = oi;
    setAnswered(newAnswered);
    setShowFeedback(true);

    if (shuffled[currentQ].ans === oi) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    setShowFeedback(false);
    if (currentQ < total - 1) {
      setTimeout(() => setCurrentQ((c) => c + 1), 50);
    } else {
      setShowResult(true);
      // Award XP based on score
      const finalScore = shuffled[currentQ].ans === answered[currentQ] ? score + 1 : score;
      const finalPct = (finalScore / total) * 100;
      if (finalPct === 100) { addXP(XP_REWARDS.QUIZ_PERFECT); earnBadge("perfect_quiz"); }
      else if (finalPct >= 80) addXP(XP_REWARDS.QUIZ_GOOD);
      else if (finalPct >= 60) addXP(XP_REWARDS.QUIZ_PASS);
      onComplete?.(score, total);
    }
  }

  function retry() {
    setCurrentQ(0);
    setAnswered(new Array(questions.length).fill(null));
    setScore(0);
    setShowResult(false);
    setShowFeedback(false);
    setShuffleSeed(Date.now()); // Re-shuffle options on retry
  }

  const pct = (score / total) * 100;
  const progressWidth = ((currentQ + (isAnswered ? 1 : 0)) / total) * 100;

  return (
    <div className="mt-6 rounded-2xl overflow-hidden card-glass">
      {/* Header */}
      <div className="relative px-5 py-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.15), transparent 60%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-[15px] font-semibold text-white">Test Yourself — Topic {topicId}</h3>
            <p className="text-[11px] text-white/50">{total} questions · one at a time</p>
          </div>
          <div className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
            score >= Math.ceil(total * 0.8)
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-white/10 text-white/80 border-white/15'
          }`}>
            {score} / {total}
          </div>
        </div>
        {/* Progress bar */}
        <div className="relative mt-3 h-1 rounded-full overflow-hidden bg-white/10">
          <motion.div
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-white/40"
          />
        </div>
      </div>

      {/* Single question view */}
      {!showResult && (
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Question counter */}
              <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2">
                Question {currentQ + 1} of {total}
              </div>

              {/* Question text */}
              <div className="text-[15px] font-semibold text-zinc-200 mb-5 leading-relaxed">
                {q.q}
              </div>

              {/* Options (shuffled) */}
              <div className="space-y-2">
                {sq.opts.map((opt, oi) => {
                  const isPicked = picked === oi;
                  const isCorrectOpt = sq.ans === oi;

                  let bg = '#111116';
                  let border = '#2a2a33';
                  let color = '#a1a1aa';
                  let icon = '';

                  if (isAnswered) {
                    if (isPicked && isCorrect) { bg = 'rgba(34,197,94,0.1)'; border = '#22c55e'; color = '#4ade80'; icon = '✓'; }
                    else if (isPicked && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#f87171'; icon = '✗'; }
                    else if (isCorrectOpt) { bg = 'rgba(34,197,94,0.06)'; border = '#22c55e'; color = '#4ade80'; icon = '✓'; }
                  }

                  return (
                    <motion.button
                      key={oi}
                      whileHover={!isAnswered ? { x: 4 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      onClick={() => handlePick(oi)}
                      disabled={isAnswered}
                      className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left text-[13px] font-medium transition-all disabled:cursor-default focus-glow"
                      style={{ background: bg, border: `1px solid ${border}`, color }}
                    >
                      <span
                        className="w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 transition-all"
                        style={{
                          background: isAnswered && (isPicked || isCorrectOpt) ? (isCorrectOpt ? '#22c55e' : '#ef4444') : '#222230',
                          color: isAnswered && (isPicked || isCorrectOpt) ? 'white' : '#71717a',
                        }}
                      >
                        {isAnswered && icon ? icon : letters[oi]}
                      </span>
                      <span className="leading-relaxed pt-0.5">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`mt-4 px-4 py-3 rounded-xl text-[13px] leading-relaxed ${
                        isCorrect
                          ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}
                      role="alert"
                    >
                      <strong>{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong> {q.why}
                    </div>

                    {/* Next button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      onClick={handleNext}
                      className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 focus-glow"
                      style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}
                    >
                      {currentQ < total - 1 ? `Next Question →` : `See Results →`}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 px-6"
            style={{ background: 'linear-gradient(135deg, #08080F, #0D0D1F)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className={`text-6xl font-bold mb-3 ${
              pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`} style={{ textShadow: `0 0 30px ${pct >= 80 ? 'rgba(74,222,128,0.3)' : pct >= 60 ? 'rgba(250,204,21,0.3)' : 'rgba(248,113,113,0.3)'}` }}>
              {score}/{total}
            </div>
            <p className="text-sm text-zinc-500 mb-6">
              {pct === 100 ? 'Perfect score! Outstanding! 🎉' :
               pct >= 80 ? 'Excellent — almost perfect 👏' :
               pct >= 60 ? 'Good effort! Re-read the bits you missed 📖' :
               'Keep going — re-read the topic and try again 💪'}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={retry}
              className="px-8 py-3 rounded-full text-sm font-semibold text-white focus-glow"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
            >
              Try Again →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
