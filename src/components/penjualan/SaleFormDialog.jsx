"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { MARKETPLACES } from "@/lib/constants";

const defaultForm = {
  tanggal: new Date().toISOString().split("T")[0],
  nama_pembeli: "",
  username_domain: "",
  masa_aktif: "",
  no_hp: "",
  marketplace: "",
  invoice: "",
  fee_mp: 0,
};

const defaultItem = {
  kategori_produk: "",
  nama_produk: "",
  qty: 1,
  harga_jual: 0,
  harga_beli: 0,
};

function parseShopeeAddress(text) {
  const raw = text.trim();
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 1) {
    const commaMatch = lines[0].match(/^(.+?),\s*([\d]{8,15})/);
    if (commaMatch) return { nama_pembeli: commaMatch[1].trim(), no_hp: commaMatch[2].trim() };
  }
  const spaceMatch = raw.match(/^(.+?)\s+(62[\d]{8,13}|0[\d]{8,12})(\s|,|$)/);
  if (spaceMatch) return { nama_pembeli: spaceMatch[1].trim(), no_hp: spaceMatch[2].trim() };
  if (lines.length >= 2 && /^[\d]{8,15}$/.test(lines[1])) {
    return { nama_pembeli: lines[0].trim(), no_hp: lines[1].trim() };
  }
  return null;
}

function normalizeSale(sale) {
  if (sale.produk && sale.produk.length > 0) return sale;
  return {
    ...sale,
    produk: [
      {
        nama_produk: sale.nama_produk || "",
        kategori_produk: sale.kategori_produk || "",
        qty: sale.qty || 1,
        harga_jual: sale.harga_jual || 0,
        harga_beli: sale.harga_beli || 0,
      },
    ],
  };
}

export default function SaleFormDialog({
  open,
  onOpenChange,
  onSave,
  editData,
  isSaving = false,
  stocks = [],
}) {
  const [form, setForm] = useState(defaultForm);
  const [items, setItems] = useState([{ ...defaultItem }]);
  const [parsedFlash, setParsedFlash] = useState(false);

  useEffect(() => {
    if (editData) {
      const normalized = normalizeSale(editData);
      setForm({
        tanggal: normalized.tanggal || "",
        nama_pembeli: normalized.nama_pembeli || "",
        username_domain: normalized.username_domain || "",
        no_hp: normalized.no_hp || "",
        marketplace: normalized.marketplace || "",
        invoice: normalized.invoice || "",
        masa_aktif: normalized.masa_aktif || "",
        fee_mp: normalized.fee_mp || 0,
      });
      setItems(
        normalized.produk.map((p) => ({
          nama_produk: p.nama_produk || "",
          kategori_produk: p.kategori_produk || "",
          qty: p.qty || 1,
          harga_jual: p.harga_jual || 0,
          harga_beli: p.harga_beli || 0,
        }))
      );
    } else {
      setForm({
        ...defaultForm,
        tanggal: new Date().toISOString().split("T")[0],
      });
      setItems([{ ...defaultItem }]);
    }
  }, [editData, open]);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const setItem = (idx, key, val) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const handleProductSelect = (idx, productName) => {
    const product = stocks.find((s) => s.nama_produk === productName);
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              nama_produk: productName,
              kategori_produk: product?.kategori || "",
              harga_jual: product?.harga_jual || 0,
              harga_beli: product?.harga_beli || 0,
            }
          : it
      )
    );
  };

  const addItem = () => setItems((prev) => [...prev, { ...defaultItem }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleNamaPaste = (e) => {
    const pastedText = e.clipboardData.getData("text");
    const parsed = parseShopeeAddress(pastedText);
    if (parsed) {
      e.preventDefault();
      setForm((prev) => ({ ...prev, ...parsed }));
      setParsedFlash(true);
      setTimeout(() => setParsedFlash(false), 1500);
    }
  };

  const totalHargaJual = items.reduce(
    (sum, it) => sum + (Number(it.harga_jual) || 0) * (Number(it.qty) || 0),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const produk = items.map((item) => ({
      nama_produk: item.nama_produk,
      kategori_produk: item.kategori_produk || "",
      qty: Number(item.qty),
      harga_jual: Number(item.harga_jual),
      harga_beli: Number(item.harga_beli),
    }));
    onSave({
      ...form,
      fee_mp: Number(form.fee_mp) || 0,
      produk,
      // Legacy compat â€” pakai produk pertama
      nama_produk: produk[0]?.nama_produk || "",
      kategori_produk: produk[0]?.kategori_produk || "",
      qty: produk[0]?.qty || 1,
      harga_jual: produk[0]?.harga_jual || 0,
      harga_beli: produk[0]?.harga_beli || 0,
    });
  };

  const isValid = form.marketplace && items.every((it) => it.nama_produk);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>{editData ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
        </DialogHeader>

        {!editData && (
          <div className="flex items-center gap-2 text-xs text-ash bg-secondary/10 rounded-lg px-3 py-2 mx-5 mt-4">
            <Sparkles className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
            <span>
              Tempel data Shopee ke <strong>Nama Pembeli</strong> â€” nama & no HP otomatis terisi!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Info Transaksi (shared) */}
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
              <Label>Nama Pembeli *</Label>
              <Input
                value={form.nama_pembeli}
                onChange={(e) => setField("nama_pembeli", e.target.value)}
                onPaste={handleNamaPaste}
                placeholder="Tempel data Shopee di sini..."
                className={
                  parsedFlash ? "border-success ring-1 ring-success/40 transition-all duration-300" : ""
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>No HP</Label>
              <Input
                value={form.no_hp}
                onChange={(e) => setField("no_hp", e.target.value)}
                className={
                  parsedFlash ? "border-success ring-1 ring-success/40 transition-all duration-300" : ""
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Username/Domain</Label>
              <Input
                value={form.username_domain}
                onChange={(e) => setField("username_domain", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Marketplace *</Label>
              <Select
                value={form.marketplace}
                onValueChange={(v) => setField("marketplace", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih marketplace" />
                </SelectTrigger>
                <SelectContent>
                  {MARKETPLACES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice</Label>
              <Input
                value={form.invoice}
                onChange={(e) => setField("invoice", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Masa Aktif</Label>
              <Select
                value={form.masa_aktif}
                onValueChange={(v) => setField("masa_aktif", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih masa aktif" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1} Bulan`}>
                      {i + 1} Bulan
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Fee MP <span className="text-[10px] text-ash">(biaya marketplace)</span>
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.fee_mp}
                onChange={(e) => setField("fee_mp", e.target.value)}
              />
            </div>
          </div>

          {/* Divider produk */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-bold text-ash uppercase tracking-wider">
              Produk
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Daftar produk â€” dynamic rows */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-hairline bg-surface/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Produk {idx + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-danger hover:bg-danger/10"
                      onClick={() => removeItem(idx)}
                      aria-label="Hapus produk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nama Produk */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Nama Produk *</Label>
                    <Select
                      value={item.nama_produk}
                      onValueChange={(v) => handleProductSelect(idx, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk dari stok" />
                      </SelectTrigger>
                      <SelectContent>
                        {stocks.map((s) => (
                          <SelectItem key={s.id} value={s.nama_produk}>
                            {s.nama_produk}
                            {s.kategori ? ` (${s.kategori})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* QTY */}
                  <div className="space-y-1.5">
                    <Label>QTY *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => setItem(idx, "qty", e.target.value)}
                      required
                    />
                  </div>

                  {/* Harga Jual */}
                  <div className="space-y-1.5">
                    <Label>
                      Harga Jual{" "}
                      <span className="text-[10px] text-ash">(per item)</span>
                    </Label>
                    <Input
                      value={`Rp ${Number(item.harga_jual || 0).toLocaleString("id-ID")}`}
                      readOnly
                      className="bg-surface cursor-default"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Tombol tambah produk */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={addItem}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk Lain
            </Button>
          </div>

          {/* Grand Total */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-primary">
              Total Harga Jual (semua produk)
            </Label>
            <Input
              value={`Rp ${totalHargaJual.toLocaleString("id-ID")}`}
              readOnly
              className="bg-primary/5 font-bold text-primary border-primary/40"
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : editData ? (
              "Simpan"
            ) : (
              `Tambah${items.length > 1 ? ` (${items.length} Produk)` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
