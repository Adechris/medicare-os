import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Pill, Boxes, ScrollText, AlertTriangle, ShoppingCart,
  CreditCard, Users, Wallet, BarChart3, Truck, UserCog, Clock, Settings,
  ChevronLeft, ChevronRight, LogOut, Menu, X, Lock, Bell, Moon, Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, canAccess, ROLE_META, type PageKey } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem { key: PageKey; label: string; icon: React.ComponentType<{ className?: string }>; to: string; }

const SECTIONS: { title: string; items: NavItem[] }[] = [
  { title: "Overview", items: [
    { key:"dashboard", label:"Dashboard", icon:LayoutDashboard, to:"/dashboard" },
  ]},
  { title: "Pharmacy", items: [
    { key:"medicines", label:"Medicines", icon:Pill, to:"/medicines" },
    { key:"inventory", label:"Inventory", icon:Boxes, to:"/inventory" },
    { key:"prescriptions", label:"Prescriptions", icon:ScrollText, to:"/prescriptions" },
    { key:"expiry", label:"Expiry Alerts", icon:AlertTriangle, to:"/expiry" },
  ]},
  { title: "Sales", items: [
    { key:"pos", label:"POS", icon:ShoppingCart, to:"/pos" },
    { key:"transactions", label:"Transactions", icon:CreditCard, to:"/transactions" },
    { key:"customers", label:"Customers", icon:Users, to:"/customers" },
  ]},
  { title: "Finance", items: [
    { key:"expenses", label:"Expenses", icon:Wallet, to:"/expenses" },
    { key:"reports", label:"Reports", icon:BarChart3, to:"/reports" },
  ]},
  { title: "Operations", items: [
    { key:"suppliers", label:"Suppliers", icon:Truck, to:"/suppliers" },
    { key:"staff", label:"Staff Management", icon:UserCog, to:"/staff" },
    { key:"attendance", label:"Attendance", icon:Clock, to:"/attendance" },
  ]},
  { title: "System", items: [
    { key:"settings", label:"Settings", icon:Settings, to:"/settings" },
  ]},
];

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }:{
  collapsed: boolean; setCollapsed: (v:boolean)=>void;
  mobileOpen: boolean; setMobileOpen: (v:boolean)=>void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const role = user?.role;
  const meta = role ? ROLE_META[role] : null;

  const content = (
    <div className={cn(
      "flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200",
      collapsed ? "w-[76px]" : "w-[260px]",
    )}>
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold">M+</div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display font-bold leading-tight">MediCare</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Pharmacy OS</div>
          </div>
        )}
        <button
          onClick={()=>setCollapsed(!collapsed)}
          className="ml-auto hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-sidebar-border bg-background hover:bg-accent text-muted-foreground"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5"/> : <ChevronLeft className="h-3.5 w-3.5"/>}
        </button>
        <button
          onClick={()=>setMobileOpen(false)}
          className="ml-auto md:hidden h-7 w-7 inline-flex items-center justify-center rounded-md border border-sidebar-border"
          aria-label="Close menu"
        ><X className="h-4 w-4"/></button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {SECTIONS.map(section => (
          <div key={section.title} className="mt-3">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const allowed = canAccess(role, item.key);
                const active = loc.pathname === item.to || loc.pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                const inner = (
                  <div className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active && allowed && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
                    !active && allowed && "hover:bg-sidebar-accent/60",
                    !allowed && "text-muted-foreground/50 cursor-not-allowed",
                  )}>
                    {active && allowed && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary"/>}
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", active && allowed && "text-primary")}/>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && !allowed && <Lock className="ml-auto h-3.5 w-3.5 opacity-60"/>}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full ml-2 z-50 hidden group-hover:flex whitespace-nowrap rounded-md bg-foreground text-background text-xs px-2 py-1 shadow-lg">
                        {item.label}
                      </span>
                    )}
                  </div>
                );
                return (
                  <li key={item.key}>
                    {allowed
                      ? <Link to={item.to} onClick={()=>setMobileOpen(false)}>{inner}</Link>
                      : <div title="No access">{inner}</div>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {user.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{user.name}</div>
                {meta && <span className={cn("inline-flex items-center gap-1 mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.color)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)}/>{meta.label}
                </span>}
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => { logout(); navigate({ to: "/login" }); }}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
                aria-label="Log out"
              ><LogOut className="h-4 w-4"/></button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block sticky top-0 h-screen z-30">{content}</aside>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setMobileOpen(false)}/>
          <div className="relative">{content}</div>
        </div>
      )}
    </>
  );
}

export function TopBar({ title, onOpenMenu }:{ title:string; onOpenMenu:()=>void }) {
  const { user } = useAuth();
  const meta = user ? ROLE_META[user.role] : null;
  const [dark, setDark] = useState(false);
  useEffect(()=>{ document.documentElement.classList.toggle("dark", dark); }, [dark]);

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 px-4 md:px-6 h-14">
        <button onClick={onOpenMenu} className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md border border-border">
          <Menu className="h-4 w-4"/>
        </button>
        <h1 className="font-display text-base md:text-lg font-bold truncate">{title}</h1>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="relative h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent" aria-label="Notifications">
            <Bell className="h-4 w-4"/>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-expiry-critical"/>
          </button>
          <button onClick={()=>setDark(!dark)} className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent" aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
          </button>
          {user && (
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-1 ml-1 border-l border-border">
              <div className="text-right leading-tight">
                <div className="text-xs font-semibold">{user.name}</div>
                {meta && <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[10px] font-semibold", meta.color)}>
                  {meta.label}
                </span>}
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground flex items-center justify-center font-semibold text-xs">
                {user.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
