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
 * Find the sale EITHER by `invoice`, OR by `tanggal` + `nama_pembeli`
 * (+ optional `nama_produk` to disambiguate) when the invoice isn't known
 * (e.g. updating straight from a CSV that only has date/name/product).
 * {
 *   "invoice": "260713JRFHDAPJ",           // option A — identifies the sale directly
 *   // OR, if invoice is unknown:
 *   "tanggal": "13/07/2026",               // option B — combine with nama_pembeli
 *   "nama_pembeli": "Rais Jaka Purnama",   //   (required together with tanggal for option B)
 *   "nama_produk": "Elementor Pro",        //   optional, narrows down if ambiguous
 *
 *   // fields to change (everything below is optional; only included fields change):
 *   "new_invoice": "2607098BWVP1DY",       // optional — RENAMES the invoice (e.g. replacing a
 *                                         //   placeholder created via POST with the real
 *                                         //   marketplace order number from a CSV). Rejected
 *                                         //   with 409 if another sale already has this invoice.
 *   "no_hp": "...",
 *   "username_domain": "...",
 *   "marketplace": "...",
 *   "fee_mp": 20000,
 *   "produk": [ { "nama_produk": "...", "qty": 2, "harga_jual_aktual": 47195 } ]  // replaces the whole product list
 * }
 *
 * If the tanggal+nama_pembeli combo matches more than one sale and
 * nama_produk doesn't narrow it down to exactly one, the response is 409
 * with a `candidates` list (invoice + produk per candidate) instead of
 * guessing which one to update.
 *
 * Price: harga_beli (modal) is ALWAYS looked up from the `stocks` table by
 * nama_produk. harga_jual defaults to the catalog price too, but can be
 * overridden per item via `harga_jual_aktual` — useful when the marketplace
 * applied a discount/voucher so the customer paid less than the catalog
 * price, keeping profit calculations accurate.
 *
 * ── GET — search sales (find the invoice, then PATCH) ────────────────
 * Query params (at least one required): nama_pembeli, tanggal, marketplace,
 * invoice. Partial, case-insensitive match on nama_pembeli/marketplace;
 * exact match on tanggal (DD/MM/YYYY or YYYY-MM-DD) and invoice.
 *   GET /api/sales?nama_pembeli=Rais&tanggal=13/07/2026
 * Returns up to 20 matches: { results: [{ id, tanggal, invoice, nama_pembeli,
 * no_hp, username_domain, marketplace, fee_mp, produk }, ...] }
 *
 * ── Need aggregated totals instead of raw rows? ───────────────────────
 * See GET /api/sales/summary (separate route) for a daily/range recap —
 * total omzet, total fee, best-selling product, per-marketplace breakdown.
 */
import { getServerSupabase } from "@/lib/supabase/serverClient";
import { parseLooseNumber } from "@/lib/utils/csv";
import {
  badRequest,
  checkAuth,
  nonNegative,
  parseDateField,
  validateInvoiceFormat,
} from "@/lib/api/salesApiUtils";

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

  const invoiceTrimmed = String(invoice).trim();
  const invoiceLenErr = validateInvoiceFormat(invoiceTrimmed);
  if (invoiceLenErr) {
    return badRequest(invoiceLenErr);
  }

  const { value: tanggal, error: dateErr } = parseDateField(tanggalRaw);
  if (dateErr) {
    return badRequest(dateErr);
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: "Supabase not configured on server" }, { status: 503 });
  }

  // Anti-duplicate guard: reject outright if a sale with this invoice
  // already exists. Without this, a retried/duplicate POST (e.g. Hermes
  // re-sending after a timeout, or the same CSV row processed twice) would
  // silently create a second sale row sharing the same invoice number.
  // Callers that actually want to edit an existing sale should use PATCH.
  const { data: dupe, error: dupeErr } = await supabase
    .from("sales")
    .select("id")
    .eq("invoice", invoiceTrimmed)
    .limit(1)
    .maybeSingle();
  if (dupeErr) {
    return Response.json({ error: "Failed to check for duplicate invoice", details: dupeErr.message }, { status: 500 });
  }
  if (dupe) {
    return Response.json(
      {
        error: `A sale with invoice "${invoiceTrimmed}" already exists. Use PATCH to edit it instead of POST.`,
        existingSaleId: dupe.id,
      },
      { status: 409 }
    );
  }

  const { produk, notFound, error: lookupErr } = await resolveProdukPrices(supabase, produkRaw);
  if (lookupErr) {
    return Response.json({ error: "Failed to read product catalog", details: lookupErr }, { status: 500 });
  }
  if (notFound.length > 0) {
    return badRequest("Produk tidak ditemukan di data Produk", { notFound });
  }

  const fee_mp = nonNegative(parseLooseNumber(feeRaw));
  const first = produk[0];

  const newSale = {
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tanggal,
    nama_pembeli: (nama_pembeli || "").trim(),
    no_hp: (no_hp || "").trim(),
    username_domain: (username_domain || "").trim(),
    marketplace: marketplace.trim(),
    invoice: invoiceTrimmed,
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

  // Insert with a final DB-level unique check via .select() — if a race
  // condition let two concurrent requests both pass the pre-check above,
  // this catches a Postgres unique-violation error (23505) if one exists;
  // otherwise it's still safe because the pre-check covers the common case
  // (sequential retries, which is what Hermes actually does).
  const { data, error } = await supabase.from("sales").insert(newSale).select().single();
  if (error) {
    if (error.code === "23505") {
      return Response.json(
        { error: `A sale with invoice "${invoiceTrimmed}" already exists (race condition detected).` },
        { status: 409 }
      );
    }
    return Response.json({ error: "Failed to insert sale", details: error.message }, { status: 500 });
  }

  return Response.json({ success: true, sale: data }, { status: 201 });
}

/** Format a sale row into a compact shape for search results / ambiguity listings. */
function summarizeSale(sale) {
  return {
    id: sale.id,
    tanggal: sale.tanggal,
    invoice: sale.invoice,
    nama_pembeli: sale.nama_pembeli,
    no_hp: sale.no_hp,
    username_domain: sale.username_domain,
    marketplace: sale.marketplace,
    fee_mp: sale.fee_mp,
    produk: sale.produk,
  };
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
    new_invoice: newInvoiceRaw,
    tanggal: tanggalRaw,
    nama_pembeli,
    nama_produk: namaProdukFilter,
    no_hp,
    username_domain,
    marketplace,
    fee_mp: feeRaw,
    produk: produkRaw,
  } = body || {};

  const hasInvoice = invoice && String(invoice).trim();
  const hasNameLookup = tanggalRaw && nama_pembeli && String(nama_pembeli).trim();

  if (!hasInvoice && !hasNameLookup) {
    return badRequest(
      "Provide either `invoice`, or `tanggal` + `nama_pembeli` (optionally with `nama_produk`), to identify which sale to edit"
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: "Supabase not configured on server" }, { status: 503 });
  }

  let existing;

  if (hasInvoice) {
    // Find the sale by invoice (the marketplace order number visible on the
    // screenshot) rather than our internal row id, which the caller never sees.
    const { data, error: findErr } = await supabase
      .from("sales")
      .select("*")
      .eq("invoice", invoice.trim())
      .limit(1)
      .maybeSingle();
    if (findErr) {
      return Response.json({ error: "Failed to look up sale", details: findErr.message }, { status: 500 });
    }
    if (!data) {
      return Response.json({ error: `No sale found with invoice "${invoice}"` }, { status: 404 });
    }
    existing = data;
  } else {
    // Fallback lookup when invoice isn't known: tanggal + nama_pembeli
    // (case-insensitive), optionally narrowed by nama_produk. Use the
    // strict date parser here — a malformed tanggal must error out, not
    // silently search under today's date and return the wrong sale (or
    // none at all) without any indication something was off.
    const { value: tanggal, error: dateErr } = parseDateField(tanggalRaw);
    if (dateErr) {
      return badRequest(dateErr);
    }
    const { data: matches, error: findErr } = await supabase
      .from("sales")
      .select("*")
      .eq("tanggal", tanggal)
      .ilike("nama_pembeli", nama_pembeli.trim());
    if (findErr) {
      return Response.json({ error: "Failed to look up sale", details: findErr.message }, { status: 500 });
    }

    let candidates = matches || [];
    if (namaProdukFilter) {
      const needle = String(namaProdukFilter).trim().toLowerCase();
      candidates = candidates.filter((s) =>
        (s.produk || []).some((p) => (p.nama_produk || "").toLowerCase().includes(needle)) ||
        (s.nama_produk || "").toLowerCase().includes(needle)
      );
    }

    if (candidates.length === 0) {
      return Response.json(
        { error: `No sale found for "${nama_pembeli}" on ${tanggal}` },
        { status: 404 }
      );
    }
    if (candidates.length > 1) {
      return Response.json(
        {
          error: "Multiple sales match — include `nama_produk` or use `invoice` to pick one",
          candidates: candidates.map(summarizeSale),
        },
        { status: 409 }
      );
    }
    existing = candidates[0];
  }

  // Build a partial update — only fields actually present in the request body change.
  // Note: when using name-based lookup (else branch above), tanggalRaw was
  // already validated via parseDateField before the lookup ran, so it's
  // safe to reparse here (same value, no new failure mode introduced).
  const patch = {};
  if (tanggalRaw !== undefined) {
    const { value: patchTanggal, error: patchDateErr } = parseDateField(tanggalRaw);
    if (patchDateErr) return badRequest(patchDateErr);
    patch.tanggal = patchTanggal;
  }
  if (nama_pembeli !== undefined) patch.nama_pembeli = String(nama_pembeli).trim();
  if (no_hp !== undefined) patch.no_hp = String(no_hp).trim();
  if (username_domain !== undefined) patch.username_domain = String(username_domain).trim();
  if (marketplace !== undefined) patch.marketplace = String(marketplace).trim();
  if (feeRaw !== undefined) patch.fee_mp = nonNegative(parseLooseNumber(feeRaw));

  if (newInvoiceRaw !== undefined) {
    const newInvoice = String(newInvoiceRaw).trim();
    if (!newInvoice) {
      return badRequest("`new_invoice` cannot be empty");
    }
    const newInvoiceLenErr = validateInvoiceFormat(newInvoice, "new_invoice");
    if (newInvoiceLenErr) {
      return badRequest(newInvoiceLenErr);
    }
    if (newInvoice !== existing.invoice) {
      // Guard against collisions: two sales can't share the same invoice,
      // since invoice is how PATCH/GET look sales up elsewhere.
      const { data: clash, error: clashErr } = await supabase
        .from("sales")
        .select("id")
        .eq("invoice", newInvoice)
        .limit(1)
        .maybeSingle();
      if (clashErr) {
        return Response.json({ error: "Failed to check invoice uniqueness", details: clashErr.message }, { status: 500 });
      }
      if (clash) {
        return Response.json(
          { error: `Invoice "${newInvoice}" is already used by another sale` },
          { status: 409 }
        );
      }
      patch.invoice = newInvoice;
    }
  }

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

export async function GET(request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const namaPembeli = searchParams.get("nama_pembeli");
  const tanggalRaw = searchParams.get("tanggal");
  const marketplaceQ = searchParams.get("marketplace");
  const invoiceQ = searchParams.get("invoice");

  if (!namaPembeli && !tanggalRaw && !marketplaceQ && !invoiceQ) {
    return badRequest(
      "Provide at least one query param: nama_pembeli, tanggal, marketplace, or invoice"
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: "Supabase not configured on server" }, { status: 503 });
  }

  let query = supabase.from("sales").select("*").order("created_date", { ascending: false }).limit(20);
  if (namaPembeli) query = query.ilike("nama_pembeli", `%${namaPembeli}%`);
  if (tanggalRaw) {
    const { value: searchTanggal, error: dateErr } = parseDateField(tanggalRaw);
    if (dateErr) return badRequest(dateErr);
    query = query.eq("tanggal", searchTanggal);
  }
  if (marketplaceQ) query = query.ilike("marketplace", `%${marketplaceQ}%`);
  if (invoiceQ) query = query.eq("invoice", invoiceQ.trim());

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: "Search failed", details: error.message }, { status: 500 });
  }

  return Response.json({ results: (data || []).map(summarizeSale) }, { status: 200 });
}

/** Reject other methods explicitly instead of falling through to a generic 404. */
export async function DELETE() {
  return Response.json({ error: "Method not allowed. Use POST, PATCH, or GET." }, { status: 405 });
}
