import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/services/api";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { AddExpenseDialog } from "@/components/shared/Dialogs";
import { formatNaira, formatDateShort } from "@/lib/format";
import { Plus, Wallet } from "lucide-react";

export const Route = createFileRoute("/_app/expenses")({ component: ExpensesPage });

function ExpensesPage() {
  const exps = useQuery({ queryKey: ["expenses"], queryFn: api.listExpenses });
  const [addOpen, setAddOpen] = useState(false);
  const total = (exps.data || []).reduce((s, e) => s + e.amount, 0);
  const byCat: Record<string, number> = {};
  (exps.data || []).forEach((e) => {
    byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  });

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track operating costs and budgets"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        }
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Total This Month
          </div>
          <div className="font-display text-xl font-bold mt-1">{formatNaira(total)}</div>
        </Card>
        {Object.entries(byCat)
          .slice(0, 3)
          .map(([k, v]) => (
            <Card key={k} className="p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                {k}
              </div>
              <div className="font-display text-xl font-bold mt-1">{formatNaira(v)}</div>
            </Card>
          ))}
      </div>

      <Card className="p-4">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" /> Recent Expenses
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="font-semibold py-2 pr-3">Date</th>
                <th className="font-semibold py-2 pr-3">Category</th>
                <th className="font-semibold py-2 pr-3">Description</th>
                <th className="font-semibold py-2 pr-3">Recorded By</th>
                <th className="font-semibold py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(exps.data || []).map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="py-2.5 pr-3 text-xs">{formatDateShort(e.date)}</td>
                  <td className="py-2.5 pr-3">
                    <Badge tone="info">{e.category}</Badge>
                  </td>
                  <td className="py-2.5 pr-3">{e.description}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{e.recordedBy}</td>
                  <td className="py-2.5 text-right font-semibold">{formatNaira(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <AddExpenseDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
