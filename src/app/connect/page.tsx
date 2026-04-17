"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";

interface Student {
  enrollmentNo: string;
  name: string;
  batchId: string;
  section: string;
  linkedinUrl: string | null;
  photoUrl: string | null;
  bio: string | null;
  lastThree: string;
}

// Generate a gradient background for avatars without photos
function avatarGradient(name: string): string {
  const colors = [
    "linear-gradient(135deg, #6366F1, #8B5CF6)",
    "linear-gradient(135deg, #EC4899, #8B5CF6)",
    "linear-gradient(135deg, #10B981, #06B6D4)",
    "linear-gradient(135deg, #F59E0B, #EC4899)",
    "linear-gradient(135deg, #06B6D4, #3B82F6)",
    "linear-gradient(135deg, #8B5CF6, #EC4899)",
  ];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function initials(name: string): string {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export default function IFSConnectPage() {
  const { user, isLoggedIn } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/connect")
      .then((r) => r.json())
      .then((data) => {
        setStudents(data.students || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Unique sections for filter pills
  const sections = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) if (s.section) set.add(s.section);
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [students]);

  // Default to user's section
  const userSection = user?.section;
  useEffect(() => {
    if (userSection && sectionFilter === "all" && students.length > 0) {
      // Optionally default to user's section on first load
      // Or keep "all" as default — leaving as-is for now
    }
  }, [userSection, students.length, sectionFilter]);

  const filtered = useMemo(() => {
    let list = students;
    if (sectionFilter !== "all") {
      list = list.filter((s) => s.section === sectionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.enrollmentNo.toLowerCase().includes(q)
      );
    }
    // Sort: user first, then alphabetical
    list = [...list].sort((a, b) => {
      if (user && a.enrollmentNo === user.enrollmentNo) return -1;
      if (user && b.enrollmentNo === user.enrollmentNo) return 1;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [students, sectionFilter, searchQuery, user]);

  return (
    <main className="relative min-h-screen">
      <Navbar showBack title="IFS Connect" />

      <div className="pt-20 pb-24 px-5 max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-3">🤝</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            IFS Connect
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Meet your classmates across all 6 sections. Connect with them on LinkedIn
            and grow your professional network while you learn.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-0 rounded-2xl mx-auto block w-fit mb-8 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center px-5 py-3">
            <span className="text-xl font-bold text-white">{students.length}</span>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider ml-2">
              Registered
            </span>
          </div>
          <div className="w-px h-6 bg-white/[0.06]" />
          <div className="flex items-center px-5 py-3">
            <span className="text-xl font-bold text-white">{sections.length}</span>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider ml-2">
              Sections
            </span>
          </div>
        </motion.div>

        {/* Filters */}
        {!loading && (
          <div className="mb-6 space-y-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />

            {/* Section pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSectionFilter("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  sectionFilter === "all"
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={{
                  background:
                    sectionFilter === "all"
                      ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    sectionFilter === "all"
                      ? "transparent"
                      : "rgba(255,255,255,0.06)"
                  }`,
                }}
              >
                All ({students.length})
              </button>
              {sections.map((sec) => {
                const count = students.filter((s) => s.section === sec).length;
                const isMySection = userSection === sec;
                return (
                  <button
                    key={sec}
                    onClick={() => setSectionFilter(sec)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                      sectionFilter === sec
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={{
                      background:
                        sectionFilter === sec
                          ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        sectionFilter === sec
                          ? "transparent"
                          : "rgba(255,255,255,0.06)"
                      }`,
                    }}
                  >
                    {sec} ({count}){isMySection && " 👤"}
                  </button>
                );
              })}
            </div>
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
              {students.length === 0 &&
                !isLoggedIn &&
                "Be the first! Sign in and register to appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((student, i) => {
              const isMe = user?.enrollmentNo === student.enrollmentNo;
              return (
                <motion.div
                  key={student.enrollmentNo}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  className="relative p-5 rounded-2xl card-glass group"
                  style={{
                    border: isMe
                      ? "1px solid rgba(99,102,241,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {isMe && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                      You
                    </span>
                  )}

                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-3">
                    {student.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover border-2"
                        style={{ borderColor: "rgba(255,255,255,0.1)" }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: avatarGradient(student.name) }}
                      >
                        {initials(student.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {student.section}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  {student.bio && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-3 italic">
                      “{student.bio}”
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {student.linkedinUrl ? (
                      <a
                        href={student.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02]"
                        style={{ background: "#0A66C2" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        Connect
                      </a>
                    ) : (
                      <div className="flex-1 px-3 py-2 rounded-lg text-xs text-zinc-600 text-center bg-white/[0.02] border border-white/[0.04]">
                        No LinkedIn
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
