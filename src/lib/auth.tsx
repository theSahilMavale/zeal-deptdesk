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
  login: (email: string, _password: string, role: Role) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "deptdesk.user";

const DEMO_USERS: Record<Role, AuthUser> = {
  admin: {
    id: "u-admin",
    name: "Dr. Anil Kulkarni",
    email: "admin@zealpoly.edu",
    role: "admin",
    department: "Administration",
  },
  faculty: {
    id: "u-fac",
    name: "Prof. Sneha Deshpande",
    email: "sneha@zealpoly.edu",
    role: "faculty",
    department: "Computer Engineering",
  },
  student: {
    id: "u-stu",
    name: "Rohan Patil",
    email: "rohan@zealpoly.edu",
    role: "student",
    department: "Computer Engineering",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* noop */
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string, role: Role) => {
    const base = DEMO_USERS[role];
    const u: AuthUser = { ...base, email: email || base.email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return u;
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
