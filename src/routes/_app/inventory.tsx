import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/services/api";
import { Card, PageHeader, Button, Badge, StockBar } from "@/components/shared/Primitives";
import { AdjustStockDialog, NewPurchaseOrderDialog } from "@/components/shared/Dialogs";
import { formatNaira, formatNumber } from "@/lib/format";
import { Boxes, PackagePlus, ArrowDown, ArrowUp, AlertTriangle, AlertOctagon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inventory")({ component: InventoryPage });

function InventoryPage() {
  const meds = useQuery({ queryKey:["medicines"], queryFn: api.listMedicines });
  const qc = useQueryClient();
  const quick = useMutation({
    mutationFn: ({ id, delta }: { id:string; delta:number }) => api.adjustStock(id, delta),
    onSuccess: (_d, v) => { toast.success(`Stock ${v.delta>0?"+":""}${v.delta}`); qc.invalidateQueries({ queryKey:["medicines"] }); },
  });
  const [adjust, setAdjust] = useState<null | { id:string; name:string; stock:number; delta?:number }>(null);
  const [poOpen, setPoOpen] = useState(false);

  const data = meds.data||[];
  const totalValue = data.reduce((s,m)=>s+m.stock*m.buyingPrice, 0);
  const low = data.filter(m=>m.stock>0 && m.stock<=m.reorderLevel).length;
  const out = data.filter(m=>m.stock===0).length;

  return (
    <div>
      <PageHeader title="Inventory" description="Stock levels, movements and purchase orders"
        actions={<>
          <Button variant="outline" onClick={()=>setPoOpen(true)}><PackagePlus className="h-4 w-4"/> New Purchase Order</Button>
          <Button onClick={()=> data[0] && setAdjust({ id:data[0].id, name:data[0].name, stock:data[0].stock })}>Adjust Stock</Button>
        </>}/>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Medicines</div><div className="font-display text-xl font-bold mt-1">{formatNumber(data.length)}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Stock Value</div><div className="font-display text-xl font-bold mt-1">{formatNaira(totalValue)}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500"/> Low Stock</div><div className="font-display text-xl font-bold mt-1">{formatNumber(low)}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><AlertOctagon className="h-3 w-3 text-red-500"/> Out of Stock</div><div className="font-display text-xl font-bold mt-1">{formatNumber(out)}</div></Card>
      </div>

      <Card className="p-4 mt-4">
        <h3 className="font-display font-bold text-sm flex items-center gap-2"><Boxes className="h-4 w-4"/> Stock Levels</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="font-semibold py-2 pr-3">Medicine</th>
                <th className="font-semibold py-2 pr-3">Stock</th>
                <th className="font-semibold py-2 pr-3">Reorder</th>
                <th className="font-semibold py-2 pr-3">Value</th>
                <th className="font-semibold py-2 pr-3">Status</th>
                <th className="font-semibold py-2 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {data.map(m=>{
                const status = m.stock===0?"out":m.stock<=m.reorderLevel?"low":"in";
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold cursor-pointer hover:text-primary" onClick={()=>setAdjust({ id:m.id, name:m.name, stock:m.stock })}>{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.batch} · {m.unit}</div>
                    </td>
                    <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><StockBar stock={m.stock} reorder={m.reorderLevel}/><span className="text-xs tabular-nums">{m.stock}</span></div></td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{m.reorderLevel}</td>
                    <td className="py-2.5 pr-3 font-semibold">{formatNaira(m.stock*m.buyingPrice)}</td>
                    <td className="py-2.5 pr-3"><Badge tone={status==="in"?"success":status==="low"?"warning":"danger"}>{status==="in"?"In Stock":status==="low"?"Low":"Out"}</Badge></td>
                    <td className="py-2.5 text-right">
                      <div className="inline-flex border border-border rounded-md">
                        <button title="Add 1" onClick={()=>quick.mutate({ id:m.id, delta:+1 })} disabled={quick.isPending} className="h-7 w-7 inline-flex items-center justify-center hover:bg-accent text-emerald-600 disabled:opacity-50"><ArrowUp className="h-3.5 w-3.5"/></button>
                        <button title="Remove 1" onClick={()=>quick.mutate({ id:m.id, delta:-1 })} disabled={quick.isPending || m.stock===0} className="h-7 w-7 inline-flex items-center justify-center hover:bg-accent text-red-600 border-l border-border disabled:opacity-50"><ArrowDown className="h-3.5 w-3.5"/></button>
                        <button title="Custom adjust" onClick={()=>setAdjust({ id:m.id, name:m.name, stock:m.stock })} className="h-7 px-2 text-xs hover:bg-accent border-l border-border">…</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {adjust && <AdjustStockDialog open onClose={()=>setAdjust(null)} medicineId={adjust.id} medicineName={adjust.name} currentStock={adjust.stock} initialDelta={adjust.delta}/>}
      <NewPurchaseOrderDialog open={poOpen} onClose={()=>setPoOpen(false)}/>
    </div>
  );
}
