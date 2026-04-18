"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { practiceSets, type PracticeQuestion } from "@/data/practice-questions";
import { addXP, XP_REWARDS, earnBadge } from "@/lib/gamification";
import XpBar from "@/components/XpBar";

// ─── Types ───
interface SavedSetState {
  answers: (number | null)[];
  score: number;
  seed: number;
  completed: boolean;
}

interface HistoryEntry {
  date: string;
  scores: Record<number, number>; // moduleId → percentage
  overall: number;
}

// ─── Helpers ───
const LS_PREFIX = "ifp105_practice_";
const LS_HISTORY = "ifp105_practice_history";
const LS_GUIDE = "ifp105_practice_guide_seen";

function shuffleOptions(questions: PracticeQuestion[], seed: number) {
  return questions.map((q, qi) => {
    const indices = q.opts.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.abs(((seed + qi * 7 + i * 13) * 2654435761) % (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return { opts: indices.map((i) => q.opts[i]), ans: indices.indexOf(q.ans) };
  });
}

function getSetState(moduleId: number): SavedSetState | null {
  try {
    const saved = localStorage.getItem(`${LS_PREFIX}m${moduleId}`);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveSetState(moduleId: number, state: SavedSetState) {
  try { localStorage.setItem(`${LS_PREFIX}m${moduleId}`, JSON.stringify(state)); } catch {}
}

function getHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem(LS_HISTORY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveHistory(entry: HistoryEntry) {
  try {
    const history = getHistory();
    history.push(entry);
    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
  } catch {}
}

const letters = ["A", "B", "C", "D"];

// ─── Main Component ───
export default function PracticePage() {
  // View: "home" | "guide" | "quiz" | "results"
  const [view, setView] = useState<"home" | "guide" | "quiz" | "results">("home");
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [guideSeen, setGuideSeen] = useState(false);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [seed, setSeed] = useState(() => Date.now());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Dashboard data
  const [setStates, setSetStates] = useState<Record<number, SavedSetState>>({});

  // Load all states on mount
  useEffect(() => {
    const states: Record<number, SavedSetState> = {};
    practiceSets.forEach((s) => {
      const saved = getSetState(s.moduleId);
      if (saved) states[s.moduleId] = saved;
    });
    setSetStates(states);
    setGuideSeen(localStorage.getItem(LS_GUIDE) === "true");
  }, []);

  // Current quiz data
  const currentSet = activeModule ? practiceSets.find((s) => s.moduleId === activeModule) : null;
  const questions = currentSet?.questions || [];
  const total = questions.length;
  const shuffled = useMemo(() => shuffleOptions(questions, seed), [questions, seed]);

  // Derived
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === total;
  const q = questions[currentQ];
  const sq = shuffled[currentQ];
  const picked = answers[currentQ] ?? null;
  const isAnswered = picked !== null;
  const isCorrect = picked === sq?.ans;
  const showFeedback = isAnswered;

  // Readiness calculations
  const totalQuestions = 50;
  const totalAnswered = Object.values(setStates).reduce((sum, s) => sum + s.answers.filter((a) => a !== null).length, 0);
  const totalCorrect = Object.values(setStates).reduce((sum, s) => sum + s.score, 0);
  const overallPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Callback ref for answer count
  const onAnswerCountRef = useRef<((n: number) => void) | null>(null);

  // ─── Actions ───
  function startQuiz(moduleId: number) {
    const existing = getSetState(moduleId);
    if (existing && !existing.completed) {
      // Resume
      setAnswers(existing.answers);
      setScore(existing.score);
      setSeed(existing.seed);
      const firstUnanswered = existing.answers.findIndex((a) => a === null);
      setCurrentQ(firstUnanswered >= 0 ? firstUnanswered : 0);
    } else if (existing && existing.completed) {
      // Show results for completed set
      setAnswers(existing.answers);
      setScore(existing.score);
      setSeed(existing.seed);
      setActiveModule(moduleId);
      setView("results");
      return;
    } else {
      // Fresh start
      const newSeed = Date.now();
      setAnswers(new Array(10).fill(null));
      setScore(0);
      setSeed(newSeed);
      setCurrentQ(0);
    }
    setActiveModule(moduleId);
    setView("quiz");
  }

  function handlePick(oi: number) {
    if (isAnswered || !currentSet) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = oi;
    let newScore = score;
    if (shuffled[currentQ].ans === oi) newScore = score + 1;
    setAnswers(newAnswers);
    setScore(newScore);

    const nowComplete = newAnswers.every((a) => a !== null);
    const state: SavedSetState = { answers: newAnswers, score: newScore, seed, completed: nowComplete };
    saveSetState(currentSet.moduleId, state);
    setSetStates((prev) => ({ ...prev, [currentSet.moduleId]: state }));

    if (nowComplete) {
      // Award XP
      const pct = (newScore / total) * 100;
      if (pct === 100) { addXP(XP_REWARDS.QUIZ_PERFECT); earnBadge("perfect_quiz"); }
      else if (pct >= 80) addXP(XP_REWARDS.QUIZ_GOOD);
      else if (pct >= 60) addXP(XP_REWARDS.QUIZ_PASS);

      // Save to history
      const scores: Record<number, number> = {};
      practiceSets.forEach((s) => {
        const ss = s.moduleId === currentSet.moduleId ? state : setStates[s.moduleId];
        if (ss?.completed) scores[s.moduleId] = Math.round((ss.score / s.questions.length) * 100);
      });
      const overall = Object.values(scores).length > 0
        ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
        : 0;
      saveHistory({ date: new Date().toISOString().split("T")[0], scores, overall });
    }
  }

  function handleNext() {
    if (currentQ < total - 1) {
      setCurrentQ(currentQ + 1);
    } else if (allAnswered) {
      setView("results");
    }
  }

  function resetSet(moduleId: number) {
    try { localStorage.removeItem(`${LS_PREFIX}m${moduleId}`); } catch {}
    setSetStates((prev) => { const n = { ...prev }; delete n[moduleId]; return n; });
    setShowResetConfirm(false);
    if (activeModule === moduleId) {
      const newSeed = Date.now();
      setAnswers(new Array(10).fill(null));
      setScore(0);
      setSeed(newSeed);
      setCurrentQ(0);
    }
  }

  function dismissGuide() {
    setGuideSeen(true);
    try { localStorage.setItem(LS_GUIDE, "true"); } catch {}
  }

  // Color for readiness percentage
  function readinessColor(pct: number) {
    if (pct >= 90) return "#818CF8"; // indigo
    if (pct >= 75) return "#22c55e"; // green
    if (pct >= 60) return "#eab308"; // yellow
    if (pct >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  }

  function readinessLabel(pct: number) {
    if (pct >= 90) return "Outstanding! You've mastered this material.";
    if (pct >= 75) return "Great progress! You're well prepared.";
    if (pct >= 60) return "Good foundation. A few more rounds will make you solid.";
    if (pct >= 40) return "Getting there. Focus on your weak topics.";
    if (pct > 0) return "Just getting started. Keep practicing!";
    return "Start practicing to see your readiness score.";
  }

  // ─── GUIDE VIEW ───
  if (!guideSeen && view === "home") {
    return (
      <main className="relative min-h-screen">
        <Navbar showBack title="Practice Zone" />
        <XpBar />
        <div className="max-w-2xl mx-auto px-5 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold mb-3">Welcome to the Practice Zone</h1>
            <p className="text-zinc-400 text-sm">Your space to test, learn, and grow — at your own pace.</p>
          </motion.div>

          <div className="space-y-4 mb-10">
            {[
              { step: "1", icon: "📋", title: "Pick a Topic", desc: "Choose any module — 10 quick questions each. Start with what you know or challenge yourself." },
              { step: "2", icon: "💡", title: "Answer & Learn", desc: "No timer. No pressure. Get it wrong? Read the explanation and learn from it. That's the whole point." },
              { step: "3", icon: "📊", title: "See Your Score", desc: "Track your readiness across all topics. See where you're strong and where to improve." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex gap-4 p-5 rounded-xl card-glass"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 mb-1">Step {item.step}: {item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={dismissGuide}
            className="w-full py-4 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
          >
            Let's Go! →
          </motion.button>
        </div>
      </main>
    );
  }

  // ─── RESULTS VIEW ───
  if (view === "results" && currentSet) {
    const setPct = total > 0 ? Math.round((score / total) * 100) : 0;
    const color = readinessColor(setPct);

    return (
      <main className="relative min-h-screen">
        <Navbar showBack title="Practice Zone" />
        <XpBar />
        <div className="max-w-2xl mx-auto px-5 pt-20 pb-24">
          {/* Set Result Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="text-4xl mb-3">{currentSet.icon}</div>
            <h2 className="text-2xl font-bold mb-1">{currentSet.moduleTitle}</h2>
            <p className="text-zinc-500 text-sm">Practice Complete</p>
          </motion.div>

          {/* Score Circle */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-40 h-40 rounded-full flex items-center justify-center mb-6 relative"
            style={{ background: `conic-gradient(${color} ${setPct * 3.6}deg, #1e1e28 0deg)` }}
          >
            <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center" style={{ background: '#09090F' }}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold"
                style={{ color }}
              >
                {setPct}%
              </motion.span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Score</span>
            </div>
          </motion.div>

          <p className="text-center text-sm text-zinc-400 mb-8">{score}/{total} correct — {readinessLabel(setPct)}</p>

          {/* Question Review */}
          <div className="space-y-3 mb-8">
            <h3 className="text-sm font-bold text-zinc-300 mb-2">Question Review</h3>
            {questions.map((question, qi) => {
              const sqItem = shuffled[qi];
              const userAnswer = answers[qi];
              const wasCorrect = userAnswer === sqItem.ans;

              return (
                <motion.div
                  key={qi}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + qi * 0.05 }}
                  className="p-4 rounded-xl"
                  style={{ background: '#0d0d14', border: `1px solid ${wasCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}` }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`text-xs font-bold shrink-0 mt-0.5 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {wasCorrect ? '✓' : '✗'}
                    </span>
                    <span className="text-[13px] text-zinc-300">{question.q}</span>
                  </div>
                  {!wasCorrect && (
                    <p className="text-[11px] text-zinc-500 ml-5 italic">{question.why}</p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setView("home"); setActiveModule(null); }}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ← Back to Topics
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              Try Again
            </button>
          </div>
        </div>

        {/* Reset Confirm */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowResetConfirm(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl p-6 text-center"
                style={{ background: '#111118', border: '1px solid #2a2a33' }}>
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="text-lg font-bold mb-2">Try again?</h3>
                <p className="text-sm text-zinc-400 mb-5">Your answers for {currentSet.moduleTitle} will be reset. Questions will be shuffled.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Cancel
                  </button>
                  <button onClick={() => { resetSet(currentSet.moduleId); setView("quiz"); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                    Yes, Reset
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // ─── QUIZ VIEW ───
  if (view === "quiz" && currentSet && q && sq) {
    const progressWidth = (answeredCount / total) * 100;

    return (
      <main className="relative min-h-screen">
        <Navbar showBack title={`Practice — ${currentSet.moduleTitle}`} />
        <XpBar />
        <div className="max-w-2xl mx-auto px-5 pt-20 pb-24">
          {/* Quiz Header */}
          <div className="rounded-2xl overflow-hidden card-glass mb-6">
            <div className="relative px-5 py-4" style={{ background: `linear-gradient(135deg, ${currentSet.accent}, ${currentSet.accent}cc)` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold text-white">{currentSet.icon} {currentSet.moduleTitle}</h3>
                  <p className="text-[11px] text-white/50">{answeredCount}/{total} answered · {total - answeredCount} remaining</p>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15 text-white">
                  {score}/{total}
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full overflow-hidden bg-white/10">
                <motion.div animate={{ width: `${progressWidth}%` }} transition={{ duration: 0.4 }}
                  className="h-full rounded-full bg-white/40" />
              </div>
              {/* Dots */}
              <div className="flex gap-1 mt-2">
                {answers.map((a, i) => (
                  <button key={i} onClick={() => setCurrentQ(i)}
                    className="w-2 h-2 rounded-full transition-all cursor-pointer hover:scale-125"
                    style={{
                      background: a === null
                        ? (i === currentQ ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)')
                        : (a === shuffled[i].ans ? '#22c55e' : '#ef4444'),
                    }}
                    title={`Q${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div key={currentQ}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}>
                  <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2">
                    Question {currentQ + 1} of {total}
                  </div>
                  <div className="text-[15px] font-semibold text-zinc-200 mb-5 leading-relaxed">{q.q}</div>

                  <div className="space-y-2">
                    {sq.opts.map((opt, oi) => {
                      const isPicked = picked === oi;
                      const isCorrectOpt = sq.ans === oi;
                      let bg = '#111116', border = '#2a2a33', color = '#a1a1aa', icon = '';

                      if (isAnswered) {
                        if (isPicked && isCorrect) { bg = 'rgba(34,197,94,0.1)'; border = '#22c55e'; color = '#4ade80'; icon = '✓'; }
                        else if (isPicked && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#f87171'; icon = '✗'; }
                        else if (isCorrectOpt) { bg = 'rgba(34,197,94,0.06)'; border = '#22c55e'; color = '#4ade80'; icon = '✓'; }
                      }

                      return (
                        <motion.button key={oi}
                          whileHover={!isAnswered ? { x: 4 } : {}}
                          whileTap={!isAnswered ? { scale: 0.98 } : {}}
                          animate={isAnswered && isPicked ? (isCorrect ? { scale: [1, 1.02, 1] } : { x: [0, -4, 4, -3, 2, 0] }) : {}}
                          onClick={() => handlePick(oi)}
                          disabled={isAnswered}
                          className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left text-[13px] font-medium transition-all disabled:cursor-default"
                          style={{ background: bg, border: `1px solid ${border}`, color }}>
                          <span className="w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              background: isAnswered && (isPicked || isCorrectOpt) ? (isCorrectOpt ? '#22c55e' : '#ef4444') : '#222230',
                              color: isAnswered && (isPicked || isCorrectOpt) ? 'white' : '#71717a',
                            }}>
                            {isAnswered && icon ? icon : letters[oi]}
                          </span>
                          <span className="leading-relaxed pt-0.5">{opt}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Feedback + Navigation */}
                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <div className={`mt-4 px-4 py-3 rounded-xl text-[13px] leading-relaxed ${
                          isCorrect ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
                        }`}>
                          <strong>{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong> {q.why}
                        </div>
                        <div className="flex gap-3 mt-4">
                          {currentQ > 0 && (
                            <button onClick={() => setCurrentQ(currentQ - 1)}
                              className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-400"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              ← Previous
                            </button>
                          )}
                          <button onClick={handleNext}
                            className={`${currentQ > 0 ? 'flex-1' : 'w-full'} py-3 rounded-xl text-sm font-semibold text-white`}
                            style={{ background: `linear-gradient(135deg, ${currentSet.accent}, ${currentSet.accent}cc)` }}>
                            {currentQ < total - 1 ? 'Next Question →' : allAnswered ? 'See Results →' : 'Next Question →'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Back to topics */}
          <button onClick={() => { setView("home"); setActiveModule(null); }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to topic selection
          </button>
        </div>
      </main>
    );
  }

  // ─── HOME VIEW (Topic Selection + Dashboard) ───
  return (
    <main className="relative min-h-screen">
      <Navbar showBack title="Practice Zone" />
      <XpBar />
      <div className="max-w-3xl mx-auto px-5 pt-20 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-4xl mb-3">🎯</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Practice Zone</h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            50 questions across 5 topics. No timer. No pressure. Just you and your knowledge.
          </p>
          <button onClick={() => { setGuideSeen(false); }} className="text-[10px] text-zinc-600 hover:text-zinc-400 mt-2 transition-colors">
            ℹ️ How this works
          </button>
        </motion.div>

        {/* Readiness Dashboard */}
        {totalAnswered > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-10 p-6 rounded-2xl card-glass">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Gauge */}
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1e1e28" strokeWidth="8" />
                  <motion.circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={readinessColor(overallPct)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${overallPct * 3.14} 314`}
                    initial={{ strokeDasharray: "0 314" }}
                    animate={{ strokeDasharray: `${overallPct * 3.14} 314` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl font-bold"
                    style={{ color: readinessColor(overallPct) }}
                  >
                    {overallPct}%
                  </motion.span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Readiness</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-zinc-300 mb-3">{readinessLabel(overallPct)}</p>
                <div className="flex gap-4 justify-center sm:justify-start text-xs">
                  <div><span className="text-green-400 font-bold">{totalCorrect}</span> <span className="text-zinc-500">correct</span></div>
                  <div><span className="text-red-400 font-bold">{totalAnswered - totalCorrect}</span> <span className="text-zinc-500">wrong</span></div>
                  <div><span className="text-zinc-400 font-bold">{totalQuestions - totalAnswered}</span> <span className="text-zinc-500">remaining</span></div>
                </div>
              </div>
            </div>

            {/* Topic Bars */}
            <div className="mt-6 space-y-3">
              <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Topic Breakdown</h3>
              {practiceSets.map((set) => {
                const ss = setStates[set.moduleId];
                const pct = ss ? Math.round((ss.score / set.questions.length) * 100) : 0;
                const attempted = ss ? ss.answers.filter((a) => a !== null).length > 0 : false;

                return (
                  <div key={set.moduleId} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-28 shrink-0 truncate">{set.moduleTitle}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1e1e28' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: attempted ? `${pct}%` : '0%' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: attempted ? readinessColor(pct) : 'transparent' }}
                      />
                    </div>
                    <span className="text-[11px] font-bold w-10 text-right" style={{ color: attempted ? readinessColor(pct) : '#71717a' }}>
                      {attempted ? `${pct}%` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Smart Suggestions */}
            {(() => {
              const weakTopics = practiceSets.filter((s) => {
                const ss = setStates[s.moduleId];
                return ss && ss.completed && (ss.score / s.questions.length) < 0.6;
              });
              const untried = practiceSets.filter((s) => !setStates[s.moduleId]);

              if (weakTopics.length === 0 && untried.length === 0) return null;

              return (
                <div className="mt-6 pt-4" style={{ borderTop: '1px solid #1e1e28' }}>
                  <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">💡 Suggested Next Steps</h3>
                  <div className="space-y-2">
                    {weakTopics.map((s) => (
                      <a key={s.moduleId} href={`/module/${s.moduleId}`}
                        className="flex items-center gap-3 p-3 rounded-xl text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors"
                        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <span>📖</span>
                        <span>Your {s.moduleTitle} score is low — revisit Module {s.moduleId}</span>
                        <span className="ml-auto text-zinc-600">→</span>
                      </a>
                    ))}
                    {untried.slice(0, 2).map((s) => (
                      <button key={s.moduleId} onClick={() => startQuiz(s.moduleId)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors text-left"
                        style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <span>🎯</span>
                        <span>You haven&apos;t tried {s.moduleTitle} yet</span>
                        <span className="ml-auto text-zinc-600">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* Topic Selection Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">Pick a Topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {practiceSets.map((set, i) => {
              const ss = setStates[set.moduleId];
              const completed = ss?.completed;
              const pct = ss ? Math.round((ss.score / set.questions.length) * 100) : 0;
              const inProgress = ss && !ss.completed;

              return (
                <motion.button
                  key={set.moduleId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ y: -2 }}
                  onClick={() => startQuiz(set.moduleId)}
                  className="relative p-5 rounded-2xl text-left card-glass group overflow-hidden"
                >
                  {/* Accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(90deg, ${set.accent}, transparent)` }} />

                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{set.icon}</div>
                    {completed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${readinessColor(pct)}15`, color: readinessColor(pct) }}>
                        {pct}%
                      </span>
                    )}
                    {inProgress && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200 mb-1">{set.moduleTitle}</h3>
                  <p className="text-[11px] text-zinc-400">{set.questions.length} questions</p>

                  {/* Progress bar for completed/in-progress */}
                  {ss && (
                    <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: '#1e1e28' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${(ss.answers.filter(a => a !== null).length / set.questions.length) * 100}%`,
                        background: completed ? readinessColor(pct) : '#f59e0b',
                      }} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
