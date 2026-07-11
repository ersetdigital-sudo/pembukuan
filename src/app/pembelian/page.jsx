"use client";

import { useState, useMemo } from "react";
import { Search, Boxes, Wallet, ShoppingBag } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import StatCard from "@/components/dashboard/StatCard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatRupiah, formatDate, formatNumber } from "@/lib/utils/format";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export default function PembelianPage() {
  const [search, setSearch] = useState("");
  const { purchases } = useSupabaseData();
  const sorted = useMemo(
    () => [...purchases].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [purchases]
  );
  const filtered = sorted.filter((p) =>
    !search.trim() || (p.nama_produk || "").toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, p) => s + p.total, 0);
  const totalQty = filtered.reduce((s, p) => s + p.qty, 0);

  return (
    <div>
      <PageHeader
        title="Pembelian"
        subtitle={`${sorted.length} entri · restock & pembelian operasional`}
      />

      {/* Stat cards — samain style dengan dashboard */}
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

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: card list */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-sm bg-surface-card shadow-card overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-hairline/40 bg-surface/30">
                  <span className="text-[10px] font-mono text-ash whitespace-nowrap">
                    {formatDate(p.tanggal)}
                  </span>
                  <span className="text-[11px] font-semibold text-ash">×{formatNumber(p.qty)}</span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
                    Produk
                  </p>
                  <p className="text-sm font-bold text-ink mt-1 break-words">
                    {p.nama_produk}
                  </p>
                </div>
                <div className="grid grid-cols-2 border-t border-hairline/40 divide-x divide-hairline/40">
                  <div className="px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
                      Harga Satuan
                    </p>
                    <p className="text-xs font-semibold text-ink mt-1.5 truncate">
                      {formatRupiah(p.harga_satuan)}
                    </p>
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
                      Total
                    </p>
                    <p className="text-xs font-bold text-ink mt-1.5 truncate">
                      {formatRupiah(p.total)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
