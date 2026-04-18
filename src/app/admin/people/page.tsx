"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StudentDrawer, { type AdminStudent } from "@/components/admin/StudentDrawer";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import { compareSections } from "@/lib/sections";
import { sizedAvatar } from "@/lib/avatar";

// ─── Page ───────────────────────────────────────────────────────────

interface PeopleResponse {
  students: AdminStudent[];
  rollList: { batchId: string; section: string; enrollmentNo: string }[];
}

type FilterKey =
  | "all"
  | "active7"
  | "inactive14"
  | "atRisk"
  | "zeroProgress"
  | "mcqLow";

type SortKey =
  | "nameAsc"
  | "completionDesc"
  | "completionAsc"
  | "mcqDesc"
  | "mcqLow"
  | "lastActiveDesc"
  | "blendedDesc";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active7", label: "Active 7d" },
  { key: "inactive14", label: "Inactive 14d+" },
  { key: "atRisk", label: "At risk" },
  { key: "zeroProgress", label: "0% progress" },
  { key: "mcqLow", label: "MCQ < 50%" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "nameAsc", label: "Name A→Z" },
  { key: "completionDesc", label: "Completion ↓" },
  { key: "completionAsc", label: "Completion ↑" },
  { key: "mcqDesc", label: "MCQ ↓" },
  { key: "mcqLow", label: "MCQ ↑" },
  { key: "lastActiveDesc", label: "Recent activity" },
  { key: "blendedDesc", label: "Top performers" },
];

// Next 16 requires pages that call useSearchParams() during render to
// sit inside a Suspense boundary so the static-export step can bail out
// cleanly into client-only rendering. Splitting the previous default
// export into `PeoplePage` (the real UI) + `PeoplePageWrapper` (the
// Suspense wrapper, now the default export) is the canonical fix.
export default function PeoplePageWrapper() {
  return (
    <Suspense fallback={null}>
      <PeoplePage />
    </Suspense>
  );
}

function PeoplePage() {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const idToken = isAdmin ? getIdToken() : null;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Bulk-select state — tracks emails of selected students.
  // Cleared on filter change so we never operate on invisible rows.
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Load password session
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAdmin && idToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthenticated(true);
    }
  }, [isAdmin, idToken]);

  // Filter/sort UI state — initialized from URL params so Home links work.
  const [filter, setFilter] = useState<FilterKey>(
    (searchParams?.get("filter") as FilterKey) || "all"
  );
  const [sectionFilter, setSectionFilter] = useState<string>(
    searchParams?.get("section") || "all"
  );
  const [sort, setSort] = useState<SortKey>(
    (searchParams?.get("sort") as SortKey) || "nameAsc"
  );
  const [query, setQuery] = useState("");

  // ─── Fetch ───────────────────────────────────────────────────
  const credential = idToken ? { idToken } : password;
  const { data, error: fetchError, isLoading, mutate } =
    useAdminFetch<PeopleResponse>(
      "/api/admin/people",
      credential,
      { enabled: authenticated, refreshInterval: 60_000 }
    );

  useEffect(() => {
    if (
      fetchError &&
      "status" in fetchError &&
      (fetchError as { status?: number }).status === 401
    ) {
      if (!isAdmin) {
        sessionStorage.removeItem("admin_pw");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthenticated(false);
      }
    }
  }, [fetchError, isAdmin]);

  async function login() {
    setAuthError("");
    setAuthLoading(true);
    const res = await fetch("/api/admin/people", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", password);
    } else {
      setAuthError("Wrong password.");
    }
    setAuthLoading(false);
  }

  // ─── Keyboard "/" focuses search ──────────────────────────────
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ─── Drawer: student from URL (?student=email) ────────────────
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  useEffect(() => {
    const fromUrl = searchParams?.get("student");
    if (fromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedEmail(fromUrl);
    }
  }, [searchParams]);

  const selectedStudent = useMemo(() => {
    if (!selectedEmail || !data) return null;
    return data.students.find((s) => s.email === selectedEmail) || null;
  }, [selectedEmail, data]);

  function openStudent(email: string) {
    setSelectedEmail(email);
    const sp = new URLSearchParams(searchParams?.toString() || "");
    sp.set("student", email);
    router.replace(`/admin/people?${sp.toString()}`, { scroll: false });
  }
  function closeStudent() {
    setSelectedEmail(null);
    const sp = new URLSearchParams(searchParams?.toString() || "");
    sp.delete("student");
    router.replace(
      `/admin/people${sp.toString() ? `?${sp.toString()}` : ""}`,
      { scroll: false }
    );
  }

  // ─── Sections list ────────────────────────────────────────────
  const sections = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const s of data.students) set.add(s.section);
    return Array.from(set).sort(compareSections);
  }, [data]);

  // ─── Apply filters + sort ─────────────────────────────────────
  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.students;

    if (sectionFilter !== "all") {
      list = list.filter((s) => s.section === sectionFilter);
    }

    switch (filter) {
      case "active7":
        list = list.filter(
          (s) => s.daysSinceActive !== null && s.daysSinceActive <= 7
        );
        break;
      case "inactive14":
        list = list.filter(
          (s) => s.daysSinceActive === null || s.daysSinceActive >= 14
        );
        break;
      case "atRisk":
        list = list.filter(
          (s) =>
            s.completionPct === 0 ||
            (s.daysSinceActive !== null && s.daysSinceActive >= 14)
        );
        break;
      case "zeroProgress":
        list = list.filter((s) => s.completionPct === 0);
        break;
      case "mcqLow":
        list = list.filter((s) => s.avgMcq !== null && s.avgMcq < 50);
        break;
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.enrollmentNo.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "nameAsc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "completionDesc":
        sorted.sort((a, b) => b.completionPct - a.completionPct);
        break;
      case "completionAsc":
        sorted.sort((a, b) => a.completionPct - b.completionPct);
        break;
      case "mcqDesc":
        sorted.sort((a, b) => (b.avgMcq ?? -1) - (a.avgMcq ?? -1));
        break;
      case "mcqLow":
        sorted.sort((a, b) => (a.avgMcq ?? 101) - (b.avgMcq ?? 101));
        break;
      case "lastActiveDesc":
        sorted.sort(
          (a, b) => (a.daysSinceActive ?? 9999) - (b.daysSinceActive ?? 9999)
        );
        break;
      case "blendedDesc":
        sorted.sort((a, b) => {
          const ba = a.completionPct * 0.6 + (a.avgMcq ?? 0) * 0.4;
          const bb = b.completionPct * 0.6 + (b.avgMcq ?? 0) * 0.4;
          return bb - ba;
        });
        break;
    }

    return sorted;
  }, [data, sectionFilter, filter, query, sort]);

  // ─── Auth gate ────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <main className="min-h-screen">
        <Navbar title="Admin" />
        <div className="min-h-screen flex items-center justify-center px-6">
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, #0F0F1A, #0A0A12)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-3xl mb-3">🛡️</div>
            <h1 className="text-xl font-bold mb-1">Admin access</h1>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
              placeholder="Admin password"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 mb-3 mt-4"
            />
            {authError && (
              <p className="text-[12px] text-red-400 mb-3">{authError}</p>
            )}
            <button
              onClick={login}
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50"
            >
              {authLoading ? "Checking…" : "Continue"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─── Main page ─────────────────────────────────────────────────
  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "People" },
          ]}
        />

        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">People</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {data
                ? `${filtered.length} shown · ${data.students.length} total`
                : "Loading…"}
            </p>
          </div>
        </div>

        {/* ─── Controls row ─────────────────────────────────── */}
        <div className="mb-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, roll, or email (press / to focus)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              🔍
            </span>
          </div>

          {/* Filter chips — scroll-fade shows users the row extends
               past the viewport on 360px mobile. */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-fade-x"
            style={{ scrollbarWidth: "none" }}
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 shrink-0 ${
                  filter === f.key
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={{
                  background:
                    filter === f.key
                      ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    filter === f.key
                      ? "transparent"
                      : "rgba(255,255,255,0.06)"
                  }`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Section pills + sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1 min-w-0 scroll-fade-x"
              style={{ scrollbarWidth: "none" }}
            >
              <button
                onClick={() => setSectionFilter("all")}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 shrink-0 ${
                  sectionFilter === "all"
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={{
                  background:
                    sectionFilter === "all"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    sectionFilter === "all"
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.05)"
                  }`,
                }}
              >
                All sections
              </button>
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSectionFilter(sec)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 shrink-0 ${
                    sectionFilter === sec
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  style={{
                    background:
                      sectionFilter === sec
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.02)",
                    border: `1px solid ${
                      sectionFilter === sec
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(255,255,255,0.05)"
                    }`,
                  }}
                >
                  {sec}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-zinc-300 focus:outline-none focus:border-indigo-500/50 shrink-0"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── Bulk action bar (visible when rows are selected) ─── */}
        {selected.size > 0 && (
          <BulkActionBar
            selectedCount={selected.size}
            selectedStudents={(data?.students ?? []).filter((s) =>
              selected.has(s.email)
            )}
            onClear={() => setSelected(new Set())}
          />
        )}

        {/* ─── Table ──────────────────────────────────────────── */}
        {isLoading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-white/[0.02] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : fetchError ? (
          <div className="p-4 rounded-xl text-sm text-red-300 bg-red-500/10 border border-red-500/20">
            Couldn&apos;t load students. Try refresh.
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm text-zinc-400">
              No students match your filters.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr
                    className="text-left"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <th className="px-3 py-2.5 w-8">
                      <input
                        type="checkbox"
                        aria-label={
                          selected.size === filtered.length && filtered.length > 0
                            ? "Deselect all"
                            : "Select all"
                        }
                        checked={
                          filtered.length > 0 &&
                          selected.size === filtered.length
                        }
                        ref={(el) => {
                          if (el) {
                            el.indeterminate =
                              selected.size > 0 &&
                              selected.size < filtered.length;
                          }
                        }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected(new Set(filtered.map((s) => s.email)));
                          } else {
                            setSelected(new Set());
                          }
                        }}
                        className="cursor-pointer accent-indigo-500"
                      />
                    </th>
                    <Th>Student</Th>
                    <Th>Section</Th>
                    <Th align="right">Progress</Th>
                    <Th align="right">MCQ</Th>
                    <Th align="right">Last active</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const checked = selected.has(s.email);
                    return (
                    <motion.tr
                      key={s.email}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: Math.min(i * 0.005, 0.08) }}
                      onClick={() => openStudent(s.email)}
                      // Keyboard: Enter / Space opens the drawer. Without
                      // tabIndex + key handling, keyboard-only admins
                      // couldn't navigate the roster at all.
                      role="button"
                      tabIndex={0}
                      aria-label={`Open details for ${s.name}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openStudent(s.email);
                        }
                      }}
                      className="cursor-pointer hover:bg-white/[0.02] focus:outline-none focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-indigo-500/60 transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        background: checked ? "rgba(99,102,241,0.06)" : undefined,
                      }}
                    >
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Select ${s.name}`}
                          checked={checked}
                          onChange={(e) => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(s.email);
                              else next.delete(s.email);
                              return next;
                            });
                          }}
                          className="cursor-pointer accent-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <SmallAvatar student={s} />
                          <div className="min-w-0">
                            {/* Teacher-verified roll-list name as primary
                                identity; fall back to the student's chosen
                                display name when no roll_list name is on
                                file yet. The display name + roll + email
                                go on a secondary line for disambiguation. */}
                            <div className="text-[13px] font-semibold text-zinc-200 truncate">
                              {s.rollListName || s.name}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate">
                              {s.rollListName ? (
                                <>
                                  <span className="text-zinc-400">{s.name}</span>
                                  {" · "}
                                </>
                              ) : null}
                              #{s.enrollmentNo} · {s.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                        {s.section}
                        {s.hidden && (
                          <span className="text-[9px] ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                            HIDDEN
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span
                            className="text-[12px] font-bold tabular-nums"
                            style={{
                              color:
                                s.completionPct >= 80
                                  ? "#22c55e"
                                  : s.completionPct >= 40
                                  ? "#f59e0b"
                                  : s.completionPct > 0
                                  ? "#ef4444"
                                  : "#71717a",
                            }}
                          >
                            {s.completionPct}%
                          </span>
                          <div
                            className="w-16 h-1 rounded-full overflow-hidden mt-0.5"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.completionPct}%`,
                                background:
                                  s.completionPct >= 80
                                    ? "#22c55e"
                                    : s.completionPct >= 40
                                    ? "#f59e0b"
                                    : s.completionPct > 0
                                    ? "#ef4444"
                                    : "rgba(255,255,255,0.15)",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span
                          className="text-[12px] font-bold"
                          style={{
                            color:
                              s.avgMcq === null
                                ? "#71717a"
                                : s.avgMcq >= 80
                                ? "#22c55e"
                                : s.avgMcq >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        >
                          {s.avgMcq === null ? "—" : `${s.avgMcq}%`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-500 whitespace-nowrap">
                        {s.daysSinceActive === null
                          ? "Never"
                          : s.daysSinceActive === 0
                          ? "Today"
                          : `${s.daysSinceActive}d ago`}
                      </td>
                    </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <StudentDrawer
        student={selectedStudent}
        onClose={closeStudent}
        sections={sections}
        onMutated={() => mutate()}
      />
    </main>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function SmallAvatar({ student }: { student: AdminStudent }) {
  const initials = student.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  return (
    <div
      className="shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-bold"
      style={{
        background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
      }}
    >
      {student.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sizedAvatar(student.photoUrl, 64)}
          alt={student.name}
          referrerPolicy="no-referrer"
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

// ─── Bulk action bar ─────────────────────────────────────────

function BulkActionBar({
  selectedCount,
  selectedStudents,
  onClear,
}: {
  selectedCount: number;
  selectedStudents: AdminStudent[];
  onClear: () => void;
}) {
  // Build a comma-separated string of emails. Mailto has an 8k byte limit
  // on many clients; for anything bigger than ~100 addresses we should
  // recommend the "copy to clipboard" path instead.
  const emails = selectedStudents.map((s) => s.email).join(", ");
  const mailtoSafe = emails.length < 6000;

  const mailtoHref = mailtoSafe
    ? `mailto:?bcc=${encodeURIComponent(emails)}&subject=${encodeURIComponent("IFP105 — quick note")}`
    : "#";

  async function copyEmails() {
    try {
      await navigator.clipboard.writeText(emails);
    } catch {
      // fallback: select in a textarea
      const ta = document.createElement("textarea");
      ta.value = emails;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  function downloadCsv() {
    const header = [
      "Name",
      "Roll",
      "Email",
      "Section",
      "Batch",
      "Registered",
      "Completion %",
      "MCQ avg %",
      "Last active (days)",
      "LinkedIn",
      "Bio",
      "Interests",
    ];
    const rows = selectedStudents.map((s) => [
      csvCell(s.name),
      csvCell(s.enrollmentNo),
      csvCell(s.email),
      csvCell(s.section),
      csvCell(s.batchId),
      csvCell(s.addedAt || ""),
      s.completionPct.toString(),
      s.avgMcq !== null ? s.avgMcq.toString() : "",
      s.daysSinceActive !== null ? s.daysSinceActive.toString() : "",
      csvCell(s.linkedinUrl || ""),
      csvCell(s.bio || ""),
      csvCell((s.skills || []).join(" ")),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ifp105-students-${stamp}-${selectedStudents.length}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <div
      className="sticky top-28 z-20 mb-3 rounded-2xl p-3 backdrop-blur-xl"
      style={{
        background: "rgba(99,102,241,0.12)",
        border: "1px solid rgba(99,102,241,0.35)",
        boxShadow: "0 8px 24px rgba(99,102,241,0.2)",
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-indigo-100">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
            style={{ background: "rgba(99,102,241,0.4)" }}
          >
            {selectedCount}
          </span>
          selected
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {mailtoSafe && (
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all active:scale-95"
              style={{ background: "rgba(99,102,241,0.3)" }}
            >
              ✉ Email
            </a>
          )}
          <button
            onClick={copyEmails}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all active:scale-95"
            style={{ background: "rgba(99,102,241,0.3)" }}
          >
            📋 Copy emails
          </button>
          <button
            onClick={downloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all active:scale-95"
            style={{ background: "rgba(99,102,241,0.3)" }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-300 transition-all active:scale-95"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// CSV cell formatter — wraps in quotes and escapes interior quotes.
function csvCell(s: string): string {
  if (s == null) return "";
  const needsQuote = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}
