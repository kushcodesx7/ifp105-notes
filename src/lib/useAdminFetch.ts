"use client";

import useSWR from "swr";

// Admin-authenticated fetcher. Key is a tuple so we can include the password
// in the cache key without leaking it into the URL.
async function adminFetcher([url, password]: [string, string]) {
  const res = await fetch(url, {
    headers: { "x-admin-password": password },
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
 * Admin API fetch with SWR. Gives us:
 *  - Deduped in-flight requests (two pages asking for the same data = 1 call)
 *  - Automatic cache across pages (going /admin → /admin/progress reuses cache)
 *  - Revalidate on focus (switch back to tab → fresh data)
 *  - Revalidate on reconnect
 *  - Stale-while-revalidate semantics at the client level
 *
 * Pass `enabled=false` to skip the fetch (e.g. before login).
 */
export function useAdminFetch<T>(
  url: string | null,
  password: string | null,
  options?: {
    refreshInterval?: number;
    enabled?: boolean;
  }
) {
  const enabled = options?.enabled !== false;
  const key = url && password && enabled ? ([url, password] as const) : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    adminFetcher,
    {
      refreshInterval: options?.refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 3000, // 2 identical calls within 3s → 1 network call
      keepPreviousData: true, // Don't wipe UI while revalidating
    }
  );

  return { data, error, isLoading, isValidating, mutate };
}
