import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { isHiddenSection } from "@/lib/hidden-sections";
import type { BloomLevel } from "@/lib/blooms";

// GET /api/admin/export/session.csv?batchId=X&section=Y&date=YYYY-MM-DD
//
// One row per (student, topic) that was answered or completed on the
// given date (in Tashkent local time — that's the class's wall clock,
// not UTC). Date defaults to "today in Tashkent" when omitted.
//
// Response is a full CSV payload (not streamed chunks) — the dataset
// is bounded at ~250 students × ~50 topics = 12.5k rows, which sits
// comfortably in a single Response body. Streaming would add
// complexity for no real win.
//
// Topic titles come from the `topics` table (DB-backed CMS) joined via
// (course slug + module number + topic number). If the topics row is
// missing (pre-migration / content not seeded), the CSV still ships
// the numeric topic id so nothing disappears — the title column just
// reads "Topic N".
//
// Hidden-section students are excluded by default; pass
// ?includeHidden=true to bypass that filter (useful for auditing test
// accounts).

// ─── CSV helpers ────────────────────────────────────────────────

/**
 * Escape a single cell value for CSV. Wraps in double quotes if the
 * value contains a comma, double-quote, or newline; doubles embedded
 * quotes per RFC 4180. Numbers and nulls are stringified safely.
 */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.length === 0) return "";
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}

/**
 * Convert an ISO timestamp to a Tashkent-local YYYY-MM-DD string.
 * `en-CA` produces `YYYY-MM-DD` reliably regardless of server locale.
 */
function tashkentDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toLocaleDateString("en-CA", {
    timeZone: "Asia/Tashkent",
  });
}

function todayTashkent(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Tashkent",
  });
}

// ─── Types ──────────────────────────────────────────────────────

interface StudentRow {
  email: string;
  name: string | null;
  section: string | null;
  batch_id: string | null;
  enrollment_no: string | null;
}

interface ProgressRow {
  student_email: string | null;
  module_number: number;
  topic_id: number;
  completed: boolean;
  mcq_score: number | null;
  mcq_total: number | null;
  updated_at: string | null;
  bloom_stats: Partial<
    Record<BloomLevel, { correct: number; total: number }>
  > | null;
  confidence_stats: {
    rated?: number;
    confidentWrong?: number;
    humbleRight?: number;
  } | null;
}

interface TopicTitleRow {
  number: number;
  title: string | null;
  module: {
    number: number;
    course: { slug: string } | null;
  } | null;
}

const BLOOM_LEVELS: BloomLevel[] = [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
];

// ─── Route ──────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const url = new URL(req.url);
  const batchIdParam = url.searchParams.get("batchId")?.trim() || null;
  const sectionParam = url.searchParams.get("section")?.trim() || null;
  const dateParam = url.searchParams.get("date")?.trim() || null;
  const includeHidden = url.searchParams.get("includeHidden") === "true";

  // Validate + normalise date (YYYY-MM-DD). Anything else → today.
  const date =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : todayTashkent();

  // ─── Fetch students, progress, topics in parallel ─────────────
  const [studentsRes, progressRes, topicsRes] = await Promise.all([
    supabase
      .from("students")
      .select("email, name, section, batch_id, enrollment_no"),
    supabase
      .from("student_progress")
      .select(
        "student_email, module_number, topic_id, completed, mcq_score, mcq_total, updated_at, bloom_stats, confidence_stats"
      ),
    // Best-effort topic-title lookup. If the join fails (old schema)
    // we fall back to "Topic N" server-side — CSV still ships.
    supabase
      .from("topics")
      .select(
        `number, title,
         module:modules!inner(number,
           course:courses!inner(slug))`
      ),
  ]);

  // Filter students to the requested batch/section and visibility.
  let students = (studentsRes.data || []) as StudentRow[];
  students = students.filter((s) => {
    if (!s.email) return false;
    if (!includeHidden && isHiddenSection(s.section)) return false;
    if (batchIdParam && s.batch_id !== batchIdParam) return false;
    if (sectionParam && s.section !== sectionParam) return false;
    return true;
  });
  const studentByEmail = new Map<string, StudentRow>();
  for (const s of students) {
    studentByEmail.set(s.email, s);
  }

  // Build (module, topicNumber) → title map keyed off the ICT course.
  // The `topic_id` column on student_progress is the same number as
  // the topic's `number` within its module, so a 2D lookup suffices.
  const topicTitleByKey = new Map<string, string>();
  for (const row of (topicsRes.data || []) as unknown as TopicTitleRow[]) {
    const mod = row.module;
    const course = mod?.course;
    if (!mod || !course) continue;
    if (course.slug !== "ict") continue;
    const key = `${mod.number}__${row.number}`;
    if (row.title) topicTitleByKey.set(key, row.title);
  }

  // ─── Filter progress rows to the requested Tashkent-local date ─
  const progressRows = (progressRes.data || []) as ProgressRow[];
  const sessionRows = progressRows.filter((p) => {
    if (!p.student_email) return false;
    if (!studentByEmail.has(p.student_email)) return false;
    const d = tashkentDate(p.updated_at);
    if (d !== date) return false;
    // Only rows that represent "activity today" — either completed
    // today or had an MCQ attempt. Skips placeholder rows that got a
    // bump via some background job but had no real student action.
    if (p.completed) return true;
    if ((p.mcq_total || 0) > 0) return true;
    return false;
  });

  // ─── Build CSV ────────────────────────────────────────────────
  const header = [
    "date",
    "section",
    "roll_number",
    "student_name",
    "email",
    "module",
    "topic",
    "completed",
    "mcq_score",
    "mcq_total",
    "bloom_remember_pct",
    "bloom_understand_pct",
    "bloom_apply_pct",
    "bloom_analyze_pct",
    "bloom_evaluate_pct",
    "bloom_create_pct",
    "confidence_confident_wrong",
    "confidence_humble_right",
  ];

  const lines: string[] = [csvRow(header)];

  // Stable ordering: section, then roll, then module, then topic.
  sessionRows.sort((a, b) => {
    const sa = studentByEmail.get(a.student_email!)!;
    const sb = studentByEmail.get(b.student_email!)!;
    const sectA = sa.section || "";
    const sectB = sb.section || "";
    if (sectA !== sectB) return sectA.localeCompare(sectB);
    const rollA = sa.enrollment_no || "";
    const rollB = sb.enrollment_no || "";
    if (rollA !== rollB) return rollA.localeCompare(rollB);
    if (a.module_number !== b.module_number)
      return a.module_number - b.module_number;
    return a.topic_id - b.topic_id;
  });

  for (const p of sessionRows) {
    const s = studentByEmail.get(p.student_email!)!;
    const topicTitle =
      topicTitleByKey.get(`${p.module_number}__${p.topic_id}`) ||
      `Topic ${p.topic_id}`;

    // Bloom per-level pct: correct/total × 100, rounded. Blank when
    // the level wasn't attempted on this topic.
    const bloomPcts = BLOOM_LEVELS.map((lvl) => {
      const b = p.bloom_stats?.[lvl];
      if (!b || !b.total) return "";
      return String(Math.round((b.correct / b.total) * 100));
    });

    lines.push(
      csvRow([
        date,
        s.section || "",
        s.enrollment_no || "",
        s.name || "",
        s.email,
        `M${p.module_number}`,
        topicTitle,
        p.completed ? "yes" : "no",
        p.mcq_score ?? "",
        p.mcq_total ?? "",
        ...bloomPcts,
        p.confidence_stats?.confidentWrong ?? "",
        p.confidence_stats?.humbleRight ?? "",
      ])
    );
  }

  const csv = lines.join("\r\n") + "\r\n";

  // Audit trail — record that this export ran (no PII beyond filters).
  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "export_session_csv",
    subjectBatchId: batchIdParam,
    subjectSection: sectionParam,
    details: {
      date,
      batchId: batchIdParam,
      section: sectionParam,
      rowCount: sessionRows.length,
      includeHidden,
    },
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ifp105-session-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
