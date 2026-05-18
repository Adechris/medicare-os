import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/lib/auth";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { AddMedicineDialog, NewPurchaseOrderDialog } from "@/components/shared/Dialogs";
import { formatNaira, formatNumber, formatDateShort, daysUntil } from "@/lib/format";
import {
  DollarSign, TrendingUp, ShoppingCart, Pill, AlertTriangle, AlertOctagon,
  Users, Wallet, ArrowRight, Plus, FileText, PackagePlus,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Line, LineChart, Legend,
} from "recharts";
import { useState } from "react";

export const Route = createFileRoute("/_app/dashboard")({ component: DashboardPage });

function KPI({ icon: Icon, label, value, sub, tone="primary", to }:{
  icon: React.ComponentType<{className?:string}>; label:string; value:string; sub?:string;
  tone?: "primary"|"success"|"warning"|"danger"|"violet"; to?:string;
}) {
  const tones: Record<string,string> = {
    primary: "from-primary/15 to-primary/0 text-primary",
    success: "from-emerald-500/15 to-transparent text-emerald-600",
    warning: "from-amber-500/15 to-transparent text-amber-600",
    danger: "from-red-500/15 to-transparent text-red-600",
    violet: "from-violet-500/15 to-transparent text-violet-600",
  };
  const inner = (
    <Card className="p-4 hover:shadow-card-lg transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tones[tone]} flex items-center justify-center`}>
          <Icon className="h-5 w-5"/>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
          <div className="font-display text-lg font-bold truncate">{value}</div>
          {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
        </div>
      </div>
    </Card>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "cashier") return <CashierDashboard/>;
  if (user.role === "pharmacist") return <PharmacistDashboard/>;
  if (user.role === "inventory_manager") return <InventoryDashboard/>;
  return <AdminDashboard/>;
}

function AdminDashboard() {
  const meds = useQuery({ queryKey:["medicines"], queryFn: api.listMedicines });
  const customers = useQuery({ queryKey:["customers"], queryFn: api.listCustomers });
  const txns = useQuery({ queryKey:["transactions"], queryFn: api.listTransactions });
  const rev = useQuery({ queryKey:["rev30"], queryFn: api.revenue30d });
  const cats = useQuery({ queryKey:["salesByCat"], queryFn: api.salesByCategory });
  const top = useQuery({ queryKey:["topSelling"], queryFn: api.topSelling });
  const exps = useQuery({ queryKey:["expenses"], queryFn: api.listExpenses });
  const attendance = useQuery({ queryKey:["attendance"], queryFn: api.listAttendanceToday });
  const [granularity, setGranularity] = useState<"daily"|"weekly"|"monthly">("daily");

  const todayRev = 248500;
  const todayProfit = 86700;
  const txnsToday = 32;
  const totalStock = meds.data?.reduce((s,m)=>s+m.stock,0) ?? 0;
  const lowStock = meds.data?.filter(m=>m.stock>0 && m.stock<=m.reorderLevel).length ?? 0;
  const expiringSoon = meds.data?.filter(m=>daysUntil(m.expiryDate)<=30).length ?? 0;
  const totalCust = customers.data?.length ?? 0;
  const monthExpenses = exps.data?.reduce((s,e)=>s+e.amount,0) ?? 0;

  const chartData = (rev.data||[]).map(d=>({ ...d }));

  return (
    <div>
      <PageHeader
        title="Welcome back to MediCare"
        description="Here's what's happening across your pharmacy today."
        actions={<>
          <Button variant="outline"><FileText className="h-4 w-4"/> Generate Report</Button>
          <Button><Plus className="h-4 w-4"/> New Sale</Button>
        </>}
      />

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={DollarSign} tone="primary" label="Today's Revenue" value={formatNaira(todayRev)} sub="+12.4% vs yesterday"/>
        <KPI icon={TrendingUp} tone="success" label="Today's Profit" value={formatNaira(todayProfit)} sub="34.8% margin"/>
        <KPI icon={ShoppingCart} tone="violet" label="Transactions" value={formatNumber(txnsToday)} sub="across all cashiers"/>
        <KPI icon={Pill} tone="primary" label="Medicines in Stock" value={formatNumber(totalStock)} sub={`${meds.data?.length ?? 0} SKUs`}/>
        <KPI icon={AlertTriangle} tone="warning" label="Low Stock Items" value={formatNumber(lowStock)} sub="Click to review" to="/inventory"/>
        <KPI icon={AlertOctagon} tone="danger" label="Expiring Soon" value={formatNumber(expiringSoon)} sub="Within 30 days" to="/expiry"/>
        <KPI icon={Users} tone="success" label="Total Customers" value={formatNumber(totalCust)} sub="3 new this week"/>
        <KPI icon={Wallet} tone="warning" label="Expenses (Month)" value={formatNaira(monthExpenses)} sub="May 2026"/>
      </div>

      <div className="grid gap-4 mt-5 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm">Revenue vs Expenses</h3>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
              {(["daily","weekly","monthly"] as const).map(g=>(
                <button key={g} onClick={()=>setGranularity(g)}
                  className={`px-2.5 py-1 rounded-md capitalize ${granularity===g?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-accent"}`}>{g}</button>
              ))}
            </div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left:-12, right:8, top:8, bottom:0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2B7FFF" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#2B7FFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false}/>
                <XAxis dataKey="label" tick={{ fontSize:11, fill:"#64748B" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:"#64748B" }} axisLine={false} tickLine={false} tickFormatter={v=>`₦${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #E2E8F0", fontSize:12 }} formatter={(v:number)=>formatNaira(v)}/>
                <Area type="monotone" dataKey="revenue" stroke="#2B7FFF" strokeWidth={2.5} fill="url(#rev)"/>
                <Line type="monotone" dataKey="expenses" stroke="#D97706" strokeWidth={2} dot={false}/>
                <Legend wrapperStyle={{ fontSize:11 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">Sales by Category</h3>
          <p className="text-xs text-muted-foreground">This month</p>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cats.data||[]} layout="vertical" margin={{ left:0, right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize:11, fill:"#64748B" }} axisLine={false} tickLine={false} tickFormatter={v=>`₦${(v/1000).toFixed(0)}k`}/>
                <YAxis type="category" dataKey="category" tick={{ fontSize:11, fill:"#64748B" }} width={90} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #E2E8F0", fontSize:12 }} formatter={(v:number)=>formatNaira(v)}/>
                <Bar dataKey="sales" fill="#2B7FFF" radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3"/></Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="font-semibold py-2 pr-4">Receipt</th>
                  <th className="font-semibold py-2 pr-4">Cashier</th>
                  <th className="font-semibold py-2 pr-4">Items</th>
                  <th className="font-semibold py-2 pr-4">Total</th>
                  <th className="font-semibold py-2 pr-4">Method</th>
                  <th className="font-semibold py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {(txns.data||[]).slice(0,8).map(t=>(
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-2.5 pr-4 font-mono text-xs">{t.receiptNo}</td>
                    <td className="py-2.5 pr-4">{t.cashier}</td>
                    <td className="py-2.5 pr-4">{t.itemsCount}</td>
                    <td className="py-2.5 pr-4 font-semibold">{formatNaira(t.total)}</td>
                    <td className="py-2.5 pr-4"><Badge tone="info">{t.paymentMethod}</Badge></td>
                    <td className="py-2.5 text-xs text-muted-foreground">{formatDateShort(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">Top Selling Today</h3>
          <ul className="mt-3 space-y-2.5">
            {(top.data||[]).map((m,i)=>(
              <li key={m.name} className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i+1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.category} · {m.units} units</div>
                </div>
                <div className="text-sm font-semibold">{formatNaira(m.revenue)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-2"><AlertOctagon className="h-4 w-4 text-expiry-critical"/> Expiry Alerts</h3>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center justify-between p-2 rounded-md bg-red-50 dark:bg-red-500/10"><span className="text-sm">Expired (today)</span><Badge tone="danger">1</Badge></li>
            <li className="flex items-center justify-between p-2 rounded-md bg-orange-50 dark:bg-orange-500/10"><span className="text-sm">Within 7 days</span><Badge tone="warning">2</Badge></li>
            <li className="flex items-center justify-between p-2 rounded-md bg-amber-50 dark:bg-amber-500/10"><span className="text-sm">Within 30 days</span><Badge tone="amber">4</Badge></li>
          </ul>
          <Link to="/expiry" className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline">View all expiry alerts <ArrowRight className="h-3 w-3"/></Link>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-2"><PackagePlus className="h-4 w-4 text-amber-600"/> Low Stock</h3>
          <ul className="mt-3 space-y-2">
            {(meds.data||[]).filter(m=>m.stock<=m.reorderLevel).slice(0,4).map(m=>(
              <li key={m.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">Stock: {m.stock} · Reorder: {m.reorderLevel}</div>
                </div>
                <Button variant="outline" className="h-7 px-2 text-xs">Restock</Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">Staff On Duty</h3>
          <ul className="mt-3 space-y-2.5">
            {(attendance.data||[]).filter(a=>a.clockIn).map(a=>(
              <li key={a.id} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {a.staffName.split(" ").map(n=>n[0]).slice(0,2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{a.staffName}</div>
                  <div className="text-[11px] text-muted-foreground">Clocked in {a.clockIn}</div>
                </div>
                <Badge tone={a.status==="Late"?"warning":"success"}>{a.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function PharmacistDashboard() {
  const meds = useQuery({ queryKey:["medicines"], queryFn: api.listMedicines });
  const presc = useQuery({ queryKey:["prescriptions"], queryFn: api.listPrescriptions });
  return (
    <div>
      <PageHeader title="Pharmacist dashboard" description="Medicines needing your attention today."
        actions={<><Button variant="outline"><Pill className="h-4 w-4"/> Check Inventory</Button><Button><Plus className="h-4 w-4"/> New Sale</Button></>}/>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KPI icon={AlertTriangle} tone="warning" label="Low Stock" value={formatNumber(meds.data?.filter(m=>m.stock<=m.reorderLevel && m.stock>0).length ?? 0)} to="/inventory"/>
        <KPI icon={AlertOctagon} tone="danger" label="Expiring Soon" value={formatNumber(meds.data?.filter(m=>daysUntil(m.expiryDate)<=30).length ?? 0)} to="/expiry"/>
        <KPI icon={FileText} tone="violet" label="Prescriptions Today" value={formatNumber(presc.data?.length ?? 0)} to="/prescriptions"/>
        <KPI icon={ShoppingCart} tone="primary" label="My Sales Today" value={formatNaira(64500)}/>
      </div>
      <Card className="p-4 mt-4">
        <h3 className="font-display font-bold text-sm">Today's Prescriptions</h3>
        <ul className="mt-3 divide-y divide-border">
          {(presc.data||[]).map(p=>(
            <li key={p.id} className="py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.patient}</div>
                <div className="text-xs text-muted-foreground">{p.doctor} · {p.hospital}</div>
              </div>
              <Badge tone={p.status==="Filled"?"success":p.status==="Pending"?"warning":"info"}>{p.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function CashierDashboard() {
  const txns = useQuery({ queryKey:["transactions"], queryFn: api.listTransactions });
  const my = (txns.data||[]).filter(t=>t.cashier==="Chioma Eze");
  return (
    <div>
      <PageHeader title="Cashier dashboard" description="Your sales summary for today."
        actions={<Link to="/pos"><Button><ShoppingCart className="h-4 w-4"/> Open POS</Button></Link>}/>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <KPI icon={DollarSign} tone="primary" label="My Revenue Today" value={formatNaira(my.reduce((s,t)=>s+t.total,0))}/>
        <KPI icon={ShoppingCart} tone="violet" label="My Transactions" value={formatNumber(my.length)}/>
        <KPI icon={Users} tone="success" label="Customers Served" value={formatNumber(new Set(my.map(t=>t.customerName)).size)}/>
      </div>
      <Card className="p-4 mt-4">
        <h3 className="font-display font-bold text-sm">My Recent Transactions</h3>
        <ul className="mt-3 divide-y divide-border">
          {my.slice(0,8).map(t=>(
            <li key={t.id} className="py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs">{t.receiptNo}</div>
                <div className="text-xs text-muted-foreground">{t.customerName} · {formatDateShort(t.date)}</div>
              </div>
              <Badge tone="info">{t.paymentMethod}</Badge>
              <div className="font-semibold text-sm w-24 text-right">{formatNaira(t.total)}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function InventoryDashboard() {
  const meds = useQuery({ queryKey:["medicines"], queryFn: api.listMedicines });
  const sup = useQuery({ queryKey:["suppliers"], queryFn: api.listSuppliers });
  return (
    <div>
      <PageHeader title="Inventory dashboard" description="Stock health, expiries and supplier activity."
        actions={<><Button variant="outline"><PackagePlus className="h-4 w-4"/> New Purchase Order</Button><Button><Plus className="h-4 w-4"/> Add Medicine</Button></>}/>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KPI icon={Pill} tone="primary" label="Total Stock" value={formatNumber(meds.data?.reduce((s,m)=>s+m.stock,0) ?? 0)}/>
        <KPI icon={AlertTriangle} tone="warning" label="Low Stock" value={formatNumber(meds.data?.filter(m=>m.stock<=m.reorderLevel && m.stock>0).length ?? 0)}/>
        <KPI icon={AlertOctagon} tone="danger" label="Out of Stock" value={formatNumber(meds.data?.filter(m=>m.stock===0).length ?? 0)}/>
        <KPI icon={AlertOctagon} tone="danger" label="Expiring ≤30d" value={formatNumber(meds.data?.filter(m=>daysUntil(m.expiryDate)<=30).length ?? 0)}/>
      </div>
      <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">Low / Out of Stock</h3>
          <ul className="mt-3 divide-y divide-border">
            {(meds.data||[]).filter(m=>m.stock<=m.reorderLevel).map(m=>(
              <li key={m.id} className="py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.category}</div>
                </div>
                <Badge tone={m.stock===0?"danger":"warning"}>{m.stock===0?"Out":"Low"}</Badge>
                <div className="text-xs text-muted-foreground w-24 text-right">{m.stock}/{m.reorderLevel}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">Suppliers</h3>
          <ul className="mt-3 divide-y divide-border">
            {(sup.data||[]).map(s=>(
              <li key={s.id} className="py-2.5">
                <div className="font-semibold text-sm">{s.company}</div>
                <div className="text-xs text-muted-foreground">{s.name} · Last order {formatDateShort(s.lastOrder)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
