import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// POST /api/admin/trash/restore
// Body: { kind: "topic" | "question", id: string }
//
// Flips deleted_at → NULL on the targeted row. No confirm dialog on
// the client — restore is always recoverable (just re-delete) so the
// friction isn't worth it. When restoring a topic, all of its
// questions that were cascaded-deleted by the original soft-delete
// are ALSO restored, so the teacher doesn't have to click through
// each question individually. Questions that were manually trashed
// separately stay in the bin.

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  const kind = body.kind;
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return Response.json({ error: "id required" }, { status: 400 });
  }

  if (kind === "topic") {
    // Find when the topic was deleted so we can match cascade-deleted
    // questions by that exact timestamp (±1 second — they were set in
    // the same `Date.now()` tick during the topic DELETE handler).
    const { data: topicRow, error: tReadErr } = await supabase
      .from("topics")
      .select("deleted_at")
      .eq("id", id)
      .maybeSingle();
    if (tReadErr) {
      return Response.json({ error: tReadErr.message }, { status: 500 });
    }
    const deletedAt = (topicRow as { deleted_at: string | null } | null)?.deleted_at;

    const { error: tErr } = await supabase
      .from("topics")
      .update({ deleted_at: null })
      .eq("id", id);
    if (tErr) return Response.json({ error: tErr.message }, { status: 500 });

    let restoredQuestions = 0;
    if (deletedAt) {
      // Restore questions that were cascaded-deleted at the same
      // moment as the topic. Match on a 1-second window to tolerate
      // clock drift between the `now()` defaults.
      const windowStart = new Date(new Date(deletedAt).getTime() - 1000).toISOString();
      const windowEnd = new Date(new Date(deletedAt).getTime() + 1000).toISOString();
      const { data: restored } = await supabase
        .from("questions")
        .update({ deleted_at: null })
        .eq("topic_id", id)
        .gte("deleted_at", windowStart)
        .lte("deleted_at", windowEnd)
        .select("id");
      restoredQuestions = (restored as unknown[] | null)?.length ?? 0;
    }

    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "restore_topic",
      subjectEmail: null,
      details: { topicId: id, restoredQuestions },
    });
    return Response.json({ ok: true, restoredQuestions });
  }

  if (kind === "question") {
    const { error } = await supabase
      .from("questions")
      .update({ deleted_at: null })
      .eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "restore_question",
      subjectEmail: null,
      details: { questionId: id },
    });
    return Response.json({ ok: true });
  }

  // Flashcard restore: id is `topicId:flashcardIdx`. Read the topic's
  // current flashcards_json, clear deletedAt on the targeted card, and
  // write the array back. Index-based addressing is fine because
  // saves are linearised by the editor and the trash list shows the
  // current snapshot.
  if (kind === "flashcard") {
    const [topicId, idxStr] = id.split(":");
    const idx = parseInt(idxStr, 10);
    if (!topicId || Number.isNaN(idx)) {
      return Response.json(
        { error: "id must be in 'topicId:flashcardIndex' form" },
        { status: 400 }
      );
    }
    const { data: row, error: readErr } = await supabase
      .from("topics")
      .select("flashcards_json")
      .eq("id", topicId)
      .maybeSingle();
    if (readErr) return Response.json({ error: readErr.message }, { status: 500 });
    if (!row) return Response.json({ error: "Topic not found" }, { status: 404 });
    const arr = (row as { flashcards_json: unknown }).flashcards_json;
    if (!Array.isArray(arr) || idx < 0 || idx >= arr.length) {
      return Response.json(
        { error: "Flashcard slot not found" },
        { status: 404 }
      );
    }
    const next = arr.map((c, i) => {
      if (i !== idx || !c || typeof c !== "object") return c;
      const { deletedAt: _omit, ...rest } = c as Record<string, unknown>;
      // Touch the var so TS doesn't complain about the underscore strip.
      void _omit;
      return rest;
    });
    const { error: writeErr } = await supabase
      .from("topics")
      .update({ flashcards_json: next })
      .eq("id", topicId);
    if (writeErr) return Response.json({ error: writeErr.message }, { status: 500 });

    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "restore_flashcard",
      subjectEmail: null,
      details: { topicId, flashcardIndex: idx },
    });
    return Response.json({ ok: true });
  }

  return Response.json(
    { error: "kind must be 'topic', 'question', or 'flashcard'" },
    { status: 400 }
  );
}
