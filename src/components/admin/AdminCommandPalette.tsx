"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import { useAdminFetch } from "@/lib/useAdminFetch";

// ⌘K / Ctrl-K command palette. Global, mounted in the admin layout.
//
// Searches across:
//   - Students            (name / email / enrollment / section)
//   - Courses             (slug / code / name)
//   - Modules             (per course, via the course detail fetch when
//                          a course is previously in the cache)
//   - MCQ bank shortcuts  (per course)
//   - Admin navigation    (Home / People / Roster / Courses / Tools)
//   - Quick actions       (New course wizard, View site)
//
// Arrow keys navigate, Enter selects, Esc closes. Matches the look of
// the block-editor's BlockCommandPalette so admins feel the same
// muscle memory across both surfaces.
//
// Data: students + courses are fetched on mount when the palette first
// opens. Both are cached by SWR so opening it twice in the same tab is
// instant. Non-admin users never see or load this component (gated at
// AdminCommandPaletteMount).

interface AdminStudent {
  email: string;
  name: string;
  enrollmentNo: string;
  section: string;
  rollListName: string | null;
}

interface AdminCourse {
  id: string;
  slug: string;
  code: string;
  name: string;
  moduleCount: number;
}

interface StudentsResponse {
  students: AdminStudent[];
}

interface CoursesResponse {
  courses: AdminCourse[];
}

type ResultKind =
  | "student"
  | "course"
  | "mcq-bank"
  | "nav"
  | "action";

interface Result {
  key: string;
  kind: ResultKind;
  icon: string;
  label: string;
  hint?: string;
  href: string;
  score?: number;
}

const NAV_ITEMS: Result[] = [
  { key: "nav-home", kind: "nav", icon: "📊", label: "Admin home", hint: "Dashboard · alerts · KPIs", href: "/admin" },
  { key: "nav-people", kind: "nav", icon: "👥", label: "People", hint: "Students · filters · profiles", href: "/admin/people" },
  { key: "nav-roster", kind: "nav", icon: "🎓", label: "Roster", hint: "Batches · sections · rolls", href: "/admin/roster" },
  { key: "nav-courses", kind: "nav", icon: "📚", label: "Courses", hint: "Course CMS", href: "/admin/courses" },
  { key: "nav-tools", kind: "nav", icon: "🛠", label: "Tools", hint: "Audit log · destructive actions", href: "/admin/tools" },
  { key: "nav-site", kind: "nav", icon: "↗", label: "View site", hint: "Back to the student-facing site", href: "/" },
];

// ─── Scoring: how well a query matches a candidate ────────
// Simple weighted includes: exact prefix (5) > word boundary (3) >
// substring (1) > none (0). Good enough for ~300 entries without
// pulling in a fuzzy-match library.
function score(query: string, haystack: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const h = haystack.toLowerCase();
  if (h.startsWith(q)) return 5;
  const words = h.split(/\s+/);
  if (words.some((w) => w.startsWith(q))) return 3;
  if (h.includes(q)) return 1;
  return 0;
}

export default function AdminCommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user, isLoggedIn, getIdToken } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const idToken = isAdmin ? getIdToken() : null;
  const credential = idToken ? { idToken } : null;

  // Fetch students + courses lazily on first open — SWR dedupes so the
  // second open is instant.
  const { data: studentsData } = useAdminFetch<StudentsResponse>(
    open && isAdmin ? "/api/admin/people" : null,
    credential
  );
  const { data: coursesData } = useAdminFetch<CoursesResponse>(
    open && isAdmin ? "/api/admin/courses" : null,
    credential
  );

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when the palette opens, focus the input. Whitelisted —
  // canonical "sync state to controlled-open prop" pattern. The
  // alternative (key={open} on the parent) would re-mount the
  // motion.dialog and replay the open animation in reverse, which
  // looks wrong.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
     
    setActiveIndex(0);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  // Build the full candidate list once data arrives, then filter+sort
  // per query keystroke.
  const allResults = useMemo<Result[]>(() => {
    const out: Result[] = [];

    // Navigation is always present
    for (const n of NAV_ITEMS) out.push(n);

    // Courses + per-course actions
    for (const c of coursesData?.courses || []) {
      out.push({
        key: `course-${c.slug}`,
        kind: "course",
        icon: "📚",
        label: `${c.name}`,
        hint: `${c.code} · ${c.moduleCount} module${c.moduleCount === 1 ? "" : "s"} · edit`,
        href: `/admin/courses/${encodeURIComponent(c.slug)}`,
      });
      out.push({
        key: `mcq-${c.slug}`,
        kind: "mcq-bank",
        icon: "📊",
        label: `MCQ bank · ${c.name}`,
        hint: "Bloom's coverage · filters",
        href: `/admin/courses/${encodeURIComponent(c.slug)}/questions`,
      });
    }

    // Students — use teacher-verified roll-list name when available so
    // the palette surfaces real names, not legacy "248_oysha" handles.
    for (const s of studentsData?.students || []) {
      const displayName = s.rollListName || s.name;
      out.push({
        key: `student-${s.email}`,
        kind: "student",
        icon: "🧑‍🎓",
        label: displayName,
        hint: `${s.enrollmentNo} · ${s.section} · ${s.email}`,
        href: `/admin/people?student=${encodeURIComponent(s.email)}`,
      });
    }

    return out;
  }, [studentsData, coursesData]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) {
      // Empty query: show nav items + 10 most-recent courses/students.
      return [
        ...NAV_ITEMS,
        ...allResults
          .filter((r) => r.kind === "course" || r.kind === "mcq-bank")
          .slice(0, 6),
      ];
    }

    // Filter by score across label + hint combined, then sort desc.
    // Enrollment numbers + emails are checked directly so a student who
    // types "248" or "sasha@" lands their target first.
    const scored = allResults
      .map((r) => {
        const hay = `${r.label} ${r.hint || ""}`;
        const s = score(q, hay);
        return { r, s };
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => {
        if (b.s !== a.s) return b.s - a.s;
        // Stable fallback: student > course > mcq-bank > nav > action
        const kindOrder: Record<ResultKind, number> = {
          student: 0,
          course: 1,
          "mcq-bank": 2,
          nav: 3,
          action: 4,
        };
        return kindOrder[a.r.kind] - kindOrder[b.r.kind];
      })
      .map((x) => x.r);

    return scored.slice(0, 40);
  }, [query, allResults]);

  // Keep the active index in bounds as the list changes. Whitelisted —
  // this is a "clamp local state to a derived value" pattern. The
  // alternative (deriving in render) would let activeIndex go OOB on
  // arrow-key handling.
  useEffect(() => {
    if (activeIndex >= filtered.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, activeIndex]);

  function select(r: Result) {
    onClose();
    // Tiny delay so the exit animation can start before navigation.
    setTimeout(() => router.push(r.href), 50);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault();
      select(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,15,25,0.97), rgba(10,10,18,0.98))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
              backdropFilter: "blur(24px) saturate(160%)",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Jump to anywhere"
          >
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span aria-hidden="true" className="text-zinc-500 text-sm font-mono">
                ⌘K
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKey}
                placeholder="Search students, courses, pages…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                Esc
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-center py-8 text-[12px] text-zinc-500">
                  No matches for &quot;{query}&quot;
                </p>
              ) : (
                filtered.map((r, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={r.key}
                      onClick={() => select(r)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        background: active
                          ? "rgba(99,102,241,0.12)"
                          : "transparent",
                      }}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{
                          background: kindAccent(r.kind, 0.12),
                          border: `1px solid ${kindAccent(r.kind, 0.25)}`,
                        }}
                        aria-hidden="true"
                      >
                        {r.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-white truncate">
                          {r.label}
                        </div>
                        {r.hint && (
                          <div className="text-[11px] text-zinc-500 truncate">
                            {r.hint}
                          </div>
                        )}
                      </div>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          color: kindAccent(r.kind, 0.9),
                          background: kindAccent(r.kind, 0.08),
                        }}
                      >
                        {kindLabel(r.kind)}
                      </span>
                      {active && (
                        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-300 shrink-0">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div
              className="flex items-center justify-between px-4 py-2 text-[10px] text-zinc-500"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span>
                <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">↑↓</kbd>{" "}
                navigate
              </span>
              <span>
                <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">↵</kbd>{" "}
                open
              </span>
              <span>
                <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">⌘K</kbd>{" "}
                toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Kind → accent colour + label helpers ───────────────

function kindAccent(kind: ResultKind, alpha: number): string {
  const hex = {
    student: "#F472B6",   // pink — people
    course: "#818CF8",    // indigo — courses
    "mcq-bank": "#34D399", // green — MCQ bank
    nav: "#A78BFA",        // violet — navigation
    action: "#FBBF24",     // amber — quick action
  }[kind];
  // Convert hex to rgba with the requested alpha.
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function kindLabel(kind: ResultKind): string {
  return {
    student: "Student",
    course: "Course",
    "mcq-bank": "MCQ",
    nav: "Page",
    action: "Action",
  }[kind];
}
