import React, { useState } from "react";
import {
  Card,
  Button,
  Table,
  Badge,
  Input,
  Select,
  Modal,
  PageHeader,
  MetricCard,
} from "../../components/ui/index.js";
import {
  Store,
  Plus,
  Search,
  Filter,
  AlertOctagon,
  TrendingDown,
  MapPin,
  Tag,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { MOCK_COMPETITORS, MOCK_ZONES } from "./mockData.js";

export default function CompetitorPage() {
  const [competitors, setCompetitors] = useState(MOCK_COMPETITORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [zoneFilter, setZoneFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    zoneName: "Alun-Alun Sidoarjo",
    type: "CHAIN_CAFE",
    priceRange: "Rp 15.000 - Rp 30.000",
    distanceMeters: 150,
    c6Score: 0.8,
    lat: -7.45,
    lng: 112.715,
  });

  const filteredCompetitors = competitors.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "ALL" || item.type === typeFilter;
    const matchZone = zoneFilter === "ALL" || item.zoneName === zoneFilter;
    return matchSearch && matchType && matchZone;
  });

  const handleOpenAdd = () => {
    setEditingComp(null);
    setFormData({
      name: "",
      brand: "",
      zoneName: "Alun-Alun Sidoarjo",
      type: "CHAIN_CAFE",
      priceRange: "Rp 15.000 - Rp 30.000",
      distanceMeters: 150,
      c6Score: 0.8,
      lat: -7.45,
      lng: 112.715,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingComp(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingComp) {
      setCompetitors((prev) =>
        prev.map((c) =>
          c.id === editingComp.id
            ? {
                ...c,
                ...formData,
                distanceMeters: Number(formData.distanceMeters),
                c6Score: Number(formData.c6Score),
              }
            : c
        )
      );
    } else {
      const newComp = {
        id: `COMP-00${competitors.length + 1}`,
        ...formData,
        distanceMeters: Number(formData.distanceMeters) || 100,
        c6Score: Number(formData.c6Score) || 0.75,
        status: "ACTIVE",
      };
      setCompetitors((prev) => [...prev, newComp]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Data Survei Kompetitor"
          subtitle="Pemetaan gerai kopi sejenis di sekitar zona operasional untuk kalkulasi penalti C6 (Kepadatan Kompetitor)."
        />
        <Button onClick={handleOpenAdd} className="flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4" /> Tambah Kompetitor
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Titik Kompetitor"
          value={competitors.length}
          icon={<Store className="w-5 h-5 text-rose-500" />}
          trend="Radius 300m dari rute"
          trendDirection="neutral"
        />
        <MetricCard
          title="Chain Coffee Brand"
          value={competitors.filter((c) => c.type === "CHAIN_CAFE").length}
          icon={<Tag className="w-5 h-5 text-brand-500" />}
          trend="Kenangan, Janji Jiwa, Tomoro"
          trendDirection="neutral"
        />
        <MetricCard
          title="Rata-rata Penalti C6"
          value={(
            competitors.reduce((acc, c) => acc + c.c6Score, 0) / (competitors.length || 1)
          ).toFixed(2)}
          icon={<AlertOctagon className="w-5 h-5 text-amber-500" />}
          trend="Skala Cost Kriteria"
          trendDirection="neutral"
        />
        <MetricCard
          title="Zona Paling Kompetitif"
          value="Alun-Alun Sidoarjo"
          icon={<MapPin className="w-5 h-5 text-indigo-500" />}
          trend="3 Titik Chain Cafe"
          trendDirection="neutral"
        />
      </div>

      {/* Filter Controls */}
      <Card className="p-4 bg-surface border-theme">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari nama gerai / brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
            >
              <option value="ALL">Semua Tipe Brand</option>
              <option value="CHAIN_CAFE">Chain Cafe (Franchise)</option>
              <option value="CONVENIENCE_STORE">Convenience Store (Point/Indomaret)</option>
              <option value="TRADITIONAL_WARKOP">Warkop Tradisional</option>
            </select>

            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
            >
              <option value="ALL">Semua Zona</option>
              {MOCK_ZONES.map((z) => (
                <option key={z.id} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden border-theme">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-subtle border-b border-theme text-text-secondary uppercase text-xs">
              <tr>
                <th className="px-6 py-3.5">ID & Nama Gerai</th>
                <th className="px-6 py-3.5">Brand / Jaringan</th>
                <th className="px-6 py-3.5">Tipe Outlet</th>
                <th className="px-6 py-3.5">Zona Terdekat</th>
                <th className="px-6 py-3.5">Kisaran Harga</th>
                <th className="px-6 py-3.5">Jarak ke Pos</th>
                <th className="px-6 py-3.5">Skor Penalti C6</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {filteredCompetitors.map((item) => (
                <tr key={item.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text-primary">{item.name}</div>
                    <div className="font-mono text-xs text-text-muted">{item.id}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {item.brand}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={item.type === "CHAIN_CAFE" ? "primary" : "outline"}>
                      {item.type.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-text-secondary">
                    {item.zoneName}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-text-muted">
                    {item.priceRange}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-text-primary">
                    {item.distanceMeters} m
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-500">{item.c6Score.toFixed(2)}</span>
                      <div className="w-16 bg-surface-subtle h-2 rounded-full overflow-hidden border border-theme">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${item.c6Score * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Data"
                      >
                        <Edit2 className="w-4 h-4 text-text-muted hover:text-brand-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4 text-text-muted hover:text-rose-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCompetitors.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-text-muted">
                    Tidak ada data kompetitor yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingComp ? "Edit Data Titik Kompetitor" : "Tambah Data Titik Kompetitor Baru"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Nama Gerai / Outlet
            </label>
            <Input
              required
              placeholder="Contoh: Kopi Kenangan Ruko Pahlawan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Brand / Jaringan
              </label>
              <Input
                required
                placeholder="Contoh: Kopi Kenangan"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Tipe Outlet
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
              >
                <option value="CHAIN_CAFE">Chain Cafe</option>
                <option value="CONVENIENCE_STORE">Convenience Store</option>
                <option value="TRADITIONAL_WARKOP">Warkop Tradisional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Zona Terdekat
              </label>
              <select
                value={formData.zoneName}
                onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
              >
                {MOCK_ZONES.map((z) => (
                  <option key={z.id} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Jarak ke Titik Rider (Meter)
              </label>
              <Input
                type="number"
                required
                value={formData.distanceMeters}
                onChange={(e) => setFormData({ ...formData, distanceMeters: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Estimasi Rentang Harga
              </label>
              <Input
                placeholder="Rp 15.000 - Rp 30.000"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Skor Penalti C6 (0.0 - 1.0)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                required
                value={formData.c6Score}
                onChange={(e) => setFormData({ ...formData, c6Score: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-theme">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingComp ? "Simpan Perubahan" : "Tambahkan Data"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
