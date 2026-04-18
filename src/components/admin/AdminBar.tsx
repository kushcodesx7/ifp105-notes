"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import { useViewAsStudent, setViewAsStudent } from "@/lib/view-as-student";

// Floating admin bar — bottom-right, visible on every page for admin
// users. Disappears completely for non-admins (zero DOM, zero JS cost
// since it's dynamically imported from the layout).
//
// Content depends on the current route:
//   - On /module/N: "✏ Edit this page" toggles ?edit=1 on the URL
//   - Everywhere: "📊 Admin" links to /admin
//   - Everywhere: "👁 View as student" hides this bar + any admin-only
//     styling so the admin can sanity-check exactly what a student sees
//     (no need to log out or open incognito)
//
// The bar is `fixed bottom-4 right-4`, high z-index, compact.

// Pattern the "only on module pages" logic expects.
const MODULE_ROUTE = /^\/module\/([1-9]\d*)\/?$/;

export default function AdminBar() {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewAsStudent = useViewAsStudent();

  const isAdmin = isLoggedIn && isAdminEmail(user?.email);

  // On a module route? Extract the number if so.
  const moduleNumber = useMemo(() => {
    const m = MODULE_ROUTE.exec(pathname);
    return m ? parseInt(m[1], 10) : null;
  }, [pathname]);

  // Are we currently in edit mode (?edit=1)?
  const editMode = searchParams?.get("edit") === "1";

  // Hide entirely for non-admins or when view-as-student is on.
  if (!isAdmin || viewAsStudent) {
    // When view-as-student is on, render a tiny "Exit student view"
    // button so the admin isn't stuck — otherwise they'd have to open
    // DevTools and clear localStorage manually.
    if (isAdmin && viewAsStudent) {
      return (
        <button
          onClick={() => setViewAsStudent(false)}
          className="fixed bottom-4 right-4 z-[120] text-[11px] font-semibold px-3 py-1.5 rounded-full text-white"
          style={{
            background: "rgba(99,102,241,0.85)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
          }}
          title="Currently viewing as a student — click to exit"
          aria-label="Exit view-as-student mode"
        >
          👁 Exit student view
        </button>
      );
    }
    return null;
  }

  function toggleEditMode() {
    if (!moduleNumber) return;
    const sp = new URLSearchParams(searchParams?.toString() || "");
    if (editMode) sp.delete("edit");
    else sp.set("edit", "1");
    const qs = sp.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-4 right-4 z-[120]"
    >
      <div
        className="flex items-center gap-1 p-1 rounded-full"
        style={{
          background: editMode
            ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(15,15,25,0.95))"
            : "rgba(15,15,25,0.92)",
          border: `1px solid ${editMode ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
          backdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {moduleNumber !== null && (
            <motion.button
              key="edit-toggle"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              onClick={toggleEditMode}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
              style={{
                background: editMode
                  ? "linear-gradient(135deg, #EF4444, #DC2626)"
                  : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "white",
                boxShadow: editMode
                  ? "0 4px 14px rgba(239,68,68,0.35)"
                  : "0 4px 14px rgba(99,102,241,0.35)",
              }}
              title={editMode ? "Exit edit mode" : "Edit this page"}
            >
              {editMode ? (
                <>
                  <span aria-hidden="true">✓</span> Done editing
                </>
              ) : (
                <>
                  <span aria-hidden="true">✏</span> Edit this page
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
          title="Open admin panel"
        >
          <span aria-hidden="true">📊</span>
          <span className="hidden sm:inline">Admin</span>
        </Link>

        <button
          onClick={() => setViewAsStudent(true)}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
          title="Hide the admin UI — see the page exactly as a student does"
        >
          <span aria-hidden="true">👁</span>
          <span className="hidden sm:inline">View as student</span>
        </button>
      </div>
    </motion.div>
  );
}
