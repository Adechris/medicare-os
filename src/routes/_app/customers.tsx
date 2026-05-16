import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/services/api";
import { Card, PageHeader, Button, Badge, SkeletonTable } from "@/components/shared/Primitives";
import { formatNaira, formatDateShort } from "@/lib/format";
import { Plus, Search, Users } from "lucide-react";

export const Route = createFileRoute("/_app/customers")({ component: CustomersPage });

function CustomersPage() {
  const customers = useQuery({ queryKey:["customers"], queryFn: api.listCustomers });
  const [q, setQ] = useState("");
  const filtered = useMemo(()=> (customers.data||[]).filter(c=>!q || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q.toLowerCase())), [customers.data,q]);

  return (
    <div>
      <PageHeader title="Customers" description={`${customers.data?.length ?? 0} customers in your database`}
        actions={<Button><Plus className="h-4 w-4"/> Add Customer</Button>}/>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, phone, email…" className="w-full pl-9 h-9 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
        </div>
        <div className="mt-4 overflow-x-auto">
          {customers.isLoading ? <SkeletonTable cols={6}/> : (
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="font-semibold py-2 pr-3">Customer</th>
                <th className="font-semibold py-2 pr-3">Phone</th>
                <th className="font-semibold py-2 pr-3 text-right">Total Purchases</th>
                <th className="font-semibold py-2 pr-3 text-right">Outstanding</th>
                <th className="font-semibold py-2 pr-3">Last Visit</th>
                <th className="font-semibold py-2 pr-3 text-right">Points</th>
                <th className="font-semibold py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        {c.name==="Walk-in Customer" ? <Users className="h-4 w-4"/> : c.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{c.phone}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{formatNaira(c.totalPurchases)}</td>
                  <td className="py-2.5 pr-3 text-right">{c.outstandingDebt>0 ? <span className="text-red-600 font-semibold">{formatNaira(c.outstandingDebt)}</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2.5 pr-3 text-xs">{formatDateShort(c.lastVisit)}</td>
                  <td className="py-2.5 pr-3 text-right">{c.loyaltyPoints}</td>
                  <td className="py-2.5"><Badge tone={c.status==="Active"?"success":"slate"}>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </Card>
    </div>
  );
}
