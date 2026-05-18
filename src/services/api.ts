// Centralized API layer — wired up to mock data now, swap for PHP REST later.
// Each function below already has the shape the PHP backend should match.
import {
  MEDICINES, CUSTOMERS, TRANSACTIONS, PRESCRIPTIONS,
  SUPPLIERS, EXPENSES, STAFF, ATTENDANCE_TODAY,
  REVENUE_30D, SALES_BY_CATEGORY, TOP_SELLING,
  type Medicine, type Customer, type Supplier, type Expense, type Staff, type Prescription, type Attendance,
} from "@/mock/data";

const delay = <T,>(d: T, ms = 250) => new Promise<T>(r => setTimeout(() => r(d), ms));
const id = (p: string) => `${p}${Math.floor(Math.random() * 90000 + 10000)}`;

export const api = {
  // Reads
  listMedicines: () => delay([...MEDICINES]),
  listCustomers: () => delay([...CUSTOMERS]),
  listTransactions: () => delay([...TRANSACTIONS]),
  listPrescriptions: () => delay([...PRESCRIPTIONS]),
  listSuppliers: () => delay([...SUPPLIERS]),
  listExpenses: () => delay([...EXPENSES]),
  listStaff: () => delay([...STAFF]),
  listAttendanceToday: () => delay([...ATTENDANCE_TODAY]),
  revenue30d: () => delay(REVENUE_30D),
  salesByCategory: () => delay(SALES_BY_CATEGORY),
  topSelling: () => delay(TOP_SELLING),

  // Mutations — mutate in-memory arrays so UI refreshes via invalidateQueries
  createMedicine: (m: Omit<Medicine, "id">) => { const x: Medicine = { ...m, id: id("m") }; MEDICINES.unshift(x); return delay(x); },
  adjustStock: (medicineId: string, delta: number, reason?: string) => {
    const m = MEDICINES.find(x => x.id === medicineId);
    if (!m) throw new Error("Medicine not found");
    m.stock = Math.max(0, m.stock + delta);
    void reason;
    return delay(m);
  },
  createCustomer: (c: Omit<Customer, "id" | "totalPurchases" | "outstandingDebt" | "lastVisit" | "loyaltyPoints" | "status">) => {
    const x: Customer = { ...c, id: id("c"), totalPurchases:0, outstandingDebt:0, lastVisit: new Date().toISOString(), loyaltyPoints:0, status:"Active" };
    CUSTOMERS.push(x); return delay(x);
  },
  createSupplier: (s: Omit<Supplier, "id" | "lastOrder" | "outstanding" | "status">) => {
    const x: Supplier = { ...s, id: id("s"), lastOrder: new Date().toISOString(), outstanding: 0, status:"Active" };
    SUPPLIERS.push(x); return delay(x);
  },
  createExpense: (e: Omit<Expense, "id">) => { const x: Expense = { ...e, id: id("e") }; EXPENSES.unshift(x); return delay(x); },
  createStaff: (s: Omit<Staff, "id" | "lastLogin" | "status">) => {
    const x: Staff = { ...s, id: id("st"), lastLogin: new Date().toISOString(), status:"Active" };
    STAFF.push(x); return delay(x);
  },
  createPrescription: (p: Omit<Prescription, "id" | "status">) => {
    const x: Prescription = { ...p, id: id("p"), status: "Pending" };
    PRESCRIPTIONS.unshift(x); return delay(x);
  },
  createPurchaseOrder: (supplierId: string, notes?: string) => {
    const s = SUPPLIERS.find(x => x.id === supplierId);
    if (s) s.lastOrder = new Date().toISOString();
    void notes;
    return delay({ orderNo: "PO-" + Math.floor(10000 + Math.random()*89999) });
  },

  // Attendance / Clock in-out
  getMyAttendanceToday: (staffName: string) =>
    delay(ATTENDANCE_TODAY.find(a => a.staffName === staffName) ?? null),
  clockIn: (staffId: string, staffName: string) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,"0");
    const mm = String(now.getMinutes()).padStart(2,"0");
    const time = `${hh}:${mm}`;
    let rec = ATTENDANCE_TODAY.find(a => a.staffName === staffName);
    const status: Attendance["status"] = now.getHours() >= 9 ? "Late" : "Present";
    if (rec) { rec.clockIn = time; rec.clockOut = null; rec.status = status; }
    else {
      rec = { id: id("a"), staffId, staffName, date: now.toISOString(), clockIn: time, clockOut: null, status };
      ATTENDANCE_TODAY.push(rec);
    }
    return delay(rec);
  },
  clockOut: (staffName: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const rec = ATTENDANCE_TODAY.find(a => a.staffName === staffName);
    if (!rec || !rec.clockIn) throw new Error("Not clocked in");
    rec.clockOut = time;
    return delay(rec);
  },
};

export const API_BASE_URL: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "https://api.medicare.example/v1";
