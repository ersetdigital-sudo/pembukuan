/**
 * Minimal, dependency-free CSV parser/writer.
 * Handles quoted fields (with embedded commas/newlines), CRLF/LF, and BOM.
 * Good enough for Excel/WPS/Sheets exports — avoids pulling in a heavy
 * spreadsheet library (e.g. SheetJS `xlsx`, which has known unpatched
 * prototype-pollution advisories on the npm registry) just to import a
 * simple product list.
 */

/** Parse CSV text into an array of string-array rows. */
export function parseCSV(text) {
  // Strip BOM if present (common with Excel-exported CSV files)
  const clean = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const next = clean[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r") {
      // skip, handled by \n below
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  // Flush last field/row (file may not end with a newline)
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop fully-empty trailing rows
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** Escape a single CSV field. */
function escapeCSVField(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Build CSV text from a header row + array of row arrays. */
export function toCSV(headers, rows) {
  const lines = [headers, ...rows].map((r) => r.map(escapeCSVField).join(","));
  // Prefix with BOM so Excel opens UTF-8 correctly (e.g. "∞" or accented chars)
  return "\uFEFF" + lines.join("\r\n");
}

/** Trigger a browser download for a text file. */
export function downloadTextFile(filename, content, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Loosely parse a numeric value that may contain "Rp", thousand
 * separators (dots or commas), or surrounding whitespace.
 * Returns 0 for empty/invalid input.
 */
export function parseLooseNumber(value) {
  if (value == null) return 0;
  const digits = String(value).replace(/[^\d-]/g, "");
  const num = parseInt(digits, 10);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Parse a date string in common spreadsheet formats into an ISO
 * "YYYY-MM-DD" string. Supports:
 *  - DD/MM/YYYY or D/M/YYYY (most common from Indonesian Excel exports)
 *  - YYYY-MM-DD (ISO, already correct)
 *  - DD-MM-YYYY
 * Returns null if the value can't be parsed as a valid date.
 */
export function parseFlexibleDate(value) {
  if (!value) return null;
  const str = String(value).trim();

  // Already ISO
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return isValidYMD(+y, +m, +d) ? `${y}-${pad(m)}-${pad(d)}` : null;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return isValidYMD(+y, +m, +d) ? `${y}-${pad(m)}-${pad(d)}` : null;
  }

  return null;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function isValidYMD(y, m, d) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
