"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";

// Global mount point for the ⌘K admin command palette.
//
// Two jobs:
//   1. Gate behind an admin-email check — non-admin users never load
//      the palette chunk at all (dynamic import + auth-gate below).
//   2. Own the global ⌘K / Ctrl-K keyboard listener so the palette
//      opens from anywhere in the admin UI (or indeed anywhere on the
//      site, for an admin browsing the student view).
//
// Mounted from src/app/admin/layout.tsx. Students never see this file
// execute — the AuthContext emits a non-admin email, we bail before
// loading the palette chunk.

const AdminCommandPalette = dynamic(
  () => import("@/components/admin/AdminCommandPalette"),
  { ssr: false }
);

export default function AdminCommandPaletteMount() {
  const { user, isLoggedIn } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const [open, setOpen] = useState(false);

  // ⌘K / Ctrl-K toggle. Always bound when admin is signed in so the
  // shortcut works from any admin page without us having to plumb
  // state through every route.
  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isModK) {
        // Don't swallow browser-reserved combos (⌘⌥K opens devtools
        // network/storage panels; ⌘⇧K is our own Bold shortcut in
        // the text-block editor). Only intercept the bare ⌘K.
        if (e.shiftKey || e.altKey) return;
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <AdminCommandPalette open={open} onClose={() => setOpen(false)} />
  );
}
