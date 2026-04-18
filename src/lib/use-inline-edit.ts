"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";

// Centralised "is this page rendering in inline-edit mode?" check.
//
// Inline edit mode is gated on two things ANDed together:
//   1. The `?edit=1` search param is present on the URL.
//   2. The signed-in user is in the admin allowlist.
//
// Non-admins with `?edit=1` on the URL are ignored — the gate is
// authoritative. We never render editor components for them so the
// editor chunk stays out of their bundle entirely.
export function useInlineEditMode(): boolean {
  const searchParams = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const wantsEdit = searchParams?.get("edit") === "1";
  return isAdmin && wantsEdit;
}
