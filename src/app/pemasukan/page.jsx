"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export default function PemasukanPage() {
  const [search, setSearch] = useState("");
  const { incomes } = useSupabaseData();
  const sorted = useMemo(
    () => [...incomes].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [incomes]
  );
  const filtered = sorted.filter((i) =>
    !search.trim() || (i.keterangan || "").toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, i) => s + i.jumlah, 0);

  return (
    <div>
      <PageHeader
        title="Pemasukan"
        subtitle={`${sorted.length} entri · 12 bulan terakhir`}
      >
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-ash font-semibold">Total</p>
          <p className="text-lg font-bold text-primary">{formatRupiah(total)}</p>
        </div>
      </PageHeader>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
        <Input
          placeholder="Cari keterangan"¦"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState message="Belum ada pemasukan" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-ash">{formatDate(i.tanggal)}</TableCell>
                  <TableCell className="font-medium">{i.keterangan}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatRupiah(i.jumlah)}
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
