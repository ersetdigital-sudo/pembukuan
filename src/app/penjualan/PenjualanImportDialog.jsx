"use client";

import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { parseCSV, toCSV, downloadTextFile, parseLooseNumber, parseFlexibleDate } from "@/lib/utils/csv";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { MARKETPLACES as DEFAULT_MARKETPLACES } from "@/lib/constants";

// Kolom template sesuai export marketplace (Tanggal, Nama Produk, Kategori,
// Jumlah, Harga Satuan, Total, Fee MP, Marketplace, Nama Customer)
const TEMPLATE_HEADERS = [
  "Tanggal",
  "Nama Produk",
  "Kategori",
  "Jumlah",
  "Harga Satuan",
  "Total",
  "Fee MP",
  "Marketplace",
  "Nama Customer",
];

const TEMPLATE_SAMPLE_ROWS = [
  ["11/07/2026", "Elementor Pro", "Plugin", "1", "48500", "48500", "8448", "Shopee", "Rafly Rizaldy"],
  ["10/07/2026", "Mikhmon rosv6 1tahun", "Jasa", "1", "88200", "88200", "14701", "Shopee", "Bara Rumah"],
];

/** Build a case-insensitive lookup map name -> stock row. */
function buildStockLookup(stocks) {
  const map = new Map();
  stocks.forEach((s) => map.set((s.nama_produk || "").trim().toLowerCase(), s));
  return map;
}

/** Key used to detect duplicate transactions (same day/customer/product/qty/total). */
function dupeKey(tanggal, customer, produk, qty, total) {
  return [tanggal, (customer || "").trim().toLowerCase(), (produk || "").trim().toLowerCase(), qty, total].join("|");
}

function parseRows(rows, stocks, marketplaces, existingKeys) {
  const first = rows[0]?.map((c) => c.trim().toLowerCase()) || [];
  const looksLikeHeader = first[0]?.includes("tanggal") || first.includes("nama produk");
  const dataRows = looksLikeHeader ? rows.slice(1) : rows;

  const stockLookup = buildStockLookup(stocks);
  const marketplaceSet = new Set(marketplaces.map((m) => m.toLowerCase()));
  const seenInFile = new Set();

  return dataRows.map((cols, idx) => {
    const [tglRaw, namaRaw, katRaw, qtyRaw, satuanRaw, totalRaw, feeRaw, mpRaw, custRaw] = cols;

    const tanggal = parseFlexibleDate(tglRaw);
    const nama_produk = (namaRaw || "").trim();
    const qty = Math.max(1, parseLooseNumber(qtyRaw) || 1);
    const harga_satuan = parseLooseNumber(satuanRaw);
    const totalParsed = parseLooseNumber(totalRaw);
    const total = totalParsed > 0 ? totalParsed : harga_satuan * qty;
    const harga_jual = qty > 0 ? Math.round(total / qty) : harga_satuan;
    const fee_mp = parseLooseNumber(feeRaw);
    const marketplace = (mpRaw || "").trim();
    const nama_pembeli = (custRaw || "").trim();

    const stock = stockLookup.get(nama_produk.toLowerCase());
    const kategori_produk = stock?.kategori || (katRaw || "").trim();
    const harga_beli = stock?.harga_beli || 0;

    const errors = [];
    const warnings = [];
    if (!tanggal) errors.push("Tanggal tidak valid (pakai DD/MM/YYYY)");
    if (!nama_produk) errors.push("Nama produk kosong");
    if (!harga_jual || harga_jual <= 0) errors.push("Harga/Total harus > 0");
    if (!marketplace) errors.push("Marketplace kosong");
    else if (!marketplaceSet.has(marketplace.toLowerCase())) {
      warnings.push(`Marketplace "${marketplace}" belum ada di daftar`);
    }
    if (!stock) warnings.push("Produk tidak ditemukan di data Produk (modal dianggap Rp 0)");

    let isDuplicate = false;
    if (tanggal && nama_produk) {
      const key = dupeKey(tanggal, nama_pembeli, nama_produk, qty, total);
      if (existingKeys.has(key) || seenInFile.has(key)) {
        isDuplicate = true;
        errors.push("Transaksi ini sudah ada (duplikat)");
      } else {
        seenInFile.add(key);
      }
    }

    return {
      rowNumber: idx + 2,
      tanggal,
      nama_pembeli,
      marketplace,
      nama_produk,
      kategori_produk,
      qty,
      harga_jual,
      harga_beli,
      fee_mp,
      total,
      isDuplicate,
      errors,
      warnings,
      valid: errors.length === 0,
    };
  });
}

export default function PenjualanImportDialog({
  open,
  onOpenChange,
  onImport,
  isImporting = false,
  stocks = [],
  marketplaces = DEFAULT_MARKETPLACES,
  existingSales = [],
}) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // Build duplicate-detection keys from sales already in the database
  const existingKeys = new Set(
    existingSales.map((s) => {
      const produk = s.produk?.[0] || s;
      const qty = Number(produk.qty) || 1;
      const total = (Number(produk.harga_jual) || 0) * qty;
      return dupeKey(s.tanggal, s.nama_pembeli, produk.nama_produk, qty, total);
    })
  );

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const reset = () => {
    setRows([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleDownloadTemplate = () => {
    downloadTextFile(
      "template-penjualan.csv",
      toCSV(TEMPLATE_HEADERS, TEMPLATE_SAMPLE_ROWS)
    );
  };

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCSV(text);
    setRows(parseRows(parsed, stocks, marketplaces, existingKeys));
  };

  const handleImport = () => {
    if (validRows.length === 0) return;
    onImport(
      validRows.map((r) => ({
        tanggal: r.tanggal,
        nama_pembeli: r.nama_pembeli,
        marketplace: r.marketplace,
        fee_mp: r.fee_mp,
        produk: [
          {
            nama_produk: r.nama_produk,
            kategori_produk: r.kategori_produk,
            qty: r.qty,
            harga_jual: r.harga_jual,
            harga_beli: r.harga_beli,
          },
        ],
      }))
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader onClose={handleClose}>
          <DialogTitle>Import Penjualan dari CSV</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Step 1: download template */}
          <div className="flex items-start gap-3 rounded-sm bg-secondary p-3">
            <FileSpreadsheet className="h-5 w-5 text-ink shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                Belum punya file CSV? Download template dulu
              </p>
              <p className="text-xs text-ash mt-0.5">
                Kolom: {TEMPLATE_HEADERS.join(", ")}. Tanggal format DD/MM/YYYY.
                Kolom <strong>Fee MP</strong> otomatis masuk sebagai biaya marketplace dan
                mengurangi profit transaksi tersebut. Kalau punya file Excel, buka lalu{" "}
                <strong>Save As → CSV</strong> sebelum upload. Transaksi yang tanggal, customer,
                produk, qty & totalnya sama persis dengan data yang sudah ada otomatis ditolak
                (anti duplikat).
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-3.5 w-3.5" />
                Download Template CSV
              </Button>
            </div>
          </div>

          {/* Step 2: upload */}
          <div className="space-y-1.5">
            <label
              htmlFor="penjualan-csv-input"
              className="flex items-center justify-center gap-2 rounded-sm border border-dashed border-hairline-strong bg-surface-card px-4 py-6 text-sm text-ash cursor-pointer hover:bg-secondary/60 transition-colors"
            >
              <Upload className="h-4 w-4" />
              {fileName ? (
                <span className="text-ink font-medium truncate">{fileName}</span>
              ) : (
                <span>Klik untuk pilih file CSV</span>
              )}
            </label>
            <input
              id="penjualan-csv-input"
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {/* Preview + validation */}
          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={validRows.length > 0 ? "success" : "outline"}>
                  <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                  {validRows.length} valid
                </Badge>
                {invalidRows.length > 0 && (
                  <Badge variant="danger">
                    <AlertTriangle className="h-3 w-3 mr-1 inline" />
                    {invalidRows.length} error/duplikat
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-ash hover:text-danger inline-flex items-center gap-1 ml-auto"
                >
                  <X className="h-3 w-3" /> Hapus file
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-sm bg-surface-card shadow-card scroll-thin">
                <table className="w-full text-xs">
                  <thead className="border-b border-hairline sticky top-0 bg-surface-card">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">#</th>
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Tanggal</th>
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Produk</th>
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Customer</th>
                      <th className="text-right px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Total</th>
                      <th className="text-right px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Fee MP</th>
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {rows.map((r) => (
                      <tr key={r.rowNumber} className={r.valid ? "" : "bg-danger/5"}>
                        <td className="px-3 py-2 text-ash">{r.rowNumber}</td>
                        <td className="px-3 py-2 text-ash whitespace-nowrap">
                          {r.tanggal ? formatDate(r.tanggal) : <span className="text-danger italic">invalid</span>}
                        </td>
                        <td className="px-3 py-2 font-medium text-ink truncate max-w-[140px]">
                          {r.nama_produk || <span className="text-ash italic">-</span>}
                        </td>
                        <td className="px-3 py-2 text-ash truncate max-w-[120px]">{r.nama_pembeli || "-"}</td>
                        <td className="px-3 py-2 text-right text-ink">{formatRupiah(r.total)}</td>
                        <td className="px-3 py-2 text-right text-info">
                          {r.fee_mp ? formatRupiah(r.fee_mp) : "-"}
                        </td>
                        <td className="px-3 py-2">
                          {r.valid ? (
                            r.warnings.length > 0 ? (
                              <span className="text-warning font-medium">{r.warnings.join("; ")}</span>
                            ) : (
                              <span className="text-success font-medium">OK</span>
                            )
                          ) : (
                            <span className="text-danger font-medium">{r.errors.join("; ")}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isImporting}>
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={validRows.length === 0 || isImporting}
            onClick={handleImport}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengimpor...
              </>
            ) : (
              `Import ${validRows.length} Transaksi`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
