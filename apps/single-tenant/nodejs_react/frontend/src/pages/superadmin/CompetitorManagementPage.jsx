import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { Table, TableContainer } from "../../components/ui/Table.jsx";
import { competitorService } from "../../services/competitorService.js";
import { zoneService } from "../../services/zoneService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Users,
  Building2,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Compass,
  DollarSign,
  TrendingDown,
  Navigation,
  ShieldCheck,
  X,
  Info,
} from "lucide-react";

export function CompetitorManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperadminOrSupervisor = user?.role === "SUPERADMIN" || user?.role === "SUPERVISOR";

  // State Management
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "CHAIN_COFFEE",
    price_level: "MEDIUM",
    latitude: "",
    longitude: "",
  });

  // 1. Authoritative Master Zones Query
  const { data: zonesRes, isLoading: isLoadingZones } = useQuery({
    queryKey: queryKeys.zones.list(),
    queryFn: () => zoneService.getZones(),
  });

  const zones = useMemo(() => {
    return Array.isArray(zonesRes) ? zonesRes : zonesRes?.zones || zonesRes?.data || [];
  }, [zonesRes]);

  // Set initial selected zone once loaded
  React.useEffect(() => {
    if (zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones, selectedZoneId]);

  const activeZone = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId) || null;
  }, [zones, selectedZoneId]);

  // 2. Authoritative Competitors per Zone Query
  const {
    data: competitorsRes,
    isLoading: isLoadingCompetitors,
    refetch: refetchCompetitors,
  } = useQuery({
    queryKey: queryKeys.competitors.byZone(selectedZoneId),
    queryFn: () => competitorService.getCompetitorsByZone(selectedZoneId),
    enabled: !!selectedZoneId,
  });

  const competitors = useMemo(() => {
    return competitorsRes?.competitors || [];
  }, [competitorsRes]);

  // 3. Authoritative C6 Score Query
  const { data: c6ScoreRes, isLoading: isLoadingC6 } = useQuery({
    queryKey: queryKeys.competitors.score(selectedZoneId),
    queryFn: () => competitorService.getC6Score(selectedZoneId),
    enabled: !!selectedZoneId,
  });

  const c6Score = c6ScoreRes?.skor_c6 ?? 0;

  // Filtered Competitors
  const filteredCompetitors = useMemo(() => {
    return competitors.filter((c) => {
      return (
        searchQuery === "" ||
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [competitors, searchQuery]);

  // 4. Create Competitor Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return await competitorService.createCompetitor(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors.byZone(selectedZoneId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors.score(selectedZoneId) });
      setModalOpen(false);
      setFormError(null);
      setActionAlert({
        type: "success",
        msg: data?.msg || "Data survei kompetitor berhasil ditambahkan.",
      });
    },
    onError: (err) => {
      setFormError(err?.response?.data?.msg || "Gagal menyimpan data kompetitor.");
    },
  });

  // 5. Delete Competitor Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await competitorService.deleteCompetitor(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors.byZone(selectedZoneId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors.score(selectedZoneId) });
      setActionAlert({
        type: "success",
        msg: data?.msg || "Data kompetitor berhasil dihapus.",
      });
    },
    onError: (err) => {
      setActionAlert({
        type: "error",
        msg: err?.response?.data?.msg || "Gagal menghapus data kompetitor.",
      });
    },
  });

  // Form Handlers
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      category: "CHAIN_COFFEE",
      price_level: "MEDIUM",
      latitude: activeZone?.latitude || "-7.4478",
      longitude: activeZone?.longitude || "112.7183",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Nama kompetitor wajib diisi.");
      return;
    }
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      setFormError("Koordinat latitude dan longitude harus berupa angka valid.");
      return;
    }

    createMutation.mutate({
      zone_id: selectedZoneId,
      name: formData.name.trim(),
      category: formData.category,
      price_level: formData.price_level,
      latitude: lat,
      longitude: lon,
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#FAFAFA] text-[#171717] font-sans">
        {/* Workspace Header */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                  SPATIAL INTELLIGENCE
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                  CRITERIA C6: COMPETITORS
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#171717] mt-1 tracking-tight">
                Competitor Intelligence & Field Survey Workspace
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Survei persebaran kompetitor kopi fisik di dalam zona penjualan untuk pembobotan kriteria C6 (Competitor Density Penalty) pada DSS TOPSIS.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchCompetitors()}
                className="h-8.5 px-3 border-[#E5E5E5] bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-md shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                Refresh
              </Button>

              {isSuperadminOrSupervisor && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreate}
                  disabled={!selectedZoneId}
                  className="h-8.5 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-md shadow-2xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Tambah Survei Lapangan
                </Button>
              )}
            </div>
          </div>

          {/* Action Alert Banner */}
          {actionAlert && (
            <div className="mt-3">
              <Alert
                variant={actionAlert.type === "success" ? "success" : "danger"}
                title={actionAlert.type === "success" ? "Operasi Berhasil" : "Operasi Gagal"}
                onClose={() => setActionAlert(null)}
              >
                {actionAlert.msg}
              </Alert>
            </div>
          )}

          {/* Zone Selector & C6 KPI Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-100 items-center">
            {/* Zone Dropdown */}
            <div className="md:col-span-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase">
                  Pilih Zona Operasional
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-2 py-1 text-xs font-medium text-neutral-900 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code || "ZONE"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total Competitors Count */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Survei Kompetitor
                </div>
                <div className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {isLoadingCompetitors ? "..." : competitors.length}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Building2 className="w-4 h-4" />
              </div>
            </div>

            {/* Live Backend C6 Score */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Skor Densitas C6 (Backend)
                </div>
                <div className="text-lg font-bold text-neutral-900 font-mono mt-0.5">
                  {isLoadingC6 ? "..." : c6Score.toFixed(3)}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Compass className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-3 rounded-md border border-[#E5E5E5] shadow-2xs flex items-center justify-between gap-3">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari nama atau kategori kompetitor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div className="text-xs text-neutral-500 font-medium">
              Menampilkan <strong className="text-neutral-900">{filteredCompetitors.length}</strong> kompetitor pada zona ini
            </div>
          </div>

          {/* Competitors Table */}
          <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs overflow-hidden">
            <TableContainer>
              <Table>
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                    <th className="py-2.5 px-3.5 w-12 text-center">#</th>
                    <th className="py-2.5 px-3.5">Nama Kompetitor Lapangan</th>
                    <th className="py-2.5 px-3.5">Kategori Kedai</th>
                    <th className="py-2.5 px-3.5 text-center">Level Harga</th>
                    <th className="py-2.5 px-3.5">Koordinat (Lat, Lon)</th>
                    <th className="py-2.5 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-xs">
                  {isLoadingCompetitors ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                          <span>Memuat data kompetitor lapangan...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCompetitors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Building2 className="w-6 h-6 text-neutral-300" />
                          <span className="font-semibold text-neutral-700">Belum Ada Kompetitor Terdaftar di Zona Ini</span>
                          <span className="text-[11px] text-neutral-400">Klik "Tambah Survei Lapangan" untuk mencatat outlet kopi kompetitor baru.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCompetitors.map((c, idx) => (
                      <tr key={c.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3.5 text-center text-neutral-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-neutral-900">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {c.category || "CHAIN_COFFEE"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              c.price_level === "HIGH"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : c.price_level === "MEDIUM"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {c.price_level || "MEDIUM"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[11px] text-neutral-500">
                          {c.latitude?.toFixed(5) || "N/A"}, {c.longitude?.toFixed(5) || "N/A"}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          {isSuperadminOrSupervisor && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus data survei kompetitor "${c.name}"?`)) {
                                  deleteMutation.mutate(c.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="p-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded shadow-2xs transition-colors"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </div>
        </div>

        {/* Add Competitor Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-bold text-sm text-[#171717]">
                    Tambah Data Survei Kompetitor
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <Alert variant="danger" title="Validasi Gagal">
                  {formError}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Zona Operasional
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeZone?.name || selectedZoneId}
                    className="w-full px-3 py-2 text-xs bg-neutral-100 border border-[#E5E5E5] rounded-md text-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nama Kedai / Outlet Kompetitor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Kopi Kenangan Alun-alun"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Kategori Kompetitor
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="CHAIN_COFFEE">CHAIN_COFFEE (Brand Besar)</option>
                      <option value="LOCAL_CAFE">LOCAL_CAFE (Kafe Lokal)</option>
                      <option value="WARUNG_KOPI">WARUNG_KOPI (Warkop)</option>
                      <option value="BOOTH_COFFEE">BOOTH_COFFEE (Gerobak/Booth)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Level Harga (Price)
                    </label>
                    <select
                      value={formData.price_level}
                      onChange={(e) => setFormData({ ...formData, price_level: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="LOW">LOW (&lt; Rp 10.000)</option>
                      <option value="MEDIUM">MEDIUM (Rp 10.000 - 25.000)</option>
                      <option value="HIGH">HIGH (&gt; Rp 25.000)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Latitude <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="-7.4478"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Longitude <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="112.7183"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                    className="px-3 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={createMutation.isPending}
                    className="px-4 text-xs font-semibold"
                  >
                    Simpan Kompetitor
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
