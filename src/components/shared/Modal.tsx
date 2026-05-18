import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({ open, onClose, title, description, children, footer, size="md" }:{
  open: boolean; onClose: () => void; title: string; description?: string;
  children: ReactNode; footer?: ReactNode; size?: "sm"|"md"|"lg"|"xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm:"max-w-sm", md:"max-w-md", lg:"max-w-lg", xl:"max-w-2xl" };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className={cn("bg-card rounded-2xl w-full my-8 shadow-xl", sizes[size])} onClick={e=>e.stopPropagation()}>
        <div className="flex items-start gap-3 p-5 border-b border-border">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border flex justify-end gap-2 bg-muted/30 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint, required }:{ label:string; children:ReactNode; hint?:string; required?:boolean }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-foreground mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

export const inputCls = "w-full h-9 px-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary";
export const textareaCls = "w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary";
