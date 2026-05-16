import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/_app/attendance")({ component: AttendancePage });

function AttendancePage() {
  const att = useQuery({ queryKey:["attendance"], queryFn: api.listAttendanceToday });
  const list = att.data||[];
  return (
    <div>
      <PageHeader title="Attendance" description="Today's clock-ins and shift records"
        actions={<Button variant="outline">Export CSV</Button>}/>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Present</div><div className="font-display text-xl font-bold mt-1">{list.filter(a=>a.status==="Present").length}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Late</div><div className="font-display text-xl font-bold mt-1 text-amber-600">{list.filter(a=>a.status==="Late").length}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Absent</div><div className="font-display text-xl font-bold mt-1 text-red-600">{list.filter(a=>a.status==="Absent").length}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Staff</div><div className="font-display text-xl font-bold mt-1">{list.length}</div></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-display font-bold text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Today</h3>
        <ul className="mt-3 divide-y divide-border">
          {list.map(a=>(
            <li key={a.id} className="py-2.5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {a.staffName.split(" ").map(n=>n[0]).slice(0,2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{a.staffName}</div>
                <div className="text-xs text-muted-foreground">{a.clockIn ? `Clocked in ${a.clockIn}` : "Not clocked in"}</div>
              </div>
              <Badge tone={a.status==="Present"?"success":a.status==="Late"?"warning":"danger"}>{a.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
