import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { formatNaira, formatDateShort } from "@/lib/format";
import { Plus, Truck } from "lucide-react";

export const Route = createFileRoute("/_app/suppliers")({ component: SuppliersPage });

function SuppliersPage() {
  const sup = useQuery({ queryKey:["suppliers"], queryFn: api.listSuppliers });
  return (
    <div>
      <PageHeader title="Suppliers" description="Manage your supply chain partners"
        actions={<Button><Plus className="h-4 w-4"/> Add Supplier</Button>}/>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(sup.data||[]).map(s=>(
          <Card key={s.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Truck className="h-5 w-5"/></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold truncate">{s.company}</h3>
                <div className="text-xs text-muted-foreground">{s.name}</div>
              </div>
              <Badge tone={s.status==="Active"?"success":"slate"}>{s.status}</Badge>
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
              <div>{s.phone}</div><div>{s.email}</div><div>{s.address}</div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
              <div><div className="text-[11px] text-muted-foreground">Last order</div><div className="font-semibold">{formatDateShort(s.lastOrder)}</div></div>
              <div className="text-right"><div className="text-[11px] text-muted-foreground">Outstanding</div><div className={`font-semibold ${s.outstanding>0?"text-red-600":""}`}>{formatNaira(s.outstanding)}</div></div>
            </div>
            <Button variant="outline" className="w-full mt-3">New Purchase Order</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
