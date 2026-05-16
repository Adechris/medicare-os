import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/services/api";
import type { Medicine } from "@/mock/data";
import { Card, Button, Badge } from "@/components/shared/Primitives";
import { formatNaira } from "@/lib/format";
import { Search, Plus, Minus, Trash2, ShoppingCart, FileText, X, Printer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/pos")({ component: POSPage });

interface CartItem { medicine: Medicine; qty: number; }

function POSPage() {
  const meds = useQuery({ queryKey:["medicines"], queryFn: api.listMedicines });
  const customers = useQuery({ queryKey:["customers"], queryFn: api.listCustomers });
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cust, setCust] = useState("c1");
  const [payment, setPayment] = useState<"Cash"|"Card"|"Transfer"|"Credit">("Cash");
  const [tendered, setTendered] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [receiptOpen, setReceiptOpen] = useState<null|{ receiptNo:string; total:number; change:number }>(null);

  const filtered = useMemo(()=>{
    const list = meds.data||[];
    if (!q) return list.slice(0,12);
    return list.filter(m=>`${m.name} ${m.generic} ${m.brand}`.toLowerCase().includes(q.toLowerCase()));
  }, [meds.data, q]);

  const add = (m:Medicine) => {
    setCart(c=>{
      const idx = c.findIndex(x=>x.medicine.id===m.id);
      if (idx>=0) { const next=[...c]; next[idx]={...next[idx], qty:next[idx].qty+1}; return next; }
      return [...c, { medicine:m, qty:1 }];
    });
  };
  const dec = (id:string) => setCart(c=>c.flatMap(x=>x.medicine.id===id?(x.qty>1?[{...x,qty:x.qty-1}]:[]):[x]));
  const inc = (id:string) => setCart(c=>c.map(x=>x.medicine.id===id?{...x,qty:x.qty+1}:x));
  const remove = (id:string) => setCart(c=>c.filter(x=>x.medicine.id!==id));

  const subtotal = cart.reduce((s,i)=>s+i.qty*i.medicine.sellingPrice, 0);
  const discount = Math.round(subtotal * (discountPct/100));
  const vat = Math.round((subtotal-discount)*0.075);
  const total = subtotal - discount + vat;
  const change = Math.max(0, Number(tendered||0) - total);

  const complete = () => {
    if (cart.length===0) return toast.error("Cart is empty");
    if (payment==="Cash" && Number(tendered||0) < total) return toast.error("Insufficient cash tendered");
    const receiptNo = "RCT-" + Math.floor(10000 + Math.random()*89999);
    toast.success("Sale completed");
    setReceiptOpen({ receiptNo, total, change });
    setCart([]); setTendered(""); setDiscountPct(0);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      {/* Left: search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, generic, or scan barcode…"
            className="w-full pl-10 pr-3 h-11 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
        </div>
        <div className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map(m=>(
            <button key={m.id} onClick={()=>add(m)} disabled={m.stock===0}
              className="text-left p-3 rounded-lg border border-border bg-card hover:border-primary hover:shadow-card transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-sm leading-tight">{m.name}</div>
                {m.requiresPrescription && <Badge tone="violet" className="shrink-0"><FileText className="h-3 w-3"/></Badge>}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{m.generic}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-primary text-sm">{formatNaira(m.sellingPrice)}</div>
                <Badge tone={m.stock===0?"danger":m.stock<=m.reorderLevel?"warning":"success"}>{m.stock===0?"Out":`${m.stock} left`}</Badge>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Right: cart */}
      <Card className="p-4 flex flex-col h-fit lg:sticky lg:top-20">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary"/>
          <h3 className="font-display font-bold text-sm">Current Sale</h3>
          <Badge tone="info" className="ml-auto">{cart.reduce((s,i)=>s+i.qty,0)} items</Badge>
        </div>

        <div className="mt-3">
          <label className="text-xs font-semibold text-muted-foreground">Customer</label>
          <select value={cust} onChange={e=>setCust(e.target.value)} className="mt-1 w-full h-9 px-2 rounded-lg border border-border bg-background text-sm">
            {(customers.data||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="mt-3 -mx-1 max-h-[42vh] overflow-y-auto">
          {cart.length===0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">Search and click a medicine to add it to the cart.</div>
          ) : (
            <ul className="space-y-2 px-1">
              {cart.map(i=>(
                <li key={i.medicine.id} className="p-2.5 rounded-lg bg-surface-grey border border-border">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{i.medicine.name}</div>
                      <div className="text-[11px] text-muted-foreground">{formatNaira(i.medicine.sellingPrice)} × {i.qty}</div>
                      {i.medicine.requiresPrescription && (
                        <Badge tone="danger" className="mt-1"><FileText className="h-3 w-3"/> Prescription required</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{formatNaira(i.qty*i.medicine.sellingPrice)}</div>
                      <div className="mt-1 inline-flex items-center border border-border rounded-md">
                        <button onClick={()=>dec(i.medicine.id)} className="h-6 w-6 inline-flex items-center justify-center hover:bg-accent"><Minus className="h-3 w-3"/></button>
                        <span className="px-1.5 text-xs tabular-nums w-6 text-center">{i.qty}</span>
                        <button onClick={()=>inc(i.medicine.id)} className="h-6 w-6 inline-flex items-center justify-center hover:bg-accent"><Plus className="h-3 w-3"/></button>
                        <button onClick={()=>remove(i.medicine.id)} className="h-6 w-6 inline-flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border-l border-border"><Trash2 className="h-3 w-3"/></button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatNaira(subtotal)}</span></div>
          <div className="flex justify-between items-center"><span className="text-muted-foreground">Discount</span>
            <div className="flex items-center gap-1">
              <input type="number" value={discountPct} onChange={e=>setDiscountPct(Math.max(0,Math.min(100,Number(e.target.value)||0)))} className="w-14 h-7 px-1 text-right rounded border border-border bg-background text-xs"/>
              <span className="text-xs text-muted-foreground">%</span>
              <span className="ml-1 tabular-nums">−{formatNaira(discount)}</span>
            </div>
          </div>
          <div className="flex justify-between"><span className="text-muted-foreground">VAT (7.5%)</span><span>{formatNaira(vat)}</span></div>
          <div className="flex justify-between font-display font-bold text-base pt-1 border-t border-border mt-1.5"><span>Total</span><span>{formatNaira(total)}</span></div>
        </div>

        <div className="mt-3">
          <div className="grid grid-cols-4 gap-1.5">
            {(["Cash","Card","Transfer","Credit"] as const).map(m=>(
              <button key={m} onClick={()=>setPayment(m)} className={`h-8 rounded-md text-xs font-semibold border ${payment===m?"bg-primary border-primary text-primary-foreground":"border-border hover:bg-accent"}`}>{m}</button>
            ))}
          </div>
          {payment==="Cash" && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <label className="text-xs text-muted-foreground w-20">Tendered</label>
              <input type="number" value={tendered} onChange={e=>setTendered(e.target.value)} className="flex-1 h-9 px-2 rounded-lg border border-border bg-background text-sm"/>
              <div className="text-xs text-muted-foreground whitespace-nowrap">Change: <span className="font-semibold text-foreground">{formatNaira(change)}</span></div>
            </div>
          )}
        </div>

        <Button className="mt-3 w-full h-10 text-base" onClick={complete}>Complete Sale</Button>
      </Card>

      {receiptOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setReceiptOpen(null)}>
          <div className="bg-card rounded-2xl max-w-sm w-full p-6 print-area" onClick={e=>e.stopPropagation()}>
            <div className="text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">M+</div>
              <h3 className="font-display font-bold mt-2">MediCare Pharmacy</h3>
              <p className="text-xs text-muted-foreground">Thank you for your patronage</p>
            </div>
            <div className="mt-4 text-xs space-y-0.5 border-y border-dashed py-3">
              <div className="flex justify-between"><span>Receipt</span><span className="font-mono">{receiptOpen.receiptNo}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{new Date().toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Cashier</span><span>You</span></div>
            </div>
            <div className="mt-3 flex justify-between text-base font-bold"><span>Total</span><span>{formatNaira(receiptOpen.total)}</span></div>
            {receiptOpen.change>0 && <div className="text-xs flex justify-between"><span>Change</span><span>{formatNaira(receiptOpen.change)}</span></div>}
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={()=>window.print()}><Printer className="h-4 w-4"/> Print</Button>
              <Button className="flex-1" onClick={()=>setReceiptOpen(null)}><X className="h-4 w-4"/> Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
