const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  if (d < MIN) return "just now";
  if (d < HOUR) return `${Math.floor(d / MIN)}m ago`;
  if (d < DAY) return `${Math.floor(d / HOUR)}h ago`;
  if (d < 7 * DAY) return `${Math.floor(d / DAY)}d ago`;
  return shortDate(iso);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function shortDate(iso: string): string {
  const x = new Date(iso);
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
}
export function longDate(iso: string): string {
  const x = new Date(iso);
  return `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
}
export function clock(iso: string): string {
  const x = new Date(iso);
  const h = x.getHours();
  return `${h % 12 || 12}:${String(x.getMinutes()).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
export function greeting(): string {
  const h = new Date().getHours();
  return h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
export const firstName = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts[0] === "Mohd" && parts[1]) return parts[1];
  return parts.length > 2 ? parts.slice(0, 2).join(" ") : parts[0];
};
export const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
export const maskPhone = (p: string) => p.replace(/\d(?=\d{3})/g, "•");

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => v.replace(/\D/g, "").length >= 9;
export function passwordScore(pw: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s as 0 | 1 | 2 | 3 | 4;
}
