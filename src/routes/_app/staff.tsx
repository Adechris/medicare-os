import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { formatNaira, formatDateShort } from "@/lib/format";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/staff")({ component: StaffPage });

function StaffPage() {
  const staff = useQuery({ queryKey:["staff"], queryFn: api.listStaff });
  return (
    <div>
      <PageHeader title="Staff Management" description="Team members, roles and access"
        actions={<Button><Plus className="h-4 w-4"/> Add Staff</Button>}/>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="font-semibold py-2 pr-3">Name</th>
                <th className="font-semibold py-2 pr-3">Role</th>
                <th className="font-semibold py-2 pr-3">Shift</th>
                <th className="font-semibold py-2 pr-3">Phone</th>
                <th className="font-semibold py-2 pr-3">Email</th>
                <th className="font-semibold py-2 pr-3">Joined</th>
                <th className="font-semibold py-2 pr-3 text-right">Salary</th>
                <th className="font-semibold py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(staff.data||[]).map(s=>(
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        {s.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                      </div>
                      <div className="font-semibold">{s.name}</div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3"><Badge tone="violet">{s.role}</Badge></td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{s.shift}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{s.phone}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{s.email}</td>
                  <td className="py-2.5 pr-3 text-xs">{formatDateShort(s.employmentDate)}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{formatNaira(s.salary)}</td>
                  <td className="py-2.5"><Badge tone={s.status==="Active"?"success":"danger"}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
