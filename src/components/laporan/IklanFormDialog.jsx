"use client";

import { useState, useEffect } from "react";
import { Loader2, Megaphone } from "lucide-react";
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
import { KATEGORI } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils/format";

const defaultForm = {
  tanggal: new Date().toISOString().split("T")[0],
  kategori: "Plugin",
  keterangan: "",
  jumlah: 0,
};

/**
 * Dialog form khusus untuk input biaya iklan / promosi.
 *
 * Bedanya sama SaleFormDialog:
 *  - SaleFormDialog = transaksi penjualan (pendapatan)
 *  - IklanFormDialog = biaya promosi (pengurang profit, sebelum dibagi ke Andri/Asrud)
 *
 * Sub-kategori (Plugin / Jasa) menentukan bucket profit mana yang dikurangi.
 */
export default function IklanFormDialog({
  open,
  onOpenChange,
  onSave,
  editData,
  isSaving = false,
}) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editData) {
      setForm({
        tanggal: editData.tanggal || "",
        kategori: editData.kategori || "Plugin",
        keterangan: editData.keterangan || "",
        jumlah: editData.jumlah || 0,
      });
    } else {
      setForm({
        ...defaultForm,
        tanggal: new Date().toISOString().split("T")[0],
      });
    }
  }, [editData, open]);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      jumlah: Number(form.jumlah) || 0,
    });
  };

  const isValid = form.tanggal && form.kategori && Number(form.jumlah) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Megaphone className="h-4 w-4 text-plugin shrink-0" />
            <DialogTitle>
              {editData ? "Edit Biaya Iklan" : "Tambah Biaya Iklan"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
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
            <p className="text-[10px] text-muted leading-relaxed">
              Iklan <strong>Plugin</strong> mengurangi profit Plugin;{" "}
              <strong>Jasa</strong> mengurangi profit Jasa — dipotong sebelum
              dibagi Andri/Asrud/Modal.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Keterangan</Label>
            <Input
              value={form.keterangan}
              onChange={(e) => setField("keterangan", e.target.value)}
              placeholder="cth: Facebook Ads - campaign Juni"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Nominal (Rp) *</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={
                form.jumlah
                  ? formatRupiah(form.jumlah).replace(/^Rp\s?/, "")
                  : ""
              }
              onChange={(e) =>
                setField("jumlah", e.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="0"
              required
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
            variant="plugin"
            disabled={!isValid || isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Menyimpan...
              </>
            ) : editData ? (
              "Simpan"
            ) : (
              "Tambah"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
