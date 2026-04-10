"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

/* ─── Types ─── */

interface Student {
  enrollmentNo: string;
  name: string;
  email: string;
  linkedinUrl: string;
  addedAt: string;
}

interface Batch {
  id: string;
  name: string;
  accent: string;
  studentCount: number;
  students: Student[];
}

interface Profile {
  id: number;
  studentEmail: string;
  name: string;
  enrollmentNo: string;
  batchId: string;
  photoUrl: string | null;
  status: "working" | "studying" | "freelancing" | "looking" | null;
  company: string | null;
  jobTitle: string | null;
  description: string | null;
  university: string | null;
  program: string | null;
  country: string | null;
  freelanceArea: string | null;
  lookingFor: string | null;
  skills: string | null;
  linkedinUrl: string;
  githubUrl: string | null;
  telegramUrl: string | null;
  portfolioUrl: string | null;
  updatedAt: string;
}

type FilterTab = "all" | "working" | "studying" | "freelancing" | "looking";

/* ─── Constants ─── */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; emoji: string; bg: string; border: string }
> = {
  working: {
    label: "Working",
    color: "#10B981",
    emoji: "\uD83D\uDFE2",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.25)",
  },
  studying: {
    label: "Studying",
    color: "#3B82F6",
    emoji: "\uD83D\uDD35",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.25)",
  },
  freelancing: {
    label: "Freelancing",
    color: "#8B5CF6",
    emoji: "\uD83D\uDFE3",
    bg: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.25)",
  },
  looking: {
    label: "Looking",
    color: "#F59E0B",
    emoji: "\uD83D\uDFE0",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.25)",
  },
};

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "working", label: "\uD83D\uDFE2 Working" },
  { value: "studying", label: "\uD83D\uDD35 Studying" },
  { value: "freelancing", label: "\uD83D\uDFE3 Freelancing" },
  { value: "looking", label: "\uD83D\uDFE0 Looking" },
];

/* ─── Helpers ─── */

function nameToColor(name: string) {
  const colors = [
    ["#6366F1", "#818CF8"],
    ["#8B5CF6", "#A78BFA"],
    ["#EC4899", "#F472B6"],
    ["#06B6D4", "#22D3EE"],
    ["#10B981", "#34D399"],
    ["#F59E0B", "#FBBF24"],
    ["#3B82F6", "#60A5FA"],
    ["#EF4444", "#F87171"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function decodeJwt(token: string) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getStatusLine(p: Profile): string {
  if (!p.status) return "";
  switch (p.status) {
    case "working":
      return p.company ? `Working at ${p.company}` : "Working";
    case "studying":
      return p.university ? `Studying at ${p.university}` : "Studying";
    case "freelancing":
      return p.freelanceArea ? `Freelancing in ${p.freelanceArea}` : "Freelancing";
    case "looking":
      return p.lookingFor ? `Looking for ${p.lookingFor}` : "Looking for opportunities";
  }
}

function getDetailLine(p: Profile): string | null {
  if (!p.status) return null;
  switch (p.status) {
    case "working":
      return p.jobTitle || null;
    case "studying":
      return [p.program, p.country].filter(Boolean).join(" \u00B7 ") || null;
    case "freelancing":
      return null;
    case "looking":
      return p.skills || null;
  }
}

/* ─── Page Component ─── */

export default function BatchDetailPage() {
  const params = useParams();
  const batchId = params.batchId as string;
  const { user, isLoggedIn } = useAuth();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Add-profile modal state
  const [showModal, setShowModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string } | null>(null);
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ─── Data Loading ─── */

  function fetchBatch() {
    fetch("/api/batches")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => {
        const found = d.batches.find((b: Batch) => b.id === batchId);
        setBatch(found || null);
      })
      .catch(() => setBatch(null));
  }

  function fetchProfiles() {
    fetch(`/api/profiles?batchId=${batchId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => setProfiles(d.profiles || []))
      .catch(() => setProfiles([]));
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/batches").then((r) => r.json()),
      fetch(`/api/profiles?batchId=${batchId}`).then((r) => r.json()),
    ])
      .then(([batchData, profileData]) => {
        const found = batchData.batches.find((b: Batch) => b.id === batchId);
        setBatch(found || null);
        setProfiles(profileData.profiles || []);
      })
      .catch(() => {
        setBatch(null);
        setProfiles([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  /* ─── Filtering ─── */

  const filteredProfiles = useMemo(() => {
    let result = profiles;
    if (activeFilter !== "all") {
      result = result.filter((p) => p.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [profiles, activeFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { working: 0, studying: 0, freelancing: 0, looking: 0 };
    profiles.forEach((p) => {
      if (p.status && counts[p.status] !== undefined) counts[p.status]++;
    });
    return counts;
  }, [profiles]);

  /* ─── User profile check ─── */

  const userHasProfile = useMemo(() => {
    if (!user?.email) return false;
    return profiles.some((p) => p.studentEmail === user.email);
  }, [profiles, user]);

  /* ─── Add Profile Modal Handlers ─── */

  function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    if (credentialResponse.credential) {
      const decoded = decodeJwt(credentialResponse.credential);
      if (decoded?.name && decoded?.email) {
        setGoogleUser({ name: decoded.name, email: decoded.email });
      } else {
        setError("Could not read Google account info.");
      }
    }
  }

  async function handleSubmit() {
    setError("");
    if (!enrollmentNo.trim()) {
      setError("Please enter your enrollment number.");
      return;
    }
    if (!linkedinUrl.trim()) {
      setError("Please enter your LinkedIn URL.");
      return;
    }
    if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(linkedinUrl.trim())) {
      setError("Please enter a valid LinkedIn URL.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId,
        enrollmentNo: enrollmentNo.trim(),
        name: googleUser!.name,
        email: googleUser!.email,
        linkedinUrl: linkedinUrl.trim(),
      }),
    });

    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
    setShowModal(false);
    setGoogleUser(null);
    setEnrollmentNo("");
    setLinkedinUrl("");
    fetchBatch();
    fetchProfiles();
  }

  /* ─── Loading / Not Found ─── */

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title="Loading..." />
        <div className="flex justify-center pt-32">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!batch) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title="Not Found" />
        <div className="text-center pt-32 text-zinc-400">Batch not found.</div>
      </main>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="en">
      <main className="relative min-h-screen">
        <Navbar showBack title={batch.name} />

        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
            style={{ background: batch.accent }}
          />
          <motion.div
            animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px]"
          />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        <div className="relative z-10 pt-24 pb-16 px-6 max-w-6xl mx-auto">
          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: batch.accent }} />
              <span className="text-xs font-medium text-zinc-400 tracking-wide">IFP105 · {batch.id}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-4">
              {batch.name.split("Batch")[0]}
              <span className="gradient-text-animated">Batch</span>
            </h1>

            <p className="text-base text-zinc-400 max-w-md mx-auto mb-8">
              Discover what your classmates are building, studying, and working on.
            </p>

            {/* Stats bar */}
            <div className="inline-flex items-center gap-0 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm overflow-hidden inner-glow mb-8 flex-wrap">
              <StatItem label="Profiles" value={profiles.length} />
              <StatItem label="Working" value={statusCounts.working} sep />
              <StatItem label="Studying" value={statusCounts.studying} sep />
              <StatItem label="Freelancing" value={statusCounts.freelancing} sep className="hidden sm:flex" />
              <StatItem label="Looking" value={statusCounts.looking} sep className="hidden sm:flex" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {isLoggedIn && userHasProfile ? (
                <Link href="/profile/edit">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${batch.accent}, ${batch.accent}cc)`,
                      boxShadow: `0 4px 20px ${batch.accent}40`,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profile
                  </motion.span>
                </Link>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (isLoggedIn) {
                      window.location.href = "/profile/edit";
                    } else {
                      setShowModal(true);
                      setSuccess(false);
                      setError("");
                    }
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${batch.accent}, ${batch.accent}cc)`,
                    boxShadow: `0 4px 20px ${batch.accent}40`,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10m-5-5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add Your Profile
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Success toast */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center max-w-md mx-auto"
              >
                Profile added successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter bar + Search */}
          {profiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-x-auto">
                  {FILTER_TABS.map((tab) => {
                    const isActive = activeFilter === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setActiveFilter(tab.value)}
                        className="relative px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                        style={{
                          color: isActive ? "#fff" : "#71717A",
                        }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeFilterBg"
                            className="absolute inset-0 rounded-lg bg-white/[0.1]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/15 transition-colors"
                  />
                </div>

                {/* Count */}
                <p className="text-xs text-zinc-500 whitespace-nowrap self-center">
                  {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? "s" : ""}
                </p>
              </div>
            </motion.div>
          )}

          {/* Profile Cards Grid */}
          {filteredProfiles.length === 0 && profiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <span className="text-3xl">{"\uD83D\uDC4B"}</span>
              </div>
              <p className="text-zinc-400 text-lg mb-2">No profiles yet</p>
              <p className="text-zinc-600 text-sm">Be the first to add your career profile!</p>
            </motion.div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm">
              No profiles match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile, i) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  index={i}
                  expanded={expandedId === profile.id}
                  onToggle={() =>
                    setExpandedId(expandedId === profile.id ? null : profile.id)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Profile Modal (for users not logged in) */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowModal(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-2xl bg-[#12121A] border border-white/[0.08] p-6 shadow-2xl"
              >
                <h2 className="text-lg font-bold mb-1">Add Your Profile</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Sign in with Google to verify your identity, then add your LinkedIn.
                </p>

                {!googleUser ? (
                  <div>
                    <p className="text-xs text-zinc-500 mb-4">
                      Your name will be displayed publicly. Your email is only used for verification.
                    </p>
                    {GOOGLE_CLIENT_ID ? (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google sign-in failed.")}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        width="100%"
                      />
                    ) : (
                      <p className="text-sm text-amber-400/80 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        Google Sign-In not configured.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <p className="text-sm font-medium">{googleUser.name}</p>
                      <p className="text-xs text-zinc-500">{googleUser.email}</p>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block">Enrollment Number</label>
                      <input
                        type="text"
                        value={enrollmentNo}
                        onChange={(e) => setEnrollmentNo(e.target.value)}
                        placeholder="e.g. IFP2025001"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourname"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        {error}
                      </p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                      style={{
                        background: `linear-gradient(135deg, ${batch.accent}, ${batch.accent}cc)`,
                      }}
                    >
                      {submitting ? "Adding..." : "Add My Profile"}
                    </motion.button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowModal(false);
                    setGoogleUser(null);
                    setError("");
                  }}
                  className="mt-4 w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </GoogleOAuthProvider>
  );
}

/* ─── Sub-components ─── */

function StatItem({
  label,
  value,
  sep,
  className = "",
}: {
  label: string;
  value: number;
  sep?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center px-4 sm:px-6 py-3 ${sep ? "border-l border-white/[0.06]" : ""} ${className}`}
    >
      <span className="text-lg sm:text-xl font-bold text-white">{value}</span>
      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );
}

function ProfileCard({
  profile: p,
  index,
  expanded,
  onToggle,
}: {
  profile: Profile;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [color1, color2] = nameToColor(p.name);
  const initials = getInitials(p.name);
  const cfg = p.status ? STATUS_CONFIG[p.status] : null;
  const statusLine = getStatusLine(p);
  const detailLine = getDetailLine(p);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="group relative overflow-hidden rounded-2xl card-glass cursor-pointer"
        onClick={onToggle}
      >
        {/* Gradient top line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
          style={{
            background: cfg
              ? `linear-gradient(90deg, ${cfg.color}, ${cfg.color}66, transparent)`
              : `linear-gradient(90deg, ${color1}, ${color2}, transparent)`,
          }}
        />

        {/* Hover glow */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
          style={{ background: cfg ? cfg.color : color1 }}
        />

        <div className="relative p-5">
          {/* Avatar + Name + Status */}
          <div className="flex items-start gap-3.5 mb-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-lg" style={{ boxShadow: `0 4px 15px ${color1}30` }}>
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate mb-1">{p.name}</h3>
              {/* Status badge */}
              {cfg && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                  {statusLine}
                </span>
              )}
            </div>
          </div>

          {/* Detail line */}
          {detailLine && (
            <p className="text-xs text-zinc-500 mb-3 truncate pl-[3.75rem]">{detailLine}</p>
          )}

          {/* Social links row */}
          <div className="flex items-center gap-2">
            {/* LinkedIn (prominent) */}
            <a
              href={p.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-[11px] font-medium bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/40 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>

            {/* GitHub icon */}
            {p.githubUrl && (
              <a
                href={p.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#A1A1AA">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            )}

            {/* Portfolio icon */}
            {p.portfolioUrl && (
              <a
                href={p.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </a>
            )}

            {/* Telegram icon */}
            {p.telegramUrl && (
              <a
                href={p.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#A1A1AA">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            )}
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                  {p.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  {p.status === "studying" && p.country && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {p.country}
                    </div>
                  )}
                  {p.skills && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.skills.split(",").map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-600">
                    {p.enrollmentNo}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
