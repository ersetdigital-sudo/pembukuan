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
import { getSaleProducts } from "@/lib/utils/sale";

// Kolom sesuai export "Fee MP" dari sistem lama: Tanggal, Marketplace,
// Invoice, Nama Customer, Fee MP. Invoice di sini adalah invoice dari
// marketplace (bukan invoice internal aplikasi) jadi cuma dipakai sebagai
// info tampilan — pencocokan transaksi pakai Tanggal + Marketplace + Customer.
const TEMPLATE_HEADERS = ["Tanggal", "Marketplace", "Invoice", "Nama Customer", "Fee MP"];

const TEMPLATE_SAMPLE_ROWS = [
  ["11/07/2026", "Shopee", "260711CKQ", "Rafly Rizaldy", "14701"],
  ["10/07/2026", "Shopee", "260710B89F", "Pernando Sigalingging", "9753"],
];

function matchKey(tanggal, marketplace, customer) {
  return [tanggal, (marketplace || "").trim().toLowerCase(), (customer || "").trim().toLowerCase()].join("|");
}

/** Build a lookup of matchKey -> queue of sale ids (oldest first), for greedy assignment. */
function buildSaleLookup(sales) {
  const map = new Map();
  sales.forEach((s) => {
    const key = matchKey(s.tanggal, s.marketplace, s.nama_pembeli);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });
  return map;
}

function parseRows(rows, sales) {
  const first = rows[0]?.map((c) => c.trim().toLowerCase()) || [];
  const looksLikeHeader = first[0]?.includes("tanggal") || first.includes("marketplace");
  const dataRows = looksLikeHeader ? rows.slice(1) : rows;

  const lookup = buildSaleLookup(sales);
  // Track how many rows in this file have already claimed each key, so
  // repeated (same day/marketplace/customer) purchases pair up in order.
  const claimedCount = new Map();

  return dataRows.map((cols, idx) => {
    const [tglRaw, mpRaw, invRaw, custRaw, feeRaw] = cols;

    const tanggal = parseFlexibleDate(tglRaw);
    const marketplace = (mpRaw || "").trim();
    const invoice = (invRaw || "").trim();
    const nama_pembeli = (custRaw || "").trim();
    const fee_mp = parseLooseNumber(feeRaw);

    const errors = [];
    if (!tanggal) errors.push("Tanggal tidak valid (pakai DD/MM/YYYY)");
    if (!marketplace) errors.push("Marketplace kosong");
    if (!nama_pembeli) errors.push("Nama customer kosong");
    if (!fee_mp || fee_mp <= 0) errors.push("Fee MP harus > 0");

    let matchedSale = null;
    if (tanggal && marketplace && nama_pembeli) {
      const key = matchKey(tanggal, marketplace, nama_pembeli);
      const candidates = lookup.get(key) || [];
      const claimed = claimedCount.get(key) || 0;
      if (candidates[claimed]) {
        matchedSale = candidates[claimed];
        claimedCount.set(key, claimed + 1);
      } else {
        errors.push("Tidak ditemukan transaksi yang cocok (Tanggal + Marketplace + Customer)");
      }
    }

    const produk = matchedSale ? getSaleProducts(matchedSale) : [];

    return {
      rowNumber: idx + 2,
      tanggal,
      marketplace,
      invoice,
      nama_pembeli,
      fee_mp,
      matchedSale,
      matchedProduk: produk[0]?.nama_produk || "",
      previousFee: matchedSale?.fee_mp || 0,
      errors,
      valid: errors.length === 0,
    };
  });
}

export default function FeeImportDialog({
  open,
  onOpenChange,
  onImport,
  isImporting = false,
  sales = [],
}) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

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
    downloadTextFile("template-fee-mp.csv", toCSV(TEMPLATE_HEADERS, TEMPLATE_SAMPLE_ROWS));
  };

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCSV(text);
    setRows(parseRows(parsed, sales));
  };

  const handleImport = () => {
    if (validRows.length === 0) return;
    onImport(
      validRows.map((r) => ({
        saleId: r.matchedSale.id,
        fee_mp: r.fee_mp,
      }))
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader onClose={handleClose}>
          <DialogTitle>Import Fee MP ke Transaksi</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Step 1: download template */}
          <div className="flex items-start gap-3 rounded-sm bg-secondary p-3">
            <FileSpreadsheet className="h-5 w-5 text-ink shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                Update Fee MP transaksi yang sudah ada
              </p>
              <p className="text-xs text-ash mt-0.5">
                Kolom: {TEMPLATE_HEADERS.join(", ")}. Tanggal format DD/MM/YYYY. Kolom{" "}
                <strong>Invoice</strong> cuma buat referensi tampilan — transaksi dicocokkan
                otomatis berdasarkan <strong>Tanggal + Marketplace + Nama Customer</strong>.
                Kalau ada 2 transaksi customer yang sama di hari & marketplace yang sama,
                fee dipasangkan berurutan sesuai urutan baris.
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
              htmlFor="fee-csv-input"
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
              id="fee-csv-input"
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
                  {validRows.length} cocok
                </Badge>
                {invalidRows.length > 0 && (
                  <Badge variant="danger">
                    <AlertTriangle className="h-3 w-3 mr-1 inline" />
                    {invalidRows.length} tidak cocok
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
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Customer</th>
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Produk Cocok</th>
                      <th className="text-right px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Fee Baru</th>
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
                        <td className="px-3 py-2 text-ink truncate max-w-[130px]">{r.nama_pembeli || "-"}</td>
                        <td className="px-3 py-2 text-ash truncate max-w-[140px]">
                          {r.matchedProduk || <span className="italic">-</span>}
                        </td>
                        <td className="px-3 py-2 text-right text-ink font-medium">{formatRupiah(r.fee_mp)}</td>
                        <td className="px-3 py-2">
                          {r.valid ? (
                            <span className="text-success font-medium">
                              Cocok{r.previousFee > 0 ? ` (fee lama ${formatRupiah(r.previousFee)})` : ""}
                            </span>
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
                Menyimpan...
              </>
            ) : (
              `Update ${validRows.length} Fee`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
