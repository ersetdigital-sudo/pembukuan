"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Boxes, Wallet, ShoppingBag, Plus, Trash2, Pencil } from "lucide-react";
import { toast as gooeyToast } from "gooey-toast";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import StatCard from "@/components/dashboard/StatCard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah, formatDate, formatNumber } from "@/lib/utils/format";
import { useSupabaseData, invalidateCache } from "@/hooks/useSupabaseData";
import { insertRow, updateRow, deleteRow } from "@/lib/supabase/api";

const defaultForm = {
  tanggal: new Date().toISOString().split("T")[0],
  nama_produk: "",
  qty: "",
  harga_satuan: "",
  keterangan: "",
};

export default function PembelianPage() {
  const [search, setSearch] = useState("");
  const { purchases: dbPurchases } = useSupabaseData();
  const { toast } = useToast();

  const [purchases, setPurchases] = useState([]);
  useEffect(() => { setPurchases(dbPurchases); }, [dbPurchases]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sorted = useMemo(
    () => [...purchases].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [purchases]
  );
  const filtered = sorted.filter((p) =>
    !search.trim() || (p.nama_produk || "").toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, p) => s + (p.total || 0), 0);
  const totalQty = filtered.reduce((s, p) => s + (p.qty || 0), 0);

  const openTambah = () => {
    setEditData(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditData(item);
    setForm({
      tanggal: item.tanggal || defaultForm.tanggal,
      nama_produk: item.nama_produk || "",
      qty: item.qty || "",
      harga_satuan: item.harga_satuan || "",
      keterangan: item.keterangan || "",
    });
    setDialogOpen(true);
  };

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nama_produk.trim() || !form.qty || !form.harga_satuan) return;

    setIsSaving(true);
    const qty = Number(form.qty);
    const harga_satuan = Number(form.harga_satuan);
    const payload = {
      tanggal: form.tanggal,
      nama_produk: form.nama_produk.trim(),
      qty,
      harga_satuan,
      total: qty * harga_satuan,
      keterangan: form.keterangan.trim(),
      created_by: "demo@oosshop.id",
    };

    if (editData) {
      const res = await updateRow("purchases", editData.id, payload);
      if (!res.error && res.data) {
        setPurchases((prev) => prev.map((p) => (p.id === editData.id ? res.data : p)));
        gooeyToast.success({ title: "Pembelian berhasil diperbarui" });
      } else {
        setPurchases((prev) => prev.map((p) => (p.id === editData.id ? { ...p, ...payload } : p)));
        toast({ title: "Gagal update di server", variant: "destructive" });
      }
    } else {
      const newItem = { id: `pur-${Date.now()}`, ...payload };
      const res = await insertRow("purchases", newItem);
      if (!res.error && res.data) {
        setPurchases((prev) => [res.data, ...prev]);
        gooeyToast.success({ title: "Pembelian berhasil ditambahkan" });
      } else {
        setPurchases((prev) => [newItem, ...prev]);
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
    setPurchases((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    const { error } = await deleteRow("purchases", confirmDelete.id);
    if (!error) {
      invalidateCache();
      gooeyToast.success({ title: "Pembelian berhasil dihapus" });
    } else {
      toast({ title: "Gagal menghapus dari server", variant: "destructive" });
    }
    setConfirmDelete(null);
  };

  const isValid = form.nama_produk.trim() && form.qty && form.harga_satuan;

  return (
    <div>
      <PageHeader
        title="Pembelian"
        subtitle={`${sorted.length} entri - restock & pembelian operasional`}
      >
        <Button variant="primary" onClick={openTambah}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
        <StatCard
          title="Total Entri"
          value={formatNumber(sorted.length)}
          icon={ShoppingBag}
          color="primary"
        />
        <StatCard
          title="Total QTY"
          value={formatNumber(totalQty)}
          icon={Boxes}
          color="sky"
        />
        <StatCard
          title="Total Belanja"
          value={formatRupiah(total)}
          icon={Wallet}
          color="emerald"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
        <Input
          placeholder="Cari nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Belum ada pembelian" />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block rounded-sm bg-surface-card shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-center">QTY</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-ash">{formatDate(p.tanggal)}</TableCell>
                    <TableCell className="font-medium">{p.nama_produk}</TableCell>
                    <TableCell className="text-center">{p.qty}</TableCell>
                    <TableCell className="text-right">{formatRupiah(p.harga_satuan)}</TableCell>
                    <TableCell className="text-right font-bold text-ink">
                      {formatRupiah(p.total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-full text-ash hover:text-ink hover:bg-secondary transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(p)}
                          className="p-1.5 rounded-full text-ash hover:text-danger hover:bg-danger/10 transition-colors"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: card list */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-sm bg-surface-card shadow-card overflow-hidden animate-fade-up">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-hairline/40">
                  <span className="text-[10px] font-mono text-ash whitespace-nowrap">
                    {formatDate(p.tanggal)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-full text-ash hover:text-ink hover:bg-secondary transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(p)}
                      className="p-1.5 rounded-full text-ash hover:text-danger hover:bg-danger/10 transition-colors"
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-body-sm font-bold text-ink break-words">{p.nama_produk}</p>
                  {p.keterangan && (
                    <p className="text-[11px] text-ash mt-0.5">{p.keterangan}</p>
                  )}
                </div>
                <div className="grid grid-cols-3 border-t border-hairline/40 divide-x divide-hairline/40">
                  <div className="px-2.5 py-2 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-ash font-semibold">QTY</p>
                    <p className="text-xs font-bold text-ink mt-1">{p.qty}</p>
                  </div>
                  <div className="px-2.5 py-2 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-ash font-semibold">Satuan</p>
                    <p className="text-xs font-semibold text-ink mt-1 truncate">{formatRupiah(p.harga_satuan)}</p>
                  </div>
                  <div className="px-2.5 py-2 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-ash font-semibold">Total</p>
                    <p className="text-xs font-bold text-ink mt-1 truncate">{formatRupiah(p.total)}</p>
                  </div>
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
            <DialogTitle>{editData ? "Edit Pembelian" : "Tambah Pembelian"}</DialogTitle>
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
                <Label>Nama Produk *</Label>
                <Input
                  value={form.nama_produk}
                  onChange={(e) => setField("nama_produk", e.target.value)}
                  placeholder="Nama produk yang dibeli"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>QTY *</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.qty}
                  onChange={(e) => setField("qty", e.target.value)}
                  placeholder="0"
                  onFocus={(e) => e.target.select()}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Harga Satuan *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.harga_satuan}
                  onChange={(e) => setField("harga_satuan", e.target.value)}
                  placeholder="0"
                  onFocus={(e) => e.target.select()}
                  required
                />
              </div>
            </div>

            {/* Live total preview */}
            {form.qty && form.harga_satuan && (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-sm bg-secondary/50 animate-fade-up">
                <span className="text-[11px] font-medium text-ash">Total</span>
                <span className="text-body-sm font-bold text-ink tabular-nums">
                  {formatRupiah(Number(form.qty) * Number(form.harga_satuan))}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Keterangan</Label>
              <Input
                value={form.keterangan}
                onChange={(e) => setField("keterangan", e.target.value)}
                placeholder="Opsional..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isValid || isSaving}
              >
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
        title="Hapus Pembelian?"
        message={
          <>
            Data pembelian <strong>{confirmDelete?.nama_produk}</strong> akan dihapus permanen.
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
