"use client";

import {
  Calendar,
  User,
  Phone,
  Globe,
  Store,
  Hash,
  Clock,
  Package,
  TrendingUp,
  DollarSign,
  Wallet,
  Tag,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  Receipt,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MP_BADGE } from "@/lib/constants";
import { formatRupiah, formatDate } from "@/lib/utils/format";

// â"€â"€ Helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function getSaleTotals(s) {
  if (s.produk && s.produk.length > 0) {
    const totalJual = s.produk.reduce(
      (sum, p) => sum + (p.harga_jual || 0) * (p.qty || 0),
      0
    );
    const totalBeli = s.produk.reduce(
      (sum, p) => sum + (p.harga_beli || 0) * (p.qty || 0),
      0
    );
    const fee = s.fee_mp || 0;
    return { totalJual, totalBeli, fee, profit: totalJual - totalBeli - fee };
  }
  const totalJual = (s.harga_jual || 0) * (s.qty || 0);
  const totalBeli = (s.harga_beli || 0) * (s.qty || 0);
  const fee = s.fee_mp || 0;
  return { totalJual, totalBeli, fee, profit: totalJual - totalBeli - fee };
}

function InfoRow({ icon: Icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-hairline/60 last:border-0">
      <div className="flex items-center gap-2 shrink-0">
        {Icon && <Icon className="h-3.5 w-3.5 text-ash" />}
        <span className="text-xs text-ash">{label}</span>
      </div>
      <div
        className={`text-xs font-semibold text-right text-ink min-w-0 truncate ${valueClass}`}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 pb-1">
      {Icon && <Icon className="h-3.5 w-3.5 text-ash" />}
      <p className="text-[10px] font-bold text-ash uppercase tracking-wider">
        {children}
      </p>
    </div>
  );
}

// â"€â"€ Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export default function SaleDetailModal({
  sale,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}) {
  if (!sale) return null;

  const { totalJual, totalBeli, fee, profit } = getSaleTotals(sale);
  const produkList =
    sale.produk && sale.produk.length > 0
      ? sale.produk
      : [
          {
            nama_produk: sale.nama_produk,
            kategori_produk: sale.kategori_produk,
            qty: sale.qty,
            harga_jual: sale.harga_jual,
            harga_beli: sale.harga_beli,
            masa_aktif: sale.masa_aktif,
          },
        ];

  const margin = totalJual > 0 ? (profit / totalJual) * 100 : 0;
  const profitPositive = profit >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <div className="min-w-0 flex-1">
            <DialogTitle>Detail Transaksi</DialogTitle>
            {sale.invoice && (
              <p className="text-[10px] font-mono text-ash mt-0.5 truncate">
                {sale.invoice}
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Hero profit card "" gradient */}
          <div
            className={`relative overflow-hidden rounded-xl p-4  ${
              profitPositive
                ? "bg-gradient-to-br from-success to-success/85"
                : "bg-gradient-to-br from-danger to-danger/85"
            } text-white`}
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <p className="text-[10px] uppercase tracking-wider font-bold opacity-90">
                    Profit Bersih
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold leading-tight">
                  {formatRupiah(profit)}
                </p>
                <p className="text-[10px] opacity-80 mt-1">
                  Margin{" "}
                  <span className="font-bold">
                    {margin.toFixed(1).replace(".", ",")}%
                  </span>{" "}
                  dari total penjualan
                </p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Quick stats "" 2 col grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-hairline bg-surface-card p-3">
              <div className="flex items-center gap-1.5 text-ash">
                <DollarSign className="h-3 w-3" />
                <p className="text-[10px] uppercase tracking-wider font-semibold">Penjualan</p>
              </div>
              <p className="text-sm font-bold text-ink mt-1">
                {formatRupiah(totalJual)}
              </p>
            </div>
            <div className="rounded-xl border border-hairline bg-surface-card p-3">
              <div className="flex items-center gap-1.5 text-ash">
                <Wallet className="h-3 w-3" />
                <p className="text-[10px] uppercase tracking-wider font-semibold">Modal</p>
              </div>
              <p className="text-sm font-bold text-ink mt-1">
                {formatRupiah(totalBeli)}
              </p>
            </div>
          </div>

          {/* Info pembeli */}
          <div className="rounded-xl border border-hairline bg-surface-card px-4 py-1">
            <div className="pt-2">
              <SectionTitle icon={User}>Info Pembeli</SectionTitle>
            </div>
            <InfoRow icon={Calendar} label="Tanggal" value={formatDate(sale.tanggal)} />
            <InfoRow
              icon={User}
              label="Nama"
              value={sale.nama_pembeli}
              valueClass="text-primary"
            />
            <InfoRow icon={Phone} label="No HP" value={sale.no_hp} />
            <InfoRow icon={Globe} label="Username/Domain" value={sale.username_domain} />
            <InfoRow
              icon={Store}
              label="Marketplace"
              value={
                sale.marketplace ? (
                  <Badge className={MP_BADGE[sale.marketplace] || ""}>
                    {sale.marketplace}
                  </Badge>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              icon={Hash}
              label="Invoice"
              value={sale.invoice}
              valueClass="font-mono"
            />
            <InfoRow icon={Clock} label="Masa Aktif" value={sale.masa_aktif} />
          </div>

          {/* Produk */}
          <div>
            <SectionTitle icon={Package}>
              Produk ({produkList.length})
            </SectionTitle>
            <div className="space-y-2 mt-1">
              {produkList.map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-hairline bg-surface-card overflow-hidden hover: transition-shadow"
                >
                  <div className="px-4 py-2 bg-surface/60 border-b border-hairline/60 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-primary truncate min-w-0">
                      {produkList.length > 1
                        ? `Produk ${i + 1}`
                        : p.nama_produk || "-"}
                    </p>
                    {p.kategori_produk && (
                      <Badge className="bg-info/10 text-info border border-info/30">
                        {p.kategori_produk}
                      </Badge>
                    )}
                  </div>
                  <div className="px-4 py-1">
                    {produkList.length > 1 && (
                      <InfoRow
                        icon={Receipt}
                        label="Nama"
                        value={p.nama_produk}
                        valueClass="text-ink"
                      />
                    )}
                    {p.masa_aktif && (
                      <InfoRow icon={Clock} label="Masa Aktif" value={p.masa_aktif} />
                    )}
                    <InfoRow
                      icon={Hash}
                      label="QTY"
                      value={p.qty}
                      valueClass="text-ink font-bold"
                    />
                    <InfoRow
                      icon={Tag}
                      label="Harga Jual"
                      value={formatRupiah(p.harga_jual)}
                      valueClass="text-ink"
                    />
                    <InfoRow
                      icon={Wallet}
                      label="Harga Beli (Modal)"
                      value={formatRupiah(p.harga_beli)}
                    />
                    <InfoRow
                      icon={CheckCircle2}
                      label="Subtotal Jual"
                      value={formatRupiah(
                        (p.harga_jual || 0) * (p.qty || 0)
                      )}
                      valueClass="text-ink font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ringkasan finansial */}
          <div className="rounded-xl border border-hairline bg-surface-card px-4 py-1">
            <div className="pt-2">
              <SectionTitle icon={TrendingUp}>Ringkasan Finansial</SectionTitle>
            </div>
            <InfoRow
              icon={DollarSign}
              label="Total Penjualan"
              value={formatRupiah(totalJual)}
              valueClass="text-ink font-bold"
            />
            <InfoRow
              icon={Wallet}
              label="Total Modal"
              value={formatRupiah(totalBeli)}
            />
            <InfoRow
              icon={Tag}
              label="Fee MP"
              value={formatRupiah(fee)}
              valueClass="text-info font-bold"
            />
            <InfoRow
              icon={TrendingUp}
              label="Profit"
              value={formatRupiah(profit)}
              valueClass={
                profitPositive
                  ? "text-success font-bold"
                  : "text-danger font-bold"
              }
            />
          </div>
        </div>

        {/* Footer actions "" Edit & Hapus berfungsi */}
        <DialogFooter>
          {onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                // Parent (PenjualanClient) yang handle confirm dialog
                onDelete(sale);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Hapus
            </Button>
          )}
          {onEdit && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onEdit(sale);
                onOpenChange(false);
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
