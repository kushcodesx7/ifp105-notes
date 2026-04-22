"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SKILLS, MAX_SKILLS, MAX_BIO_LENGTH } from "@/lib/skills";
import { useAuth } from "@/lib/auth-context";
import { useFocusTrap } from "@/lib/use-focus-trap";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  initialBio: string;
  initialSkills: string[];
  initialLinkedIn: string;
  /** Current photo URL on the student's row. Modal shows it as a
   *  circular preview + lets the student replace it. Null/empty
   *  means "no photo yet" (shows initials). */
  initialPhotoUrl?: string | null;
  onSaved: (next: {
    bio: string;
    skills: string[];
    linkedinUrl: string;
    photoUrl: string | null;
  }) => void;
}

export default function ProfileEditModal({
  open,
  onClose,
  email,
  initialBio,
  initialSkills,
  initialLinkedIn,
  initialPhotoUrl,
  onSaved,
}: ProfileEditModalProps) {
  const { getIdToken } = useAuth();
  const [bio, setBio] = useState(initialBio);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [linkedIn, setLinkedIn] = useState(initialLinkedIn);
  // Photo state added Apr 2026. Students on /connect used to have
  // no way to change their photo from this modal — they had to
  // navigate to /profile/edit. Now they can upload right here and
  // the same URL writes to students.photo_url, so /connect cards +
  // admin drawer + home widgets all see the same photo immediately.
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initialPhotoUrl ?? null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset fields when modal is (re)opened
  useEffect(() => {
    if (open) {
      setBio(initialBio);
      setSkills(initialSkills);
      setLinkedIn(initialLinkedIn);
      setPhotoUrl(initialPhotoUrl ?? null);
      setError("");
    }
  }, [open, initialBio, initialSkills, initialLinkedIn, initialPhotoUrl]);

  // Esc closes (matches every other dialog). Gated on `open` so we don't
  // fight other modals' keydown listeners when closed.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Trap Tab inside the dialog so keyboard focus can't wander to the
  // page behind the backdrop.
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  function toggleSkill(id: string) {
    setSkills((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SKILLS) return prev;
      return [...prev, id];
    });
  }

  async function handlePhotoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB.");
      return;
    }
    const token = getIdToken();
    if (!token) {
      setError("Please sign in again to upload a photo.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email);
      const res = await fetch("/api/profiles/upload", {
        method: "POST",
        headers: { "x-id-token": token },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setPhotoUrl(data.url);
      } else {
        setError(data.error || "Photo upload failed.");
      }
    } catch {
      setError("Network error uploading photo.");
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-picked if needed.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function save() {
    setError("");
    const token = getIdToken();
    if (!token) {
      setError("Please sign in again to save your profile.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/students/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-id-token": token,
        },
        body: JSON.stringify({
          email,
          bio: bio.trim(),
          skills,
          linkedinUrl: linkedIn.trim(),
          // Only include photoUrl when the student has one — sending
          // undefined lets /api/students/profile's Google-photo
          // auto-fill kick in for students who signed in with Google
          // but don't have a custom photo yet.
          ...(photoUrl ? { photoUrl } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save. Try again.");
        return;
      }
      // If the server auto-filled a Google photo (because we sent no
      // photoUrl and the student's photo_url was empty), reflect the
      // returned URL so the parent gets the correct value.
      const finalPhoto =
        data.photoUrl || photoUrl || initialPhotoUrl || null;
      onSaved({
        bio: bio.trim(),
        skills,
        linkedinUrl: linkedIn.trim(),
        photoUrl: finalPhoto,
      });
      onClose();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-edit-title"
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg rounded-2xl relative max-h-[90vh] overflow-y-auto"
            style={{
              background: "linear-gradient(135deg, rgba(15,15,25,0.98), rgba(12,12,20,0.98))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          >
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 id="profile-edit-title" className="text-lg font-bold text-white">Edit your profile</h2>
                  <p className="text-xs text-zinc-500">
                    Make your card stand out on IFS Connect
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors -mr-1 -mt-1 p-1"
                  aria-label="Close"
                >
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Photo — upload + preview. Student sees their current
                  photo as a circle; clicking it (or the Change
                  button) opens a file picker. Uploaded photos are
                  hosted on our Supabase storage bucket; the returned
                  URL writes to students.photo_url on save, so the
                  same photo instantly shows on the student's /connect
                  card + home-page top-learners widget + admin drawer. */}
              <div className="flex items-center gap-4">
                <div
                  className={`relative shrink-0 group ${
                    uploading ? "cursor-wait opacity-80" : "cursor-pointer"
                  }`}
                  onClick={() => {
                    if (uploading) return;
                    fileInputRef.current?.click();
                  }}
                  title="Click to change photo"
                >
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/[0.08] group-hover:border-indigo-500/50 transition-colors relative flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt="Your profile photo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xl font-bold text-zinc-600">
                        ?
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-semibold">
                        {uploading ? "…" : "Change"}
                      </span>
                    </div>
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
                  <div className="text-sm font-semibold text-zinc-200 mb-0.5">
                    Profile photo
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Click the circle to upload a new photo. Shows on
                    every page classmates see you on. Max 5MB.
                  </p>
                  {photoUrl && (
                    <button
                      onClick={() => setPhotoUrl(null)}
                      className="text-[10px] text-red-400 hover:text-red-300 mt-1"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span>One-line bio</span>
                  <span className={`text-[10px] font-normal ${bio.length > MAX_BIO_LENGTH ? "text-red-400" : "text-zinc-500"}`}>
                    {bio.length}/{MAX_BIO_LENGTH}
                  </span>
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
                  placeholder="e.g., Future data scientist · loves football ⚽"
                  maxLength={MAX_BIO_LENGTH}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span>Your interests (pick up to {MAX_SKILLS})</span>
                  <span className="text-[10px] font-normal text-zinc-500">
                    {skills.length}/{MAX_SKILLS}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((s) => {
                    const selected = skills.includes(s.id);
                    const disabled = !selected && skills.length >= MAX_SKILLS;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkill(s.id)}
                        disabled={disabled}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 ${
                          selected
                            ? `bg-gradient-to-r ${s.color} text-white shadow-md`
                            : disabled
                            ? "bg-white/[0.02] text-zinc-600 cursor-not-allowed border border-white/[0.04]"
                            : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                        }`}
                      >
                        <span>{s.emoji}</span>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-2 block">
                  LinkedIn URL <span className="text-zinc-600 font-normal">(optional but encouraged)</span>
                </label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <p className="text-[10px] text-zinc-600 mt-1.5">
                  Adding LinkedIn gives your card a blue glow and lets classmates connect.
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-white/[0.03] hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  }}
                >
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
