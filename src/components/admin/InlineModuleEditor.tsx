"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import BlockEditor from "@/components/admin/BlockEditor";
import LiveBlockEditor from "@/components/admin/live/LiveBlockEditor";
import EditableHtml from "@/components/admin/live/EditableHtml";
import FlashcardsEditor, { type Flashcard } from "@/components/admin/FlashcardsEditor";
import SharedQuestionEditor from "@/components/admin/shared/QuestionEditor";
import SharedNewQuestionForm from "@/components/admin/shared/NewQuestionForm";
import { ToastProvider, useToast } from "@/components/admin/Toast";
import { useAuth } from "@/lib/auth-context";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { setEditSaveStatus, markSaved } from "@/lib/edit-save-status";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import type { ContentBlock } from "@/types/content";

// Inline module editor — the "edit this page" view of a module.
//
// Lives at the SAME URL as the student-facing module page
// (`/module/N?edit=1`) and reuses the student hero + tab-bar layout so
// the admin's muscle memory transfers. The body, however, flips from
// read-only (TopicRenderer + McqQuiz) to editable: each topic shows
// inline editors for its title/hook/timeMin, a BlockEditor for the
// content_json, and a list of MCQ editors.
//
// The entire component is dynamically imported from the module page's
// client wrapper, so the editor chunk never lands in a student's
// bundle (see use-inline-edit.ts for the admin gate).
//
// Save model:
//   - Topic body blocks auto-save 2s after the last edit. We chose
//     auto-save here because typos are the #1 use case — making the
//     admin click "save" every time would bring back the friction we
//     set out to kill.
//   - Topic meta (title / hook / timeMin) and MCQ list use explicit
//     Save buttons. Both are structurally small and benefit from the
//     admin knowing their change was intentional.
//   - All edits go through the existing admin PATCH endpoints; ISR on
//     the student-facing route picks up changes within ~30s.

interface Topic {
  id: string;
  number: number;
  title: string;
  timeMin: number | null;
  hook: string | null;
  orderIndex: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ModuleDetail {
  id: string;
  number: number;
  title: string;
  fullTitle: string | null;
  subtitle: string | null;
  description: string | null;
  accent: string | null;
  orderIndex: number;
}

interface ModuleResponse {
  module: ModuleDetail;
  topics: Topic[];
}

interface TopicDetail {
  id: string;
  number: number;
  title: string;
  timeMin: number | null;
  hook: string | null;
  contentJson: ContentBlock[];
  flashcardsJson?: Flashcard[];
  flashcardsSource?: "db" | "ts" | "empty";
}

interface TopicDetailResponse {
  topic: TopicDetail;
}

interface Question {
  id: string;
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
  bloom: string | null;
  explanation: string | null;
  difficulty: string | null;
}

interface QuestionsResponse {
  questions: Question[];
  migrationPending?: string;
}

// ─── Top-level shell ──────────────────────────────────────

// Wrapped in ToastProvider so save errors surface as toast
// notifications instead of native alert() dialogs (which block the
// main thread and can't be styled). The provider lives here rather
// than in the parent /module/N layout because that layout is shared
// with the student view, which doesn't need toast plumbing.
export default function InlineModuleEditor(props: {
  slug: string;
  moduleNumber: number;
}) {
  return (
    <ToastProvider>
      <InlineModuleEditorInner {...props} />
    </ToastProvider>
  );
}

function InlineModuleEditorInner({
  slug,
  moduleNumber,
}: {
  slug: string;
  moduleNumber: number;
}) {
  const { isLoggedIn, getIdToken } = useAuth();
  const idToken = isLoggedIn ? getIdToken() : null;
  // Memoised so the SWR keys derived from `credential` keep object
  // identity across renders. Without this, a parent re-render created
  // a fresh `{ idToken }` object every time, which combined with
  // the legacy 3s deduping interval and a 2s server response time
  // could spiral into a self-sustaining refetch loop on the three
  // useAdminFetch hooks below. Now the credential is a stable
  // reference unless the token itself changes.
  const credential = useMemo(
    () => (idToken ? { idToken } : null),
    [idToken]
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: moduleData, isLoading } = useAdminFetch<ModuleResponse>(
    `/api/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}`,
    credential
  );

  // Which topic tab is active? Kept in local state; defaults to the
  // lowest-numbered topic once data arrives.
  const [activeTopicNumber, setActiveTopicNumber] = useState<number | null>(
    null
  );
  useEffect(() => {
    if (!moduleData) return;
    const first = moduleData.topics[0]?.number ?? null;
    // Whitelisted — sets `activeTopicNumber` to the first topic ONLY
    // if it hasn't been set yet. The functional update preserves any
    // user choice across data refetches. Pure derivation in render
    // wouldn't work because we want the user's selection to persist.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTopicNumber((prev) => prev ?? first);
  }, [moduleData]);

  // exitEdit lives in the AdminBar now via the animated toggle switch.
  // Keeping this stub silences the unused-imports lint; remove once
  // we're sure no hotkey call sites rely on it.
  void router;
  void searchParams;

  if (!idToken) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title={`Module ${moduleNumber}`} />
        <div className="pt-20 px-6 max-w-lg mx-auto text-center">
          <p className="text-sm text-zinc-400">
            You&apos;re signed in via a restored session. Sign in with Google
            once more so edit mode can send authenticated requests, then try
            again.
          </p>
        </div>
      </main>
    );
  }

  const module_ = moduleData?.module;
  const topics = moduleData?.topics || [];
  const activeTopic = topics.find((t) => t.number === activeTopicNumber);

  return (
    <main className="min-h-screen">
      <Navbar showBack title={`Module ${moduleNumber}`} moduleNumber={moduleNumber} />

      {/* Subtle edit-mode affordance pinned under the nav. The AdminBar
          already shows the "EDITING" pulsing dot and save status — this
          strip just offers the contextual link into the full admin
          view for structural operations (rename module, reorder topics)
          which the inline surface doesn't cover. Muted colors keep the
          page feeling like content, not an admin console. */}
      <div
        className="sticky top-14 z-30 px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3 flex-wrap"
        style={{
          background: "rgba(10,10,16,0.75)",
          borderBottom: "1px solid rgba(99,102,241,0.15)",
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
        }}
      >
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="text-indigo-400">◆</span>
          <span>You&apos;re editing this page — students see changes within ~30s</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}`}
            className="text-[11px] font-medium text-zinc-500 hover:text-white px-2.5 py-1 rounded-full hover:bg-white/[0.04] transition-colors"
          >
            Full admin view →
          </Link>
        </div>
      </div>

      {isLoading && !moduleData && (
        <div className="max-w-3xl mx-auto px-5 pt-10 space-y-4">
          <Skeleton height={28} width="40%" radius={8} />
          <SkeletonText lines={2} />
          <Skeleton height={200} radius={16} />
          <Skeleton height={120} radius={16} />
        </div>
      )}

      {module_ && (
        <>
          {/* Hero — mirrors the student view but without the animated orbs.
              Keeps the visual context so the admin knows what page they're on. */}
          <section className="px-6 py-8 max-w-3xl mx-auto">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Module {module_.number}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {module_.fullTitle ?? module_.title}
            </h1>
            {module_.subtitle && (
              <p className="text-zinc-400 text-sm">{module_.subtitle}</p>
            )}
          </section>

          {/* Topic tab bar — click to switch the active topic. */}
          <div
            className="sticky top-[5.4rem] z-20 max-w-3xl mx-auto"
            style={{
              background: "rgba(9,9,15,0.9)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid #1e1e28",
            }}
          >
            <div className="flex items-center overflow-x-auto scrollbar-thin px-4">
              {topics.map((t) => {
                const active = t.number === activeTopicNumber;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTopicNumber(t.number)}
                    className={`relative px-3 py-3 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? "text-indigo-300"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded mr-1.5"
                      style={{
                        background: active ? "#4F46E5" : "#1e1e28",
                        color: active ? "white" : "#71717a",
                      }}
                    >
                      {t.number}
                    </span>
                    {t.title.substring(0, 22)}
                    {t.title.length > 22 ? "…" : ""}
                    {active && (
                      <motion.div
                        layoutId="editActiveTopic"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active topic editor */}
          <div className="max-w-3xl mx-auto px-5 py-6 pb-24">
            <AnimatePresence mode="wait">
              {activeTopic ? (
                <motion.div
                  key={activeTopic.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <TopicEditor
                    slug={slug}
                    moduleNumber={moduleNumber}
                    topicMeta={activeTopic}
                    idToken={idToken}
                  />
                </motion.div>
              ) : (
                <p className="text-sm text-zinc-400 text-center py-10">
                  No topics in this module yet.
                </p>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </main>
  );
}

// ─── Topic editor ─────────────────────────────────────────

function TopicEditor({
  slug,
  moduleNumber,
  topicMeta,
  idToken,
}: {
  slug: string;
  moduleNumber: number;
  topicMeta: Topic;
  idToken: string;
}) {
  const credential = useMemo(() => ({ idToken }), [idToken]);
  const { toast } = useToast();

  // Full detail fetch — need content_json which isn't on the list response.
  const { data: detailData, mutate: mutateDetail } =
    useAdminFetch<TopicDetailResponse>(
      `/api/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}/topics/${topicMeta.number}`,
      credential
    );

  // Questions fetch
  const { data: qData, mutate: mutateQs } = useAdminFetch<QuestionsResponse>(
    `/api/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}/topics/${topicMeta.number}/questions`,
    credential
  );

  // Editor mode — "live" = Notion-style WYSIWYG (LiveBlockEditor),
  // "classic" = the original form-based BlockEditor. Stored in
  // localStorage so the admin's preference survives reloads. Default
  // is "live" because that's the new authoring surface; classic
  // stays as a safety net for any edge case the live editor doesn't
  // yet handle (PR 1 scope).
  const [editorMode, setEditorMode] = useState<"live" | "classic">("live");
  useEffect(() => {
    try {
      const v = localStorage.getItem("editor:mode");
      if (v === "classic" || v === "live") {
        setEditorMode(v);
      }
    } catch {
      // localStorage may throw in privacy modes — fall back to default.
    }
  }, []);
  function changeEditorMode(next: "live" | "classic") {
    setEditorMode(next);
    try {
      localStorage.setItem("editor:mode", next);
    } catch {
      // best-effort persistence
    }
  }

  // Local meta state (title / hook / timeMin) — seeded from server, diff-saved.
  const [title, setTitle] = useState(topicMeta.title);
  const [hook, setHook] = useState(topicMeta.hook || "");
  const [timeMinStr, setTimeMinStr] = useState(
    topicMeta.timeMin != null ? String(topicMeta.timeMin) : ""
  );
  useEffect(() => {
    setTitle(topicMeta.title);
    setHook(topicMeta.hook || "");
    setTimeMinStr(topicMeta.timeMin != null ? String(topicMeta.timeMin) : "");
  }, [topicMeta.id, topicMeta.title, topicMeta.hook, topicMeta.timeMin]);

  const metaDirty =
    title !== topicMeta.title ||
    hook !== (topicMeta.hook || "") ||
    timeMinStr !== (topicMeta.timeMin != null ? String(topicMeta.timeMin) : "");

  const [savingMeta, setSavingMeta] = useState(false);
  async function saveMeta() {
    setSavingMeta(true);
    try {
      const res = await fetch(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}/topics/${topicMeta.number}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-id-token": idToken,
          },
          body: JSON.stringify({
            title,
            hook,
            timeMin: timeMinStr.trim() === "" ? null : parseInt(timeMinStr, 10),
          }),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Save failed (${res.status})`);
      }
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setSavingMeta(false);
    }
  }

  // Blocks state + auto-save (debounced 2s idle).
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [blocksDirty, setBlocksDirty] = useState(false);
  const [blockSaveState, setBlockSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [blockSaveError, setBlockSaveError] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Separate debounce timer for the flashcards autosave. Must not
  // share the blocks timer — otherwise fast-typing in one editor
  // could cancel a pending save in the other.
  const flashcardsAutosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const serverBlocks = detailData?.topic.contentJson;
  useEffect(() => {
    if (!serverBlocks) return;
    setBlocks(serverBlocks);
    setBlocksDirty(false);
    setBlockSaveState("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(serverBlocks)]);

  // Flashcards — same auto-save pattern as blocks but with its own
  // state + save function so a half-typed card can't block body
  // saves and vice versa.
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsDirty, setFlashcardsDirty] = useState(false);
  const [savingFlashcards, setSavingFlashcards] = useState(false);

  const serverFlashcards = detailData?.topic.flashcardsJson;
  useEffect(() => {
    if (!serverFlashcards) return;
    setFlashcards(serverFlashcards);
    setFlashcardsDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(serverFlashcards)]);

  /**
   * Persist flashcards to the server. Accepts an optional `next` so
   * the autosave path can pass the freshest state directly —
   * relying on the closure-captured `flashcards` state would lose
   * updates made between the debounce tick and the fetch starting.
   * Omit the arg when triggered by the explicit Save button (which
   * already reads from the same state).
   */
  async function saveFlashcards(next?: Flashcard[]) {
    const payload = next ?? flashcards;
    setSavingFlashcards(true);
    try {
      const res = await fetch(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}/topics/${topicMeta.number}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-id-token": idToken,
          },
          body: JSON.stringify({ flashcardsJson: payload }),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Save failed (${res.status})`);
      }
      setFlashcardsDirty(false);
      mutateDetail();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setSavingFlashcards(false);
    }
  }

  function handleBlocksChange(next: ContentBlock[]) {
    setBlocks(next);
    setBlocksDirty(true);
    setEditSaveStatus("dirty");
    // Reset debounce timer.
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => void saveBlocks(next), 2000);
  }

  async function saveBlocks(next: ContentBlock[]) {
    setBlockSaveState("saving");
    setEditSaveStatus("saving");
    setBlockSaveError(null);
    try {
      const res = await fetch(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}/topics/${topicMeta.number}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-id-token": idToken,
          },
          body: JSON.stringify({ contentJson: next }),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Save failed (${res.status})`);
      }
      setBlocksDirty(false);
      setBlockSaveState("saved");
      markSaved();
      mutateDetail();
    } catch (e) {
      setBlockSaveError((e as Error).message);
      setBlockSaveState("error");
      setEditSaveStatus("error");
    }
  }

  // ⌘S / Ctrl-S force-saves blocks even if the 2s debounce hasn't fired.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        if (blocksDirty) {
          e.preventDefault();
          if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
          void saveBlocks(blocks);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksDirty, blocks]);

  // Unsaved-changes warning on nav. Fires for meta dirty OR in-flight
  // block autosave. Safety net — the 2s debounce usually completes
  // before navigation, but a fast close-tab after typing could miss.
  useEffect(() => {
    const hasUnsaved = metaDirty || blocksDirty || blockSaveState === "saving";
    if (!hasUnsaved) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [metaDirty, blocksDirty, blockSaveState]);

  const questions = qData?.questions || [];

  return (
    <div className="space-y-5">
      {/* Meta fields ── title / hook / time */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Topic {topicMeta.number}
          </div>
          <button
            onClick={saveMeta}
            disabled={!metaDirty || savingMeta}
            className="text-[11px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-40 px-2.5 py-1 rounded"
          >
            {savingMeta ? "Saving…" : metaDirty ? "Save title/hook" : "Saved"}
          </button>
        </div>
        {/* Title — always a plain input. The student page renders title
             as plain text, so allowing rich text here would just leak
             literal <strong>…</strong> into students' reading view. */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Topic title"
          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-lg font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
        />
        <div className="grid md:grid-cols-[1fr_auto] gap-2">
          {editorMode === "live" ? (
            <div
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]"
              data-live-editable="true"
            >
              <EditableHtml
                value={hook}
                onChange={setHook}
                placeholder="Hook — the one-line opener that sits above the body"
                className="text-sm text-zinc-300 leading-relaxed [&_strong]:text-zinc-100 [&_strong]:font-semibold [&_mark]:bg-gradient-to-r [&_mark]:from-violet-500/20 [&_mark]:to-indigo-500/20 [&_mark]:text-white [&_mark]:font-semibold [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:mx-0.5 [&_mark]:rounded-md [&_mark]:ring-1 [&_mark]:ring-violet-400/30"
                ariaLabel="Topic hook"
              />
            </div>
          ) : (
            <textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Hook — the one-line opener that sits above the body"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          )}
          <label className="text-[11px] text-zinc-500 block">
            <span className="block mb-1">Time (min)</span>
            <input
              type="number"
              value={timeMinStr}
              onChange={(e) => setTimeMinStr(e.target.value)}
              placeholder="—"
              className="w-20 px-2 py-1.5 rounded bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500/50"
            />
          </label>
        </div>
      </div>

      {/* Body blocks — auto-saved */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold">Topic body</h3>
            <EditorModeToggle mode={editorMode} onChange={changeEditorMode} />
          </div>
          <BlockSaveIndicator state={blockSaveState} dirty={blocksDirty} />
        </div>
        {blockSaveError && (
          <p className="text-[11px] text-red-400 mb-2">{blockSaveError}</p>
        )}
        {editorMode === "live" ? (
          <LiveBlockEditor
            value={blocks}
            onChange={handleBlocksChange}
            courseSlug={slug}
            moduleNumber={moduleNumber}
            topicNumber={topicMeta.number}
            idToken={idToken}
            password=""
          />
        ) : (
          <BlockEditor
            value={blocks}
            onChange={handleBlocksChange}
            courseSlug={slug}
            moduleNumber={moduleNumber}
            topicNumber={topicMeta.number}
            idToken={idToken}
            password=""
          />
        )}
      </div>

      {/* Flashcards — same per-topic deck the /admin/courses page edits.
           Wired here so admins editing inline (the /module/N route) can
           also add/edit/delete cards without bouncing to /admin/courses. */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {detailData?.topic.flashcardsSource === "ts" && (
          <div
            className="mb-3 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#FCD34D",
            }}
          >
            <strong>📦 Loaded from bundled file</strong> — these {flashcards.length} card{flashcards.length === 1 ? "" : "s"} live in <code className="px-1 py-0.5 rounded bg-black/30">src/data/flashcards.ts</code>. Click <strong>Save cards</strong> to migrate them to the database, then you can edit / delete / reorder.
          </div>
        )}
        <FlashcardsEditor
          value={flashcards}
          onChange={(next) => {
            setFlashcards(next);
            setFlashcardsDirty(true);
            // Autosave — matches the content-blocks flow. Without this,
            // a teacher deleting a card during class saw the card
            // disappear from the editor but it stayed in the DB until
            // they clicked Save, so student tabs never converged even
            // after the live-poll fetch landed. 1.2s debounce so a
            // burst of front/back edits coalesces into one PATCH.
            if (flashcardsAutosaveTimer.current) {
              clearTimeout(flashcardsAutosaveTimer.current);
            }
            flashcardsAutosaveTimer.current = setTimeout(
              () => void saveFlashcards(next),
              1200
            );
          }}
          onImmediateChange={(next) => {
            // Structural change (add / delete / reorder). Cancel any
            // pending text-edit debounce and fire the save right now
            // so closing the tab immediately can't lose the delete.
            if (flashcardsAutosaveTimer.current) {
              clearTimeout(flashcardsAutosaveTimer.current);
              flashcardsAutosaveTimer.current = null;
            }
            setFlashcards(next);
            setFlashcardsDirty(true);
            void saveFlashcards(next);
          }}
          onSave={() => saveFlashcards()}
          saving={savingFlashcards}
          dirty={flashcardsDirty || detailData?.topic.flashcardsSource === "ts"}
        />
      </div>

      {/* Questions */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">
            Questions ({questions.length})
          </h3>
        </div>
        {qData?.migrationPending && (
          <p className="text-[11px] text-amber-400 mb-3">
            ⚠️ {qData.migrationPending}
          </p>
        )}
        <div className="space-y-2">
          {questions.map((q) => (
            <SharedQuestionEditor
              key={q.id}
              slug={slug}
              moduleNumber={moduleNumber}
              topicNumber={topicMeta.number}
              question={q}
              idToken={idToken}
              variant="compact"
              onChange={mutateQs}
            />
          ))}
        </div>
        <SharedNewQuestionForm
          slug={slug}
          moduleNumber={moduleNumber}
          topicNumber={topicMeta.number}
          nextNumber={(questions[questions.length - 1]?.number ?? 0) + 1}
          idToken={idToken}
          onCreated={mutateQs}
        />
      </div>
    </div>
  );
}

// ─── Save indicator ───────────────────────────────────────

function BlockSaveIndicator({
  state,
  dirty,
}: {
  state: "idle" | "saving" | "saved" | "error";
  dirty: boolean;
}) {
  if (state === "saving") {
    return (
      <span className="text-[11px] text-amber-400 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Saving…
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="text-[11px] text-red-400">⚠ Save failed</span>
    );
  }
  if (dirty) {
    return (
      <span className="text-[11px] text-zinc-500">Unsaved — auto-saving…</span>
    );
  }
  if (state === "saved") {
    return (
      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
        ✓ Saved
      </span>
    );
  }
  return null;
}

// ─── Editor mode toggle ─────────────────────────────────

// Pill toggle between the new Notion-style live editor and the
// original form-based BlockEditor. Persisted to localStorage by the
// caller (TopicEditor → changeEditorMode). Default for new users is
// "live" — that's the new authoring surface.
function EditorModeToggle({
  mode,
  onChange,
}: {
  mode: "live" | "classic";
  onChange: (next: "live" | "classic") => void;
}) {
  return (
    <div
      className="inline-flex items-center rounded-full p-0.5 select-none"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      role="tablist"
      aria-label="Editor mode"
    >
      <ModeBtn active={mode === "live"} onClick={() => onChange("live")}>
        ✏️ Live
      </ModeBtn>
      <ModeBtn active={mode === "classic"} onClick={() => onChange("classic")}>
        📋 Classic
      </ModeBtn>
    </div>
  );
}

function ModeBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className="text-[11px] font-semibold px-3 py-1 rounded-full transition-all"
      style={{
        background: active
          ? "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(139,92,246,0.85))"
          : "transparent",
        color: active ? "#fff" : "#9CA3AF",
        boxShadow: active
          ? "0 4px 14px rgba(99,102,241,0.35)"
          : "none",
      }}
    >
      {children}
    </button>
  );
}

