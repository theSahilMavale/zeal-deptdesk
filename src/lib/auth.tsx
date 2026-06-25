import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "faculty" | "student";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "deptdesk.user";

// Demo account registry. The role is derived from the matched credential
// record — never from a client-supplied dropdown — so a user cannot
// self-elevate to admin by changing form state or localStorage.
interface DemoAccount extends AuthUser {
  password: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "u-admin",
    name: "Dr. Anil Kulkarni",
    email: "admin@zealpoly.edu",
    role: "admin",
    department: "Administration",
    password: "admin@123",
  },
  {
    id: "u-fac",
    name: "Prof. Sneha Deshpande",
    email: "sneha@zealpoly.edu",
    role: "faculty",
    department: "Computer Engineering",
    password: "faculty@123",
  },
  {
    id: "u-stu",
    name: "Rohan Patil",
    email: "rohan@zealpoly.edu",
    role: "student",
    department: "Computer Engineering",
    password: "student@123",
  },
];

const VALID_ROLES: Role[] = ["admin", "faculty", "student"];

function sanitizeStoredUser(raw: string): AuthUser | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser> & { role?: unknown };
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.id !== "string" || typeof parsed.email !== "string") return null;
    // Re-derive the canonical record from the demo registry so that a tampered
    // localStorage role (e.g. user editing JSON to "admin") cannot grant access.
    const canonical = DEMO_ACCOUNTS.find(
      (a) => a.id === parsed.id && a.email.toLowerCase() === parsed.email.toLowerCase(),
    );
    if (!canonical) return null;
    if (!VALID_ROLES.includes(canonical.role)) return null;
    const { password: _pw, ...safe } = canonical;
    void _pw;
    return safe;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const restored = raw ? sanitizeStoredUser(raw) : null;
      if (restored) {
        setUser(restored);
      } else if (raw) {
        // Tampered or stale session — clear it.
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* noop */
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      throw new Error("Email and password are required.");
    }
    const match = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === normalized && a.password === password,
    );
    if (!match) {
      throw new Error("Invalid email or password.");
    }
    const { password: _pw, ...safe } = match;
    void _pw;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    setUser(safe);
    return safe;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
 * Gate a route subtree to a set of roles. Returns the fallback (or null)
 * when the current user is missing or not permitted. The role is read from
 * the in-memory auth context — which is itself derived from the verified
 * demo registry — so editing localStorage cannot bypass this check.
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
