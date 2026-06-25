import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/lib/api/services/auth";
import { getAccessToken, clearTokens } from "@/lib/api/client";

export type Role = "admin" | "faculty" | "student";

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(raw: any): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const role: Role = raw.role === "admin" || raw.role === "faculty" || raw.role === "student"
    ? raw.role
    : "student";
  const name =
    raw.name?.toString().trim() ||
    `${raw.first_name ?? ""} ${raw.last_name ?? ""}`.trim() ||
    raw.username ||
    raw.email ||
    "User";
  return {
    id: Number(raw.id),
    username: String(raw.username ?? raw.email ?? ""),
    email: String(raw.email ?? ""),
    name,
    role,
    phone: raw.phone ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authService.me();
      setUser(normalizeUser(me));
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const login = async (identifier: string, password: string) => {
    if (!identifier || !password) {
      throw new Error("Email/username and password are required.");
    }
    const resp = await authService.login(identifier.trim(), password);
    const u = normalizeUser(resp.user);
    if (!u) throw new Error("Login failed.");
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: hydrate }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/**
 * Gate a route subtree to a set of roles.
 */
export function RequireRole({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !roles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
