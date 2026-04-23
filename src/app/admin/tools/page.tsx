"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AdminAuthGate, { useAdminAuth } from "@/components/admin/AdminAuthGate";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { MODULE_TOTALS } from "@/lib/modules";
import type { AdminActionKind } from "@/lib/admin-audit";
import { logError } from "@/lib/log-error";

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
  // Switched to the shared AdminAuthGate when the password path was
  // removed. The gate now ONLY accepts Google sign-in for admins.
  const { idToken, ready } = useAdminAuth();
  if (!ready) return <AdminAuthGate />;

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
          <p className="text-sm text-zinc-400 mt-1">
            Destructive &amp; sensitive actions · audit trail
          </p>
        </div>

        {/* Trash — soft-deleted topics + questions live here until
             restored or purged. Top of the list because it's the
             primary safety-net surface. */}
        <Link
          href="/admin/tools/trash"
          className="block mb-6 rounded-2xl p-5 transition-all hover:border-white/[0.18] hover:bg-white/[0.03] active:scale-[0.995]"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: "rgba(99,102,241,0.12)",
                color: "#A5B4FC",
              }}
              aria-hidden="true"
            >
              🗑️
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold mb-0.5">Trash</div>
              <p className="text-[12px] text-zinc-400 leading-relaxed">
                Restore or permanently delete topics and questions you&apos;ve
                moved to the bin. Deletes are recoverable until you purge them.
              </p>
            </div>
            <span className="text-zinc-400 text-sm shrink-0">→</span>
          </div>
        </Link>

        {/* The "Migrate TS flashcards → DB" card used to live here as
             a one-shot migration. Removed Apr 20 once the teacher
             confirmed every topic had been ported. The
             MigrateTsFlashcardsCard component + its /api/admin/
             migrate-ts-flashcards endpoint are still in the codebase
             (idempotent, safe) in case a fresh deployment needs to
             run it once — re-add <MigrateTsFlashcardsCard idToken=
             {idToken} /> here if that ever happens. */}

        {/* Nuclear: wipe every student's progress in one action. */}
        <ResetAllProgressCard idToken={idToken} />

        {/* Search a roll number, see who currently owns it, unlink
            with one click so the real student can re-register. */}
        <UnlinkByRollCard idToken={idToken} />

        {/* Look up a roll or a name across the roll list AND the
            students (registered) table at once. Read-only — this is
            the "where is this student" diagnostic, not a destructive
            action. Use case: class-day "Komron says he can't sign in"
            — type the name, see the real roll + which section it's
            in. */}
        <RollLookupCard idToken={idToken} />

        {/* Pull LinkedIn profile photos for every student who saved a
            LinkedIn URL but never uploaded a photo. Non-destructive. */}
        <BackfillLinkedInPhotosCard idToken={idToken} />

        {/* Audit log — ready */}
        <AuditLogCard idToken={idToken} />

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
  // People / roster
  change_section: { icon: "↔", label: "Section changed", color: "#818CF8" },
  change_roll: { icon: "#", label: "Roll changed", color: "#818CF8" },
  change_email: { icon: "✉", label: "Email changed", color: "#818CF8" },
  change_name: { icon: "🪪", label: "Name changed", color: "#818CF8" },
  reset_progress: { icon: "🔄", label: "Progress reset", color: "#F87171" },
  reset_progress_all: { icon: "🧹", label: "All progress wiped", color: "#EF4444" },
  restore_progress_all: { icon: "♻️", label: "Progress restored", color: "#34D399" },
  unlink: { icon: "🔗", label: "Account unlinked", color: "#F87171" },
  delete_student: { icon: "🗑", label: "Student deleted", color: "#F87171" },
  create_batch: { icon: "🎓", label: "Batch created", color: "#34D399" },
  add_rolls: { icon: "➕", label: "Rolls added", color: "#34D399" },
  remove_rolls: { icon: "➖", label: "Rolls removed", color: "#F59E0B" },
  rename_section: { icon: "✏", label: "Section renamed", color: "#818CF8" },
  delete_section: { icon: "🗑", label: "Section deleted", color: "#F87171" },
  // Course CMS — green for creates, indigo for updates, red for deletes.
  create_course: { icon: "📚", label: "Course created", color: "#34D399" },
  update_course: { icon: "✏", label: "Course updated", color: "#818CF8" },
  delete_course: { icon: "🗑", label: "Course deleted", color: "#F87171" },
  create_module: { icon: "🧱", label: "Module created", color: "#34D399" },
  update_module: { icon: "✏", label: "Module updated", color: "#818CF8" },
  delete_module: { icon: "🗑", label: "Module deleted", color: "#F87171" },
  create_topic: { icon: "📝", label: "Topic created", color: "#34D399" },
  update_topic: { icon: "✏", label: "Topic updated", color: "#818CF8" },
  delete_topic: { icon: "🗑", label: "Topic deleted", color: "#F87171" },
  create_question: { icon: "❓", label: "Question created", color: "#34D399" },
  update_question: { icon: "✏", label: "Question updated", color: "#818CF8" },
  delete_question: { icon: "🗑", label: "Question deleted", color: "#F87171" },
  // Trash — soft-delete distinguishes from hard delete (which now only
  // fires via /admin/tools/trash purge after an explicit confirm).
  soft_delete_topic: { icon: "🗑️", label: "Topic moved to trash", color: "#FBBF24" },
  soft_delete_question: { icon: "🗑️", label: "Question moved to trash", color: "#FBBF24" },
  restore_topic: { icon: "♻️", label: "Topic restored", color: "#34D399" },
  restore_question: { icon: "♻️", label: "Question restored", color: "#34D399" },
  restore_flashcard: { icon: "♻️", label: "Flashcard restored", color: "#34D399" },
  purge_topic: { icon: "💥", label: "Topic purged (permanent)", color: "#F87171" },
  purge_question: { icon: "💥", label: "Question purged (permanent)", color: "#F87171" },
  purge_flashcard: { icon: "💥", label: "Flashcard purged (permanent)", color: "#F87171" },
  // Content migration / one-shot actions
  seed_ict: { icon: "📥", label: "ICT seeded to DB", color: "#A78BFA" },
  migrate_ts_flashcards: {
    icon: "🃏",
    label: "TS flashcards migrated to DB",
    color: "#A78BFA",
  },
  // Backfill actions
  backfill_linkedin_photos: {
    icon: "📷",
    label: "LinkedIn photos backfilled",
    color: "#60A5FA",
  },
  // Live-class broadcasts
  broadcast: {
    icon: "📣",
    label: "Class broadcast sent",
    color: "#818CF8",
  },
  broadcast_cancel: {
    icon: "🚫",
    label: "Broadcast cancelled",
    color: "#A1A1AA",
  },
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
}: {
  idToken: string | null;
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

  const { data, error, isLoading, mutate } = useAdminFetch<AuditResponse>(
    `/api/admin/audit?${queryString}`,
    { idToken },
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
          <p className="text-[12px] text-zinc-400">
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


// ─── Migrate TS flashcards card ────────────────────────────────
//
// One-click button that calls /api/admin/migrate-ts-flashcards. Walks
// every TS-defined deck in src/data/flashcards.ts and inserts them
// into the matching topic's flashcards_json. Skips topics that already
// have admin-edited cards so re-running is safe.
//
// After this runs, every ICT topic is DB-backed for flashcards →
// admin can edit / delete / restore / reorder freely.
//
// Unused after Apr 20 — kept in-file (rather than deleted) so
// re-enabling it for a fresh deployment is a one-line change above.
// The server-side /api/admin/migrate-ts-flashcards endpoint remains
// idempotent and safe to call.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MigrateTsFlashcardsCard({
  idToken,
}: {
  idToken: string | null;
}) {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<{
    scanned: number;
    migrated: { moduleNumber: number; topicNumber: number; cardCount: number }[];
    skipped: { moduleNumber: number; topicNumber: number; reason: string }[];
    errors: { moduleNumber: number; topicNumber: number; message: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setReport(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) headers["x-id-token"] = idToken;
      const res = await fetch("/api/admin/migrate-ts-flashcards", {
        method: "POST",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Failed (${res.status})`);
      setReport(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      className="mt-6 rounded-2xl p-5"
      style={{
        background: "rgba(99,102,241,0.04)",
        border: "1px solid rgba(99,102,241,0.18)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: "rgba(99,102,241,0.12)",
            color: "#A5B4FC",
          }}
          aria-hidden="true"
        >
          🃏
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold mb-1">
            Migrate TS flashcards → DB
          </div>
          <p className="text-[12px] text-zinc-400 leading-relaxed mb-3">
            One-click move of every flashcard deck currently bundled in
            <code className="px-1 py-0.5 rounded bg-black/30 text-zinc-400 mx-1">src/data/flashcards.ts</code>
            into its matching topic in the database. After this, you can
            edit, delete, reorder, and use trash on every flashcard
            without touching code. Idempotent — topics that already have
            cards are skipped.
          </p>
          <button
            onClick={run}
            disabled={running}
            className="text-[12px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            {running ? "Migrating…" : "Run migration"}
          </button>

          {error && (
            <p className="mt-3 text-[12px] text-red-400">⚠️ {error}</p>
          )}

          {report && (
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 font-semibold">
                  ✓ {report.migrated.length} migrated
                </span>
                <span className="px-2 py-1 rounded-md bg-amber-500/15 text-amber-300 font-semibold">
                  ⊘ {report.skipped.length} skipped
                </span>
                {report.errors.length > 0 && (
                  <span className="px-2 py-1 rounded-md bg-red-500/15 text-red-300 font-semibold">
                    ✗ {report.errors.length} errors
                  </span>
                )}
                <span className="px-2 py-1 rounded-md text-zinc-500">
                  ({report.scanned} scanned)
                </span>
              </div>
              {report.migrated.length > 0 && (
                <details className="text-[11px] text-zinc-500">
                  <summary className="cursor-pointer hover:text-zinc-300">
                    View migrated topics
                  </summary>
                  <ul className="mt-2 space-y-0.5 pl-4">
                    {report.migrated.map((m, i) => (
                      <li key={i}>
                        Module {m.moduleNumber} · Topic {m.topicNumber} ·{" "}
                        {m.cardCount} card{m.cardCount === 1 ? "" : "s"}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {report.errors.length > 0 && (
                <details className="text-[11px] text-red-400" open>
                  <summary className="cursor-pointer">
                    Errors (need attention)
                  </summary>
                  <ul className="mt-2 space-y-0.5 pl-4">
                    {report.errors.map((e, i) => (
                      <li key={i}>
                        M{e.moduleNumber}.T{e.topicNumber}: {e.message}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reset-all-progress card ─────────────────────────────────
//
// The SAFE way to run the nuclear "wipe everyone's progress" action.
// Replaces the old "paste this in DevTools console" workflow, which
// was (a) copy-paste hazardous in a regular browser session where the
// admin is also debugging other things, and (b) offered zero visible
// confirmation.
//
// Safety model:
//   1. The card starts collapsed — you have to click "Open" to even
//      see the button.
//   2. To arm the action you have to TYPE the exact phrase
//      "RESET ALL PROGRESS" (matches the server-side body guard).
//      Anything else keeps the button disabled.
//   3. The confirm button itself shows the exact row count that will
//      be deleted AFTER a preflight request.
//   4. On success the input is cleared and the card collapses so you
//      can't accidentally re-run it.
interface RestorableReset {
  id: number;
  createdAt: string;
  actorEmail: string;
  moduleNumber: number | null;
  topicId: number | null;
  batchId: string | null;
  section: string | null;
  cohortSize: number | null;
  deletedRows: number;
  scope: string;
  snapshotSize: number;
}

// Minimal shape we consume from /api/admin/summary for populating
// the cohort dropdowns. The summary payload has lots more — we only
// need the lists of batches + sections here.
interface CohortLists {
  sectionHealth?: { name: string }[];
  batches?: string[];
}

// Topic counts per module used to build the per-topic dropdown.
// Imported from the single registry source (@/lib/modules) so when a
// module gains or loses a topic, this dropdown adjusts automatically.
// Previously inlined here — the audit flagged it as a sync-bug risk
// (two parallel copies of the same data) and we moved it to the
// registry-backed value.
const TOPICS_PER_MODULE = MODULE_TOTALS;

function ResetAllProgressCard({ idToken }: { idToken: string | null }) {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  // "all" = every module, 1-5 = just that module.
  const [moduleScope, setModuleScope] = useState<"all" | "1" | "2" | "3" | "4" | "5">("all");
  // Optional narrower scope: null = wipe the whole chosen module,
  // number = wipe only that topic. Reset whenever moduleScope
  // changes to avoid pointing at a topic that doesn't exist in
  // the newly-selected module.
  const [topicScope, setTopicScope] = useState<number | null>(null);
  // Optional cohort scope — batch and/or section. Null = no cohort
  // filter (every student matches). Use case: "reset Module 3 for
  // just Section 2" during a class where only that section was
  // practicing and the teacher wants a clean slate.
  const [batchScope, setBatchScope] = useState<string | null>(null);
  const [sectionScope, setSectionScope] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    deletedRows: number;
    epoch: string;
    actionId: number;
    scope: string;
    cohortSize: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pull the list of batches + sections from /api/admin/summary so
  // the cohort dropdowns match the same values every other admin
  // surface uses. Lazy-loaded: only fires once the card opens.
  const { data: cohortLists } = useAdminFetch<CohortLists>(
    "/api/admin/summary",
    { idToken },
    { enabled: open, refreshInterval: 0 }
  );
  const sectionOptions = useMemo(
    () => (cohortLists?.sectionHealth ?? []).map((s) => s.name),
    [cohortLists]
  );
  const batchOptions = useMemo(
    () => cohortLists?.batches ?? [],
    [cohortLists]
  );

  // Preview: how many rows the CURRENT scope would delete if we
  // pulled the trigger right now. Refetched whenever moduleScope /
  // topicScope changes so the admin sees the blast radius BEFORE
  // typing the arm phrase. Null = loading / not yet fetched.
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Restorable list
  const [restorable, setRestorable] = useState<RestorableReset[] | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  const ARM_PHRASE = "RESET ALL PROGRESS";
  const armed = phrase === ARM_PHRASE;

  const fetchHeaders = useMemo(() => {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (idToken) h["x-id-token"] = idToken;
    return h;
  }, [idToken]);

  // Dry-run count: show the admin exactly how many progress rows
  // their current scope would delete BEFORE they type the arm
  // phrase. Avoids the "wait, did I mean Module 3 or Topic 3?" mis-
  // scope panic during live class. Fires on every scope change AND
  // when the card opens for the first time.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const body: {
      moduleNumber?: number;
      topicId?: number;
      batchId?: string;
      section?: string;
    } = {};
    if (moduleScope !== "all") {
      body.moduleNumber = parseInt(moduleScope, 10);
      if (topicScope != null) body.topicId = topicScope;
    }
    if (batchScope) body.batchId = batchScope;
    if (sectionScope) body.section = sectionScope;
    setPreviewLoading(true);
    fetch("/api/admin/students/preview-reset", {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify(body),
    })
      .then((r) => (r.ok ? r.json() : { count: null }))
      .then((json) => {
        if (!alive) return;
        setPreviewCount(typeof json.count === "number" ? json.count : null);
      })
      .catch(() => {
        if (alive) setPreviewCount(null);
      })
      .finally(() => {
        if (alive) setPreviewLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, moduleScope, topicScope, batchScope, sectionScope, fetchHeaders]);

  // Load the restorable list once the card opens, and refresh after
  // every reset/restore so the UI stays in sync without a page reload.
  async function loadRestorable() {
    setRestoreLoading(true);
    setRestoreError(null);
    try {
      const res = await fetch("/api/admin/students/restorable-resets", {
        headers: fetchHeaders,
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        setRestoreError(json.error || `HTTP ${res.status}`);
      } else {
        setRestorable(json.rows || []);
      }
    } catch (e) {
      setRestoreError((e as Error).message);
    } finally {
      setRestoreLoading(false);
    }
  }

  async function run() {
    if (!armed) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const body: {
        confirm: string;
        moduleNumber?: number;
        topicId?: number;
        batchId?: string;
        section?: string;
      } = {
        confirm: ARM_PHRASE,
      };
      if (moduleScope !== "all") {
        body.moduleNumber = parseInt(moduleScope, 10);
        // Topic scope is only valid when a specific module is selected.
        // If moduleScope flipped to "all" but topicScope was still set,
        // the server would reject it anyway — but we'd rather not send.
        if (topicScope != null) body.topicId = topicScope;
      }
      if (batchScope) body.batchId = batchScope;
      if (sectionScope) body.section = sectionScope;

      const res = await fetch("/api/admin/students/reset-all-progress", {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `HTTP ${res.status}`);
      } else {
        setResult({
          deletedRows: json.deletedRows,
          epoch: json.epoch,
          actionId: json.actionId,
          scope: json.scope,
          cohortSize: json.cohortSize ?? null,
        });
        setPhrase("");
        // Refresh the restore list so the just-created row shows up
        // with a Restore button next to it.
        loadRestorable();
        // Force-fresh admin aggregates in sibling tabs right now.
        // /api/admin/summary + /api/admin/people are `Cache-Control:
        // private, max-age=30` so the admin's own browser will serve
        // pre-reset KPIs for up to 30s on F5 otherwise. Audit report
        // flagged this as the main cascade miss after a reset.
        // `cache: "no-store"` + sending to the admin-aware endpoints
        // warms the HTTP cache with post-reset data.
        // Fire-and-forget cache warmup — errors are non-fatal (the
        // next real page fetch retries). Log via logError so they're
        // observable in Vercel logs instead of being silent.
        fetch("/api/admin/summary", {
          headers: fetchHeaders,
          cache: "no-store",
        }).catch((e) => logError("admin/tools.cache-warm.summary", e));
        fetch("/api/admin/people", {
          headers: fetchHeaders,
          cache: "no-store",
        }).catch((e) => logError("admin/tools.cache-warm.people", e));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  async function runRestore(id: number) {
    setRestoringId(id);
    setRestoreError(null);
    setRestoreSuccess(null);
    try {
      const res = await fetch("/api/admin/students/restore-progress", {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({ actionId: id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRestoreError(json.error || `HTTP ${res.status}`);
      } else {
        setRestoreSuccess(
          `♻️ Restored ${json.restoredRows} progress rows from reset #${id}.`
        );
        loadRestorable();
      }
    } catch (e) {
      setRestoreError((e as Error).message);
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div
      className="mb-6 rounded-2xl p-5 transition-colors"
      style={{
        background: "rgba(239,68,68,0.04)",
        border: "1px solid rgba(239,68,68,0.22)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: "rgba(239,68,68,0.14)", color: "#FCA5A5" }}
          aria-hidden="true"
        >
          🧹
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="text-sm font-bold mb-0.5 text-red-300">
                Reset all student progress
              </div>
              <p className="text-[12px] text-zinc-400 leading-relaxed mb-2">
                Wipes every row of <code className="text-zinc-400">student_progress</code>{" "}
                across every module. Clients clear their localStorage on
                next load so nothing re-uploads.
              </p>
              {/* Explicit what-is-wiped vs what-is-kept so the admin is
                  never afraid of losing LinkedIn URLs, interest tags,
                  profile photos, etc. This reset touches one table only. */}
              <div className="grid sm:grid-cols-2 gap-2 mt-2 text-[11px]">
                <div
                  className="rounded-lg p-2.5"
                  style={{
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.16)",
                  }}
                >
                  <div className="font-bold text-red-300 mb-1">
                    Wipes (module progress only)
                  </div>
                  <ul className="text-zinc-400 space-y-0.5 list-disc list-inside">
                    <li>Topic completions</li>
                    <li>MCQ scores</li>
                    <li>Bloom&apos;s stats</li>
                    <li>Confidence calibration</li>
                    <li>Challenge attempts</li>
                  </ul>
                </div>
                <div
                  className="rounded-lg p-2.5"
                  style={{
                    background: "rgba(34,197,94,0.05)",
                    border: "1px solid rgba(34,197,94,0.18)",
                  }}
                >
                  <div className="font-bold text-emerald-300 mb-1">
                    Keeps (everything else)
                  </div>
                  <ul className="text-zinc-400 space-y-0.5 list-disc list-inside">
                    <li>Name, email, enrollment</li>
                    <li>Photo, bio, LinkedIn</li>
                    <li>Interest tags / skills</li>
                    <li>Batch &amp; section</li>
                    <li>Roll list &amp; sessions</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !open;
                setOpen(next);
                setPhrase("");
                setError(null);
                setResult(null);
                // Fetch the restore list the first time the card
                // opens so a teacher who just wiped can immediately
                // undo without clicking refresh.
                if (next && restorable === null) loadRestorable();
              }}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0"
              style={{
                background: open
                  ? "rgba(239,68,68,0.16)"
                  : "rgba(255,255,255,0.06)",
                color: open ? "#FCA5A5" : "#D4D4D8",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {open ? "Close" : "Open"}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Scope selector: which module(s) to wipe. "All" is
                      the nuclear option; 1-5 wipes just that module's
                      rows for every student. Every scope is snapshot-
                      backed via admin_actions so restore works the
                      same regardless of scope. */}
                  <div>
                    <div className="text-[11px] text-zinc-400 font-semibold mb-1.5">
                      Scope
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(["all", "1", "2", "3", "4", "5"] as const).map((k) => {
                        const label = k === "all" ? "All modules" : `Module ${k}`;
                        const isActive = moduleScope === k;
                        return (
                          <button
                            key={k}
                            onClick={() => {
                              setModuleScope(k);
                              // Topic scope only makes sense inside a
                              // specific module; clear it whenever the
                              // module selection changes so the dropdown
                              // resets to "whole module".
                              setTopicScope(null);
                            }}
                            className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors"
                            style={{
                              background: isActive
                                ? "linear-gradient(135deg, #EF4444, #B91C1C)"
                                : "rgba(255,255,255,0.04)",
                              color: isActive ? "#fff" : "#A1A1AA",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Per-topic narrowing. Only meaningful when a
                        specific module is selected — a single topic id
                        isn't unique across modules, and "reset Topic 3
                        of every module" isn't a real use case. So this
                        dropdown hides itself when scope = "all". */}
                    {moduleScope !== "all" && (
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <label className="text-[11px] text-zinc-500">
                          Narrow to topic (optional):
                        </label>
                        <select
                          value={topicScope ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTopicScope(v === "" ? null : parseInt(v, 10));
                          }}
                          className="text-[11px] font-semibold px-2 py-1.5 rounded-lg text-zinc-200 focus:outline-none"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <option value="">
                            Whole module ({TOPICS_PER_MODULE[parseInt(moduleScope, 10)] || 0} topics)
                          </option>
                          {Array.from(
                            { length: TOPICS_PER_MODULE[parseInt(moduleScope, 10)] || 0 },
                            (_, i) => i + 1
                          ).map((n) => (
                            <option key={n} value={n}>
                              Only Topic {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Cohort (batch + section) narrowing. Teacher use
                        case: "reset Module 3 progress for just
                        Section 2" without touching other sections.
                        Both are optional and combine — choosing just
                        a section wipes that section across all
                        batches; choosing both narrows further. Hidden
                        when neither batches nor sections have loaded
                        (fresh install) so the card still works. */}
                    {(batchOptions.length > 0 || sectionOptions.length > 0) && (
                      <div className="mt-3 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="text-[11px] text-zinc-400 font-semibold mb-1.5">
                          Cohort (optional) — narrow to a specific batch / section
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          {batchOptions.length > 0 && (
                            <label className="flex items-center gap-1.5">
                              <span className="text-[11px] text-zinc-500">Batch:</span>
                              <select
                                value={batchScope ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setBatchScope(v === "" ? null : v);
                                }}
                                className="text-[11px] font-semibold px-2 py-1.5 rounded-lg text-zinc-200 focus:outline-none"
                                style={{
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <option value="">All batches</option>
                                {batchOptions.map((b) => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          {sectionOptions.length > 0 && (
                            <label className="flex items-center gap-1.5">
                              <span className="text-[11px] text-zinc-500">Section:</span>
                              <select
                                value={sectionScope ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setSectionScope(v === "" ? null : v);
                                }}
                                className="text-[11px] font-semibold px-2 py-1.5 rounded-lg text-zinc-200 focus:outline-none"
                                style={{
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <option value="">All sections</option>
                                {sectionOptions.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          {(batchScope || sectionScope) && (
                            <button
                              onClick={() => {
                                setBatchScope(null);
                                setSectionScope(null);
                              }}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
                            >
                              Clear cohort
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-zinc-500 mt-1.5">
                      {(() => {
                        const modPart =
                          moduleScope === "all"
                            ? "every module"
                            : topicScope != null
                              ? `Module ${moduleScope} Topic ${topicScope}`
                              : `Module ${moduleScope}`;
                        const cohortPart =
                          batchScope && sectionScope
                            ? ` for students in batch ${batchScope}, ${sectionScope}`
                            : batchScope
                              ? ` for students in batch ${batchScope}`
                              : sectionScope
                                ? ` for students in ${sectionScope}`
                                : " for every student";
                        const tail =
                          batchScope || sectionScope
                            ? ". Other cohorts untouched."
                            : moduleScope === "all"
                              ? "."
                              : topicScope != null
                                ? ". Other topics + modules untouched."
                                : ". Other modules untouched.";
                        return `Wipes ${modPart}${cohortPart}${tail}`;
                      })()}
                    </div>
                  </div>

                  {/* Blast-radius preview. Re-fetched on every scope
                      change, so the teacher always sees the exact
                      count that would be deleted for the CURRENT
                      selection. Empty-state (0 rows) still shows so
                      the admin knows the scope is valid but nothing
                      matches. Null = fetch error; we hide rather
                      than lie about a number. */}
                  <div
                    className="rounded-lg px-3 py-2 text-[12px]"
                    style={{
                      background:
                        previewCount != null && previewCount > 0
                          ? "rgba(239,68,68,0.06)"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        previewCount != null && previewCount > 0
                          ? "rgba(239,68,68,0.22)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                    }}
                  >
                    {previewLoading ? (
                      <span className="text-zinc-500">
                        Counting rows in scope…
                      </span>
                    ) : previewCount == null ? (
                      <span className="text-zinc-500">
                        Couldn&apos;t preview row count. The reset will still
                        run — you just won&apos;t see the number first.
                      </span>
                    ) : previewCount === 0 ? (
                      <span className="text-emerald-300">
                        ✓ Nothing to delete — scope is empty. No rows match.
                      </span>
                    ) : (
                      <span className="text-red-300">
                        ⚠️ Will delete{" "}
                        <strong>{previewCount.toLocaleString()}</strong>{" "}
                        progress rows matching this scope.
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-zinc-500 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    To arm the button, type{" "}
                    <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-red-300 font-semibold">
                      {ARM_PHRASE}
                    </code>{" "}
                    exactly below.
                  </div>
                  <input
                    type="text"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    placeholder={`Type "${ARM_PHRASE}" to enable`}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-3 py-2 text-sm rounded-lg text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: armed
                        ? "1px solid rgba(239,68,68,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    }}
                  />
                  <button
                    onClick={run}
                    disabled={!armed || running}
                    className="w-full py-2.5 text-sm font-bold rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    style={{
                      background: armed
                        ? "linear-gradient(135deg, #EF4444, #B91C1C)"
                        : "rgba(255,255,255,0.04)",
                      boxShadow: armed ? "0 2px 12px rgba(239,68,68,0.3)" : "none",
                    }}
                  >
                    {running
                      ? "Wiping…"
                      : armed
                        ? (() => {
                            const modPart =
                              moduleScope === "all"
                                ? "all modules"
                                : topicScope != null
                                  ? `Module ${moduleScope} · Topic ${topicScope}`
                                  : `Module ${moduleScope}`;
                            const cohortPart =
                              batchScope && sectionScope
                                ? ` · ${batchScope} / ${sectionScope}`
                                : batchScope
                                  ? ` · batch ${batchScope}`
                                  : sectionScope
                                    ? ` · ${sectionScope}`
                                    : "";
                            const target =
                              batchScope || sectionScope ? "cohort" : "every student";
                            return `🧹  Wipe ${modPart} for ${target}${cohortPart}`;
                          })()
                        : "Type the phrase above to enable"}
                  </button>

                  {error && (
                    <div
                      className="p-3 rounded-lg text-[12px] text-red-300"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.22)",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {result && (
                    <div
                      className="p-3 rounded-lg text-[12px] text-emerald-300"
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.22)",
                      }}
                    >
                      ✅ Done. Deleted <strong>{result.deletedRows}</strong>{" "}
                      rows{" "}
                      {result.cohortSize != null && (
                        <>
                          across <strong>{result.cohortSize}</strong>{" "}
                          student{result.cohortSize === 1 ? "" : "s"}{" "}
                        </>
                      )}
                      (scope: <code>{result.scope}</code>, reset id{" "}
                      <strong>#{result.actionId}</strong>). Students will
                      see 0% on next page load; local caches auto-clear.
                      You can still undo this from the bin below.
                    </div>
                  )}

                  {/* ─── Restore bin ─────────────────────────────────
                      Every reset above stores a snapshot of the
                      deleted rows in its admin_actions.details JSON.
                      This panel lists reset actions that haven't been
                      restored yet, with a single-click Undo button
                      per entry. Once restored, the entry drops out
                      of the list (but the underlying audit row stays,
                      marked restored: true, for history). */}
                  <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                        🗑 Recent resets (undo bin)
                      </div>
                      <button
                        onClick={loadRestorable}
                        disabled={restoreLoading}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
                      >
                        {restoreLoading ? "Refreshing…" : "Refresh"}
                      </button>
                    </div>
                    {restoreError && (
                      <div className="p-2 rounded-lg text-[11px] text-red-300" style={{ background: "rgba(239,68,68,0.08)" }}>
                        {restoreError}
                      </div>
                    )}
                    {restoreSuccess && (
                      <div className="p-2 rounded-lg text-[11px] text-emerald-300 mb-2" style={{ background: "rgba(34,197,94,0.08)" }}>
                        {restoreSuccess}
                      </div>
                    )}
                    {restorable !== null && restorable.length === 0 && !restoreLoading && (
                      <div className="text-[11px] text-zinc-500 italic py-2">
                        Nothing to restore yet. Resets you perform will
                        appear here with a one-click Undo.
                      </div>
                    )}
                    {restorable && restorable.length > 0 && (
                      <div className="space-y-1.5">
                        {restorable.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-semibold text-zinc-200 truncate">
                                {r.moduleNumber != null && r.topicId != null
                                  ? `Module ${r.moduleNumber} · Topic ${r.topicId} reset`
                                  : r.moduleNumber != null
                                    ? `Module ${r.moduleNumber} reset`
                                    : "All-modules reset"}
                                {(r.batchId || r.section) && (
                                  <span className="text-indigo-300 font-semibold">
                                    {" · "}
                                    {r.batchId && r.section
                                      ? `${r.batchId} / ${r.section}`
                                      : r.batchId
                                        ? `batch ${r.batchId}`
                                        : r.section}
                                  </span>
                                )}{" "}
                                <span className="text-zinc-500 font-normal">
                                  · {r.deletedRows} rows
                                  {r.cohortSize != null &&
                                    ` across ${r.cohortSize} student${r.cohortSize === 1 ? "" : "s"}`}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                by {r.actorEmail} ·{" "}
                                {new Date(r.createdAt).toLocaleString()} ·
                                id #{r.id}
                              </div>
                            </div>
                            <button
                              onClick={() => runRestore(r.id)}
                              disabled={restoringId === r.id}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-full text-white shrink-0 disabled:opacity-50"
                              style={{
                                background:
                                  "linear-gradient(135deg, #10B981, #059669)",
                              }}
                            >
                              {restoringId === r.id ? "Restoring…" : "♻️ Undo"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Profile-photo diagnostic card ────────────────────────────
//
// Previously this was a "fetch from LinkedIn" one-click backfill. It
// didn't work: LinkedIn blocks server-side OG scraping from Vercel IPs
// almost 100% of the time, so every attempted fetch failed.
//
// New behaviour (Apr 2026): the card is DIAGNOSTIC. It shows how many
// students have / don't have a profile photo, and who's still missing
// one, so the teacher knows who to nudge. The photo auto-fill happens
// passively whenever a student signs in with Google and opens the
// profile page — /api/students/sync-google-photo quietly saves their
// Google profile picture.
//
// For students who won't sign in with Google (password-session users),
// the teacher can see their entry in the candidates list and ask them
// to upload a photo manually.
function BackfillLinkedInPhotosCard({ idToken }: { idToken: string | null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{
    totalStudents: number;
    withPhoto: number;
    withoutPhoto: number;
    withLinkedInAnyUrl: number;
    withLinkedInValid: number;
    withLinkedInInvalid: number;
    candidatesNoPhoto: {
      email: string;
      name: string | null;
      section: string | null;
      batchId: string | null;
      linkedinUrl: string | null;
      linkedinUrlValid: boolean;
    }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHeaders = useMemo(() => {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (idToken) h["x-id-token"] = idToken;
    return h;
  }, [idToken]);

  async function runReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/admin/students/backfill-linkedin-photos",
        {
          method: "POST",
          headers: fetchHeaders,
          body: JSON.stringify({}),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `HTTP ${res.status}`);
      } else {
        setReport({
          totalStudents: json.totalStudents,
          withPhoto: json.withPhoto,
          withoutPhoto: json.withoutPhoto,
          withLinkedInAnyUrl: json.withLinkedInAnyUrl,
          withLinkedInValid: json.withLinkedInValid,
          withLinkedInInvalid: json.withLinkedInInvalid,
          candidatesNoPhoto: json.candidatesNoPhoto || [],
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const coveragePct = report && report.totalStudents > 0
    ? Math.round((report.withPhoto / report.totalStudents) * 100)
    : null;

  return (
    <div
      className="mb-6 rounded-2xl p-5 transition-colors"
      style={{
        background: "rgba(59,130,246,0.04)",
        border: "1px solid rgba(59,130,246,0.22)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: "rgba(59,130,246,0.14)", color: "#93C5FD" }}
          aria-hidden="true"
        >
          📷
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="text-sm font-bold mb-0.5 text-blue-300">
                Profile photo coverage
              </div>
              <p className="text-[12px] text-zinc-400 leading-relaxed">
                Students get a photo automatically when they sign in
                with Google and open{" "}
                <code className="text-zinc-400">/profile/edit</code> —
                their Google profile picture fills in the empty{" "}
                <code className="text-zinc-400">photo_url</code>. Open
                this card to see who still hasn&apos;t signed in and who
                to nudge.
              </p>
            </div>
            <button
              onClick={() => {
                const next = !open;
                setOpen(next);
                setError(null);
                if (next && !report) runReport();
              }}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0"
              style={{
                background: open
                  ? "rgba(59,130,246,0.16)"
                  : "rgba(255,255,255,0.06)",
                color: open ? "#93C5FD" : "#D4D4D8",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {open ? "Close" : "Open"}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 pt-4 space-y-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {loading && !report && (
                    <div className="text-[12px] text-zinc-400">
                      Counting photos…
                    </div>
                  )}

                  {error && (
                    <div
                      className="p-3 rounded-lg text-[12px] text-red-300"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.22)",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {report && (
                    <>
                      {/* Coverage bar */}
                      <div
                        className="rounded-lg p-3"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-zinc-400 font-semibold">
                            Photo coverage
                          </span>
                          <span className="text-[12px] font-bold text-white tabular-nums">
                            {report.withPhoto}/{report.totalStudents}
                            {coveragePct != null && (
                              <span className="text-zinc-500 font-normal">
                                {" "}
                                ({coveragePct}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{
                              width: `${coveragePct ?? 0}%`,
                              background:
                                "linear-gradient(90deg, #3B82F6, #60A5FA)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Secondary stats */}
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <StatChip
                          label="Missing photo"
                          value={report.withoutPhoto}
                          tone="warn"
                        />
                        <StatChip
                          label="LinkedIn URL set"
                          value={report.withLinkedInValid}
                          tone="info"
                        />
                        <StatChip
                          label="Bad LinkedIn URL"
                          value={report.withLinkedInInvalid}
                          tone={
                            report.withLinkedInInvalid > 0 ? "warn" : "muted"
                          }
                        />
                      </div>

                      {/* Candidate list */}
                      {report.candidatesNoPhoto.length === 0 ? (
                        <div
                          className="p-3 rounded-lg text-[12px] text-emerald-300"
                          style={{
                            background: "rgba(34,197,94,0.08)",
                            border: "1px solid rgba(34,197,94,0.22)",
                          }}
                        >
                          ✓ Every student has a profile photo.
                        </div>
                      ) : (
                        <details
                          className="text-[11px] text-zinc-400 rounded-lg p-2"
                          style={{ background: "rgba(255,255,255,0.02)" }}
                          open
                        >
                          <summary className="cursor-pointer text-zinc-300 hover:text-white font-semibold">
                            {report.candidatesNoPhoto.length} student
                            {report.candidatesNoPhoto.length === 1 ? "" : "s"}{" "}
                            still missing a photo — nudge them to open{" "}
                            <code>/profile/edit</code>
                          </summary>
                          <ul className="mt-2 space-y-0.5 pl-3 max-h-64 overflow-y-auto">
                            {report.candidatesNoPhoto.map((c) => (
                              <li
                                key={c.email}
                                className="flex items-center gap-2 py-0.5"
                              >
                                <span className="flex-1 truncate">
                                  {c.name || c.email}
                                </span>
                                {c.section && (
                                  <span className="text-zinc-600 text-[10px] shrink-0">
                                    {c.section}
                                  </span>
                                )}
                                {c.linkedinUrl ? (
                                  <span
                                    className="text-[10px] shrink-0"
                                    style={{
                                      color: c.linkedinUrlValid
                                        ? "#60A5FA"
                                        : "#FBBF24",
                                    }}
                                    title={c.linkedinUrl}
                                  >
                                    {c.linkedinUrlValid
                                      ? "🔗 LinkedIn"
                                      : "⚠ bad URL"}
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-[11px] text-zinc-500 leading-relaxed flex-1 min-w-[200px]">
                          💡 Tip: students who sign in with Google get
                          their photo auto-filled the moment they open
                          the profile page. Password-session users need
                          to upload one manually.
                        </p>
                        <button
                          onClick={runReport}
                          disabled={loading}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-full disabled:opacity-50"
                          style={{
                            background: "rgba(59,130,246,0.12)",
                            color: "#93C5FD",
                            border: "1px solid rgba(59,130,246,0.2)",
                          }}
                        >
                          {loading ? "Refreshing…" : "↻ Refresh"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "warn" | "muted";
}) {
  const palette =
    tone === "info"
      ? { bg: "rgba(59,130,246,0.08)", fg: "#93C5FD", border: "rgba(59,130,246,0.22)" }
      : tone === "warn"
        ? { bg: "rgba(245,158,11,0.08)", fg: "#FCD34D", border: "rgba(245,158,11,0.22)" }
        : { bg: "rgba(255,255,255,0.03)", fg: "#A1A1AA", border: "rgba(255,255,255,0.06)" };
  return (
    <div
      className="rounded-lg p-2.5"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums" style={{ color: palette.fg }}>
        {value}
      </div>
    </div>
  );
}

// ─── Unlink stuck roll card ───────────────────────────────────
//
// Teacher-facing fix for the scenario where a student can't register
// because another account has already claimed their roll number.
// Teacher types the roll, we show the current owner(s), and one
// click detaches them so the real student can register.
//
// Typical flow (Apr 2026 — came up with student Bexzod, roll
// A85456325219):
//   1. Student sees "duplicate key" error on registration form.
//   2. Teacher opens /admin/tools → "Unlink stuck roll" card.
//   3. Types A85456325219 → clicks Search.
//   4. Card shows "Currently owned by: wrong-email@gmail.com
//      (name: FakeName, Section 2)".
//   5. Teacher clicks Unlink → confirms → row deleted.
//   6. Student retries registration with their own Google account.
//
// Safety model:
//   · Search is harmless (no DB writes). See the owner FIRST.
//   · Unlink button gated on the search having returned owners.
//   · The underlying delete leaves student_progress + sessions
//     intact, keyed on the old email — if the real owner ever
//     re-registers with that same wrong email + same roll, their
//     history reattaches (should be rare; stale rows aren't a
//     problem). Same guarantee the per-email unlink already has.
//   · Audit log records every unlink via `action: "unlink"` with
//     `details.via = "unlink-by-roll"` so the /admin/tools audit
//     viewer stays consistent.
function UnlinkByRollCard({ idToken }: { idToken: string | null }) {
  const [open, setOpen] = useState(false);
  const [roll, setRoll] = useState("");
  const [searching, setSearching] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<{
    enrollmentNo: string;
    owners: {
      email: string;
      name: string | null;
      batchId: string | null;
      section: string | null;
      addedAt: string | null;
    }[];
    message: string;
  } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchHeaders = useMemo(() => {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (idToken) h["x-id-token"] = idToken;
    return h;
  }, [idToken]);

  async function search() {
    const trimmed = roll.trim().toUpperCase();
    if (!trimmed) {
      setError("Type a roll number first.");
      return;
    }
    setSearching(true);
    setError(null);
    setLookup(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/students/unlink-by-roll", {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({ enrollmentNo: trimmed, dryRun: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `HTTP ${res.status}`);
      } else {
        setLookup({
          enrollmentNo: json.enrollmentNo,
          owners: json.owners || [],
          message: json.message,
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  }

  async function runUnlink() {
    if (!lookup || lookup.owners.length === 0) return;
    setUnlinking(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/students/unlink-by-roll", {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({ enrollmentNo: lookup.enrollmentNo }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `HTTP ${res.status}`);
      } else {
        setSuccess(
          json.message ||
            `Unlinked ${json.unlinkedCount || 0} account(s). The real student can register now.`
        );
        setLookup(null);
        setRoll("");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUnlinking(false);
    }
  }

  function reset() {
    setLookup(null);
    setSuccess(null);
    setError(null);
    setRoll("");
  }

  return (
    <div
      className="mb-6 rounded-2xl p-5 transition-colors"
      style={{
        background: "rgba(245,158,11,0.04)",
        border: "1px solid rgba(245,158,11,0.22)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: "rgba(245,158,11,0.14)", color: "#FCD34D" }}
          aria-hidden="true"
        >
          🔓
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="text-sm font-bold mb-0.5 text-amber-300">
                Unlink stuck roll
              </div>
              <p className="text-[12px] text-zinc-400 leading-relaxed">
                When a student sees &ldquo;duplicate key&rdquo; or
                &ldquo;roll already registered&rdquo; on the sign-up form,
                someone else has claimed their roll. Type the roll
                number → see who owns it → unlink → the real student
                registers cleanly. Audit-logged.
              </p>
            </div>
            <button
              onClick={() => {
                const next = !open;
                setOpen(next);
                if (!next) reset();
              }}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0"
              style={{
                background: open
                  ? "rgba(245,158,11,0.16)"
                  : "rgba(255,255,255,0.06)",
                color: open ? "#FCD34D" : "#D4D4D8",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {open ? "Close" : "Open"}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 pt-4 space-y-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Roll number input + search */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roll}
                      onChange={(e) => {
                        setRoll(e.target.value);
                        setLookup(null);
                        setSuccess(null);
                        setError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") search();
                      }}
                      placeholder="Roll number, e.g. A85456325219"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      disabled={searching || unlinking}
                      className="flex-1 px-3 py-2 text-sm rounded-lg text-white placeholder:text-zinc-600 focus:outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    />
                    <button
                      onClick={search}
                      disabled={searching || unlinking || !roll.trim()}
                      className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, #F59E0B, #D97706)",
                      }}
                    >
                      {searching ? "Searching…" : "🔎 Search"}
                    </button>
                  </div>

                  {error && (
                    <div
                      className="p-3 rounded-lg text-[12px] text-red-300"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.22)",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {success && (
                    <div
                      className="p-3 rounded-lg text-[12px] text-emerald-300"
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.22)",
                      }}
                    >
                      ✅ {success}
                    </div>
                  )}

                  {/* Lookup result */}
                  {lookup && (
                    <div
                      className="rounded-lg p-3"
                      style={{
                        background:
                          lookup.owners.length > 0
                            ? "rgba(245,158,11,0.06)"
                            : "rgba(34,197,94,0.06)",
                        border: `1px solid ${
                          lookup.owners.length > 0
                            ? "rgba(245,158,11,0.22)"
                            : "rgba(34,197,94,0.22)"
                        }`,
                      }}
                    >
                      <div
                        className={`text-[12px] ${lookup.owners.length > 0 ? "text-amber-300" : "text-emerald-300"}`}
                      >
                        {lookup.owners.length > 0 ? "⚠" : "✓"} {lookup.message}
                      </div>
                      {lookup.owners.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {lookup.owners.map((o) => (
                            <div
                              key={o.email}
                              className="text-[12px] p-2.5 rounded-lg"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              <div className="font-semibold text-zinc-100 truncate">
                                {o.name || "(no name)"}
                              </div>
                              <div className="text-zinc-400 text-[11px] truncate">
                                {o.email}
                              </div>
                              <div className="text-zinc-500 text-[11px] mt-0.5">
                                {o.section || "(no section)"} ·{" "}
                                {o.batchId || "(no batch)"}
                                {o.addedAt && ` · joined ${o.addedAt}`}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={runUnlink}
                            disabled={unlinking}
                            className="w-full py-2.5 text-sm font-bold rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                            style={{
                              background:
                                "linear-gradient(135deg, #EF4444, #B91C1C)",
                              boxShadow: "0 2px 12px rgba(239,68,68,0.3)",
                            }}
                          >
                            {unlinking
                              ? "Unlinking…"
                              : `🔓 Unlink ${lookup.owners.length === 1 ? "this account" : `these ${lookup.owners.length} accounts`}`}
                          </button>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">
                            Unlinking deletes the{" "}
                            <code className="text-zinc-400">students</code> row
                            for the account(s) above. Their progress
                            (completions, quiz scores) stays in the DB and
                            auto-reattaches if they ever re-register with
                            the same email + same roll. The roll becomes
                            free immediately — the real student can
                            register right after this.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


// ─── Roll lookup card ───────────────────────────────────────────
//
// Read-only diagnostic. Calls /api/admin/rolls/lookup which searches
// BOTH roll_list (the roster) and students (registered accounts) so
// one search answers "where is this roll/student, if anywhere."
//
// Two query modes, one input: if the input looks like a roll number
// (starts with a letter + digits), sends it as `enrollmentNo`;
// otherwise as `name` (partial, case-insensitive).

interface LookupRollListMatch {
  batchId: string;
  section: string;
  enrollmentNo: string;
  name: string | null;
}
interface LookupStudentMatch {
  email: string;
  name: string | null;
  batchId: string | null;
  section: string | null;
  enrollmentNo: string;
  addedAt: string | null;
}
interface LookupResponse {
  query: { enrollmentNo: string | null; name: string | null };
  rollListMatches: LookupRollListMatch[];
  studentsMatches: LookupStudentMatch[];
  summary: string;
}

function looksLikeRoll(s: string): boolean {
  // Heuristic: amity rolls look like A85456325219 — 1 letter + many digits.
  // Anything with a digit proportion > 60% is treated as a roll.
  const trimmed = s.trim();
  if (trimmed.length < 4) return false;
  const digits = (trimmed.match(/\d/g) || []).length;
  return digits / trimmed.length > 0.6;
}

function RollLookupCard({ idToken }: { idToken: string | null }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResponse | null>(null);

  const fetchHeaders = useMemo(() => {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (idToken) h["x-id-token"] = idToken;
    return h;
  }, [idToken]);

  async function run() {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Type a roll number or a name first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const sp = new URLSearchParams();
      if (looksLikeRoll(trimmed)) {
        sp.set("enrollmentNo", trimmed.toUpperCase());
      } else {
        sp.set("name", trimmed);
      }
      const res = await fetch(`/api/admin/rolls/lookup?${sp.toString()}`, {
        headers: fetchHeaders,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `HTTP ${res.status}`);
      } else {
        setResult(json as LookupResponse);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setQuery("");
  }

  return (
    <div
      className="mb-6 rounded-2xl p-5 transition-colors"
      style={{
        background: "rgba(99,102,241,0.04)",
        border: "1px solid rgba(99,102,241,0.22)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: "rgba(99,102,241,0.14)", color: "#A5B4FC" }}
          aria-hidden="true"
        >
          🔎
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="text-sm font-bold mb-0.5 text-indigo-300">
                Look up a roll or name
              </div>
              <p className="text-[12px] text-zinc-400 leading-relaxed">
                Search by roll number OR by name. Shows where the roll
                sits in the roster and whether they&apos;ve registered
                yet. Read-only — not logged.
              </p>
            </div>
            <button
              onClick={() => {
                const next = !open;
                setOpen(next);
                if (!next) reset();
              }}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0"
              style={{
                background: open
                  ? "rgba(99,102,241,0.16)"
                  : "rgba(255,255,255,0.06)",
                color: open ? "#A5B4FC" : "#D4D4D8",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {open ? "Close" : "Open"}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 pt-4 space-y-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setResult(null);
                        setError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") run();
                      }}
                      placeholder="Roll (A85…) or name (komron)"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      disabled={loading}
                      className="flex-1 px-3 py-2 text-sm rounded-lg text-white placeholder:text-zinc-600 focus:outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    />
                    <button
                      onClick={run}
                      disabled={loading || !query.trim()}
                      className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, #6366F1, #4F46E5)",
                      }}
                    >
                      {loading ? "Searching…" : "🔎 Search"}
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500">
                    Tip: if input looks numeric it&apos;s treated as a roll,
                    otherwise as a partial name match.
                  </p>

                  {error && (
                    <div
                      className="p-3 rounded-lg text-[12px] text-red-300"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.22)",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {result && (
                    <div className="space-y-3">
                      <div
                        className="rounded-lg p-3 text-[12px] text-indigo-200"
                        style={{
                          background: "rgba(99,102,241,0.06)",
                          border: "1px solid rgba(99,102,241,0.22)",
                        }}
                      >
                        {result.summary}
                      </div>

                      {/* Roll list matches */}
                      <div>
                        <div className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                          On the roll list ({result.rollListMatches.length})
                        </div>
                        {result.rollListMatches.length === 0 ? (
                          <div className="text-[11px] text-zinc-500 italic p-2">
                            No matches in roll_list.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {result.rollListMatches.map((r) => (
                              <div
                                key={`${r.batchId}-${r.section}-${r.enrollmentNo}`}
                                className="text-[12px] p-2.5 rounded-lg"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                }}
                              >
                                <div className="font-semibold text-zinc-100 truncate">
                                  {r.name || "(no name)"}
                                </div>
                                <div
                                  className="text-zinc-400 text-[11px]"
                                  style={{
                                    fontFamily:
                                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                                  }}
                                >
                                  {r.enrollmentNo}
                                </div>
                                <div className="text-zinc-500 text-[11px] mt-0.5">
                                  {r.section} · {r.batchId}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Students (registered) matches */}
                      <div>
                        <div className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                          Registered accounts ({result.studentsMatches.length})
                        </div>
                        {result.studentsMatches.length === 0 ? (
                          <div className="text-[11px] text-zinc-500 italic p-2">
                            No registered accounts match.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {result.studentsMatches.map((s) => (
                              <div
                                key={s.email}
                                className="text-[12px] p-2.5 rounded-lg"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                }}
                              >
                                <div className="font-semibold text-zinc-100 truncate">
                                  {s.name || "(no name)"}
                                </div>
                                <div className="text-zinc-400 text-[11px] truncate">
                                  {s.email}
                                </div>
                                <div
                                  className="text-zinc-400 text-[11px]"
                                  style={{
                                    fontFamily:
                                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                                  }}
                                >
                                  {s.enrollmentNo}
                                </div>
                                <div className="text-zinc-500 text-[11px] mt-0.5">
                                  {s.section || "(no section)"} ·{" "}
                                  {s.batchId || "(no batch)"}
                                  {s.addedAt && ` · joined ${s.addedAt}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
