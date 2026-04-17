"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // ID token in a ref — not state — so it doesn't trigger re-renders and
  // never ends up in localStorage/sessionStorage.
  const idTokenRef = useRef<string | null>(null);

  // Restore user (but not the token) on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {}
  }, []);

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
