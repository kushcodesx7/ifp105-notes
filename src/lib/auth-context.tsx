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
// login survives reloads. Cleared on logout. Never used to hold a
// Google ID token (those stay in-memory).
const PWD_TOKEN_KEY = "ifp105_pwd_token";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy init avoids setState-in-effect. SSR still sees null on the
  // server pass; the client hydration runs this initializer fresh and
  // picks up the persisted session — identical outcome to the old
  // useEffect+setUser, without the cascading render.
  const [user, setUser] = useState<User | null>(readSavedUser);
  // ID token in a ref. Initialised from the persisted password-session
  // token (if any). Google tokens overwrite this on sign-in but are
  // never written back to localStorage — only the password-session
  // tokens persist.
  const idTokenRef = useRef<string | null>(readSavedPwdToken());

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
    } catch {}
  }, []);

  const getIdToken = useCallback(() => idTokenRef.current, []);
  const setIdToken = useCallback((token: string | null) => {
    idTokenRef.current = token;
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
