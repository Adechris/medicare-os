import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl bg-card border border-border shadow-card", className)}>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, actions }:{ title:string; description?:string; actions?:ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mb-5">
      <div className="min-w-0">
        <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="sm:ml-auto flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ children, tone="default", className }: { children: ReactNode; tone?: "default"|"success"|"warning"|"danger"|"info"|"violet"|"amber"|"slate"; className?: string }) {
  const tones: Record<string,string> = {
    default: "bg-muted text-foreground",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tones[tone], className)}>{children}</span>;
}

export function SkeletonTable({ rows=6, cols=6 }:{ rows?:number; cols?:number }) {
  return (
    <div className="space-y-2">
      {Array.from({length:rows}).map((_,i)=>(
        <div key={i} className="grid gap-3 px-4 py-3 rounded-lg bg-muted/40 animate-pulse" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`}}>
          {Array.from({length:cols}).map((_,j)=>(
            <div key={j} className="h-3 rounded bg-muted"/>
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon:Icon, title, description, action }:{
  icon: React.ComponentType<{className?:string}>; title:string; description?:string; action?:ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon className="h-8 w-8"/>
      </div>
      <h3 className="font-display font-semibold text-base">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Button({ variant="primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"ghost"|"danger"|"outline" }) {
  const v: Record<string,string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-dark",
    secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
    ghost: "hover:bg-accent text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
    outline: "border border-border bg-background hover:bg-accent text-foreground",
  };
  return <button {...props} className={cn("inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 h-9 text-sm font-semibold transition-colors disabled:opacity-50", v[variant], className)} />;
}

export function StockBar({ stock, reorder }:{ stock:number; reorder:number }) {
  const max = Math.max(reorder*3, stock, 1);
  const pct = Math.min(100, (stock/max)*100);
  const color = stock===0 ? "bg-destructive" : stock<=reorder ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%`}}/>
    </div>
  );
}
