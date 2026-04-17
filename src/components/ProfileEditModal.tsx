"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SKILLS, MAX_SKILLS, MAX_BIO_LENGTH } from "@/lib/skills";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  initialBio: string;
  initialSkills: string[];
  initialLinkedIn: string;
  onSaved: (next: { bio: string; skills: string[]; linkedinUrl: string }) => void;
}

export default function ProfileEditModal({
  open,
  onClose,
  email,
  initialBio,
  initialSkills,
  initialLinkedIn,
  onSaved,
}: ProfileEditModalProps) {
  const [bio, setBio] = useState(initialBio);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [linkedIn, setLinkedIn] = useState(initialLinkedIn);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset fields when modal is (re)opened
  useEffect(() => {
    if (open) {
      setBio(initialBio);
      setSkills(initialSkills);
      setLinkedIn(initialLinkedIn);
      setError("");
    }
  }, [open, initialBio, initialSkills, initialLinkedIn]);

  function toggleSkill(id: string) {
    setSkills((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SKILLS) return prev;
      return [...prev, id];
    });
  }

  async function save() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/students/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          bio: bio.trim(),
          skills,
          linkedinUrl: linkedIn.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save. Try again.");
        return;
      }
      onSaved({ bio: bio.trim(), skills, linkedinUrl: linkedIn.trim() });
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
        >
          <motion.div
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
                  <h2 className="text-lg font-bold text-white">Edit your profile</h2>
                  <p className="text-xs text-zinc-500">
                    Make your card stand out on IFS Connect
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors -mr-1 -mt-1 p-1"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
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
