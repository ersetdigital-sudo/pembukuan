/**
 * POST /api/sales — programmatic sale creation for external agents (e.g. Hermes).
 *
 * Auth: header `Authorization: Bearer <AGENT_API_KEY>` where AGENT_API_KEY is
 * an env var set separately from the Supabase keys. This endpoint is the
 * ONLY thing given to external agents — never the real Supabase key — so
 * access is limited to exactly this one action (insert a sale), not full
 * read/write on every table.
 *
 * Body shape (JSON):
 * {
 *   "tanggal": "2026-07-13",              // optional, defaults to today (YYYY-MM-DD or DD/MM/YYYY)
 *   "nama_pembeli": "Pratu Andika Fendi",  // required
 *   "no_hp": "6282115423635",              // required
 *   "marketplace": "Shopee",               // required, must exist in Settings > Marketplaces
 *   "invoice": "260713JRFHDAPJ",           // required (marketplace order number)
 *   "fee_mp": 14701,                       // optional, Fee MP for this transaction
 *   "produk": [                            // required, at least 1 item, each needs nama_produk + qty
 *     { "nama_produk": "Elementor Pro", "qty": 1 }
 *   ]
 * }
 *
 * Price (harga_jual / harga_beli) is ALWAYS looked up from the `stocks`
 * table by nama_produk — the caller never sends a price, same rule as the
 * CSV import feature, so numbers can't drift from the product catalog.
 */
import { getServerSupabase } from "@/lib/supabase/serverClient";
import { parseFlexibleDate, parseLooseNumber } from "@/lib/utils/csv";

function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

function badRequest(message, details) {
  return Response.json({ error: message, details }, { status: 400 });
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function normalizeDate(raw) {
  if (!raw) return todayISO();
  // Accept plain ISO directly, otherwise try the flexible DD/MM/YYYY parser.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = parseFlexibleDate(raw);
  return parsed || todayISO();
}

export async function POST(request) {
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
  if (!token || token !== apiKey) {
    return unauthorized();
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const {
    tanggal: tanggalRaw,
    nama_pembeli = "",
    no_hp = "",
    username_domain = "",
    marketplace = "",
    invoice = "",
    fee_mp: feeRaw = 0,
    produk: produkRaw,
  } = body || {};

  // Required fields: nama_pembeli, no_hp, marketplace, invoice, and produk
  // (each item needs nama_produk + qty). Collect ALL missing fields at once
  // so the caller (Hermes) gets one clear error instead of fixing-and-retrying
  // field by field.
  const missing = [];
  if (!nama_pembeli || !String(nama_pembeli).trim()) missing.push("nama_pembeli");
  if (!no_hp || !String(no_hp).trim()) missing.push("no_hp");
  if (!marketplace || typeof marketplace !== "string" || !marketplace.trim()) missing.push("marketplace");
  if (!invoice || !String(invoice).trim()) missing.push("invoice");
  if (!Array.isArray(produkRaw) || produkRaw.length === 0) {
    missing.push("produk (non-empty array)");
  } else {
    produkRaw.forEach((p, i) => {
      if (!p?.nama_produk || !String(p.nama_produk).trim()) missing.push(`produk[${i}].nama_produk`);
      if (p?.qty == null || Number(p.qty) <= 0) missing.push(`produk[${i}].qty`);
    });
  }
  if (missing.length > 0) {
    return badRequest("Missing required fields", { missing });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: "Supabase not configured on server" }, { status: 503 });
  }

  const { data: stocks, error: stockErr } = await supabase
    .from("stocks")
    .select("nama_produk, kategori, harga_jual, harga_beli");
  if (stockErr) {
    return Response.json({ error: "Failed to read product catalog", details: stockErr.message }, { status: 500 });
  }

  const stockLookup = new Map(
    (stocks || []).map((s) => [(s.nama_produk || "").trim().toLowerCase(), s])
  );

  const notFound = [];
  const produk = produkRaw.map((p) => {
    const nama_produk = (p.nama_produk || "").trim();
    const qty = Math.max(1, parseLooseNumber(p.qty) || 1);
    const match = stockLookup.get(nama_produk.toLowerCase());
    if (!match) {
      notFound.push(nama_produk);
      return null;
    }
    return {
      nama_produk: match.nama_produk,
      kategori_produk: match.kategori || "",
      qty,
      harga_jual: match.harga_jual || 0,
      harga_beli: match.harga_beli || 0,
    };
  });

  if (notFound.length > 0) {
    return badRequest("Produk tidak ditemukan di data Produk", { notFound });
  }

  const tanggal = normalizeDate(tanggalRaw);
  const fee_mp = parseLooseNumber(feeRaw);
  const first = produk[0];

  const newSale = {
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tanggal,
    nama_pembeli: (nama_pembeli || "").trim(),
    no_hp: (no_hp || "").trim(),
    username_domain: (username_domain || "").trim(),
    marketplace: marketplace.trim(),
    invoice: (invoice || "").trim(),
    fee_mp,
    produk,
    // Legacy-compat flat fields (first product), same convention used
    // by the manual form and the CSV importer.
    nama_produk: first.nama_produk,
    kategori_produk: first.kategori_produk,
    qty: first.qty,
    harga_jual: first.harga_jual,
    harga_beli: first.harga_beli,
    created_by: "hermes-agent",
    created_date: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("sales").insert(newSale).select().single();
  if (error) {
    return Response.json({ error: "Failed to insert sale", details: error.message }, { status: 500 });
  }

  return Response.json({ success: true, sale: data }, { status: 201 });
}

/** Reject non-POST methods explicitly instead of falling through to a generic 404. */
export async function GET() {
  return Response.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}
