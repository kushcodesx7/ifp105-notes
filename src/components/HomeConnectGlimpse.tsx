"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getSkill } from "@/lib/skills";
import { sizedAvatar } from "@/lib/avatar";
import HomeActivityStrip from "@/components/HomeActivityStrip";

interface RecentJoiner {
  enrollmentNo: string;
  name: string;
  section: string | null;
  photoUrl: string | null;
  lastThree: string;
}

interface TopLearner {
  enrollmentNo: string;
  name: string;
  section: string | null;
  photoUrl: string | null;
  bio: string | null;
  skills: string[];
  lastThree: string;
  completionPct: number;
  topicsThisWeek: number;
}

interface SectionLeader {
  section: string;
  pct: number;
  registered: number;
  total: number;
}

interface Glimpse {
  totalRegistered: number;
  totalRolls: number;
  recentJoiners: RecentJoiner[];
  topLearnersThisWeek: TopLearner[];
  sectionLeader: SectionLeader | null;
}

// Section accent palette — kept in sync with /connect page
const SECTION_COLORS: Record<string, { from: string; to: string; dot: string }> = {
  "Section 1": { from: "#6366F1", to: "#8B5CF6", dot: "#6366F1" },
  "Section 2": { from: "#10B981", to: "#059669", dot: "#10B981" },
  "Section 3": { from: "#3B82F6", to: "#06B6D4", dot: "#3B82F6" },
  "Section 4": { from: "#06B6D4", to: "#0EA5E9", dot: "#06B6D4" },
  "Section 5": { from: "#8B5CF6", to: "#EC4899", dot: "#8B5CF6" },
  "Section 6": { from: "#F59E0B", to: "#EF4444", dot: "#F59E0B" },
};

function sectionColor(section: string | null) {
  return (
    SECTION_COLORS[section || ""] || {
      from: "#71717a",
      to: "#52525b",
      dot: "#71717a",
    }
  );
}

function prettyName(raw: string): string {
  if (!raw) return "Unknown";
  const parts = raw.split("_").filter(Boolean);
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

export default function HomeConnectGlimpse() {
  const { user, isLoggedIn } = useAuth();
  const [data, setData] = useState<Glimpse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/connect/glimpse")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the section present even while loading — skeleton avoids layout shift
  if (loading) {
    return (
      <section className="px-6 mb-10">
        <div className="max-w-5xl mx-auto rounded-2xl p-5 animate-pulse"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="h-5 w-56 rounded bg-white/[0.06] mb-2" />
          <div className="h-3 w-40 rounded bg-white/[0.04] mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-28 rounded-xl bg-white/[0.04]" />
            <div className="h-28 rounded-xl bg-white/[0.04]" />
            <div className="h-28 rounded-xl bg-white/[0.04]" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const registeredPct =
    data.totalRolls > 0 ? Math.round((data.totalRegistered / data.totalRolls) * 100) : 0;

  // Determine audience state
  const userEnrollment = user?.enrollmentNo;
  const state: "out" | "not-registered" | "registered" = !isLoggedIn
    ? "out"
    : userEnrollment
    ? "registered"
    : "not-registered";

  const headline =
    state === "out"
      ? "Meet your classmates on IFS Connect"
      : state === "not-registered"
      ? "Your classmates are already here"
      : "Here's what your class is up to";

  const ctaLabel =
    state === "out"
      ? "Sign in to join"
      : state === "not-registered"
      ? "Complete your profile →"
      : "Explore IFS Connect →";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 mb-10"
    >
      <div
        className="max-w-5xl mx-auto rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.03))",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🤝</span>
              <h2 className="text-base sm:text-lg font-bold text-white">{headline}</h2>
            </div>
            <p className="text-xs text-zinc-400">
              <span className="text-white font-semibold">{data.totalRegistered}</span>
              <span className="text-zinc-500"> of {data.totalRolls} students</span>
              {data.sectionLeader && data.sectionLeader.pct > 0 && (
                <>
                  {" · "}
                  <span className="inline-flex items-center gap-1">
                    🥇 {data.sectionLeader.section} leads with {data.sectionLeader.pct}%
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Recent-joiner avatar strip */}
          {data.recentJoiners.length > 0 && (
            <div className="flex items-center -space-x-2">
              {data.recentJoiners.slice(0, 5).map((j) => {
                const col = sectionColor(j.section);
                return (
                  <div
                    key={j.enrollmentNo}
                    title={`${prettyName(j.name)} · ${j.section || ""}`}
                    className="relative w-8 h-8 rounded-full overflow-hidden"
                    style={{ border: `2px solid #0a0a12` }}
                  >
                    {j.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sizedAvatar(j.photoUrl, 64)}
                        alt={prettyName(j.name)}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                        }}
                      >
                        {initials(j.name)}
                      </div>
                    )}
                  </div>
                );
              })}
              {data.totalRegistered > 5 && (
                <div
                  className="relative w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-300"
                  style={{
                    border: `2px solid #0a0a12`,
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  +{data.totalRegistered - 5}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overall progress bar */}
        <div className="mb-5">
          <div className="h-1.5 rounded-full overflow-hidden"
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
        </div>

        {/* Live activity strip — rotates recent events */}
        <HomeActivityStrip />

        {/* Top learners this week */}
        {data.topLearnersThisWeek.length > 0 ? (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              🔥 Top learners this week
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.topLearnersThisWeek.map((s) => {
                const col = sectionColor(s.section);
                const primarySkill = s.skills.length > 0 ? getSkill(s.skills[0]) : null;
                return (
                  <Link
                    key={s.enrollmentNo}
                    href="/connect"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${col.dot}25`,
                    }}
                  >
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sizedAvatar(s.photoUrl, 80)}
                        alt={prettyName(s.name)}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        style={{ border: `2px solid ${col.dot}50` }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                          border: `2px solid ${col.dot}50`,
                        }}
                      >
                        {initials(s.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-zinc-100 truncate leading-tight">
                        {prettyName(s.name)}
                      </p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <span>{s.section}</span>
                        <span className="text-zinc-700">·</span>
                        <span style={{ color: col.dot, fontWeight: 600 }}>
                          {s.completionPct}%
                        </span>
                      </p>
                      {primarySkill && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] mt-0.5 text-zinc-500">
                          {primarySkill.emoji} {primarySkill.label}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic mb-4">
            No study activity this week yet — be the first to finish a topic!
          </p>
        )}

        {/* CTA */}
        <Link
          href={state === "out" ? "#" : "/connect"}
          onClick={(e) => {
            // Logged-out users: trigger Google sign-in via Navbar's existing button
            if (state === "out") {
              e.preventDefault();
              // Scroll to top so the Navbar sign-in button is visible
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.03]"
          style={{
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          }}
        >
          {ctaLabel}
        </Link>
      </div>
    </motion.section>
  );
}
