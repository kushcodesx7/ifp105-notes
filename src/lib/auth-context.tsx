"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface User {
  name: string;
  email: string;
  photo?: string;
  enrollmentNo?: string;
  batchId?: string;
  section?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
  // Raw Google ID token OR password-session JWT. Google tokens are kept
  // in memory only (never persisted) since they carry standard OAuth
  // refresh semantics. Password-session tokens are HMAC-signed by our
  // own secret and are persisted to localStorage so the lab-login flow
  // survives page reloads — that's the entire UX win.
  getIdToken: () => string | null;
  setIdToken: (token: string | null) => void;
  /** Quick-login path. Calls /api/auth/login-password, stores the
   *  returned password-session JWT, and sets the user. Returns
   *  { ok: true } on success; { ok: false, error } on auth failure. */
  loginWithPassword: (
    enrollmentNo: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoggedIn: false,
  getIdToken: () => null,
  setIdToken: () => {},
  loginWithPassword: async () => ({ ok: false, error: "auth not initialized" }),
});

export function useAuth() {
  return useContext(AuthContext);
}

const SESSION_KEY = "ifp105_user";
// Persisted password-session token. Lives in localStorage SO the lab
// login survives reloads. Cleared on logout.
const PWD_TOKEN_KEY = "ifp105_pwd_token";
// Persisted Google ID token. Survives navigation / tab reload within
// the token's natural ~1-hour lifetime, so an admin mid-session
// doesn't get a re-sign-in prompt every time the page refreshes or
// they open a second tab. We DECODE the JWT to read the `exp` claim
// and drop it proactively once expired — so we never send a stale
// token to the server.
const GOOGLE_TOKEN_KEY = "ifp105_google_id_token";

function decodeExpMs(jwt: string): number | null {
  // Minimal JWT payload parse — same technique the rest of the app
  // uses (decodeJwt). Returns expiry in ms since epoch, or null on
  // any failure so callers can assume the token is invalid.
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;
    const padded = payload + "===".slice((payload.length + 3) % 4);
    const json = JSON.parse(
      atob(padded.replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (typeof json.exp !== "number") return null;
    return json.exp * 1000;
  } catch {
    return null;
  }
}

// Read the saved user from localStorage, SSR-safe. Returns null on the
// server and on any parse/read failure. Used as the lazy initializer for
// `useState` so we avoid the classic setState-in-effect pattern that
// React 19's purity lint flags.
function readSavedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
}

function readSavedPwdToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PWD_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Return a still-valid saved Google ID token, or null. Used at mount
 * time and whenever the caller needs the token — expiry is checked on
 * every read so a stale token never escapes this boundary.
 */
function readSavedGoogleToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = window.localStorage.getItem(GOOGLE_TOKEN_KEY);
    if (!token) return null;
    const expMs = decodeExpMs(token);
    if (expMs == null) return null;
    // Small grace window (30 s) so we don't send a token that's about
    // to expire server-side.
    if (Date.now() >= expMs - 30_000) {
      try {
        window.localStorage.removeItem(GOOGLE_TOKEN_KEY);
      } catch {}
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy init avoids setState-in-effect. SSR still sees null on the
  // server pass; the client hydration runs this initializer fresh and
  // picks up the persisted session — identical outcome to the old
  // useEffect+setUser, without the cascading render.
  const [user, setUser] = useState<User | null>(readSavedUser);
  // ID token in a ref. Initialised from the persisted password-session
  // token (if any) OR the persisted Google ID token (if still valid).
  // Password-session tokens are our own 30-day HS256 JWTs; Google
  // tokens are ~1-hour Google-issued JWTs that we now also persist
  // so an admin doesn't get logged out across tab reloads / page
  // navigations. readSavedGoogleToken already expiry-checks the
  // saved token, so a stale one never surfaces here.
  const idTokenRef = useRef<string | null>(
    readSavedPwdToken() || readSavedGoogleToken()
  );

  const login = useCallback((u: User) => {
    setUser(u);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    idTokenRef.current = null;
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PWD_TOKEN_KEY);
      localStorage.removeItem(GOOGLE_TOKEN_KEY);
    } catch {}
  }, []);

  /**
   * Read the id token. If the in-memory ref has been populated this
   * session we return it; otherwise we re-check the persisted Google
   * token (which expiry-validates on read) so a page-reload-mid-
   * session finds the still-valid token instead of popping a re-auth
   * prompt for no reason.
   */
  const getIdToken = useCallback(() => {
    if (idTokenRef.current) {
      // If what we're holding IS a Google token, make sure it's still
      // valid. Password-session tokens (which start with a distinct
      // header-payload shape) fall through without an expiry check —
      // server verifies them; 30-day lifetime is long enough that we
      // don't churn per-read.
      const t = idTokenRef.current;
      const expMs = decodeExpMs(t);
      if (expMs != null && Date.now() >= expMs - 30_000) {
        // Expired in memory — drop + try the persisted copy, which
        // will also fail (same token) and return null. That clears
        // the state so adminWrite surfaces a clean re-auth.
        idTokenRef.current = null;
        try {
          localStorage.removeItem(GOOGLE_TOKEN_KEY);
        } catch {}
      } else {
        return t;
      }
    }
    const saved = readSavedGoogleToken();
    if (saved) idTokenRef.current = saved;
    return idTokenRef.current;
  }, []);

  const setIdToken = useCallback((token: string | null) => {
    idTokenRef.current = token;
    // Persist Google ID tokens (JWTs with an `exp` claim) so a page
    // reload doesn't drop the admin's session. Non-JWT tokens and
    // null clears are handled by the else branch.
    try {
      if (token && decodeExpMs(token) != null) {
        localStorage.setItem(GOOGLE_TOKEN_KEY, token);
      } else if (!token) {
        localStorage.removeItem(GOOGLE_TOKEN_KEY);
      }
    } catch {}
  }, []);

  const loginWithPassword = useCallback(
    async (
      enrollmentNo: string,
      password: string
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      try {
        const res = await fetch("/api/auth/login-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentNo, password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          return {
            ok: false,
            error:
              (json && typeof json === "object" && "error" in json
                ? String((json as { error: string }).error)
                : null) || `Login failed (${res.status})`,
          };
        }
        const token: string = json.token;
        const u: User = {
          name: json.user?.name || enrollmentNo,
          email: json.user?.email || "",
          enrollmentNo: json.user?.enrollmentNo || enrollmentNo,
        };
        // Persist the password-session token so reload keeps the user
        // logged in. Google tokens never go through this path.
        try {
          localStorage.setItem(PWD_TOKEN_KEY, token);
          localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        } catch {}
        idTokenRef.current = token;
        setUser(u);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message || "Login failed" };
      }
    },
    []
  );

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId} locale="en">
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
          isLoggedIn: !!user,
          getIdToken,
          setIdToken,
          loginWithPassword,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}
