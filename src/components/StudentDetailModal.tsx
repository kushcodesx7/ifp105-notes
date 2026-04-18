"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SKILLS } from "@/lib/skills";

interface Student {
  enrollmentNo: string;
  name: string;
  section: string;
  linkedinUrl: string | null;
  photoUrl: string | null;
  bio: string | null;
  skills: string[];
  addedAt: string;
  lastThree: string;
  completionPct?: number;
}

interface SectionColor {
  from: string;
  to: string;
  glow: string;
  dot: string;
}

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  sectionColor: (section: string) => SectionColor;
  prettyName: (raw: string) => string;
  initials: (name: string) => string;
  joinedLabel: (dateStr: string) => string;
}

export default function StudentDetailModal({
  student,
  onClose,
  sectionColor,
  prettyName,
  initials,
  joinedLabel,
}: StudentDetailModalProps) {
  const open = !!student;
  const col = student ? sectionColor(student.section) : null;
  const name = student ? prettyName(student.name) : "";
  const joined = student ? joinedLabel(student.addedAt) : "";
  const hasLinkedIn = !!student?.linkedinUrl;

  // Esc closes (matches every other dialog in the app).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Resolve skill IDs to skill objects (preserve pick order)
  const skillDetails = student?.skills
    ? student.skills
        .map((id) => SKILLS.find((s) => s.id === id))
        .filter((s): s is (typeof SKILLS)[number] => !!s)
    : [];

  return (
    <AnimatePresence>
      {open && student && col && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Profile details for ${name || "student"}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-2xl relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15,15,25,0.98), rgba(12,12,20,0.98))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${col.dot}20`,
            }}
          >
            {/* Colored banner header */}
            <div
              className="h-20 relative"
              style={{
                background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur"
                aria-label="Close"
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M5 5l8 8M13 5l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Avatar overlapping banner */}
            <div className="px-6 -mt-10 relative">
              <div className="relative inline-block">
                {student.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.photoUrl}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover"
                    style={{ border: `3px solid #0c0c14` }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                      border: `3px solid #0c0c14`,
                    }}
                  >
                    {initials(student.name)}
                  </div>
                )}
                {/* Section color dot */}
                <span
                  className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2"
                  style={{
                    background: col.dot,
                    borderColor: "#0c0c14",
                  }}
                  title={student.section}
                />
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pt-3 pb-6">
              <h2 className="text-xl font-bold text-white leading-tight mb-1">{name}</h2>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                  style={{
                    background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  {student.section}
                </span>
                <span className="text-[11px] text-zinc-500">Roll #{student.lastThree}</span>
                {joined && (
                  <>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[11px] text-zinc-500">{joined}</span>
                  </>
                )}
              </div>

              {/* Progress (always public) */}
              {(() => {
                const pct = student.completionPct ?? 0;
                if (pct < 20) {
                  return (
                    <div className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                      🚀 Just getting started
                    </div>
                  );
                }
                return (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Course progress
                      </span>
                      <span className="text-xs font-bold" style={{ color: col.dot }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${col.from}, ${col.to})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Bio */}
              {student.bio ? (
                <div
                  className="mb-4 p-3 rounded-xl text-sm text-zinc-300 leading-relaxed italic"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderLeft: `3px solid ${col.dot}`,
                  }}
                >
                  &ldquo;{student.bio}&rdquo;
                </div>
              ) : (
                <p className="text-xs text-zinc-600 italic mb-4">No bio added yet.</p>
              )}

              {/* Skills */}
              {skillDetails.length > 0 ? (
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillDetails.map((s) => (
                      <span
                        key={s.id}
                        className={`text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 bg-gradient-to-r ${s.color} text-white shadow-md`}
                      >
                        <span>{s.emoji}</span>
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-600 italic mb-5">No interests picked yet.</p>
              )}

              {/* LinkedIn CTA */}
              {hasLinkedIn ? (
                <a
                  href={student.linkedinUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.99]"
                  style={{
                    background: "#0A66C2",
                    boxShadow: "0 4px 16px rgba(10,102,194,0.4)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Connect on LinkedIn
                </a>
              ) : (
                <div className="w-full px-4 py-3 rounded-xl text-xs text-zinc-500 text-center bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2">
                  <span className="opacity-50">🔗</span>
                  LinkedIn not added yet — check back later
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
