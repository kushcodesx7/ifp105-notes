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
  // Raw Google ID token (JWT). Kept in memory only — never persisted to
  // localStorage or cookies. Lost on page reload (user must sign in again
  // to perform authenticated writes).
  getIdToken: () => string | null;
  setIdToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoggedIn: false,
  getIdToken: () => null,
  setIdToken: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const SESSION_KEY = "ifp105_user";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy init avoids setState-in-effect. SSR still sees null on the
  // server pass; the client hydration runs this initializer fresh and
  // picks up the persisted session — identical outcome to the old
  // useEffect+setUser, without the cascading render.
  const [user, setUser] = useState<User | null>(readSavedUser);
  // ID token in a ref — not state — so it doesn't trigger re-renders and
  // never ends up in localStorage/sessionStorage.
  const idTokenRef = useRef<string | null>(null);

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
    } catch {}
  }, []);

  const getIdToken = useCallback(() => idTokenRef.current, []);
  const setIdToken = useCallback((token: string | null) => {
    idTokenRef.current = token;
  }, []);

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
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}
