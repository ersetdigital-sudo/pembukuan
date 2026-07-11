"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
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
  const totalNilai = stocks.reduce((s, x) => s + x.stok * x.harga_beli, 0);
  const totalJual = stocks.reduce((s, x) => s + x.stok * x.harga_jual, 0);
  const lowStock = stocks.filter((s) => s.stok > 0 && s.stok <= 5);
  const outOfStock = stocks.filter((s) => s.stok === 0);

  return (
    <div>
      <PageHeader
        title="Stok"
        subtitle={`${stocks.length} produk dalam katalog`}
      >
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-ash font-semibold">Nilai Stok</p>
          <p className="text-lg font-bold text-primary">{formatRupiah(totalNilai)}</p>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Total Produk" value={formatNumber(stocks.length)} />
        <Stat label="Stok Rendah (≤5)" value={formatNumber(lowStock.length)} color="text-warning" />
        <Stat label="Habis" value={formatNumber(outOfStock.length)} color="text-danger" />
        <Stat label="Potensi Jual" value={formatRupiah(totalJual)} color="text-primary" />
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <Card className="p-4 mb-4 border-warning/40 bg-warning/5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">
                {outOfStock.length + lowStock.length} produk butuh restock
              </p>
              <p className="text-xs text-ash mt-0.5">
                {outOfStock.length} habis · {lowStock.length} stok rendah
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
          <Input
            placeholder="Cari nama produk"¦"
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
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState message="Belum ada produk" />
        ) : (
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
                    <TableCell className="text-right font-bold text-primary">
                      {s.kategori === "Jasa" ? "-" : formatRupiah(s.stok * s.harga_beli)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, color = "text-ink" }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card p-3">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-ash">{label}</p>
      <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
