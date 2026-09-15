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
  Tabs,
} from "../../components/ui/index.js";
import {
  MapPin,
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Sliders,
  Filter,
  Search,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
} from "lucide-react";
import { MOCK_POIS, MOCK_POI_CATEGORIES, MOCK_ZONES } from "./mockData.js";

export default function PoiModerationPage() {
  const [pois, setPois] = useState(MOCK_POIS);
  const [categories, setCategories] = useState(MOCK_POI_CATEGORIES);
  const [activeTab, setActiveTab] = useState("moderation"); // 'moderation' | 'categories'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [zoneFilter, setZoneFilter] = useState("ALL");

  // Sync Modal State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Add POI Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPoi, setNewPoi] = useState({
    name: "",
    category: "Perkantoran",
    zoneName: "Alun-Alun Sidoarjo",
    lat: -7.45,
    lng: 112.715,
  });

  const filteredPois = pois.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchZone = zoneFilter === "ALL" || item.zoneName === zoneFilter;
    return matchSearch && matchStatus && matchZone;
  });

  const handleApprove = (id) => {
    setPois((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "APPROVED" } : p))
    );
  };

  const handleReject = (id) => {
    setPois((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "REJECTED" } : p))
    );
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      // Simulate added POIs
      const syncedPoi = {
        id: `POI-00${pois.length + 1}`,
        name: "Plaza Sidoarjo (OSM Synced)",
        category: "Pusat Perbelanjaan",
        zoneName: "Alun-Alun Sidoarjo",
        status: "APPROVED",
        lat: -7.452,
        lng: 112.716,
      };
      setPois((prev) => [syncedPoi, ...prev]);
    }, 1200);
  };

  const handleAddPoi = (e) => {
    e.preventDefault();
    const created = {
      id: `POI-00${pois.length + 1}`,
      ...newPoi,
      lat: Number(newPoi.lat),
      lng: Number(newPoi.lng),
      status: "APPROVED",
    };
    setPois((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
  };

  const pendingCount = pois.filter((p) => p.status === "PENDING").length;
  const approvedCount = pois.filter((p) => p.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Moderasi POI & Matriks Keramaian"
          subtitle="Manajemen basis data Point of Interest (POI), ingest OpenStreetMap Overpass, dan pembobotan crowd score C3."
        />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSyncSuccess(false);
              setIsSyncModalOpen(true);
            }}
            className="flex items-center gap-2 border-theme shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-brand-500" /> Sync Overpass OSM
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 shadow-md">
            <Plus className="w-4 h-4" /> Tambah POI
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total POI Terdaftar"
          value={pois.length}
          icon={<MapPin className="w-5 h-5 text-brand-500" />}
          trend="+14 pekan ini"
          trendDirection="up"
        />
        <MetricCard
          title="Disetujui (Approved)"
          value={approvedCount}
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
          trend="Aktif di kalkulasi DSS"
          trendDirection="up"
        />
        <MetricCard
          title="Menunggu Moderasi"
          value={pendingCount}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          trend={pendingCount > 0 ? "Perlu review admin" : "Semua beres"}
          trendDirection={pendingCount > 0 ? "down" : "neutral"}
        />
        <MetricCard
          title="Kategori Tipologi"
          value={categories.length}
          icon={<Layers className="w-5 h-5 text-indigo-500" />}
          trend="Matriks Waktu C3"
          trendDirection="neutral"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-theme pb-2">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "moderation"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          Daftar POI & Moderasi ({pois.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "categories"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          Matriks Bobot Keramaian C3 ({categories.length})
        </button>
      </div>

      {/* TAB 1: MODERATION & POI LIST */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-4 bg-surface border-theme">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Cari nama titik POI / ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="APPROVED">Disetujui (Approved)</option>
                  <option value="PENDING">Menunggu (Pending)</option>
                  <option value="REJECTED">Ditolak (Rejected)</option>
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
                    <th className="px-6 py-3.5">ID POI</th>
                    <th className="px-6 py-3.5">Nama Fasilitas / Tempat</th>
                    <th className="px-6 py-3.5">Kategori</th>
                    <th className="px-6 py-3.5">Zona Operasional</th>
                    <th className="px-6 py-3.5">Koordinat (Lat, Lng)</th>
                    <th className="px-6 py-3.5">Status Moderasi</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {filteredPois.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-text-primary">{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary">{item.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-text-secondary">
                        {item.zoneName}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-text-muted">
                        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : item.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-500 animate-pulse"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "APPROVED"
                                ? "bg-emerald-500"
                                : item.status === "PENDING"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(item.id)}
                                className="text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30"
                              >
                                Setujui
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(item.id)}
                                className="text-rose-500 hover:bg-rose-500/10"
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          {item.status === "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(item.id)}
                              title="Tangguhkan / Tolak"
                            >
                              <XCircle className="w-4 h-4 text-text-muted hover:text-rose-500" />
                            </Button>
                          )}
                          {item.status === "REJECTED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(item.id)}
                              title="Pulihkan / Setujui"
                            >
                              <CheckCircle className="w-4 h-4 text-text-muted hover:text-emerald-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPois.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-text-muted">
                        Tidak ada POI yang memenuhi kriteria pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: C3 CROWD SCORE CATEGORY MATRIX */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <Card className="p-4 bg-brand-500/5 border border-brand-500/20 text-text-secondary text-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary">Matriks Kriteria C3 (Time-Based Crowd):</span>{" "}
                Skor dasar di bawah ini digunakan oleh algoritma TOPSIS untuk menghitung intensitas crowd score pada rentang jam sibuk di tiap zona.
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="p-5 border-theme flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className="font-mono text-xs">{cat.code}</Badge>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-bold text-xs">
                      Skor: {cat.baseScore}/100
                    </div>
                  </div>
                  <h4 className="font-bold text-text-primary text-base mb-1">{cat.name}</h4>
                  <p className="text-xs text-text-muted mb-3">{cat.description}</p>
                </div>

                <div className="pt-3 border-t border-theme">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-500" /> Jam Puncak:
                    </span>
                    <span className="font-semibold text-text-primary">{cat.peakHour}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* OSM Overpass Sync Modal */}
      <Modal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        title="Sinkronisasi Data OpenStreetMap (Overpass API)"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Sistem akan mengirim query Overpass API untuk menarik titik POI terdaftar di wilayah Kabupaten Sidoarjo (radius 5km dari Hub Pusat) meliputi fasilitas umum, sekolah, perkantoran, dan komersial.
          </p>

          <div className="p-3.5 rounded-lg bg-surface-subtle border border-theme text-xs space-y-1 font-mono text-text-muted">
            <div>Target Endpoint: [overpass-api.de/api/interpreter]</div>
            <div>Bounding Box: [-7.55, 112.60, -7.35, 112.80]</div>
            <div>Query Tag: amenity, leisure, shop, office</div>
          </div>

          {syncSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Berhasil melakukan sinkronisasi! 14 data POI baru telah masuk antrean moderasi.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-theme">
            <Button variant="ghost" onClick={() => setIsSyncModalOpen(false)}>
              Tutup
            </Button>
            <Button
              variant="primary"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Menghubungi Overpass..." : "Mulai Sinkronisasi"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add POI Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Titik POI Baru"
      >
        <form onSubmit={handleAddPoi} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Nama Titik / Fasilitas
            </label>
            <Input
              required
              placeholder="Contoh: Kantor Pelayanan Pajak Pratama"
              value={newPoi.name}
              onChange={(e) => setNewPoi({ ...newPoi, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Kategori
              </label>
              <select
                value={newPoi.category}
                onChange={(e) => setNewPoi({ ...newPoi, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Zona Operasional
              </label>
              <select
                value={newPoi.zoneName}
                onChange={(e) => setNewPoi({ ...newPoi, zoneName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
              >
                {MOCK_ZONES.map((z) => (
                  <option key={z.id} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Latitude
              </label>
              <Input
                type="number"
                step="0.0001"
                required
                value={newPoi.lat}
                onChange={(e) => setNewPoi({ ...newPoi, lat: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Longitude
              </label>
              <Input
                type="number"
                step="0.0001"
                required
                value={newPoi.lng}
                onChange={(e) => setNewPoi({ ...newPoi, lng: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-theme">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan POI
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
