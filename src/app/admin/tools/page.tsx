"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import type { AdminActionKind } from "@/lib/admin-audit";

// Phase 3 — real Tools page.
// Today ships: the audit log viewer. Tomorrow ships: dedicated export,
// reset-by-roll flow, archive batches.
//
// Pattern for future additions: one card per utility. Each card expands
// inline or opens a dialog — Tools is the one page where destructive
// actions live.

interface AuditRow {
  id: number;
  actor_email: string;
  action: AdminActionKind;
  subject_email: string | null;
  subject_batch_id: string | null;
  subject_section: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface AuditResponse {
  rows: AuditRow[];
  nextBefore: string | null;
  migrationPending?: boolean;
}

// ─── Page ─────────────────────────────────────────────────────

export default function ToolsPage() {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const idToken = isAdmin ? getIdToken() : null;

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

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

  async function login() {
    setAuthError("");
    setAuthLoading(true);
    const res = await fetch("/api/admin/audit?limit=1", {
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

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Tools" },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Tools</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Destructive &amp; sensitive actions · audit trail
          </p>
        </div>

        {/* Audit log — ready */}
        <AuditLogCard
          idToken={idToken}
          password={password}
        />

        {/* Stubbed cards for future work */}
        <div className="mt-6 grid md:grid-cols-2 gap-3">
          <StubCard
            icon="📤"
            title="Export everything"
            description="CSV or JSON export of all students, filterable by batch or section. For backups and external spreadsheets."
          />
          <StubCard
            icon="🗄"
            title="Archive old batches"
            description="Hide graduated batches from live analytics while preserving their data."
          />
        </div>
      </div>
    </main>
  );
}

// ─── Audit log card ───────────────────────────────────────────

const ACTION_META: Record<
  AdminActionKind,
  { icon: string; label: string; color: string }
> = {
  change_section: { icon: "↔", label: "Section changed", color: "#818CF8" },
  change_roll: { icon: "#", label: "Roll changed", color: "#818CF8" },
  change_email: { icon: "✉", label: "Email changed", color: "#818CF8" },
  reset_progress: { icon: "🔄", label: "Progress reset", color: "#F87171" },
  unlink: { icon: "🔗", label: "Account unlinked", color: "#F87171" },
  create_batch: { icon: "🎓", label: "Batch created", color: "#34D399" },
  add_rolls: { icon: "➕", label: "Rolls added", color: "#34D399" },
  remove_rolls: { icon: "➖", label: "Rolls removed", color: "#F59E0B" },
  rename_section: { icon: "✏", label: "Section renamed", color: "#818CF8" },
  delete_section: { icon: "🗑", label: "Section deleted", color: "#F87171" },
};

const ACTION_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All actions" },
  ...Object.entries(ACTION_META).map(([value, meta]) => ({
    value,
    label: meta.label,
  })),
];

function AuditLogCard({
  idToken,
  password,
}: {
  idToken: string | null;
  password: string;
}) {
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Build query string from filters
  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("limit", "100");
    if (actorFilter.trim()) sp.set("actor", actorFilter.trim());
    if (actionFilter) sp.set("action", actionFilter);
    if (subjectFilter.trim()) sp.set("subject", subjectFilter.trim());
    return sp.toString();
  }, [actorFilter, actionFilter, subjectFilter]);

  const credential = idToken ? { idToken } : password;
  const { data, error, isLoading, mutate } = useAdminFetch<AuditResponse>(
    `/api/admin/audit?${queryString}`,
    credential,
    { refreshInterval: 30_000 }
  );

  const rows = data?.rows ?? [];
  const migrationPending = !!data?.migrationPending;

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold flex items-center gap-2">
            📜 Audit log
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Every destructive admin action, chronological. Auto-refreshes every 30s.
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-md"
          style={{ background: "rgba(99,102,241,0.08)" }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          placeholder="Actor email…"
          className="px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
        >
          {ACTION_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          placeholder="Subject email…"
          className="px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* State handling */}
      {migrationPending ? (
        <div
          className="rounded-xl p-4 text-[12px] text-amber-300"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          ⚠ The <code>admin_actions</code> table doesn&apos;t exist yet. Run{" "}
          <code>scripts/migration-add-admin-actions.sql</code> in the Supabase
          SQL editor to enable the audit log.
        </div>
      ) : error ? (
        <div className="rounded-xl p-4 text-[12px] text-red-300 bg-red-500/10 border border-red-500/20">
          Couldn&apos;t load the log. Try refresh.
        </div>
      ) : isLoading && rows.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/[0.02] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">✨</div>
          <p className="text-[12px] text-zinc-500">
            No actions yet — or none match your filters.
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">
            Admin actions (change section · reset · unlink · create batch · etc.) appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <AuditRow
                key={row.id}
                row={row}
                expanded={expanded.has(row.id)}
                onToggle={() => toggleExpand(row.id)}
              />
            ))}
          </AnimatePresence>

          {data?.nextBefore && (
            <div className="pt-2 text-center">
              <p className="text-[10px] text-zinc-600">
                Showing {rows.length} rows · older entries not shown
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AuditRow({
  row,
  expanded,
  onToggle,
}: {
  row: AuditRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = ACTION_META[row.action] ?? {
    icon: "•",
    label: row.action,
    color: "#a1a1aa",
  };
  const summary = summarize(row);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{
            background: `${meta.color}15`,
            border: `1px solid ${meta.color}30`,
          }}
          aria-hidden="true"
        >
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `${meta.color}12`,
                color: meta.color,
              }}
            >
              {meta.label}
            </span>
            <span className="text-[11px] text-zinc-500 tabular-nums">
              {formatTime(row.created_at)}
            </span>
          </div>
          <div className="text-[12px] text-zinc-300 mt-0.5 truncate">
            {summary}
          </div>
          <div className="text-[10px] text-zinc-600 mt-0.5 truncate">
            by {row.actor_email}
          </div>
        </div>
        <span
          className="shrink-0 text-zinc-600 text-xs transition-transform"
          style={{ transform: expanded ? "rotate(90deg)" : "none" }}
        >
          ▸
        </span>
      </button>

      <AnimatePresence>
        {expanded && row.details && Object.keys(row.details).length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
            style={{
              background: "rgba(0,0,0,0.15)",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="px-3 py-2">
              <pre
                className="text-[10px] text-zinc-400 font-mono overflow-x-auto"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {JSON.stringify(row.details, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Formatters ───────────────────────────────────────────────

function summarize(row: AuditRow): string {
  const d = (row.details || {}) as Record<string, unknown>;
  const name =
    (typeof d.name === "string" && d.name) || row.subject_email || "—";

  switch (row.action) {
    case "change_section":
      return `${name}: ${d.from ?? "?"} → ${d.to ?? "?"}`;
    case "change_roll":
      return `${name}: ${d.from ?? "?"} → ${d.to ?? "?"}`;
    case "change_email":
      return `${d.from ?? "?"} → ${d.to ?? "?"}`;
    case "reset_progress":
      return `${name} · deleted ${(d.deletedRows as number) || 0} rows (${(d.deletedTopics as number) || 0} topics, ${(d.deletedQuizzes as number) || 0} quizzes)`;
    case "unlink":
      return `${name} (#${d.enrollmentNo ?? "?"}) unlinked`;
    case "create_batch":
      return `${d.name ?? row.subject_batch_id ?? "?"}${d.totalSections ? ` · ${d.totalSections} sections` : ""}${d.totalRolls ? ` · ${d.totalRolls} rolls` : ""}`;
    case "add_rolls":
      return `+${(d.count as number) ?? 0} rolls in ${row.subject_section ?? "?"}`;
    case "remove_rolls":
      return `−${(d.count as number) ?? 0} rolls in ${row.subject_section ?? "?"}`;
    case "rename_section":
      return `${d.from ?? "?"} → ${d.to ?? "?"}`;
    case "delete_section":
      return `${row.subject_section ?? "?"} · removed ${(d.removedRolls as number) ?? 0} rolls, detached ${(d.detachedStudents as number) ?? 0} students`;
    default:
      return row.subject_email || "";
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Stub card for future tools ───────────────────────────────

function StubCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 opacity-60"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-xl shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-[13px] font-bold">{title}</h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
              SOON
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
