"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";
import { decodeJwt } from "@/lib/jwt";

// "Quick login" password setup card on the profile page.
//
// Lets a student bind a local password to their existing Google-linked
// account so they can log in via /api/auth/login-password without going
// through the full Google OAuth flow on lab computers. The password is
// bcrypt-hashed server-side; the only thing that lives client-side
// is the password input itself, which clears after submit.
//
// Auth: the set-password endpoint requires a valid session JWT. Google
// tokens live in memory only (AuthContext never persists them) so after
// a page refresh the student can still appear "signed in" (user object
// in localStorage) but have no token in hand. When that happens we
// render an inline Google sign-in button so they can re-auth without
// leaving the page — much better UX than the old "sign in with Google
// first, then come back" error message.

interface Props {
  /** Show feedback (success / error) via the host page's toast layer
   *  rather than re-implementing a toast here. */
  onToast?: (kind: "success" | "error", message: string) => void;
}

export default function QuickLoginPasswordCard({ onToast }: Props) {
  const { user, getIdToken, setIdToken, login } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  // Bumped on token-arrival to force the form to re-evaluate `hasToken`
  // without needing a full context change. Reading from a ref means
  // `getIdToken()` value changes aren't otherwise observable in render.
  const [tokenTick, setTokenTick] = useState(0);

  const hasToken = !!getIdToken();
  void tokenTick; // referenced so React treats it as a dependency of `hasToken`

  function handleGoogleRefresh(response: { credential?: string }) {
    if (!response.credential) {
      setErr("Google sign-in returned no token. Try again.");
      return;
    }
    const payload = decodeJwt(response.credential);
    if (!payload?.email) {
      setErr("Google sign-in returned no email. Try again.");
      return;
    }
    // If the user was already signed in with a different Google account,
    // update the display name/email so the profile row they save hits the
    // right record. In practice students hitting this path will use the
    // same account, so this is a no-op 99% of the time.
    setIdToken(response.credential);
    login({
      ...(user || {}),
      name: payload.name || user?.name || payload.email,
      email: payload.email,
      photo: payload.picture,
    });
    setErr(null);
    setTokenTick((x) => x + 1);
  }

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
      // Should be unreachable — the UI hides the form when !hasToken —
      // but keep a defensive check in case the token expires mid-submit.
      setErr("Your session expired. Sign in with Google again above.");
      setTokenTick((x) => x + 1);
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
      // Keep the toast short — on a 375px phone, anything long gets
      // truncated to one line or wraps ugly. The "✓ Password saved"
      // banner inside the card itself explains the how below.
      onToast?.("success", "Password saved ✓");
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
          className="mb-3 rounded-lg px-3 py-2.5 text-[12px] text-emerald-300 flex items-start gap-2 leading-relaxed"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <span aria-hidden="true" className="shrink-0 mt-0.5">
            ✓
          </span>
          <span>
            Password saved. You can sign in with your enrollment number
            on any device now, and you can change this password any
            time.
          </span>
        </div>
      )}

      {!hasToken ? (
        // Session restored from localStorage but no active token in
        // memory (classic "refreshed the page" state). Re-auth inline
        // so the student doesn't have to leave this page.
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <p className="text-[12px] text-zinc-400 leading-relaxed">
            Your session needs a fresh Google confirmation before we can
            save a password. Sign in once more and the form will unlock —
            you won&apos;t lose anything you&apos;ve typed on this page.
          </p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleRefresh}
              onError={() =>
                setErr("Google sign-in failed. Try once more.")
              }
              theme="filled_black"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>
          {err && <p className="text-[12px] text-red-400 text-center">{err}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min. 6 characters)"
            autoComplete="new-password"
            // Mobile-first sizing: 12px base font-size avoids iOS
            // auto-zoom on focus; min-h-11 hits the 44px touch target.
            className="w-full px-3.5 py-3 min-h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-base sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            className="w-full px-3.5 py-3 min-h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-base sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
          />
          {err && (
            <p className="text-[12px] text-red-400 leading-relaxed break-words">
              {err}
            </p>
          )}
          <button
            onClick={submit}
            disabled={busy || !password || !confirm}
            className="w-full py-3 min-h-11 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {busy ? "Saving…" : done ? "Update password" : "Set quick-login password"}
          </button>
        </div>
      )}
    </motion.div>
  );
}
