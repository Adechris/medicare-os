import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { formatNaira, formatDateShort, daysUntil } from "@/lib/format";
import { AlertOctagon, AlertTriangle, ShieldCheck, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/expiry")({ component: ExpiryPage });

function ExpiryPage() {
  const meds = useQuery({ queryKey:["medicines"], queryFn: api.listMedicines });
  const list = (meds.data||[]).map(m=>({ ...m, days: daysUntil(m.expiryDate) })).sort((a,b)=>a.days-b.days);

  const expired = list.filter(m=>m.days<=0);
  const w1 = list.filter(m=>m.days>0 && m.days<=7);
  const w30 = list.filter(m=>m.days>7 && m.days<=30);
  const w90 = list.filter(m=>m.days>30 && m.days<=90);
  const valueExpiring = list.filter(m=>m.days<=30).reduce((s,m)=>s+m.stock*m.buyingPrice, 0);

  return (
    <div>
      <PageHeader title="Expiry Alerts" description="Stay ahead of stock that's about to expire"
        actions={<Button variant="outline"><Download className="h-4 w-4"/> Export PDF</Button>}/>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <SummaryCard count={expired.length} label="Expired" tone="critical" icon={AlertOctagon}/>
        <SummaryCard count={w1.length} label="In 1–7 days" tone="urgent" icon={AlertTriangle}/>
        <SummaryCard count={w30.length} label="In 8–30 days" tone="warning" icon={AlertTriangle}/>
        <SummaryCard count={w90.length} label="In 31–90 days" tone="ok" icon={ShieldCheck}/>
      </div>

      <Card className="p-4 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-display font-bold text-sm">Expiring Stock</h3>
          <div className="ml-auto text-xs text-muted-foreground">Total value at risk: <span className="font-semibold text-foreground">{formatNaira(valueExpiring)}</span></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="font-semibold py-2 pr-3">Medicine</th>
                <th className="font-semibold py-2 pr-3">Batch</th>
                <th className="font-semibold py-2 pr-3">Stock</th>
                <th className="font-semibold py-2 pr-3">Expiry</th>
                <th className="font-semibold py-2 pr-3">Countdown</th>
                <th className="font-semibold py-2 pr-3 text-right">Value</th>
                <th className="font-semibold py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.filter(m=>m.days<=90).map(m=>{
                const critical = m.days<=7;
                const warn = m.days<=30;
                return (
                  <tr key={m.id} className={cn(
                    "border-b border-border last:border-0",
                    critical ? "bg-red-50/60 dark:bg-red-500/5" : warn ? "bg-amber-50/60 dark:bg-amber-500/5" : "",
                  )}>
                    <td className="py-2.5 pr-3"><div className="font-semibold">{m.name}</div><div className="text-xs text-muted-foreground">{m.category}</div></td>
                    <td className="py-2.5 pr-3 font-mono text-xs">{m.batch}</td>
                    <td className="py-2.5 pr-3">{m.stock}</td>
                    <td className="py-2.5 pr-3">{formatDateShort(m.expiryDate)}</td>
                    <td className="py-2.5 pr-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        critical ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 animate-pulse-danger" :
                        warn ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      )}>
                        {m.days<=0 ? `Expired ${-m.days}d ago` : `Expires in ${m.days}d`}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right">{formatNaira(m.stock*m.buyingPrice)}</td>
                    <td className="py-2.5"><Button variant="outline" className="h-7 px-2 text-xs">Dispose</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ count, label, tone, icon:Icon }:{ count:number; label:string; tone:"critical"|"urgent"|"warning"|"ok"; icon:React.ComponentType<{className?:string}> }) {
  const map = {
    critical: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600", ring: "ring-red-200" },
    urgent: { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600", ring: "ring-orange-200" },
    warning: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600", ring: "ring-amber-200" },
    ok: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-200" },
  }[tone];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", map.bg, map.text)}><Icon className="h-5 w-5"/></div>
        <div>
          <div className="font-display text-2xl font-bold">{count}</div>
          <div className="text-xs text-muted-foreground -mt-0.5">{label}</div>
        </div>
      </div>
    </Card>
  );
}
