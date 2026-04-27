"use client";

import useSWR from "swr";

// Admin-authenticated fetcher. Google ID token only — the legacy
// shared-password path was removed because (a) anyone who learned it
// became admin forever, (b) the audit log couldn't attribute actions
// to a real email, and (c) Google sign-in already provides the same
// access with a real identity. See PR removing src/lib/admins gates.
//
// The credential is the Google ID token string; the cache key is the
// token itself so a fresh sign-in invalidates the SWR cache naturally.
async function adminFetcher([url, idToken]: [string, string]) {
  const res = await fetch(url, {
    headers: { "x-id-token": idToken },
  });
  if (!res.ok) {
    const err = new Error(`Fetch failed: ${res.status}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Admin API fetch with SWR. Accepts a Google ID token (the only auth
 * path that exists since the password removal). The legacy
 * `{ password }` / bare-string credential shapes are still accepted
 * at the call-site type level so older call sites don't break — but
 * the password value is ignored. Use `{ idToken }` going forward.
 *
 * Returns the usual SWR tuple. `enabled=false` pauses the fetch.
 */
export function useAdminFetch<T>(
  url: string | null,
  credential:
    | { password: string | null }
    | { idToken: string | null }
    | string
    | null,
  options?: {
    refreshInterval?: number;
    enabled?: boolean;
  }
) {
  const enabled = options?.enabled !== false;

  // Resolve the Google ID token from any of the legacy credential
  // shapes. Bare strings + { password } are now ignored — they used
  // to send the x-admin-password header which the server no longer
  // honours.
  let idToken: string | null = null;
  if (typeof credential === "string") {
    // Legacy shape — was the password. Now ignored. Returns null
    // so the fetch is paused (the page-level useAdminAuth gate
    // resolves the real Google token separately).
    idToken = null;
  } else if (credential && "idToken" in credential && credential.idToken) {
    idToken = credential.idToken;
  }

  const key = url && idToken && enabled ? ([url, idToken] as const) : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    adminFetcher,
    {
      refreshInterval: options?.refreshInterval,
      // 2026-04-27: revalidateOnFocus disabled because every focus
      // event (including the implicit ones browsers fire when devtools
      // are open or when iframes mount) was firing a fresh fetch. The
      // editor opens 3 useAdminFetch hooks per topic — three refetches
      // per focus is cheap to avoid. Admins still get fresh data on
      // route change (SWR refetches on key change) and after every
      // save (we call mutate() in saveBlocks).
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      // Bumped from 3s to 30s. Admin content doesn't change that
      // fast, and the prior interval was tight enough that any
      // accidental render loop in a parent component (object-identity
      // credential, key churn) would cause a self-sustaining refetch
      // cycle once each request took >3s. 30s caps the worst case at
      // 3 polls/min instead of 30/min for the same misbehaviour.
      dedupingInterval: 30_000,
      keepPreviousData: true,
    }
  );

  return { data, error, isLoading, isValidating, mutate };
}
