"use client";

import useSWR from "swr";

// Admin-authenticated fetcher. The cache key carries the credential so a
// password change (or a fresh login) invalidates the SWR cache naturally.
// The credential format is "pw:PASSWORD" or "tok:ID_TOKEN" to distinguish.
async function adminFetcher([url, credential]: [string, string]) {
  const headers: Record<string, string> = {};
  if (credential.startsWith("tok:")) {
    headers["x-id-token"] = credential.slice(4);
  } else if (credential.startsWith("pw:")) {
    headers["x-admin-password"] = credential.slice(3);
  }
  const res = await fetch(url, { headers });
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
 * Admin API fetch with SWR. Accepts either:
 *  - `password` (string): the legacy admin password — sent as x-admin-password
 *  - `idToken` (string): a Google ID token — sent as x-id-token (server
 *    checks the verified email against the admin allowlist)
 *
 * Returns the usual SWR tuple. `enabled=false` pauses the fetch.
 */
export function useAdminFetch<T>(
  url: string | null,
  credential: { password: string | null } | { idToken: string | null } | string | null,
  options?: {
    refreshInterval?: number;
    enabled?: boolean;
  }
) {
  const enabled = options?.enabled !== false;

  // Normalize the credential into a single string with a prefix.
  let cred: string | null = null;
  if (typeof credential === "string") {
    cred = credential ? `pw:${credential}` : null;
  } else if (credential && "idToken" in credential && credential.idToken) {
    cred = `tok:${credential.idToken}`;
  } else if (credential && "password" in credential && credential.password) {
    cred = `pw:${credential.password}`;
  }

  const key = url && cred && enabled ? ([url, cred] as const) : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    adminFetcher,
    {
      refreshInterval: options?.refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 3000,
      keepPreviousData: true,
    }
  );

  return { data, error, isLoading, isValidating, mutate };
}
