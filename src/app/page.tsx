"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ModuleCard from "@/components/ModuleCard";
import XpBar from "@/components/XpBar";

const modules = [
  {
    number: "01",
    title: "Hardware & Software",
    description: "CPU, RAM, ROM, I/O devices, storage, software types, internet basics — the foundation of everything.",
    icon: "🖥️",
    href: "/module/1",
    accent: "#6366F1",
    tags: ["11 Topics", "~55 min", "110 Qs"],
  },
  {
    number: "02",
    title: "Office Automation",
    description: "MS Word, Excel, and PowerPoint — editing, formatting, formulas, charts, presentations, and slide shows.",
    icon: "📊",
    href: "/module/2",
    accent: "#10B981",
    tags: ["9 Topics", "~45 min", "90 Qs"],
  },
  {
    number: "03",
    title: "Social Media Foundation",
    description: "Social media platforms, management tools, measurement & reporting, advertising, Facebook & Twitter marketing.",
    icon: "📱",
    href: "/module/3",
    accent: "#3B82F6",
    tags: ["7 Topics", "~35 min", "70 Qs"],
  },
  {
    number: "04",
    title: "HTML & Web Development",
    description: "Build web pages from scratch. Tags, elements, attributes, tables, lists, links, images — with a live playground.",
    icon: "🌐",
    href: "/module/4",
    accent: "#06B6D4",
    tags: ["11 Topics", "Interactive"],
  },
  {
    number: "05",
    title: "Latest Technology Trends",
    description: "AI, Machine Learning, Cloud, Blockchain, VR/AR, IoT, Generative AI — understand the technologies shaping our future.",
    icon: "🚀",
    href: "/module/5",
    accent: "#8B5CF6",
    tags: ["10 Topics", "~50 min", "100 Qs"],
  },
];

const stats = [
  { label: "Modules", value: "5" },
  { label: "Topics", value: "47" },
  { label: "Questions", value: "480" },
  { label: "Hours", value: "~4" },
];

const features = [
  { icon: "🧠", title: "Analogies That Stick", desc: "Every concept explained with real-world analogies. Pizza = IPO cycle. Kitchen counter = RAM." },
  { icon: "✅", title: "10 Qs Per Topic", desc: "Instant feedback on every answer. Know what you got wrong and why — before the exam." },
  { icon: "📊", title: "Track Progress", desc: "Your progress is saved locally. Pick up where you left off, anytime." },
  { icon: "📋", title: "Cheat Sheets", desc: "One-page summary of every module. Perfect for last-minute revision." },
  { icon: "⚡", title: "Mobile First", desc: "Study on your phone, tablet, or laptop. The layout adapts perfectly." },
  { icon: "🔓", title: "100% Free", desc: "No ads, no paywalls, no sign-ups. Just open the link and start studying." },
];

export default function Home() {
  return (
    <main className="relative">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-14">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0], scale: [1, 0.95, 1.1, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[15%] left-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/15 blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, 15, -15, 0], y: [0, -15, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[100px]"
          />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

        {/* Hero content — animated entrance */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400 tracking-wide">
              IFP105 · Information &amp; Communication Technology
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Your Complete
            <br />
            <span className="gradient-text-animated">ICT Study Notes</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed mb-10">
            Interactive modules with quizzes, analogies, cheat sheets, and
            progress tracking. Built for IFS students at Amity Tashkent.
          </p>

          {/* Author */}
          <div className="text-sm text-zinc-500 mb-12">
            by{" "}
            <span className="text-zinc-300 font-medium">Kushagra Tripathi</span>
            {" · "}
            <a
              href="https://www.linkedin.com/in/kushagra-x7/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400/80 hover:text-indigo-300 transition-colors"
            >
              LinkedIn →
            </a>
          </div>

          {/* CTA Button */}
          <div className="mb-8">
            <a
              href="/module/1"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] focus-glow"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
            >
              Start Learning
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>

          {/* Stats */}
          <div className="inline-flex items-center gap-0 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm overflow-hidden inner-glow">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center px-5 sm:px-8 py-4 ${
                  i > 0 ? "border-l border-white/[0.06]" : ""
                }`}
              >
                <span className="text-xl sm:text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-white/10 flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── MODULES ─── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              5 Modules. One Goal.
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Each module is self-contained with theory, analogies, and practice
              quizzes. Study at your own pace.
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
      <section className="relative py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Built for <span className="gradient-text-animated">real learning</span>
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Not just notes — an interactive experience designed to make concepts stick.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl card-glass"
              >
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BATCHES ─── */}
      <section className="relative py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Student <span className="gradient-text-animated">Batches</span>
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">
            Connect with your batchmates on LinkedIn. Find your batch and add your profile.
          </p>
          <a
            href="/batches"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)]"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
          >
            View Batches
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </section>

      <XpBar />

      {/* ─── FOOTER ─── */}
      <footer className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                IFP105
              </span>
              <span className="text-sm text-zinc-500">ICT Study Notes</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/batches" className="text-xs text-zinc-500 hover:text-white transition-colors">Batches</a>
              <a
                href="https://www.linkedin.com/in/kushagra-x7/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
          <div className="text-center pt-6 border-t border-white/[0.04]">
            <p className="text-xs text-zinc-600">
              Amity University Tashkent · Made with care by Kushagra Tripathi
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
