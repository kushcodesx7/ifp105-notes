import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { MODULE_TOTALS, TOTAL_TOPICS } from "@/lib/course-registry";
import { moduleWeightedPct } from "@/lib/modules";
import { requireAdmin } from "@/lib/verify-google-token";
import { isHiddenSection } from "@/lib/hidden-sections";
import { compareSections } from "@/lib/sections";

// GET /api/progress/batches
// GET /api/progress/batches?batchId=2025-2026  (drill into one batch)
// Auth: either an admin Google ID token OR the legacy admin password.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(req.url);
  const batchIdFilter = searchParams.get("batchId");

  // Scope the heavy tables to the drilldown batch when possible so we don't
  // fetch every batch's data every time. `batches` stays unscoped so the
  // summary view still works; on drilldown we still need batches[] to find
  // the one batch object, so we fetch it too (tiny table).
  const rollQuery = supabase
    .from("roll_list")
    .select("batch_id, section, enrollment_no");
  if (batchIdFilter) rollQuery.eq("batch_id", batchIdFilter);

  const studentsQuery = supabase
    .from("students")
    .select("batch_id, section, enrollment_no, name, email, linkedin_url, added_at");
  if (batchIdFilter) studentsQuery.eq("batch_id", batchIdFilter);

  const progressQuery = supabase
    .from("student_progress")
    .select(
      "student_email, student_name, enrollment_no, batch_id, module_number, topic_id, completed, mcq_score, mcq_total, challenge_attempted, updated_at"
    );
  if (batchIdFilter) progressQuery.eq("batch_id", batchIdFilter);

  // Run all 5 queries in parallel — biggest single perf win on this endpoint.
  const [batchesRes, rollListRes, registeredRes, progressRes, sessionsRes] =
    await Promise.all([
      supabase
        .from("batches")
        .select("id, name, accent, created_at")
        .order("created_at", { ascending: false }),
      rollQuery,
      studentsQuery,
      progressQuery,
      supabase.from("student_sessions").select("student_email, last_active_at"),
    ]);

  const batches = batchesRes.data;
  const rollList = rollListRes.data;
  const registeredStudents = registeredRes.data;
  const progressRows = progressRes.data;
  const sessions = sessionsRes.data;

  const sessionMap: Record<string, string> = {};
  for (const s of sessions || []) {
    if (s.student_email) sessionMap[s.student_email] = s.last_active_at;
  }

  // Build email → student metadata map (from registered students)
  interface RegisteredStudent {
    batchId: string;
    section: string;
    enrollmentNo: string;
    name: string;
    email: string;
    linkedinUrl: string | null;
    addedAt: string;
  }
  const studentMeta: Record<string, RegisteredStudent> = {};
  for (const s of registeredStudents || []) {
    if (s.email) {
      studentMeta[s.email] = {
        batchId: s.batch_id || "",
        section: (s as { section?: string | null }).section || "Section 1",
        enrollmentNo: s.enrollment_no || "",
        name: s.name || "",
        email: s.email,
        linkedinUrl: s.linkedin_url,
        addedAt: s.added_at,
      };
    }
  }

  // Build email → progress aggregation
  interface TopicEntry {
    moduleNumber: number;
    topicId: number;
    completed: boolean;
    mcqScore: number | null;
    mcqTotal: number | null;
    challengeAttempted: boolean;
    updatedAt: string;
  }
  interface StudentAggregate {
    name: string;
    email: string;
    enrollmentNo: string;
    batchId: string;
    linkedinUrl: string | null;
    registered: boolean;
    topics: Record<string, TopicEntry>;
    lastActive: string | null;
  }

  const studentAgg: Record<string, StudentAggregate> = {};

  // First, add all registered students (even if they have no progress yet)
  for (const s of registeredStudents || []) {
    if (!s.email) continue;
    studentAgg[s.email] = {
      name: s.name || "Unknown",
      email: s.email,
      enrollmentNo: s.enrollment_no || "",
      batchId: s.batch_id || "",
      linkedinUrl: s.linkedin_url,
      registered: true,
      topics: {},
      lastActive: sessionMap[s.email] || null,
    };
  }

  // Then add/merge progress data
  for (const row of progressRows || []) {
    const email = row.student_email;
    if (!email) continue;

    if (!studentAgg[email]) {
      // Progress exists but no registered student entry — signed-in but not registered
      studentAgg[email] = {
        name: row.student_name || "Unknown",
        email,
        enrollmentNo: "",
        batchId: "",
        linkedinUrl: null,
        registered: false,
        topics: {},
        lastActive: sessionMap[email] || null,
      };
    }

    // Use meta if available (registered students have better data)
    const meta = studentMeta[email];
    if (meta) {
      studentAgg[email].batchId = meta.batchId;
      studentAgg[email].enrollmentNo = meta.enrollmentNo;
      if (meta.name) studentAgg[email].name = meta.name;
    }

    const key = `${row.module_number}-${row.topic_id}`;
    studentAgg[email].topics[key] = {
      moduleNumber: row.module_number,
      topicId: row.topic_id,
      completed: row.completed,
      mcqScore: row.mcq_score,
      mcqTotal: row.mcq_total,
      challengeAttempted: row.challenge_attempted,
      updatedAt: row.updated_at,
    };
  }

  // Compute per-student stats
  function studentStats(s: StudentAggregate) {
    const topicEntries = Object.values(s.topics);
    const completedCount = topicEntries.filter((t) => t.completed).length;
    const moduleStats: Record<number, { done: number; total: number; pct: number }> = {};
    for (const mn of [1, 2, 3, 4, 5]) {
      const mt = topicEntries.filter((t) => t.moduleNumber === mn);
      const done = mt.filter((t) => t.completed).length;
      const total = MODULE_TOTALS[mn];
      moduleStats[mn] = {
        done,
        total,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    }
    const mcqEntries = topicEntries.filter(
      (t) => t.mcqScore !== null && t.mcqTotal !== null
    );
    const avgMcqScore =
      mcqEntries.length > 0
        ? mcqEntries.reduce(
            (sum, t) => sum + (t.mcqScore! / t.mcqTotal!) * 100,
            0
          ) / mcqEntries.length
        : null;
    // Module-weighted pct — same formula as every other endpoint so
    // the batch-progress page matches what students see on /connect.
    const modDoneMap: Record<number, number> = {};
    for (const mn of [1, 2, 3, 4, 5]) modDoneMap[mn] = moduleStats[mn].done;
    return {
      completedCount,
      totalTopics: TOTAL_TOPICS,
      completionPct: moduleWeightedPct(modDoneMap),
      moduleStats,
      avgMcqScore: avgMcqScore !== null ? Math.round(avgMcqScore) : null,
    };
  }

  // Count roll list per batch, and also per-section within each batch. Hidden
  // sections ("Test Section" etc) are excluded from the student-facing roll
  // count so the admin dashboard shows the real headcount (218, not 221 with
  // 3 testing rolls). Per-section breakdown powers the new batch card UI.
  const rollCountByBatch: Record<string, number> = {};
  const rollsBySectionPerBatch: Record<string, Record<string, number>> = {};
  for (const r of rollList || []) {
    if (!r.batch_id) continue;
    const section = (r as { section?: string | null }).section || "Section 1";
    if (isHiddenSection(section)) continue; // don't inflate with test rolls
    rollCountByBatch[r.batch_id] = (rollCountByBatch[r.batch_id] || 0) + 1;
    if (!rollsBySectionPerBatch[r.batch_id]) rollsBySectionPerBatch[r.batch_id] = {};
    rollsBySectionPerBatch[r.batch_id][section] =
      (rollsBySectionPerBatch[r.batch_id][section] || 0) + 1;
  }

  // ─── If drilling into a specific batch ───
  if (batchIdFilter) {
    const batch = batches?.find((b) => b.id === batchIdFilter);
    if (!batch) {
      return Response.json({ error: "Batch not found" }, { status: 404 });
    }

    // Get roll list for this batch
    const batchRolls = (rollList || []).filter((r) => r.batch_id === batchIdFilter);
    const registeredInBatch = (registeredStudents || []).filter(
      (s) => s.batch_id === batchIdFilter
    );

    // Build a map of enrollment_no+section → student status (same roll can exist in multiple sections)
    const rollStatus = batchRolls.map((r) => {
      const rollSection = (r as { section?: string }).section || "";
      const registered = registeredInBatch.find(
        (s) =>
          s.enrollment_no === r.enrollment_no &&
          (s as { section?: string }).section === rollSection
      );

      if (!registered) {
        return {
          enrollmentNo: r.enrollment_no,
          section: rollSection,
          registered: false,
          name: null,
          email: null,
          linkedinUrl: null,
          completionPct: 0,
          completedCount: 0,
          moduleStats: {},
          avgMcqScore: null,
          lastActive: null,
        };
      }

      const agg = studentAgg[registered.email];
      const stats = agg ? studentStats(agg) : null;

      return {
        enrollmentNo: r.enrollment_no,
        section: rollSection,
        registered: true,
        name: registered.name,
        email: registered.email,
        linkedinUrl: registered.linkedin_url,
        completionPct: stats?.completionPct ?? 0,
        completedCount: stats?.completedCount ?? 0,
        moduleStats: stats?.moduleStats ?? {},
        avgMcqScore: stats?.avgMcqScore ?? null,
        lastActive: agg?.lastActive ?? null,
      };
    });

    return Response.json(
      {
        batch: {
          id: batch.id,
          name: batch.name,
          accent: batch.accent,
          totalRolls: batchRolls.length,
          registered: registeredInBatch.length,
          notRegistered: batchRolls.length - registeredInBatch.length,
        },
        students: rollStatus,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
        },
      }
    );
  }

  // ─── Otherwise: summary per batch ───
  const batchSummaries = (batches || []).map((batch) => {
    const batchStudents = Object.values(studentAgg).filter(
      (s) => s.batchId === batch.id
    );
    const statsArray = batchStudents.map(studentStats);

    const avgCompletion =
      statsArray.length > 0
        ? Math.round(
            statsArray.reduce((sum, s) => sum + s.completionPct, 0) / statsArray.length
          )
        : 0;

    const withMcq = statsArray.filter((s) => s.avgMcqScore !== null);
    const avgMcq =
      withMcq.length > 0
        ? Math.round(
            withMcq.reduce((sum, s) => sum + (s.avgMcqScore ?? 0), 0) / withMcq.length
          )
        : 0;

    const activeThisWeek = batchStudents.filter((s) => {
      if (!s.lastActive) return false;
      const daysSince = (Date.now() - new Date(s.lastActive).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince < 7;
    }).length;

    const totalRolls = rollCountByBatch[batch.id] || 0;

    // Per-section breakdown: for each section in this batch, how many rolls
    // were uploaded vs how many students finished registration. Useful for
    // spotting "Section 4 still has 10 pending" at a glance.
    const sectionRolls = rollsBySectionPerBatch[batch.id] || {};
    const registeredBySection: Record<string, number> = {};
    for (const s of batchStudents) {
      // studentAgg stores section on the student from the students table;
      // infer via the email map if available, else skip.
      const section = studentMeta[s.email]?.section || "Section 1";
      if (isHiddenSection(section)) continue;
      registeredBySection[section] = (registeredBySection[section] || 0) + 1;
    }
    const allSectionNames = new Set<string>([
      ...Object.keys(sectionRolls),
      ...Object.keys(registeredBySection),
    ]);
    const sections = Array.from(allSectionNames)
      .sort(compareSections)
      .map((name) => {
        const sectionRollCount = sectionRolls[name] || 0;
        const sectionRegistered = registeredBySection[name] || 0;
        return {
          name,
          totalRolls: sectionRollCount,
          registered: sectionRegistered,
          pending: Math.max(0, sectionRollCount - sectionRegistered),
        };
      });

    return {
      id: batch.id,
      name: batch.name,
      accent: batch.accent,
      totalRolls,
      registered: batchStudents.length,
      notRegistered: Math.max(0, totalRolls - batchStudents.length),
      activeThisWeek,
      avgCompletion,
      avgMcq,
      sections,
    };
  });

  // "Orphan" students = signed in and made progress but never finished
  // registration (no batch_id). Return their identity so the teacher can
  // message them directly from the dashboard instead of guessing who to nudge.
  const orphanStudents = Object.values(studentAgg)
    .filter((s) => !s.batchId)
    .map((s) => ({
      name: s.name,
      email: s.email,
      lastActive: s.lastActive,
    }));

  return Response.json(
    {
      batches: batchSummaries,
      orphanStudents: orphanStudents.length,
      orphanStudentList: orphanStudents,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
      },
    }
  );
}
