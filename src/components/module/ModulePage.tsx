"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import TopicRenderer from "@/components/module/TopicRenderer";
import AccordionRenderer from "@/components/module/AccordionRenderer";
import McqQuiz from "@/components/module/McqQuiz";
import Confetti from "@/components/module/Confetti";
import XpBar from "@/components/XpBar";
import CheatSheet from "@/components/module/CheatSheet";
import Flashcards from "@/components/module/Flashcards";
import { addXP, XP_REWARDS, earnBadge, updateStreak } from "@/lib/gamification";
import { cheatsheets } from "@/data/cheatsheets";
import { flashcardData } from "@/data/flashcards";

interface Topic {
  id: number;
  title: string;
  time: string;
  badges: { text: string; type: "star" | "hot" }[];
  hook: string;
  content: any[];
}

interface Question {
  q: string;
  opts: string[];
  ans: number;
  why: string;
}

interface ModulePageProps {
  moduleNumber: number;
  moduleTitle: string;
  moduleSubtitle: string;
  moduleDescription: string;
  accentFrom: string;
  accentTo: string;
  orbColor1: string;
  orbColor2: string;
  topics: Topic[];
  mcqData: Record<number, Question[]>;
  stats: { n: string; l: string }[];
  renderAfterContent?: (topicId: number) => React.ReactNode;
}

export default function ModulePage({
  moduleNumber,
  moduleTitle,
  moduleSubtitle,
  moduleDescription,
  accentFrom,
  accentTo,
  orbColor1,
  orbColor2,
  topics,
  mcqData,
  stats,
  renderAfterContent,
}: ModulePageProps) {
  const TOTAL_TOPICS = topics.length;
  const LS_KEY = `ifp105_m${moduleNumber}_progress`;

  const [activeTab, setActiveTab] = useState(1);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [isCheatSheet, setIsCheatSheet] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [useAccordion, setUseAccordion] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setDone(new Set(JSON.parse(saved)));
    } catch {}
  }, [LS_KEY]);

  useEffect(() => {
    if (done.size > 0) localStorage.setItem(LS_KEY, JSON.stringify([...done]));
  }, [done, LS_KEY]);

  // Reading progress bar
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setScrollProgress(Math.min(scrollTop / docHeight, 1));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset scroll progress when switching topics
  useEffect(() => {
    setScrollProgress(0);
  }, [activeTab]);

  // Keyboard navigation: left/right arrows to switch tabs
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" && activeTab < TOTAL_TOPICS) switchTab(activeTab + 1);
      if (e.key === "ArrowLeft" && activeTab > 1) switchTab(activeTab - 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, TOTAL_TOPICS]);

  function markDone(topicId: number) {
    setDone((prev) => {
      const next = new Set([...prev, topicId]);
      // XP rewards
      addXP(XP_REWARDS.TOPIC_DONE);
      updateStreak();
      // Badges
      if (next.size === 1) earnBadge("first_topic");
      if (next.size === TOTAL_TOPICS) earnBadge("module_done");
      if (next.size >= 25) earnBadge("halfway");
      return next;
    });
    setConfettiTrigger((prev) => prev + 1);
    if (topicId < TOTAL_TOPICS) {
      setTimeout(() => { switchTab(topicId + 1); }, 400);
    } else {
      setTimeout(() => setIsCheatSheet(true), 400);
    }
  }

  function switchTab(n: number) {
    setDirection(n > activeTab ? 1 : -1);
    setIsCheatSheet(false);
    setActiveTab(n);
    // Scroll to top of content area (just below the tab bar)
    setTimeout(() => {
      const tabBar = document.querySelector('[role="tablist"]');
      if (tabBar) {
        const top = tabBar.getBoundingClientRect().bottom + window.scrollY - 56;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
      }
    }, 50);
  }

  const progressPct = (done.size / TOTAL_TOPICS) * 100;
  const activeTopic = topics.find((t) => t.id === activeTab);

  return (
    <main className="relative min-h-screen">
      <Confetti trigger={confettiTrigger} />
      <XpBar />
      <Navbar showBack title={`Module ${moduleNumber} — ${moduleTitle}`} />

      {/* Reading progress bar */}
      <motion.div
        className="fixed top-14 left-0 h-[2px] z-50 pointer-events-none"
        style={{
          width: `${scrollProgress * 100}%`,
          background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
          boxShadow: `0 0 8px ${accentFrom}60`,
        }}
      />

      {/* Hero */}
      <section className="relative pt-14 overflow-hidden" style={{ background: '#08080F' }}>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: orbColor1 }}
          />
          <motion.div
            animate={{ x: [0, -15, 15, 0], y: [0, 15, -10, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] left-[15%] w-[300px] h-[300px] rounded-full blur-[100px]"
            style={{ background: orbColor2 }}
          />
        </div>
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-6 py-10 sm:py-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-[11px] font-medium text-zinc-400"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            📘 Module {moduleNumber} · IFP105
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
            <span style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {moduleTitle}
            </span>
            <br />
            <span className="text-zinc-400 text-3xl sm:text-4xl">{moduleSubtitle}</span>
          </h1>
          <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed mb-6">{moduleDescription}</p>
          <div className="inline-flex items-center gap-0 rounded-xl overflow-hidden inner-glow"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {stats.map((s, i) => (
              <div key={s.l} className={`flex flex-col items-center px-6 py-3 ${i > 0 ? 'border-l border-white/[0.06]' : ''}`}>
                <span className="text-lg font-bold text-white">{s.n}</span>
                <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">{s.l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Tab Bar */}
      <div className="sticky top-14 z-40" style={{ background: 'rgba(9,9,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e1e28' }}>
        <div role="tablist" aria-label="Topic navigation" className="max-w-5xl mx-auto flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {topics.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id && !isCheatSheet}
              onClick={() => switchTab(t.id)}
              title={t.title}
              className={`relative flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                activeTab === t.id && !isCheatSheet
                  ? "text-indigo-400 bg-indigo-500/5"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              {/* Sliding tab indicator */}
              {activeTab === t.id && !isCheatSheet && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="flex items-center justify-center shrink-0" style={{
                width: '18px', height: '18px', fontSize: '9px', fontWeight: 700,
                background: done.has(t.id) ? '#22c55e' : (activeTab === t.id && !isCheatSheet ? `linear-gradient(135deg, ${accentFrom}, ${accentTo})` : '#1e1e28'),
                color: done.has(t.id) || (activeTab === t.id && !isCheatSheet) ? 'white' : '#71717a',
                borderRadius: '5px',
                boxShadow: done.has(t.id) ? '0 0 8px rgba(34,197,94,0.3)' : 'none',
              }}>
                {done.has(t.id) ? "✓" : t.id}
              </span>
              {t.title.substring(0, 20)}{t.title.length > 20 ? '...' : ''}
            </button>
          ))}
          <button
            onClick={() => setIsCheatSheet(true)}
            className={`relative px-3 py-3 text-xs font-semibold whitespace-nowrap shrink-0 ml-auto ${
              isCheatSheet ? "text-violet-400" : "text-zinc-500 hover:text-violet-300"
            }`}
          >
            {isCheatSheet && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, #8B5CF6, #7C3AED)' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            ★ Cheat Sheet
          </button>
          <div className="flex items-center gap-2 px-4 shrink-0" style={{ borderLeft: '1px solid #1e1e28' }}>
            <span className="text-[11px] font-bold" style={{ color: accentFrom }}>{done.size}/{TOTAL_TOPICS}</span>
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e28' }}>
              <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-8">
        <AnimatePresence mode="wait">
          {isCheatSheet ? (
            <motion.div key="cheatsheet" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              {cheatsheets.find(c => c.moduleId === moduleNumber) ? (
                <CheatSheet data={cheatsheets.find(c => c.moduleId === moduleNumber)!} accentFrom={accentFrom} accentTo={accentTo} />
              ) : (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">📋</div>
                  <h2 className="text-2xl font-bold mb-2">Cheat Sheet</h2>
                  <p className="text-zinc-500">Coming soon!</p>
                </div>
              )}
            </motion.div>
          ) : activeTopic ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Topic Header */}
              <div className="flex items-start gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid #1e1e28' }}>
                <div className="w-11 h-11 rounded-[14px] text-base font-bold flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`, boxShadow: `0 4px 12px ${accentFrom}40` }}>
                  {activeTopic.id}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight mb-1.5">{activeTopic.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: '#1e1e28', color: '#71717a' }}>⏱ {activeTopic.time}</span>
                    {activeTopic.badges.map((b) => (
                      <span key={b.text} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{
                        background: b.type === 'star' ? 'rgba(124,58,237,0.12)' : 'rgba(239,68,68,0.12)',
                        color: b.type === 'star' ? '#A78BFA' : '#F87171',
                      }}>{b.type === 'star' ? '⭐' : '🔥'} {b.text}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hook */}
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="relative mb-5 p-5 rounded-r-xl italic text-sm text-zinc-400 leading-[1.9] overflow-hidden [&_strong]:not-italic [&_strong]:font-bold"
                style={{ background: `${accentFrom}10`, borderLeft: `3px solid ${accentFrom}` }}>
                <span className="absolute top-[-8px] left-3 text-6xl font-serif leading-none select-none" style={{ color: `${accentFrom}12` }}>&ldquo;</span>
                <span className="[&_strong]:text-indigo-300" dangerouslySetInnerHTML={{ __html: activeTopic.hook }} />
              </motion.div>

              {/* View mode toggle */}
              <div className="flex items-center justify-end mb-2">
                <button
                  onClick={() => setUseAccordion(!useAccordion)}
                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]"
                >
                  {useAccordion ? "📖 Full View" : "📋 Section View"}
                </button>
              </div>

              <ErrorBoundary>
                {useAccordion ? (
                  <AccordionRenderer content={activeTopic.content} />
                ) : (
                  <TopicRenderer content={activeTopic.content} />
                )}
              </ErrorBoundary>

              {/* Flashcards */}
              {flashcardData[moduleNumber]?.[activeTab] && (
                <Flashcards cards={flashcardData[moduleNumber][activeTab]} title={`Quick Review — ${activeTopic.title.substring(0, 30)}`} />
              )}

              {renderAfterContent && renderAfterContent(activeTab)}

              {mcqData[activeTab] && (
                <ErrorBoundary>
                  <McqQuiz topicId={activeTab} questions={mcqData[activeTab]} />
                </ErrorBoundary>
              )}

              {!done.has(activeTab) ? (
                <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => markDone(activeTab)}
                  className="w-full mt-6 py-4 rounded-xl text-sm font-semibold text-white relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`, boxShadow: `0 4px 16px ${accentFrom}40` }}>
                  ✓ Mark as Done — next topic
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
