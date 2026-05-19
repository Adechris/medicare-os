// Realistic pharmacy mock data
import { addDays, subDays } from "date-fns";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Medicine {
  id: string;
  name: string;
  generic: string;
  category: string;
  brand: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  unit: string;
  reorderLevel: number;
  expiryDate: string;
  manufactureDate: string;
  batch: string;
  requiresPrescription: boolean;
  status: "Active" | "Inactive" | "Discontinued";
  image?: string;
}

export const CATEGORIES = [
  "Antibiotics",
  "Analgesics",
  "Vitamins",
  "Antimalaria",
  "Antifungal",
  "Cardiovascular",
  "Diabetic",
  "Skincare",
  "Syrup",
  "Injection",
  "Other",
];

const today = new Date();

export const MEDICINES: Medicine[] = [
  {
    id: "m1",
    name: "Amoxil 500mg",
    generic: "Amoxicillin",
    category: "Antibiotics",
    brand: "GSK",
    buyingPrice: 800,
    sellingPrice: 1200,
    stock: 240,
    unit: "capsules",
    reorderLevel: 50,
    expiryDate: addDays(today, 420).toISOString(),
    manufactureDate: subDays(today, 120).toISOString(),
    batch: "AMX2401",
    requiresPrescription: true,
    status: "Active",
  },
  {
    id: "m2",
    name: "Panadol Extra",
    generic: "Paracetamol + Caffeine",
    category: "Analgesics",
    brand: "GSK",
    buyingPrice: 350,
    sellingPrice: 500,
    stock: 18,
    unit: "tablets",
    reorderLevel: 40,
    expiryDate: addDays(today, 5).toISOString(),
    manufactureDate: subDays(today, 200).toISOString(),
    batch: "PND9920",
    requiresPrescription: false,
    status: "Active",
  },
  {
    id: "m3",
    name: "Vitamin C 1000mg",
    generic: "Ascorbic Acid",
    category: "Vitamins",
    brand: "Emzor",
    buyingPrice: 1200,
    sellingPrice: 1800,
    stock: 120,
    unit: "tablets",
    reorderLevel: 30,
    expiryDate: addDays(today, 540).toISOString(),
    manufactureDate: subDays(today, 90).toISOString(),
    batch: "VTC4410",
    requiresPrescription: false,
    status: "Active",
  },
  {
    id: "m4",
    name: "Coartem 80/480",
    generic: "Artemether/Lumefantrine",
    category: "Antimalaria",
    brand: "Novartis",
    buyingPrice: 1800,
    sellingPrice: 2500,
    stock: 0,
    unit: "strip",
    reorderLevel: 20,
    expiryDate: addDays(today, 260).toISOString(),
    manufactureDate: subDays(today, 160).toISOString(),
    batch: "COA7781",
    requiresPrescription: true,
    status: "Active",
  },
  {
    id: "m5",
    name: "Glucophage 500mg",
    generic: "Metformin",
    category: "Diabetic",
    brand: "Merck",
    buyingPrice: 900,
    sellingPrice: 1400,
    stock: 65,
    unit: "tablets",
    reorderLevel: 40,
    expiryDate: addDays(today, 210).toISOString(),
    manufactureDate: subDays(today, 80).toISOString(),
    batch: "GLP3320",
    requiresPrescription: true,
    status: "Active",
  },
  {
    id: "m6",
    name: "Lisinopril 10mg",
    generic: "Lisinopril",
    category: "Cardiovascular",
    brand: "Pfizer",
    buyingPrice: 1400,
    sellingPrice: 2100,
    stock: 90,
    unit: "tablets",
    reorderLevel: 25,
    expiryDate: addDays(today, 330).toISOString(),
    manufactureDate: subDays(today, 150).toISOString(),
    batch: "LSN5512",
    requiresPrescription: true,
    status: "Active",
  },
  {
    id: "m7",
    name: "Augmentin Syrup 312mg",
    generic: "Amoxicillin/Clavulanate",
    category: "Syrup",
    brand: "GSK",
    buyingPrice: 3500,
    sellingPrice: 4800,
    stock: 8,
    unit: "bottle",
    reorderLevel: 15,
    expiryDate: addDays(today, 25).toISOString(),
    manufactureDate: subDays(today, 90).toISOString(),
    batch: "AUG2210",
    requiresPrescription: true,
    status: "Active",
  },
  {
    id: "m8",
    name: "Loratadine 10mg",
    generic: "Loratadine",
    category: "Other",
    brand: "Cipla",
    buyingPrice: 600,
    sellingPrice: 900,
    stock: 140,
    unit: "tablets",
    reorderLevel: 30,
    expiryDate: addDays(today, 610).toISOString(),
    manufactureDate: subDays(today, 40).toISOString(),
    batch: "LRT0001",
    requiresPrescription: false,
    status: "Active",
  },
  {
    id: "m9",
    name: "Fluconazole 150mg",
    generic: "Fluconazole",
    category: "Antifungal",
    brand: "Fidson",
    buyingPrice: 500,
    sellingPrice: 850,
    stock: 55,
    unit: "capsules",
    reorderLevel: 25,
    expiryDate: addDays(today, 180).toISOString(),
    manufactureDate: subDays(today, 200).toISOString(),
    batch: "FLU7700",
    requiresPrescription: false,
    status: "Active",
  },
  {
    id: "m10",
    name: "Hydrocortisone Cream",
    generic: "Hydrocortisone 1%",
    category: "Skincare",
    brand: "GSK",
    buyingPrice: 1100,
    sellingPrice: 1700,
    stock: 30,
    unit: "tube",
    reorderLevel: 20,
    expiryDate: addDays(today, 440).toISOString(),
    manufactureDate: subDays(today, 70).toISOString(),
    batch: "HYD1010",
    requiresPrescription: false,
    status: "Active",
  },
  {
    id: "m11",
    name: "Vitamin B-Complex",
    generic: "B-Complex",
    category: "Vitamins",
    brand: "Emzor",
    buyingPrice: 700,
    sellingPrice: 1100,
    stock: 200,
    unit: "tablets",
    reorderLevel: 40,
    expiryDate: addDays(today, 720).toISOString(),
    manufactureDate: subDays(today, 30).toISOString(),
    batch: "VTB5520",
    requiresPrescription: false,
    status: "Active",
  },
  {
    id: "m12",
    name: "Ceftriaxone 1g Injection",
    generic: "Ceftriaxone",
    category: "Injection",
    brand: "Sandoz",
    buyingPrice: 2200,
    sellingPrice: 3200,
    stock: 12,
    unit: "vial",
    reorderLevel: 15,
    expiryDate: addDays(today, 60).toISOString(),
    manufactureDate: subDays(today, 180).toISOString(),
    batch: "CFT9090",
    requiresPrescription: true,
    status: "Active",
  },
];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalPurchases: number;
  outstandingDebt: number;
  lastVisit: string;
  loyaltyPoints: number;
  status: "Active" | "Inactive";
  bloodGroup?: string;
  allergies?: string;
  address?: string;
  dob?: string;
}

export const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Walk-in Customer",
    phone: "-",
    email: "-",
    totalPurchases: 0,
    outstandingDebt: 0,
    lastVisit: today.toISOString(),
    loyaltyPoints: 0,
    status: "Active",
  },
  {
    id: "c2",
    name: "Ngozi Adichie",
    phone: "+234 802 111 2233",
    email: "ngozi@mail.com",
    totalPurchases: 124500,
    outstandingDebt: 0,
    lastVisit: subDays(today, 2).toISOString(),
    loyaltyPoints: 124,
    status: "Active",
    bloodGroup: "O+",
    allergies: "Penicillin",
  },
  {
    id: "c3",
    name: "Femi Otedola",
    phone: "+234 803 444 5566",
    email: "femi@mail.com",
    totalPurchases: 88000,
    outstandingDebt: 12000,
    lastVisit: subDays(today, 5).toISOString(),
    loyaltyPoints: 88,
    status: "Active",
    bloodGroup: "A+",
  },
  {
    id: "c4",
    name: "Aisha Bello",
    phone: "+234 805 777 8899",
    email: "aisha@mail.com",
    totalPurchases: 45200,
    outstandingDebt: 0,
    lastVisit: subDays(today, 1).toISOString(),
    loyaltyPoints: 45,
    status: "Active",
    bloodGroup: "B+",
    allergies: "Sulfa drugs",
  },
  {
    id: "c5",
    name: "Emeka Nwosu",
    phone: "+234 807 222 3344",
    email: "emeka@mail.com",
    totalPurchases: 201300,
    outstandingDebt: 8500,
    lastVisit: subDays(today, 10).toISOString(),
    loyaltyPoints: 201,
    status: "Active",
    bloodGroup: "AB+",
  },
  {
    id: "c6",
    name: "Funke Akindele",
    phone: "+234 809 666 1010",
    email: "funke@mail.com",
    totalPurchases: 32000,
    outstandingDebt: 0,
    lastVisit: subDays(today, 30).toISOString(),
    loyaltyPoints: 32,
    status: "Inactive",
    bloodGroup: "O-",
  },
];

export interface Transaction {
  id: string;
  receiptNo: string;
  date: string;
  customerName: string;
  cashier: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: "Cash" | "Card" | "Transfer" | "Credit";
  status: "Completed" | "Refunded";
  items: { medicineId: string; name: string; qty: number; price: number }[];
}

export const TRANSACTIONS: Transaction[] = Array.from({ length: 24 }).map((_, i) => {
  const items = [
    { medicineId: "m1", name: "Amoxil 500mg", qty: (i % 3) + 1, price: 1200 },
    { medicineId: "m3", name: "Vitamin C 1000mg", qty: 1, price: 1800 },
  ];
  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const discount = i % 4 === 0 ? 200 : 0;
  const vat = Math.round((subtotal - discount) * 0.075);
  const methods: Transaction["paymentMethod"][] = ["Cash", "Card", "Transfer", "Credit"];
  const cashiers = ["Chioma Eze", "Tunde Adeyemi", "Dr. Amara Okafor"];
  return {
    id: `t${i + 1}`,
    receiptNo: `RCT-${(10240 + i).toString()}`,
    date: subDays(today, Math.floor(i / 3)).toISOString(),
    customerName: CUSTOMERS[i % CUSTOMERS.length].name,
    cashier: cashiers[i % cashiers.length],
    itemsCount: items.reduce((s, it) => s + it.qty, 0),
    subtotal,
    discount,
    vat,
    total: subtotal - discount + vat,
    paymentMethod: methods[i % 4],
    status: i === 7 ? "Refunded" : "Completed",
    items,
  };
});

export interface Prescription {
  id: string;
  patient: string;
  doctor: string;
  hospital: string;
  dateIssued: string;
  validUntil: string;
  status: "Pending" | "Partially Filled" | "Filled" | "Expired";
  medicines: { name: string; dosage: string; frequency: string; duration: string; qty: number }[];
  filledBy?: string;
}

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "p1",
    patient: "Ngozi Adichie",
    doctor: "Dr. Bello",
    hospital: "Reddington Hospital",
    dateIssued: subDays(today, 1).toISOString(),
    validUntil: addDays(today, 29).toISOString(),
    status: "Pending",
    medicines: [
      { name: "Amoxil 500mg", dosage: "500mg", frequency: "TID", duration: "7 days", qty: 21 },
      { name: "Panadol Extra", dosage: "500mg", frequency: "PRN", duration: "5 days", qty: 10 },
    ],
  },
  {
    id: "p2",
    patient: "Femi Otedola",
    doctor: "Dr. Adewale",
    hospital: "Lagoon Hospital",
    dateIssued: subDays(today, 3).toISOString(),
    validUntil: addDays(today, 27).toISOString(),
    status: "Partially Filled",
    medicines: [
      { name: "Lisinopril 10mg", dosage: "10mg", frequency: "OD", duration: "30 days", qty: 30 },
    ],
    filledBy: "Tunde Adeyemi",
  },
  {
    id: "p3",
    patient: "Aisha Bello",
    doctor: "Dr. Eze",
    hospital: "St. Nicholas",
    dateIssued: subDays(today, 7).toISOString(),
    validUntil: addDays(today, 23).toISOString(),
    status: "Filled",
    medicines: [
      { name: "Coartem 80/480", dosage: "4 tabs", frequency: "BID", duration: "3 days", qty: 24 },
    ],
    filledBy: "Tunde Adeyemi",
  },
];

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  lastOrder: string;
  outstanding: number;
  status: "Active" | "Inactive";
}

export const SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    name: "Mr. Adeola Bankole",
    company: "PharmaCare Distributors Ltd",
    phone: "+234 800 111 2222",
    email: "sales@pharmacare.ng",
    address: "23 Allen Ave, Ikeja",
    lastOrder: subDays(today, 5).toISOString(),
    outstanding: 250000,
    status: "Active",
  },
  {
    id: "s2",
    name: "Mrs. Funmi Lawal",
    company: "MediSource Nigeria",
    phone: "+234 800 333 4444",
    email: "orders@medisource.ng",
    address: "15 Broad St, Lagos Island",
    lastOrder: subDays(today, 12).toISOString(),
    outstanding: 0,
    status: "Active",
  },
  {
    id: "s3",
    name: "Mr. Ibrahim Sani",
    company: "Northern Pharma Supplies",
    phone: "+234 800 555 6666",
    email: "info@northpharma.ng",
    address: "7 Ahmadu Bello Way, Abuja",
    lastOrder: subDays(today, 30).toISOString(),
    outstanding: 75000,
    status: "Active",
  },
];

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  recordedBy: string;
}
export const EXPENSES: Expense[] = [
  {
    id: "e1",
    date: subDays(today, 1).toISOString(),
    category: "Restock",
    description: "Restock from PharmaCare",
    amount: 480000,
    recordedBy: "Admin",
  },
  {
    id: "e2",
    date: subDays(today, 3).toISOString(),
    category: "Utilities",
    description: "PHCN electricity",
    amount: 35000,
    recordedBy: "Admin",
  },
  {
    id: "e3",
    date: subDays(today, 5).toISOString(),
    category: "Salaries",
    description: "Staff salaries Apr",
    amount: 920000,
    recordedBy: "Admin",
  },
  {
    id: "e4",
    date: subDays(today, 9).toISOString(),
    category: "Maintenance",
    description: "Generator service",
    amount: 18500,
    recordedBy: "Admin",
  },
  {
    id: "e5",
    date: subDays(today, 15).toISOString(),
    category: "Equipment",
    description: "New POS printer",
    amount: 62000,
    recordedBy: "Admin",
  },
];

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  shift: "Morning" | "Afternoon" | "Night" | "Rotating";
  lastLogin: string;
  status: "Active" | "Suspended";
  salary: number;
  employmentDate: string;
}
export const STAFF: Staff[] = [
  {
    id: "st1",
    name: "Dr. Amara Okafor",
    role: "Admin",
    phone: "+234 802 000 0001",
    email: "admin@medicare.ng",
    shift: "Rotating",
    lastLogin: today.toISOString(),
    status: "Active",
    salary: 550000,
    employmentDate: "2022-01-15",
  },
  {
    id: "st2",
    name: "Tunde Adeyemi",
    role: "Pharmacist",
    phone: "+234 802 000 0002",
    email: "pharmacist@medicare.ng",
    shift: "Morning",
    lastLogin: subDays(today, 0).toISOString(),
    status: "Active",
    salary: 380000,
    employmentDate: "2022-04-10",
  },
  {
    id: "st3",
    name: "Chioma Eze",
    role: "Cashier",
    phone: "+234 802 000 0003",
    email: "cashier@medicare.ng",
    shift: "Afternoon",
    lastLogin: subDays(today, 0).toISOString(),
    status: "Active",
    salary: 180000,
    employmentDate: "2023-02-01",
  },
  {
    id: "st4",
    name: "Bola Ahmed",
    role: "Inventory Manager",
    phone: "+234 802 000 0004",
    email: "inventory@medicare.ng",
    shift: "Morning",
    lastLogin: subDays(today, 1).toISOString(),
    status: "Active",
    salary: 280000,
    employmentDate: "2022-09-20",
  },
  {
    id: "st5",
    name: "Yusuf Garba",
    role: "Cashier",
    phone: "+234 802 000 0005",
    email: "yusuf@medicare.ng",
    shift: "Night",
    lastLogin: subDays(today, 2).toISOString(),
    status: "Active",
    salary: 180000,
    employmentDate: "2024-03-12",
  },
];

export interface Attendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: "Present" | "Late" | "Absent";
}
export const ATTENDANCE_TODAY: Attendance[] = [
  {
    id: "a1",
    staffId: "st2",
    staffName: "Tunde Adeyemi",
    date: today.toISOString(),
    clockIn: "08:02",
    clockOut: null,
    status: "Present",
  },
  {
    id: "a2",
    staffId: "st3",
    staffName: "Chioma Eze",
    date: today.toISOString(),
    clockIn: "09:14",
    clockOut: null,
    status: "Late",
  },
  {
    id: "a3",
    staffId: "st4",
    staffName: "Bola Ahmed",
    date: today.toISOString(),
    clockIn: "07:55",
    clockOut: null,
    status: "Present",
  },
  {
    id: "a4",
    staffId: "st5",
    staffName: "Yusuf Garba",
    date: today.toISOString(),
    clockIn: null,
    clockOut: null,
    status: "Absent",
  },
];

// Revenue series for charts
export const REVENUE_30D = Array.from({ length: 30 }).map((_, i) => {
  const d = subDays(today, 29 - i);
  const base = 120000 + Math.sin(i / 3) * 40000 + Math.random() * 30000;
  return {
    date: d.toISOString().slice(0, 10),
    label: `${d.getDate()}/${d.getMonth() + 1}`,
    revenue: Math.round(base),
    expenses: Math.round(base * 0.55 + Math.random() * 15000),
    profit: Math.round(base * 0.35 + Math.random() * 10000),
  };
});

export const SALES_BY_CATEGORY = [
  { category: "Antibiotics", sales: 480000 },
  { category: "Vitamins", sales: 320000 },
  { category: "Analgesics", sales: 280000 },
  { category: "Antimalaria", sales: 240000 },
  { category: "Cardiovascular", sales: 195000 },
  { category: "Diabetic", sales: 170000 },
  { category: "Skincare", sales: 95000 },
];

export const TOP_SELLING = [
  { name: "Amoxil 500mg", category: "Antibiotics", units: 48, revenue: 57600 },
  { name: "Panadol Extra", category: "Analgesics", units: 36, revenue: 18000 },
  { name: "Vitamin C 1000mg", category: "Vitamins", units: 28, revenue: 50400 },
  { name: "Coartem 80/480", category: "Antimalaria", units: 22, revenue: 55000 },
  { name: "Glucophage 500mg", category: "Diabetic", units: 18, revenue: 25200 },
];
