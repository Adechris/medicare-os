import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/lib/auth";
import { Card, PageHeader, Button, Badge, SkeletonTable } from "@/components/shared/Primitives";
import { formatNaira, formatDate } from "@/lib/format";
import { Search, Download, CreditCard, X } from "lucide-react";

export const Route = createFileRoute("/_app/transactions")({ component: TransactionsPage });

function TransactionsPage() {
  const { user } = useAuth();
  const txns = useQuery({ queryKey:["transactions"], queryFn: api.listTransactions });
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("");
  const [openId, setOpenId] = useState<string|null>(null);

  const visible = useMemo(()=>{
    let list = txns.data||[];
    if (user?.role==="cashier") list = list.filter(t=>t.cashier==="Chioma Eze");
    if (q) list = list.filter(t=>`${t.receiptNo} ${t.customerName}`.toLowerCase().includes(q.toLowerCase()));
    if (method) list = list.filter(t=>t.paymentMethod===method);
    return list;
  }, [txns.data, q, method, user]);

  const todayRev = visible.reduce((s,t)=>s+t.total,0);
  const opened = visible.find(t=>t.id===openId);

  return (
    <div>
      <PageHeader title="Transactions" description={user?.role==="cashier"?"Your sales history":"All sales across the pharmacy"}
        actions={<Button variant="outline"><Download className="h-4 w-4"/> Export</Button>}/>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Transactions</div><div className="font-display text-xl font-bold mt-1">{visible.length}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Revenue</div><div className="font-display text-xl font-bold mt-1">{formatNaira(todayRev)}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Cash</div><div className="font-display text-xl font-bold mt-1">{formatNaira(visible.filter(t=>t.paymentMethod==="Cash").reduce((s,t)=>s+t.total,0))}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Card / Transfer</div><div className="font-display text-xl font-bold mt-1">{formatNaira(visible.filter(t=>t.paymentMethod==="Card"||t.paymentMethod==="Transfer").reduce((s,t)=>s+t.total,0))}</div></Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search receipt or customer…" className="w-full pl-9 h-9 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
          </div>
          <select value={method} onChange={e=>setMethod(e.target.value)} className="h-9 px-2 rounded-lg border border-border bg-background text-sm">
            <option value="">All payment methods</option>
            {["Cash","Card","Transfer","Credit"].map(m=><option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {txns.isLoading ? <SkeletonTable cols={7}/> : (
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="font-semibold py-2 pr-3">Receipt</th>
                <th className="font-semibold py-2 pr-3">Date</th>
                <th className="font-semibold py-2 pr-3">Customer</th>
                <th className="font-semibold py-2 pr-3">Cashier</th>
                <th className="font-semibold py-2 pr-3">Items</th>
                <th className="font-semibold py-2 pr-3 text-right">Total</th>
                <th className="font-semibold py-2 pr-3">Method</th>
                <th className="font-semibold py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(t=>(
                <tr key={t.id} onClick={()=>setOpenId(t.id)} className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer">
                  <td className="py-2.5 pr-3 font-mono text-xs">{t.receiptNo}</td>
                  <td className="py-2.5 pr-3 text-xs text-muted-foreground">{formatDate(t.date)}</td>
                  <td className="py-2.5 pr-3">{t.customerName}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{t.cashier}</td>
                  <td className="py-2.5 pr-3">{t.itemsCount}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{formatNaira(t.total)}</td>
                  <td className="py-2.5 pr-3"><Badge tone="info">{t.paymentMethod}</Badge></td>
                  <td className="py-2.5"><Badge tone={t.status==="Completed"?"success":"warning"}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </Card>

      {opened && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setOpenId(null)}>
          <div className="bg-card rounded-2xl max-w-md w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary"/>
              <h3 className="font-display font-bold">{opened.receiptNo}</h3>
              <button onClick={()=>setOpenId(null)} className="ml-auto h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent"><X className="h-4 w-4"/></button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{formatDate(opened.date)} · {opened.cashier}</div>
            <div className="mt-4 divide-y divide-border">
              {opened.items.map((it,i)=>(
                <div key={i} className="py-2 flex justify-between text-sm">
                  <div><div className="font-semibold">{it.name}</div><div className="text-xs text-muted-foreground">{it.qty} × {formatNaira(it.price)}</div></div>
                  <div className="font-semibold">{formatNaira(it.qty*it.price)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatNaira(opened.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>−{formatNaira(opened.discount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span>{formatNaira(opened.vat)}</span></div>
              <div className="flex justify-between font-display font-bold text-base pt-1.5"><span>Total</span><span>{formatNaira(opened.total)}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={()=>window.print()}>Reprint Receipt</Button>
              <Button className="flex-1">Resend</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
