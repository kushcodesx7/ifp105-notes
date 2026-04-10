"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ModuleCard from "@/components/ModuleCard";
import { useAuth } from "@/lib/auth-context";
import { getBookmarks, removeBookmark, type Bookmark } from "@/lib/bookmarks";

const modules = [
  {
    number: "01",
    title: "Hardware & Software",
    description: "CPU, RAM, ROM, I/O devices, storage, software types, internet basics — the foundation of everything.",
    icon: "\u{1F5A5}\uFE0F",
    href: "/module/1",
    accent: "#6366F1",
    tags: ["11 Topics", "~55 min", "110 Qs"],
    lsKey: "ifp105_m1_progress",
    totalTopics: 11,
  },
  {
    number: "02",
    title: "Office Automation",
    description: "MS Word, Excel, and PowerPoint — editing, formatting, formulas, charts, presentations, and slide shows.",
    icon: "\u{1F4CA}",
    accent: "#10B981",
    tags: ["9 Topics", "~45 min", "90 Qs"],
    locked: true,
    totalTopics: 9,
  },
  {
    number: "03",
    title: "Social Media Foundation",
    description: "Social media platforms, management tools, measurement & reporting, advertising, Facebook & Twitter marketing.",
    icon: "\u{1F4F1}",
    accent: "#3B82F6",
    tags: ["7 Topics", "~35 min", "70 Qs"],
    locked: true,
    totalTopics: 7,
  },
  {
    number: "04",
    title: "HTML & Web Development",
    description: "Build web pages from scratch. Tags, elements, attributes, tables, lists, links, images — with a live playground.",
    icon: "\u{1F310}",
    href: "/module/4",
    accent: "#06B6D4",
    tags: ["11 Topics", "Interactive"],
    lsKey: "ifp105_m4_progress",
    totalTopics: 11,
  },
  {
    number: "05",
    title: "Latest Technology Trends",
    description: "AI, Machine Learning, Cloud, Blockchain, VR/AR, IoT, Generative AI — understand the technologies shaping our future.",
    icon: "\u{1F680}",
    href: "/module/5",
    accent: "#8B5CF6",
    tags: ["10 Topics", "~50 min", "100 Qs"],
    lsKey: "ifp105_m5_progress",
    totalTopics: 10,
  },
];

const features = [
  { icon: "\u{1F9E0}", title: "Analogies That Stick", desc: "Every concept explained with real-world analogies. Pizza = IPO cycle. Kitchen counter = RAM." },
  { icon: "\u2705", title: "10 Qs Per Topic", desc: "Instant feedback on every answer. Know what you got wrong and why \u2014 before the exam." },
  { icon: "\u{1F4CA}", title: "Track Progress", desc: "Your progress is saved locally. Pick up where you left off, anytime." },
  { icon: "\u{1F4CB}", title: "Cheat Sheets", desc: "One-page summary of every module. Perfect for last-minute revision." },
  { icon: "\u26A1", title: "Mobile First", desc: "Study on your phone, tablet, or laptop. The layout adapts perfectly." },
  { icon: "\u{1F513}", title: "100% Free", desc: "No ads, no paywalls, no sign-ups. Just open the link and start studying." },
];

// Topic titles for continue learning
const MODULE_TOPICS: Record<number, string[]> = {
  1: ["Why Did We Even Invent Computers?", "How Computers Grew Up", "How Every Computer Works (IPO)", "The CPU", "Memory (RAM & ROM)", "Input Devices", "Output Devices", "Storage Devices", "Types of Software", "Internet Basics", "Internet Applications"],
  4: ["World Wide Web", "HTML & Basic Tags", "HTML Elements", "HTML Attributes", "HTML Comments", "HTML Formatting", "HTML Tables", "HTML Lists", "Hyperlinks", "Images & Image Links", "Build a Full Page"],
  5: ["Artificial Intelligence", "Machine Learning", "Data Analytics", "Cloud Computing", "Blockchain", "Virtual Reality", "Augmented Reality", "Internet of Things", "Generative AI", "Ethical Use of GPTs"],
};

interface ContinueData {
  moduleNumber: number;
  moduleTitle: string;
  topicTitle: string;
  topicId: number;
  done: number;
  total: number;
  href: string;
  accent: string;
}

// Quick Challenge questions
const quizQuestions = [
  {
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"],
    answer: 0,
  },
  {
    question: "Which HTML tag makes text bold?",
    options: ["<strong>", "<em>", "<h1>", "<br>"],
    answer: 0,
  },
  {
    question: "What does AI stand for?",
    options: ["Automatic Integration", "Artificial Intelligence", "Advanced Interface", "Applied Informatics"],
    answer: 1,
  },
  {
    question: "RAM is a type of ___?",
    options: ["Storage", "Memory", "Processor", "Software"],
    answer: 1,
  },
  {
    question: "Who invented the World Wide Web?",
    options: ["Steve Jobs", "Bill Gates", "Tim Berners-Lee", "Mark Zuckerberg"],
    answer: 2,
  },
];

export default function Home() {
  const { user, isLoggedIn } = useAuth();
  const [continueData, setContinueData] = useState<ContinueData | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Quick quiz state
  const [quizIndex] = useState(() => Math.floor(Math.random() * quizQuestions.length));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const currentQuiz = quizQuestions[quizIndex];

  useEffect(() => {
    // Find the most recent module with partial progress
    const progressEntries: ContinueData[] = [];

    for (const mod of modules) {
      if (mod.locked || !mod.lsKey) continue;
      try {
        const saved = localStorage.getItem(mod.lsKey);
        if (saved) {
          const done = new Set(JSON.parse(saved));
          const moduleNum = parseInt(mod.number);
          if (done.size > 0 && done.size < mod.totalTopics) {
            // Find next incomplete topic
            const topics = MODULE_TOPICS[moduleNum] || [];
            let nextTopicId = 1;
            for (let i = 1; i <= mod.totalTopics; i++) {
              if (!done.has(i)) { nextTopicId = i; break; }
            }
            progressEntries.push({
              moduleNumber: moduleNum,
              moduleTitle: mod.title,
              topicTitle: topics[nextTopicId - 1] || `Topic ${nextTopicId}`,
              topicId: nextTopicId,
              done: done.size,
              total: mod.totalTopics,
              href: mod.href!,
              accent: mod.accent,
            });
          }
        }
      } catch {}
    }

    if (progressEntries.length > 0) {
      // Pick the one with most progress
      progressEntries.sort((a, b) => b.done - a.done);
      setContinueData(progressEntries[0]);
    }

    // Load bookmarks
    setBookmarks(getBookmarks());
  }, []);

  function handleQuizAnswer(idx: number) {
    if (showQuizResult) return;
    setSelectedAnswer(idx);
    setShowQuizResult(true);
  }

  function handleRemoveBookmark(moduleNumber: number, topicId: number) {
    removeBookmark(moduleNumber, topicId);
    setBookmarks(getBookmarks());
  }

  return (
    <main className="relative">
      <Navbar />

      {/* ─── HERO (compact) ─── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-14">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[15%] left-[10%] w-[300px] h-[300px] rounded-full bg-violet-500/15 blur-[120px]"
          />
        </div>
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400 tracking-wide">
              IFP105 &middot; Information &amp; Communication Technology
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-4">
            Your Complete
            <br />
            <span className="gradient-text-animated">ICT Study Notes</span>
          </h1>

          {/* Personalized subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isLoggedIn ? "welcome" : "default"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-base text-zinc-400 max-w-lg mx-auto leading-relaxed mb-6"
            >
              {isLoggedIn && user ? (
                <>Welcome back, {user.name.split(" ")[0]}! <span className="inline-block animate-wave">&#x1F44B;</span></>
              ) : (
                <>
                  Interactive modules with quizzes, analogies, and progress tracking.
                  <br className="hidden sm:block" />
                  Built for IFS students at Amity Tashkent.
                </>
              )}
            </motion.p>
          </AnimatePresence>

          <div className="text-sm text-zinc-500 mb-8">
            by{" "}
            <span className="text-zinc-300 font-medium">Kushagra Tripathi</span>
            {" \u00B7 "}
            <a
              href="https://www.linkedin.com/in/kushagra-x7/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400/80 hover:text-indigo-300 transition-colors"
            >
              LinkedIn &rarr;
            </a>
          </div>

          <a
            href="#modules"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] focus-glow"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
          >
            Start Learning
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </motion.div>
      </section>

      {/* ─── CONTINUE LEARNING ─── */}
      {continueData && (
        <section className="relative px-6 -mt-8 mb-8 z-10">
          <div className="max-w-3xl mx-auto">
            <motion.a
              href={continueData.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -2 }}
              className="block p-5 rounded-2xl backdrop-blur-xl transition-all"
              style={{
                background: `linear-gradient(135deg, ${continueData.accent}15, ${continueData.accent}08)`,
                border: `1px solid ${continueData.accent}30`,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Continue Learning
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    Module {continueData.moduleNumber}: {continueData.topicTitle}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 max-w-[120px] h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(continueData.done / continueData.total) * 100}%`, background: continueData.accent }} />
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: continueData.accent }}>
                      {continueData.done}/{continueData.total}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${continueData.accent}20` }}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke={continueData.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </motion.a>
          </div>
        </section>
      )}

      {/* ─── QUICK CHALLENGE ─── */}
      <section className="relative px-6 mb-12 z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl card-glass overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xl">&#x26A1;</span>
                <h2 className="text-lg font-bold tracking-tight">Quick Challenge</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 uppercase tracking-wider">
                  Test Yourself
                </span>
              </div>

              <p className="text-base font-semibold text-white mb-5">
                {currentQuiz.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuiz.options.map((opt, idx) => {
                  let optStyle = "bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06]";
                  if (showQuizResult) {
                    if (idx === currentQuiz.answer) {
                      optStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
                    } else if (idx === selectedAnswer && idx !== currentQuiz.answer) {
                      optStyle = "bg-red-500/15 border-red-500/40 text-red-300";
                    } else {
                      optStyle = "bg-white/[0.02] border-white/[0.05] opacity-50";
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!showQuizResult ? { scale: 1.02 } : {}}
                      whileTap={!showQuizResult ? { scale: 0.98 } : {}}
                      onClick={() => handleQuizAnswer(idx)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${optStyle}`}
                    >
                      <span className="text-zinc-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showQuizResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 pt-5 border-t border-white/[0.06]"
                  >
                    <p className="text-sm mb-4">
                      {selectedAnswer === currentQuiz.answer ? (
                        <span className="text-emerald-400 font-semibold">&#x2705; Correct! Nice one.</span>
                      ) : (
                        <span className="text-red-400 font-semibold">&#x274C; Not quite — the answer is {currentQuiz.options[currentQuiz.answer]}.</span>
                      )}
                    </p>
                    <Link
                      href="/module/1"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Want to learn more? Start Module 1 &rarr;
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SAVED TOPICS (Bookmarks) ─── */}
      {bookmarks.length > 0 && (
        <section className="relative px-6 mb-8 z-10">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl card-glass p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">{"\u{1F4CC}"}</span>
                <h3 className="text-sm font-bold tracking-tight">Saved Topics</h3>
                <span className="text-[10px] font-medium text-zinc-500">{bookmarks.length} saved</span>
              </div>
              <div className="space-y-2">
                {bookmarks.map((bm) => (
                  <div
                    key={`${bm.moduleNumber}-${bm.topicId}`}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-colors group"
                  >
                    <Link
                      href={`/module/${bm.moduleNumber}`}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-400 shrink-0">
                        M{bm.moduleNumber}
                      </span>
                      <span className="text-sm text-zinc-300 truncate">{bm.topicTitle}</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveBookmark(bm.moduleNumber, bm.topicId);
                      }}
                      className="text-zinc-600 hover:text-red-400 transition-colors text-sm shrink-0 opacity-0 group-hover:opacity-100"
                      title="Remove bookmark"
                    >
                      &#x2715;
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── MODULES ─── */}
      <section id="modules" className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Pick a Module
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              3 modules available now. Each is self-contained with theory, analogies, and quizzes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod, i) => (
              <ModuleCard key={mod.number} {...mod} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Built for <span className="gradient-text-animated">real learning</span>
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Not just notes &mdash; an interactive experience designed to make concepts stick.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="group p-5 rounded-xl card-glass">
                <div className="text-xl mb-2">{feature.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                IFP105
              </span>
              <span className="text-sm text-zinc-500">ICT Study Notes</span>
            </div>
            <a
              href="https://www.linkedin.com/in/kushagra-x7/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
          <div className="text-center pt-4 border-t border-white/[0.04]">
            <p className="text-xs text-zinc-600">
              Amity University Tashkent &middot; Made with care by Kushagra Tripathi
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
