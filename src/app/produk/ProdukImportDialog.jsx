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
import { parseCSV, toCSV, downloadTextFile, parseLooseNumber } from "@/lib/utils/csv";
import { formatRupiah, formatNumber } from "@/lib/utils/format";
import { KATEGORI } from "@/lib/constants";

// Kolom template — urutan ini yang di-download & yang divalidasi saat import
const TEMPLATE_HEADERS = [
  "Nama Produk",
  "Kategori",
  "Stok",
  "Harga Beli",
  "Harga Jual",
  "Keterangan",
];

const TEMPLATE_SAMPLE_ROWS = [
  ["Ip publik olt 1bulan", "Jasa", "500", "0", "11000", ""],
  ["Elementor Pro", "Plugin", "10", "350000", "450000", "Lisensi 1 tahun"],
];

function normalizeKategori(raw) {
  const v = (raw || "").trim().toLowerCase();
  if (v.startsWith("plug")) return "Plugin";
  if (v.startsWith("jasa")) return "Jasa";
  return "";
}

/**
 * Parse raw CSV rows into validated product objects.
 * `existingNames` is a Set of lowercased product names already in the
 * database — used to reject duplicates so the same product can't be
 * imported twice. Duplicates within the file itself (two rows with the
 * same name) are also flagged, keeping only the first occurrence valid.
 */
function parseRows(rows, existingNames) {
  // First row is the header — skip it if it looks like our template header
  const first = rows[0]?.map((c) => c.trim().toLowerCase()) || [];
  const looksLikeHeader = first[0]?.includes("nama") || first[0]?.includes("produk");
  const dataRows = looksLikeHeader ? rows.slice(1) : rows;

  const seenInFile = new Set();

  return dataRows.map((cols, idx) => {
    const [namaRaw, katRaw, stokRaw, beliRaw, jualRaw, ketRaw] = cols;
    const nama_produk = (namaRaw || "").trim();
    const namaKey = nama_produk.toLowerCase();
    const kategori = normalizeKategori(katRaw);
    const stok = parseLooseNumber(stokRaw);
    const harga_beli = parseLooseNumber(beliRaw);
    const harga_jual = parseLooseNumber(jualRaw);
    const keterangan = (ketRaw || "").trim();

    const errors = [];
    if (!nama_produk) errors.push("Nama produk kosong");
    if (!kategori) errors.push('Kategori harus "Plugin" atau "Jasa"');
    if (!jualRaw || harga_jual <= 0) errors.push("Harga jual harus > 0");

    if (nama_produk) {
      if (existingNames.has(namaKey)) {
        errors.push("Produk sudah ada di database");
      } else if (seenInFile.has(namaKey)) {
        errors.push("Nama produk duplikat di file ini");
      } else {
        seenInFile.add(namaKey);
      }
    }

    return {
      rowNumber: idx + 2, // +2: 1-indexed + header row
      nama_produk,
      kategori,
      stok,
      harga_beli,
      harga_jual,
      keterangan,
      errors,
      valid: errors.length === 0,
    };
  });
}

export default function ProdukImportDialog({
  open,
  onOpenChange,
  onImport,
  isImporting = false,
  existingProductNames = [],
}) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const existingNames = new Set(
    existingProductNames.map((n) => (n || "").trim().toLowerCase())
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
      "template-produk.csv",
      toCSV(TEMPLATE_HEADERS, TEMPLATE_SAMPLE_ROWS)
    );
  };

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCSV(text);
    setRows(parseRows(parsed, existingNames));
  };

  const handleImport = () => {
    if (validRows.length === 0) return;
    onImport(
      validRows.map((r) => ({
        nama_produk: r.nama_produk,
        kategori: r.kategori,
        stok: r.stok,
        harga_beli: r.harga_beli,
        harga_jual: r.harga_jual,
        keterangan: r.keterangan,
      }))
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader onClose={handleClose}>
          <DialogTitle>Import Produk dari CSV</DialogTitle>
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
                Kolom: {TEMPLATE_HEADERS.join(", ")}. Kategori diisi "Plugin" atau "Jasa".
                Kalau punya file Excel, buka lalu <strong>Save As → CSV</strong> sebelum upload.
                Produk yang nama-nya sudah ada di database otomatis ditolak.
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
              htmlFor="produk-csv-input"
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
              id="produk-csv-input"
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
                    {invalidRows.length} error
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
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Produk</th>
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Kategori</th>
                      <th className="text-right px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Stok</th>
                      <th className="text-right px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Jual</th>
                      <th className="text-left px-3 py-2 font-semibold text-ash uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {rows.map((r) => (
                      <tr key={r.rowNumber} className={r.valid ? "" : "bg-danger/5"}>
                        <td className="px-3 py-2 text-ash">{r.rowNumber}</td>
                        <td className="px-3 py-2 font-medium text-ink truncate max-w-[160px]">
                          {r.nama_produk || <span className="text-ash italic">-</span>}
                        </td>
                        <td className="px-3 py-2 text-ash">{r.kategori || "-"}</td>
                        <td className="px-3 py-2 text-right text-ash">{formatNumber(r.stok)}</td>
                        <td className="px-3 py-2 text-right text-ink">{formatRupiah(r.harga_jual)}</td>
                        <td className="px-3 py-2">
                          {r.valid ? (
                            <span className="text-success font-medium">OK</span>
                          ) : (
                            <span className="text-danger font-medium">
                              {r.errors.join("; ")}
                            </span>
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
              `Import ${validRows.length} Produk`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
