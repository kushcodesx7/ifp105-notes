"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import { useViewAsStudent, setViewAsStudent } from "@/lib/view-as-student";
import {
  useEditSaveStatus,
  type SaveStatus,
} from "@/lib/edit-save-status";

// Floating admin bar. The primary control surface when logged in as
// admin. Three states:
//
//   1. On any route (not a module): compact glass pill with Admin +
//      View-as-student buttons.
//   2. On /module/N in view mode: adds a big "Edit" pill on the left.
//      Hover lifts the bar subtly.
//   3. On /module/N?edit=1: bar expands to show "EDITING" status with
//      a pulsing dot, a live save-state indicator, and a prominent
//      "Done" button. The pill swaps to red-to-violet gradient so the
//      admin can't mistake which mode they're in.
//
// Design goals:
//   - Glassmorphism with backdrop-blur so the bar sits on the page,
//     not over it.
//   - All motion uses spring physics — no linear transitions.
//   - Zero DOM for non-admin users (this whole component is dynamically
//     imported + gated; see AdminBarMount).

const MODULE_ROUTE = /^\/module\/([1-9]\d*)\/?$/;

// ─── Animated iOS-style switch ───────────────────────────

function ToggleSwitch({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="relative inline-flex items-center shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 rounded-full"
      style={{
        width: 36,
        height: 20,
        padding: 2,
        background: on
          ? "linear-gradient(135deg, #EF4444, #DC2626)"
          : "rgba(255,255,255,0.12)",
        boxShadow: on
          ? "0 0 0 1px rgba(239,68,68,0.4), 0 4px 12px rgba(239,68,68,0.35) inset"
          : "0 0 0 1px rgba(255,255,255,0.1) inset",
        transition: "background 200ms ease, box-shadow 200ms ease",
      }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className="rounded-full"
        style={{
          width: 16,
          height: 16,
          background: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          marginLeft: on ? 16 : 0,
        }}
      />
    </button>
  );
}

// ─── Save-status chip ────────────────────────────────────

function SaveStatusChip({ status }: { status: SaveStatus }) {
  const text =
    status === "saving"
      ? "Saving…"
      : status === "error"
      ? "Save failed"
      : status === "dirty"
      ? "Unsaved"
      : status === "saved"
      ? "Saved"
      : null;

  if (!text) return null;

  const color =
    status === "error"
      ? "#F87171"
      : status === "saving"
      ? "#FCD34D"
      : status === "dirty"
      ? "#FDE68A"
      : "#6EE7B7";

  return (
    <motion.span
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4 }}
      className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full"
      style={{
        color,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}40`,
      }}
    >
      <motion.span
        className="rounded-full"
        style={{ background: color, width: 6, height: 6 }}
        animate={
          status === "saving" || status === "dirty"
            ? { opacity: [0.4, 1, 0.4] }
            : { opacity: 1 }
        }
        transition={
          status === "saving" || status === "dirty"
            ? { duration: 1.4, repeat: Infinity }
            : {}
        }
      />
      {text}
    </motion.span>
  );
}

// ─── Main bar ────────────────────────────────────────────

export default function AdminBar() {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewAsStudent = useViewAsStudent();
  const saveStatus = useEditSaveStatus();

  const isAdmin = isLoggedIn && isAdminEmail(user?.email);

  const moduleNumber = useMemo(() => {
    const m = MODULE_ROUTE.exec(pathname);
    return m ? parseInt(m[1], 10) : null;
  }, [pathname]);

  const editMode = searchParams?.get("edit") === "1";

  // Show "Best on desktop" toast once when an admin opens edit mode
  // on a narrow screen. Gently nudges without blocking.
  const [mobileHint, setMobileHint] = useState(false);
  useEffect(() => {
    if (!editMode || !isAdmin) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) {
      setMobileHint(true);
      const t = setTimeout(() => setMobileHint(false), 6000);
      return () => clearTimeout(t);
    }
  }, [editMode, isAdmin]);

  function toggleEditMode() {
    if (!moduleNumber) return;
    const sp = new URLSearchParams(searchParams?.toString() || "");
    if (editMode) sp.delete("edit");
    else sp.set("edit", "1");
    const qs = sp.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  // Non-admin (shouldn't happen — gate in AdminBarMount — but belt & braces)
  if (!isAdmin) return null;

  // View-as-student: hide entirely, show just a subtle exit chip.
  if (viewAsStudent) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        onClick={() => setViewAsStudent(false)}
        className="fixed bottom-4 right-4 z-[120] text-[11px] font-semibold px-3 py-1.5 rounded-full text-white"
        style={{
          background: "rgba(99,102,241,0.88)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 24px rgba(99,102,241,0.45)",
        }}
        aria-label="Exit view-as-student mode"
      >
        <span className="opacity-80 mr-1">👁</span>Exit student view
      </motion.button>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed bottom-4 right-4 z-[120] max-w-[calc(100vw-2rem)]"
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-full"
          style={{
            background: editMode
              ? "linear-gradient(135deg, rgba(239,68,68,0.14), rgba(124,58,237,0.12), rgba(15,15,25,0.92))"
              : "rgba(15,15,25,0.78)",
            border: `1px solid ${
              editMode ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.08)"
            }`,
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            boxShadow: editMode
              ? "0 12px 40px rgba(239,68,68,0.25), 0 0 0 1px rgba(239,68,68,0.15)"
              : "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {/* Editing indicator — only when in edit mode */}
          <AnimatePresence initial={false} mode="popLayout">
            {editMode && (
              <motion.div
                key="editing-status"
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-red-200 whitespace-nowrap"
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-red-400 shrink-0"
                  animate={{
                    opacity: [1, 0.3, 1],
                    scale: [1, 0.85, 1],
                  }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                Editing
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit toggle switch — module pages only */}
          <AnimatePresence initial={false} mode="popLayout">
            {moduleNumber !== null && (
              <motion.div
                key="edit-toggle-group"
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <ToggleSwitch
                  on={editMode}
                  onClick={toggleEditMode}
                  label={editMode ? "Switch to student view" : "Enter edit mode"}
                />
                {/* Symmetric label — shows the action you're about to take.
                    In view mode → "Edit". In edit mode → "👁 Preview as student"
                    so the admin remembers they can flip without losing work
                    (the inline editor auto-saves blocks every 2s). */}
                <button
                  onClick={toggleEditMode}
                  className="text-[12px] font-semibold text-zinc-200 hover:text-white transition-colors whitespace-nowrap"
                >
                  {editMode ? "👁 View as student" : "✏️ Edit"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save status chip — shows up only during/after edits */}
          <AnimatePresence initial={false}>
            {editMode && saveStatus !== "idle" && (
              <SaveStatusChip status={saveStatus} />
            )}
          </AnimatePresence>

          {/* Separator — only when the left side has content */}
          {(editMode || moduleNumber !== null) && (
            <span
              className="w-px h-5 shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}
            />
          )}

          {/* Admin panel shortcut */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Open admin panel"
          >
            <span aria-hidden="true">📊</span>
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* View-as-student */}
          <button
            onClick={() => setViewAsStudent(true)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Hide admin UI — see the page exactly as a student does"
          >
            <span aria-hidden="true">👁</span>
            <span className="hidden sm:inline">Student view</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Mobile hint — brief, one-shot */}
      <AnimatePresence>
        {mobileHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[119] max-w-[calc(100vw-2rem)] px-3 py-2 rounded-xl text-[12px] text-zinc-200"
            style={{
              background: "rgba(15,15,25,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
            }}
          >
            💡 Editing works best on desktop
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
