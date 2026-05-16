import { format } from "date-fns";

export function formatNaira(n: number): string {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function formatNumber(n: number): string {
  return n.toLocaleString("en-NG");
}
export function formatDate(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return format(dt, "EEE, d MMM yyyy · HH:mm");
}
export function formatDateShort(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return format(dt, "d MMM yyyy");
}
export function daysUntil(d: Date | string): number {
  const dt = typeof d === "string" ? new Date(d) : d;
  const diff = dt.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
