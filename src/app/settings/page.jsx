"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Store, PieChart } from "lucide-react";
import { toast as gooeyToast } from "gooey-toast";
import { useSettings } from "@/hooks/useSettings";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const {
    marketplaces,
    profitSharing,
    loading,
    saving,
    saveMarketplaces,
    saveProfitSharing,
  } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-body-sm text-ash">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        subtitle="Konfigurasi marketplace dan pembagian profit"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketplaceSection
          marketplaces={marketplaces}
          onSave={saveMarketplaces}
          saving={saving}
        />
        <ProfitSharingSection
          profitSharing={profitSharing}
          onSave={saveProfitSharing}
          saving={saving}
        />
      </div>
    </div>
  );
}

// ---- Marketplace Section ----
function MarketplaceSection({ marketplaces, onSave, saving }) {
  const [list, setList] = useState(marketplaces);
  const [newMp, setNewMp] = useState("");

  const addMarketplace = () => {
    const name = newMp.trim();
    if (!name) return;
    if (list.some((m) => m.toLowerCase() === name.toLowerCase())) {
      gooeyToast.error({ title: "Marketplace sudah ada" });
      return;
    }
    setList([...list, name]);
    setNewMp("");
  };

  const removeMarketplace = (idx) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    await onSave(list);
    gooeyToast.success({ title: "Marketplace berhasil disimpan" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-ash" />
          <CardTitle>Marketplace</CardTitle>
        </div>
        <p className="text-[12px] text-ash mt-1">
          Daftar marketplace yang tersedia saat input transaksi
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new */}
        <div className="flex gap-2">
          <Input
            placeholder="Nama marketplace baru..."
            value={newMp}
            onChange={(e) => setNewMp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMarketplace()}
            className="flex-1"
          />
          <Button variant="primary" size="sm" onClick={addMarketplace}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* List */}
        <ul className="space-y-1.5">
          {list.map((mp, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm bg-secondary/50 group"
            >
              <span className="text-body-sm font-medium text-ink">{mp}</span>
              <button
                type="button"
                onClick={() => removeMarketplace(idx)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-full text-ash hover:text-danger hover:bg-danger/10 transition-all"
                aria-label={`Hapus ${mp}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>

        {list.length === 0 && (
          <p className="text-body-sm text-stone text-center py-4">
            Belum ada marketplace
          </p>
        )}

        {/* Save button */}
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          <Save className="h-4 w-4" />
          Simpan Marketplace
        </Button>
      </CardContent>
    </Card>
  );
}

// ---- Profit Sharing Section ----
function ProfitSharingSection({ profitSharing, onSave, saving }) {
  const [config, setConfig] = useState(profitSharing);

  const updatePartner = (kategori, idx, field, value) => {
    setConfig((prev) => {
      const updated = { ...prev };
      updated[kategori] = { ...updated[kategori] };
      updated[kategori].partners = [...updated[kategori].partners];
      updated[kategori].partners[idx] = {
        ...updated[kategori].partners[idx],
        [field]: field === "percentage" ? Number(value) || 0 : value,
      };
      return updated;
    });
  };

  const addPartner = (kategori) => {
    setConfig((prev) => {
      const updated = { ...prev };
      updated[kategori] = { ...updated[kategori] };
      updated[kategori].partners = [
        ...updated[kategori].partners,
        { name: "", initials: "", percentage: 0 },
      ];
      return updated;
    });
  };

  const removePartner = (kategori, idx) => {
    setConfig((prev) => {
      const updated = { ...prev };
      updated[kategori] = { ...updated[kategori] };
      updated[kategori].partners = updated[kategori].partners.filter(
        (_, i) => i !== idx
      );
      return updated;
    });
  };

  const getTotal = (kategori) => {
    return (config[kategori]?.partners || []).reduce(
      (sum, p) => sum + (p.percentage || 0),
      0
    );
  };

  const handleSave = async () => {
    // Validate totals = 100%
    const pluginTotal = getTotal("plugin");
    const jasaTotal = getTotal("jasa");

    if (pluginTotal !== 100) {
      gooeyToast.error({
        title: `Plugin total ${pluginTotal}% - harus 100%`,
      });
      return;
    }
    if (jasaTotal !== 100) {
      gooeyToast.error({
        title: `Jasa total ${jasaTotal}% - harus 100%`,
      });
      return;
    }

    await onSave(config);
    gooeyToast.success({ title: "Pembagian profit berhasil disimpan" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-ash" />
          <CardTitle>Pembagian Profit</CardTitle>
        </div>
        <p className="text-[12px] text-ash mt-1">
          Atur persentase pembagian per kategori (total harus 100%)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plugin */}
        <KategoriBlock
          label="Plugin"
          partners={config.plugin?.partners || []}
          total={getTotal("plugin")}
          onUpdate={(idx, field, val) => updatePartner("plugin", idx, field, val)}
          onAdd={() => addPartner("plugin")}
          onRemove={(idx) => removePartner("plugin", idx)}
        />

        <div className="h-px bg-divider" />

        {/* Jasa */}
        <KategoriBlock
          label="Jasa"
          partners={config.jasa?.partners || []}
          total={getTotal("jasa")}
          onUpdate={(idx, field, val) => updatePartner("jasa", idx, field, val)}
          onAdd={() => addPartner("jasa")}
          onRemove={(idx) => removePartner("jasa", idx)}
        />

        {/* Save button */}
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          <Save className="h-4 w-4" />
          Simpan Pembagian Profit
        </Button>
      </CardContent>
    </Card>
  );
}

function KategoriBlock({ label, partners, total, onUpdate, onAdd, onRemove }) {
  const isValid = total === 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-body-sm font-bold text-ink">Kategori {label}</h4>
        <span
          className={`text-[12px] font-bold tabular-nums ${
            isValid ? "text-success" : "text-danger"
          }`}
        >
          Total: {total}%
        </span>
      </div>

      <div className="space-y-2">
        {partners.map((p, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              placeholder="Nama"
              value={p.name}
              onChange={(e) => onUpdate(idx, "name", e.target.value)}
              className="flex-1 min-w-0"
            />
            <Input
              placeholder="Init"
              value={p.initials}
              onChange={(e) => onUpdate(idx, "initials", e.target.value)}
              className="w-14 text-center"
            />
            <div className="relative w-20">
              <Input
                type="number"
                min="0"
                max="100"
                value={p.percentage}
                onChange={(e) => onUpdate(idx, "percentage", e.target.value)}
                className="pr-6 text-right"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-ash pointer-events-none">
                %
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="p-1.5 rounded-full text-ash hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
              aria-label="Hapus partner"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-ash hover:text-ink transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Tambah partner
      </button>
    </div>
  );
}
