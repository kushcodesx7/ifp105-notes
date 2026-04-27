"use client";

import { useEffect, useState } from "react";
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
//
// Returns false until after the first client render. Auth state isn't
// available during SSR (Firebase only resolves in the browser), so
// returning the post-auth answer immediately would diverge from the
// SSR tree and trigger a hydration mismatch on every `?edit=1` load.
export function useInlineEditMode(): boolean {
  const searchParams = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Whitelisted — flips a one-shot flag on mount so the SSR pass
    // and the first client render produce identical output. Safe by
    // design: runs exactly once, never reads props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return false;
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const wantsEdit = searchParams?.get("edit") === "1";
  return isAdmin && wantsEdit;
}
