"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import QuickLoginPasswordCard from "@/components/QuickLoginPasswordCard";
import { useAuth } from "@/lib/auth-context";
import { decodeJwt } from "@/lib/jwt";
import { GoogleLogin } from "@react-oauth/google";
import { SKILLS, MAX_SKILLS, MAX_BIO_LENGTH } from "@/lib/skills";
import { logError } from "@/lib/log-error";

// ─── /profile/edit ────────────────────────────────────────────────
//
// The ONE profile page for current students. Simple by design:
//   · Photo       (upload manually OR auto-synced from Google on
//                  sign-in — on mount we POST /api/students/sync-google-photo
//                  which reads the JWT's `picture` claim and saves
//                  lh3.googleusercontent.com/... to photo_url if empty)
//   · Name        (pre-filled from Google, editable)
//   · Bio         (single line, 120 char cap — same as /connect modal)
//   · Interests   (pick up to 3 tags from /lib/skills)
//   · LinkedIn    (OPTIONAL — saved as a clickable link on their card,
//                  NOT used to fetch a photo; LinkedIn blocks server-
//                  side OG scraping from Vercel IPs.)
//
// Saves to the `students` table via /api/students/profile. Everything
// here is visible on /connect immediately after save — no separate
// alumni career table involved.
//
// (History: originally a 16-field alumni career form that REQUIRED
// LinkedIn and wrote to a separate `student_profiles` table. That
// blocked 17-year-olds without LinkedIn from saving. First rewrite
// tried server-side LinkedIn scrape for the profile photo — that
// failed ~100% of the time because LinkedIn blocks cloud IPs. Second
// rewrite pivoted to Google profile photo auto-sync, which is what
// runs today. Apr 2026.)

interface ProfileData {
  name: string;
  photoUrl: string;
  bio: string;
  skills: string[];
  linkedinUrl: string;
}

const EMPTY_PROFILE: ProfileData = {
  name: "",
  photoUrl: "",
  bio: "",
  skills: [],
  linkedinUrl: "",
};

export default function EditProfilePage() {
  const { user, isLoggedIn, login, getIdToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);

  // Grace window so a signed-out visitor doesn't see a flash of the
  // skeleton before the sign-in card paints.
  const [minWaitDone, setMinWaitDone] = useState(false);
  const loading = !isLoggedIn && !minWaitDone;

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  // Highlighted after a successful save — gives the student a clear
  // next action ("See your card on IFS Connect").
  const [saved, setSaved] = useState(false);

  // Login step for unauthenticated visitors
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [loginError, setLoginError] = useState("");
  const [loginStep, setLoginStep] = useState<"google" | "enroll">("google");

  // Load batches for the register step
  useEffect(() => {
    fetch("/api/batches")
      .then((r) => r.json())
      .then((d) => {
        setBatches(
          (d.batches || []).map((b: { id: string; name: string }) => ({
            id: b.id,
            name: b.name,
          }))
        );
      })
      .catch((e) => logError("profile/edit.load-batches", e));
  }, []);

  // Flip the loading grace window off after 500ms.
  useEffect(() => {
    const timer = setTimeout(() => setMinWaitDone(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user?.email) return;
    try {
      const token = getIdToken() || "";

      // Passive Google photo sync: if the student is signed in with
      // Google and doesn't have a photo yet, the server quietly saves
      // the JWT's `picture` claim (stable lh3.googleusercontent URL) to
      // their students row. AWAITED so the subsequent /api/students/check
      // read picks up the new photo_url in the same page load — without
      // the await, the GET raced the UPDATE and the student saw no
      // photo on first visit even though the sync had fired. Fails
      // silently — non-Google sign-ins (password session) just skip this.
      if (token) {
        try {
          await fetch("/api/students/sync-google-photo", {
            method: "POST",
            headers: { "x-id-token": token },
          });
        } catch {}
      }

      // Auth-gated self-lookup: /api/students/check returns the caller's
      // own row from the `students` table (bio, skills, photo_url,
      // linkedin_url, name, section, etc.). Replaces the old
      // /api/connect-based lookup, which intentionally strips `email`
      // from its responses — so the .find(s=>s.email===user.email) match
      // always came back undefined and the form rendered empty even for
      // students who had already saved a bio + skills. Re-saving from
      // that empty form would wipe their previously-saved content.
      const res = await fetch(
        `/api/students/check?email=${encodeURIComponent(user.email)}`,
        {
          headers: token ? { "x-id-token": token } : {},
          cache: "no-store",
        }
      );
      if (!res.ok) return;
      const me = await res.json();
      if (me && me.registered) {
        setProfile({
          name: me.name || user.name || "",
          photoUrl: me.photoUrl || "",
          bio: me.bio || "",
          skills: Array.isArray(me.skills) ? me.skills : [],
          linkedinUrl: me.linkedinUrl || "",
        });
      } else {
        // New student — Google name is the best default for the form
        setProfile((prev) => ({ ...prev, name: user.name }));
      }
    } catch {
      // Silent — page still renders with whatever the student types.
    }
  }, [user, getIdToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) loadProfile();
  }, [user, loadProfile]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  function updateField<K extends keyof ProfileData>(
    field: K,
    value: ProfileData[K]
  ) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    // Any edit clears the "saved" banner — student is back in edit mode.
    setSaved(false);
  }

  function toggleSkill(id: string) {
    setProfile((prev) => {
      if (prev.skills.includes(id)) {
        return { ...prev, skills: prev.skills.filter((s) => s !== id) };
      }
      if (prev.skills.length >= MAX_SKILLS) return prev;
      return { ...prev, skills: [...prev.skills, id] };
    });
    setSaved(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Photo must be under 5MB");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user?.email || "unknown");
    try {
      const token = getIdToken() || "";
      const res = await fetch("/api/profiles/upload", {
        method: "POST",
        headers: { "x-id-token": token },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        updateField("photoUrl", data.url);
        showToast("success", "Photo uploaded!");
      } else {
        showToast("error", data.error || "Upload failed");
      }
    } catch {
      showToast("error", "Upload failed. Check your connection.");
    }
    setUploading(false);
    // Reset the input so the same file can be picked again after
    // deleting it (browser otherwise ignores the "change" event).
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    if (!user?.email) return;

    const trimmedName = profile.name.trim();
    if (!trimmedName) {
      showToast("error", "Please enter your name");
      return;
    }

    const trimmedLi = profile.linkedinUrl.trim();
    if (
      trimmedLi &&
      !/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(trimmedLi)
    ) {
      showToast(
        "error",
        "LinkedIn link must look like https://linkedin.com/in/yourname"
      );
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      const token = getIdToken() || "";
      const res = await fetch("/api/students/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-id-token": token,
        },
        body: JSON.stringify({
          email: user.email,
          name: trimmedName,
          bio: profile.bio.trim(),
          skills: profile.skills,
          linkedinUrl: trimmedLi,
          // Only send photoUrl if the student already has one (either
          // uploaded OR previously auto-fetched). Sending empty string
          // here would tell the server to blank the photo — we want
          // LinkedIn auto-fetch to run instead when the field is empty.
          ...(profile.photoUrl ? { photoUrl: profile.photoUrl } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Couldn't save. Try again.");
      } else {
        // If the server auto-filled the Google profile photo, reflect
        // it in the form so the student sees the change without a
        // reload.
        if (data.googlePhotoFilled && data.photoUrl) {
          updateField("photoUrl", data.photoUrl);
        }
        setSaved(true);
        showToast(
          "success",
          data.googlePhotoFilled
            ? "Saved! We also filled in your Google profile photo."
            : "Profile saved!"
        );
      }
    } catch {
      showToast("error", "Network error. Please try again.");
    }
    setSaving(false);
  }

  // ─── Not signed in: show Google + enrollment flow ────────────
  if (!isLoggedIn && !loading) {
    return (
      <main className="relative min-h-screen">
        <Navbar showBack title="Your profile" />
        <div className="relative z-10 pt-24 pb-16 px-6 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-4xl mb-4">👤</div>
            <h1 className="text-2xl font-bold mb-2">Your profile</h1>
            <p className="text-sm text-zinc-400">
              Sign in to add a photo, bio, and LinkedIn — classmates will see
              your card on IFS Connect.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {loginStep === "google" ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-xs text-zinc-500 text-center">
                  Your name and email will be used for your profile
                </p>
                <GoogleLogin
                  onSuccess={(response) => {
                    if (!response.credential) return;
                    const decoded = decodeJwt(response.credential);
                    if (decoded?.name && decoded?.email) {
                      setGoogleUser({
                        name: decoded.name,
                        email: decoded.email,
                      });
                      setLoginStep("enroll");
                    }
                  }}
                  onError={() => setLoginError("Google sign-in failed")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                />
                {loginError && (
                  <p className="text-sm text-red-400">{loginError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <p className="text-sm font-medium">{googleUser?.name}</p>
                  <p className="text-xs text-zinc-500">{googleUser?.email}</p>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">
                    Batch
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/20"
                  >
                    <option value="">Select your batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (!enrollmentNo.trim() || !selectedBatch) {
                          setLoginError(
                            "Select your batch and enter enrollment number"
                          );
                          return;
                        }
                        login({
                          name: googleUser!.name,
                          email: googleUser!.email,
                          enrollmentNo: enrollmentNo.trim().toUpperCase(),
                          batchId: selectedBatch,
                        });
                        setProfile((prev) => ({
                          ...prev,
                          name: googleUser!.name,
                        }));
                      }
                    }}
                    placeholder="e.g. A12345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                  />
                </div>

                {loginError && (
                  <p className="text-sm text-red-400">{loginError}</p>
                )}

                <button
                  onClick={() => {
                    if (!enrollmentNo.trim() || !selectedBatch) {
                      setLoginError(
                        "Select your batch and enter enrollment number"
                      );
                      return;
                    }
                    setLoginError("");
                    login({
                      name: googleUser!.name,
                      email: googleUser!.email,
                      enrollmentNo: enrollmentNo.trim().toUpperCase(),
                      batchId: selectedBatch,
                    });
                    setProfile((prev) => ({
                      ...prev,
                      name: googleUser!.name,
                    }));
                  }}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:scale-[1.02] transition-transform"
                >
                  Continue to profile
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title="Your profile" />
        <div className="flex justify-center pt-32">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  // ─── Main edit view ──────────────────────────────────────────
  const bioOver = profile.bio.length > MAX_BIO_LENGTH;

  return (
    <main className="relative min-h-screen">
      <Navbar showBack title="Your profile" />

      <div className="relative z-10 pt-24 pb-16 px-6 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-1">Your profile</h1>
          <p className="text-sm text-zinc-400 mb-8">
            This is how classmates see you on IFS Connect.
          </p>

          {/* Photo + name */}
          <div className="flex items-center gap-5 mb-8">
            <div
              className={`relative group ${
                uploading ? "cursor-wait opacity-80" : "cursor-pointer"
              }`}
              onClick={() => {
                if (uploading) return;
                fileInputRef.current?.click();
              }}
              title="Click to change photo"
            >
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/[0.08] group-hover:border-indigo-500/50 transition-colors relative"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {profile.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt="Your profile photo"
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-600">
                    {profile.name
                      ? profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "?"}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[11px] font-semibold">
                  {uploading ? "Uploading…" : "Change"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[11px] text-zinc-500 mb-1 block">
                Display name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full text-lg font-semibold bg-transparent border-b border-white/[0.08] focus:border-indigo-500/40 outline-none text-white placeholder:text-zinc-600 pb-1 transition-colors"
                placeholder="Your Name"
              />
              <p className="text-[11px] text-zinc-500 mt-1 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
              <span>One-line bio</span>
              <span
                className={`text-[10px] font-normal ${
                  bioOver ? "text-red-400" : "text-zinc-500"
                }`}
              >
                {profile.bio.length}/{MAX_BIO_LENGTH}
              </span>
            </label>
            <input
              type="text"
              value={profile.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="e.g. First-year ICT · loves football · learning Python"
              maxLength={MAX_BIO_LENGTH + 10}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
            />
          </div>

          {/* Interests */}
          <div className="mb-6">
            <label className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
              <span>Your interests (pick up to {MAX_SKILLS})</span>
              <span className="text-[10px] font-normal text-zinc-500">
                {profile.skills.length}/{MAX_SKILLS}
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.map((s) => {
                const selected = profile.skills.includes(s.id);
                const full =
                  !selected && profile.skills.length >= MAX_SKILLS;
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSkill(s.id)}
                    disabled={full}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: selected
                        ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                        : "rgba(255,255,255,0.04)",
                      backgroundImage: selected
                        ? `linear-gradient(135deg, ${s.color
                            .replace("from-", "")
                            .replace(" to-", ", ")})`
                        : undefined,
                      color: selected ? "#fff" : "#a1a1aa",
                      border: `1px solid ${
                        selected
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(255,255,255,0.08)"
                      }`,
                      boxShadow: selected
                        ? "0 2px 8px rgba(99,102,241,0.25)"
                        : "none",
                    }}
                  >
                    <span className="mr-1">{s.emoji}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LinkedIn */}
          <div className="mb-8">
            <label className="text-xs font-semibold text-zinc-300 mb-2 block">
              LinkedIn (optional)
            </label>
            <input
              type="url"
              value={profile.linkedinUrl}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
            />
            <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
              ✨ Paste your LinkedIn link — when you save, we&apos;ll try to
              grab your profile photo automatically. No photo? No problem —
              you can upload one above.
            </p>
          </div>

          {/* Quick-login password (students who signed in with Google can
              also set a password for the enrollment+password path so the
              lab computers work without Google every single time). */}
          <QuickLoginPasswordCard onToast={showToast} />

          {/* Save */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving || bioOver}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}
          >
            {saving
              ? "Saving…"
              : bioOver
                ? `Bio is ${profile.bio.length - MAX_BIO_LENGTH} chars too long`
                : "Save profile"}
          </motion.button>

          {/* After-save action — point them at IFS Connect so they can
              see how classmates view them. */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 rounded-xl p-4 flex items-center justify-between gap-3"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.22)",
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-emerald-300 mb-0.5">
                    ✓ Profile saved
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Your card is live on IFS Connect.
                  </p>
                </div>
                <Link
                  href="/connect"
                  className="shrink-0 text-[12px] font-bold px-4 py-2 rounded-full text-white"
                  style={{
                    background: "linear-gradient(135deg, #10B981, #059669)",
                  }}
                >
                  See your card →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Toast — responsive: caps width to viewport - safe-area on
          mobile, softer corners so long messages wrap cleanly, and
          enough padding to breathe. Previously `rounded-full` +
          no max-width — a success message like "Quick-login password
          saved. You can now sign in with your enrollment number on
          any device" shot off the right edge on a 375px phone. */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 inset-x-4 sm:left-1/2 sm:right-auto sm:bottom-8 sm:-translate-x-1/2 sm:inset-x-auto z-50 sm:max-w-md mx-auto px-5 py-3 rounded-2xl text-[13px] sm:text-sm font-medium text-center leading-relaxed shadow-lg ${
              toast.type === "success"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
