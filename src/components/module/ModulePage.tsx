"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import TopicRenderer from "@/components/module/TopicRenderer";
import AccordionRenderer from "@/components/module/AccordionRenderer";
import McqQuiz from "@/components/module/McqQuiz";
import XpBar from "@/components/XpBar";
import LoginPrompt from "@/components/module/LoginPrompt";
import StudyStreak from "@/components/module/StudyStreak";
import { updateStreak } from "@/lib/gamification";
import { useAuth } from "@/lib/auth-context";
import { addBookmark, removeBookmark, isBookmarked } from "@/lib/bookmarks";
import { CURRENT_COURSE_SLUG, getCurrentCourse } from "@/lib/course-registry";
import { prettyName } from "@/lib/names";
import { activeTabKey } from "@/lib/storage-keys";
import { useStudentProgress } from "@/lib/use-student-progress";
import type { ContentBlock, Question as CanonicalQuestion } from "@/types/content";

// Heavy widgets split out of the main bundle. Each carries its own data
// (cheatsheets ~22KB, flashcards ~42KB, confetti ~framer-motion use). By
// loading on demand we shave ~70KB off the initial module load — the
// single biggest perf win for 4G mobile in Tashkent.
const CheatSheet = dynamic(() => import("@/components/module/CheatSheet"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12 text-sm text-zinc-400">
      Loading cheat sheet…
    </div>
  ),
});
const Flashcards = dynamic(() => import("@/components/module/Flashcards"), {
  ssr: false,
});
const Confetti = dynamic(() => import("@/components/module/Confetti"), {
  ssr: false,
});

interface Topic {
  id: number;
  title: string;
  time: string;
  badges: { text: string; type: "star" | "hot" }[];
  hook: string;
  content: ContentBlock[];
}

// Use the canonical Question so the shape matches what McqQuiz expects
// (which also now imports from the same source). Before this, ModulePage
// had its own local Question without `bloom`, and TS treated it as a
// different type from McqQuiz's `Question` under the same name.
type Question = CanonicalQuestion;

interface ModulePageProps {
  // courseSlug identifies which course this module belongs to. Used to
  // namespace localStorage keys so that a student studying ICT and
  // Python in the same browser won't see their progress collide.
  // Optional during Phase 2: callers that don't pass it default to
  // the current course (CURRENT_COURSE_SLUG, which today is "ict").
  courseSlug?: string;
  moduleNumber: number;
  moduleTitle: string;
  moduleSubtitle: string;
  moduleDescription: string;
  accentFrom: string;
  accentTo: string;
  orbColor1: string;
  orbColor2: string;
  topics: Topic[];
  // Optional: callers can still pass mcqData eagerly for tests / legacy.
  // Production code path is the dynamic import inside this component
  // (see loadMcqData effect below) — omit this prop and the component
  // splits the bank into its own chunk, saving ~30-50KB gz on first
  // paint for every module.
  mcqData?: Record<number, Question[]>;
  stats: { n: string; l: string }[];
  renderAfterContent?: (topicId: number) => React.ReactNode;
}

export default function ModulePage({
  courseSlug: courseSlugProp,
  moduleNumber,
  moduleTitle,
  moduleSubtitle,
  moduleDescription,
  accentFrom,
  accentTo,
  orbColor1,
  orbColor2,
  topics,
  mcqData: mcqDataProp,
  stats,
  renderAfterContent,
}: ModulePageProps) {
  const courseSlug = courseSlugProp ?? CURRENT_COURSE_SLUG;
  const TOTAL_TOPICS = topics.length;
  // LS keys derived via the central helper so adding a second course
  // later is a one-line change (flip LEGACY_PREFIX in storage-keys.ts
  // to use the slug). Today these still resolve to the exact
  // `ifp105_m{N}_active_tab` string every existing student already
  // has in their browser. The `done` set's LS key now lives inside
  // useStudentProgress.
  const LS_ACTIVE_TAB_KEY = activeTabKey(courseSlug, moduleNumber);

  // getIdToken is still used here for the session-ping (the hook owns
  // the progress save-path's own token check).
  const { user, isLoggedIn, getIdToken } = useAuth();
  // Respect prefers-reduced-motion for the always-on hero orb drift +
  // any other ambient loop in this component. Framer-motion's JS-rAF
  // animations don't auto-respect the CSS media query, so we gate
  // the `animate` props explicitly.
  const reduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isCheatSheet, setIsCheatSheet] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  // "normal" = standard per-topic burst, "module" = bigger celebration
  // when the last topic is marked done. Stored alongside the trigger
  // so the Confetti component can pick the right particle count +
  // banner on each re-fire.
  const [confettiVariant, setConfettiVariant] = useState<"normal" | "module">("normal");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [useAccordion, setUseAccordion] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [mcqAnswerCounts, setMcqAnswerCounts] = useState<Record<number, { answered: number; total: number }>>({});

  // Progress state (done set + remote sync + needsReauth flag) lives
  // in a custom hook now. ModulePage delegates everything that touches
  // localStorage / /api/progress / silent-fail recovery to it.
  // ModulePage just observes the values and pops the LoginPrompt when
  // the hook fires onAuthRequired.
  const {
    done,
    needsReauth,
    setNeedsReauth,
    addDone,
    recordQuiz,
    saveToSupabase,
  } = useStudentProgress({
    courseSlug,
    moduleNumber,
    onAdminResetDetected: () => {
      // Clear per-topic answer-count UI state so the table doesn't
      // still show "7/7 answered" for a freshly-reset topic.
      setMcqAnswerCounts({});
    },
    onAuthRequired: () => {
      // Token missing on a save attempt. Previously popped the
      // LoginPrompt immediately — but saveToSupabase ALSO flips
      // `needsReauth` which renders a big sticky banner at the top
      // of the page. Having both fire at once stacked a modal on
      // top of a banner — confusing UX. Now the banner is the
      // single primary surface; students tap its "Sign in again"
      // button to open the modal on demand. If the banner is for
      // some reason hidden (rare — requires `isLoggedIn && user`
      // but no token), we still fall through to the modal so the
      // student has a path forward.
      if (!isLoggedIn || !user) setShowLoginPrompt(true);
    },
  });

  // MCQ data — either eagerly supplied by the caller (legacy / tests)
  // or dynamically imported at runtime. Dynamic path splits each
  // module's bank into its own chunk, shaving ~30-50KB gz off first
  // paint for every module route.
  const [mcqData, setMcqData] = useState<Record<number, Question[]>>(
    () => mcqDataProp ?? {}
  );
  const [mcqReady, setMcqReady] = useState<boolean>(!!mcqDataProp);
  useEffect(() => {
    if (mcqDataProp) return; // eager path — nothing to fetch
    let alive = true;

    async function load() {
      try {
        const { loadMcqData } = await import("@/data/load-mcq");
        const data = await loadMcqData(moduleNumber);
        if (!alive) return;
        setMcqData(data);
        setMcqReady(true);
      } catch {
        /* retry on the next tick */
      }
    }
    load();

    // Live-class admin deletes: re-pull MCQ data every 15s and on tab
    // focus so a question the teacher removes propagates to student
    // tabs without anyone refreshing. Matches the pattern added to
    // Flashcards. McqQuiz's own fingerprint rehydration realigns
    // saved answers when the question list changes — deleted Q5's
    // answer silently drops, survivors keep theirs.
    const tick = setInterval(load, 15_000);

    const onFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      load();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onFocus);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", onFocus);
    }

    return () => {
      alive = false;
      clearInterval(tick);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onFocus);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onFocus);
      }
    };
  }, [moduleNumber, mcqDataProp]);

  // (Localstorage progress load + persistence + remote Supabase sync
  // all moved into useStudentProgress above.)

  // Restore last viewed topic on mount so refresh stays on same topic
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_ACTIVE_TAB_KEY);
      if (saved) {
        const n = parseInt(saved, 10);
        if (n >= 1 && n <= TOTAL_TOPICS) setActiveTab(n);
      }
    } catch {}
    // Only on mount per module
     
  }, [LS_ACTIVE_TAB_KEY, TOTAL_TOPICS]);

  // Persist active topic when it changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_ACTIVE_TAB_KEY, String(activeTab));
    } catch {}
  }, [activeTab, LS_ACTIVE_TAB_KEY]);

  // Load bookmarks on mount
  useEffect(() => {
    const bm = new Set<number>();
    for (let i = 1; i <= TOTAL_TOPICS; i++) {
      if (isBookmarked(moduleNumber, i)) bm.add(i);
    }
    setBookmarkedTopics(bm);
  }, [moduleNumber, TOTAL_TOPICS]);

  // (LocalStorage save of `done` moved into useStudentProgress.)

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // (Supabase remote load + silent-fail recovery + admin-reset
  // detection all moved into useStudentProgress.)

  // Session ping on mount / logged-in change. Was previously doing
  // double duty and also setting `needsReauth = true` when the user
  // object existed but the in-memory token was null (post-reload, post-
  // token-expiry). That was user-hostile: a student hard-refreshing
  // their module page saw a scary "sign-in expired" banner across the
  // top of the screen before they'd tried to do anything. The banner
  // now fires ONLY when a save is actually attempted (saveToSupabase
  // inside useStudentProgress), so a student who's just browsing
  // sees nothing — matches how the silent-fail recovery was
  // previously tightened.
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setNeedsReauth(false);
      return;
    }
    const token = getIdToken();
    if (!token) {
      // No token → skip the session-ping. Don't flip the banner here.
      return;
    }
    // If we have a valid token we also clear any lingering banner
    // from an earlier save failure — the student just re-authed.
    setNeedsReauth(false);
    // Fire-and-forget; ping failure isn't user-visible. Includes the
    // current page path so the admin live-class-digest can show
    // *where* each student is, not just *that* they're active.
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : null;
    fetch("/api/session/ping", {
      method: "POST",
      headers: {
        "x-id-token": token,
        "Content-Type": "application/json",
      },
      // Skip caches — the whole point is recording fresh activity.
      cache: "no-store",
      body: JSON.stringify({ currentPath }),
    }).catch(() => {});
  }, [isLoggedIn, user, getIdToken]);

  // Reading progress bar — rAF-throttled so setState fires at most once per frame
  useEffect(() => {
    let rafId = 0;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          setScrollProgress(Math.min(scrollTop / docHeight, 1));
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Reset scroll progress when switching topics
  useEffect(() => {
    setScrollProgress(0);
  }, [activeTab]);

  // Keyboard navigation: left/right arrows to switch tabs
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't hijack arrows when the user is typing in a field. This
      // already covered inputs/textareas; also guard contenteditable
      // (rich-text admin editors) and select elements so cursor-based
      // navigation inside those still works.
      const t = e.target as HTMLElement | null;
      if (
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLInputElement ||
        t instanceof HTMLSelectElement ||
        t?.isContentEditable
      )
        return;
      if (e.key === "ArrowRight" && activeTab < TOTAL_TOPICS) switchTab(activeTab + 1);
      if (e.key === "ArrowLeft" && activeTab > 1) switchTab(activeTab - 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, TOTAL_TOPICS]);

  // (saveToSupabase moved into useStudentProgress hook.)

  // Handle quiz completion. Persistence is delegated to the hook;
  // the only local concern is showing the LoginPrompt for non-logged-in
  // students (the hook already pops it for logged-in-but-no-token).
  function handleQuizComplete(
    topicId: number,
    score: number,
    total: number,
    bloomStats?: Partial<Record<string, { correct: number; total: number }>>,
    confidenceStats?: { rated: number; confidentWrong: number; humbleRight: number }
  ) {
    if (isLoggedIn) {
      recordQuiz(topicId, score, total, bloomStats, confidenceStats);
    } else {
      // Delay slightly so quiz result screen renders first
      setTimeout(() => {
        setShowLoginPrompt(true);
      }, 1500);
    }
  }

  // Incremental bloom + calibration save — fires on every quiz answer
  // so the student's home-page thinking profile unlocks after their
  // FIRST question, not only after they click through the full results
  // screen. Debounced via a trailing 1.2s window so a student
  // answering 5 questions in quick succession only triggers one server
  // write. We intentionally do NOT send mcqScore/mcqTotal/completed —
  // those stay reserved for handleQuizComplete's final save, so a
  // partial quiz never shows up as "75% Module 3 Topic 1" on the
  // home page card. See /api/progress (bloom_stats-only upsert path).
  //
  // Cross-topic flush: the ref-backed debounce slot is SHARED across
  // topics (only one quiz mounts at a time, but switching topics
  // unmounts+remounts and the ref survives). So if the student
  // answers Topic 1 Q3, switches to Topic 2, and answers Q1 within
  // 1.2s, the pending Topic 1 save would otherwise be replaced with
  // Topic 2's and never fire. We detect the topic change and flush
  // the pending save synchronously BEFORE queueing the new one.
  //
  // Unmount flush: leaving the module page (router navigation, not a
  // hard reload) also needs to flush the pending save, otherwise the
  // last answer's bloom data never reaches the server.
  type BloomPayload = Parameters<typeof saveToSupabase>[0]["bloomStats"];
  type ConfidencePayload = Parameters<typeof saveToSupabase>[0]["confidenceStats"];
  const incrementalSaveRef = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    lastTopicId: number | null;
    lastBloom: BloomPayload | null;
    lastConfidence: ConfidencePayload | null;
  }>({ timer: null, lastTopicId: null, lastBloom: null, lastConfidence: null });

  // Synchronously fire the pending save (if any) for whatever topic
  // is currently parked in the ref. Used by both the cross-topic
  // flush path and the unmount-cleanup effect.
  const flushIncrementalSave = useCallback(() => {
    const slot = incrementalSaveRef.current;
    if (slot.timer) {
      clearTimeout(slot.timer);
      slot.timer = null;
    }
    if (slot.lastTopicId == null) return;
    saveToSupabase({
      topicId: slot.lastTopicId,
      bloomStats: slot.lastBloom ?? undefined,
      confidenceStats: slot.lastConfidence ?? undefined,
    });
    slot.lastTopicId = null;
    slot.lastBloom = null;
    slot.lastConfidence = null;
  }, [saveToSupabase]);

  const handleAnswerProgress = useCallback(
    (
      topicId: number,
      bloomStats: BloomPayload,
      confidenceStats: ConfidencePayload
    ) => {
      if (!isLoggedIn) return; // anonymous users save nothing — LoginPrompt covers them on completion
      const slot = incrementalSaveRef.current;
      // If a save is queued for a DIFFERENT topic, flush it first so
      // we don't silently lose the student's Topic 1 progress when
      // they start answering Topic 2.
      if (
        slot.timer &&
        slot.lastTopicId != null &&
        slot.lastTopicId !== topicId
      ) {
        flushIncrementalSave();
      }
      slot.lastTopicId = topicId;
      slot.lastBloom = bloomStats;
      slot.lastConfidence = confidenceStats;
      if (slot.timer) clearTimeout(slot.timer);
      slot.timer = setTimeout(() => {
        if (slot.lastTopicId == null) return;
        saveToSupabase({
          topicId: slot.lastTopicId,
          bloomStats: slot.lastBloom ?? undefined,
          confidenceStats: slot.lastConfidence ?? undefined,
        });
        slot.timer = null;
      }, 1200);
    },
    [isLoggedIn, saveToSupabase, flushIncrementalSave]
  );

  // Unmount flush: if the student navigates away before the 1.2s
  // debounce fires, make sure the last answer still reaches the DB.
  useEffect(() => {
    return () => {
      flushIncrementalSave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markDone(topicId: number) {
    // addDone updates the `done` Set AND fires the remote save.
    addDone(topicId);
    // Phase 1 gamification: streak only. XP and badges were dropped
    // per product decision; updateStreak() is now the single
    // side-effect on every topic completion.
    updateStreak();
    // Per-topic celebration. Module-tier celebration (bigger burst +
    // "MODULE COMPLETE" banner) is reserved for the last topic.
    const isLast = topicId >= TOTAL_TOPICS;
    setConfettiVariant(isLast ? "module" : "normal");
    setConfettiTrigger((prev) => prev + 1);

    // (Save to Supabase happens inside addDone via the hook.)
    if (isLoggedIn) {
      // No-op block kept so the existing "if (!isLast)" / "else" flow
      // below stays intact at the same line numbers — easier to diff
      // against the previous version.
      void 0;
    }

    if (!isLast) {
      setTimeout(() => { switchTab(topicId + 1); }, 400);
    } else {
      // Last topic done — show certificate after the banner has had
      // time to breathe.
      setTimeout(() => {
        setShowCertificate(true);
      }, 1400);
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
    <main id="main-content" className="relative min-h-screen">
      <Confetti trigger={confettiTrigger} variant={confettiVariant} />
      <XpBar />
      <Navbar showBack title={`Module ${moduleNumber}`} moduleNumber={moduleNumber} />

      {/* Reading progress bar — pinned directly under the 56px navbar.
           Lower z than the sticky tab bar's background so the bar sits
           between them visually instead of bleeding into the tab pills. */}
      <motion.div
        className="fixed left-0 h-[2px] z-30 pointer-events-none"
        style={{
          top: "3.5rem",
          width: `${scrollProgress * 100}%`,
          background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
          boxShadow: `0 0 8px ${accentFrom}60`,
        }}
      />

      {/* Re-auth banner — surfaces the "user-restored-from-localStorage
           but token is gone" state that otherwise silently swallows
           every Mark-as-done into local-only state. Without this, the
           student sees their topic count fill but admin sees Never +
           0/N because nothing reaches the DB. */}
      {needsReauth && (
        <div
          className="sticky z-40 px-4 py-2.5 text-center text-[12px] font-semibold flex items-center justify-center gap-3"
          style={{
            top: "3.5rem",
            background: "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(245,158,11,0.18))",
            borderBottom: "1px solid rgba(249,115,22,0.3)",
            color: "#FCD34D",
            backdropFilter: "blur(12px)",
          }}
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">⚠️</span>
          <span>
            Your sign-in expired — your progress isn&apos;t syncing.
          </span>
          <button
            onClick={() => setShowLoginPrompt(true)}
            className="text-[11px] font-bold px-3 py-1 rounded-full text-white"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
            }}
          >
            Sign in again
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="relative pt-14 overflow-hidden" style={{ background: '#08080F' }}>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={reduceMotion ? undefined : { x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: orbColor1 }}
          />
          <motion.div
            animate={reduceMotion ? undefined : { x: [0, -15, 15, 0], y: [0, 15, -10, 0] }}
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
            📘 Module {moduleNumber} · {getCurrentCourse().code}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
            <span style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {moduleTitle}
            </span>
            <br />
            <span className="text-zinc-400 text-3xl sm:text-4xl">{moduleSubtitle}</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">{moduleDescription}</p>
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
        <div data-tour="tab-bar" role="tablist" aria-label="Topic navigation" className="max-w-5xl mx-auto flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', maskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 40px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 40px), transparent)' }}>
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
              {/* Tabs bar already scrolls horizontally — give titles
                   28 chars before truncating (was 20, which cut "What
                   is Social Media?" mid-word). Real-ellipsis character
                   reads cleaner than three dots. */}
              {t.title.length > 28 ? `${t.title.substring(0, 27)}…` : t.title}
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
          <div data-tour="progress" className="flex items-center gap-2 px-4 shrink-0" style={{ borderLeft: '1px solid #1e1e28' }}>
            <StudyStreak />
            <span className="text-[11px] font-bold" style={{ color: accentFrom }}>{done.size}/{TOTAL_TOPICS}</span>
            <div
              role="progressbar"
              aria-valuenow={done.size}
              aria-valuemin={0}
              aria-valuemax={TOTAL_TOPICS}
              aria-label={`Module ${moduleNumber} progress: ${done.size} of ${TOTAL_TOPICS} topics complete`}
              className="w-16 h-1.5 rounded-full overflow-hidden"
              style={{ background: '#1e1e28' }}
            >
              <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-8 pb-24">
        <AnimatePresence mode="wait">
          {isCheatSheet ? (
            <motion.div key="cheatsheet" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <CheatSheet
                moduleNumber={moduleNumber}
                accentFrom={accentFrom}
                accentTo={accentTo}
              />
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

              <div data-tour="topic-content">
                <ErrorBoundary>
                  {useAccordion ? (
                    <AccordionRenderer content={activeTopic.content} />
                  ) : (
                    <TopicRenderer content={activeTopic.content} />
                  )}
                </ErrorBoundary>
              </div>

              {/* Flashcards — component is lazy-loaded via next/dynamic above,
                   and it resolves its own cards from the (module, topic) pair. */}
              <Flashcards
                moduleNumber={moduleNumber}
                topicId={activeTab}
                title={`Quick Review — ${activeTopic.title.substring(0, 30)}`}
              />

              {renderAfterContent && renderAfterContent(activeTab)}

              {/* While the lazy chunk is fetching, show a compact skeleton
                   so the topic doesn't visually end mid-scroll. Once
                   mcqReady flips true, the real quiz slots in. If a
                   topic happens to have no MCQs, nothing renders here
                   (the dynamic check below falls through). */}
              {!mcqReady ? (
                <div
                  className="my-6 rounded-2xl animate-pulse"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    minHeight: 180,
                  }}
                  aria-busy="true"
                  aria-label="Loading quiz"
                />
              ) : mcqData[activeTab] ? (
                <div data-tour="quiz-section">
                <ErrorBoundary>
                  <McqQuiz
                    topicId={activeTab}
                    moduleNumber={moduleNumber}
                    questions={mcqData[activeTab]}
                    onComplete={(score, total, bloomStats, confidenceStats) =>
                      handleQuizComplete(activeTab, score, total, bloomStats, confidenceStats)
                    }
                    onAnswerCountChange={(answered, total) => {
                      setMcqAnswerCounts(prev => ({ ...prev, [activeTab]: { answered, total } }));
                    }}
                    onAnswerProgress={(bloomStats, confidenceStats) =>
                      handleAnswerProgress(activeTab, bloomStats, confidenceStats)
                    }
                  />
                </ErrorBoundary>
                </div>
              ) : null}

              {(() => {
                const topicMcq = mcqAnswerCounts[activeTab];
                const hasMcq = !!mcqData[activeTab];
                const allMcqAnswered = !hasMcq || (topicMcq && topicMcq.answered === topicMcq.total);
                const mcqRemaining = hasMcq && topicMcq ? topicMcq.total - topicMcq.answered : 0;

                if (done.has(activeTab)) {
                  const isLast = activeTab >= TOTAL_TOPICS;
                  return (
                    <motion.button
                      whileHover={{ scale: isLast ? 1 : 1.01, y: isLast ? 0 : -1 }}
                      whileTap={{ scale: isLast ? 1 : 0.98 }}
                      onClick={() => {
                        if (isLast) {
                          setShowCertificate(true);
                        } else {
                          switchTab(activeTab + 1);
                        }
                      }}
                      className="w-full mt-6 py-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #16a34a, #059669)', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}
                    >
                      ✅ Completed
                      <span className="opacity-70">·</span>
                      {isLast ? "View certificate →" : "Next topic →"}
                    </motion.button>
                  );
                }

                if (!allMcqAnswered) {
                  return (
                    <div className="w-full mt-6">
                      <button
                        disabled
                        className="w-full py-4 rounded-xl text-sm font-semibold text-zinc-400 cursor-not-allowed"
                        style={{ background: '#1a1a22', border: '1px solid #2a2a33' }}
                      >
                        🔒 Answer all questions to complete this topic
                      </button>
                      <p className="text-center text-[11px] text-zinc-500 mt-2">
                        {topicMcq ? `${topicMcq.answered}/${topicMcq.total} questions answered` : "Answer the quiz below first"} — {mcqRemaining} remaining
                      </p>
                    </div>
                  );
                }

                return (
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => markDone(activeTab)}
                    className="w-full mt-6 py-4 rounded-xl text-sm font-semibold text-white relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`, boxShadow: `0 4px 16px ${accentFrom}40` }}
                  >
                    ✓ Mark as Done — next topic
                  </motion.button>
                );
              })()}
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
                    {/* prettyName strips the "453_" roll-prefix that
                        registration bakes into user.name so the
                        certificate shows "Kush" not "453_kush". */}
                    Awarded to{" "}
                    <span className="font-semibold text-white">
                      {isLoggedIn && user ? prettyName(user.name) : "Student"}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mb-1">
                    {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-medium">
                    {getCurrentCourse().code} &middot; Amity University Tashkent
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 pb-6 space-y-3">
                {/* LinkedIn share — copies a pre-written celebratory
                    caption to the clipboard, then opens the share
                    dialog with the real module URL. LinkedIn removed
                    the `summary` URL parameter in 2021, so the only
                    reliable way to pre-fill a post is the clipboard
                    trick. Most students see the paste suggestion
                    automatically once LinkedIn's composer opens. */}
                <button
                  onClick={async () => {
                    // Caption content choices (why each line says what
                    // it says): module NUMBER only (no title — keeps
                    // the line scannable); no IFP105 tag (course code
                    // is internal, student audience prefers the
                    // human-readable "ICT Fundamentals"); teacher
                    // mentioned via #KushagraTripathi because pasted
                    // @-mentions don't auto-link on LinkedIn, only
                    // hashtags do; no site URL — the notes aren't a
                    // public resource we want indexed by strangers.
                    // Prefer the student's clean display name
                    // ("Kush") over the registration handle
                    // ("453_kush"). Users explicitly asked for this —
                    // their LinkedIn network sees "Kush has completed
                    // Module 1" not a raw roll-prefixed token.
                    // Falls back to an empty string if no user is
                    // logged in; the caption then reads naturally
                    // without a dangling "— —" line.
                    const studentName =
                      isLoggedIn && user ? prettyName(user.name) : "";
                    const signoff = studentName
                      ? `— ${studentName}`
                      : "";
                    const caption = [
                      `I just completed Module ${moduleNumber} in ICT Fundamentals at Amity University Tashkent! 🎓`,
                      "",
                      `Huge thanks to our professor Kushagra Tripathi for the interactive study notes — quizzes, flashcards, Bloom's Taxonomy tracking, and a learning flow that actually sticks.`,
                      ...(signoff ? ["", signoff] : []),
                      "",
                      `#KushagraTripathi #AmityTashkent #ICTFundamentals #LearningInPublic`,
                    ].join("\n");

                    try {
                      await navigator.clipboard.writeText(caption);
                      setToast("Caption copied — paste it on LinkedIn ✨");
                    } catch {
                      // Clipboard API can fail (old iOS Safari, etc.).
                      // Still open LinkedIn — student can type manually.
                      setToast("Opening LinkedIn — type your caption");
                    }

                    // Open LinkedIn's composer directly (no URL
                    // attached to the post). The user explicitly
                    // doesn't want the notes site previewed on
                    // LinkedIn — so we skip the share-offsite
                    // endpoint and land them on the feed instead.
                    // With the caption already in their clipboard,
                    // "Start a post" → paste is the full flow.
                    setTimeout(() => {
                      window.open(
                        "https://www.linkedin.com/feed/?shareActive=true",
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }, 250);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                  style={{ background: "#0A66C2" }}
                >
                  <span aria-hidden="true">📋</span>
                  Share on LinkedIn
                </button>
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
