import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMockData } from "@/lib/data/mock";
import { getSaleTotals, getSaleProducts } from "@/lib/utils/sale";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { MP_BADGE } from "@/lib/constants";

export default function SaleDetailPage({ params }) {
  const { sales } = getMockData();
  const sale = sales.find((s) => s.id === params.id);
  if (!sale) notFound();

  const totals = getSaleTotals(sale);
  const produk = getSaleProducts(sale);

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <ButtonLink href="/penjualan" variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke daftar
        </ButtonLink>
      </div>

      <PageHeader
        title={`Detail Transaksi`}
        subtitle={sale.invoice}
      >
        <Badge className={MP_BADGE[sale.marketplace] || ""}>{sale.marketplace}</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="md:col-span-1 p-5">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted mb-3">Info Pembeli</h3>
          <Row label="Tanggal" value={formatDate(sale.tanggal)} />
          <Row label="Nama" value={sale.nama_pembeli} />
          <Row label="No HP" value={sale.no_hp || "-"} />
          <Row label="Domain" value={sale.username_domain || "-"} />
        </Card>
        <Card className="md:col-span-2 p-5">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted mb-3">Ringkasan Finansial</h3>
          <Row label="Total Penjualan" value={formatRupiah(totals.totalJual)} valueClass="text-primary font-bold" />
          <Row label="Total Modal" value={formatRupiah(totals.totalBeli)} />
          <Row label="Fee Marketplace" value={formatRupiah(totals.fee)} valueClass="text-secondary font-semibold" />
          <Row label="Profit Kotor" value={formatRupiah(totals.profit)} valueClass="text-success font-bold" />
          <Row label="Jumlah Item" value={`${totals.totalQty} unit`} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produk</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {produk.map((p, i) => (
              <li key={i} className="p-4 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold inline-flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{p.nama_produk}</p>
                    {p.kategori_produk && (
                      <Badge variant={p.kategori_produk === "Plugin" ? "primary" : "success"}>
                        {p.kategori_produk}
                      </Badge>
                    )}
                    {p.masa_aktif && (
                      <Badge variant="outline">{p.masa_aktif}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {p.qty} × {formatRupiah(p.harga_jual)} (modal {formatRupiah(p.harga_beli)})
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">{formatRupiah(p.harga_jual * p.qty)}</p>
                  <p className="text-xs text-success">
                    +{formatRupiah((p.harga_jual - p.harga_beli) * p.qty)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-sm font-medium text-right break-all ${valueClass}`}>{value}</span>
    </div>
  );
}
