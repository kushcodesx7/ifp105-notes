"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function McqQuiz({ topicId, questions, onComplete }: McqQuizProps) {
  const [answered, setAnswered] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const total = questions.length;
  const answeredCount = answered.filter((a) => a !== null).length;

  function handlePick(qi: number, oi: number) {
    if (answered[qi] !== null) return;
    const newAnswered = [...answered];
    newAnswered[qi] = oi;
    setAnswered(newAnswered);

    const correct = questions[qi].ans === oi;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    if (newAnswered.every((a) => a !== null)) {
      setTimeout(() => {
        setShowResult(true);
        onComplete?.(newScore, total);
      }, 800);
    }
  }

  function retry() {
    setAnswered(new Array(questions.length).fill(null));
    setScore(0);
    setShowResult(false);
  }

  const pct = (score / total) * 100;

  return (
    <div className="mt-6 rounded-2xl overflow-hidden" style={{ background: '#151518', border: '1px solid #2a2a33' }}>
      {/* Header */}
      <div className="relative px-5 py-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.15), transparent 60%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-[15px] font-semibold text-white">Test Yourself — Topic {topicId}</h3>
            <p className="text-[11px] text-white/50">{total} questions · instant feedback</p>
          </div>
          <div className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            score >= Math.ceil(total * 0.8)
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-white/10 text-white/80 border-white/15'
          }`}>
            {score} / {total}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4 space-y-3">
        {questions.map((q, qi) => {
          const picked = answered[qi];
          const isCorrect = picked === q.ans;
          const isAnswered = picked !== null;

          return (
            <motion.div
              key={qi}
              animate={
                isAnswered
                  ? isCorrect
                    ? { borderColor: '#22c55e' }
                    : { x: [0, -4, 4, -3, 2, 0], borderColor: '#ef4444' }
                  : {}
              }
              transition={{ duration: 0.3 }}
              className="rounded-xl p-4"
              style={{
                background: isAnswered ? (isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)') : '#1a1a22',
                border: `1px solid ${isAnswered ? (isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)') : '#2a2a33'}`,
              }}
            >
              <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-1.5">
                Question {qi + 1} of {total}
              </div>
              <div className="text-sm font-semibold text-zinc-200 mb-3 leading-relaxed">
                Q{qi + 1}. {q.q}
              </div>

              <div className="space-y-1.5">
                {q.opts.map((opt, oi) => {
                  const isPicked = picked === oi;
                  const isCorrectOpt = q.ans === oi;
                  let optStyle = { bg: '#111116', border: '#2a2a33', color: '#a1a1aa' };

                  if (isAnswered) {
                    if (isPicked && isCorrect) optStyle = { bg: 'rgba(34,197,94,0.1)', border: '#22c55e', color: '#4ade80' };
                    else if (isPicked && !isCorrect) optStyle = { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', color: '#f87171' };
                    else if (isCorrectOpt) optStyle = { bg: 'rgba(34,197,94,0.06)', border: '#22c55e', color: '#4ade80' };
                  }

                  return (
                    <motion.button
                      key={oi}
                      whileHover={!isAnswered ? { x: 4, background: '#1c1c26', borderColor: '#4F46E5' } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      onClick={() => handlePick(qi, oi)}
                      disabled={isAnswered}
                      className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left text-[13px] font-medium transition-colors disabled:cursor-default"
                      style={{ background: optStyle.bg, border: `1px solid ${optStyle.border}`, color: optStyle.color }}
                    >
                      <span
                        className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: isAnswered && (isPicked || isCorrectOpt)
                            ? (isCorrectOpt ? '#22c55e' : '#ef4444')
                            : '#222230',
                          color: isAnswered && (isPicked || isCorrectOpt) ? 'white' : '#71717a',
                        }}
                      >
                        {letters[oi]}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className={`mt-2.5 px-3 py-2.5 rounded-lg text-[12px] leading-relaxed ${
                      isCorrect
                        ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                        : 'bg-red-500/10 text-red-300 border border-red-500/20'
                    }`}
                  >
                    <strong>{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong> {q.why}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-center py-8 px-6"
            style={{ background: 'linear-gradient(135deg, #08080F, #0D0D1F)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className={`text-5xl font-bold mb-2 ${
              pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`} style={{ textShadow: `0 0 24px ${pct >= 80 ? 'rgba(74,222,128,0.3)' : pct >= 60 ? 'rgba(250,204,21,0.3)' : 'rgba(248,113,113,0.3)'}` }}>
              {score}/{total}
            </div>
            <p className="text-sm text-zinc-500 mb-5">
              {pct === 100 ? 'Perfect score! Outstanding! 🎉' :
               pct >= 80 ? 'Excellent — almost perfect 👏' :
               pct >= 60 ? 'Good effort! Re-read the bits you missed 📖' :
               'Keep going — re-read the topic and try again 💪'}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={retry}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}
            >
              Try Again →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
