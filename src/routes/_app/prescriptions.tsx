import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/services/api";
import type { Prescription } from "@/mock/data";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { Modal } from "@/components/shared/Modal";
import { NewPrescriptionDialog } from "@/components/shared/Dialogs";
import { formatDateShort } from "@/lib/format";
import { Plus, ScrollText } from "lucide-react";

export const Route = createFileRoute("/_app/prescriptions")({ component: PrescriptionsPage });

function PrescriptionsPage() {
  const presc = useQuery({ queryKey:["prescriptions"], queryFn: api.listPrescriptions });
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<Prescription | null>(null);
  const navigate = useNavigate();

  const dispense = (p: Prescription) => {
    try { sessionStorage.setItem("pos_dispense", JSON.stringify(p)); } catch {}
    navigate({ to: "/pos" });
  };

  return (
    <div>
      <PageHeader title="Prescriptions" description="Pending and fulfilled prescriptions"
        actions={<Button onClick={()=>setAddOpen(true)}><Plus className="h-4 w-4"/> New Prescription</Button>}/>
      <div className="grid gap-4 lg:grid-cols-2">
        {(presc.data||[]).map(p=>(
          <Card key={p.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 flex items-center justify-center"><ScrollText className="h-5 w-5"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold truncate">{p.patient}</h3>
                  <Badge tone={p.status==="Filled"?"success":p.status==="Pending"?"warning":p.status==="Expired"?"slate":"info"}>{p.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{p.doctor} · {p.hospital}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Issued {formatDateShort(p.dateIssued)} · Valid until {formatDateShort(p.validUntil)}</div>
              </div>
            </div>
            <ul className="mt-3 divide-y divide-border text-sm">
              {p.medicines.map((m,i)=>(
                <li key={i} className="py-2 flex justify-between">
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.dosage} · {m.frequency} · {m.duration}</div>
                  </div>
                  <div className="text-sm font-semibold">×{m.qty}</div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={()=>setView(p)}>View Details</Button>
              <Button className="flex-1" onClick={()=>dispense(p)}>Dispense from POS</Button>
            </div>
          </Card>
        ))}
      </div>

      <NewPrescriptionDialog open={addOpen} onClose={()=>setAddOpen(false)}/>

      {view && (
        <Modal open onClose={()=>setView(null)} title={`Prescription · ${view.patient}`} description={`${view.doctor} · ${view.hospital}`} size="lg">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-muted-foreground">Status: </span><Badge tone={view.status==="Filled"?"success":view.status==="Pending"?"warning":view.status==="Expired"?"slate":"info"}>{view.status}</Badge></div>
              <div><span className="text-muted-foreground">Filled by: </span>{view.filledBy ?? "—"}</div>
              <div><span className="text-muted-foreground">Issued: </span>{formatDateShort(view.dateIssued)}</div>
              <div><span className="text-muted-foreground">Valid until: </span>{formatDateShort(view.validUntil)}</div>
            </div>
            <div className="border rounded-lg divide-y">
              {view.medicines.map((m,i)=>(
                <div key={i} className="p-3 flex justify-between">
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.dosage} · {m.frequency} · {m.duration}</div>
                  </div>
                  <div className="font-semibold">×{m.qty}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>setView(null)}>Close</Button>
              <Button onClick={()=>{ dispense(view); setView(null); }}>Dispense from POS</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
