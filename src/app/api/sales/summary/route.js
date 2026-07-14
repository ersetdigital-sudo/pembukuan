/**
 * GET /api/sales/summary — aggregated sales report for external agents
 * (e.g. Hermes daily recap cronjob). Read-only; never modifies data.
 *
 * Auth: same as /api/sales — header `Authorization: Bearer <AGENT_API_KEY>`.
 *
 * Query params (mutually exclusive — choose ONE mode):
 *   ?tanggal=2026-07-14                 — single day (YYYY-MM-DD or DD/MM/YYYY)
 *   ?dari=2026-07-01&sampai=2026-07-14   — inclusive date range
 * If neither is given, defaults to today (`tanggal` = today).
 * Optional: &marketplace=Shopee to filter the summary to one marketplace.
 *
 * Response shape:
 * {
 *   "success": true,
 *   "summary": {
 *     "tanggal": "2026-07-14",            // present for single-day mode
 *     "dari": "2026-07-01", "sampai": "2026-07-14", // present for range mode
 *     "total_transaksi": 4,
 *     "total_omzet": 160195,              // sum of harga_jual * qty across all produk
 *     "total_fee_mp": 37605,
 *     "total_net": 122590,                // total_omzet - total_fee_mp
 *     "produk_terlaris": { "nama_produk": "...", "qty": 2, "total": 97195 } | null,
 *     "per_marketplace": {
 *       "Shopee": { "transaksi": 3, "omzet": 101395 },
 *       "WhatsApp": { "transaksi": 1, "omzet": 58800 }
 *     }
 *   },
 *   "detail": [
 *     { "invoice": "...", "nama_pembeli": "...", "nama_produk": "...",
 *       "qty": 1, "harga_jual": 58800, "fee_mp": 10217, "marketplace": "Shopee" },
 *     ... one row per produk item, per sale, so multi-item sales expand to
 *     multiple detail rows
 *   ]
 * }
 *
 * Note: for a multi-product sale, `fee_mp` in each detail row is the FULL
 * per-sale fee (not split across items) — the per-sale fee isn't allocated
 * per line item anywhere else in the app either, so summing detail rows'
 * fee_mp would double count. Use `summary.total_fee_mp` for the true total,
 * which is computed once per sale, not per detail row.
 */
import { getServerSupabase } from "@/lib/supabase/serverClient";
import { badRequest, checkAuth, parseDateField } from "@/lib/api/salesApiUtils";
import { getSaleProducts } from "@/lib/utils/sale";

export async function GET(request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const tanggalRaw = searchParams.get("tanggal");
  const dariRaw = searchParams.get("dari");
  const sampaiRaw = searchParams.get("sampai");
  const marketplaceQ = searchParams.get("marketplace");

  const hasRange = dariRaw || sampaiRaw;
  if (hasRange && tanggalRaw) {
    return badRequest("Provide either `tanggal` alone, or `dari`+`sampai` for a range — not both");
  }
  if (hasRange && (!dariRaw || !sampaiRaw)) {
    return badRequest("Range mode requires BOTH `dari` and `sampai`");
  }

  let dari, sampai, responseMeta;
  if (hasRange) {
    const dariParsed = parseDateField(dariRaw);
    if (dariParsed.error) return badRequest(dariParsed.error);
    const sampaiParsed = parseDateField(sampaiRaw);
    if (sampaiParsed.error) return badRequest(sampaiParsed.error);
    dari = dariParsed.value;
    sampai = sampaiParsed.value;
    if (dari > sampai) {
      return badRequest(`\`dari\` (${dari}) must not be after \`sampai\` (${sampai})`);
    }
    responseMeta = { dari, sampai };
  } else {
    const { value: tanggal, error: dateErr } = parseDateField(tanggalRaw);
    if (dateErr) return badRequest(dateErr);
    dari = tanggal;
    sampai = tanggal;
    responseMeta = { tanggal };
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: "Supabase not configured on server" }, { status: 503 });
  }

  let query = supabase.from("sales").select("*").gte("tanggal", dari).lte("tanggal", sampai);
  if (marketplaceQ) query = query.ilike("marketplace", `%${marketplaceQ}%`);

  const { data: sales, error } = await query;
  if (error) {
    return Response.json({ error: "Failed to load sales", details: error.message }, { status: 500 });
  }

  const rows = sales || [];

  let total_omzet = 0;
  let total_fee_mp = 0;
  const perMarketplace = {};
  const perProduk = {};
  const detail = [];

  for (const sale of rows) {
    const produk = getSaleProducts(sale);
    const saleOmzet = produk.reduce((sum, p) => sum + p.harga_jual * p.qty, 0);
    const fee = Number(sale.fee_mp) || 0;

    total_omzet += saleOmzet;
    total_fee_mp += fee;

    const mp = sale.marketplace || "Lainnya";
    if (!perMarketplace[mp]) perMarketplace[mp] = { transaksi: 0, omzet: 0 };
    perMarketplace[mp].transaksi += 1;
    perMarketplace[mp].omzet += saleOmzet;

    for (const p of produk) {
      if (!p.nama_produk) continue;
      const itemTotal = p.harga_jual * p.qty;
      if (!perProduk[p.nama_produk]) perProduk[p.nama_produk] = { qty: 0, total: 0 };
      perProduk[p.nama_produk].qty += p.qty;
      perProduk[p.nama_produk].total += itemTotal;

      detail.push({
        invoice: sale.invoice,
        nama_pembeli: sale.nama_pembeli,
        nama_produk: p.nama_produk,
        qty: p.qty,
        harga_jual: p.harga_jual,
        fee_mp: fee,
        marketplace: mp,
      });
    }
  }

  let produk_terlaris = null;
  let bestQty = -1;
  for (const [nama_produk, agg] of Object.entries(perProduk)) {
    if (agg.qty > bestQty) {
      bestQty = agg.qty;
      produk_terlaris = { nama_produk, qty: agg.qty, total: agg.total };
    }
  }

  const summary = {
    ...responseMeta,
    total_transaksi: rows.length,
    total_omzet,
    total_fee_mp,
    total_net: total_omzet - total_fee_mp,
    produk_terlaris,
    per_marketplace: perMarketplace,
  };

  return Response.json({ success: true, summary, detail }, { status: 200 });
}

/** Reject other methods explicitly instead of falling through to a generic 404. */
export async function POST() {
  return Response.json({ error: "Method not allowed. This endpoint is read-only, use GET." }, { status: 405 });
}
