import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { MODULES } from "@/lib/modules";

// Derived from the single registry source. Replaces the previous
// hard-coded [1,2,3,4,5] check.
const MODULE_IDS = MODULES.map((m) => m.id);

// POST /api/admin/broadcast
// Body: {
//   message: string,                 // 1..240 chars
//   moduleNumber?: number | null,    // optional deep-link target
//   topicId?: number | null,         // requires moduleNumber
//   ttlMinutes?: number,             // default 30, max 240
//   targetBatchId?: string | null,   // optional audience filter
//   targetSection?: string | null,   // optional audience filter (requires targetBatchId)
// }
//
// Audience targeting: when targetBatchId is set the broadcast is
// only shown to students whose batchId matches; targetSection
// narrows further to a specific section of that batch. Both null =
// send to everyone (default, preserves the one-click path). Filtering
// happens in the student's browser (the /latest endpoint returns the
// target fields and the banner checks against the logged-in
// student's own batch/section). This keeps /latest CDN-cacheable —
// see the comment there for the architecture rationale.
//
// Fires a short attention-grabbing banner to every signed-in student.
// Storage: one row in admin_actions with action='broadcast' and a
// details JSONB payload. Students poll /api/broadcasts/latest every
// ~15s and show the most recent non-expired broadcast that hasn't
// been dismissed in their localStorage.
//
// Why not a dedicated table: admin_actions already has timestamps +
// RLS + cohort metadata. Adding a broadcasts table just to store a
// message string would duplicate the audit machinery and complicate
// Phase 6 data-export. One table, one list, one audit trail.
//
// Auto-expiry: details.expiresAt is an ISO string. Students drop any
// broadcast whose expiresAt has passed, so a teacher who forgets to
// cancel a class-start broadcast doesn't leave the banner stuck on
// every student's screen all afternoon. Default 30 minutes; teacher
// can pass any value up to 4 hours.
//
// DELETE /api/admin/broadcast?id=N — cancel a live broadcast early.

// Max length picked to fit two lines on a 375px phone without
// overwhelming the class-open UI.
const MAX_MESSAGE_LEN = 240;
const DEFAULT_TTL_MIN = 30;
const MAX_TTL_MIN = 240;

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json().catch(() => ({}));

  // Validate message
  const rawMessage =
    typeof body.message === "string" ? body.message.trim() : "";
  if (!rawMessage) {
    return Response.json(
      { error: "message is required (what do you want to tell the class?)" },
      { status: 400 }
    );
  }
  if (rawMessage.length > MAX_MESSAGE_LEN) {
    return Response.json(
      {
        error: `message is too long (${rawMessage.length}/${MAX_MESSAGE_LEN} characters). Keep it short so students can read it on a phone.`,
      },
      { status: 400 }
    );
  }

  // Validate optional module+topic deep link.
  const rawMod = body.moduleNumber;
  const moduleNumber =
    typeof rawMod === "number" &&
    Number.isFinite(rawMod) &&
    MODULE_IDS.includes(rawMod)
      ? Math.floor(rawMod)
      : null;
  const rawTopic = body.topicId;
  const topicId =
    typeof rawTopic === "number" &&
    Number.isFinite(rawTopic) &&
    rawTopic > 0 &&
    moduleNumber != null
      ? Math.floor(rawTopic)
      : null;
  if (rawTopic != null && moduleNumber == null) {
    return Response.json(
      {
        error:
          "topicId requires moduleNumber — pick a module first, then a topic inside it.",
      },
      { status: 400 }
    );
  }

  // Validate TTL.
  const rawTtl = body.ttlMinutes;
  const ttlMinutes =
    typeof rawTtl === "number" && Number.isFinite(rawTtl) && rawTtl > 0
      ? Math.min(Math.floor(rawTtl), MAX_TTL_MIN)
      : DEFAULT_TTL_MIN;

  // Audience filters. Both optional — null means "everyone".
  // Light validation: trim strings, reject suspiciously long ones
  // (a batch id like "2025-2026" is ~10 chars; 64 is ample headroom
  // and stops malformed payloads from polluting details JSON).
  const rawTargetBatch = body.targetBatchId;
  const targetBatchId =
    typeof rawTargetBatch === "string" && rawTargetBatch.trim()
      ? rawTargetBatch.trim().slice(0, 64)
      : null;
  const rawTargetSection = body.targetSection;
  const targetSectionRaw =
    typeof rawTargetSection === "string" && rawTargetSection.trim()
      ? rawTargetSection.trim().slice(0, 64)
      : null;
  // A section without a batch doesn't make sense (Section 3 of which
  // batch?). Drop it rather than 400ing — safer default, still logged.
  const targetSection = targetBatchId ? targetSectionRaw : null;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60_000);

  // Write via the admin_actions table. Returned `id` is the handle
  // the teacher uses to cancel this broadcast later.
  const actionId = await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "broadcast",
    subjectEmail: null,
    details: {
      message: rawMessage,
      moduleNumber,
      topicId,
      ttlMinutes,
      targetBatchId,
      targetSection,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      cancelledAt: null,
    },
  });

  if (!actionId) {
    // Most likely cause: admin_actions migration not applied.
    // Teacher can't broadcast without it. Surface a clear error.
    return Response.json(
      {
        error:
          "Couldn't save the broadcast. The admin_actions table may be missing — run scripts/migration-add-admin-actions.sql.",
      },
      { status: 503 }
    );
  }

  // Bust the student-side poll endpoint's cache so the broadcast
  // appears within the next poll tick (~15s) even if the CDN had a
  // stale 'no broadcast' response cached.
  try {
    revalidatePath("/api/broadcasts/latest");
    revalidatePath("/api/broadcasts/active");
  } catch {}

  return Response.json({
    ok: true,
    id: actionId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    moduleNumber,
    topicId,
    targetBatchId,
    targetSection,
    message: rawMessage,
  });
}

// DELETE /api/admin/broadcast?id=N
// Cancel an active broadcast before it auto-expires. Sets
// details.cancelledAt on the existing admin_actions row rather than
// deleting — keeps the audit trail intact.
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const idParam = req.nextUrl.searchParams.get("id");
  const id = idParam ? parseInt(idParam, 10) : NaN;
  if (!Number.isFinite(id)) {
    return Response.json(
      { error: "?id=<broadcast id> is required" },
      { status: 400 }
    );
  }

  // Read current details, merge cancelledAt, write back. Safer than
  // a raw jsonb_set because it preserves every other field.
  const { data: row, error: readErr } = await supabase
    .from("admin_actions")
    .select("id, action, details")
    .eq("id", id)
    .maybeSingle();
  if (readErr) {
    return Response.json({ error: readErr.message }, { status: 500 });
  }
  if (!row) {
    return Response.json({ error: "Broadcast not found" }, { status: 404 });
  }
  if ((row as { action: string }).action !== "broadcast") {
    return Response.json(
      { error: "That id isn't a broadcast." },
      { status: 400 }
    );
  }

  const prevDetails =
    (row as { details: Record<string, unknown> | null }).details ?? {};
  const nextDetails = {
    ...prevDetails,
    cancelledAt: new Date().toISOString(),
  };

  const { error: writeErr } = await supabase
    .from("admin_actions")
    .update({ details: nextDetails })
    .eq("id", id);
  if (writeErr) {
    return Response.json({ error: writeErr.message }, { status: 500 });
  }

  // Log the cancellation as its own audit row so the audit viewer
  // shows the action clearly.
  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "broadcast_cancel",
    subjectEmail: null,
    details: { broadcastId: id },
  });

  try {
    revalidatePath("/api/broadcasts/latest");
    revalidatePath("/api/broadcasts/active");
  } catch {}

  return Response.json({ ok: true, cancelledAt: nextDetails.cancelledAt });
}
