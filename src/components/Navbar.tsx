"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface NavbarProps {
  showBack?: boolean;
  title?: string;
}

export default function Navbar({ showBack = false, title }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-[#09090F]/70 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href="/"
            className="text-zinc-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </Link>
        )}
        <span className="text-[11px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
          IFP105
        </span>
        {title && (
          <span className="text-sm font-medium text-zinc-400 hidden sm:block">
            {title}
          </span>
        )}
      </div>
    </motion.nav>
  );
}
