/**
 * Mock data generator for the OOS SHOP sales recap dashboard.
 *
 * Deterministic — same data on every render (seeded random).
 * Covers 12 months of activity: Jun 2025 — May 2026.
 *
 * Generates 5 entity collections matching the schemas:
 *  - Sale      (legacy flat + new produk[] array, mixed)
 *  - Expense   (operational + auto-synced Fee Marketplace)
 *  - Income    (pemasukan tambahan)
 *  - Purchase  (stock restock)
 *  - Stock     (katalog produk, Plugin + Jasa)
 */

import { MARKETPLACES, KATEGORI, KATEGORI_BIAYA } from "@/lib/constants";

// ── Seeded PRNG (mulberry32) ─────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const _now = new Date();
const rand = mulberry32(20260614);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const range = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const money = (min, max) => Math.round(((rand() * (max - min) + min) / 1000)) * 1000;
const weighted = (items) => {
  // items: [[value, weight], ...]
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of items) {
    r -= w;
    if (r <= 0) return v;
  }
  return items[items.length - 1][0];
};

// ── Reference data ──────────────────────────────────────────────────
const NAMA_PEMBELI = [
  "Budi Santoso", "Siti Aminah", "Ahmad Fauzi", "Dewi Lestari", "Eko Prasetyo",
  "Fitri Handayani", "Gunawan Wibowo", "Hendra Setiawan", "Indah Permata", "Joko Susilo",
  "Kartika Sari", "Lutfi Hakim", "Maya Anggraini", "Nanda Pratama", "Oki Setiawan",
  "Putri Maharani", "Qori Hidayat", "Rina Wati", "Satria Pratama", "Tio Hartono",
  "Umi Kalsum", "Vina Melinda", "Wahyu Ramadhan", "Xena Tan", "Yusuf Rahman",
  "Zara Aulia", "Andika Pratama", "Bella Safitri", "Chandra Kirana", "Dani Saputra",
];

const USERNAME_PREFIX = ["@", "user_", "", "id."];
const DOMAINS = ["gmail.com", "company.id", "studio.web.id", "agency.co.id", "tech.id"];

const PLUGIN_PRODUCTS = [
  { nama: "Elementor Pro", harga_beli: 350000, harga_jual: 500000, kategori: "Plugin" },
  { nama: "WP Rocket", harga_beli: 220000, harga_jual: 320000, kategori: "Plugin" },
  { nama: "Yoast SEO Premium", harga_beli: 180000, harga_jual: 280000, kategori: "Plugin" },
  { nama: "Rank Math Pro", harga_beli: 150000, harga_jual: 230000, kategori: "Plugin" },
  { nama: "Smush Pro", harga_beli: 90000, harga_jual: 150000, kategori: "Plugin" },
  { nama: "UpdraftPlus Premium", harga_beli: 120000, harga_jual: 180000, kategori: "Plugin" },
  { nama: "WPForms Pro", harga_beli: 130000, harga_jual: 200000, kategori: "Plugin" },
  { nama: "Astra Pro", harga_beli: 160000, harga_jual: 250000, kategori: "Plugin" },
  { nama: "Beaver Builder Pro", harga_beli: 280000, harga_jual: 420000, kategori: "Plugin" },
  { nama: "ACF Pro", harga_beli: 110000, harga_jual: 170000, kategori: "Plugin" },
  { nama: "WPML Multilingual", harga_beli: 380000, harga_jual: 550000, kategori: "Plugin" },
  { nama: "MonsterInsights Pro", harga_beli: 140000, harga_jual: 220000, kategori: "Plugin" },
  { nama: "OptinMonster", harga_beli: 250000, harga_jual: 380000, kategori: "Plugin" },
  { nama: "Divi Pro", harga_beli: 320000, harga_jual: 480000, kategori: "Plugin" },
];

const JASA_PRODUCTS = [
  { nama: "Install WordPress + Setup", harga_beli: 50000, harga_jual: 150000, kategori: "Jasa" },
  { nama: "Setup VPS + SSL", harga_beli: 30000, harga_jual: 100000, kategori: "Jasa" },
  { nama: "Migrasi Hosting", harga_beli: 40000, harga_jual: 120000, kategori: "Jasa" },
  { nama: "Optimasi SEO On-Page", harga_beli: 60000, harga_jual: 200000, kategori: "Jasa" },
  { nama: "Pembuatan Landing Page", harga_beli: 150000, harga_jual: 500000, kategori: "Jasa" },
  { nama: "Maintenance Bulanan", harga_beli: 50000, harga_jual: 200000, kategori: "Jasa" },
  { nama: "Setup Email Bisnis", harga_beli: 20000, harga_jual: 75000, kategori: "Jasa" },
  { nama: "Konsultasi 1 Jam", harga_beli: 0, harga_jual: 150000, kategori: "Jasa" },
  { nama: "Konfigurasi CDN + Cache", harga_beli: 40000, harga_jual: 150000, kategori: "Jasa" },
  { nama: "Backup & Restore", harga_beli: 25000, harga_jual: 100000, kategori: "Jasa" },
];

const ALL_PRODUCTS = [...PLUGIN_PRODUCTS, ...JASA_PRODUCTS];

const MASA_AKTIF_OPTIONS = ["1 Bulan", "3 Bulan", "6 Bulan", "1 Tahun", "2 Tahun"];

const MP_WEIGHTED = [
  ["Shopee", 35],
  ["Tokopedia", 25],
  ["WhatsApp", 15],
  ["Instagram", 10],
  ["Blibli", 5],
  ["Bukalapak", 5],
  ["Akulaku", 5],
];

const KATEGORI_BIAYA_WEIGHTED = KATEGORI_BIAYA
  .filter((k) => k !== "Fee Marketplace")
  .map((k) => [k, [25, 20, 20, 12, 8, 10, 5][["Server & Hosting", "Internet", "Iklan", "Alat Kantor", "Transport", "Konsumsi", "Lain-lain"].indexOf(k)] || 5]);

const INCOME_KETERANGAN = [
  "Bonus proyek klien A", "Konsultasi tambahan", "Refund supplier", "Passive income afiliasi",
  "Workshop online", "Royalti plugin", "Kerja sama agensi", "Penyesuaian saldo",
];

// ── Helpers ─────────────────────────────────────────────────────────
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function generateUsernameDomain() {
  const prefix = pick(USERNAME_PREFIX);
  const name = pick(NAMA_PEMBELI).toLowerCase().split(" ")[0] + range(10, 999);
  return prefix + name;
}
function generateNoHp() {
  const prefix = pick(["0812", "0813", "0821", "0822", "0852", "0857", "0878"]);
  return prefix + range(10000000, 99999999);
}

// ── Stock generation ───────────────────────────────────────────────
function generateStocks() {
  const stocks = [];
  // Plugins from PLUGIN_PRODUCTS
  PLUGIN_PRODUCTS.forEach((p, i) => {
    stocks.push({
      id: `stk-${i + 1}`,
      nama_produk: p.nama,
      kategori: p.kategori,
      stok: weighted([[range(10, 30), 5], [range(2, 5), 2], [0, 1]]),  // some low-stock
      harga_beli: p.harga_beli,
      harga_jual: p.harga_jual,
      keterangan: i % 3 === 0 ? "Stok terbatas" : "",
    });
  });
  // Jasa from JASA_PRODUCTS
  JASA_PRODUCTS.forEach((p, i) => {
    stocks.push({
      id: `stk-${PLUGIN_PRODUCTS.length + i + 1}`,
      nama_produk: p.nama,
      kategori: p.kategori,
      stok: 999,  // jasa: unlimited
      harga_beli: p.harga_beli,
      harga_jual: p.harga_jual,
      keterangan: "Layanan jasa",
    });
  });
  return stocks;
}

// ── Sales generation ───────────────────────────────────────────────
function generateSales(stocks) {
  const sales = [];
  let id = 1;
  let invoiceNum = 1;

  // Loop 12 months back from `_now`
  for (let mOffset = 11; mOffset >= 0; mOffset--) {
    const monthDate = new Date(_now.getFullYear(), _now.getMonth() - mOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const days = daysInMonth(year, month);

    // Growth: more sales in recent months
    const baseCount = 10 + Math.floor((11 - mOffset) * 0.8);
    const numSales = baseCount + range(-3, 5);

    for (let i = 0; i < numSales; i++) {
      const day = range(1, days);
      const tanggal = fmtDate(new Date(year, month, day));
      const marketplace = weighted(MP_WEIGHTED);
      const nama_pembeli = pick(NAMA_PEMBELI);
      const no_hp = rand() > 0.4 ? generateNoHp() : "";
      const username_domain = rand() > 0.5 ? generateUsernameDomain() : "";

      // 30% chance: multi-product sale (array shape)
      const isMulti = rand() > 0.7;
      let produk = [];
      let legacyFields = {};

      if (isMulti) {
        const numItems = range(2, 3);
        const usedNames = new Set();
        for (let j = 0; j < numItems; j++) {
          let p;
          let attempts = 0;
          do {
            p = pick(ALL_PRODUCTS);
            attempts++;
          } while (usedNames.has(p.nama) && attempts < 5);
          usedNames.add(p.nama);
          const qty = range(1, 3);
          const harga_jual = p.harga_jual + (rand() > 0.5 ? range(-10000, 20000) : 0);
          produk.push({
            nama_produk: p.nama,
            kategori_produk: p.kategori,
            masa_aktif: p.kategori === "Plugin" ? pick(MASA_AKTIF_OPTIONS) : "",
            qty,
            harga_jual,
            harga_beli: p.harga_beli,
          });
        }
        // Set legacy fields from first product (backward compat)
        const first = produk[0];
        legacyFields = {
          nama_produk: first.nama_produk,
          kategori_produk: first.kategori_produk,
          masa_aktif: first.masa_aktif,
          qty: first.qty,
          harga_jual: first.harga_jual,
          harga_beli: first.harga_beli,
        };
      } else {
        // Legacy single-item shape (no produk array, or empty)
        const p = pick(ALL_PRODUCTS);
        const qty = range(1, 5);
        const harga_jual = p.harga_jual + (rand() > 0.5 ? range(-10000, 30000) : 0);
        produk = [];
        legacyFields = {
          nama_produk: p.nama,
          kategori_produk: p.kategori,
          masa_aktif: p.kategori === "Plugin" ? pick(MASA_AKTIF_OPTIONS) : "",
          qty,
          harga_jual,
          harga_beli: p.harga_beli,
        };
      }

      const totalJual = produk.length > 0
        ? produk.reduce((s, p) => s + p.harga_jual * p.qty, 0)
        : legacyFields.harga_jual * legacyFields.qty;
      // Fee marketplace: 5-10% of total
      const fee_mp = Math.round(totalJual * (0.05 + rand() * 0.05));

      sales.push({
        id: `s-${id++}`,
        tanggal,
        nama_pembeli,
        username_domain,
        no_hp,
        marketplace,
        invoice: `INV-${year}-${String(invoiceNum++).padStart(4, "0")}`,
        fee_mp,
        produk,  // empty for legacy, populated for multi
        ...legacyFields,
        created_by: "demo@oosshop.id",
        created_date: `${tanggal}T${String(range(8, 20)).padStart(2, "0")}:${String(range(0, 59)).padStart(2, "0")}:00Z`,
      });
    }
  }
  return sales;
}

// ── Expenses generation (operational + auto-synced Fee MP) ─────────
function generateExpenses(sales) {
  const expenses = [];
  let id = 1;

  // 1) Auto-synced Fee MP expenses — one per (year, month, marketplace) group
  const feeMPByMonth = {};
  sales.forEach((s) => {
    if (!s.fee_mp) return;
    const d = new Date(s.tanggal);
    const key = `${d.getFullYear()}-${d.getMonth()}-${s.marketplace}`;
    if (!feeMPByMonth[key]) {
      feeMPByMonth[key] = { year: d.getFullYear(), month: d.getMonth(), mp: s.marketplace, total: 0, count: 0 };
    }
    feeMPByMonth[key].total += s.fee_mp;
    feeMPByMonth[key].count += 1;
  });
  Object.values(feeMPByMonth).forEach((g) => {
    const day = range(20, 28);
    const tanggal = fmtDate(new Date(g.year, g.month, Math.min(day, daysInMonth(g.year, g.month))));
    const monthName = new Date(g.year, g.month, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    expenses.push({
      id: `exp-fee-${id++}`,
      tanggal,
      keterangan: `Fee MP - ${g.mp} - ${monthName} (${g.count} transaksi)`,
      kategori: "Fee Marketplace",
      jumlah: g.total,
      created_by: "demo@oosshop.id",
    });
  });

  // 2) Operational expenses — 4-7 per month over 12 months
  for (let mOffset = 11; mOffset >= 0; mOffset--) {
    const monthDate = new Date(_now.getFullYear(), _now.getMonth() - mOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const days = daysInMonth(year, month);
    const numExp = 4 + range(0, 3);

    for (let i = 0; i < numExp; i++) {
      const day = range(1, days);
      const tanggal = fmtDate(new Date(year, month, day));
      const kategori = weighted(KATEGORI_BIAYA_WEIGHTED);
      const jumlah = money(
        kategori === "Server & Hosting" ? 100000 : 50000,
        kategori === "Iklan" ? 800000 : kategori === "Server & Hosting" ? 350000 : 400000
      );
      const deskripsi = {
        "Server & Hosting": ["Perpanjangan hosting Niagahoster", "Sewa VPS DigitalOcean", "Domain renewal", "Lisensi cPanel"],
        Internet: ["Paket internet bulanan", "Top up data", "Wifi kantor"],
        Iklan: ["Facebook Ads campaign", "Google Ads campaign", "Boost Instagram", "TikTok Ads"],
        "Alat Kantor": ["ATK bulanan", "Mouse wireless", "Keyboard mekanik", "Webcam HD"],
        Transport: ["Bensin motor", "Gojek ke klien", "Parkir", "Tol"],
        Konsumsi: ["Makan siang tim", "Kopi & snack", "Katering meeting", "Galon"],
        "Lain-lain": ["Upgrade software", "Sewa coworking", "Asuransi", "Donasi"],
      }[kategori] || ["Pengeluaran umum"];
      expenses.push({
        id: `exp-${id++}`,
        tanggal,
        keterangan: pick(deskripsi),
        kategori,
        jumlah,
        created_by: "demo@oosshop.id",
      });
    }
  }
  return expenses.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

// ── Income generation ──────────────────────────────────────────────
function generateIncomes() {
  const incomes = [];
  let id = 1;
  for (let mOffset = 11; mOffset >= 0; mOffset--) {
    const monthDate = new Date(_now.getFullYear(), _now.getMonth() - mOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const days = daysInMonth(year, month);
    const num = 1 + range(0, 2);
    for (let i = 0; i < num; i++) {
      const day = range(1, days);
      incomes.push({
        id: `inc-${id++}`,
        tanggal: fmtDate(new Date(year, month, day)),
        keterangan: pick(INCOME_KETERANGAN),
        jumlah: money(150000, 1500000),
        created_by: "demo@oosshop.id",
      });
    }
  }
  return incomes.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

// ── Iklan (advertising) generation ────────────────────────────────
// Iklan is a separate entity (not a category of expense) because each entry
// has a sub-kategori (Plugin / Jasa) that decides which profit bucket it
// reduces BEFORE the Andri / Asrud / Modal split.
function generateIklans() {
  const iklans = [];
  let id = 1;
  const IKLAN_KETERANGAN = [
    "Facebook Ads campaign",
    "Google Ads campaign",
    "TikTok Ads",
    "Instagram Boost",
    "Marketplace Ads",
    "YouTube Ads",
  ];
  for (let mOffset = 11; mOffset >= 0; mOffset--) {
    const monthDate = new Date(_now.getFullYear(), _now.getMonth() - mOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const days = daysInMonth(year, month);
    const num = range(0, 2); // 0-2 iklan entries per month
    for (let i = 0; i < num; i++) {
      const day = range(1, days);
      const kategori = pick(["Plugin", "Jasa"]); // sub-kategori for profit reduction
      iklans.push({
        id: `ikl-${id++}`,
        tanggal: fmtDate(new Date(year, month, day)),
        kategori,
        keterangan: pick(IKLAN_KETERANGAN),
        jumlah: money(150000, 800000),
        created_by: "demo@oosshop.id",
      });
    }
  }
  return iklans.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

// ── Purchase generation ────────────────────────────────────────────
function generatePurchases(stocks) {
  const purchases = [];
  let id = 1;
  for (let mOffset = 11; mOffset >= 0; mOffset--) {
    const monthDate = new Date(_now.getFullYear(), _now.getMonth() - mOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const days = daysInMonth(year, month);
    const num = 2 + range(0, 2);
    for (let i = 0; i < num; i++) {
      const day = range(1, days);
      const stock = pick(stocks.filter((s) => s.kategori === "Plugin"));
      const qty = range(5, 20);
      const harga_satuan = stock.harga_beli;
      purchases.push({
        id: `pur-${id++}`,
        tanggal: fmtDate(new Date(year, month, day)),
        nama_produk: stock.nama_produk,
        qty,
        harga_satuan,
        total: qty * harga_satuan,
        keterangan: `Restock ${stock.nama_produk}`,
        created_by: "demo@oosshop.id",
      });
    }
  }
  return purchases.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

// ── Singleton data (cached) ────────────────────────────────────────
let _cache = null;
export function getMockData() {
  if (_cache) return _cache;
  const stocks = generateStocks();
  const sales = generateSales(stocks);
  const expenses = generateExpenses(sales);
  const incomes = generateIncomes();
  const purchases = generatePurchases(stocks);
  const iklans = generateIklans();
  _cache = { sales, expenses, incomes, purchases, stocks, iklans };
  return _cache;
}

// Convenience: get current period (year, month)
export const CURRENT_PERIOD = { year: _now.getFullYear(), month: _now.getMonth() };
