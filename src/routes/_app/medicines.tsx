import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/services/api";
import { CATEGORIES } from "@/mock/data";
import { Card, PageHeader, Button, Badge, SkeletonTable, EmptyState, StockBar } from "@/components/shared/Primitives";
import { AddMedicineDialog } from "@/components/shared/Dialogs";
import { formatNaira, formatDateShort, daysUntil } from "@/lib/format";
import { Plus, Search, Download, Pill, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/medicines")({ component: MedicinesPage });

function MedicinesPage() {
  const meds = useQuery({ queryKey:["medicines"], queryFn: api.listMedicines });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [stockFilter, setStockFilter] = useState<""|"in"|"low"|"out">("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(()=>{
    return (meds.data||[]).filter(m=>{
      if (q && !`${m.name} ${m.generic} ${m.brand}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat && m.category!==cat) return false;
      if (stockFilter==="in" && !(m.stock>m.reorderLevel)) return false;
      if (stockFilter==="low" && !(m.stock>0 && m.stock<=m.reorderLevel)) return false;
      if (stockFilter==="out" && m.stock!==0) return false;
      return true;
    });
  }, [meds.data, q, cat, stockFilter]);

  return (
    <div>
      <PageHeader title="Medicines" description={`${meds.data?.length ?? 0} SKUs in your catalog`}
        actions={<>
          <Button variant="outline" onClick={()=>toast.success("Export started")}><Download className="h-4 w-4"/> Export</Button>
          <Button onClick={()=>setAddOpen(true)}><Plus className="h-4 w-4"/> Add Medicine</Button>
        </>}/>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, generic, brand…"
              className="w-full pl-9 pr-3 h-9 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
          </div>
          <select value={cat} onChange={e=>setCat(e.target.value)} className="h-9 px-2 rounded-lg border border-border bg-background text-sm">
            <option value="">All categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={stockFilter} onChange={e=>setStockFilter(e.target.value as any)} className="h-9 px-2 rounded-lg border border-border bg-background text-sm">
            <option value="">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {meds.isLoading ? <SkeletonTable cols={8} rows={6}/> :
           filtered.length===0 ? <EmptyState icon={Pill} title="No medicines match" description="Try adjusting filters or add a new medicine." action={<Button onClick={()=>setAddOpen(true)}><Plus className="h-4 w-4"/> Add Medicine</Button>}/> :
           (<table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="font-semibold py-2 pr-3">Medicine</th>
                <th className="font-semibold py-2 pr-3">Category</th>
                <th className="font-semibold py-2 pr-3">Brand</th>
                <th className="font-semibold py-2 pr-3 text-right">Buying</th>
                <th className="font-semibold py-2 pr-3 text-right">Selling</th>
                <th className="font-semibold py-2 pr-3 text-right">Margin</th>
                <th className="font-semibold py-2 pr-3">Stock</th>
                <th className="font-semibold py-2 pr-3">Expiry</th>
                <th className="font-semibold py-2 pr-3">Rx</th>
                <th className="font-semibold py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m=>{
                const margin = ((m.sellingPrice-m.buyingPrice)/m.sellingPrice*100).toFixed(0);
                const status = m.stock===0 ? "out" : m.stock<=m.reorderLevel ? "low" : "in";
                const days = daysUntil(m.expiryDate);
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.generic} · {m.unit}</div>
                    </td>
                    <td className="py-2.5 pr-3"><Badge tone="info">{m.category}</Badge></td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{m.brand}</td>
                    <td className="py-2.5 pr-3 text-right">{formatNaira(m.buyingPrice)}</td>
                    <td className="py-2.5 pr-3 text-right font-semibold">{formatNaira(m.sellingPrice)}</td>
                    <td className="py-2.5 pr-3 text-right text-emerald-600 font-semibold">{margin}%</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <StockBar stock={m.stock} reorder={m.reorderLevel}/>
                        <span className="text-xs tabular-nums">{m.stock}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="text-xs">{formatDateShort(m.expiryDate)}</div>
                      <div className={`text-[11px] ${days<=7?"text-expiry-critical font-semibold":days<=30?"text-expiry-warning":"text-muted-foreground"}`}>
                        {days<0?`Expired ${-days}d ago`:`in ${days}d`}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      {m.requiresPrescription ? <Badge tone="violet"><FileText className="h-3 w-3"/> Rx</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2.5">
                      <Badge tone={status==="in"?"success":status==="low"?"warning":"danger"}>
                        {status==="in"?"In Stock":status==="low"?"Low Stock":"Out of Stock"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>)}
        </div>
      </Card>
      <AddMedicineDialog open={addOpen} onClose={()=>setAddOpen(false)}/>
    </div>
  );
}
