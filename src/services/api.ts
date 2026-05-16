// Centralized API layer — wired up to mock data now, swap for PHP REST later.
// All real requests will go through this file using axios + TanStack Query.
//
// Example:
//   const baseURL = import.meta.env.VITE_API_BASE_URL;
//   const api = axios.create({ baseURL });
//   api.interceptors.request.use(cfg => {
//     const token = localStorage.getItem("medicare_auth");
//     if (token) cfg.headers.Authorization = `Bearer ${token}`;
//     return cfg;
//   });
//
// Each function below already has the shape the PHP backend should match.

import {
  MEDICINES, CUSTOMERS, TRANSACTIONS, PRESCRIPTIONS,
  SUPPLIERS, EXPENSES, STAFF, ATTENDANCE_TODAY,
  REVENUE_30D, SALES_BY_CATEGORY, TOP_SELLING,
} from "@/mock/data";

const delay = <T,>(d: T, ms = 350) => new Promise<T>(r => setTimeout(() => r(d), ms));

export const api = {
  // Medicines
  listMedicines: () => delay(MEDICINES),
  // Customers
  listCustomers: () => delay(CUSTOMERS),
  // Transactions
  listTransactions: () => delay(TRANSACTIONS),
  // Prescriptions
  listPrescriptions: () => delay(PRESCRIPTIONS),
  // Suppliers
  listSuppliers: () => delay(SUPPLIERS),
  // Expenses
  listExpenses: () => delay(EXPENSES),
  // Staff
  listStaff: () => delay(STAFF),
  // Attendance
  listAttendanceToday: () => delay(ATTENDANCE_TODAY),
  // Dashboard
  revenue30d: () => delay(REVENUE_30D),
  salesByCategory: () => delay(SALES_BY_CATEGORY),
  topSelling: () => delay(TOP_SELLING),
};

export const API_BASE_URL: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "https://api.medicare.example/v1";
