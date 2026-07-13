"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Receipt, Tag, Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import { toast as gooeyToast } from "gooey-toast";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import StatCard from "@/components/dashboard/StatCard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { KATEGORI_BIAYA } from "@/lib/constants";
import { useSupabaseData, invalidateCache } from "@/hooks/useSupabaseData";
import { insertRow, updateRow, deleteRow } from "@/lib/supabase/api";

const KAT_COLORS = {
  "Fee Marketplace": "bg-info/10 text-info border border-info/20",
  "Server & Hosting": "bg-primary/10 text-ink border border-primary/20",
  Internet: "bg-sky-100 text-sky-700 border border-sky-200",
  Iklan: "bg-pink-100 text-pink-700 border border-pink-200",
  "Alat Kantor": "bg-amber-100 text-amber-700 border border-amber-200",
  Transport: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  Konsumsi: "bg-success/10 text-success border border-success/20",
  "Lain-lain": "bg-secondary text-ash border border-hairline",
};

const defaultForm = {
  tanggal: new Date().toISOString().split("T")[0],
  kategori: "",
  keterangan: "",
  jumlah: "",
};

export default function BiayaPage() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");
  const { expenses: dbExpenses, sales } = useSupabaseData();
  const { toast } = useToast();

  const [expenses, setExpenses] = useState([]);
  useEffect(() => { setExpenses(dbExpenses); }, [dbExpenses]);

  // Fee MP bukan entry manual — nilainya disimpan per-transaksi di
  // sales.fee_mp (diisi lewat form Tambah Transaksi atau "Import Fee").
  // Di sini kita tampilkan sebagai baris read-only biar kelihatan di
  // halaman Biaya, tanpa duplikat entry nyata di tabel expenses (yang
  // bisa bikin Net Profit di Laporan ke-hitung dobel).
  const feeMPEntries = useMemo(
    () =>
      (sales || [])
        .filter((s) => (s.fee_mp || 0) > 0)
        .map((s) => ({
          id: `fee-${s.id}`,
          tanggal: s.tanggal,
          kategori: "Fee Marketplace",
          keterangan: `Fee MP ${s.marketplace || ""} - ${s.nama_pembeli || "transaksi"}`.trim(),
          jumlah: s.fee_mp || 0,
          isAutoFee: true,
        })),
    [sales]
  );

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [jumlahDisplay, setJumlahDisplay] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sorted = useMemo(
    () => [...expenses, ...feeMPEntries].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [expenses, feeMPEntries]
  );

  const filtered = useMemo(() => {
    return sorted.filter((e) => {
      if (kategori !== "all" && e.kategori !== kategori) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (e.keterangan || "").toLowerCase().includes(q);
    });
  }, [sorted, search, kategori]);

  const totalAll = sorted.reduce((s, e) => s + (e.jumlah || 0), 0);
  const totalFeeMP = sorted.filter((e) => e.kategori === "Fee Marketplace").reduce((s, e) => s + (e.jumlah || 0), 0);
  const totalOps = totalAll - totalFeeMP;
  const totalFiltered = filtered.reduce((s, e) => s + (e.jumlah || 0), 0);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const openTambah = () => {
    setEditData(null);
    setForm(defaultForm);
    setJumlahDisplay("");
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditData(item);
    setForm({
      tanggal: item.tanggal || defaultForm.tanggal,
      kategori: item.kategori || "",
      keterangan: item.keterangan || "",
      jumlah: item.jumlah || "",
    });
    setJumlahDisplay(item.jumlah ? Number(item.jumlah).toLocaleString("id-ID") : "");
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.kategori || !form.jumlah) return;

    setIsSaving(true);
    const payload = {
      tanggal: form.tanggal,
      kategori: form.kategori,
      keterangan: form.keterangan.trim(),
      jumlah: Number(form.jumlah),
      created_by: "demo@oosshop.id",
    };

    if (editData) {
      const res = await updateRow("expenses", editData.id, payload);
      if (!res.error && res.data) {
        setExpenses((prev) => prev.map((p) => (p.id === editData.id ? res.data : p)));
        gooeyToast.success({ title: "Biaya berhasil diperbarui" });
      } else {
        setExpenses((prev) => prev.map((p) => (p.id === editData.id ? { ...p, ...payload } : p)));
        toast({ title: "Gagal update di server", variant: "destructive" });
      }
    } else {
      const newItem = { id: `exp-${Date.now()}`, ...payload };
      const res = await insertRow("expenses", newItem);
      if (!res.error && res.data) {
        setExpenses((prev) => [res.data, ...prev]);
        gooeyToast.success({ title: "Biaya berhasil ditambahkan" });
      } else {
        setExpenses((prev) => [newItem, ...prev]);
        toast({ title: "Gagal tambah ke server", variant: "destructive" });
      }
    }

    invalidateCache();
    setIsSaving(false);
    setDialogOpen(false);
    setEditData(null);
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    setExpenses((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    const { error } = await deleteRow("expenses", confirmDelete.id);
    if (!error) {
      invalidateCache();
      gooeyToast.success({ title: "Biaya berhasil dihapus" });
    } else {
      toast({ title: "Gagal menghapus dari server", variant: "destructive" });
    }
    setConfirmDelete(null);
  };

  const isValid = form.kategori && form.jumlah;

  return (
    <div>
      <PageHeader
        title="Biaya"
        subtitle="Catat semua pengeluaran & biaya operasional"
      >
        <Button variant="primary" onClick={openTambah}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
        <StatCard
          title="Total Semua"
          value={formatRupiah(totalAll)}
          icon={Receipt}
          color="primary"
        />
        <StatCard
          title="Fee Marketplace"
          value={formatRupiah(totalFeeMP)}
          icon={Tag}
          color="sky"
        />
        <StatCard
          title="Operasional"
          value={formatRupiah(totalOps)}
          icon={Briefcase}
          color="emerald"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
          <Input
            placeholder="Cari keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="h-10 px-3 rounded-sm border border-hairline-strong bg-surface-card text-sm text-ink"
        >
          <option value="all">Semua Kategori</option>
          {KATEGORI_BIAYA.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Belum ada biaya" />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block rounded-sm bg-surface-card shadow-card overflow-hidden">
            <div className="px-4 py-2 border-b border-hairline bg-surface/30 text-xs flex justify-between text-ash">
              <span>Menampilkan {filtered.length} dari {sorted.length} entri</span>
              <span className="font-mono font-semibold text-ink">
                Total: {formatRupiah(totalFiltered)}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-ash">{formatDate(e.tanggal)}</TableCell>
                    <TableCell>
                      <Badge className={KAT_COLORS[e.kategori] || ""}>{e.kategori}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{e.keterangan}</TableCell>
                    <TableCell className="text-right font-semibold text-ink">
                      {formatRupiah(e.jumlah)}
                    </TableCell>
                    <TableCell>
                      {e.isAutoFee ? (
                        <span className="text-[10px] text-ash italic block text-right">dari Penjualan</span>
                      ) : (
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => openEdit(e)}
                            className="p-1.5 rounded-full text-ash hover:text-ink hover:bg-secondary transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(e)}
                            className="p-1.5 rounded-full text-ash hover:text-danger hover:bg-danger/10 transition-colors"
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: card list */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((e) => (
              <div key={e.id} className="rounded-sm bg-surface-card shadow-card overflow-hidden animate-fade-up">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-hairline/40">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-ash whitespace-nowrap">
                      {formatDate(e.tanggal)}
                    </span>
                    <Badge className={KAT_COLORS[e.kategori] || ""}>{e.kategori}</Badge>
                  </div>
                  {e.isAutoFee ? (
                    <span className="text-[10px] text-ash italic shrink-0">dari Penjualan</span>
                  ) : (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(e)}
                        className="p-1.5 rounded-full text-ash hover:text-ink hover:bg-secondary transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(e)}
                        className="p-1.5 rounded-full text-ash hover:text-danger hover:bg-danger/10 transition-colors"
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                  <p className="text-body-sm font-bold text-ink break-words min-w-0">
                    {e.keterangan || "-"}
                  </p>
                  <p className="text-body-sm font-bold text-ink shrink-0 whitespace-nowrap">
                    {formatRupiah(e.jumlah)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditData(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader onClose={() => setDialogOpen(false)}>
            <DialogTitle>{editData ? "Edit Biaya" : "Tambah Biaya"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tanggal *</Label>
                <Input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setField("tanggal", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori *</Label>
                <select
                  value={form.kategori}
                  onChange={(e) => setField("kategori", e.target.value)}
                  className="w-full h-10 px-3 rounded-sm border border-hairline-strong bg-surface-card text-sm text-ink"
                  required
                >
                  <option value="">Pilih kategori</option>
                  {KATEGORI_BIAYA.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Jumlah *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-ash pointer-events-none">Rp</span>
                <Input
                  value={jumlahDisplay}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const num = Number(raw) || 0;
                    setJumlahDisplay(raw ? Number(raw).toLocaleString("id-ID") : "");
                    setField("jumlah", num);
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Keterangan</Label>
              <Input
                value={form.keterangan}
                onChange={(e) => setField("keterangan", e.target.value)}
                placeholder="Deskripsi biaya..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={!isValid || isSaving}>
                {isSaving ? "Menyimpan..." : editData ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete != null}
        onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}
        title="Hapus Biaya?"
        message={
          <>
            Biaya <strong>{confirmDelete?.keterangan || confirmDelete?.kategori}</strong> akan dihapus permanen.
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
