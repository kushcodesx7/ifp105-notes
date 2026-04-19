"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

// "Quick login" password setup card on the profile page.
//
// Lets a student bind a local password to their existing Google-linked
// account so they can log in via /api/auth/login-password without going
// through the full Google OAuth flow on lab computers. The password is
// bcrypt-hashed server-side; the only thing that lives client-side
// is the password input itself, which clears after submit.
//
// Auth: this component assumes the user is already signed in (the
// page that hosts it is gated). The set-password endpoint requires
// a valid session JWT to bind the password to the right student row.

interface Props {
  /** Show feedback (success / error) via the host page's toast layer
   *  rather than re-implementing a toast here. */
  onToast?: (kind: "success" | "error", message: string) => void;
}

export default function QuickLoginPasswordCard({ onToast }: Props) {
  const { getIdToken } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setErr(null);
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords don't match.");
      return;
    }
    const token = getIdToken();
    if (!token) {
      setErr("Sign in with Google first, then come back to set a password.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-id-token": token,
        },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          (json && typeof json === "object" && "error" in json
            ? String((json as { error: string }).error)
            : null) || `Failed (${res.status})`;
        setErr(msg);
        onToast?.("error", msg);
        return;
      }
      setDone(true);
      setPassword("");
      setConfirm("");
      onToast?.(
        "success",
        "Quick-login password saved. You can now sign in with your enrollment number on any device."
      );
    } catch (e) {
      const msg = (e as Error).message || "Network error";
      setErr(msg);
      onToast?.("error", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))",
        border: "1px solid rgba(99,102,241,0.18)",
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: "rgba(99,102,241,0.14)",
            color: "#A5B4FC",
          }}
          aria-hidden="true"
        >
          🔐
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-zinc-200 mb-1">
            Quick-login password{" "}
            <span className="text-[10px] font-semibold text-zinc-500 uppercase ml-1">
              optional
            </span>
          </h3>
          <p className="text-[12px] text-zinc-400 leading-relaxed">
            Set a password to sign in with your <strong>enrollment number</strong>
            {" "}instead of going through Google. Useful for lab computers
            where Google sign-in takes ~2 minutes.
          </p>
        </div>
      </div>

      {done && (
        <div
          className="mb-3 rounded-lg px-3 py-2 text-[12px] text-emerald-300 flex items-center gap-2"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <span aria-hidden="true">✓</span>
          Password saved. You can change it again any time.
        </div>
      )}

      <div className="space-y-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min. 6 characters)"
          autoComplete="new-password"
          className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          autoComplete="new-password"
          className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
        />
        {err && <p className="text-[12px] text-red-400">{err}</p>}
        <button
          onClick={submit}
          disabled={busy || !password || !confirm}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {busy ? "Saving…" : done ? "Update password" : "Set quick-login password"}
        </button>
      </div>
    </motion.div>
  );
}
