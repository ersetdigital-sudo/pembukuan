-- ============================================================
-- OOS SHOP - Demo Data Juli 2026
-- Paste ini di Supabase SQL Editor -> Run
-- ============================================================
BEGIN;

-- 1. Tambah produk baru (skip kalau udah ada)
INSERT INTO stocks ("id", "nama_produk", "kategori", "stok", "harga_beli", "harga_jual", "keterangan") VALUES
  ('stk-25', 'Flavor CRM Pro', 'Plugin', 15, 200000, 350000, 'CRM plugin WordPress'),
  ('stk-26', 'TablePress Pro', 'Plugin', 20, 80000, 150000, 'Table builder'),
  ('stk-27', 'Flavor Page Builder', 'Plugin', 10, 250000, 450000, 'Drag & drop builder'),
  ('stk-28', 'Setup Google Workspace', 'Jasa', 999, 30000, 120000, 'Layanan jasa'),
  ('stk-29', 'Security Hardening', 'Jasa', 999, 40000, 180000, 'Layanan jasa'),
  ('stk-30', 'Design Logo + Branding', 'Jasa', 999, 100000, 350000, 'Layanan jasa')
ON CONFLICT ("id") DO NOTHING;

-- 2. Pembelian (restock) Juli 2026
INSERT INTO purchases ("id", "tanggal", "nama_produk", "qty", "harga_satuan", "total", "keterangan", "created_by") VALUES
  ('p-jul-1', '2026-07-01', 'Elementor Pro', 10, 350000, 3500000, 'Restock license', 'demo@oosshop.id'),
  ('p-jul-2', '2026-07-01', 'WP Rocket', 15, 220000, 3300000, 'Restock license', 'demo@oosshop.id'),
  ('p-jul-3', '2026-07-03', 'Yoast SEO Premium', 10, 180000, 1800000, 'Restock', 'demo@oosshop.id'),
  ('p-jul-4', '2026-07-05', 'Flavor CRM Pro', 15, 200000, 3000000, 'Stok awal', 'demo@oosshop.id'),
  ('p-jul-5', '2026-07-05', 'Flavor Page Builder', 10, 250000, 2500000, 'Stok awal', 'demo@oosshop.id'),
  ('p-jul-6', '2026-07-07', 'Rank Math Pro', 8, 150000, 1200000, 'Restock', 'demo@oosshop.id'),
  ('p-jul-7', '2026-07-10', 'MonsterInsights Pro', 10, 140000, 1400000, 'Restock', 'demo@oosshop.id'),
  ('p-jul-8', '2026-07-10', 'TablePress Pro', 20, 80000, 1600000, 'Stok awal', 'demo@oosshop.id'),
  ('p-jul-9', '2026-07-12', 'Divi Pro', 5, 320000, 1600000, 'Restock', 'demo@oosshop.id'),
  ('p-jul-10', '2026-07-15', 'ACF Pro', 12, 110000, 1320000, 'Restock', 'demo@oosshop.id')
ON CONFLICT ("id") DO NOTHING;

-- 3. Penjualan Juli 2026
INSERT INTO sales ("id", "tanggal", "nama_pembeli", "username_domain", "no_hp", "marketplace", "invoice", "fee_mp", "produk", "nama_produk", "kategori_produk", "masa_aktif", "qty", "harga_jual", "harga_beli", "created_by", "created_date") VALUES
  ('s-jul-1', '2026-07-01', 'Raka Aditya', 'raka.dev', '081234567890', 'Shopee', 'INV-2026-0201', 45000, '[{"nama_produk":"Elementor Pro","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":2,"harga_jual":500000,"harga_beli":350000},{"nama_produk":"Setup VPS + SSL","kategori_produk":"Jasa","masa_aktif":"","qty":1,"harga_jual":100000,"harga_beli":30000}]', 'Elementor Pro', 'Plugin', '1 Tahun', 2, 500000, 350000, 'demo@oosshop.id', '2026-07-01T09:15:00Z'),
  ('s-jul-2', '2026-07-02', 'Sinta Dewi', 'sintashop.id', '085298765432', 'Tokopedia', 'INV-2026-0202', 67500, '[{"nama_produk":"WP Rocket","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":3,"harga_jual":320000,"harga_beli":220000},{"nama_produk":"Konfigurasi CDN + Cache","kategori_produk":"Jasa","masa_aktif":"","qty":3,"harga_jual":150000,"harga_beli":40000}]', 'WP Rocket', 'Plugin', '1 Tahun', 3, 320000, 220000, 'demo@oosshop.id', '2026-07-02T10:30:00Z'),
  ('s-jul-3', '2026-07-03', 'Bagas Firmansyah', '', '087812345678', 'WhatsApp', 'INV-2026-0203', 0, '[]', 'Pembuatan Landing Page', 'Jasa', '', 1, 500000, 150000, 'demo@oosshop.id', '2026-07-03T14:00:00Z'),
  ('s-jul-4', '2026-07-04', 'Lina Marlina', 'lina-store', '081345678901', 'Shopee', 'INV-2026-0204', 52000, '[{"nama_produk":"Yoast SEO Premium","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":2,"harga_jual":280000,"harga_beli":180000},{"nama_produk":"Rank Math Pro","kategori_produk":"Plugin","masa_aktif":"6 Bulan","qty":1,"harga_jual":230000,"harga_beli":150000}]', 'Yoast SEO Premium', 'Plugin', '1 Tahun', 2, 280000, 180000, 'demo@oosshop.id', '2026-07-04T08:45:00Z'),
  ('s-jul-5', '2026-07-05', 'Tommy Wijaya', 'tommyweb.co', '', 'Instagram', 'INV-2026-0205', 25000, '[]', 'Flavor CRM Pro', 'Plugin', '1 Tahun', 2, 350000, 200000, 'demo@oosshop.id', '2026-07-05T11:20:00Z'),
  ('s-jul-6', '2026-07-06', 'Aisyah Putri', '', '082156789012', 'Bukalapak', 'INV-2026-0206', 38000, '[{"nama_produk":"Install WordPress + Setup","kategori_produk":"Jasa","masa_aktif":"","qty":2,"harga_jual":150000,"harga_beli":50000},{"nama_produk":"Security Hardening","kategori_produk":"Jasa","masa_aktif":"","qty":1,"harga_jual":180000,"harga_beli":40000}]', 'Install WordPress + Setup', 'Jasa', '', 2, 150000, 50000, 'demo@oosshop.id', '2026-07-06T13:10:00Z'),
  ('s-jul-7', '2026-07-07', 'Dimas Prayoga', 'dimas.wp', '085367890123', 'Tokopedia', 'INV-2026-0207', 89000, '[{"nama_produk":"Divi Pro","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":2,"harga_jual":480000,"harga_beli":320000},{"nama_produk":"MonsterInsights Pro","kategori_produk":"Plugin","masa_aktif":"6 Bulan","qty":2,"harga_jual":220000,"harga_beli":140000}]', 'Divi Pro', 'Plugin', '1 Tahun', 2, 480000, 320000, 'demo@oosshop.id', '2026-07-07T09:00:00Z'),
  ('s-jul-8', '2026-07-08', 'Farah Nabila', 'farah-beauty', '081478901234', 'Shopee', 'INV-2026-0208', 31000, '[]', 'Optimasi SEO On-Page', 'Jasa', '', 2, 200000, 60000, 'demo@oosshop.id', '2026-07-08T16:30:00Z'),
  ('s-jul-9', '2026-07-09', 'Rizal Mahendra', '', '087823456789', 'WhatsApp', 'INV-2026-0209', 0, '[{"nama_produk":"Flavor Page Builder","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":1,"harga_jual":450000,"harga_beli":250000},{"nama_produk":"Konsultasi 1 Jam","kategori_produk":"Jasa","masa_aktif":"","qty":1,"harga_jual":150000,"harga_beli":0}]', 'Flavor Page Builder', 'Plugin', '1 Tahun', 1, 450000, 250000, 'demo@oosshop.id', '2026-07-09T10:15:00Z'),
  ('s-jul-10', '2026-07-10', 'Yoga Pratama', 'yoga-digital', '082234567890', 'Tokopedia', 'INV-2026-0210', 115000, '[{"nama_produk":"WPML Multilingual","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":2,"harga_jual":550000,"harga_beli":380000},{"nama_produk":"Setup Google Workspace","kategori_produk":"Jasa","masa_aktif":"","qty":3,"harga_jual":120000,"harga_beli":30000}]', 'WPML Multilingual', 'Plugin', '1 Tahun', 2, 550000, 380000, 'demo@oosshop.id', '2026-07-10T12:00:00Z'),
  ('s-jul-11', '2026-07-11', 'Nadia Safitri', 'nadia.store', '085345678901', 'Shopee', 'INV-2026-0211', 42000, '[]', 'ACF Pro', 'Plugin', '1 Tahun', 3, 170000, 110000, 'demo@oosshop.id', '2026-07-11T08:30:00Z'),
  ('s-jul-12', '2026-07-11', 'Kevin Hartanto', '', '081567890123', 'Instagram', 'INV-2026-0212', 18000, '[]', 'Design Logo + Branding', 'Jasa', '', 1, 350000, 100000, 'demo@oosshop.id', '2026-07-11T15:45:00Z'),
  ('s-jul-13', '2026-07-12', 'Melati Kusuma', 'melati.id', '087834567890', 'Shopee', 'INV-2026-0213', 55000, '[{"nama_produk":"WPForms Pro","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":2,"harga_jual":200000,"harga_beli":130000},{"nama_produk":"TablePress Pro","kategori_produk":"Plugin","masa_aktif":"6 Bulan","qty":3,"harga_jual":150000,"harga_beli":80000}]', 'WPForms Pro', 'Plugin', '1 Tahun', 2, 200000, 130000, 'demo@oosshop.id', '2026-07-12T10:00:00Z'),
  ('s-jul-14', '2026-07-13', 'Arief Rahman', 'arief-tech', '082345678901', 'Tokopedia', 'INV-2026-0214', 72000, '[]', 'Flavor Page Builder', 'Plugin', '1 Tahun', 2, 450000, 250000, 'demo@oosshop.id', '2026-07-13T09:20:00Z'),
  ('s-jul-15', '2026-07-14', 'Citra Ayu', '', '085478901234', 'WhatsApp', 'INV-2026-0215', 0, '[{"nama_produk":"Migrasi Hosting","kategori_produk":"Jasa","masa_aktif":"","qty":2,"harga_jual":120000,"harga_beli":40000},{"nama_produk":"Backup & Restore","kategori_produk":"Jasa","masa_aktif":"","qty":3,"harga_jual":100000,"harga_beli":25000}]', 'Migrasi Hosting', 'Jasa', '', 2, 120000, 40000, 'demo@oosshop.id', '2026-07-14T14:30:00Z'),
  ('s-jul-16', '2026-07-15', 'Gilang Permana', 'gilang-dev', '081678901234', 'Shopee', 'INV-2026-0216', 98000, '[{"nama_produk":"Beaver Builder Pro","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":2,"harga_jual":420000,"harga_beli":280000},{"nama_produk":"Elementor Pro","kategori_produk":"Plugin","masa_aktif":"6 Bulan","qty":1,"harga_jual":500000,"harga_beli":350000}]', 'Beaver Builder Pro', 'Plugin', '1 Tahun', 2, 420000, 280000, 'demo@oosshop.id', '2026-07-15T11:00:00Z'),
  ('s-jul-17', '2026-07-16', 'Hana Pertiwi', 'hana.craft', '087845678901', 'Bukalapak', 'INV-2026-0217', 29000, '[]', 'Maintenance Bulanan', 'Jasa', '', 3, 200000, 50000, 'demo@oosshop.id', '2026-07-16T08:15:00Z'),
  ('s-jul-18', '2026-07-17', 'Irfan Maulana', '', '082456789012', 'Tokopedia', 'INV-2026-0218', 83000, '[{"nama_produk":"Flavor CRM Pro","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":3,"harga_jual":350000,"harga_beli":200000},{"nama_produk":"Setup Email Bisnis","kategori_produk":"Jasa","masa_aktif":"","qty":2,"harga_jual":75000,"harga_beli":20000}]', 'Flavor CRM Pro', 'Plugin', '1 Tahun', 3, 350000, 200000, 'demo@oosshop.id', '2026-07-17T13:40:00Z'),
  ('s-jul-19', '2026-07-18', 'Jasmine Tan', 'jasmine.co', '085589012345', 'Instagram', 'INV-2026-0219', 35000, '[]', 'Smush Pro', 'Plugin', '1 Tahun', 4, 150000, 90000, 'demo@oosshop.id', '2026-07-18T10:50:00Z'),
  ('s-jul-20', '2026-07-19', 'Oscar Putra', 'oscar.wp', '081789012345', 'Shopee', 'INV-2026-0220', 125000, '[{"nama_produk":"Divi Pro","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":3,"harga_jual":480000,"harga_beli":320000},{"nama_produk":"WP Rocket","kategori_produk":"Plugin","masa_aktif":"1 Tahun","qty":2,"harga_jual":320000,"harga_beli":220000}]', 'Divi Pro', 'Plugin', '1 Tahun', 3, 480000, 320000, 'demo@oosshop.id', '2026-07-19T09:30:00Z')
ON CONFLICT ("id") DO NOTHING;

COMMIT;
