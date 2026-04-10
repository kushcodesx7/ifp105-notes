"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";

interface LoginPromptProps {
  onClose: () => void;
}

function decodeJwt(token: string): Record<string, string> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function LoginPrompt({ onClose }: LoginPromptProps) {
  const { login } = useAuth();
  const [error, setError] = useState("");

  function handleGoogleSuccess(response: { credential?: string }) {
    if (!response.credential) return;
    const payload = decodeJwt(response.credential);
    if (payload?.name && payload?.email) {
      login({ name: payload.name, email: payload.email });
      onClose();
    } else {
      setError("Could not read Google account info.");
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

          <div className="text-center mb-6">
            <div className="text-3xl mb-3">🚀</div>
            <h2 className="text-lg font-bold text-white mb-1.5">
              Save your progress!
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Sign in with Google to save your quiz scores and progress across all your devices.
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in failed.")}
              theme="filled_black"
              size="large"
              shape="pill"
              text="signin_with"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center mt-2">{error}</p>
          )}

          <p className="text-[11px] text-zinc-600 text-center mt-4">
            One click. No forms. Your progress syncs everywhere.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
