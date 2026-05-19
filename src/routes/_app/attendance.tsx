import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/lib/auth";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { Clock, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/attendance")({ component: AttendancePage });

function AttendancePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const att = useQuery({ queryKey: ["attendance"], queryFn: api.listAttendanceToday });
  const list = att.data || [];
  const me = user ? list.find((a) => a.staffName === user.name) : null;
  const isClockedIn = !!(me?.clockIn && !me?.clockOut);

  const clockIn = useMutation({
    mutationFn: () => api.clockIn(user!.id, user!.name),
    onSuccess: () => {
      toast.success("Clocked in");
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
  const clockOut = useMutation({
    mutationFn: () => api.clockOut(user!.name),
    onSuccess: () => {
      toast.success("Clocked out");
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed"),
  });

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Today's clock-ins and shift records"
        actions={
          <>
            {user &&
              (isClockedIn ? (
                <Button
                  variant="danger"
                  onClick={() => clockOut.mutate()}
                  disabled={clockOut.isPending}
                >
                  <LogOut className="h-4 w-4" /> Clock Out
                </Button>
              ) : (
                <Button onClick={() => clockIn.mutate()} disabled={clockIn.isPending}>
                  <LogIn className="h-4 w-4" /> Clock In
                </Button>
              ))}
            <Button variant="outline" onClick={() => toast.success("Export started")}>
              Export CSV
            </Button>
          </>
        }
      />

      {user && (
        <Card className="p-4 mb-4 flex items-center gap-4">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${isClockedIn ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
          >
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{user.name}</div>
            <div className="text-xs text-muted-foreground">
              {me?.clockIn ? `Clocked in at ${me.clockIn}` : "Not clocked in today"}
              {me?.clockOut ? ` · Clocked out at ${me.clockOut}` : ""}
            </div>
          </div>
          {me && (
            <Badge
              tone={
                me.status === "Present" ? "success" : me.status === "Late" ? "warning" : "danger"
              }
            >
              {me.status}
            </Badge>
          )}
        </Card>
      )}

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Present
          </div>
          <div className="font-display text-xl font-bold mt-1">
            {list.filter((a) => a.status === "Present").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Late
          </div>
          <div className="font-display text-xl font-bold mt-1 text-amber-600">
            {list.filter((a) => a.status === "Late").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Absent
          </div>
          <div className="font-display text-xl font-bold mt-1 text-red-600">
            {list.filter((a) => a.status === "Absent").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Total Staff
          </div>
          <div className="font-display text-xl font-bold mt-1">{list.length}</div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Today
        </h3>
        <ul className="mt-3 divide-y divide-border">
          {list.map((a) => (
            <li key={a.id} className="py-2.5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {a.staffName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{a.staffName}</div>
                <div className="text-xs text-muted-foreground">
                  {a.clockIn ? `In ${a.clockIn}` : "Not clocked in"}
                  {a.clockOut ? ` · Out ${a.clockOut}` : ""}
                </div>
              </div>
              <Badge
                tone={
                  a.status === "Present" ? "success" : a.status === "Late" ? "warning" : "danger"
                }
              >
                {a.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
