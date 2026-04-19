"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";

// Shared admin-page auth gate.
//
// Every /admin/* page used to inline the same ~50 lines of auth state
// (password prompt + session-storage persistence + Google-token check
// + a login screen). The Phase 4 editor adds four more pages that all
// need the same gate, so we hoist it here.
//
// Usage:
//   const { idToken, password, ready } = useAdminAuth();
//   if (!ready) return <AdminAuthGate />;
//   // …render the page once authenticated
//
// The hook + component are kept in one file so the render-during-login
// path stays co-located with the state that powers it.

export function useAdminAuth() {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const idToken = isAdmin ? getIdToken() : null;

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") : null;
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAdmin && idToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthenticated(true);
    }
  }, [isAdmin, idToken]);

  return {
    idToken,
    password,
    setPassword,
    ready: authenticated,
    setAuthenticated,
  };
}

interface GateProps {
  password: string;
  setPassword: (pw: string) => void;
  setAuthenticated: (v: boolean) => void;
  /**
   * URL to ping with the password to validate it. Any endpoint that
   * requires admin auth works — pick one cheap & page-relevant for
   * nicer 401-in-console attribution.
   */
  probeUrl?: string;
}

export default function AdminAuthGate({
  password,
  setPassword,
  setAuthenticated,
  probeUrl = "/api/admin/audit?limit=1",
}: GateProps) {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  async function login() {
    setAuthError("");
    setAuthLoading(true);
    const res = await fetch(probeUrl, {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", password);
    } else {
      setAuthError("Wrong password.");
    }
    setAuthLoading(false);
  }

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />
      <div className="min-h-screen flex items-center justify-center px-6">
        <div
          className="w-full max-w-sm rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #0F0F1A, #0A0A12)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="text-3xl mb-3">🛡️</div>
          <h1 className="text-xl font-bold mb-1">Admin access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") login();
            }}
            placeholder="Admin password"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 mb-3 mt-4"
          />
          {authError && (
            <p className="text-[12px] text-red-400 mb-3">{authError}</p>
          )}
          <button
            onClick={login}
            disabled={authLoading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50"
          >
            {authLoading ? "Checking…" : "Continue"}
          </button>
        </div>
      </div>
    </main>
  );
}

/**
 * Helper for writing JSON to admin endpoints with the right header.
 * Returns the parsed JSON (or throws with a useful message on error).
 */
export async function adminWrite<T = unknown>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  credential: { idToken: string | null; password: string },
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (credential.idToken) headers["x-id-token"] = credential.idToken;
  else if (credential.password) headers["x-admin-password"] = credential.password;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (json && typeof json === "object" && "error" in json
        ? String((json as { error: string }).error)
        : null) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}
