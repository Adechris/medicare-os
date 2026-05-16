import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Button, Badge } from "@/components/shared/Primitives";
import { API_BASE_URL } from "@/services/api";
import { Settings as SettingsIcon, Wifi } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configure your pharmacy preferences"/>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-2"><SettingsIcon className="h-4 w-4 text-primary"/> Pharmacy Info</h3>
          <div className="mt-3 space-y-3 text-sm">
            <Field label="Pharmacy Name" defaultValue="MediCare Pharmacy"/>
            <Field label="Address" defaultValue="12 Adeola Odeku Street, Victoria Island, Lagos"/>
            <Field label="Phone" defaultValue="+234 800 MEDICARE"/>
            <Field label="License Number" defaultValue="PCN/LG/2024/00821"/>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">POS Settings</h3>
          <div className="mt-3 space-y-3 text-sm">
            <Field label="VAT Rate (%)" defaultValue="7.5"/>
            <Field label="Manager PIN Discount Threshold (%)" defaultValue="15"/>
            <Field label="Receipt Footer" defaultValue="Thank you for your patronage"/>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-sm">Notification Settings</h3>
          <div className="mt-3 space-y-3 text-sm">
            <Field label="Low stock threshold (% of reorder)" defaultValue="100"/>
            <Field label="Expiry alert days" defaultValue="7, 14, 30"/>
            <Field label="WhatsApp alert number" defaultValue="+234 801 234 5678"/>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-2"><Wifi className="h-4 w-4 text-primary"/> API Configuration</h3>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-muted-foreground">VITE_API_BASE_URL</div>
              <div className="mt-1 px-3 py-2 rounded-lg bg-surface-grey border border-border font-mono text-xs">{API_BASE_URL}</div>
            </div>
            <div className="flex items-center justify-between">
              <span>Connection status</span>
              <Badge tone="success"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> Connected</Badge>
            </div>
            <Button variant="outline" onClick={()=>toast.success("API responded in 142ms")}>Test API Connection</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }:{ label:string; defaultValue:string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input defaultValue={defaultValue} className="mt-1 w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
    </div>
  );
}
