"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";
import { decodeJwt } from "@/lib/jwt";

interface LoginPromptProps {
  onClose: () => void;
}

/**
 * LoginPrompt — shown when the student needs to (re-)authenticate to
 * save quiz progress. Offers BOTH sign-in paths:
 *   1. Google OAuth (one-click) — the default.
 *   2. Enrollment + password — for students who logged in with a
 *      teacher-issued password. Without this path, password users
 *      who hit the re-auth flow were stranded with no way back in.
 */
export default function LoginPrompt({ onClose }: LoginPromptProps) {
  const { login, setIdToken, loginWithPassword } = useAuth();
  const [mode, setMode] = useState<"google" | "password">("google");
  const [error, setError] = useState("");
  const [pwEnrollment, setPwEnrollment] = useState("");
  const [pwPassword, setPwPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  function handleGoogleSuccess(response: { credential?: string }) {
    if (!response.credential) return;
    const payload = decodeJwt(response.credential);
    if (payload?.name && payload?.email) {
      // CRITICAL: the previous version called login() but NOT
      // setIdToken(), so even a successful Google re-auth left the in-
      // memory token empty — the very next save would re-pop this
      // prompt. Store the Google credential as the id token so the
      // next /api/progress call authenticates cleanly.
      setIdToken(response.credential);
      login({
        name: payload.name,
        email: payload.email,
        photo: payload.picture,
      });
      onClose();
    } else {
      setError("Could not read Google account info.");
    }
  }

  async function handlePasswordSubmit() {
    if (!pwEnrollment.trim() || !pwPassword) {
      setError("Enter your enrollment number and password.");
      return;
    }
    setError("");
    setPwLoading(true);
    const res = await loginWithPassword(pwEnrollment.trim(), pwPassword);
    setPwLoading(false);
    if (res.ok) {
      onClose();
    } else {
      setError(res.error);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm rounded-2xl p-6 relative"
          style={{
            background: "linear-gradient(135deg, rgba(15,15,25,0.95), rgba(12,12,20,0.98))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="text-center mb-5">
            <div className="text-3xl mb-3">🚀</div>
            <h2 className="text-lg font-bold text-white mb-1.5">
              Save your progress!
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Sign in to save your quiz scores across all your devices.
            </p>
          </div>

          {/* Mode toggle */}
          <div
            className="flex items-center gap-1 p-1 rounded-full mb-5 text-[11px] font-semibold"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              onClick={() => { setMode("google"); setError(""); }}
              className={`flex-1 py-1.5 rounded-full transition-colors ${mode === "google" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              style={mode === "google" ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)" } : undefined}
            >
              Google
            </button>
            <button
              onClick={() => { setMode("password"); setError(""); }}
              className={`flex-1 py-1.5 rounded-full transition-colors ${mode === "password" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              style={mode === "password" ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)" } : undefined}
            >
              Roll + password
            </button>
          </div>

          {mode === "google" ? (
            <div className="flex justify-center mb-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in failed.")}
                theme="filled_black"
                size="large"
                shape="pill"
                text="signin_with"
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Enrollment number (e.g. A70055123456)"
                value={pwEnrollment}
                onChange={(e) => setPwEnrollment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
                autoComplete="username"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={pwPassword}
                onChange={(e) => setPwPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <button
                onClick={handlePasswordSubmit}
                disabled={pwLoading}
                className="w-full py-2.5 text-sm font-bold rounded-lg text-white disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
              >
                {pwLoading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 text-center mt-3">{error}</p>
          )}

          <p className="text-[11px] text-zinc-600 text-center mt-4">
            Use the same method you used to sign in before.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
