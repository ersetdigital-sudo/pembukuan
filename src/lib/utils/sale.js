/**
 * Sale calculation utilities.
 * Handles BOTH the legacy flat shape (s.qty, s.harga_jual, s.harga_beli)
 * AND the newer array shape (s.produk[]).
 */

import { MARKETPLACES } from "@/lib/constants";

/**
 * Normalize a sale to products array.
 * Returns an array of { nama_produk, kategori_produk, masa_aktif, qty, harga_jual, harga_beli }.
 */
export function getSaleProducts(s) {
  if (s.produk && Array.isArray(s.produk) && s.produk.length > 0) {
    return s.produk.map((p) => ({
      nama_produk: p.nama_produk || "",
      kategori_produk: p.kategori_produk || "",
      masa_aktif: p.masa_aktif || "",
      qty: Number(p.qty) || 0,
      harga_jual: Number(p.harga_jual) || 0,
      harga_beli: Number(p.harga_beli) || 0,
    }));
  }
  // Legacy single-item shape
  return [
    {
      nama_produk: s.nama_produk || "",
      kategori_produk: s.kategori_produk || "",
      masa_aktif: s.masa_aktif || "",
      qty: Number(s.qty) || 0,
      harga_jual: Number(s.harga_jual) || 0,
      harga_beli: Number(s.harga_beli) || 0,
    },
  ];
}

/**
 * Aggregate a sale into totals.
 * Returns { totalJual, totalBeli, totalQty, fee, profit }.
 * - profit here is "gross profit" — does NOT yet subtract operational cost allocation.
 */
export function getSaleTotals(s) {
  const produk = getSaleProducts(s);
  const totalJual = produk.reduce((sum, p) => sum + p.harga_jual * p.qty, 0);
  const totalBeli = produk.reduce((sum, p) => sum + p.harga_beli * p.qty, 0);
  const totalQty = produk.reduce((sum, p) => sum + p.qty, 0);
  const fee = Number(s.fee_mp) || 0;
  return {
    totalJual,
    totalBeli,
    totalQty,
    fee,
    profit: totalJual - totalBeli - fee,
  };
}

/**
 * Build a profitBersihSale function given the period's totals.
 * Allocated operational cost per unit (excluding Fee Marketplace expenses) is
 * subtracted from each sale's gross profit proportionally to its qty.
 *
 * @param {Array} filteredSales — sales within the period
 * @param {Array} filteredExpenses — expenses within the period
 * @returns {(s: object) => number} function that returns profit bersih for a sale
 */
export function makeProfitBersihFn(filteredSales, filteredExpenses) {
  const totalQty = filteredSales.reduce((sum, s) => sum + getSaleTotals(s).totalQty, 0);
  const biayaNonFeeMP = filteredExpenses
    .filter((e) => e.kategori !== "Fee Marketplace")
    .reduce((sum, e) => sum + (Number(e.jumlah) || 0), 0);
  const biayaPerQty = totalQty > 0 ? biayaNonFeeMP / totalQty : 0;
  return (s) => {
    const t = getSaleTotals(s);
    return t.profit - biayaPerQty * t.totalQty;
  };
}

/**
 * Group sales by marketplace. Returns map { marketplace: { qty, profit, fee, count } }.
 */
export function aggregateByMarketplace(sales, profitFn) {
  const map = {};
  MARKETPLACES.forEach((mp) => (map[mp] = { qty: 0, profit: 0, fee: 0, count: 0 }));
  sales.forEach((s) => {
    const mp = s.marketplace || "Lainnya";
    if (!map[mp]) map[mp] = { qty: 0, profit: 0, fee: 0, count: 0 };
    const t = getSaleTotals(s);
    map[mp].qty += t.totalQty;
    map[mp].profit += profitFn(s);
    map[mp].fee += t.fee;
    map[mp].count += 1;
  });
  return map;
}

/**
 * Group sales by product (flattened across produk[] arrays). Returns array of [name, { qty, profit, kategori }].
 */
export function aggregateByProduct(sales, profitFn) {
  const map = {};
  sales.forEach((s) => {
    const produk = getSaleProducts(s);
    const t = getSaleTotals(s);
    const perUnitProfit = t.totalQty > 0 ? profitFn(s) / t.totalQty : 0;
    produk.forEach((p) => {
      if (!p.nama_produk) return;
      if (!map[p.nama_produk]) {
        map[p.nama_produk] = {
          qty: 0,
          profit: 0,
          kategori: p.kategori_produk || "",
        };
      }
      map[p.nama_produk].qty += p.qty;
      map[p.nama_produk].profit += perUnitProfit * p.qty;
    });
  });
  return Object.entries(map);
}

/**
 * Group sales by customer (nama_pembeli). Returns array of [name, { total, count, avg }].
 */
export function aggregateByCustomer(sales, profitFn) {
  const map = {};
  sales.forEach((s) => {
    if (!s.nama_pembeli) return;
    if (!map[s.nama_pembeli]) map[s.nama_pembeli] = { total: 0, count: 0, profit: 0 };
    const t = getSaleTotals(s);
    map[s.nama_pembeli].total += t.totalJual;
    map[s.nama_pembeli].count += 1;
    map[s.nama_pembeli].profit += profitFn(s);
  });
  return Object.entries(map);
}

/**
 * Compute profit split between owners.
 * - Plugin profit:  Andri 40% / Asrud 40% / Modal & Dev 20%
 * - Jasa profit:    Andri 40% / Asrud 60%
 * - Asrud receives more in Jasa because they also handle Modal & Pengembangan.
 *
 * @param {Array} sales     — sales in the period
 * @param {Function} profitFn — profitBersih function from makeProfitBersihFn
 * @param {Array} [iklans]   — advertising expenses [{kategori: "Plugin"|"Jasa", jumlah}]
 *                            Subtotal per sub-kategori is subtracted from the matching
 *                            profit bucket BEFORE the Andri/Asrud/Modal split.
 */
export function computeProfitSharing(sales, profitFn, iklans = []) {
  let profitPluginRaw = 0;
  let profitJasaRaw = 0;

  sales.forEach((s) => {
    const produk = getSaleProducts(s);
    const saleProfit = profitFn(s);
    const totalQty = produk.reduce((sum, p) => sum + p.qty, 0);
    const perUnitProfit = totalQty > 0 ? saleProfit / totalQty : 0;

    produk.forEach((p) => {
      const productProfit = perUnitProfit * p.qty;
      const kategori = (p.kategori_produk || "").toLowerCase();
      if (kategori === "plugin") {
        profitPluginRaw += productProfit;
      } else if (kategori === "jasa") {
        profitJasaRaw += productProfit;
      }
    });
  });

  // Iklan reduction: matched to the corresponding profit bucket
  const iklanPlugin = iklans
    .filter((i) => i.kategori === "Plugin")
    .reduce((sum, i) => sum + (Number(i.jumlah) || 0), 0);
  const iklanJasa = iklans
    .filter((i) => i.kategori === "Jasa")
    .reduce((sum, i) => sum + (Number(i.jumlah) || 0), 0);

  const profitPlugin = profitPluginRaw - iklanPlugin;
  const profitJasa = profitJasaRaw - iklanJasa;

  const pluginAndri = profitPlugin * 0.4;
  const pluginAsrud = profitPlugin * 0.4;
  const pluginModal = profitPlugin * 0.2;

  const jasaAndri = profitJasa * 0.4;
  const jasaAsrud = profitJasa * 0.6;

  const transferAndri = pluginAndri + jasaAndri;
  const transferAsrud = pluginAsrud + jasaAsrud + pluginModal;
  const totalModal = pluginModal;

  return {
    profitPlugin,
    profitJasa,
    profitPluginRaw,
    profitJasaRaw,
    iklanPlugin,
    iklanJasa,
    pluginAndri,
    pluginAsrud,
    pluginModal,
    jasaAndri,
    jasaAsrud,
    transferAndri,
    transferAsrud,
    totalModal,
  };
}
