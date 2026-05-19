import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Loader2, Mail, Lock as LockIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@medicare.ng");
  const [password, setPassword] = useState("admin123");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: "/dashboard" });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { label: "Admin", email: "admin@medicare.ng", pw: "admin123" },
    { label: "Pharmacist", email: "pharmacist@medicare.ng", pw: "pharma123" },
    { label: "Cashier", email: "cashier@medicare.ng", pw: "cashier123" },
    { label: "Inventory", email: "inventory@medicare.ng", pw: "inventory123" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#2B7FFF] via-[#1A5FCC] to-[#0D1B2A]">
      <div className="absolute inset-0 opacity-20 pointer-events-none [background:radial-gradient(circle_at_top_right,white,transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white text-primary font-display font-bold text-2xl shadow-lg">
            M+
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-white">MediCare Pharmacy</h1>
          <p className="text-sm text-white/80 mt-1">Smart Pharmacy. Better Care.</p>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-card-lg p-6 md:p-7">
          <h2 className="font-display text-lg font-bold">Sign in</h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 h-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary hover:bg-primary-dark text-primary-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3 w-3" /> Demo accounts
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {demoUsers.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.pw);
                  }}
                  className="text-left rounded-md border border-border bg-surface-grey hover:border-primary/40 hover:bg-accent px-2.5 py-1.5"
                >
                  <div className="text-xs font-semibold">{d.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{d.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/70">
          © {new Date().getFullYear()} MediCare Pharmacy. All rights reserved.
        </p>
      </div>
    </div>
  );
}
