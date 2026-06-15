import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type UserRole = "super_admin" | "admin" | "gestor" | "analyst" | "client";
export type UserPlan = "basic" | "premium" | "enterprise";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  tenantId?: string;
  tenantSlug?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  plan?: UserPlan;
  phone?: string;
}

const STORAGE_KEY = "nexora_auth";

function loadStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, tokens: null, isAuthenticated: false, isLoading: false };
    const data = JSON.parse(raw) as { user: AuthUser; tokens: AuthTokens };
    if (!data.tokens?.accessToken) return { user: null, tokens: null, isAuthenticated: false, isLoading: false };
    return { user: data.user, tokens: data.tokens, isAuthenticated: true, isLoading: false };
  } catch {
    return { user: null, tokens: null, isAuthenticated: false, isLoading: false };
  }
}

function saveAuth(user: AuthUser, tokens: AuthTokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({ ...loadStoredAuth(), isLoading: true }));

  useEffect(() => {
    const stored = loadStoredAuth();
    if (stored.isAuthenticated && stored.tokens) {
      setState({ ...stored, isLoading: false });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error ?? "Falha ao fazer login." };
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        plan: data.user.plan,
        tenantId: data.tenant?.id,
        tenantSlug: data.tenant?.slug,
      };

      saveAuth(user, data.tokens);
      setState({ user, tokens: data.tokens, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch {
      return { success: false, error: "Erro de conexão. Verifique sua internet." };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        const msg = json.error ?? (json.fields ? Object.values(json.fields).flat().join(", ") : "Falha no cadastro.");
        return { success: false, error: msg };
      }

      const user: AuthUser = {
        id: json.user.id,
        email: json.user.email,
        name: json.user.name,
        role: json.user.role,
        plan: json.user.plan,
        tenantId: json.tenant?.id,
        tenantSlug: json.tenant?.slug,
      };

      saveAuth(user, json.tokens);
      setState({ user, tokens: json.tokens, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch {
      return { success: false, error: "Erro de conexão. Verifique sua internet." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.tokens?.accessToken) {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.tokens.accessToken}`,
          },
          body: JSON.stringify({ refreshToken: state.tokens.refreshToken }),
        });
      }
    } catch { /* ignore */ } finally {
      clearAuth();
      setState({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
    }
  }, [state.tokens]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!state.tokens?.refreshToken) return false;
    try {
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: state.tokens.refreshToken }),
      });
      if (!res.ok) {
        clearAuth();
        setState({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
        return false;
      }
      const { tokens } = await res.json();
      if (state.user) {
        saveAuth(state.user, tokens);
        setState((s) => ({ ...s, tokens }));
      }
      return true;
    } catch {
      return false;
    }
  }, [state.tokens, state.user]);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setState((s) => {
      if (!s.user) return s;
      const updated = { ...s.user, ...updates };
      if (s.tokens) saveAuth(updated, s.tokens);
      return { ...s, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshSession, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function useRequireAuth(): AuthUser {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) throw new Error("User not authenticated");
  return user;
}

export function hasPermission(userRole: UserRole, required: UserRole): boolean {
  const order: Record<UserRole, number> = { super_admin: 5, admin: 4, gestor: 3, analyst: 2, client: 1 };
  return order[userRole] >= order[required];
}
