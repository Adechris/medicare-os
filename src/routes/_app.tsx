import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/AppShell";
import { useAuth, canAccess, type PageKey } from "@/lib/auth";

const PATH_TO_KEY: Record<string, PageKey> = {
  "/dashboard": "dashboard",
  "/medicines": "medicines",
  "/inventory": "inventory",
  "/prescriptions": "prescriptions",
  "/expiry": "expiry",
  "/pos": "pos",
  "/transactions": "transactions",
  "/customers": "customers",
  "/expenses": "expenses",
  "/reports": "reports",
  "/suppliers": "suppliers",
  "/staff": "staff",
  "/attendance": "attendance",
  "/settings": "settings",
};

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/medicines": "Medicines",
  "/inventory": "Inventory",
  "/prescriptions": "Prescriptions",
  "/expiry": "Expiry Alerts",
  "/pos": "Point of Sale",
  "/transactions": "Transactions",
  "/customers": "Customers",
  "/expenses": "Expenses",
  "/reports": "Reports",
  "/suppliers": "Suppliers",
  "/staff": "Staff Management",
  "/attendance": "Attendance",
  "/settings": "Settings",
};

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const key =
      PATH_TO_KEY[loc.pathname] ||
      (Object.entries(PATH_TO_KEY).find(([p]) => loc.pathname.startsWith(p + "/"))?.[1] as
        | PageKey
        | undefined);
    if (key && !canAccess(user.role, key)) {
      navigate({ to: "/access-denied" });
    }
  }, [user, loading, loc.pathname, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const title = TITLES[loc.pathname] || "MediCare";

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar title={title} onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 md:px-6 py-5 md:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
