"use client";

import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function ProfilPage() {
  return (
    <>
      <PageHeader title="Profil" subtitle="Kelola informasi akun Anda" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ash">Nama Lengkap</label>
              <p className="mt-1 text-base font-semibold">OOS SHOP</p>
            </div>
            <div>
              <label className="text-sm font-medium text-ash">Email</label>
              <p className="mt-1 text-base font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-ash" />
                shop@oosshop.com
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Informasi Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ash">Nomor Telepon</label>
              <p className="mt-1 text-base font-semibold">+62 812 3456 7890</p>
            </div>
            <div>
              <label className="text-sm font-medium text-ash">Alamat</label>
              <p className="mt-1 text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-ash" />
                Jakarta, Indonesia
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-xs text-ash mt-1">Total Transaksi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">42</p>
              <p className="text-xs text-ash mt-1">Produk Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">89</p>
              <p className="text-xs text-ash mt-1">Pelanggan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">12</p>
              <p className="text-xs text-ash mt-1">Hari Bergabung</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
