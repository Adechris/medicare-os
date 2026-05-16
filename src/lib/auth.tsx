import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "pharmacist" | "cashier" | "inventory_manager";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "medicare_auth";

// Mock users
const MOCK_USERS: Array<AuthUser & { password: string }> = [
  { id: "u1", name: "Dr. Amara Okafor", email: "admin@medicare.ng", role: "admin", password: "admin123" },
  { id: "u2", name: "Tunde Adeyemi", email: "pharmacist@medicare.ng", role: "pharmacist", password: "pharma123" },
  { id: "u3", name: "Chioma Eze", email: "cashier@medicare.ng", role: "cashier", password: "cashier123" },
  { id: "u4", name: "Bola Ahmed", email: "inventory@medicare.ng", role: "inventory_manager", password: "inventory123" },
];

function encodeMockJwt(user: AuthUser): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: user.id, name: user.name, email: user.email, role: user.role, iat: Date.now() }));
  return `${header}.${payload}.mock`;
}

export function decodeJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.sub, name: payload.name, email: payload.email, role: payload.role };
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(KEY);
    if (stored) {
      const decoded = decodeJwt(stored);
      if (decoded) { setUser(decoded); setToken(stored); }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 600));
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error("Invalid email or password");
    const { password: _pw, ...u } = found;
    const tok = encodeMockJwt(u);
    window.localStorage.setItem(KEY, tok);
    setUser(u); setToken(tok);
    return u;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setUser(null); setToken(null);
  }, []);

  return <Ctx.Provider value={{ user, token, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// ── Role / permission helpers ─────────────────────────────────────────────
export type PageKey =
  | "dashboard" | "medicines" | "inventory" | "prescriptions" | "expiry"
  | "pos" | "transactions" | "customers"
  | "expenses" | "reports"
  | "suppliers" | "staff" | "attendance"
  | "settings";

export const ROLE_ACCESS: Record<Role, PageKey[]> = {
  admin: ["dashboard","medicines","inventory","prescriptions","expiry","pos","transactions","customers","expenses","reports","suppliers","staff","attendance","settings"],
  pharmacist: ["dashboard","medicines","inventory","pos","prescriptions","expiry","customers","transactions"],
  cashier: ["dashboard","pos","transactions","customers"],
  inventory_manager: ["dashboard","medicines","inventory","suppliers","expiry","reports"],
};

export const ROLE_META: Record<Role, { label: string; color: string; dot: string }> = {
  admin:             { label: "Admin",             color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300", dot: "bg-red-500" },
  pharmacist:        { label: "Pharmacist",        color: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300", dot: "bg-violet-500" },
  cashier:           { label: "Cashier",           color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300", dot: "bg-amber-500" },
  inventory_manager: { label: "Inventory Manager", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", dot: "bg-emerald-500" },
};

export function canAccess(role: Role | undefined, page: PageKey) {
  if (!role) return false;
  return ROLE_ACCESS[role].includes(page);
}
