/**
 * Currency & number formatters (Indonesian locale).
 */

export function formatRupiah(n) {
  if (n == null || isNaN(n)) return "Rp 0";
  const num = Math.round(Number(n));
  return "Rp " + num.toLocaleString("id-ID");
}

export function formatRupiahShort(n) {
  if (n == null || isNaN(n)) return "Rp 0";
  const num = Math.abs(Number(n));
  if (num >= 1_000_000_000) return "Rp " + (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000_000) return "Rp " + (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "jt";
  if (num >= 1_000) return "Rp " + (num / 1_000).toFixed(0) + "rb";
  return "Rp " + num.toLocaleString("id-ID");
}

export function formatNumber(n) {
  if (n == null || isNaN(n)) return "0";
  return Math.round(Number(n)).toLocaleString("id-ID");
}

export function formatPercent(n, decimals = 1) {
  if (n == null || isNaN(n)) return "0%";
  return Number(n).toFixed(decimals) + "%";
}

export function formatDate(s) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return s;
  }
}

export function formatDateLong(s) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return s;
  }
}
