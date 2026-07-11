"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Boxes,
  Tag,
  Wrench,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useSupabaseData, invalidateCache } from "@/hooks/useSupabaseData";
import { fetchTable, insertRow, updateRow, deleteRow } from "@/lib/supabase/api";
import { formatRupiah, formatNumber } from "@/lib/utils/format";
import { KATEGORI } from "@/lib/constants";
import ProdukFormDialog from "./ProdukFormDialog";

export default function ProdukPage() {
  const { toast } = useToast();
  const { stocks: dbStocks } = useSupabaseData();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");

  useEffect(() => {
    setProducts(dbStocks);
  }, [dbStocks]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (kategori !== "all" && p.kategori !== kategori) return false;
      if (!search.trim()) return true;
      return (p.nama_produk || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [products, search, kategori]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => a.nama_produk.localeCompare(b.nama_produk)),
    [filtered]
  );

  // Stats
  const totalProducts = products.length;
  const pluginCount = products.filter((p) => p.kategori === "Plugin").length;
  const jasaCount = products.filter((p) => p.kategori === "Jasa").length;
  const potensiProfit = products.reduce((sum, p) => {
    if (p.kategori === "Jasa") return sum;
    return sum + (p.harga_jual - p.harga_beli) * p.stok;
  }, 0);

  const handleOpenAdd = () => {
    setEditData(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditData(item);
    setDialogOpen(true);
  };

  const handleSave = async (form) => {
    setIsSaving(true);
    let error = null;
    if (editData) {
      const res = await updateRow("stocks", editData.id, form);
      error = res.error;
      if (!error && res.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editData.id ? res.data : p))
        );
        toast.success("Produk berhasil diperbarui");
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === editData.id ? { ...p, ...form, id: editData.id } : p))
        );
        toast({
          title: "Gagal memperbarui di server",
          description: error?.message || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    } else {
      const newProduct = {
        id: `pr-${Date.now()}`,
        ...form,
      };
      const res = await insertRow("stocks", newProduct);
      error = res.error;
      if (!error && res.data) {
        setProducts((prev) => [...prev, res.data]);
        toast.success("Produk berhasil ditambahkan");
      } else {
        setProducts((prev) => [...prev, newProduct]);
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

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    // Optimistic local remove
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));

    const { error } = await deleteRow("stocks", deleteId);
    if (!error) {
      invalidateCache();
      toast.success("Produk berhasil dihapus");
    } else {
      toast({
        title: "Gagal menghapus dari server",
        description:
          error.message || "Data terhapus di tampilan lokal, coba refresh halaman.",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Produk"
        subtitle={`${totalProducts} produk dalam katalog`}
      >
        <Button variant="plugin" size="sm" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Produk"
          value={formatNumber(totalProducts)}
          icon={Boxes}
        />
        <StatCard
          label="Plugin"
          value={formatNumber(pluginCount)}
          icon={Tag}
          color="text-secondary"
        />
        <StatCard
          label="Jasa"
          value={formatNumber(jasaCount)}
          icon={Wrench}
          color="text-success"
        />
        <StatCard
          label="Potensi Profit Stok"
          value={formatRupiah(potensiProfit)}
          icon={TrendingUp}
          color="text-primary"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
          <Input
            placeholder="Cari nama produkâ€¦"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-surface-card text-sm"
        >
          <option value="all">Semua Kategori</option>
          {KATEGORI.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        {sorted.length === 0 ? (
          <EmptyState message="Belum ada produk" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Modal</TableHead>
                <TableHead className="text-right">Jual</TableHead>
                <TableHead className="text-center">Stok</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="w-24 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p) => {
                const margin =
                  p.harga_beli > 0
                    ? ((p.harga_jual - p.harga_beli) / p.harga_beli) * 100
                    : null;

                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{p.nama_produk}</span>
                        {p.keterangan && (
                          <span className="text-[10px] text-ash truncate max-w-[200px]">
                            {p.keterangan}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.kategori === "Plugin" ? "primary" : "success"}
                      >
                        {p.kategori}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-ash">
                      {formatRupiah(p.harga_beli)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatRupiah(p.harga_jual)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {p.kategori === "Jasa" ? "âˆž" : formatNumber(p.stok)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {margin !== null ? (
                        <span
                          className={`font-bold text-sm ${
                            margin >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-ash">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          aria-label="Edit produk"
                          onClick={() => handleOpenEdit(p)}
                          className="grid h-7 w-7 place-items-center rounded text-ash hover:bg-surface hover:text-ink transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Hapus produk"
                          onClick={() => setDeleteId(p.id)}
                          className="grid h-7 w-7 place-items-center rounded text-ash hover:bg-danger/10 hover:text-danger transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialogs */}
      <ProdukFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        editData={editData}
        isSaving={isSaving}
      />

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title="Hapus Produk?"
        message={
          <>
            Produk ini akan dihapus dari katalog. Data yang sudah dihapus{" "}
            <strong>tidak dapat dikembalikan</strong>.
          </>
        }
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = "text-ink" }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card p-3">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={`h-4 w-4 ${color}`} />}
        <p className="text-[10px] uppercase tracking-wider font-semibold text-ash">
          {label}
        </p>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
