"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle, Boxes, TriangleAlert, PackageX, Wallet } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatRupiah, formatNumber } from "@/lib/utils/format";
import { KATEGORI } from "@/lib/constants";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export default function StokPage() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");
  const { stocks } = useSupabaseData();
  const sorted = useMemo(
    () => [...stocks].sort((a, b) => a.nama_produk.localeCompare(b.nama_produk)),
    [stocks]
  );
  const filtered = sorted.filter((s) => {
    if (kategori !== "all" && s.kategori !== kategori) return false;
    if (!search.trim()) return true;
    return (s.nama_produk || "").toLowerCase().includes(search.toLowerCase());
  });
  const totalJual = stocks.reduce((s, x) => s + x.stok * x.harga_jual, 0);
  const lowStock = stocks.filter((s) => s.stok > 0 && s.stok <= 5);
  const outOfStock = stocks.filter((s) => s.stok === 0);

  return (
    <div>
      <PageHeader
        title="Stok"
        subtitle={`${stocks.length} produk dalam katalog`}
      />

      {/* Stat cards — samain style dengan dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
        <StatCard
          title="Total Produk"
          value={formatNumber(stocks.length)}
          icon={Boxes}
          color="primary"
        />
        <StatCard
          title="Stok Rendah (≤5)"
          value={formatNumber(lowStock.length)}
          icon={TriangleAlert}
          color="warning"
          valueClass="text-warning"
        />
        <StatCard
          title="Habis"
          value={formatNumber(outOfStock.length)}
          icon={PackageX}
          color="danger"
          valueClass="text-danger"
        />
        <StatCard
          title="Potensi Jual"
          value={formatRupiah(totalJual)}
          icon={Wallet}
          color="emerald"
          valueClass="text-success"
        />
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="rounded-sm bg-warning/10 p-4 mb-4 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-ink">
              {outOfStock.length + lowStock.length} produk butuh restock
            </p>
            <p className="text-xs text-ash mt-0.5">
              {outOfStock.length} habis · {lowStock.length} stok rendah
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
          <Input
            placeholder="Cari nama produk..."
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
          {KATEGORI.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Belum ada produk" />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block rounded-sm bg-surface-card shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-right">Modal</TableHead>
                  <TableHead className="text-right">Jual</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const isLow = s.stok > 0 && s.stok <= 5;
                  const isOut = s.stok === 0;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nama_produk}</TableCell>
                      <TableCell>
                        <Badge variant={s.kategori === "Plugin" ? "primary" : "success"}>
                          {s.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isOut ? "danger" : isLow ? "warning" : "outline"}>
                          {s.kategori === "Jasa" ? "∞" : s.stok}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-ash">
                        {formatRupiah(s.harga_beli)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatRupiah(s.harga_jual)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-ink">
                        {s.kategori === "Jasa" ? "-" : formatRupiah(s.stok * s.harga_beli)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: card list */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((s) => {
              const isLow = s.stok > 0 && s.stok <= 5;
              const isOut = s.stok === 0;
              return (
                <div key={s.id} className="rounded-sm bg-surface-card shadow-card overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-hairline/40 bg-surface/30">
                    <Badge variant={s.kategori === "Plugin" ? "primary" : "success"}>
                      {s.kategori}
                    </Badge>
                    <Badge variant={isOut ? "danger" : isLow ? "warning" : "outline"}>
                      {s.kategori === "Jasa" ? "∞ stok" : `${formatNumber(s.stok)} stok`}
                    </Badge>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
                      Produk
                    </p>
                    <p className="text-sm font-bold text-ink mt-1 break-words">
                      {s.nama_produk}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 border-t border-hairline/40 divide-x divide-hairline/40">
                    <div className="px-2.5 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
                        Modal
                      </p>
                      <p className="text-xs font-semibold text-ink mt-1.5 truncate">
                        {formatRupiah(s.harga_beli)}
                      </p>
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
                        Jual
                      </p>
                      <p className="text-xs font-semibold text-ink mt-1.5 truncate">
                        {formatRupiah(s.harga_jual)}
                      </p>
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
                        Nilai
                      </p>
                      <p className="text-xs font-bold text-ink mt-1.5 truncate">
                        {s.kategori === "Jasa" ? "-" : formatRupiah(s.stok * s.harga_beli)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
