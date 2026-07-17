"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

export type AuthUser = {
  id: string;
  role: "customer" | "admin";
  name: string;
  email: string;
  phone: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshSession() {
    try {
      setUser((await apiFetch<{ user: AuthUser }>("/api/auth/session", { cache: "no-store" })).user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    apiFetch<{ user: AuthUser }>("/api/auth/session", { cache: "no-store" })
      .then((payload) => setUser(payload.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    try {
      setUser((await apiFetch<{ user: AuthUser }>("/api/auth/login", {
        method: "POST", body: JSON.stringify({ email, password }),
      })).user);
      return true;
    } catch {
      setUser(null);
      return false;
    }
  }

  async function logout() {
    await apiFetch<{ success: boolean }>("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, refreshSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return context;
}
