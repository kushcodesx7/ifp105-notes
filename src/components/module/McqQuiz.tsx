"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addXP, XP_REWARDS, earnBadge } from "@/lib/gamification";
import { useAuth } from "@/lib/auth-context";
import {
  BLOOM_META,
  BLOOM_ORDER,
  CONFIDENCE_META,
  CONFIDENCE_ORDER,
  type BloomLevel,
  type ConfidenceLevel,
} from "@/lib/blooms";

// Tiny 32-bit string hash. Used to derive a per-student seed salt so the
// shuffle mapping differs between students — without it, the index→option
// assignment was the same for every student given the same (topic,module),
// meaning one student's answer leak was everyone's leak.
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export type { BloomLevel };

interface Question {
  q: string;
  opts: string[];
  ans: number;
  why: string;
  bloom?: BloomLevel;
}

// JSON shapes sent to /api/progress on completion. Kept simple so the server
// can store them as-is (JSONB columns) without custom parsing.
export type BloomStatsPayload = Partial<
  Record<BloomLevel, { correct: number; total: number }>
>;
export interface ConfidenceStatsPayload {
  rated: number;
  confidentWrong: number;
  humbleRight: number;
}

interface McqQuizProps {
  topicId: number;
  moduleNumber?: number;
  questions: Question[];
  onComplete?: (
    score: number,
    total: number,
    bloomStats?: BloomStatsPayload,
    confidenceStats?: ConfidenceStatsPayload
  ) => void;
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
  // Bloom's metacognition: capture self-rated confidence per question BEFORE
  // the reveal. Null for questions that haven't been answered yet, or for
  // state saved by an older app version (v1). Backward compatible.
  confidences?: (ConfidenceLevel | null)[];
  score: number;
  shuffleSeed: number;
  completed: boolean;
}

export default function McqQuiz({ topicId, moduleNumber = 1, questions, onComplete, onAnswerCountChange }: McqQuizProps) {
  const LS_KEY = `ifp105_m${moduleNumber}_quiz_t${topicId}`;
  const total = questions.length;
  // Per-student salt: stable for this user across sessions and devices.
  // Authenticated → hash(email). Anonymous → falls back to a per-browser
  // random stashed in localStorage (still unique per device, but resets
  // if the user clears their data).
  const { user } = useAuth();
  const userSalt = useMemo(() => {
    if (user?.email) return hashString(user.email.toLowerCase());
    if (typeof window === "undefined") return 0;
    try {
      let s = localStorage.getItem("ifp105_anon_salt");
      if (!s) {
        s = String(Math.floor(Math.random() * 0xffffffff));
        localStorage.setItem("ifp105_anon_salt", s);
      }
      return Number(s) >>> 0;
    } catch {
      return 0;
    }
  }, [user?.email]);

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
    // Deterministic seed per (topic, module, student). The user salt
    // breaks the authored "correct is always index 1" pattern across
    // students — so one student's leaked mapping doesn't work for
    // anyone else.
    return (topicId * 1000 + moduleNumber) ^ userSalt;
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

  // Per-question confidence (null until the student rates themselves).
  // Stored alongside answers so calibration stats can be computed at the end.
  const [confidences, setConfidences] = useState<(ConfidenceLevel | null)[]>(() => {
    if (typeof window === "undefined") return new Array(total).fill(null);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: SavedQuizState = JSON.parse(saved);
        if (parsed.confidences && parsed.confidences.length === total)
          return parsed.confidences;
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

  // Feedback (correct/wrong + explanation) only reveals after the student has
  // BOTH picked an answer AND rated their confidence. The forced pause
  // between pick and reveal is the metacognition beat — "was I actually
  // sure, or just guessing?" — that makes the calibration stat meaningful.
  const confidenceRated = confidences[currentQ] !== null;
  const showFeedback = answered[currentQ] !== null && confidenceRated;
  const awaitingConfidence = answered[currentQ] !== null && !confidenceRated;

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

  // Mount-only restore of review mode. We deliberately run this once:
  // `completed`/`allAnswered` are derived from lazy-init state reading
  // localStorage, so the values on the first render are already the
  // final source of truth. Re-running on changes would incorrectly
  // re-open the review screen every time a student answers a question.
  const didRestoreRef = useRef(false);
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;
    if (completed && allAnswered) {
      setViewMode("review");
      setShowResult(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent about answer count changes (use ref to avoid infinite loop)
  const onAnswerCountChangeRef = useRef(onAnswerCountChange);
  onAnswerCountChangeRef.current = onAnswerCountChange;
  useEffect(() => {
    onAnswerCountChangeRef.current?.(answeredCount, total);
  }, [answeredCount, total]);

  // Save state to localStorage whenever answers or confidences change
  const saveState = useCallback(
    (
      newAnswers: (number | null)[],
      newScore: number,
      isCompleted: boolean,
      newConfidences: (ConfidenceLevel | null)[]
    ) => {
      try {
        const state: SavedQuizState = {
          answers: newAnswers,
          confidences: newConfidences,
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
    saveState(newAnswered, newScore, isNowCompleted, confidences);
  }

  // Called AFTER the student has picked an answer but BEFORE the reveal.
  // This forces a metacognitive pause: "how sure was I?"
  function handleConfidence(level: ConfidenceLevel) {
    if (confidences[currentQ] !== null) return; // already rated
    const next = [...confidences];
    next[currentQ] = level;
    setConfidences(next);
    saveState(answered, score, completed, next);
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

      // Shape the Bloom + calibration payloads for the /api/progress save.
      // These are the same numbers shown on the results screen, just packaged
      // as plain objects so the server can store them as JSONB.
      const bloomPayload: BloomStatsPayload = {};
      for (const entry of bloomBreakdown) {
        bloomPayload[entry.level] = { correct: entry.correct, total: entry.total };
      }
      const calibrationPayload: ConfidenceStatsPayload = {
        rated: calibration.ratedCount,
        confidentWrong: calibration.confidentWrong,
        humbleRight: calibration.humbleRight,
      };
      onComplete?.(score, total, bloomPayload, calibrationPayload);
    }
  }

  function resetQuiz() {
    const newSeed = Date.now();
    setCurrentQ(0);
    setAnswered(new Array(total).fill(null));
    setConfidences(new Array(total).fill(null));
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

  // ─── Bloom's breakdown + calibration stats ─────────────────────────
  // Computed from the final answers + confidences so they're accurate both
  // during the results screen and the review screen.
  const bloomBreakdown = useMemo(() => {
    const stats: Partial<Record<BloomLevel, { correct: number; total: number }>> = {};
    for (let i = 0; i < questions.length; i++) {
      const lvl = questions[i].bloom;
      if (!lvl) continue;
      const a = answered[i];
      if (a === null) continue;
      const bucket = stats[lvl] ?? { correct: 0, total: 0 };
      bucket.total += 1;
      if (a === shuffled[i].ans) bucket.correct += 1;
      stats[lvl] = bucket;
    }
    // Return in canonical ladder order, filtering out levels absent from the quiz
    return BLOOM_ORDER.filter((lvl) => stats[lvl]).map((lvl) => ({
      level: lvl,
      meta: BLOOM_META[lvl],
      ...stats[lvl]!,
    }));
  }, [questions, answered, shuffled]);

  // Calibration: how well did confidence match correctness?
  // - "confident but wrong" = rated pretty-sure/certain AND answered wrong
  // - "humble but right" = rated guessing AND answered right (luck OR
  //   underselling themselves — either way, informative feedback)
  const calibration = useMemo(() => {
    let confidentWrong = 0;
    let humbleRight = 0;
    let ratedCount = 0;
    for (let i = 0; i < total; i++) {
      const a = answered[i];
      const c = confidences[i];
      if (a === null || c === null) continue;
      ratedCount++;
      const correct = a === shuffled[i].ans;
      if (!correct && (c === "pretty-sure" || c === "certain")) confidentWrong++;
      if (correct && c === "guessing") humbleRight++;
    }
    return { confidentWrong, humbleRight, ratedCount };
  }, [answered, confidences, shuffled, total]);

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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      {question.bloom && BLOOM_META[question.bloom] && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border inline-flex items-center gap-1"
                          style={{
                            background: BLOOM_META[question.bloom].bgTint,
                            borderColor: BLOOM_META[question.bloom].borderTint,
                            color: BLOOM_META[question.bloom].color,
                          }}
                        >
                          <span aria-hidden="true">{BLOOM_META[question.bloom].icon}</span>
                          {BLOOM_META[question.bloom].label}
                        </span>
                      )}
                      {confidences[qi] && (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            color: CONFIDENCE_META[confidences[qi]!].color,
                          }}
                          title="Your confidence before the reveal"
                        >
                          {CONFIDENCE_META[confidences[qi]!].emoji} {CONFIDENCE_META[confidences[qi]!].label}
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] font-medium text-zinc-300 leading-relaxed">
                      {question.q}
                    </span>
                  </div>
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
                        <span className="whitespace-pre-wrap break-words">{opt}</span>
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
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
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

        {/* Question dot indicators — colour only reveals after confidence
             is rated, otherwise they'd leak correct/wrong before the reveal. */}
        <div className="flex gap-1 mt-2">
          {answered.map((a, i) => {
            const rated = confidences[i] !== null;
            const revealed = a !== null && rated;
            const picked = a !== null;
            let dotBg: string;
            if (revealed) {
              dotBg = a === shuffled[i].ans ? '#22c55e' : '#ef4444';
            } else if (picked) {
              dotBg = '#6366F1'; // answered but awaiting confidence
            } else {
              dotBg = i === currentQ ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
            }
            return (
              <button
                key={i}
                onClick={() => { setCurrentQ(i); }}
                className="w-2 h-2 rounded-full transition-all cursor-pointer hover:scale-125"
                style={{
                  background: dotBg,
                  boxShadow: i === currentQ ? '0 0 4px rgba(255,255,255,0.3)' : 'none',
                }}
                title={`Question ${i + 1}${revealed ? (a === shuffled[i].ans ? ' ✓' : ' ✗') : picked ? ' (rate confidence)' : ''}`}
              />
            );
          })}
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
              {/* Question counter + Bloom's badge (shown for every level so
                   students learn to recognise the ladder, not just the hard ones) */}
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                  Question {currentQ + 1} of {total}
                </div>
                {q.bloom && BLOOM_META[q.bloom] && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                    style={{
                      background: BLOOM_META[q.bloom].bgTint,
                      borderColor: BLOOM_META[q.bloom].borderTint,
                      color: BLOOM_META[q.bloom].color,
                    }}
                    title={BLOOM_META[q.bloom].description}
                  >
                    <span aria-hidden="true">{BLOOM_META[q.bloom].icon}</span>
                    {BLOOM_META[q.bloom].label}
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
                    if (!showFeedback) {
                      // Pick recorded but confidence not rated yet — show the
                      // picked option in neutral "selected" style; do NOT
                      // reveal which option is correct.
                      if (isPicked) {
                        bg = 'rgba(99,102,241,0.12)';
                        border = '#6366F1';
                        color = '#c7d2fe';
                      } else {
                        color = '#52525b'; // dim unpicked options
                      }
                    } else {
                      if (isPicked && isCorrect) { bg = 'rgba(34,197,94,0.1)'; border = '#22c55e'; color = '#4ade80'; icon = '✓'; }
                      else if (isPicked && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#f87171'; icon = '✗'; }
                      else if (isCorrectOpt) { bg = 'rgba(34,197,94,0.06)'; border = '#22c55e'; color = '#4ade80'; icon = '✓'; }
                    }
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
                          // Only paint green/red after confidence is rated.
                          // Before that, the picked option gets an indigo
                          // highlight and unpicked options stay neutral.
                          background: showFeedback && (isPicked || isCorrectOpt)
                            ? (isCorrectOpt ? '#22c55e' : '#ef4444')
                            : isAnswered && isPicked && !showFeedback
                              ? '#6366F1'
                              : '#222230',
                          color: (showFeedback && (isPicked || isCorrectOpt)) || (isAnswered && isPicked && !showFeedback)
                            ? 'white'
                            : '#71717a',
                        }}
                      >
                        {showFeedback && icon ? icon : letters[oi]}
                      </span>
                      {/* pre-wrap preserves newlines in options that
                          contain multi-line code samples (HTML skeletons,
                          etc.) without affecting plain-text options. */}
                      <span className="leading-relaxed pt-0.5 whitespace-pre-wrap break-words">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Confidence meter — appears after pick, blocks reveal */}
              <AnimatePresence>
                {awaitingConfidence && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 p-4 rounded-xl"
                    style={{
                      background: 'rgba(99,102,241,0.06)',
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}
                  >
                    <div className="text-[11px] text-zinc-400 mb-3">
                      Before we reveal the answer —{" "}
                      <span className="text-white font-semibold">how sure are you?</span>
                    </div>
                    {/* 2x2 on small screens, 4-across from sm (640px) up.
                         Four labels on 375px were cramped and truncated. */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CONFIDENCE_ORDER.map((lvl) => {
                        const meta = CONFIDENCE_META[lvl];
                        return (
                          <motion.button
                            key={lvl}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleConfidence(lvl)}
                            className="flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1 py-3 px-2 rounded-lg transition-all focus-glow min-h-[48px]"
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: `1px solid rgba(255,255,255,0.08)`,
                            }}
                          >
                            <span className="text-xl" aria-hidden="true">
                              {meta.emoji}
                            </span>
                            <span
                              className="text-[11px] sm:text-[10px] font-semibold"
                              style={{ color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-3 text-center italic">
                      We track this to show you calibration — how often your confidence matched your correctness.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}
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

            {/* Bloom's breakdown — shows how the student performed at each
                 cognitive level, not just the raw score. This is the whole
                 point of the Bloom's-laddered questions: surfacing where
                 thinking is strong vs weak. */}
            {bloomBreakdown.length > 0 && (
              <div className="max-w-md mx-auto mb-6 text-left">
                <div className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-3 text-center">
                  Your thinking by level
                </div>
                <div className="space-y-2">
                  {bloomBreakdown.map(({ level, meta, correct, total: levelTotal }) => {
                    const levelPct = levelTotal > 0 ? (correct / levelTotal) * 100 : 0;
                    return (
                      <div key={level} className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0"
                          style={{
                            background: meta.bgTint,
                            borderColor: meta.borderTint,
                            color: meta.color,
                            minWidth: '110px',
                          }}
                          title={meta.description}
                        >
                          <span aria-hidden="true">{meta.icon}</span>
                          {meta.label}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${levelPct}%` }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ background: meta.color }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-400 tabular-nums shrink-0 w-10 text-right">
                          {correct}/{levelTotal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Calibration stat — only shown if student rated at least one
                 question. \"confident-but-wrong\" is the single most powerful
                 signal for self-awareness. */}
            {calibration.ratedCount > 0 && (calibration.confidentWrong > 0 || calibration.humbleRight > 0) && (
              <div
                className="max-w-md mx-auto mb-6 p-3 rounded-xl text-left"
                style={{
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.18)',
                }}
              >
                <div className="text-[11px] font-bold text-indigo-300 tracking-widest uppercase mb-2">
                  Confidence calibration
                </div>
                <div className="space-y-1.5 text-[12px] text-zinc-300 leading-relaxed">
                  {calibration.confidentWrong > 0 && (
                    <div>
                      <span className="text-amber-300 font-semibold">⚠ {calibration.confidentWrong}</span>{' '}
                      time{calibration.confidentWrong > 1 ? 's' : ''} you were{' '}
                      <em className="text-white">sure</em> — and wrong. Worth re-reading those bits.
                    </div>
                  )}
                  {calibration.humbleRight > 0 && (
                    <div>
                      <span className="text-emerald-300 font-semibold">✓ {calibration.humbleRight}</span>{' '}
                      time{calibration.humbleRight > 1 ? 's' : ''} you called it a{' '}
                      <em className="text-white">guess</em> — and got it right. You know more than you think.
                    </div>
                  )}
                </div>
              </div>
            )}

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
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
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
