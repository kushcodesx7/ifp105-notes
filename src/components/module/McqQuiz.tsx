"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addXP, XP_REWARDS, earnBadge } from "@/lib/gamification";

export type BloomLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";

interface Question {
  q: string;
  opts: string[];
  ans: number;
  why: string;
  bloom?: BloomLevel;
}

interface McqQuizProps {
  topicId: number;
  moduleNumber?: number;
  questions: Question[];
  onComplete?: (score: number, total: number) => void;
  onAnswerCountChange?: (answered: number, total: number) => void;
}

const letters = ["A", "B", "C", "D"];

// Deterministic shuffle so answers stay consistent for the same topic
function shuffleQuestions(questions: Question[], seed: number): { opts: string[]; ans: number }[] {
  return questions.map((q, qi) => {
    const indices = q.opts.map((_, i) => i);
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

interface SavedQuizState {
  answers: (number | null)[];
  score: number;
  shuffleSeed: number;
  completed: boolean;
}

export default function McqQuiz({ topicId, moduleNumber = 1, questions, onComplete, onAnswerCountChange }: McqQuizProps) {
  const LS_KEY = `ifp105_m${moduleNumber}_quiz_t${topicId}`;
  const total = questions.length;

  // Load saved state or create fresh
  const [shuffleSeed, setShuffleSeed] = useState(() => {
    if (typeof window === "undefined") return Date.now();
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: SavedQuizState = JSON.parse(saved);
        return parsed.shuffleSeed;
      }
    } catch {}
    return topicId * 1000 + moduleNumber; // deterministic seed per topic
  });

  const [answered, setAnswered] = useState<(number | null)[]>(() => {
    if (typeof window === "undefined") return new Array(total).fill(null);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: SavedQuizState = JSON.parse(saved);
        if (parsed.answers.length === total) return parsed.answers;
      }
    } catch {}
    return new Array(total).fill(null);
  });

  const [score, setScore] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: SavedQuizState = JSON.parse(saved);
        return parsed.score;
      }
    } catch {}
    return 0;
  });

  const [completed, setCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: SavedQuizState = JSON.parse(saved);
        return parsed.completed;
      }
    } catch {}
    return false;
  });

  const [currentQ, setCurrentQ] = useState(() => {
    // Start at the first unanswered question, or 0 if all answered
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: SavedQuizState = JSON.parse(saved);
        if (parsed.answers.length === total) {
          const firstUnanswered = parsed.answers.findIndex((a) => a === null);
          return firstUnanswered >= 0 ? firstUnanswered : 0;
        }
      }
    } catch {}
    return 0;
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<"quiz" | "review">("quiz");

  // Shuffle options deterministically
  const shuffled = useMemo(() => shuffleQuestions(questions, shuffleSeed), [questions, shuffleSeed]);

  // Count answered questions
  const answeredCount = answered.filter((a) => a !== null).length;
  const allAnswered = answeredCount === total;

  // showFeedback is derived: true whenever the current question has been answered
  const showFeedback = answered[currentQ] !== null;

  // If returning to a completed quiz, show review mode
  const [showResult, setShowResult] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: SavedQuizState = JSON.parse(saved);
        if (parsed.completed && parsed.answers.every((a) => a !== null)) return true;
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    if (completed && allAnswered) {
      setViewMode("review");
      setShowResult(true);
    }
  }, []);

  // Notify parent about answer count changes (use ref to avoid infinite loop)
  const onAnswerCountChangeRef = useRef(onAnswerCountChange);
  onAnswerCountChangeRef.current = onAnswerCountChange;
  useEffect(() => {
    onAnswerCountChangeRef.current?.(answeredCount, total);
  }, [answeredCount, total]);

  // Save state to localStorage whenever answers change
  const saveState = useCallback(
    (newAnswers: (number | null)[], newScore: number, isCompleted: boolean) => {
      try {
        const state: SavedQuizState = {
          answers: newAnswers,
          score: newScore,
          shuffleSeed,
          completed: isCompleted,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(state));
      } catch {}
    },
    [LS_KEY, shuffleSeed]
  );

  const q = questions[currentQ];
  const sq = shuffled[currentQ];
  const picked = answered[currentQ];
  const isAnswered = picked !== null;
  const isCorrect = picked === sq.ans;

  function handlePick(oi: number) {
    if (isAnswered) return;
    const newAnswered = [...answered];
    newAnswered[currentQ] = oi;

    let newScore = score;
    if (shuffled[currentQ].ans === oi) {
      newScore = score + 1;
    }

    setAnswered(newAnswered);
    setScore(newScore);

    // Check if all answered now
    const nowAllAnswered = newAnswered.every((a) => a !== null);
    const isNowCompleted = nowAllAnswered;

    if (isNowCompleted && !completed) {
      setCompleted(true);
    }

    // Save immediately
    saveState(newAnswered, newScore, isNowCompleted);
  }

  function handleNext() {
    if (currentQ < total - 1) {
      // Find next unanswered question, or just go to next
      let next = currentQ + 1;
      setTimeout(() => setCurrentQ(next), 50);
    } else if (allAnswered || answered.filter((a) => a !== null).length === total) {
      // All questions answered — show results
      setShowResult(true);
      // Award XP
      const pct = (score / total) * 100;
      if (pct === 100) { addXP(XP_REWARDS.QUIZ_PERFECT); earnBadge("perfect_quiz"); }
      else if (pct >= 80) addXP(XP_REWARDS.QUIZ_GOOD);
      else if (pct >= 60) addXP(XP_REWARDS.QUIZ_PASS);
      onComplete?.(score, total);
    }
  }

  function resetQuiz() {
    const newSeed = Date.now();
    setCurrentQ(0);
    setAnswered(new Array(total).fill(null));
    setScore(0);
    setShowResult(false);
    setCompleted(false);
    setShuffleSeed(newSeed);
    setViewMode("quiz");
    setShowResetConfirm(false);
    // Clear saved state
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  }

  const pct = total > 0 ? (score / total) * 100 : 0;
  const progressWidth = (answeredCount / total) * 100;

  // ─── REVIEW MODE: Show all questions with results ───
  if (viewMode === "review" && completed) {
    return (
      <div className="mt-6 rounded-2xl overflow-hidden card-glass">
        {/* Header */}
        <div className="relative px-5 py-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)' }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.15), transparent 60%)' }} />
          <div className="relative flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Quiz Review — Topic {topicId}</h3>
              <p className="text-[11px] text-white/50">{score}/{total} correct · {pct >= 80 ? "Great job!" : pct >= 60 ? "Good effort" : "Keep practicing"}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                pct >= 80 ? 'bg-green-500/20 text-green-300 border-green-500/30'
                  : pct >= 60 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {score}/{total}
              </div>
            </div>
          </div>
          {/* Full progress bar */}
          <div className="relative mt-3 h-1 rounded-full overflow-hidden bg-white/10">
            <div className="h-full rounded-full bg-white/40 w-full" />
          </div>
        </div>

        {/* All questions in review */}
        <div className="p-5 space-y-4">
          {questions.map((question, qi) => {
            const sqItem = shuffled[qi];
            const userAnswer = answered[qi];
            const wasCorrect = userAnswer === sqItem.ans;

            return (
              <div key={qi} className="rounded-xl p-4" style={{ background: '#0d0d14', border: `1px solid ${wasCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    wasCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {wasCorrect ? '✓' : '✗'}
                  </span>
                  <span className="text-[13px] font-medium text-zinc-300 leading-relaxed">
                    {question.q}
                  </span>
                </div>

                {/* Show options with indicators */}
                <div className="space-y-1.5 ml-9">
                  {sqItem.opts.map((opt, oi) => {
                    const isPicked = userAnswer === oi;
                    const isCorrectOpt = sqItem.ans === oi;
                    let optBg = 'transparent';
                    let optBorder = 'transparent';
                    let optColor = '#71717a';

                    if (isCorrectOpt) { optBg = 'rgba(34,197,94,0.06)'; optBorder = 'rgba(34,197,94,0.2)'; optColor = '#4ade80'; }
                    if (isPicked && !wasCorrect) { optBg = 'rgba(239,68,68,0.06)'; optBorder = 'rgba(239,68,68,0.2)'; optColor = '#f87171'; }

                    return (
                      <div key={oi} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
                        style={{ background: optBg, border: `1px solid ${optBorder}`, color: optColor }}>
                        <span className="font-bold text-[10px] w-4">{letters[oi]}</span>
                        <span>{opt}</span>
                        {isCorrectOpt && <span className="ml-auto text-[10px]">✓ correct</span>}
                        {isPicked && !wasCorrect && <span className="ml-auto text-[10px]">✗ your answer</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="mt-2 ml-9 text-[11px] text-zinc-500 italic">
                  {question.why}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={() => { setViewMode("quiz"); setShowResult(false); setCurrentQ(0); }}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            Back to Quiz View
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            Reset & Try Again
          </button>
        </div>

        {/* Reset confirmation */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowResetConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl p-6 text-center"
                style={{ background: '#111118', border: '1px solid #2a2a33' }}
              >
                <div className="text-3xl mb-3">⚠️</div>
                <h3 className="text-lg font-bold mb-2">Reset this quiz?</h3>
                <p className="text-sm text-zinc-400 mb-5">
                  This will clear all your answers for Topic {topicId}. Other topics won&apos;t be affected.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: '#EF4444' }}
                  >
                    Yes, Reset
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── QUIZ MODE ───
  return (
    <div className="mt-6 rounded-2xl overflow-hidden card-glass">
      {/* Header */}
      <div className="relative px-5 py-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.15), transparent 60%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-[15px] font-semibold text-white">Test Yourself — Topic {topicId}</h3>
            <p className="text-[11px] text-white/50">
              {answeredCount}/{total} answered · {total - answeredCount > 0 ? `${total - answeredCount} remaining` : "All done!"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {completed && (
              <button
                onClick={() => setViewMode("review")}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                Review All
              </button>
            )}
            <div className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              score >= Math.ceil(total * 0.8)
                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                : 'bg-white/10 text-white/80 border-white/15'
            }`}>
              {score}/{total}
            </div>
          </div>
        </div>

        {/* Progress bar — shows answered count */}
        <div className="relative mt-3 h-1 rounded-full overflow-hidden bg-white/10">
          <motion.div
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-white/40"
          />
        </div>

        {/* Question dot indicators */}
        <div className="flex gap-1 mt-2">
          {answered.map((a, i) => (
            <button
              key={i}
              onClick={() => { setCurrentQ(i); }}
              className="w-2 h-2 rounded-full transition-all cursor-pointer hover:scale-125"
              style={{
                background: a === null
                  ? (i === currentQ ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)')
                  : (a === shuffled[i].ans ? '#22c55e' : '#ef4444'),
                boxShadow: i === currentQ ? '0 0 4px rgba(255,255,255,0.3)' : 'none',
              }}
              title={`Question ${i + 1}${a !== null ? (a === shuffled[i].ans ? ' ✓' : ' ✗') : ''}`}
            />
          ))}
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
              {/* Question counter + Bloom's badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                  Question {currentQ + 1} of {total}
                </div>
                {q.bloom && !["remember", "understand"].includes(q.bloom) && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    q.bloom === "apply" ? "bg-emerald-500/15 text-emerald-400" :
                    q.bloom === "analyze" ? "bg-violet-500/15 text-violet-400" :
                    q.bloom === "evaluate" ? "bg-amber-500/15 text-amber-400" :
                    q.bloom === "create" ? "bg-yellow-400/15 text-yellow-300" : ""
                  }`}>
                    {q.bloom === "apply" && "🔧 Apply"}
                    {q.bloom === "analyze" && "🔍 Analyze"}
                    {q.bloom === "evaluate" && "⚖️ Evaluate"}
                    {q.bloom === "create" && "✨ Create"}
                  </span>
                )}
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
                      animate={isAnswered && isPicked ? (isCorrect ? { scale: [1, 1.02, 1] } : { x: [0, -4, 4, -3, 2, 0] }) : {}}
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

                    {/* Navigation: Previous / Next */}
                    <div className="flex gap-3 mt-4">
                      {currentQ > 0 && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setCurrentQ(currentQ - 1)}
                          className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          ← Previous
                        </motion.button>
                      )}
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleNext}
                        className={`${currentQ > 0 ? 'flex-1' : 'w-full'} py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 focus-glow`}
                        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}
                      >
                        {currentQ < total - 1 ? `Next Question →` : allAnswered ? `See Results →` : `Next Question →`}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {showResult && !completed ? null : null}
        {showResult && completed && viewMode === "quiz" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 px-6"
            style={{ background: 'linear-gradient(135deg, #08080F, #0D0D1F)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`text-6xl font-bold mb-3 ${
                pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}
              style={{ textShadow: `0 0 30px ${pct >= 80 ? 'rgba(74,222,128,0.3)' : pct >= 60 ? 'rgba(250,204,21,0.3)' : 'rgba(248,113,113,0.3)'}` }}
            >
              {score}/{total}
            </motion.div>
            <p className="text-sm text-zinc-500 mb-6">
              {pct === 100 ? 'Perfect score! Outstanding! 🎉' :
               pct >= 80 ? 'Excellent — almost perfect 👏' :
               pct >= 60 ? 'Good effort! Re-read the bits you missed 📖' :
               'Keep going — re-read the topic and try again 💪'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setViewMode("review")}
                className="px-6 py-3 rounded-full text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Review Answers
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowResetConfirm(true)}
                className="px-8 py-3 rounded-full text-sm font-semibold text-white focus-glow"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
              >
                Try Again →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirmation modal (also used in quiz mode) */}
      <AnimatePresence>
        {showResetConfirm && viewMode === "quiz" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: '#111118', border: '1px solid #2a2a33' }}
            >
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold mb-2">Reset this quiz?</h3>
              <p className="text-sm text-zinc-400 mb-5">
                This will clear all your answers for Topic {topicId}. Other topics won&apos;t be affected.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={resetQuiz}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#EF4444' }}
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
