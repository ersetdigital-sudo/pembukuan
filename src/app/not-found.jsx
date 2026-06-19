import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="font-display text-2xl font-bold mt-4">Halaman tidak ditemukan</h1>
      <p className="text-sm text-muted mt-2">Halaman yang Anda cari tidak ada.</p>
      <div className="mt-6">
        <ButtonLink href="/">← Kembali ke Dashboard</ButtonLink>
      </div>
    </div>
  );
}
