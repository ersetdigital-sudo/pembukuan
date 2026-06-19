-- ============================================================
-- OOS SHOP — Supabase Schema
-- Run this in Supabase SQL Editor (new query)
-- ============================================================

-- 1. Stocks (Produk / Katalog)
CREATE TABLE IF NOT EXISTS stocks (
  id TEXT PRIMARY KEY,
  nama_produk TEXT NOT NULL,
  kategori TEXT NOT NULL,
  stok INTEGER DEFAULT 0,
  harga_beli INTEGER DEFAULT 0,
  harga_jual INTEGER DEFAULT 0,
  keterangan TEXT DEFAULT ''
);

-- 2. Sales (Penjualan)
-- produk stored as JSONB so getSaleProducts() works without refactor
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  tanggal DATE,
  nama_pembeli TEXT,
  username_domain TEXT,
  no_hp TEXT,
  marketplace TEXT,
  invoice TEXT,
  fee_mp INTEGER DEFAULT 0,
  nama_produk TEXT,
  kategori_produk TEXT,
  masa_aktif TEXT,
  qty INTEGER DEFAULT 1,
  harga_jual INTEGER DEFAULT 0,
  harga_beli INTEGER DEFAULT 0,
  produk JSONB DEFAULT '[]',
  created_by TEXT DEFAULT 'demo@oosshop.id',
  created_date TIMESTAMPTZ
);

-- 3. Expenses (Biaya)
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  tanggal DATE,
  keterangan TEXT,
  kategori TEXT,
  jumlah INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'demo@oosshop.id'
);

-- 4. Incomes (Pemasukan)
CREATE TABLE IF NOT EXISTS incomes (
  id TEXT PRIMARY KEY,
  tanggal DATE,
  keterangan TEXT,
  jumlah INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'demo@oosshop.id'
);

-- 5. Purchases (Pembelian / Restock)
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  tanggal DATE,
  nama_produk TEXT,
  qty INTEGER DEFAULT 0,
  harga_satuan INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  keterangan TEXT,
  created_by TEXT DEFAULT 'demo@oosshop.id'
);

-- 6. Iklans (Biaya Iklan)
CREATE TABLE IF NOT EXISTS iklans (
  id TEXT PRIMARY KEY,
  tanggal DATE,
  kategori TEXT,
  keterangan TEXT,
  jumlah INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'demo@oosshop.id'
);

-- ============================================================
-- RLS: allow all for now (no auth yet)
-- ============================================================
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE iklans ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all_stocks ON stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all_sales ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all_expenses ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all_incomes ON incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all_purchases ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all_iklans ON iklans FOR ALL USING (true) WITH CHECK (true);
