"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import TopicRenderer from "@/components/module/TopicRenderer";
import McqQuiz from "@/components/module/McqQuiz";

// These will be populated by the data extraction agents
// For now, import them (files being created in parallel)
import { topics } from "@/data/module1-topics";
import { mcqData } from "@/data/module1-mcq";

const TOTAL_TOPICS = 11;
const LS_KEY = "ifp105_m1_progress";

export default function Module1Page() {
  const [activeTab, setActiveTab] = useState(1);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [isCheatSheet, setIsCheatSheet] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setDone(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Save progress
  useEffect(() => {
    if (done.size > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify([...done]));
    }
  }, [done]);

  function markDone(topicId: number) {
    setDone((prev) => new Set([...prev, topicId]));
    // Go to next topic
    if (topicId < TOTAL_TOPICS) {
      setTimeout(() => { setActiveTab(topicId + 1); setIsCheatSheet(false); }, 400);
    } else {
      setTimeout(() => setIsCheatSheet(true), 400);
    }
  }

  function switchTab(n: number) {
    setIsCheatSheet(false);
    setActiveTab(n);
  }

  const progressPct = (done.size / TOTAL_TOPICS) * 100;
  const activeTopic = topics.find((t) => t.id === activeTab);

  return (
    <main className="relative min-h-screen">
      <Navbar showBack title="Module 1 — Hardware & Software" />

      {/* Hero */}
      <section className="relative pt-14 overflow-hidden" style={{ background: '#08080F' }}>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-indigo-500/15 blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -15, 15, 0], y: [0, 15, -10, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[100px]"
          />
        </div>
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-6 py-16 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-[11px] font-medium text-zinc-400"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            📘 Module 1 · IFP105
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
            Hardware &amp; <span className="gradient-text">Software</span>
            <br />
            <span className="text-zinc-400 text-3xl sm:text-4xl">The Big Picture</span>
          </h1>
          <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed mb-6">
            Everything your computer does — from Netflix to assignments — comes down to
            hardware and software working together.
          </p>
          <div className="inline-flex items-center gap-0 rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { n: "11", l: "Topics" },
              { n: "~55", l: "Minutes" },
              { n: "110", l: "Practice Qs" },
            ].map((s, i) => (
              <div key={s.l} className={`flex flex-col items-center px-6 py-3 ${i > 0 ? 'border-l border-white/[0.06]' : ''}`}>
                <span className="text-lg font-bold text-white">{s.n}</span>
                <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">{s.l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Tab Bar — below hero, sticks to top on scroll */}
      <div
        className="sticky top-14 z-40"
        style={{ background: 'rgba(9,9,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e1e28' }}
      >
        <div className="max-w-5xl mx-auto flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 shrink-0 ${
                activeTab === t.id && !isCheatSheet
                  ? "text-indigo-400 border-indigo-500 bg-indigo-500/5"
                  : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: '18px', height: '18px',
                  fontSize: '9px', fontWeight: 700,
                  background: done.has(t.id) ? '#22c55e' : (activeTab === t.id && !isCheatSheet ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#1e1e28'),
                  color: done.has(t.id) || (activeTab === t.id && !isCheatSheet) ? 'white' : '#71717a',
                  borderRadius: '5px',
                  boxShadow: done.has(t.id) ? '0 0 8px rgba(34,197,94,0.3)' : 'none',
                }}
              >
                {done.has(t.id) ? "✓" : t.id}
              </span>
              {t.title.split("—").pop()?.trim().split("?")[0].substring(0, 18) || `Topic ${t.id}`}
            </button>
          ))}
          <button
            onClick={() => setIsCheatSheet(true)}
            className={`px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 shrink-0 ml-auto ${
              isCheatSheet
                ? "text-violet-400 border-violet-500"
                : "text-zinc-500 border-transparent hover:text-violet-300"
            }`}
          >
            ★ Cheat Sheet
          </button>
          {/* Progress */}
          <div className="flex items-center gap-2 px-4 shrink-0" style={{ borderLeft: '1px solid #1e1e28' }}>
            <span className="text-[11px] font-bold text-indigo-400">{done.size}/{TOTAL_TOPICS}</span>
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e28' }}>
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4F46E5, #818CF8, #7C3AED)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-8">
        <AnimatePresence mode="wait">
          {isCheatSheet ? (
            <motion.div
              key="cheatsheet"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16"
            >
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-2xl font-bold mb-2">Cheat Sheet</h2>
              <p className="text-zinc-500">Cheat sheet coming soon — complete all topics first!</p>
            </motion.div>
          ) : activeTopic ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Topic Header */}
              <div className="flex items-start gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid #1e1e28' }}>
                <div
                  className="w-11 h-11 rounded-[14px] text-base font-bold flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}
                >
                  {activeTopic.id}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight mb-1.5">{activeTopic.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: '#1e1e28', color: '#71717a' }}>
                      ⏱ {activeTopic.time}
                    </span>
                    {activeTopic.badges.map((b) => (
                      <span key={b.text} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{
                        background: b.type === 'star' ? 'rgba(124,58,237,0.12)' : 'rgba(239,68,68,0.12)',
                        color: b.type === 'star' ? '#A78BFA' : '#F87171',
                      }}>
                        {b.type === 'star' ? '⭐' : '🔥'} {b.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hook */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative mb-5 p-5 rounded-r-xl italic text-sm text-zinc-400 leading-[1.9] overflow-hidden [&_strong]:not-italic [&_strong]:text-indigo-300 [&_strong]:font-bold"
                style={{ background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #4F46E5' }}
              >
                <span className="absolute top-[-8px] left-3 text-6xl text-indigo-500/[0.07] font-serif leading-none select-none">"</span>
                <span dangerouslySetInnerHTML={{ __html: activeTopic.hook }} />
              </motion.div>

              {/* Content blocks */}
              <TopicRenderer content={activeTopic.content} />

              {/* MCQ */}
              {mcqData[activeTab] && (
                <McqQuiz
                  topicId={activeTab}
                  questions={mcqData[activeTab]}
                />
              )}

              {/* Done button */}
              {!done.has(activeTab) ? (
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => markDone(activeTab)}
                  className="w-full mt-6 py-4 rounded-xl text-sm font-semibold text-white relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)', boxShadow: '0 4px 16px rgba(79,70,229,0.25)' }}
                >
                  <span className="relative z-10">✓ Mark as Done — next topic</span>
                </motion.button>
              ) : (
                <div className="w-full mt-6 py-4 rounded-xl text-sm font-semibold text-center"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #059669)', color: 'white', opacity: 0.8 }}>
                  ✅ Completed
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
