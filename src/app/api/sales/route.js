/**
 * /api/sales — programmatic sale create + edit for external agents (e.g. Hermes).
 *
 * Auth: header `Authorization: Bearer <AGENT_API_KEY>` where AGENT_API_KEY is
 * an env var set separately from the Supabase keys. This endpoint is the
 * ONLY thing given to external agents — never the real Supabase key — so
 * access is limited to exactly these two actions (create/update a sale),
 * not full read/write on every table.
 *
 * ── POST — create a new sale ──────────────────────────────────────────
 * Body shape (JSON):
 * {
 *   "tanggal": "2026-07-13",              // optional, defaults to today (YYYY-MM-DD or DD/MM/YYYY)
 *   "nama_pembeli": "Pratu Andika Fendi",  // required
 *   "no_hp": "6282115423635",              // required
 *   "username_domain": "andika_fnd",       // optional — only send if mentioned (e.g. Shopee/social username)
 *   "marketplace": "Shopee",               // required, must exist in Settings > Marketplaces
 *   "invoice": "260713JRFHDAPJ",           // required (marketplace order number)
 *   "fee_mp": 14701,                       // optional, Fee MP for this transaction
 *   "produk": [                            // required, at least 1 item, each needs nama_produk + qty
 *     {
 *       "nama_produk": "Elementor Pro",
 *       "qty": 1,
 *       "masa_aktif": "1 Tahun",          // optional
 *       "harga_jual_aktual": 47195        // optional — actual price paid (e.g. after
 *                                         //   marketplace discount). Omit to use the
 *                                         //   catalog price. harga_beli (modal) is
 *                                         //   ALWAYS from the catalog, never overridable.
 *     }
 *   ]
 * }
 *
 * ── PATCH — edit an existing sale ─────────────────────────────────────
 * Find the sale by `invoice` (the marketplace order number — Hermes doesn't
 * know our internal row id, only what's visible on the screenshot) and
 * update whichever fields are sent. Everything except `invoice` is optional;
 * only the fields you include get changed.
 * {
 *   "invoice": "260713JRFHDAPJ",           // required — identifies which sale to edit
 *   "nama_pembeli": "...",                 // optional
 *   "no_hp": "...",                        // optional
 *   "username_domain": "...",              // optional
 *   "marketplace": "...",                  // optional
 *   "fee_mp": 20000,                       // optional
 *   "produk": [ { "nama_produk": "...", "qty": 2, "harga_jual_aktual": 47195 } ]  // optional — replaces the whole product list
 * }
 *
 * Price: harga_beli (modal) is ALWAYS looked up from the `stocks` table by
 * nama_produk. harga_jual defaults to the catalog price too, but can be
 * overridden per item via `harga_jual_aktual` — useful when the marketplace
 * applied a discount/voucher so the customer paid less than the catalog
 * price, keeping profit calculations accurate.
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

/** Shared auth check. Returns a Response to short-circuit with, or null if OK. */
function checkAuth(request) {
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

/**
 * Resolve a `produk` array (from the request) against the `stocks` catalog.
 * Returns { produk, notFound } — notFound lists any nama_produk not in the
 * catalog, in which case `produk` entries for those items are null.
 *
 * harga_beli (modal) ALWAYS comes from the catalog — it doesn't change just
 * because the marketplace ran a discount. harga_jual, however, may be
 * overridden per item via `harga_jual_aktual` when the marketplace applied
 * a discount/voucher, so profit stays accurate against what was actually
 * paid (e.g. Shopee showing "Rp 47.195" instead of the catalog's Rp 48.500).
 * If omitted, harga_jual falls back to the catalog price as before.
 */
async function resolveProdukPrices(supabase, produkRaw) {
  const { data: stocks, error: stockErr } = await supabase
    .from("stocks")
    .select("nama_produk, kategori, harga_jual, harga_beli");
  if (stockErr) {
    return { error: stockErr.message };
  }

  const stockLookup = new Map(
    (stocks || []).map((s) => [(s.nama_produk || "").trim().toLowerCase(), s])
  );

  const notFound = [];
  const produk = produkRaw.map((p) => {
    const nama_produk = (p.nama_produk || "").trim();
    const qty = Math.max(1, parseLooseNumber(p.qty) || 1);
    const masa_aktif = (p.masa_aktif || "").trim();
    const match = stockLookup.get(nama_produk.toLowerCase());
    if (!match) {
      notFound.push(nama_produk);
      return null;
    }
    // Optional per-item override for the actual sale price (e.g. after a
    // marketplace discount). harga_beli is never overridable — modal cost
    // is unaffected by the marketplace's price the customer saw.
    const hasOverride = p.harga_jual_aktual != null && String(p.harga_jual_aktual).trim() !== "";
    const harga_jual = hasOverride
      ? parseLooseNumber(p.harga_jual_aktual)
      : match.harga_jual || 0;
    return {
      nama_produk: match.nama_produk,
      kategori_produk: match.kategori || "",
      masa_aktif,
      qty,
      harga_jual,
      harga_beli: match.harga_beli || 0,
    };
  });

  return { produk, notFound };
}

export async function POST(request) {
  const authError = checkAuth(request);
  if (authError) return authError;

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

  const { produk, notFound, error: lookupErr } = await resolveProdukPrices(supabase, produkRaw);
  if (lookupErr) {
    return Response.json({ error: "Failed to read product catalog", details: lookupErr }, { status: 500 });
  }
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
    masa_aktif: first.masa_aktif,
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

export async function PATCH(request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const {
    invoice,
    tanggal: tanggalRaw,
    nama_pembeli,
    no_hp,
    username_domain,
    marketplace,
    fee_mp: feeRaw,
    produk: produkRaw,
  } = body || {};

  if (!invoice || !String(invoice).trim()) {
    return badRequest("`invoice` is required to identify which sale to edit");
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: "Supabase not configured on server" }, { status: 503 });
  }

  // Find the sale by invoice (the marketplace order number visible on the
  // screenshot) rather than our internal row id, which the caller never sees.
  const { data: existing, error: findErr } = await supabase
    .from("sales")
    .select("*")
    .eq("invoice", invoice.trim())
    .limit(1)
    .maybeSingle();

  if (findErr) {
    return Response.json({ error: "Failed to look up sale", details: findErr.message }, { status: 500 });
  }
  if (!existing) {
    return Response.json({ error: `No sale found with invoice "${invoice}"` }, { status: 404 });
  }

  // Build a partial update — only fields actually present in the request body change.
  const patch = {};
  if (tanggalRaw !== undefined) patch.tanggal = normalizeDate(tanggalRaw);
  if (nama_pembeli !== undefined) patch.nama_pembeli = String(nama_pembeli).trim();
  if (no_hp !== undefined) patch.no_hp = String(no_hp).trim();
  if (username_domain !== undefined) patch.username_domain = String(username_domain).trim();
  if (marketplace !== undefined) patch.marketplace = String(marketplace).trim();
  if (feeRaw !== undefined) patch.fee_mp = parseLooseNumber(feeRaw);

  if (produkRaw !== undefined) {
    if (!Array.isArray(produkRaw) || produkRaw.length === 0) {
      return badRequest("`produk` must be a non-empty array of { nama_produk, qty } when provided");
    }
    const missing = [];
    produkRaw.forEach((p, i) => {
      if (!p?.nama_produk || !String(p.nama_produk).trim()) missing.push(`produk[${i}].nama_produk`);
      if (p?.qty == null || Number(p.qty) <= 0) missing.push(`produk[${i}].qty`);
    });
    if (missing.length > 0) {
      return badRequest("Missing required fields", { missing });
    }

    const { produk, notFound, error: lookupErr } = await resolveProdukPrices(supabase, produkRaw);
    if (lookupErr) {
      return Response.json({ error: "Failed to read product catalog", details: lookupErr }, { status: 500 });
    }
    if (notFound.length > 0) {
      return badRequest("Produk tidak ditemukan di data Produk", { notFound });
    }

    const first = produk[0];
    patch.produk = produk;
    patch.nama_produk = first.nama_produk;
    patch.kategori_produk = first.kategori_produk;
    patch.masa_aktif = first.masa_aktif;
    patch.qty = first.qty;
    patch.harga_jual = first.harga_jual;
    patch.harga_beli = first.harga_beli;
  }

  if (Object.keys(patch).length === 0) {
    return badRequest("No fields to update — include at least one field besides `invoice`");
  }

  const { data, error } = await supabase
    .from("sales")
    .update(patch)
    .eq("id", existing.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Failed to update sale", details: error.message }, { status: 500 });
  }

  return Response.json({ success: true, sale: data }, { status: 200 });
}

/** Reject other methods explicitly instead of falling through to a generic 404. */
export async function GET() {
  return Response.json({ error: "Method not allowed. Use POST or PATCH." }, { status: 405 });
}
