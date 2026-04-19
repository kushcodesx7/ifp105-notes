"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import { decodeJwt } from "@/lib/jwt";

// Shared admin-page auth gate.
//
// Every /admin/* page used to inline the same ~50 lines of auth state
// (password prompt + session-storage persistence + Google-token check
// + a login screen). Phase 4 hoisted that into this hook + component.
//
// Usage:
//   const { idToken, password, ready } = useAdminAuth();
//   if (!ready) return <AdminAuthGate />;
//   // …render the page once authenticated
//
// The legacy shared-password path was removed (see PR description).
// Google sign-in is the only way in. The hook still returns a
// `password: ""` field for back-compat with the ~10 admin pages that
// destructure it — they pass it to adminWrite which now ignores it.

export function useAdminAuth() {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const idToken = isAdmin ? getIdToken() : null;

  return {
    idToken,
    // Legacy fields kept so existing call sites compile unchanged.
    // Both are now no-ops; admin auth is Google-only.
    password: "",
    setPassword: (_pw: string) => {
      void _pw;
    },
    ready: !!(isAdmin && idToken),
    setAuthenticated: (_v: boolean) => {
      void _v;
    },
  };
}

interface GateProps {
  // Kept for back-compat with the ~10 call sites that pass them.
  // Both are ignored now — the gate only cares about Google sign-in.
  password?: string;
  setPassword?: (pw: string) => void;
  setAuthenticated?: (v: boolean) => void;
  /**
   * Probe URL was used to validate the password against an admin
   * endpoint. Now ignored — Google ID token verification happens at
   * every API call, no probe needed.
   */
  probeUrl?: string;
}

export default function AdminAuthGate(_props: GateProps) {
  void _props; // back-compat shim; no longer used
  const { user, login, setIdToken } = useAuth();
  const [authError, setAuthError] = useState("");

  // Google sign-in handler — same shape as the one in Navbar but
  // self-contained because the auth gate may render before the
  // Navbar exists in the tree (some admin layouts skip Navbar).
  function handleGoogleSuccess(response: { credential?: string }) {
    if (!response.credential) {
      setAuthError("Sign-in returned no token. Try again.");
      return;
    }
    const payload = decodeJwt(response.credential);
    if (!payload?.email) {
      setAuthError("Sign-in returned no email. Try again.");
      return;
    }
    if (!isAdminEmail(payload.email)) {
      setAuthError(
        `${payload.email} isn't on the admin list. Sign in with the admin account.`
      );
      return;
    }
    setIdToken(response.credential);
    login({
      ...(user || {}),
      name: payload.name || payload.email,
      email: payload.email,
      photo: payload.picture,
    });
  }

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />
      <div className="min-h-screen flex items-center justify-center px-6">
        <div
          className="w-full max-w-sm rounded-2xl p-6 text-center"
          style={{
            background: "linear-gradient(135deg, #0F0F1A, #0A0A12)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="text-3xl mb-3" aria-hidden="true">
            🛡️
          </div>
          <h1 className="text-xl font-bold mb-1">Admin access</h1>
          <p className="text-[12px] text-zinc-500 mb-5 leading-relaxed">
            Sign in with the Google account on the admin list.
          </p>

          <div className="flex justify-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setAuthError("Google sign-in failed. Try once more.")
              }
              theme="filled_black"
              size="large"
              shape="pill"
              text="signin_with"
            />
          </div>

          {authError && (
            <p className="text-[12px] text-red-400 mt-2">{authError}</p>
          )}

          <p className="text-[10px] text-zinc-600 mt-5 leading-relaxed">
            The shared-password admin login was removed. Every admin
            action is now attributed to a real email in the audit log.
          </p>
        </div>
      </div>
    </main>
  );
}

/**
 * Helper for writing JSON to admin endpoints. Google ID token only —
 * the password header is no longer accepted server-side. Kept the
 * `credential.password` field in the type signature so call sites
 * don't all need updating; it's just ignored.
 */
export async function adminWrite<T = unknown>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  credential: { idToken: string | null; password?: string },
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (credential.idToken) headers["x-id-token"] = credential.idToken;
  // password field intentionally ignored — see comment above.

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
