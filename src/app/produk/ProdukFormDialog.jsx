"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { KATEGORI } from "@/lib/constants";

const defaultForm = {
  nama_produk: "",
  kategori: "",
  stok: "",
  harga_beli: "",
  harga_jual: "",
  keterangan: "",
};

export default function ProdukFormDialog({
  open,
  onOpenChange,
  onSave,
  editData,
  isSaving = false,
}) {
  const [form, setForm] = useState(defaultForm);

  const fmtRp = (val) => {
    if (val === "" || val === null || val === undefined) return "";
    const num = Number(String(val).replace(/\D/g, ""));
    if (isNaN(num)) return "";
    return "Rp " + num.toLocaleString("id-ID");
  };

  useEffect(() => {
    if (editData) {
      setForm({
        nama_produk: editData.nama_produk || "",
        kategori: editData.kategori || "",
        stok: String(editData.stok ?? ""),
        harga_beli: String(editData.harga_beli ?? ""),
        harga_jual: String(editData.harga_jual ?? ""),
        keterangan: editData.keterangan || "",
      });
    } else {
      setForm({ ...defaultForm });
    }
  }, [editData, open]);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      stok: Number(form.stok) || 0,
      harga_beli: Number(String(form.harga_beli).replace(/\D/g, "")) || 0,
      harga_jual: Number(String(form.harga_jual).replace(/\D/g, "")) || 0,
    });
  };

  const isValid =
    form.nama_produk.trim() &&
    form.kategori &&
    form.stok !== "" &&
    form.harga_jual !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>
            {editData ? "Edit Produk" : "Tambah Produk"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Produk *</Label>
            <Input
              value={form.nama_produk}
              onChange={(e) => setField("nama_produk", e.target.value)}
              placeholder="Contoh: Elementor Pro"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Kategori *</Label>
            <Select
              value={form.kategori}
              onValueChange={(v) => setField("kategori", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Harga Beli (Modal) *</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Rp 0"
                value={fmtRp(form.harga_beli)}
                onChange={(e) => setField("harga_beli", e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Harga Jual *</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Rp 0"
                value={fmtRp(form.harga_jual)}
                onChange={(e) => setField("harga_jual", e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Stok *</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={form.stok}
              onChange={(e) => setField("stok", e.target.value)}
              required
            />
            {form.kategori === "Jasa" && (
              <p className="text-[10px] text-ash">
                Untuk jasa, stok biasanya diisi besar (mis. 999) karena unlimited.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Keterangan</Label>
            <Input
              value={form.keterangan}
              onChange={(e) => setField("keterangan", e.target.value)}
              placeholder="Opsional"
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
              "Tambah Produk"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
