"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-red-500/10 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[120px]"
        />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center px-6"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl mb-6"
        >
          🔍
        </motion.div>

        <h1 className="text-7xl sm:text-8xl font-bold tracking-tight mb-4">
          <span className="gradient-text-animated">404</span>
        </h1>

        <p className="text-lg text-zinc-400 mb-2">Page not found</p>
        <p className="text-sm text-zinc-600 max-w-sm mx-auto mb-8">
          Looks like this page went on a study break. Let&apos;s get you back to the notes.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] focus-glow"
          style={{
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3m0 0l4 4M3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Home
        </Link>
      </motion.div>
    </main>
  );
}
