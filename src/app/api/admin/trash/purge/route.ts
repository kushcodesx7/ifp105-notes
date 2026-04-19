import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { cleanupTopicImages } from "@/lib/storage-cleanup";

// POST /api/admin/trash/purge
// Body: { kind: "topic" | "question", id: string }
//
// Hard-deletes a soft-deleted row. The row MUST already be in the
// trash (deleted_at IS NOT NULL) — this endpoint refuses to purge a
// live row, so a misfired fetch can't accidentally hard-delete
// something the student can still see. For topics, attached images
// in the content-bucket are cleaned up before the DB cascade fires.
//
// Admin-only + a one-shot confirm dialog on the client. Irreversible.

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
    // Safety check — row must be in the bin. Refuse otherwise.
    const { data: topic, error: readErr } = await supabase
      .from("topics")
      .select("id, deleted_at")
      .eq("id", id)
      .maybeSingle();
    if (readErr) return Response.json({ error: readErr.message }, { status: 500 });
    if (!topic) {
      return Response.json({ error: "Topic not found" }, { status: 404 });
    }
    if (!(topic as { deleted_at: string | null }).deleted_at) {
      return Response.json(
        { error: "Topic is not in trash — move it there first" },
        { status: 409 }
      );
    }

    // Images cleanup → DB cascade. Same order as the hard-delete path.
    const cleanedImages = await cleanupTopicImages(id);
    const { error } = await supabase.from("topics").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "purge_topic",
      subjectEmail: null,
      details: { topicId: id, cleanedImages },
    });
    return Response.json({ ok: true, cleanedImages });
  }

  if (kind === "question") {
    const { data: q, error: readErr } = await supabase
      .from("questions")
      .select("id, deleted_at")
      .eq("id", id)
      .maybeSingle();
    if (readErr) return Response.json({ error: readErr.message }, { status: 500 });
    if (!q) return Response.json({ error: "Question not found" }, { status: 404 });
    if (!(q as { deleted_at: string | null }).deleted_at) {
      return Response.json(
        { error: "Question is not in trash — move it there first" },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "purge_question",
      subjectEmail: null,
      details: { questionId: id },
    });
    return Response.json({ ok: true });
  }

  // Flashcard purge — splice the trashed card out of the topic's
  // flashcards_json array. Safety check: refuses to purge a slot
  // that doesn't currently have a deletedAt set.
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
    const target = arr[idx] as { deletedAt?: string | null } | undefined;
    if (!target?.deletedAt) {
      return Response.json(
        { error: "Flashcard is not in trash — move it there first" },
        { status: 409 }
      );
    }
    const next = arr.filter((_, i) => i !== idx);
    const { error: writeErr } = await supabase
      .from("topics")
      .update({ flashcards_json: next })
      .eq("id", topicId);
    if (writeErr) return Response.json({ error: writeErr.message }, { status: 500 });

    await logAdminAction({
      actorEmail: actorFromAuth(admin),
      action: "purge_flashcard",
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
