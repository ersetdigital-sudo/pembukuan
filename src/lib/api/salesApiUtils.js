/**
 * Shared helpers for the /api/sales* agent-facing endpoints (route.js and
 * summary/route.js). Centralized so auth and date/invoice validation stay
 * consistent instead of being copy-pasted (and drifting) across files.
 */
import { parseFlexibleDate } from "@/lib/utils/csv";

export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function badRequest(message, details) {
  return Response.json({ error: message, details }, { status: 400 });
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Parses a `tanggal`-style field with two distinct outcomes: "not provided"
 * defaults to today with no error; "provided but malformed" returns an
 * error instead of silently defaulting to today. Silently falling back on
 * a bad date is dangerous: it can create/search a sale under the wrong
 * date without any indication something was off.
 */
export function parseDateField(raw) {
  if (raw === undefined || raw === null || raw === "") {
    return { value: todayISO(), error: null };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { value: raw, error: null };
  const parsed = parseFlexibleDate(raw);
  if (!parsed) {
    return { value: null, error: `Invalid tanggal "${raw}" — use DD/MM/YYYY or YYYY-MM-DD` };
  }
  return { value: parsed, error: null };
}

export const MAX_INVOICE_LENGTH = 100;

export function validateInvoiceFormat(value, fieldName = "invoice") {
  if (value.length > MAX_INVOICE_LENGTH) {
    return `\`${fieldName}\` too long (max ${MAX_INVOICE_LENGTH} characters)`;
  }
  return null;
}

/** Clamp a parsed number to be non-negative — defends against OCR/typo garbage like "-500". */
export function nonNegative(n) {
  return Math.max(0, n);
}

/** Shared auth check. Returns a Response to short-circuit with, or null if OK. */
export function checkAuth(request) {
  const apiKey = process.env.AGENT_API_KEY;
  if (!apiKey) {
    // Fail closed: if no key is configured, nobody can use this endpoint.
    return Response.json(
      { error: "Endpoint not configured. Set AGENT_API_KEY in environment." },
      { status: 503 }
    );
  }
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== apiKey) return unauthorized();
  return null;
}
