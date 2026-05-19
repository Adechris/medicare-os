import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, PageHeader, Button } from "@/components/shared/Primitives";
import { formatNaira } from "@/lib/format";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Download, FileBarChart } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

const COLORS = ["#2B7FFF", "#16A34A", "#D97706", "#DC2626", "#7c3aed", "#0ea5e9", "#f43f5e"];

function ReportsPage() {
  const rev = useQuery({ queryKey: ["rev30"], queryFn: api.revenue30d });
  const cats = useQuery({ queryKey: ["salesByCat"], queryFn: api.salesByCategory });
  const exps = useQuery({ queryKey: ["expenses"], queryFn: api.listExpenses });

  const byCat: Record<string, number> = {};
  (exps.data || []).forEach((e) => {
    byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  });
  const expensePie = Object.entries(byCat).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Sales, financial and inventory analytics"
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button>
              <FileBarChart className="h-4 w-4" /> Export PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">Revenue Trend</h3>
          <div className="h-60 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rev.data || []} margin={{ left: -10, right: 8 }}>
                <defs>
                  <linearGradient id="r2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2B7FFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2B7FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
                  formatter={(v: number) => formatNaira(v)}
                />
                <Area dataKey="revenue" stroke="#2B7FFF" strokeWidth={2.5} fill="url(#r2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">Sales by Category</h3>
          <div className="h-60 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cats.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
                  formatter={(v: number) => formatNaira(v)}
                />
                <Bar dataKey="sales" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h3 className="font-display font-bold text-sm">Expense Breakdown</h3>
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={3}
                >
                  {expensePie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatNaira(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
