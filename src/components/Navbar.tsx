"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";

interface NavbarProps {
  showBack?: boolean;
  title?: string;
  moduleNumber?: number;
}

const MODULES = [
  { number: 1, title: "Hardware & Software", href: "/module/1", accent: "#6366F1" },
  { number: 2, title: "Office Automation", href: "/module/2", accent: "#10B981" },
  { number: 3, title: "Social Media", href: "/module/3", accent: "#3B82F6" },
  { number: 4, title: "HTML & Web Dev", href: "/module/4", accent: "#06B6D4" },
  { number: 5, title: "Tech Trends", href: "/module/5", accent: "#8B5CF6" },
];

function decodeJwt(token: string): Record<string, string> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Navbar({ showBack = false, title, moduleNumber }: NavbarProps) {
  const { user, isLoggedIn, login, logout } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showModules, setShowModules] = useState(false);

  function handleGoogleSuccess(response: { credential?: string }) {
    if (!response.credential) return;
    const payload = decodeJwt(response.credential);
    if (payload?.name && payload?.email) {
      login({ name: payload.name, email: payload.email });
      setShowSignIn(false);
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 sm:px-6 bg-[#09090F]/70 backdrop-blur-xl border-b border-white/[0.06]"
      >
        <div className="flex items-center gap-2 sm:gap-3">
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
          {title && moduleNumber ? (
            <div className="relative">
              <button
                onClick={() => setShowModules(!showModules)}
                className="flex items-center gap-1 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors truncate max-w-[140px] sm:max-w-none"
              >
                {title}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className={`shrink-0 transition-transform ${showModules ? "rotate-180" : ""}`}>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {showModules && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowModules(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 rounded-xl z-50 overflow-hidden"
                    style={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
                  >
                    {MODULES.map((mod) => (
                      mod.href ? (
                        <Link
                          key={mod.number}
                          href={mod.href}
                          onClick={() => setShowModules(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition-colors ${
                            mod.number === moduleNumber
                              ? "text-white bg-white/[0.06]"
                              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ background: mod.accent }}>
                            {mod.number}
                          </span>
                          <span className="truncate">{mod.title}</span>
                          {mod.number === moduleNumber && (
                            <span className="ml-auto text-[10px] text-zinc-500">Current</span>
                          )}
                        </Link>
                      ) : (
                        <div key={mod.number} className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-zinc-600 cursor-not-allowed">
                          <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-zinc-600 shrink-0"
                            style={{ background: "rgba(255,255,255,0.05)" }}>
                            {mod.number}
                          </span>
                          <span className="truncate">{mod.title}</span>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="ml-auto shrink-0">
                            <path d="M4 7V5a4 4 0 118 0v2m-9 0h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          ) : title ? (
            <span className="text-xs sm:text-sm font-medium text-zinc-400 truncate max-w-[100px] sm:max-w-none">
              {title}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn && user ? (
            <>
              <span className="text-[11px] text-zinc-500 hidden sm:block">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-[11px] font-medium text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSignIn(true)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:scale-105 transition-transform"
            >
              Sign In
            </button>
          )}
        </div>
      </motion.nav>

      {/* Sign In Modal */}
      {showSignIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) setShowSignIn(false); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{
              background: "linear-gradient(135deg, rgba(15,15,25,0.95), rgba(12,12,20,0.98))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="text-3xl mb-3">🚀</div>
              <h2 className="text-lg font-bold text-white mb-1.5">Sign In</h2>
              <p className="text-sm text-zinc-400">Save your progress across all devices</p>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {}}
                theme="filled_black"
                size="large"
                shape="pill"
                text="signin_with"
              />
            </div>

            <p className="text-[11px] text-zinc-600 text-center mt-4">
              One click. No forms. Your progress syncs everywhere.
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
