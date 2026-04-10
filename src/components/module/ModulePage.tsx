"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import LoginPrompt from "@/components/module/LoginPrompt";
import { addXP, XP_REWARDS, earnBadge, updateStreak } from "@/lib/gamification";
import { useAuth } from "@/lib/auth-context";
import { addBookmark, removeBookmark, isBookmarked } from "@/lib/bookmarks";
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

  const { user, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState(1);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [isCheatSheet, setIsCheatSheet] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [useAccordion, setUseAccordion] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [mcqScores, setMcqScores] = useState<Record<number, { score: number; total: number }>>({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const hasShownLoginPrompt = useRef(false);
  const supabaseLoaded = useRef(false);

  // Load localStorage progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setDone(new Set(JSON.parse(saved)));
    } catch {}
  }, [LS_KEY]);

  // Load bookmarks on mount
  useEffect(() => {
    const bm = new Set<number>();
    for (let i = 1; i <= TOTAL_TOPICS; i++) {
      if (isBookmarked(moduleNumber, i)) bm.add(i);
    }
    setBookmarkedTopics(bm);
  }, [moduleNumber, TOTAL_TOPICS]);

  // Save to localStorage
  useEffect(() => {
    if (done.size > 0) localStorage.setItem(LS_KEY, JSON.stringify([...done]));
  }, [done, LS_KEY]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load Supabase progress on mount when logged in (merge with localStorage, Supabase wins)
  useEffect(() => {
    if (!isLoggedIn || !user || supabaseLoaded.current) return;
    supabaseLoaded.current = true;

    async function loadProgress() {
      try {
        const res = await fetch(
          `/api/progress?email=${encodeURIComponent(user!.email)}&module=${moduleNumber}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const remoteProgress = data.progress as Record<
          number,
          { completed: boolean; mcqScore: number | null; mcqTotal: number | null }
        >;

        if (!remoteProgress || Object.keys(remoteProgress).length === 0) return;

        // Merge: Supabase wins on conflict
        setDone((prev) => {
          const merged = new Set(prev);
          for (const [topicIdStr, tp] of Object.entries(remoteProgress)) {
            if (tp.completed) merged.add(Number(topicIdStr));
          }
          return merged;
        });

        // Merge MCQ scores
        const scores: Record<number, { score: number; total: number }> = {};
        for (const [topicIdStr, tp] of Object.entries(remoteProgress)) {
          if (tp.mcqScore !== null && tp.mcqTotal !== null) {
            scores[Number(topicIdStr)] = { score: tp.mcqScore, total: tp.mcqTotal };
          }
        }
        setMcqScores((prev) => ({ ...prev, ...scores }));
      } catch {}
    }

    loadProgress();
  }, [isLoggedIn, user, moduleNumber]);

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

  // Save progress to Supabase
  function saveToSupabase(data: {
    topicId: number;
    completed?: boolean;
    mcqScore?: number;
    mcqTotal?: number;
    challengeAttempted?: boolean;
  }) {
    if (!isLoggedIn || !user) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        moduleNumber,
        ...data,
      }),
      signal: controller.signal,
    }).catch(() => {}).finally(() => clearTimeout(timeout));
  }

  // Handle quiz completion
  function handleQuizComplete(topicId: number, score: number, total: number) {
    setMcqScores((prev) => ({ ...prev, [topicId]: { score, total } }));

    if (isLoggedIn) {
      saveToSupabase({ topicId, mcqScore: score, mcqTotal: total });
    } else {
      // Delay slightly so quiz result screen renders first
      setTimeout(() => {
        setShowLoginPrompt(true);
      }, 1500);
    }
  }

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

    // Save to Supabase if logged in
    if (isLoggedIn) {
      saveToSupabase({ topicId, completed: true });
    }

    if (topicId < TOTAL_TOPICS) {
      setTimeout(() => { switchTab(topicId + 1); }, 400);
    } else {
      // Last topic done — show certificate!
      setTimeout(() => {
        setShowCertificate(true);
        setConfettiTrigger((prev) => prev + 1);
      }, 600);
    }
  }

  function toggleBookmark(topicId: number, topicTitle: string) {
    if (bookmarkedTopics.has(topicId)) {
      removeBookmark(moduleNumber, topicId);
      setBookmarkedTopics((prev) => { const n = new Set(prev); n.delete(topicId); return n; });
      setToast("Bookmark removed");
    } else {
      addBookmark(moduleNumber, topicId, topicTitle);
      setBookmarkedTopics((prev) => new Set([...prev, topicId]));
      setToast("Topic saved!");
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
      <Navbar showBack title={`Module ${moduleNumber}`} moduleNumber={moduleNumber} />

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
        <div role="tablist" aria-label="Topic navigation" className="max-w-5xl mx-auto flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', maskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 40px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 40px), transparent)' }}>
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-bold tracking-tight mb-1.5">{activeTopic.title}</h2>
                    <button
                      onClick={() => toggleBookmark(activeTopic.id, activeTopic.title)}
                      className="shrink-0 mt-0.5 text-lg transition-all hover:scale-110 active:scale-95"
                      title={bookmarkedTopics.has(activeTopic.id) ? "Remove bookmark" : "Save topic"}
                    >
                      {bookmarkedTopics.has(activeTopic.id) ? (
                        <span className="text-amber-400">{"\uD83D\uDD16"}</span>
                      ) : (
                        <span className="text-zinc-600 hover:text-zinc-400">{"\uD83D\uDD16"}</span>
                      )}
                    </button>
                  </div>
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
                  <McqQuiz
                    topicId={activeTab}
                    questions={mcqData[activeTab]}
                    onComplete={(score, total) => handleQuizComplete(activeTab, score, total)}
                  />
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

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-sm font-medium backdrop-blur-xl"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: '#0f0f17', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Celebration header */}
              <div className="text-center pt-8 pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                  className="text-6xl mb-3"
                >
                  {"\uD83C\uDF89"}
                </motion.div>
                <h2 className="text-2xl font-bold mb-1">Congratulations!</h2>
                <p className="text-zinc-400 text-sm">
                  You completed Module {moduleNumber}: {moduleTitle}
                </p>
              </div>

              {/* Certificate card */}
              <div className="mx-6 mb-6 p-6 rounded-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              >
                <div className="absolute inset-0 opacity-5"
                  style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}
                />
                <div className="relative text-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                    Certificate of Completion
                  </div>
                  <div className="text-lg font-bold mb-1" style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Module {moduleNumber}: {moduleTitle}
                  </div>
                  <div className="text-sm text-zinc-300 mb-3">
                    Awarded to <span className="font-semibold text-white">{isLoggedIn && user ? user.name : "Student"}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mb-1">
                    {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-medium">
                    IFP105 &middot; Amity University Tashkent
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 pb-6 space-y-3">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`I just completed Module ${moduleNumber}: ${moduleTitle} on IFP105 Study Notes!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                  style={{ background: '#0A66C2' }}
                >
                  Share on LinkedIn
                </a>
                {moduleNumber < 5 && (
                  <a
                    href={`/module/${moduleNumber + 1}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
                  >
                    Continue to Next Module &rarr;
                  </a>
                )}
                <button
                  onClick={() => setShowCertificate(false)}
                  className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
