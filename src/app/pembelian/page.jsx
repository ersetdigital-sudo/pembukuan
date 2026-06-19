"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
      >
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Total</p>
          <p className="font-display text-lg font-bold text-primary">{formatRupiah(total)}</p>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-card border border-border bg-surface-2 p-3">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted">Total QTY</p>
          <p className="font-display text-lg font-bold mt-1">{formatNumber(totalQty)}</p>
        </div>
        <div className="rounded-card border border-border bg-surface-2 p-3">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted">Total Belanja</p>
          <p className="font-display text-lg font-bold text-primary mt-1">{formatRupiah(total)}</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Cari nama produk…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState message="Belum ada pembelian" />
        ) : (
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
                  <TableCell className="text-muted">{formatDate(p.tanggal)}</TableCell>
                  <TableCell className="font-medium">{p.nama_produk}</TableCell>
                  <TableCell className="text-center">{p.qty}</TableCell>
                  <TableCell className="text-right">{formatRupiah(p.harga_satuan)}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatRupiah(p.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
