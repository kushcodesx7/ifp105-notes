"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProfileEditModal from "@/components/ProfileEditModal";
import StudentDetailModal from "@/components/StudentDetailModal";
import { useAuth } from "@/lib/auth-context";
import { SKILLS, getSkill } from "@/lib/skills";

interface Student {
  enrollmentNo: string;
  name: string;
  batchId: string;
  section: string;
  linkedinUrl: string | null;
  photoUrl: string | null;
  bio: string | null;
  skills: string[];
  addedAt: string;
  lastThree: string;
}

// Section accent palette (matches the 5 module accents + one extra)
const SECTION_COLORS: Record<string, { from: string; to: string; glow: string; dot: string }> = {
  "Section 1": { from: "#6366F1", to: "#8B5CF6", glow: "rgba(99,102,241,0.35)", dot: "#6366F1" },
  "Section 2": { from: "#10B981", to: "#059669", glow: "rgba(16,185,129,0.35)", dot: "#10B981" },
  "Section 3": { from: "#3B82F6", to: "#06B6D4", glow: "rgba(59,130,246,0.35)", dot: "#3B82F6" },
  "Section 4": { from: "#06B6D4", to: "#0EA5E9", glow: "rgba(6,182,212,0.35)", dot: "#06B6D4" },
  "Section 5": { from: "#8B5CF6", to: "#EC4899", glow: "rgba(139,92,246,0.35)", dot: "#8B5CF6" },
  "Section 6": { from: "#F59E0B", to: "#EF4444", glow: "rgba(245,158,11,0.35)", dot: "#F59E0B" },
};

function sectionColor(section: string) {
  return (
    SECTION_COLORS[section] || {
      from: "#71717a",
      to: "#52525b",
      glow: "rgba(113,113,122,0.25)",
      dot: "#71717a",
    }
  );
}

// Parse a display name — strip leading "NNN_" numeric prefixes so "284_Muhammadaziz"
// becomes "Muhammadaziz" and "221_IFS4_221_Sherzodbek" becomes "Sherzodbek"
function prettyName(raw: string): string {
  if (!raw) return "Unknown";
  const parts = raw.split("_").filter(Boolean);
  // Take parts that aren't purely numeric and aren't short tokens like "IFS4"
  const nameParts = parts.filter((p) => !/^\d+$/.test(p) && !/^IFS\d*$/i.test(p));
  return nameParts.length > 0 ? nameParts.join(" ") : raw;
}

function initials(name: string): string {
  const pretty = prettyName(name);
  return pretty
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

function daysSince(dateStr: string): number {
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return 9999;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

function joinedLabel(dateStr: string): string {
  const d = daysSince(dateStr);
  if (d === 0) return "Joined today";
  if (d === 1) return "Joined yesterday";
  if (d < 7) return `Joined ${d}d ago`;
  if (d < 30) return `Joined ${Math.floor(d / 7)}w ago`;
  return "";
}

export default function IFSConnectPage() {
  const { user, isLoggedIn } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [totalRolls, setTotalRolls] = useState(0);
  const [perSectionTotals, setPerSectionTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [spotlightEnrollment, setSpotlightEnrollment] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetch("/api/connect")
      .then((r) => r.json())
      .then((data) => {
        setStudents(data.students || []);
        setTotalRolls(data.totalRolls || 0);
        setPerSectionTotals(data.perSectionTotals || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Unique sections for filter pills (natural sort)
  const sections = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) if (s.section) set.add(s.section);
    // Also include any sections that have rolls but nobody registered yet
    for (const sec of Object.keys(perSectionTotals)) set.add(sec);
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [students, perSectionTotals]);

  // Recently joined — top 5 most recent
  const recentlyJoined = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 5);
  }, [students]);

  // Skills actually used across registered students (so we only show filter chips
  // for skills anyone picked — avoids a wall of empty filters)
  const availableSkills = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) for (const id of s.skills || []) set.add(id);
    return SKILLS.filter((s) => set.has(s.id));
  }, [students]);

  const filtered = useMemo(() => {
    let list = students;
    if (sectionFilter !== "all") {
      list = list.filter((s) => s.section === sectionFilter);
    }
    if (skillFilter !== "all") {
      list = list.filter((s) => (s.skills || []).includes(skillFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          prettyName(s.name).toLowerCase().includes(q) ||
          s.enrollmentNo.toLowerCase().includes(q)
      );
    }
    // Profile-completeness tier — lower number = higher in list
    //   0: user's own card (always pinned first)
    //   1: bio AND skills (most complete)
    //   2: LinkedIn set (but missing bio or skills)
    //   3: registered only (no LinkedIn, no bio, no skills)
    const tier = (s: Student): number => {
      if (user && s.enrollmentNo === user.enrollmentNo) return 0;
      const hasBio = !!(s.bio && s.bio.trim());
      const hasSkills = (s.skills?.length ?? 0) > 0;
      const hasLinkedIn = !!s.linkedinUrl;
      if (hasBio && hasSkills) return 1;
      if (hasLinkedIn) return 2;
      return 3;
    };

    list = [...list].sort((a, b) => {
      const tierDiff = tier(a) - tier(b);
      if (tierDiff !== 0) return tierDiff;
      // Within the same tier, alphabetical by pretty name
      return prettyName(a.name).localeCompare(prettyName(b.name));
    });
    return list;
  }, [students, sectionFilter, skillFilter, searchQuery, user]);

  const registeredPct = totalRolls > 0 ? Math.round((students.length / totalRolls) * 100) : 0;

  function meetSomeoneNew() {
    if (filtered.length === 0) return;
    // Pick a random student who isn't the user
    const others = filtered.filter((s) => !user || s.enrollmentNo !== user.enrollmentNo);
    if (others.length === 0) return;
    const pick = others[Math.floor(Math.random() * others.length)];
    setSpotlightEnrollment(pick.enrollmentNo);
    // Scroll to the card
    setTimeout(() => {
      const el = document.getElementById(`student-${pick.enrollmentNo}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    // Clear spotlight after a few seconds
    setTimeout(() => setSpotlightEnrollment(null), 3500);
  }

  return (
    <main className="relative min-h-screen">
      <Navbar showBack title="IFS Connect" />

      <div className="pt-20 pb-24 px-5 max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="text-4xl mb-3">🤝</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            IFS Connect
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Meet your classmates across all 6 sections. Connect on LinkedIn
            and grow your network while you learn.
          </p>
        </motion.div>

        {/* Registration progress — overall + per section */}
        {!loading && totalRolls > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-2xl font-bold text-white">{students.length}</span>
                <span className="text-sm text-zinc-500"> / {totalRolls} registered</span>
              </div>
              <span className="text-xs font-semibold text-indigo-300">
                {registeredPct}%{" "}
                <span className="text-zinc-500 font-normal">
                  {registeredPct < 25 ? "— be early!" : registeredPct < 60 ? "— building up!" : "— almost all in!"}
                </span>
              </span>
            </div>
            {/* Overall bar */}
            <div className="h-2 rounded-full overflow-hidden mb-4"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${registeredPct}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }}
              />
            </div>

            {/* Per-section mini bars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {sections.map((sec) => {
                const regCount = students.filter((s) => s.section === sec).length;
                const totalInSec = perSectionTotals[sec] || 0;
                const pct = totalInSec > 0 ? (regCount / totalInSec) * 100 : 0;
                const col = sectionColor(sec);
                return (
                  <div key={sec} className="flex items-center gap-2 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.dot }} />
                    <span className="text-zinc-400 w-[70px] shrink-0 truncate">{sec}</span>
                    <div className="flex-1 h-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: col.dot }}
                      />
                    </div>
                    <span className="text-zinc-500 tabular-nums w-[42px] text-right">
                      {regCount}/{totalInSec}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recently joined strip */}
        {!loading && recentlyJoined.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Recently joined
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              {recentlyJoined.map((s, i) => {
                const col = sectionColor(s.section);
                const isFreshest = i === 0 && daysSince(s.addedAt) <= 1;
                return (
                  <button
                    key={s.enrollmentNo}
                    onClick={() => {
                      const el = document.getElementById(`student-${s.enrollmentNo}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      setSpotlightEnrollment(s.enrollmentNo);
                      setTimeout(() => setSpotlightEnrollment(null), 2500);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-full shrink-0 transition-all hover:scale-[1.03]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${isFreshest ? col.dot + "80" : "rgba(255,255,255,0.06)"}`,
                      boxShadow: isFreshest ? `0 0 16px ${col.glow}` : "none",
                    }}
                  >
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt={prettyName(s.name)} referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${col.from}, ${col.to})` }}
                      >
                        {initials(s.name)}
                      </div>
                    )}
                    <span className="text-[11px] font-medium text-zinc-300 whitespace-nowrap">
                      {prettyName(s.name)}
                    </span>
                    {isFreshest && (
                      <span className="text-[9px] font-bold px-1.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        NEW
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        {!loading && (
          <div className="mb-6 space-y-3">
            {/* Search + random */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                onClick={meetSomeoneNew}
                title="Meet someone new"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03] shrink-0"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                }}
              >
                🎲 <span className="hidden sm:inline">Meet someone</span>
              </button>
            </div>

            {/* Section pills — horizontally scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              <button
                onClick={() => setSectionFilter("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0 ${
                  sectionFilter === "all" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={{
                  background:
                    sectionFilter === "all"
                      ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    sectionFilter === "all" ? "transparent" : "rgba(255,255,255,0.06)"
                  }`,
                }}
              >
                All ({students.length})
              </button>
              {sections.map((sec) => {
                const count = students.filter((s) => s.section === sec).length;
                const isMySection = user?.section === sec;
                const col = sectionColor(sec);
                const isActive = sectionFilter === sec;
                return (
                  <button
                    key={sec}
                    onClick={() => setSectionFilter(sec)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0 ${
                      isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${col.from}, ${col.to})`
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isActive ? "transparent" : "rgba(255,255,255,0.06)"}`,
                      boxShadow: isActive ? `0 4px 14px ${col.glow}` : "none",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: col.dot }} />
                    {sec} ({count})
                    {isMySection && <span className="text-[10px]">👤</span>}
                  </button>
                );
              })}
            </div>

            {/* Skill filter — only show if anyone has picked skills */}
            {availableSkills.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 shrink-0 self-center">
                  Interests:
                </span>
                <button
                  onClick={() => setSkillFilter("all")}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all shrink-0 ${
                    skillFilter === "all"
                      ? "bg-white/[0.1] text-white"
                      : "bg-white/[0.03] text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  All
                </button>
                {availableSkills.map((s) => {
                  const isActive = skillFilter === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSkillFilter(s.id)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all shrink-0 ${
                        isActive
                          ? `bg-gradient-to-r ${s.color} text-white shadow-md`
                          : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <span>{s.emoji}</span>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Students grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm text-zinc-400 mb-1">
              {students.length === 0
                ? "No registered students yet."
                : "No students match your filters."}
            </p>
            <p className="text-xs text-zinc-600">
              {students.length === 0 && !isLoggedIn &&
                "Be the first! Sign in and register to appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {filtered.map((student, i) => {
                const isMe = user?.enrollmentNo === student.enrollmentNo;
                const col = sectionColor(student.section);
                const hasLinkedIn = !!student.linkedinUrl;
                const isSpotlight = spotlightEnrollment === student.enrollmentNo;
                const joinLabel = joinedLabel(student.addedAt);

                return (
                  <motion.div
                    key={student.enrollmentNo}
                    id={`student-${student.enrollmentNo}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isSpotlight ? 1.04 : 1,
                    }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    whileHover={{ y: -4 }}
                    onClick={() => setDetailStudent(student)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setDetailStudent(student);
                      }
                    }}
                    className="relative p-5 rounded-2xl card-glass group transition-shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    style={{
                      border: isMe
                        ? "1.5px solid rgba(250,204,21,0.45)"
                        : hasLinkedIn
                        ? `1px solid ${col.dot}30`
                        : "1px solid rgba(255,255,255,0.06)",
                      boxShadow: isSpotlight
                        ? `0 0 0 3px ${col.dot}, 0 20px 48px ${col.glow}`
                        : isMe
                        ? "0 8px 32px rgba(250,204,21,0.15)"
                        : undefined,
                    }}
                  >
                    {/* Top-right badge row */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {isMe && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"
                          style={{
                            background: "linear-gradient(135deg, #FACC15, #F59E0B)",
                            color: "#422006",
                          }}
                        >
                          ⭐ You
                        </span>
                      )}
                    </div>

                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative shrink-0">
                        {student.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={student.photoUrl}
                            alt={prettyName(student.name)}
                            className="w-14 h-14 rounded-full object-cover"
                            style={{ border: `2px solid ${col.dot}50` }}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                              border: `2px solid ${col.dot}50`,
                            }}
                          >
                            {initials(student.name)}
                          </div>
                        )}
                        {/* Section color dot overlay */}
                        <span
                          className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
                          style={{
                            background: col.dot,
                            borderColor: "#0a0a12",
                          }}
                          title={student.section}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate leading-tight">
                          {prettyName(student.name)}
                        </p>
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                          <span>{student.section}</span>
                          <span className="text-zinc-700">·</span>
                          <span>#{student.lastThree}</span>
                        </p>
                        {joinLabel && (
                          <p className="text-[10px] text-zinc-600 mt-0.5">{joinLabel}</p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {student.bio && (
                      <p className="text-[11px] text-zinc-400 leading-relaxed mb-3 italic line-clamp-2">
                        &ldquo;{student.bio}&rdquo;
                      </p>
                    )}

                    {/* Skill badges (up to 3) */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {student.skills.slice(0, 3).map((id) => {
                          const sk = getSkill(id);
                          if (!sk) return null;
                          return (
                            <span
                              key={id}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 bg-gradient-to-r ${sk.color} text-white`}
                            >
                              <span>{sk.emoji}</span>
                              {sk.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-stretch gap-2">
                      {hasLinkedIn ? (
                        <a
                          href={student.linkedinUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.99]"
                          style={{
                            background: "#0A66C2",
                            boxShadow: "0 2px 10px rgba(10,102,194,0.35)",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          Connect on LinkedIn
                        </a>
                      ) : isMe ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02]"
                          style={{
                            background: "linear-gradient(135deg, #FACC15, #F59E0B)",
                            color: "#422006",
                            boxShadow: "0 2px 10px rgba(250,204,21,0.25)",
                          }}
                          title="Add your LinkedIn so classmates can connect with you"
                        >
                          + Add your LinkedIn
                        </button>
                      ) : (
                        <div className="flex-1 px-3 py-2.5 rounded-lg text-[11px] text-zinc-500 text-center bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-1.5">
                          <span className="opacity-50">🔗</span>
                          LinkedIn not added yet
                        </div>
                      )}

                      {/* Edit pencil — only on own card */}
                      {isMe && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditOpen(true);
                          }}
                          className="px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all shrink-0"
                          title="Edit your profile"
                          aria-label="Edit profile"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Student detail modal — opens on any card click */}
      <StudentDetailModal
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
        sectionColor={sectionColor}
        prettyName={prettyName}
        initials={initials}
        joinedLabel={joinedLabel}
      />

      {/* Profile edit modal — own profile */}
      {user && (
        <ProfileEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          email={user.email}
          initialBio={students.find((s) => s.enrollmentNo === user.enrollmentNo)?.bio || ""}
          initialSkills={students.find((s) => s.enrollmentNo === user.enrollmentNo)?.skills || []}
          initialLinkedIn={students.find((s) => s.enrollmentNo === user.enrollmentNo)?.linkedinUrl || ""}
          onSaved={(next) => {
            // Optimistically update local state
            setStudents((prev) =>
              prev.map((s) =>
                s.enrollmentNo === user.enrollmentNo
                  ? { ...s, bio: next.bio, skills: next.skills, linkedinUrl: next.linkedinUrl || null }
                  : s
              )
            );
          }}
        />
      )}
    </main>
  );
}
