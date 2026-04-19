"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import ActiveNowWidget from "@/components/admin/ActiveNowWidget";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import { Skeleton } from "@/components/ui/Skeleton";

// ─── Types ──────────────────────────────────────────────────────────

interface KPIs {
  totalStudents: number;
  totalRolls: number;
  activeThisWeek: number;
  avgCompletion: number;
  avgMcq: number;
  pendingRegistration: number;
}

interface StudentScore {
  email: string;
  name: string;
  section: string;
  completionPct: number;
  avgMcq: number | null;
  lastActive: string | null;
  daysSinceActive: number | null;
}

interface SectionHealth {
  name: string;
  rolls: number;
  registered: number;
  pct: number;
}

interface PendingStudent {
  email: string;
  lastActive: string | null;
}

interface WeakModule {
  moduleNumber: number;
  title: string;
  avgMcqPct: number | null;
  attemptCount: number;
  needsAttention: boolean;
}

interface SummaryResponse {
  kpis: KPIs;
  needsAttention: StudentScore[];
  topPerformers: StudentScore[];
  sectionHealth: SectionHealth[];
  pendingRegistration: PendingStudent[];
  weakModules: WeakModule[];
}

// ─── Helpers ────────────────────────────────────────────────────────

function healthColor(pct: number): string {
  if (pct >= 80) return "#22c55e";
  if (pct >= 40) return "#f59e0b";
  return "#ef4444";
}

function daysAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000
  );
  if (d <= 0) return "today";
  if (d === 1) return "1d";
  return `${d}d`;
}

function sectionShort(name: string): string {
  return name.replace(/^Section\s+/, "S");
}

// ─── Page ───────────────────────────────────────────────────────────

export default function AdminHomePage() {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const idToken = isAdmin ? getIdToken() : null;

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const credential = idToken ? { idToken } : password;
  const { data, error: fetchError, isLoading: fetchLoading } =
    useAdminFetch<SummaryResponse>("/api/admin/summary", credential, {
      enabled: authenticated,
      refreshInterval: 30_000,
    });

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
    setLoading(true);
    const res = await fetch("/api/admin/summary", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", password);
    } else {
      setAuthError("Wrong password.");
    }
    setLoading(false);
  }

  // ─── Password gate for non-admin users ─────────────────────────
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
            <p className="text-sm text-zinc-500 mb-5">
              Sign in with an admin Google account, or enter the admin
              password below.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
              placeholder="Admin password"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 mb-3"
            />
            {authError && (
              <p className="text-[12px] text-red-400 mb-3">{authError}</p>
            )}
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50"
            >
              {loading ? "Checking…" : "Continue"}
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
        <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Home" }]} />

        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Home</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Daily status · at-risk students · class health at a glance
            </p>
          </div>
          <Link
            href="/admin/roster"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full text-white transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            ➕ Create new batch
          </Link>
        </div>

        {/* ─── Alerts row ──────────────────────────────────────
             Surfaces actionable items that would otherwise only show
             up scrolling through People / Roster. Each card is a link
             to a pre-filtered list so the teacher can act in one more
             click. "All quiet today" shows when nothing warrants
             attention — a daily "you're good" reassurance. */}
        <AlertsRow data={data} loading={fetchLoading} />

        {/* ─── Live Now widget ─────────────────────────────────────
             Polls /api/admin/active-now every 20s. Shows students
             whose session was pinged within the last 10 min — a
             real "who's in the app right now" view, not just
             "active this week". Useful during class to spot which
             students started the assignment. */}
        <ActiveNowWidget idToken={idToken} password={password} />

        {/* ─── KPI row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <KpiCard
            label="Registered"
            primary={data ? `${data.kpis.totalStudents}` : "—"}
            secondary={data ? `of ${data.kpis.totalRolls}` : undefined}
            href="/admin/people"
            color="#818CF8"
            loading={fetchLoading}
          />
          <KpiCard
            label="Active this week"
            primary={data ? `${data.kpis.activeThisWeek}` : "—"}
            secondary={
              data
                ? `of ${data.kpis.totalStudents} (${
                    data.kpis.totalStudents > 0
                      ? Math.round(
                          (data.kpis.activeThisWeek /
                            data.kpis.totalStudents) *
                            100
                        )
                      : 0
                  }%)`
                : undefined
            }
            href="/admin/people?filter=active7"
            color="#34D399"
            loading={fetchLoading}
          />
          <KpiCard
            label="Avg completion"
            primary={data ? `${data.kpis.avgCompletion}%` : "—"}
            secondary="click: bottom first"
            href="/admin/people?sort=completionAsc"
            color="#F59E0B"
            loading={fetchLoading}
          />
          <KpiCard
            label="Avg MCQ"
            primary={data ? `${data.kpis.avgMcq}%` : "—"}
            secondary="click: < 50% list"
            href="/admin/people?filter=mcqLow"
            color="#A78BFA"
            loading={fetchLoading}
          />
        </div>

        {/* ─── Section health strip ────────────────────────────── */}
        {data?.sectionHealth && data.sectionHealth.length > 0 && (
          <div
            className="mb-8 rounded-2xl p-5 card-glass"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                Section health
              </h2>
              <span className="text-[10px] text-zinc-600">
                registered · click to filter
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {data.sectionHealth.map((s) => (
                <Link
                  key={s.name}
                  href={`/admin/people?section=${encodeURIComponent(s.name)}`}
                  className="p-3 rounded-xl transition-all hover:bg-white/[0.03] active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    {sectionShort(s.name)}
                  </div>
                  <div className="text-lg font-bold">{s.pct}%</div>
                  <div className="text-[10px] text-zinc-500 mb-2">
                    {s.registered}/{s.rolls}
                  </div>
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: healthColor(s.pct) }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── Insights row ────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InsightPanel
            title="🚨 Needs attention"
            subtitle="0% progress or inactive 14d+"
            empty="No students flagged — nice."
            href="/admin/people?filter=atRisk"
            items={data?.needsAttention ?? []}
            loading={fetchLoading}
            renderItem={(s) => (
              <Link
                key={s.email}
                href={`/admin/people?student=${encodeURIComponent(s.email)}`}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-200 truncate">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {sectionShort(s.section)} · {s.completionPct}% done
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 tabular-nums shrink-0">
                  {daysAgo(s.lastActive)} ago
                </div>
              </Link>
            )}
          />

          <InsightPanel
            title="🏆 Top performers"
            subtitle="blended completion + MCQ"
            empty="No students have progress yet."
            href="/admin/people?sort=blendedDesc"
            items={data?.topPerformers ?? []}
            loading={fetchLoading}
            renderItem={(s) => (
              <Link
                key={s.email}
                href={`/admin/people?student=${encodeURIComponent(s.email)}`}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-200 truncate">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {sectionShort(s.section)} · {s.completionPct}% done ·{" "}
                    {s.avgMcq ?? 0}% MCQ
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold shrink-0">
                  ✓
                </div>
              </Link>
            )}
          />
        </div>

        {/* ─── Pending registration ────────────────────────────── */}
        {data && data.kpis.pendingRegistration > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.18)",
            }}
          >
            <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
              <div>
                <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  ⏳ Pending registration
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {data.kpis.pendingRegistration} signed in but haven&apos;t
                  finished registration. Click any email to message them.
                </p>
              </div>
            </div>

            {data.pendingRegistration.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-60 overflow-y-auto">
                {data.pendingRegistration.map((p) => (
                  <a
                    key={p.email}
                    href={`mailto:${p.email}?subject=${encodeURIComponent(
                      "Finish your IFP105 registration"
                    )}&body=${encodeURIComponent(
                      "Hi — please open https://ifp105-notes.vercel.app and finish registration so your progress is saved to your section."
                    )}`}
                    className="text-[11px] text-zinc-300 hover:text-indigo-300 truncate px-2.5 py-1.5 rounded-lg bg-black/20 transition-colors"
                    title={p.email}
                  >
                    {p.email}
                    {p.lastActive && (
                      <span className="text-zinc-600 ml-1.5">
                        · {daysAgo(p.lastActive)}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500">
                List not available yet — try refresh.
              </p>
            )}
          </div>
        )}

        {fetchError && !data && (
          <div className="mt-6 p-4 rounded-xl text-sm text-red-300 bg-red-500/10 border border-red-500/20">
            Couldn&apos;t load admin data.{" "}
            {(fetchError as { status?: number }).status === 401
              ? "Unauthorized — try signing in again."
              : "Try refresh or check the server logs."}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────

// Alerts row — surfaces actionable items at the top of admin home so
// the teacher doesn't have to scroll through every section to spot
// today's problems. Each alert is a link to a filtered list.
function AlertsRow({
  data,
  loading,
}: {
  data: SummaryResponse | undefined;
  loading: boolean;
}) {
  if (loading && !data) {
    // Shared Skeleton primitive — shimmer effect instead of flat pulse.
    return (
      <Skeleton
        className="mb-6"
        height={88}
        radius={16}
      />
    );
  }
  if (!data) return null;

  // Build alert cards from the summary payload. Each item includes a
  // count + link + severity so the UI can render consistently.
  const alerts: {
    key: string;
    severity: "danger" | "warning" | "info";
    icon: string;
    count: number;
    title: string;
    href: string;
    cta: string;
  }[] = [];

  // At-risk students (0% progress or 14d+ inactive)
  const atRisk = data.needsAttention.length;
  if (atRisk > 0) {
    alerts.push({
      key: "at-risk",
      severity: atRisk >= 10 ? "danger" : "warning",
      icon: "🚨",
      count: atRisk,
      title: atRisk === 1 ? "student needs attention" : "students need attention",
      href: "/admin/people?filter=atRisk",
      cta: "Review",
    });
  }

  // Pending registrations (signed in but didn't finish)
  const pending = data.kpis.pendingRegistration;
  if (pending > 0) {
    alerts.push({
      key: "pending",
      severity: pending >= 5 ? "warning" : "info",
      icon: "⏳",
      count: pending,
      title: pending === 1 ? "pending registration" : "pending registrations",
      href: "/admin/people?filter=all",
      cta: "Chase",
    });
  }

  // Weak modules (class-wide MCQ avg below threshold)
  const weak = data.weakModules.filter((m) => m.needsAttention);
  if (weak.length > 0) {
    const worst = weak.reduce((a, b) =>
      (a.avgMcqPct ?? 100) <= (b.avgMcqPct ?? 100) ? a : b
    );
    alerts.push({
      key: "weak-module",
      severity: "warning",
      icon: "📉",
      count: weak.length,
      title:
        weak.length === 1
          ? `Module ${worst.moduleNumber} MCQ avg ${worst.avgMcqPct}%`
          : `weak modules (worst: M${worst.moduleNumber} @ ${worst.avgMcqPct}%)`,
      href: `/admin/people?filter=mcqLow`,
      cta: "Investigate",
    });
  }

  // All-quiet state — genuinely reassuring on a good day
  if (alerts.length === 0) {
    return (
      <div
        className="mb-6 rounded-2xl p-5 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(20,184,166,0.04))",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        <span className="text-2xl" aria-hidden="true">☀️</span>
        <div>
          <div className="text-sm font-bold text-emerald-300">
            All quiet today
          </div>
          <p className="text-[12px] text-zinc-400 mt-0.5">
            No at-risk students, no pending registrations, no weak
            modules flagged. Class is healthy — go teach.
          </p>
        </div>
      </div>
    );
  }

  const palette = {
    danger: {
      bg: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))",
      border: "rgba(239,68,68,0.3)",
      accent: "#F87171",
    },
    warning: {
      bg: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))",
      border: "rgba(245,158,11,0.25)",
      accent: "#FBBF24",
    },
    info: {
      bg: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))",
      border: "rgba(99,102,241,0.25)",
      accent: "#A5B4FC",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
    >
      {alerts.map((a) => {
        const p = palette[a.severity];
        return (
          <Link
            key={a.key}
            href={a.href}
            className="group rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: p.bg,
              border: `1px solid ${p.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{
                background: `${p.accent}14`,
                border: `1px solid ${p.accent}30`,
              }}
              aria-hidden="true"
            >
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-base font-bold"
                style={{ color: p.accent }}
              >
                {a.count} {a.title}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Click to {a.cta.toLowerCase()} →
              </div>
            </div>
          </Link>
        );
      })}
    </motion.div>
  );
}

function KpiCard({
  label,
  primary,
  secondary,
  href,
  color,
  loading,
}: {
  label: string;
  primary: string;
  secondary?: string;
  href: string;
  color: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="block p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] card-glass"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      {loading && primary === "—" ? (
        <div className="h-9 w-20 bg-white/[0.04] rounded animate-pulse" />
      ) : (
        <div className="text-3xl font-bold tabular-nums" style={{ color }}>
          {primary}
        </div>
      )}
      {secondary && (
        <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
          {secondary}
        </div>
      )}
    </Link>
  );
}

function InsightPanel<T>({
  title,
  subtitle,
  empty,
  href,
  items,
  loading,
  renderItem,
}: {
  title: string;
  subtitle: string;
  empty: string;
  href: string;
  items: T[];
  loading: boolean;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 card-glass flex flex-col"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <h2 className="text-sm font-bold text-zinc-300">{title}</h2>
          <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 shrink-0"
        >
          See all →
        </Link>
      </div>
      {loading && items.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-white/[0.03] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-[12px] text-zinc-500 italic py-2">{empty}</p>
      ) : (
        <div className="space-y-0.5 -mx-2 max-h-72 overflow-y-auto">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}
