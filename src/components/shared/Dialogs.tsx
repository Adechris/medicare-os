import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal, Field, inputCls, textareaCls } from "./Modal";
import { Button } from "./Primitives";
import { api } from "@/services/api";
import { CATEGORIES } from "@/mock/data";

function useInvalidate(keys: string[]) {
  const qc = useQueryClient();
  return () => keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
}

/* ─────────── Add Medicine ─────────── */
export function AddMedicineDialog({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const invalidate = useInvalidate(["medicines"]);
  const m = useMutation({
    mutationFn: api.createMedicine,
    onSuccess: () => { toast.success("Medicine added"); invalidate(); onClose(); },
  });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    m.mutate({
      name: String(f.get("name")), generic: String(f.get("generic")), category: String(f.get("category")),
      brand: String(f.get("brand")), buyingPrice: Number(f.get("buyingPrice")), sellingPrice: Number(f.get("sellingPrice")),
      stock: Number(f.get("stock")), unit: String(f.get("unit")), reorderLevel: Number(f.get("reorderLevel")),
      expiryDate: new Date(String(f.get("expiryDate"))).toISOString(),
      manufactureDate: new Date(String(f.get("manufactureDate"))).toISOString(),
      batch: String(f.get("batch")), requiresPrescription: f.get("requiresPrescription")==="on",
      status: "Active",
    });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add Medicine" description="Register a new SKU in your catalog" size="xl">
      <form id="add-med" onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Name" required><input name="name" required className={inputCls}/></Field>
        <Field label="Generic name" required><input name="generic" required className={inputCls}/></Field>
        <Field label="Category" required>
          <select name="category" required className={inputCls}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Brand" required><input name="brand" required className={inputCls}/></Field>
        <Field label="Buying price (₦)" required><input name="buyingPrice" type="number" min="0" required className={inputCls}/></Field>
        <Field label="Selling price (₦)" required><input name="sellingPrice" type="number" min="0" required className={inputCls}/></Field>
        <Field label="Stock" required><input name="stock" type="number" min="0" defaultValue={0} required className={inputCls}/></Field>
        <Field label="Unit" required><input name="unit" placeholder="tablets, vial, bottle…" required className={inputCls}/></Field>
        <Field label="Reorder level" required><input name="reorderLevel" type="number" min="0" defaultValue={20} required className={inputCls}/></Field>
        <Field label="Batch No" required><input name="batch" required className={inputCls}/></Field>
        <Field label="Manufacture date" required><input name="manufactureDate" type="date" required className={inputCls}/></Field>
        <Field label="Expiry date" required><input name="expiryDate" type="date" required className={inputCls}/></Field>
        <label className="col-span-2 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="requiresPrescription"/> Requires prescription
        </label>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button form="add-med" type="submit" disabled={m.isPending}>{m.isPending?"Saving…":"Add Medicine"}</Button>
      </div>
    </Modal>
  );
}

/* ─────────── Adjust Stock ─────────── */
export function AdjustStockDialog({ open, onClose, medicineId, medicineName, currentStock, initialDelta }:{
  open:boolean; onClose:()=>void; medicineId:string; medicineName:string; currentStock:number; initialDelta?:number;
}) {
  const invalidate = useInvalidate(["medicines"]);
  const [delta, setDelta] = useState(initialDelta ?? 1);
  const [reason, setReason] = useState("");
  const m = useMutation({
    mutationFn: () => api.adjustStock(medicineId, delta, reason),
    onSuccess: () => { toast.success(`Stock updated (${delta>0?"+":""}${delta})`); invalidate(); onClose(); },
  });
  return (
    <Modal open={open} onClose={onClose} title="Adjust Stock" description={medicineName}>
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Current stock: <span className="font-semibold text-foreground">{currentStock}</span></div>
        <Field label="Adjustment (use negative to deduct)" required>
          <input type="number" value={delta} onChange={e=>setDelta(Number(e.target.value))} className={inputCls}/>
        </Field>
        <Field label="Reason"><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="restock, damaged, expired…" className={inputCls}/></Field>
        <div className="text-sm">New stock: <span className="font-semibold">{Math.max(0,currentStock+delta)}</span></div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={()=>m.mutate()} disabled={m.isPending || delta===0}>{m.isPending?"Saving…":"Apply"}</Button>
      </div>
    </Modal>
  );
}

/* ─────────── Add Customer ─────────── */
export function AddCustomerDialog({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const invalidate = useInvalidate(["customers"]);
  const m = useMutation({
    mutationFn: api.createCustomer,
    onSuccess: () => { toast.success("Customer added"); invalidate(); onClose(); },
  });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    m.mutate({
      name: String(f.get("name")), phone: String(f.get("phone")), email: String(f.get("email") || "-"),
      bloodGroup: String(f.get("bloodGroup") || "") || undefined,
      allergies: String(f.get("allergies") || "") || undefined,
      address: String(f.get("address") || "") || undefined,
      dob: String(f.get("dob") || "") || undefined,
    });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add Customer" description="Create a new customer record" size="lg">
      <form id="add-cust" onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Full name" required><input name="name" required className={inputCls}/></Field>
        <Field label="Phone" required><input name="phone" required className={inputCls}/></Field>
        <Field label="Email"><input name="email" type="email" className={inputCls}/></Field>
        <Field label="Date of birth"><input name="dob" type="date" className={inputCls}/></Field>
        <Field label="Blood group">
          <select name="bloodGroup" className={inputCls} defaultValue="">
            <option value="">—</option>{["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(b=><option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Allergies"><input name="allergies" className={inputCls}/></Field>
        <div className="col-span-2"><Field label="Address"><textarea name="address" rows={2} className={textareaCls}/></Field></div>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button form="add-cust" type="submit" disabled={m.isPending}>{m.isPending?"Saving…":"Add Customer"}</Button>
      </div>
    </Modal>
  );
}

/* ─────────── Add Expense ─────────── */
export function AddExpenseDialog({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const invalidate = useInvalidate(["expenses"]);
  const m = useMutation({
    mutationFn: api.createExpense,
    onSuccess: () => { toast.success("Expense recorded"); invalidate(); onClose(); },
  });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    m.mutate({
      date: new Date(String(f.get("date"))).toISOString(),
      category: String(f.get("category")), description: String(f.get("description")),
      amount: Number(f.get("amount")), recordedBy: String(f.get("recordedBy") || "Admin"),
    });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add Expense" description="Log an operating cost">
      <form id="add-exp" onSubmit={submit} className="space-y-3">
        <Field label="Date" required><input name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)} required className={inputCls}/></Field>
        <Field label="Category" required>
          <select name="category" required className={inputCls}>
            {["Restock","Utilities","Salaries","Maintenance","Equipment","Rent","Logistics","Other"].map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Description" required><input name="description" required className={inputCls}/></Field>
        <Field label="Amount (₦)" required><input name="amount" type="number" min="0" required className={inputCls}/></Field>
        <Field label="Recorded by"><input name="recordedBy" defaultValue="Admin" className={inputCls}/></Field>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button form="add-exp" type="submit" disabled={m.isPending}>{m.isPending?"Saving…":"Add Expense"}</Button>
      </div>
    </Modal>
  );
}

/* ─────────── Add Supplier ─────────── */
export function AddSupplierDialog({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const invalidate = useInvalidate(["suppliers"]);
  const m = useMutation({
    mutationFn: api.createSupplier,
    onSuccess: () => { toast.success("Supplier added"); invalidate(); onClose(); },
  });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    m.mutate({
      name: String(f.get("name")), company: String(f.get("company")),
      phone: String(f.get("phone")), email: String(f.get("email")),
      address: String(f.get("address")),
    });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add Supplier" description="Add a new supply chain partner" size="lg">
      <form id="add-sup" onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Company" required><input name="company" required className={inputCls}/></Field>
        <Field label="Contact name" required><input name="name" required className={inputCls}/></Field>
        <Field label="Phone" required><input name="phone" required className={inputCls}/></Field>
        <Field label="Email" required><input name="email" type="email" required className={inputCls}/></Field>
        <div className="col-span-2"><Field label="Address" required><textarea name="address" rows={2} required className={textareaCls}/></Field></div>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button form="add-sup" type="submit" disabled={m.isPending}>{m.isPending?"Saving…":"Add Supplier"}</Button>
      </div>
    </Modal>
  );
}

/* ─────────── New Purchase Order ─────────── */
export function NewPurchaseOrderDialog({ open, onClose, defaultSupplierId }:{ open:boolean; onClose:()=>void; defaultSupplierId?:string }) {
  const suppliers = useQuery({ queryKey:["suppliers"], queryFn: api.listSuppliers });
  const invalidate = useInvalidate(["suppliers"]);
  const [supplierId, setSupplierId] = useState(defaultSupplierId || "");
  const [notes, setNotes] = useState("");
  const m = useMutation({
    mutationFn: () => api.createPurchaseOrder(supplierId, notes),
    onSuccess: (r) => { toast.success(`PO ${r.orderNo} created`); invalidate(); onClose(); },
  });
  return (
    <Modal open={open} onClose={onClose} title="New Purchase Order" description="Order stock from a supplier">
      <div className="space-y-3">
        <Field label="Supplier" required>
          <select value={supplierId} onChange={e=>setSupplierId(e.target.value)} required className={inputCls}>
            <option value="">Select a supplier…</option>
            {(suppliers.data||[]).map(s=><option key={s.id} value={s.id}>{s.company}</option>)}
          </select>
        </Field>
        <Field label="Notes / line items" hint="In a real backend you'd add line items here.">
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} className={textareaCls} placeholder="e.g. 200x Amoxil 500mg, 100x Vitamin C…"/>
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={()=>m.mutate()} disabled={!supplierId || m.isPending}>{m.isPending?"Creating…":"Create PO"}</Button>
      </div>
    </Modal>
  );
}

/* ─────────── Add Staff ─────────── */
export function AddStaffDialog({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const invalidate = useInvalidate(["staff"]);
  const m = useMutation({
    mutationFn: api.createStaff,
    onSuccess: () => { toast.success("Staff added"); invalidate(); onClose(); },
  });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    m.mutate({
      name: String(f.get("name")), role: String(f.get("role")),
      phone: String(f.get("phone")), email: String(f.get("email")),
      shift: f.get("shift") as any, salary: Number(f.get("salary")),
      employmentDate: String(f.get("employmentDate")),
    });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add Staff" description="Onboard a new team member" size="lg">
      <form id="add-staff" onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Full name" required><input name="name" required className={inputCls}/></Field>
        <Field label="Role" required>
          <select name="role" required className={inputCls}>
            {["Admin","Pharmacist","Cashier","Inventory Manager"].map(r=><option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Phone" required><input name="phone" required className={inputCls}/></Field>
        <Field label="Email" required><input name="email" type="email" required className={inputCls}/></Field>
        <Field label="Shift" required>
          <select name="shift" required className={inputCls}>
            {["Morning","Afternoon","Night","Rotating"].map(s=><option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Salary (₦)" required><input name="salary" type="number" min="0" required className={inputCls}/></Field>
        <Field label="Employment date" required><input name="employmentDate" type="date" defaultValue={new Date().toISOString().slice(0,10)} required className={inputCls}/></Field>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button form="add-staff" type="submit" disabled={m.isPending}>{m.isPending?"Saving…":"Add Staff"}</Button>
      </div>
    </Modal>
  );
}

/* ─────────── New Prescription ─────────── */
export function NewPrescriptionDialog({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const invalidate = useInvalidate(["prescriptions"]);
  type Line = { name:string; dosage:string; frequency:string; duration:string; qty:number };
  const [lines, setLines] = useState<Line[]>([{ name:"", dosage:"", frequency:"", duration:"", qty:1 }]);
  const m = useMutation({
    mutationFn: api.createPrescription,
    onSuccess: () => { toast.success("Prescription created"); invalidate(); onClose(); setLines([{ name:"", dosage:"", frequency:"", duration:"", qty:1 }]); },
  });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const valid = lines.filter(l=>l.name.trim());
    if (valid.length===0) return toast.error("Add at least one medicine");
    m.mutate({
      patient: String(f.get("patient")), doctor: String(f.get("doctor")),
      hospital: String(f.get("hospital")),
      dateIssued: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30*86400000).toISOString(),
      medicines: valid,
    });
  };
  return (
    <Modal open={open} onClose={onClose} title="New Prescription" description="Record a doctor's prescription" size="xl">
      <form id="add-rx" onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Patient" required><input name="patient" required className={inputCls}/></Field>
          <Field label="Doctor" required><input name="doctor" required className={inputCls}/></Field>
          <Field label="Hospital" required><input name="hospital" required className={inputCls}/></Field>
        </div>
        <div>
          <div className="text-xs font-semibold mb-1">Medicines</div>
          <div className="space-y-2">
            {lines.map((l,i)=>(
              <div key={i} className="grid grid-cols-12 gap-2">
                <input placeholder="Name" value={l.name} onChange={e=>setLines(s=>s.map((x,j)=>j===i?{...x,name:e.target.value}:x))} className={inputCls+" col-span-3"}/>
                <input placeholder="Dosage" value={l.dosage} onChange={e=>setLines(s=>s.map((x,j)=>j===i?{...x,dosage:e.target.value}:x))} className={inputCls+" col-span-2"}/>
                <input placeholder="Frequency" value={l.frequency} onChange={e=>setLines(s=>s.map((x,j)=>j===i?{...x,frequency:e.target.value}:x))} className={inputCls+" col-span-2"}/>
                <input placeholder="Duration" value={l.duration} onChange={e=>setLines(s=>s.map((x,j)=>j===i?{...x,duration:e.target.value}:x))} className={inputCls+" col-span-2"}/>
                <input type="number" min="1" placeholder="Qty" value={l.qty} onChange={e=>setLines(s=>s.map((x,j)=>j===i?{...x,qty:Number(e.target.value)}:x))} className={inputCls+" col-span-2"}/>
                <button type="button" onClick={()=>setLines(s=>s.filter((_,j)=>j!==i))} className="col-span-1 h-9 rounded-lg border border-border hover:bg-accent text-red-600 text-sm">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={()=>setLines(s=>[...s,{name:"",dosage:"",frequency:"",duration:"",qty:1}])} className="mt-2 text-xs text-primary font-semibold hover:underline">+ Add medicine</button>
        </div>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button form="add-rx" type="submit" disabled={m.isPending}>{m.isPending?"Saving…":"Create Prescription"}</Button>
      </div>
    </Modal>
  );
}
