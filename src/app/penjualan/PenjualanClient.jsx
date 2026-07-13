"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Pencil, Trash2, Wallet, Tag, Star, TrendingUp, Plus, Search, Upload } from "lucide-react";
import { toast as gooeyToast } from "gooey-toast";
import { useSupabaseData, invalidateCache } from "@/hooks/useSupabaseData";
import { useSettings } from "@/hooks/useSettings";
import { fetchTable, insertRow, updateRow, deleteRow } from "@/lib/supabase/api";
import { getSaleTotals, getSaleProducts } from "@/lib/utils/sale";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import MonthPicker from "@/components/dashboard/MonthPicker";
import StatCard from "@/components/dashboard/StatCard";
import SaleFormDialog from "@/components/penjualan/SaleFormDialog";
import SaleDetailModal from "@/components/penjualan/SaleDetailModal";
import PenjualanImportDialog from "./PenjualanImportDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah, formatDate, formatNumber } from "@/lib/utils/format";
import { MP_BADGE } from "@/lib/constants";

export default function PenjualanClient() {
  const searchParams = useSearchParams();
  const month = searchParams?.get("m") ?? "all";
  const year = searchParams?.get("y") ?? String(new Date().getFullYear());
  const { toast } = useToast();

  // Supabase data with fallback
  const { sales: dbSales, stocks: dbStocks } = useSupabaseData();
  const { marketplaces } = useSettings();

  // Local state for sales (allows adding new ones this session)
  const [sales, setSales] = useState([]);
  const [stocks, setStocks] = useState([]);

  useEffect(() => { setSales(dbSales); }, [dbSales]);
  useEffect(() => { setStocks(dbStocks); }, [dbStocks]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [detailSale, setDetailSale] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const filtered = useMemo(
    () =>
      sales.filter((s) => {
        if (!s.tanggal) return false;
        const d = new Date(s.tanggal);
        if (d.getFullYear() !== Number(year)) return false;
        if (month !== "all" && d.getMonth() !== Number(month)) return false;
        return true;
      }),
    [sales, year, month]
  );

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [filtered]
  );

  const displaySales = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.trim().toLowerCase();
    return sorted.filter((s) => {
      if (s.nama_pembeli?.toLowerCase().includes(q)) return true;
      const produk = getSaleProducts(s);
      return produk.some((p) => p.nama_produk?.toLowerCase().includes(q));
    });
  }, [sorted, query]);

  // 4 totals for compact cards
  const totalJual = sorted.reduce((sum, s) => sum + getSaleTotals(s).totalJual, 0);
  const totalModal = sorted.reduce((sum, s) => sum + getSaleTotals(s).totalBeli, 0);
  const totalFee = sorted.reduce((sum, s) => sum + (s.fee_mp || 0), 0);
  const totalProfit = sorted.reduce(
    (sum, s) => sum + getSaleTotals(s).totalJual - getSaleTotals(s).totalBeli - getSaleTotals(s).fee,
    0
  );

  // Generate invoice
  const nextInvoice = () => {
    const yr = String(year).slice(-2);
    const m = String(month === "all" ? new Date().getMonth() : month).padStart(2, "0");
    const seq = String(sales.length + 1).padStart(3, "0");
    return `INV/${yr}${m}/${seq}`;
  };

  const openTambah = () => {
    setEditData(null);
    setDialogOpen(true);
  };

  const openEdit = (sale) => {
    setEditData(sale);
    setDialogOpen(true);
  };

  const handleSave = async (data) => {
    setIsSaving(true);
    let error = null;

    if (editData) {
      const res = await updateRow("sales", editData.id, data);
      error = res.error;
      if (!error && res.data) {
        // Langsung pakai row hasil update dari Supabase (tanpa fetch ulang)
        setSales((prev) =>
          prev.map((s) => (s.id === editData.id ? res.data : s))
        );
        gooeyToast.success({ title: `Transaksi ${editData.invoice} berhasil diperbarui` });
      } else {
        // Fallback ke optimistic kalau server gagal
        setSales((prev) =>
          prev.map((s) =>
            s.id === editData.id
              ? { ...s, ...data, id: editData.id, invoice: s.invoice }
              : s
          )
        );
        toast({
          title: "Gagal memperbarui di server",
          description: error?.message || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    } else {
      const newSale = {
        id: `sale-${Date.now()}`,
        invoice: data.invoice || nextInvoice(),
        ...data,
      };
      const res = await insertRow("sales", newSale);
      error = res.error;
      if (!error && res.data) {
        setSales((prev) => [res.data, ...prev]);
        gooeyToast.success({ title: `Transaksi ${newSale.invoice} berhasil ditambahkan` });
      } else {
        setSales((prev) => [newSale, ...prev]);
        toast({
          title: "Gagal menambahkan ke server",
          description: error?.message || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    }

    if (!error) {
      invalidateCache();
    }

    setIsSaving(false);
    setDialogOpen(false);
    setEditData(null);
  };

  const handleImport = async (importedSales) => {
    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;
    const newSales = [];

    // Sequential insert keeps invoice numbering stable and errors easy to attribute.
    // Use a local offset since `sales` state doesn't update mid-loop.
    const yr = String(year).slice(-2);
    const mm = String(month === "all" ? new Date().getMonth() : month).padStart(2, "0");
    let seq = sales.length;

    for (const data of importedSales) {
      seq += 1;
      const produk = data.produk[0];
      const invoice = `INV/${yr}${mm}/${String(seq).padStart(3, "0")}`;
      const newSale = {
        id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        invoice,
        ...data,
        // Legacy compat fields
        nama_produk: produk.nama_produk,
        kategori_produk: produk.kategori_produk,
        qty: produk.qty,
        harga_jual: produk.harga_jual,
        harga_beli: produk.harga_beli,
      };
      const res = await insertRow("sales", newSale);
      if (!res.error) {
        newSales.push(res.data || newSale);
        successCount++;
      } else {
        newSales.push(newSale);
        failCount++;
      }
    }

    setSales((prev) => [...newSales, ...prev]);
    invalidateCache();
    setIsImporting(false);
    setImportOpen(false);

    if (failCount === 0) {
      gooeyToast.success({ title: `${successCount} transaksi berhasil diimpor` });
    } else {
      toast({
        title: `${successCount} transaksi diimpor, ${failCount} gagal ke server`,
        description: "Transaksi yang gagal tetap tampil di tabel lokal, coba refresh untuk cek ulang.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (sale) => {
    setDetailSale(null);
    setConfirmDelete(sale);
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    const deleted = confirmDelete;

    // Optimistic local remove agar UI langsung update
    setSales((prev) => prev.filter((s) => s.id !== deleted.id));

    const { error } = await deleteRow("sales", deleted.id);
    if (!error) {
      invalidateCache();
      gooeyToast.success({
        title: `Transaksi ${deleted.invoice} berhasil dihapus`,
      });
    } else {
      toast({
        title: "Gagal menghapus dari server",
        description:
          error.message || "Data terhapus di tampilan lokal, coba refresh halaman.",
        variant: "destructive",
      });
    }
    setConfirmDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="Penjualan"
        subtitle="Catat semua transaksi penjualan harian"
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <MonthPicker month={month} year={year} />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setImportOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button
              variant="primary"
              onClick={openTambah}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* 4 stat cards — samain style dengan dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
        <StatCard
          title="Total Penjualan"
          value={formatRupiah(totalJual)}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Modal"
          value={formatRupiah(totalModal)}
          icon={Wallet}
          color="sky"
        />
        <StatCard
          title="Total Fee MP"
          value={formatRupiah(totalFee)}
          icon={Tag}
          color="secondary"
        />
        <StatCard
          title="Total Profit"
          value={formatRupiah(totalProfit)}
          icon={Star}
          color="emerald"
          valueClass={totalProfit >= 0 ? "text-success" : "text-danger"}
        />
      </div>

      {/* Search bar */}
      {sorted.length > 0 && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pembeli atau produk..."
            className="w-full md:max-w-sm pl-9 pr-4 py-2.5 rounded-full border border-hairline bg-secondary text-body-sm text-ink placeholder:text-stone focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      )}

      {/* Desktop: Google Sheets style table */}
      {sorted.length === 0 ? (
        <EmptyState message="Belum ada transaksi" />
      ) : (
        <>
          {displaySales.length === 0 ? (
            <EmptyState message={`Tidak ada hasil untuk "${query}"`} />
          ) : (
            <>
              <div className="hidden md:block rounded-sm overflow-hidden shadow-card">
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-sm border-collapse">
                <thead className="border-b border-hairline">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ash">
                      Tanggal
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ash">
                      Pembeli
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ash">
                      Marketplace
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ash">
                      Produk
                    </th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ash">
                      Fee MP
                    </th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ash">
                      Total Jual
                    </th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ash">
                      Profit
                    </th>
                    <th className="w-28"></th>
                  </tr>
                </thead>
                <tbody>
                {displaySales.map((s, idx) => {
                  const totals = getSaleTotals(s);
                  const produk = getSaleProducts(s);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-hairline transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-4 py-2.5 text-xs text-ash whitespace-nowrap">
                        {formatDate(s.tanggal)}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink align-middle whitespace-nowrap">
                        {s.nama_pembeli}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={MP_BADGE[s.marketplace] || ""}>
                          {s.marketplace}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-baseline gap-1.5 text-xs leading-snug min-w-0">
                          <span className="font-medium text-ink truncate min-w-0">
                            {produk[0]?.nama_produk}
                          </span>
                          {produk[0]?.qty > 0 && (
                            <span className="font-bold text-ink shrink-0">
                              ×{produk[0].qty}
                            </span>
                          )}
                          {produk[0]?.masa_aktif && (
                            <span className="text-ash text-[10px] shrink-0">
                              ({produk[0].masa_aktif})
                            </span>
                          )}
                          {produk.length > 1 && (
                            <span className="inline-flex items-center px-1.5 py-0 rounded text-[10px] font-semibold bg-secondary text-ash border border-hairline">
                              +{produk.length - 1} lainnya
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap">
                        {s.fee_mp ? (
                          <span className="text-charcoal">{formatRupiah(s.fee_mp)}</span>
                        ) : (
                          <span className="text-ash">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink whitespace-nowrap">
                        {formatRupiah(totals.totalJual)}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                        totals.profit >= 0 ? "text-success" : "text-danger"
                      }`}>
                        {formatRupiah(totals.profit)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            aria-label="Lihat detail"
                            onClick={() => setDetailSale(s)}
                            className="p-1.5 text-ash hover:text-secondary hover:bg-surface rounded transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Edit"
                            onClick={() => openEdit(s)}
                            className="p-1.5 text-ash hover:text-secondary hover:bg-surface rounded transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Hapus"
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-ash hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>

          {/* Mobile: card list view */}
          <div className="md:hidden space-y-2.5">
            {displaySales.map((s) => {
              const totals = getSaleTotals(s);
              const produk = getSaleProducts(s);
              return (
                <MobileSaleCard
                  key={s.id}
                  sale={s}
                  totals={totals}
                  produk={produk}
                  onDetail={() => setDetailSale(s)}
                  onEdit={() => openEdit(s)}
                  onDelete={() => handleDelete(s)}
                />
              );
            })}
              </div>
            </>
          )}
        </>
      )}

      {/* Form dialog */}
      <SaleFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditData(null);
        }}
        onSave={handleSave}
        editData={editData}
        isSaving={isSaving}
        stocks={stocks}
        marketplaces={marketplaces}
      />

      {/* Import dialog */}
      <PenjualanImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
        isImporting={isImporting}
        stocks={stocks}
        marketplaces={marketplaces}
        existingSales={sales}
      />

      {/* Detail modal */}
      <SaleDetailModal
        sale={detailSale}
        open={detailSale != null}
        onOpenChange={(o) => {
          if (!o) setDetailSale(null);
        }}
        onEdit={(sale) => {
          setEditData(sale);
          setDialogOpen(true);
        }}
        onDelete={handleDelete}
      />

      {/* Confirm delete dialog (custom, bukan window.confirm) */}
      <ConfirmDialog
        open={confirmDelete != null}
        onOpenChange={(o) => {
          if (!o) setConfirmDelete(null);
        }}
        title="Hapus Transaksi?"
        message={
          <>
            Transaksi{" "}
            <strong className="font-mono text-ink">
              {confirmDelete?.invoice}
            </strong>{" "}
            akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </>
        }
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={performDelete}
      />
    </div>
  );
}

// ── Mobile-only card view (pengganti tabel di mobile) ──────────────
function MobileSaleCard({ sale, totals, produk, onDetail, onEdit, onDelete }) {
  const profitPositive = totals.profit >= 0;
  return (
    <div className="rounded-sm bg-surface-card shadow-card overflow-hidden">
      {/* Header: date + marketplace + actions */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-hairline/40 bg-surface/30">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[10px] font-mono text-ash whitespace-nowrap shrink-0">
            {formatDate(sale.tanggal)}
          </span>
          {sale.marketplace && (
            <Badge className={MP_BADGE[sale.marketplace] || ""}>
              {sale.marketplace}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            aria-label="Lihat detail"
            onClick={onDetail}
            className="p-2 text-ash hover:text-secondary hover:bg-surface rounded transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Edit"
            onClick={onEdit}
            className="p-2 text-ash hover:text-secondary hover:bg-surface rounded transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Hapus"
            onClick={onDelete}
            className="p-2 text-ash hover:text-danger hover:bg-danger/10 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body: buyer + products */}
      <div className="px-3 py-2.5 space-y-2">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
            Pembeli
          </p>
          <p className="text-sm font-bold text-ink mt-1 break-words">
            {sale.nama_pembeli}
          </p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
            Produk
          </p>
          <div className="mt-1 flex flex-col gap-0.5">
            {produk.map((p, i) => (
              <div
                key={i}
                className="flex items-baseline gap-1.5 text-xs text-ink leading-snug min-w-0"
              >
                <span className="font-medium text-ink truncate min-w-0 flex-1">
                  {p.nama_produk}
                </span>
                {p.qty > 0 && (
                  <span className="font-bold text-ink shrink-0">×{p.qty}</span>
                )}
                {p.masa_aktif && (
                  <span className="text-ash text-[10px] shrink-0">
                    ({p.masa_aktif})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: 3-col financials grid */}
      <div className="grid grid-cols-3 border-t border-hairline/40 divide-x divide-hairline/40">
        <div className="px-2.5 py-2">
          <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
            Fee MP
          </p>
          <p className="text-[11px] sm:text-xs font-semibold text-secondary mt-1.5 truncate">
            {sale.fee_mp ? formatRupiah(sale.fee_mp) : "-"}
          </p>
        </div>
        <div className="px-2.5 py-2">
          <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
            Total Jual
          </p>
          <p className="text-[11px] sm:text-xs font-bold text-ink mt-1.5 truncate">
            {formatRupiah(totals.totalJual)}
          </p>
        </div>
        <div className="px-2.5 py-2">
          <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
            Profit
          </p>
          <p
            className={`text-[11px] sm:text-xs font-bold mt-1.5 truncate ${
              profitPositive ? "text-success" : "text-danger"
            }`}
          >
            {formatRupiah(totals.profit)}
          </p>
        </div>
      </div>
    </div>
  );
}
