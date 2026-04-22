"use client";

import { useEffect, useState, useMemo, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProfileEditModal from "@/components/ProfileEditModal";
import StudentDetailModal from "@/components/StudentDetailModal";
import { useAuth } from "@/lib/auth-context";
import { SKILLS, getSkill } from "@/lib/skills";
import { sizedAvatar } from "@/lib/avatar";
import { sectionColor } from "@/lib/sectionColors";
import { prettyName, initials } from "@/lib/names";
import { parseUtcIso } from "@/lib/parse-utc";

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
  completionPct?: number;
}

// Section palette + lookup moved to @/lib/sectionColors so Connect, the
// home widgets, and the activity strip all share one source of truth.
// Keeping `SECTION_COLORS` alias here so any inline references compile.

// prettyName + initials moved to @/lib/names (single source of truth
// shared with HomeConnectGlimpse + HomeActivityStrip + admin views).

function daysSince(dateStr: string): number {
  // parseUtcIso — force UTC for naive Supabase timestamps so Tashkent
  // (UTC+5) students don't see "joined 5h ago" for events that just
  // happened now.
  const t = parseUtcIso(dateStr);
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
  const { user, isLoggedIn, getIdToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [totalRolls, setTotalRolls] = useState(0);
  const [perSectionTotals, setPerSectionTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  // `loadError` distinguishes "still loading" from "finished with no data
  // because the API failed". Previously a network failure silently
  // flipped `loading` off and the student saw an empty grid, which made
  // it look like their class was empty instead of offering a retry.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [spotlightEnrollment, setSpotlightEnrollment] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  useEffect(() => {
    let alive = true;
    async function loadConnect() {
      try {
        // Send the id token if available. The server includes hidden-section
        // profiles (e.g. "Test Section") only when the caller is admin or
        // themselves belongs to a hidden section. Others get the public feed.
        const token = getIdToken();
        const headers: Record<string, string> = {};
        if (token) headers["x-id-token"] = token;
        const r = await fetch("/api/connect", { headers });
        if (!r.ok) {
          if (alive) {
            setLoadError(`Couldn't load your classmates (${r.status}).`);
            setLoading(false);
          }
          return;
        }
        const data = await r.json();
        if (!alive) return;
        setStudents(data.students || []);
        setTotalRolls(data.totalRolls || 0);
        setPerSectionTotals(data.perSectionTotals || {});
        setLoadError(null);
        setLoading(false);
      } catch (e) {
        if (alive) {
          setLoadError(
            (e as Error)?.message
              ? `Couldn't load your classmates — ${(e as Error).message}`
              : "Couldn't load your classmates. Check your connection."
          );
          setLoading(false);
        }
      }
    }
    // Initial fetch
    loadConnect();
    // Poll every 60s while the tab is open so newly-joined students appear live
    const tick = setInterval(() => {
      if (document.visibilityState === "visible") loadConnect();
    }, 60_000);
    // Also refetch immediately when the tab regains focus. Gate on
    // `visibilityState === "visible"` so we don't double-fetch — the
    // event fires on BOTH hide and show transitions.
    const onFocus = () => {
      if (document.visibilityState === "visible") loadConnect();
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      alive = false;
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  // Unique sections for filter pills (natural sort) + precomputed
  // per-section registered counts. Single pass over `students` so the
  // bars render in O(n) instead of O(S·n) (was calling
  // `students.filter(...).length` inside sections.map on every render).
  const { sections, regCountBySection } = useMemo(() => {
    const regCount: Record<string, number> = {};
    for (const s of students) {
      if (s.section) regCount[s.section] = (regCount[s.section] || 0) + 1;
    }
    const set = new Set<string>(Object.keys(regCount));
    // Also include any sections that have rolls but nobody registered yet
    for (const sec of Object.keys(perSectionTotals)) set.add(sec);
    const list = Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    return { sections: list, regCountBySection: regCount };
  }, [students, perSectionTotals]);

  // Recently joined — top 5 most recent
  const recentlyJoined = useMemo(() => {
    return [...students]
      .sort(
        (a, b) => parseUtcIso(b.addedAt) - parseUtcIso(a.addedAt)
      )
      .slice(0, 5);
  }, [students]);

  // Skills actually used across registered students (so we only show filter chips
  // for skills anyone picked — avoids a wall of empty filters)
  const availableSkills = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) for (const id of s.skills || []) set.add(id);
    return SKILLS.filter((s) => set.has(s.id));
  }, [students]);

  // Defer the search query for the filter pass. The input itself stays
  // responsive (keystrokes update `searchQuery` instantly), but the 221-
  // student filter + 221-card render uses the deferred copy so a burst
  // of typing doesn't recompute/re-render per keystroke — React batches
  // until the input idles. Zero-deps React 18 built-in.
  const deferredSearch = useDeferredValue(searchQuery);

  const filtered = useMemo(() => {
    let list = students;
    if (sectionFilter !== "all") {
      list = list.filter((s) => s.section === sectionFilter);
    }
    if (skillFilter !== "all") {
      list = list.filter((s) => (s.skills || []).includes(skillFilter));
    }
    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      list = list.filter(
        (s) =>
          prettyName(s.name).toLowerCase().includes(q) ||
          s.enrollmentNo.toLowerCase().includes(q)
      );
    }
    // Profile-completeness tier — lower number = higher in list.
    //
    // Teacher report Apr 2026: "why are profiles with no LinkedIn
    // showing in the middle between LinkedIn ones? If no LinkedIn,
    // show them AFTER all LinkedIn cards." Previously this ranked
    // skills ABOVE LinkedIn — so a skills-only profile (tier 1)
    // would appear BEFORE a LinkedIn profile that had neither
    // skills nor bio (tier 3), even though the LinkedIn one is the
    // actually-connectable card.
    //
    // New ordering: LinkedIn presence is the PRIMARY sort key;
    // completeness (skills/bio) is the tie-break within each
    // LinkedIn bucket.
    //
    //   0: user's own card (always pinned first)
    //   1: LinkedIn + skills        — most "connectable" classmates
    //   2: LinkedIn + bio
    //   3: LinkedIn only
    //   4: no LinkedIn, has skills  — still signals engagement
    //   5: no LinkedIn, has bio
    //   6: registered only
    const tier = (s: Student): number => {
      if (user && s.enrollmentNo === user.enrollmentNo) return 0;
      const hasSkills = (s.skills?.length ?? 0) > 0;
      const hasBio = !!(s.bio && s.bio.trim());
      const hasLinkedIn = !!s.linkedinUrl;
      if (hasLinkedIn) {
        if (hasSkills) return 1;
        if (hasBio) return 2;
        return 3;
      }
      if (hasSkills) return 4;
      if (hasBio) return 5;
      return 6;
    };

    list = [...list].sort((a, b) => {
      const tierDiff = tier(a) - tier(b);
      if (tierDiff !== 0) return tierDiff;
      // Within the same tier, alphabetical by pretty name
      return prettyName(a.name).localeCompare(prettyName(b.name));
    });
    return list;
  }, [students, sectionFilter, skillFilter, deferredSearch, user]);

  const registeredPct = totalRolls > 0 ? Math.round((students.length / totalRolls) * 100) : 0;

  // "Break the ice" — pick a random classmate to connect with.
  // Only picks students who have LinkedIn set (so the CTA on their card is
  // actually actionable — no point pushing the student toward someone they
  // can't connect with).
  function breakTheIce() {
    if (filtered.length === 0) return;
    const pool = filtered.filter(
      (s) =>
        !!s.linkedinUrl && (!user || s.enrollmentNo !== user.enrollmentNo)
    );
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSpotlightEnrollment(pick.enrollmentNo);
    setTimeout(() => {
      const el = document.getElementById(`student-${pick.enrollmentNo}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    setTimeout(() => setSpotlightEnrollment(null), 3500);
  }

  // How many LinkedIn-connected classmates (excluding self) are available?
  const icebreakerPoolSize = filtered.filter(
    (s) => !!s.linkedinUrl && (!user || s.enrollmentNo !== user.enrollmentNo)
  ).length;

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
                const regCount = regCountBySection[sec] || 0;
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
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-fade-x"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              {recentlyJoined.map((s, i) => {
                const col = sectionColor(s.section);
                // Mark up to the first 3 as NEW if they joined in the last 24h.
                const isFreshest = i < 3 && daysSince(s.addedAt) <= 1;
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
                      <img
                        src={sizedAvatar(s.photoUrl, 48)}
                        alt={prettyName(s.name)}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                        width={24}
                        height={24}
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
                onClick={breakTheIce}
                disabled={icebreakerPoolSize === 0}
                aria-label={
                  icebreakerPoolSize === 0
                    ? "Random match — no LinkedIn-connected classmates match your filter yet"
                    : "Spotlight a random LinkedIn-connected classmate"
                }
                title={
                  icebreakerPoolSize === 0
                    ? "No LinkedIn-connected classmates match your filter yet"
                    : "Spotlight a random classmate with LinkedIn"
                }
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03] shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                }}
              >
                <span aria-hidden="true">🎯</span>
                <span className="hidden sm:inline"> Random match</span>
              </button>
            </div>

            {/* Section pills — horizontally scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-fade-x"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              <button
                onClick={() => setSectionFilter("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 shrink-0 ${
                  sectionFilter === "all" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={{
                  background:
                    sectionFilter === "all"
                      ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
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
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 shrink-0 ${
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
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-fade-x"
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

        {/* "Complete your profile" nudge — only shown for the current user
             if they're registered but haven't filled in bio / skills / linkedin.
             Clicking opens the edit modal. Gives them the single highest-
             impact action for making Connect feel alive. */}
        {isLoggedIn && user && (() => {
          const me = students.find(
            (s) => s.enrollmentNo === user.enrollmentNo
          );
          if (!me) return null;
          const hasBio = !!(me.bio && me.bio.trim());
          const hasSkills = (me.skills?.length ?? 0) > 0;
          const hasLinkedIn = !!me.linkedinUrl;
          const complete = hasBio && hasSkills && hasLinkedIn;
          if (complete) return null;
          return (
            <div
              className="mb-4 p-4 rounded-2xl"
              style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-indigo-200 mb-1">
                    ✨ Your profile needs a few more things
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        background: hasBio
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(255,255,255,0.04)",
                        color: hasBio ? "#6ee7b7" : "#a1a1aa",
                      }}
                    >
                      {hasBio ? "✓" : "○"} Bio
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        background: hasSkills
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(255,255,255,0.04)",
                        color: hasSkills ? "#6ee7b7" : "#a1a1aa",
                      }}
                    >
                      {hasSkills ? "✓" : "○"} Interests
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        background: hasLinkedIn
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(255,255,255,0.04)",
                        color: hasLinkedIn ? "#6ee7b7" : "#a1a1aa",
                      }}
                    >
                      {hasLinkedIn ? "✓" : "○"} LinkedIn
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                    Complete profiles show up first — classmates with interests
                    in common can find each other.
                  </p>
                </div>
                <button
                  onClick={() => setEditOpen(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full text-white active:scale-95 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                  }}
                >
                  Complete profile →
                </button>
              </div>
            </div>
          );
        })()}

        {/* Students grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          // Distinguishable from the empty state — previously a fetch
          // failure silently fell through to "No registered students"
          // which misled students whose class was actually full.
          <div className="text-center py-16">
            <div className="text-4xl mb-3" aria-hidden="true">⚠️</div>
            <p className="text-sm text-zinc-300 mb-1">{loadError}</p>
            <button
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                // Trigger a fresh load by incrementing the dep-free effect.
                // Simpler path: call the same endpoint inline.
                (async () => {
                  try {
                    const token = getIdToken();
                    const headers: Record<string, string> = {};
                    if (token) headers["x-id-token"] = token;
                    const r = await fetch("/api/connect", { headers });
                    if (!r.ok) {
                      setLoadError(`Couldn't load your classmates (${r.status}).`);
                      return;
                    }
                    const data = await r.json();
                    setStudents(data.students || []);
                    setTotalRolls(data.totalRolls || 0);
                    setPerSectionTotals(data.perSectionTotals || {});
                    setLoadError(null);
                  } catch (e) {
                    setLoadError(
                      (e as Error)?.message ||
                        "Couldn't load your classmates."
                    );
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
              className="mt-3 text-xs font-semibold text-indigo-300 hover:text-indigo-200 underline underline-offset-4"
            >
              Try again
            </button>
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
          // Filter changes used to take up to 500ms (card stagger delay cap)
          // plus a fade-out exit animation. Combined with the card's
          // backdrop-filter: blur(12px) this looked like "the page is loading"
          // when it was purely client-side filtering. Stagger is now capped
          // at ~100ms and cards exit instantly (no exit prop) so clicking a
          // section pill feels snappy.
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isSpotlight ? 1.04 : 1,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(i * 0.008, 0.1),
                      ease: [0.16, 1, 0.3, 1],
                    }}
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
                    className="relative p-5 rounded-2xl card-glass group transition-shadow cursor-pointer"
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
                    {/* Avatar + name. The "YOU" badge used to live
                        absolute-positioned in the card's top-right
                        corner (separate div above this row). When a
                        student had a long name like
                        "Nabixodjayev Abdufattoxxo ja", the absolute
                        badge would overlap the name because truncate
                        doesn't know the badge exists.
                        Now the badge is INSIDE the name row as an
                        inline flex child with shrink-0. The name
                        (flex-1 min-w-0 truncate) naturally adjusts
                        around it regardless of length. */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative shrink-0">
                        {student.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={sizedAvatar(student.photoUrl, 112)}
                            alt={prettyName(student.name)}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover"
                            style={{ border: `2px solid ${col.dot}50` }}
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
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-zinc-100 truncate leading-tight flex-1 min-w-0">
                            {prettyName(student.name)}
                          </p>
                          {isMe && (
                            <span
                              className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1"
                              style={{
                                background:
                                  "linear-gradient(135deg, #FACC15, #F59E0B)",
                                color: "#422006",
                              }}
                              title="This is your own card"
                            >
                              ⭐ You
                            </span>
                          )}
                        </div>
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

                    {/* Progress — always visible (own card + everyone else) */}
                    {(() => {
                      const pct = student.completionPct ?? 0;
                      if (pct < 20) {
                        return (
                          <div className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                            🚀 Just getting started
                          </div>
                        );
                      }
                      return (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                              {isMe ? "Your progress" : "Progress"}
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: col.dot }}>
                              {pct}%
                            </span>
                          </div>
                          <div
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${isMe ? "Your progress" : "Progress"}: ${pct}% of the course complete`}
                            className="h-1 rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, background: col.dot }}
                            />
                          </div>
                        </div>
                      );
                    })()}

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

                    {/* Actions — branch on isMe FIRST so a student
                        looking at their own card never sees a
                        "Connect on LinkedIn" button that would send
                        them to their own profile. Previously the
                        check order was `hasLinkedIn ? ... : isMe ?`
                        so a student who had filled in their LinkedIn
                        got a CTA to connect with themselves. Now:
                          · Own card + has LinkedIn → "View my LinkedIn"
                          · Own card + no LinkedIn → "+ Add your LinkedIn"
                          · Other card + has LinkedIn → "Connect on LinkedIn"
                          · Other card + no LinkedIn → "LinkedIn not added yet"
                    */}
                    <div className="flex items-stretch gap-2">
                      {isMe && hasLinkedIn ? (
                        <a
                          href={student.linkedinUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.99]"
                          style={{
                            background: "rgba(10,102,194,0.18)",
                            border: "1px solid rgba(10,102,194,0.35)",
                            color: "#93C5FD",
                          }}
                          title="Opens your LinkedIn profile in a new tab"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          View my LinkedIn
                        </a>
                      ) : hasLinkedIn ? (
                        <a
                          href={student.linkedinUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.99]"
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
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg text-xs font-bold transition-all hover:scale-[1.02]"
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
                        <div className="flex-1 px-3 py-3 rounded-lg text-[11px] text-zinc-500 text-center bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-1.5">
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
                          // Meets WCAG 2.5.5: w-11 ≈ 44px on mobile.
                          className="w-11 sm:w-auto px-3 py-3 sm:py-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all shrink-0 flex items-center justify-center"
                          title="Edit your profile"
                          aria-label="Edit profile"
                        >
                          <span aria-hidden="true">✏️</span>
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
          // Pass current photo so the modal can preview + replace it.
          // When onSaved returns a new photoUrl, we mirror it into
          // local state so the student's /connect card updates on
          // the spot without waiting for the next /api/connect poll.
          initialPhotoUrl={students.find((s) => s.enrollmentNo === user.enrollmentNo)?.photoUrl || null}
          onSaved={(next) => {
            setStudents((prev) =>
              prev.map((s) =>
                s.enrollmentNo === user.enrollmentNo
                  ? {
                      ...s,
                      bio: next.bio,
                      skills: next.skills,
                      linkedinUrl: next.linkedinUrl || null,
                      photoUrl: next.photoUrl,
                    }
                  : s
              )
            );
          }}
        />
      )}
    </main>
  );
}
