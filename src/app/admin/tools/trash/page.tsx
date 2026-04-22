"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AdminAuthGate, {
  useAdminAuth,
  adminWrite,
} from "@/components/admin/AdminAuthGate";
import { useToast } from "@/components/admin/Toast";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { Skeleton } from "@/components/ui/Skeleton";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

// /admin/tools/trash
//
// The bin. Lists every soft-deleted topic and question across every
// course, with Restore (one click, recoverable) and Delete Permanently
// (one-shot confirm, irreversible) actions. Populated by the DELETE
// endpoints for topics + questions, which now soft-delete by default.
//
// Topics whose parent module no longer exists are excluded by the API;
// questions whose parent topic is also in the bin are hidden here too
// (restoring the topic restores them automatically, so listing them
// separately would be confusing).

interface TrashedTopicItem {
  kind: "topic";
  id: string;
  topicNumber: number;
  title: string;
  moduleNumber: number;
  moduleTitle: string;
  courseSlug: string;
  courseTitle: string;
  deletedAt: string;
}
interface TrashedQuestionItem {
  kind: "question";
  id: string;
  questionNumber: number;
  question: string;
  topicNumber: number;
  topicTitle: string;
  moduleNumber: number;
  moduleTitle: string;
  courseSlug: string;
  courseTitle: string;
  deletedAt: string;
}
interface TrashedFlashcardItem {
  kind: "flashcard";
  id: string; // composite "topicId:flashcardIdx"
  topicId: string;
  flashcardIndex: number;
  front: string;
  back: string;
  topicNumber: number;
  topicTitle: string;
  moduleNumber: number;
  moduleTitle: string;
  courseSlug: string;
  courseTitle: string;
  deletedAt: string;
}
type TrashItem =
  | TrashedTopicItem
  | TrashedQuestionItem
  | TrashedFlashcardItem;

interface TrashResponse {
  items: TrashItem[];
  migrationPending?: string;
}

export default function TrashPage() {
  const { idToken, password, setPassword, ready, setAuthenticated } =
    useAdminAuth();
  const { toast } = useToast();
  const credential = { idToken };

  const { data, mutate, isLoading } = useAdminFetch<TrashResponse>(
    "/api/admin/trash",
    credential,
    { enabled: ready }
  );

  const [purgeItem, setPurgeItem] = useState<TrashItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!ready) {
    return (
      <AdminAuthGate
        password={password}
        setPassword={setPassword}
        setAuthenticated={setAuthenticated}
        probeUrl="/api/admin/trash"
      />
    );
  }

  const items = data?.items || [];

  async function restore(item: TrashItem) {
    setBusyId(item.id);
    try {
      await adminWrite(
        "/api/admin/trash/restore",
        "POST",
        { idToken, password },
        { kind: item.kind, id: item.id }
      );
      const label =
        item.kind === "topic"
          ? `Restored topic "${item.title}"`
          : item.kind === "flashcard"
            ? `Restored flashcard`
            : `Restored question`;
      toast({ kind: "success", message: label });
      mutate();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setBusyId(null);
    }
  }

  async function purge(item: TrashItem) {
    setBusyId(item.id);
    try {
      await adminWrite(
        "/api/admin/trash/purge",
        "POST",
        { idToken, password },
        { kind: item.kind, id: item.id }
      );
      toast({ kind: "success", message: "Permanently deleted" });
      mutate();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setBusyId(null);
      setPurgeItem(null);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Tools", href: "/admin/tools" },
            { label: "Trash" },
          ]}
        />

        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <span aria-hidden="true">🗑️</span> Trash
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Soft-deleted topics, questions, and flashcards. Restore anytime, or permanently delete to free up the slot.
            </p>
          </div>
          <div className="text-[11px] text-zinc-500">
            {items.length} item{items.length === 1 ? "" : "s"} in bin
          </div>
        </div>

        {data?.migrationPending && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-[12px]"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#fcd34d",
            }}
          >
            ⚠️ {data.migrationPending}
          </div>
        )}

        {isLoading && !data && (
          <div className="space-y-2">
            <Skeleton height={72} radius={12} />
            <Skeleton height={72} radius={12} />
            <Skeleton height={72} radius={12} />
          </div>
        )}

        {!isLoading && items.length === 0 && !data?.migrationPending && (
          <div
            className="rounded-2xl px-6 py-14 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-4xl mb-3">✨</div>
            <h2 className="text-base font-bold mb-1">Bin is empty</h2>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Deleted topics, questions, and flashcards show up here. Every
              delete goes to the bin first — nothing is lost on a misclick.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={`${item.kind}:${item.id}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className="rounded-xl p-4 flex items-start gap-3 flex-wrap"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                  style={{
                    background:
                      item.kind === "topic"
                        ? "rgba(99,102,241,0.12)"
                        : item.kind === "flashcard"
                          ? "rgba(244,114,182,0.12)"
                          : "rgba(16,185,129,0.12)",
                    color:
                      item.kind === "topic"
                        ? "#A5B4FC"
                        : item.kind === "flashcard"
                          ? "#F9A8D4"
                          : "#6EE7B7",
                  }}
                  title={
                    item.kind === "topic"
                      ? "Topic"
                      : item.kind === "flashcard"
                        ? "Flashcard"
                        : "Question"
                  }
                  aria-label={item.kind}
                >
                  {item.kind === "topic"
                    ? "📘"
                    : item.kind === "flashcard"
                      ? "🃏"
                      : "❓"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                    {item.courseTitle} › Module {item.moduleNumber}: {item.moduleTitle}
                    {(item.kind === "question" || item.kind === "flashcard") && (
                      <> › Topic {item.topicNumber}: {item.topicTitle}</>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-zinc-200 line-clamp-2">
                    {item.kind === "topic"
                      ? `Topic ${item.topicNumber}: ${item.title}`
                      : item.kind === "flashcard"
                        ? `Flashcard: ${item.front}`
                        : `Q${item.questionNumber}: ${item.question}`}
                  </div>
                  {item.kind === "flashcard" && (
                    <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1 italic">
                      → {item.back}
                    </div>
                  )}
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Deleted{" "}
                    <time dateTime={item.deletedAt}>
                      {new Date(item.deletedAt).toLocaleString()}
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                  {/* Peek — jumps to the course context, useful when the
                       trash row title alone isn't enough to recognise
                       what you're about to restore / purge. */}
                  {(item.kind === "topic" || item.kind === "flashcard") && (
                    <Link
                      href={`/admin/courses/${encodeURIComponent(
                        item.courseSlug
                      )}/modules/${item.moduleNumber}`}
                      className="text-[11px] font-medium text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      View module →
                    </Link>
                  )}
                  <button
                    onClick={() => restore(item)}
                    disabled={busyId === item.id}
                    className="text-[12px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {busyId === item.id ? "…" : "Restore"}
                  </button>
                  <button
                    onClick={() => setPurgeItem(item)}
                    disabled={busyId === item.id}
                    className="text-[12px] font-semibold text-red-400 hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.14] disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Delete permanently
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        open={!!purgeItem}
        title="Permanently delete?"
        description={
          purgeItem
            ? purgeItem.kind === "topic"
              ? `Topic ${purgeItem.topicNumber}: "${purgeItem.title}" will be gone forever.`
              : purgeItem.kind === "flashcard"
                ? `Flashcard "${purgeItem.front.slice(0, 80)}" will be gone forever.`
                : `Q${purgeItem.questionNumber} from Topic ${purgeItem.topicNumber} will be gone forever.`
            : ""
        }
        warning="This can't be undone. If you might want it back, use Restore instead."
        confirmLabel="Delete forever"
        kind="danger"
        onCancel={() => setPurgeItem(null)}
        onConfirm={() => {
          if (purgeItem) return purge(purgeItem);
        }}
        loading={!!purgeItem && busyId === purgeItem.id}
      />
    </main>
  );
}
