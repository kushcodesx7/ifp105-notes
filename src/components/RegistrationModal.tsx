"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { decodeJwt } from "@/lib/jwt";
import { firstName } from "@/lib/names";

interface Batch {
  id: string;
  name: string;
  accent: string | null;
}

interface Section {
  name: string;
  studentCount: number;
  pending?: boolean; // true when teacher hasn't imported the roll list yet
}

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  closable?: boolean;
}

// Extract last 3 digits/chars of roll number
function lastThree(roll: string): string {
  const cleaned = roll.trim().toUpperCase();
  return cleaned.slice(-3);
}

// Build display name: last3_firstname
function buildDisplayName(roll: string, fullName: string): string {
  if (!roll.trim() || !fullName.trim()) return "";
  return `${lastThree(roll)}_${firstName(fullName)}`;
}

export default function RegistrationModal({
  open,
  onClose,
  onSuccess,
  closable = true,
}: RegistrationModalProps) {
  const { user, login, getIdToken, setIdToken } = useAuth();
  // `needsReauth` flips true when we detect the in-memory ID token is
  // missing. Happens when: (a) the student's Google JWT expired (they
  // hang out in the tab for >1 hour), (b) they signed in on another
  // tab/device and this tab restored `user` from localStorage but the
  // token was never persisted (by design — tokens are memory-only), or
  // (c) the server rejected a stale token. The fix is to show an
  // inline Google Sign In button so they can re-auth WITHOUT losing
  // the form data they already filled in.
  const [needsReauth, setNeedsReauth] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [error, setError] = useState("");

  // Load batches when modal opens
  // `cache: "no-store"` is critical: without it, browsers (and any rogue
  // service worker) can serve a stale response — which is exactly what
  // happened to at least one student: empty batch/section dropdowns
  // because the old empty-roster response was still in her HTTP cache.
  useEffect(() => {
    if (!open) return;
    setBatchesLoading(true);
    fetch("/api/batches", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setBatches(data.batches || []);
        setBatchesLoading(false);
        // Auto-select if only one batch
        if (data.batches?.length === 1) {
          setSelectedBatchId(data.batches[0].id);
        }
      })
      .catch(() => {
        setError("Could not load batches. Please try again.");
        setBatchesLoading(false);
      });
  }, [open]);

  // Load sections when batch is selected
  useEffect(() => {
    if (!selectedBatchId) {
      setSections([]);
      setSelectedSection("");
      return;
    }
    setSectionsLoading(true);
    setError("");
    fetch(
      `/api/batches/sections?batchId=${encodeURIComponent(selectedBatchId)}`,
      { cache: "no-store" }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`sections ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list = Array.isArray(data?.sections) ? data.sections : [];
        setSections(list);
        setSectionsLoading(false);
        // If sections somehow came back empty, surface it to the user
        // instead of leaving the dropdown silently unusable.
        if (list.length === 0) {
          setError(
            "Couldn't load sections. Try closing and reopening the app, or tell your teacher."
          );
        }
      })
      .catch(() => {
        setSectionsLoading(false);
        setError(
          "Couldn't load sections. Check your internet and try again."
        );
      });
  }, [selectedBatchId]);

  // Auto-build name preview
  const previewName = user?.name ? buildDisplayName(enrollmentNo, user.name) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedBatchId) {
      setError("Please select your batch.");
      return;
    }
    if (!selectedSection) {
      setError("Please select your section.");
      return;
    }
    if (!enrollmentNo.trim()) {
      setError("Please enter your enrollment number.");
      return;
    }
    // Accept any linkedin.com/in/<handle> URL. Query strings, trailing slashes,
    // and non-word chars in the handle (e.g. non-Latin names) are allowed.
    if (
      linkedinUrl.trim() &&
      !/^https?:\/\/(www\.)?linkedin\.com\/in\/[^/\s?#]+/i.test(linkedinUrl.trim())
    ) {
      setError("LinkedIn URL format: https://linkedin.com/in/yourname");
      return;
    }

    // Build the name in rollnumber_firstname format
    const rollNum = enrollmentNo.trim().toUpperCase();
    const nameToSave = displayName.trim() || `${lastThree(rollNum)}_${firstName(user!.name)}`;

    const token = getIdToken();
    if (!token) {
      // Flip into the inline re-auth flow instead of a dead-end error.
      // Form data is preserved (local state) so after re-auth she can
      // hit Register again without re-typing anything.
      setNeedsReauth(true);
      setError("Your session expired. Please sign in again below to finish registering — your answers are saved.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-id-token": token,
      },
      body: JSON.stringify({
        batchId: selectedBatchId,
        section: selectedSection,
        enrollmentNo: rollNum,
        name: nameToSave,
        email: user!.email,
        linkedinUrl: linkedinUrl.trim() || null,
        photoUrl: (user as { photo?: string })?.photo || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }

    // Update auth context. `section` was previously left out here, which
    // meant a newly-registered student's `isRegistered` check in the
    // Navbar failed (it wants enrollmentNo + batchId + section), so the
    // "Register" warning chip would still appear until a DB-refresh
    // cycle filled it in.
    login({
      ...user!,
      name: nameToSave,
      enrollmentNo: rollNum,
      batchId: selectedBatchId,
      section: selectedSection,
    });

    // Reset form
    setSelectedBatchId("");
    setSelectedSection("");
    setEnrollmentNo("");
    setDisplayName("");
    setLinkedinUrl("");
    onSuccess?.();
    onClose();
  }

  // Esc closes the modal (matches every other dialog in the app). Only
  // active when `closable` — the post-sign-in forced-registration path
  // passes closable={false} so Esc doesn't bail them out.
  useEffect(() => {
    if (!open || !closable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closable, onClose]);

  // Proactively detect missing token on modal open so the student sees
  // "sign in again" BEFORE filling out the whole form. Previously we
  // only hit this check at submit time, which meant she'd type her
  // batch/section/roll/LinkedIn only to be told "please sign in again"
  // — that's exactly the UX bug a student reported on Apr 18.
  useEffect(() => {
    if (!open) return;
    if (!getIdToken()) setNeedsReauth(true);
    else setNeedsReauth(false);
  }, [open, getIdToken]);

  function handleReauthSuccess(response: { credential?: string }) {
    if (!response.credential) return;
    const payload = decodeJwt(response.credential);
    if (!payload?.email) return;
    // Reject if the re-auth is for a DIFFERENT Google account than the
    // one that started registration — otherwise the modal would merge
    // someone else's identity mid-flow.
    if (
      user?.email &&
      payload.email.toLowerCase() !== user.email.toLowerCase()
    ) {
      setError(
        `Signed in as ${payload.email} — please use the same Google account (${user.email}) that started registration.`
      );
      return;
    }
    setIdToken(response.credential);
    // Refresh user in auth context so the fresh photo/name from the new
    // JWT shows up everywhere (same pattern as Navbar's sign-in).
    login({
      ...(user || {}),
      name: payload.name || user?.name || "",
      email: payload.email,
      photo: payload.picture || user?.photo,
    });
    setNeedsReauth(false);
    setError("");
  }

  // Trap Tab / Shift+Tab inside the dialog while it's open so keyboard
  // users can't focus the page behind the backdrop.
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={closable ? onClose : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-modal-title"
        >
          <motion.div
            ref={dialogRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            // max-h + inner scroll so the dialog can't be scrolled out
            // past the edges on short mobile viewports (iPhone SE at
            // 667px with keyboard open).
            className="w-full max-w-md rounded-2xl p-6 relative my-8 max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain"
            style={{
              background: "linear-gradient(135deg, rgba(15,15,25,0.98), rgba(12,12,20,0.98))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            {closable && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Close"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}

            {/* Header */}
            <div className="mb-5">
              <div aria-hidden="true" className="text-3xl mb-3">🎓</div>
              <h2 id="registration-modal-title" className="text-xl font-bold text-white mb-1">Complete Registration</h2>
              <p className="text-sm text-zinc-400">
                Hi <span className="text-white font-semibold">{firstName(user.name)}</span>! Link your account
                to your section so your progress syncs across devices.
              </p>
            </div>

            {/* Re-auth banner — shown only when the Google ID token is
                 missing or expired. Form data is preserved underneath
                 so the student can re-auth in place without retyping. */}
            {needsReauth && (
              <div
                className="mb-4 p-4 rounded-xl"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.25)",
                }}
              >
                <div className="text-[12px] font-bold text-indigo-300 mb-1 flex items-center gap-2">
                  <span aria-hidden="true">🔐</span>
                  Sign in again to finish registering
                </div>
                <div className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                  Your Google session expired (it lasts ~1 hour). Click
                  below to refresh it — your answers below are saved and
                  you won&apos;t lose them.
                </div>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleReauthSuccess}
                    onError={() => {
                      setError(
                        "Google sign-in failed. Check your connection and try again."
                      );
                    }}
                    theme="filled_black"
                    size="large"
                    shape="pill"
                    text="signin_with"
                    // `useOneTap` would auto-select the current Google
                    // account — nice UX but can loop on this cohort's
                    // devices. Plain button is predictable.
                  />
                </div>
              </div>
            )}

            {/* Warning box */}
            <div
              className="mb-4 p-3 rounded-lg text-[11px] leading-relaxed"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <span className="text-amber-400 font-bold">⚠️ Important:</span>{" "}
              <span className="text-zinc-400">
                Your batch, section, and roll number are <strong className="text-white">locked forever</strong>{" "}
                once set. Double-check with your teacher if unsure.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Batch dropdown */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  Batch <span className="text-red-400">*</span>
                </label>
                {batchesLoading ? (
                  <div className="h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center px-4">
                    <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-zinc-500">Loading...</span>
                  </div>
                ) : (
                  <select
                    value={selectedBatchId}
                    onChange={(e) => {
                      setSelectedBatchId(e.target.value);
                      setSelectedSection(""); // Reset section when batch changes
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    required
                  >
                    <option value="">Select your batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Section dropdown — only shown when batch is selected */}
              {selectedBatchId && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Section <span className="text-red-400">*</span>
                  </label>
                  {sectionsLoading ? (
                    <div className="h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center px-4">
                      <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <span className="ml-2 text-sm text-zinc-500">Loading sections...</span>
                    </div>
                  ) : sections.length === 0 ? (
                    <p className="text-xs text-amber-400">No sections available in this batch.</p>
                  ) : (
                    <>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                        required
                      >
                        <option value="">Select your section...</option>
                        {sections.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                            {s.pending
                              ? " (roll list pending)"
                              : ` (${s.studentCount} students)`}
                          </option>
                        ))}
                      </select>
                      {selectedSection &&
                        sections.find((s) => s.name === selectedSection)?.pending && (
                          <p className="text-[10px] text-amber-400 mt-1.5 leading-relaxed">
                            Your teacher hasn&apos;t uploaded {selectedSection}&apos;s roll list
                            yet. You can still register — your instructor will verify your
                            enrollment later.
                          </p>
                        )}
                    </>
                  )}
                </motion.div>
              )}

              {/* Enrollment number */}
              {selectedSection && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Enrollment / Roll Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={enrollmentNo}
                    onChange={(e) => {
                      setEnrollmentNo(e.target.value);
                      if (e.target.value.trim() && user?.name) {
                        setDisplayName(buildDisplayName(e.target.value, user.name));
                      }
                    }}
                    placeholder="e.g., A85456325267"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    required
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">
                    Your enrollment number in {selectedSection}. This is your unique ID.
                  </p>
                </motion.div>
              )}

              {/* Display name */}
              {selectedSection && enrollmentNo.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Display Name <span className="text-zinc-600">(last 3 digits + your name)</span>
                  </label>
                  <input
                    type="text"
                    value={displayName || previewName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={previewName || "267_Farangiz"}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">
                    This is how classmates and teachers see you. You can edit later.
                  </p>
                </motion.div>
              )}

              {/* LinkedIn URL */}
              {selectedSection && enrollmentNo.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    LinkedIn URL <span className="text-zinc-600">(optional, for IFS Connect)</span>
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">
                    Let classmates find and connect with you professionally.
                  </p>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 p-3 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                // Disable while re-auth is needed — student must refresh
                // the Google session above before the Register click will
                // have a valid token to send.
                disabled={loading || needsReauth || !selectedBatchId || !selectedSection || !enrollmentNo.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register — Lock in my details →"}
              </button>

              {closable && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  I&apos;ll do this later
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
