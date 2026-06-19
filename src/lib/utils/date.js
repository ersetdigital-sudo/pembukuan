/**
 * Date helpers. Locale defaults to id-ID.
 */
import { format, parseISO, isValid, startOfMonth, endOfMonth, subMonths, subDays, isAfter, isBefore } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export function fmtDate(d, pattern = "d MMM yyyy", locale = idLocale) {
  if (!d) return "-";
  const date = typeof d === "string" ? parseISO(d) : d;
  if (!isValid(date)) return "-";
  return format(date, pattern, { locale });
}

export function fmtDay(d) {
  return fmtDate(d, "EEEE, d MMMM yyyy");
}

export function fmtMonthYear(d) {
  return fmtDate(d, "MMMM yyyy");
}

export function inRange(d, from, to) {
  if (!d) return false;
  const date = typeof d === "string" ? parseISO(d) : d;
  if (!isValid(date)) return false;
  const a = from ? new Date(from) : null;
  const b = to ? new Date(to) : null;
  if (a && isBefore(date, a)) return false;
  if (b && isAfter(date, b)) return false;
  return true;
}

export function monthStart(year, monthIdx) {
  return new Date(year, monthIdx, 1);
}

export function monthEnd(year, monthIdx) {
  return new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
}

export function lastNMonths(n, fromDate = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = subMonths(fromDate, i);
    out.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return out;
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export { startOfMonth, endOfMonth, subMonths, subDays, isAfter, isBefore, parseISO, isValid, format };
