"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import { getCurrentCourse } from "@/lib/course-registry";
import { progressKey } from "@/lib/storage-keys";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { decodeJwt } from "@/lib/jwt";
import RegistrationModal from "@/components/RegistrationModal";

interface NavbarProps {
  showBack?: boolean;
  title?: string;
  moduleNumber?: number;
}

// Module metadata for the navbar dropdown. Derived from the course
// registry (which today is always the single ICT course) so the
// Navbar stops being a second source of truth for module titles /
// accents / topic counts. Long titles come from the registry's
// `fullTitle` field; short titles used elsewhere (admin grid) stay
// in the registry's `title`.
const currentCourse = getCurrentCourse();
const MODULES = currentCourse.modules.map((m) => ({
  number: m.id,
  title: m.fullTitle ?? m.title,
  href: `/module/${m.id}`,
  accent: m.accent,
  topicCount: m.topicCount,
}));

// Read per-module progress from localStorage. Returns {done, total, pct}
// for each module id so the Navbar dropdown can show a compact bar.
// Safe to call on first render — localStorage is gated by typeof window.
function readProgressMap(): Record<number, { done: number; total: number; pct: number }> {
  const out: Record<number, { done: number; total: number; pct: number }> = {};
  if (typeof window === "undefined") return out;
  for (const m of MODULES) {
    const total = m.topicCount;
    let done = 0;
    try {
      const raw = localStorage.getItem(progressKey(currentCourse.slug, m.number));
      if (raw) done = new Set(JSON.parse(raw)).size;
    } catch {}
    out[m.number] = {
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }
  return out;
}

export default function Navbar({ showBack = false, title, moduleNumber }: NavbarProps) {
  const { user, isLoggedIn, login, logout, setIdToken, getIdToken, loginWithPassword } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  // Sign-in modal has two paths: Google OAuth (default) and the lab-
  // friendly enrollment+password quick-login. `signInMode` flips between
  // them. Defaulting to Google preserves the existing one-click flow
  // for everyone except students who explicitly opted into a password.
  const [signInMode, setSignInMode] = useState<"google" | "password">("google");
  const [pwEnrollment, setPwEnrollment] = useState("");
  const [pwPassword, setPwPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  // Per-module progress for the dropdown. Refreshed when the dropdown
  // opens so it reflects any quiz completions since the page loaded.
  const [progressMap, setProgressMap] = useState<
    Record<number, { done: number; total: number; pct: number }>
  >({});
  useEffect(() => {
    if (showModules) setProgressMap(readProgressMap());
  }, [showModules]);

  // Check if user is registered (has enrollmentNo + batchId + section)
  const isRegistered = !!(user?.enrollmentNo && user?.batchId && user?.section);
  const isAdmin = isAdminEmail(user?.email);

  // Auth state from useAuth() is `false` during SSR (Firebase only
  // resolves in the browser), then flips to `true` on the client once
  // the persisted session restores. Rendering the post-auth UI on the
  // first client pass diverges from the SSR HTML and trips React's
  // hydration check. Gate every auth-dependent branch behind `mounted`
  // so the SSR tree and first client render are byte-identical (the
  // signed-out view), then swap in the signed-in view on the second
  // pass.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // One-shot mounted flag so SSR and the first client render are
    // byte-identical (signed-out shape). Runs exactly once.
    setMounted(true);
  }, []);
  const showAuthedUI = mounted && isLoggedIn && !!user;

  // Focus trap for the sign-in modal (Tab / Shift+Tab cycles inside the
  // dialog instead of escaping to content behind the backdrop).
  const signInDialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(signInDialogRef, showSignIn);

  // After login, refresh user data from the DB. Previously gated on
  // `!isRegistered` so it only fired for first-time students — but
  // that left a registered student's locally-cached `section` /
  // `batchId` stale if an admin reassigned them. Now runs on every
  // mount for every logged-in non-admin, so the auth context
  // self-heals within one page load of any admin section change.
  // (~200 students × a handful of page loads = tiny load; endpoint
  // is already auth'd + fast.)
  useEffect(() => {
    if (isAdmin) return;
    if (isLoggedIn && user) {
      // Check DB to see if they're actually registered (maybe auth context is stale).
      // Endpoint is auth'd — send the caller's Google ID token.
      const token = getIdToken();
      if (!token) return;
      fetch(`/api/students/check?email=${encodeURIComponent(user.email)}`, {
        headers: { "x-id-token": token },
      })
        .then(async (r) => {
          // Only treat an explicit 404 (or data.registered === false) as "not registered".
          // Network/5xx errors should NOT pop the modal for already-registered users.
          if (!r.ok) return { registered: false, _unknown: r.status !== 404 };
          return r.json();
        })
        .then((data) => {
          if (data.registered) {
            // Prefer the FRESH Google photo over the stored one — Gmail
            // avatar may have changed since last visit.
            const freshPhoto = user.photo || data.photoUrl;
            login({
              ...user,
              name: data.name || user.name,
              photo: freshPhoto,
              enrollmentNo: data.enrollmentNo,
              batchId: data.batchId,
              section: data.section,
            });
            // Silently update the DB if the Google photo changed
            if (user.photo && user.photo !== data.photoUrl) {
              fetch("/api/students/sync", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-id-token": token,
                },
                body: JSON.stringify({ email: user.email, photoUrl: user.photo }),
              }).catch(() => {});
            }
          } else if (!data._unknown) {
            // Confirmed not registered — show modal
            setShowRegistration(true);
          }
          // Unknown / network error: do nothing, leave user alone
        })
        .catch(() => {
          // Network error — do NOT pop the modal; let the user try again later
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.email]);

  // Keep the profile photo in sync with whatever Google is returning now.
  // Fires whenever user.photo changes (which happens on a fresh sign-in —
  // Google JWT carries the current Gmail avatar). The endpoint is a no-op
  // if the DB already has this URL, so calling it on every load is cheap.
  useEffect(() => {
    if (!isLoggedIn || !user?.email || !user?.photo) return;
    const token = getIdToken();
    // No token → they were restored from localStorage without signing in
    // fresh this session. Skip — they'll sync next time they sign in.
    if (!token) return;
    fetch("/api/students/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-id-token": token,
      },
      body: JSON.stringify({ email: user.email, photoUrl: user.photo }),
    }).catch(() => {});
  }, [isLoggedIn, user?.email, user?.photo, getIdToken]);

  function handleGoogleSuccess(response: { credential?: string }) {
    if (!response.credential) return;
    const payload = decodeJwt(response.credential);
    if (!payload?.name || !payload?.email) return;

    // Stash the ID token so authenticated writes can send it as x-id-token.
    // Kept in memory only — never persisted.
    setIdToken(response.credential);

    // Merge with existing user so a silent re-auth doesn't blow away
    // registration info (enrollmentNo / batchId / section). The fresh JWT
    // carries the current Gmail photo, so that overrides.
    login({
      ...(user || {}),
      name: payload.name,
      email: payload.email,
      photo: payload.picture,
    });
    setShowSignIn(false);
  }

  // Quick-login submit. Calls the auth-context method which talks to
  // /api/auth/login-password and persists the returned session JWT to
  // localStorage so reload keeps the user signed in.
  async function handlePasswordSubmit() {
    if (!pwEnrollment.trim() || !pwPassword) {
      setPwError("Enter your enrollment number and password.");
      return;
    }
    setPwError(null);
    setPwLoading(true);
    const res = await loginWithPassword(pwEnrollment.trim(), pwPassword);
    setPwLoading(false);
    if (res.ok) {
      setPwEnrollment("");
      setPwPassword("");
      setShowSignIn(false);
    } else {
      setPwError(res.error);
    }
  }

  // NOTE: we tried useGoogleOneTapLogin + auto_select to silently refresh
  // photos for returning users. Chrome's FedCM protocol throws
  // "[GSI_LOGGER]: FedCM get() rejects with NetworkError" when the user
  // hasn't granted prior consent in a FedCM-compatible way — fills the
  // console with errors on every page load. Removed for now. Photo still
  // syncs on fresh sign-in via the effect below + /api/students/sync.

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 sm:px-6 bg-[#09090F]/70 backdrop-blur-xl border-b border-white/[0.06]"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showBack && (
            <Link
              href="/"
              aria-label="Home"
              className="text-zinc-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
          {/* Course-code badge — the universal "Home" link. The label
              reads from `getCurrentCourse().code` (currently "IFP105")
              rather than being hardcoded, so when a second course is
              added the badge follows automatically. Previously the
              text was "IFP105" baked into JSX. */}
          <Link
            href="/"
            aria-label={`${currentCourse.code} — Home`}
            title="Home"
            className="text-[11px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shrink-0 whitespace-nowrap hover:scale-105 transition-transform"
          >
            {currentCourse.code}
          </Link>
          {title && moduleNumber ? (
            <div className="relative">
              <button
                onClick={() => setShowModules(!showModules)}
                aria-haspopup="menu"
                aria-expanded={showModules}
                aria-label={`Module menu — current module: ${title}`}
                className="flex items-center gap-1 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors truncate max-w-[140px] sm:max-w-none"
              >
                {title}
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none" className={`shrink-0 transition-transform ${showModules ? "rotate-180" : ""}`}>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {showModules && (
                <>
                  {/* Backdrop closes the menu — named for screen readers. */}
                  <button
                    type="button"
                    aria-label="Close module menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowModules(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    // max-w keeps the dropdown inside the viewport on 375px
                    // where the module title takes up most of the navbar.
                    className="absolute top-full left-0 mt-2 w-52 sm:w-56 max-w-[calc(100vw-2rem)] rounded-xl z-50 overflow-hidden"
                    style={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
                  >
                    {MODULES.map((mod) => {
                      const prog = progressMap[mod.number];
                      const inProgress = prog && prog.done > 0;
                      const complete = prog && prog.done >= prog.total && prog.total > 0;
                      return mod.href ? (
                        <Link
                          key={mod.number}
                          href={mod.href}
                          onClick={() => setShowModules(false)}
                          className={`block px-4 py-2.5 text-xs font-medium transition-colors ${
                            mod.number === moduleNumber
                              ? "text-white bg-white/[0.06]"
                              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                              style={{ background: mod.accent }}
                            >
                              {mod.number}
                            </span>
                            <span className="truncate flex-1">{mod.title}</span>
                            {mod.number === moduleNumber ? (
                              <span className="text-[9px] text-zinc-500 shrink-0">Current</span>
                            ) : complete ? (
                              <span className="text-[10px] text-emerald-400 shrink-0">✓</span>
                            ) : inProgress ? (
                              <span
                                className="text-[9px] font-semibold tabular-nums shrink-0"
                                style={{ color: mod.accent }}
                              >
                                {prog.done}/{prog.total}
                              </span>
                            ) : (
                              <span className="text-[9px] text-zinc-600 shrink-0">0/{prog?.total ?? 0}</span>
                            )}
                          </div>
                          {/* Thin progress bar under each module row so students
                               see at a glance which one they should continue. */}
                          {prog && prog.total > 0 && (
                            <div
                              className="mt-1.5 ml-8 h-0.5 rounded-full overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.06)" }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${prog.pct}%`,
                                  background: mod.accent,
                                }}
                              />
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div
                          key={mod.number}
                          className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-zinc-600 cursor-not-allowed"
                        >
                          <span
                            className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-zinc-600 shrink-0"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            {mod.number}
                          </span>
                          <span className="truncate">{mod.title}</span>
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="ml-auto shrink-0"
                          >
                            <path
                              d="M4 7V5a4 4 0 118 0v2m-9 0h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </div>
          ) : title ? (
            <span className="text-xs sm:text-sm font-medium text-zinc-400 truncate min-w-0">
              {title}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            href="/connect"
            aria-label="IFS Connect"
            className="text-[11px] font-medium px-2.5 sm:px-3 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] whitespace-nowrap shrink-0"
          >
            <span aria-hidden="true">🤝</span>
            <span className="hidden sm:inline"> Connect</span>
          </Link>
          {/* Practice Zone removed in Phase 1 architecture cleanup (route + data
               file gone). Future courses will add their own practice bank via the
               course editor; re-enable with a new component when that lands. */}
          {showAuthedUI ? (
            <>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors border border-indigo-400/30 whitespace-nowrap shrink-0"
                  title="Admin panel"
                >
                  <span aria-hidden="true">🛡</span>
                  <span className="hidden sm:inline"> Admin</span>
                </Link>
              ) : !isRegistered ? (
                <button
                  onClick={() => setShowRegistration(true)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors animate-pulse whitespace-nowrap shrink-0"
                  title="Complete your registration"
                >
                  ⚠<span className="hidden sm:inline"> Register</span>
                </button>
              ) : null}
              {/* Profile name — display only. Sat next to the explicit
                  Profile button so the student knows whose account
                  they're signed into. Hidden on mobile where space
                  is tight. */}
              <span className="hidden md:block text-[11px] text-zinc-500 truncate max-w-[100px]">
                {user.name}
              </span>
              {/* Explicit Profile button — students were missing the
                  /profile/edit page entirely because the previous
                  affordance was just the name being clickable (no
                  obvious icon, no obvious label). Now an indigo-tinted
                  pill with text + icon, visible on every viewport.
                  Houses the LinkedIn / status / skills / quick-login
                  password forms. */}
              <Link
                href="/profile/edit"
                aria-label="Edit your profile"
                title="Edit profile · set quick-login password"
                className="text-[11px] font-semibold transition-colors px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/[0.10]"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.18)",
                }}
              >
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {/* 320px crush fix: hide the word on very narrow viewports
                    where 7+ pills compete for space (admin accounts see
                    Connect + Admin + Name + Profile + Logout all at
                    once). Icon + aria-label preserve the affordance. */}
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button
                onClick={logout}
                aria-label="Log out"
                className="text-[11px] font-medium text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
              >
                {/* Icon-only on narrow viewports so admin accounts don't
                    push the navbar past the right edge at 360px. */}
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSignIn(true)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:scale-105 transition-transform whitespace-nowrap shrink-0"
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
          // Esc closes, matching every other dialog in the app.
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowSignIn(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-modal-title"
        >
          <motion.div
            ref={signInDialogRef}
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
              aria-label="Close sign-in"
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="text-center mb-5">
              <div className="text-3xl mb-3" aria-hidden="true">🚀</div>
              <h2 id="signin-modal-title" className="text-lg font-bold text-white mb-1.5">Sign In</h2>
              <p className="text-sm text-zinc-400">Save your progress across all devices</p>
            </div>

            {signInMode === "google" ? (
              <>
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
                <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
                  <button
                    onClick={() => {
                      setPwError(null);
                      setSignInMode("password");
                    }}
                    className="text-[12px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    🔐 Use enrollment + password instead
                  </button>
                  <p className="text-[10px] text-zinc-600 mt-1.5">
                    Faster on lab computers — set up in your profile after first sign-in.
                  </p>
                </div>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePasswordSubmit();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Enrollment number
                  </label>
                  <input
                    type="text"
                    value={pwEnrollment}
                    onChange={(e) => setPwEnrollment(e.target.value)}
                    placeholder="e.g. 24-IFS-001"
                    autoComplete="username"
                    autoFocus
                    aria-invalid={!!pwError}
                    aria-describedby={pwError ? "nav-pw-error" : undefined}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={pwPassword}
                    onChange={(e) => setPwPassword(e.target.value)}
                    placeholder="Your quick-login password"
                    autoComplete="current-password"
                    aria-invalid={!!pwError}
                    aria-describedby={pwError ? "nav-pw-error" : undefined}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                {pwError && (
                  // role=alert + aria-live announces the failure as
                  // soon as it lands; aria-describedby on the inputs
                  // ties the field back to this message for SR users
                  // tabbing into the form.
                  <p
                    id="nav-pw-error"
                    role="alert"
                    aria-live="polite"
                    className="text-[12px] text-red-400"
                  >
                    {pwError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {pwLoading ? "Signing in…" : "Sign in"}
                </button>
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPwError(null);
                      setSignInMode("google");
                    }}
                    className="text-[12px] text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    ← Use Google sign-in instead
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 text-center pt-1">
                  Don&apos;t have a password yet? Sign in with Google once,
                  then go to your profile to set one up.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Registration Modal — shown after login if student hasn't registered */}
      <RegistrationModal
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
        closable={true}
      />
    </>
  );
}
