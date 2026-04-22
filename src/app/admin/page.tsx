"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminAuthGate, { useAdminAuth } from "@/components/admin/AdminAuthGate";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { parseUtcIso } from "@/lib/parse-utc";
import ActiveNowWidget from "@/components/admin/ActiveNowWidget";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { Skeleton } from "@/components/ui/Skeleton";
import { MODULES } from "@/lib/modules";

// Derived from the single source. Replaces hard-coded [1,2,3,4,5]
// loops. Same one-liner as in other files so a 6th module lands
// everywhere automatically.
const MODULE_IDS = MODULES.map((m) => m.id);

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
    (Date.now() - parseUtcIso(dateStr)) / 86400000
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
  // Google-only auth gate. Password path removed — see adminWrite.
  const { idToken, ready } = useAdminAuth();

  const { data, error: fetchError, isLoading: fetchLoading } =
    useAdminFetch<SummaryResponse>("/api/admin/summary", { idToken }, {
      enabled: ready,
      refreshInterval: 30_000,
    });

  if (!ready) return <AdminAuthGate />;

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

        {/* ─── Live-class broadcast composer ────────────────────────
             Teacher-to-class attention pill. Type a short message
             (optionally pick a module + topic to deep-link into),
             click send, and every signed-in student's page gets a
             banner at the top within ~15s. Shows recent broadcasts
             below so the teacher can cancel before auto-expiry. */}
        <BroadcastComposer idToken={idToken} />

        {/* ─── Live Now widget ─────────────────────────────────────
             Polls /api/admin/active-now every 20s. Shows students
             whose session was pinged within the last 10 min — a
             real "who's in the app right now" view, not just
             "active this week". Useful during class to spot which
             students started the assignment. */}
        <ActiveNowWidget idToken={idToken} />

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

// ─── Broadcast composer ──────────────────────────────────────────────
//
// Dashboard card that lets the teacher fire a short message to every
// signed-in student. Body lives in admin_actions with action='broadcast'
// (no dedicated table — see POST /api/admin/broadcast). Students poll
// /api/broadcasts/latest every ~15s and surface the active broadcast
// as a banner at the top of every page.
//
// UX:
//   · Textarea with live character count (max 240 — fits two lines on
//     a phone). Submit disabled until at least one non-whitespace char.
//   · Optional module + topic dropdowns (topic options populate when a
//     module is picked). When set, the student banner shows an
//     "Open Module N · Topic M" deep-link button that jumps straight
//     into the topic via the ?topic=N query param we already handle.
//   · TTL slider (10 / 30 / 60 / 120 minutes). 30 is the default.
//     Teacher can cancel early from the "Recent broadcasts" list below.
//   · "Recent" section lists broadcasts from the last 24h with a
//     green/red dot (live / expired / cancelled) and a Cancel button
//     for live ones.
//
// Safety:
//   · Confirms before sending if the teacher typed less than 5 chars
//     (prevents accidental "hi" or test sends to the whole class).
//   · Rate-limited server-side (admin_actions insert cost is trivial;
//     the rate limiter is scoped per admin email).

interface ActiveBroadcast {
  id: number;
  actorEmail: string;
  createdAt: string;
  message: string;
  moduleNumber: number | null;
  topicId: number | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  ttlMinutes: number | null;
  status: "live" | "cancelled" | "expired";
}

const MAX_MESSAGE_LEN = 240;
const TTL_CHOICES = [10, 30, 60, 120];

function BroadcastComposer({ idToken }: { idToken: string | null }) {
  const [message, setMessage] = useState("");
  const [moduleNumber, setModuleNumber] = useState<number | null>(null);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [ttlMinutes, setTtlMinutes] = useState<number>(30);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<ActiveBroadcast[] | null>(null);
  const [lastSentId, setLastSentId] = useState<number | null>(null);

  const fetchHeaders = useMemo(() => {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (idToken) h["x-id-token"] = idToken;
    return h;
  }, [idToken]);

  // Topic-count-per-module driven by the registry (MODULE_IDS +
  // MODULES). Hard-coded 1..N here only because the client doesn't
  // fetch per-module topics by default — we use the module's
  // topicCount from MODULES so the dropdown reflects real topic
  // numbers.
  const topicsForModule = useMemo(() => {
    if (moduleNumber == null) return [];
    const m = MODULES.find((x) => x.id === moduleNumber);
    if (!m) return [];
    return Array.from({ length: m.topicCount }, (_, i) => i + 1);
  }, [moduleNumber]);

  async function loadRecent() {
    try {
      const res = await fetch("/api/broadcasts/active", {
        headers: fetchHeaders,
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      setRecent(json.broadcasts || []);
    } catch {}
  }

  useEffect(() => {
    loadRecent();
    // Refresh the recent list every 30s so "live" badges flip to
    // "expired" without the teacher refreshing the page.
    const t = setInterval(loadRecent, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken]);

  async function send() {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Type something first.");
      return;
    }
    // Soft-confirm very short messages — catches accidental "hi" sends.
    if (
      trimmed.length < 5 &&
      typeof window !== "undefined" &&
      !window.confirm(
        `Send "${trimmed}" to EVERY signed-in student? Short messages are usually test sends by accident.`
      )
    ) {
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({
          message: trimmed,
          moduleNumber,
          topicId,
          ttlMinutes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `Failed (${res.status})`);
      } else {
        setLastSentId(json.id);
        setMessage("");
        // Don't reset module/topic — teacher often sends multiple
        // broadcasts pointing to the same target during a class.
        await loadRecent();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function cancel(id: number) {
    try {
      const res = await fetch(
        `/api/admin/broadcast?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: fetchHeaders,
        }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Couldn't cancel.");
        return;
      }
      await loadRecent();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const charOver = message.length > MAX_MESSAGE_LEN;
  const armed = !sending && !!message.trim() && !charOver;

  return (
    <section className="mb-6">
      <div
        className="rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.07), rgba(139,92,246,0.05))",
          border: "1px solid rgba(99,102,241,0.25)",
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: "rgba(99,102,241,0.16)",
              color: "#A5B4FC",
            }}
            aria-hidden="true"
          >
            📣
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-zinc-100 mb-0.5">
              Broadcast to the class
            </h3>
            <p className="text-[12px] text-zinc-500 leading-relaxed">
              Push a short message to every signed-in student. Optional
              &quot;open this module/topic&quot; deep-link is shown as a
              button on their banner.
            </p>
          </div>
        </div>

        {/* Compose row */}
        <div className="space-y-2.5">
          <div>
            <label className="sr-only" htmlFor="broadcast-message">
              Broadcast message
            </label>
            <textarea
              id="broadcast-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Everyone open Module 3 Topic 5 now — we'll work on it together for 10 min."
              rows={2}
              maxLength={MAX_MESSAGE_LEN + 30}
              className="w-full px-3.5 py-3 rounded-xl text-[13px] text-white placeholder:text-zinc-600 focus:outline-none resize-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${charOver ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.1)"}`,
              }}
            />
            <div className="flex items-center justify-between mt-1">
              <span
                className={`text-[10px] ${charOver ? "text-red-400" : "text-zinc-500"} tabular-nums`}
              >
                {message.length}/{MAX_MESSAGE_LEN}
              </span>
              {lastSentId && !sending && !error && (
                <span className="text-[10px] text-emerald-400">
                  ✓ Sent — banner is live
                </span>
              )}
            </div>
          </div>

          {/* Deep-link target */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-semibold">
              Deep link (optional):
            </span>
            <select
              value={moduleNumber ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setModuleNumber(v ? parseInt(v, 10) : null);
                setTopicId(null);
              }}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-zinc-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <option value="">No module</option>
              {MODULE_IDS.map((id) => {
                const m = MODULES.find((x) => x.id === id);
                return (
                  <option key={id} value={id}>
                    Module {id} — {m?.title}
                  </option>
                );
              })}
            </select>
            {moduleNumber != null && (
              <select
                value={topicId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setTopicId(v ? parseInt(v, 10) : null);
                }}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-zinc-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <option value="">Whole module</option>
                {topicsForModule.map((n) => (
                  <option key={n} value={n}>
                    Topic {n}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* TTL */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-semibold">
              Auto-expire after:
            </span>
            {TTL_CHOICES.map((mins) => {
              const active = mins === ttlMinutes;
              return (
                <button
                  key={mins}
                  onClick={() => setTtlMinutes(mins)}
                  className="text-[11px] font-semibold px-3 py-1 rounded-full transition-colors"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                      : "rgba(255,255,255,0.04)",
                    color: active ? "#fff" : "#A1A1AA",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                </button>
              );
            })}
          </div>

          {/* Send */}
          <button
            onClick={send}
            disabled={!armed}
            className="w-full sm:w-auto sm:self-start px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            }}
          >
            {sending ? "Sending…" : "📣 Send to everyone"}
          </button>
          {error && (
            <p className="text-[12px] text-red-400 leading-relaxed">
              {error}
            </p>
          )}
        </div>

        {/* Recent list */}
        {recent && recent.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[11px] font-bold text-zinc-400 mb-2 uppercase tracking-wider">
              Recent broadcasts (24h)
            </div>
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {recent.map((b) => {
                  const dotColor =
                    b.status === "live"
                      ? "#34D399"
                      : b.status === "cancelled"
                        ? "#A1A1AA"
                        : "#F87171";
                  return (
                    <motion.li
                      key={b.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-start gap-2 px-2.5 py-2 rounded-lg text-[12px]"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span
                        className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                        style={{ background: dotColor }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 leading-relaxed break-words">
                          {b.message}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {b.status === "live" ? "Live" : b.status === "cancelled" ? "Cancelled" : "Expired"}
                          {" · "}
                          {b.moduleNumber != null
                            ? `→ M${b.moduleNumber}${b.topicId != null ? `·T${b.topicId}` : ""}`
                            : "no deep-link"}
                          {" · "}
                          {new Date(b.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {b.actorEmail}
                        </p>
                      </div>
                      {b.status === "live" && (
                        <button
                          onClick={() => cancel(b.id)}
                          className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full text-red-300 hover:text-red-200"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.25)",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
