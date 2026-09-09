import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { Table, TableContainer } from "../../components/ui/Table.jsx";
import { poiService } from "../../services/poiService.js";
import { zoneService } from "../../services/zoneService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  MapPin,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Eye,
  AlertTriangle,
  History,
  ShieldCheck,
  FileCheck,
  CloudDownload,
  Info,
} from "lucide-react";

export function PoiManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State Management
  const [activeTab, setActiveTab] = useState("operational"); // 'operational' | 'pending' | 'logs'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null); // Detail drawer
  const [moderationPoi, setModerationPoi] = useState(null); // Modal moderation target
  const [moderationNotes, setModerationNotes] = useState("");
  const [syncStatus, setSyncStatus] = useState(null);

  // 1. Authoritative Operational POIs Query
  const {
    data: operationalPoisRes,
    isLoading: isLoadingOperational,
    isError: isErrorOperational,
    refetch: refetchOperational,
  } = useQuery({
    queryKey: queryKeys.pois.operationalArea(),
    queryFn: () => poiService.getOperationalAreaPois(),
  });

  const operationalPois = useMemo(() => {
    return Array.isArray(operationalPoisRes)
      ? operationalPoisRes
      : operationalPoisRes?.pois || operationalPoisRes?.data || [];
  }, [operationalPoisRes]);

  // 2. Authoritative Pending POIs Query
  const {
    data: pendingPoisRes,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = useQuery({
    queryKey: queryKeys.pois.pending(),
    queryFn: () => poiService.getPendingPois(),
  });

  const pendingPois = useMemo(() => {
    return Array.isArray(pendingPoisRes)
      ? pendingPoisRes
      : pendingPoisRes?.pois || [];
  }, [pendingPoisRes]);

  // 3. Authoritative Approval Logs Query
  const {
    data: approvalLogsRes,
    isLoading: isLoadingLogs,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: queryKeys.pois.approvalLogs(),
    queryFn: () => poiService.getApprovalLogs(),
  });

  const approvalLogs = useMemo(() => {
    return Array.isArray(approvalLogsRes)
      ? approvalLogsRes
      : approvalLogsRes?.logs || [];
  }, [approvalLogsRes]);

  // 4. Authoritative 58 POI Categories Query (Dynamic from backend SSOT)
  const { data: crowdScoresRes } = useQuery({
    queryKey: queryKeys.dss.c3CrowdScores(),
    queryFn: () => poiService.getCrowdScores(),
  });

  const masterCategories = useMemo(() => {
    const rawCats = crowdScoresRes?.data || crowdScoresRes?.categories || [];
    return rawCats.map((cat) => ({
      id: cat.id || cat.category_id,
      name: cat.name || cat.category_name,
      score_pagi: cat.score_pagi ?? cat.scores?.pagi ?? 1,
    }));
  }, [crowdScoresRes]);

  // 5. Authoritative Master Zones Query
  const { data: zonesRes } = useQuery({
    queryKey: queryKeys.zones.list(),
    queryFn: () => zoneService.getZones(),
  });

  const masterZones = useMemo(() => {
    return Array.isArray(zonesRes)
      ? zonesRes
      : zonesRes?.zones || zonesRes?.data || [];
  }, [zonesRes]);

  // 6. Approve / Reject Mutation with Authoritative Query Invalidation
  const approveMutation = useMutation({
    mutationFn: async ({ poi_id, status, notes }) => {
      return await poiService.approveOrRejectPoi({ poi_id, status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pois.operationalArea() });
      queryClient.invalidateQueries({ queryKey: queryKeys.pois.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.pois.approvalLogs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      setModerationPoi(null);
      setModerationNotes("");
    },
  });

  // 7. OSM Overpass Sync Mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      return await poiService.syncCityPois({ city: "Sidoarjo" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pois.operationalArea() });
      queryClient.invalidateQueries({ queryKey: queryKeys.pois.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      setSyncStatus({
        type: "success",
        msg: data?.msg || `Sinkronisasi Overpass OSM berhasil (${data?.stats?.total_inserted || data?.count || 0} POI diproses).`,
      });
    },
    onError: (err) => {
      setSyncStatus({
        type: "error",
        msg: err?.response?.data?.msg || "Gagal melakukan sinkronisasi dengan Overpass API.",
      });
    },
  });

  // Filtered Operational POIs
  const filteredOperationalPois = useMemo(() => {
    return operationalPois.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.zone_name && p.zone_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === "ALL" ||
        p.category === selectedCategory ||
        p.category_name === selectedCategory ||
        p.category_id === selectedCategory;

      const matchZone =
        selectedZone === "ALL" ||
        p.zone_id === selectedZone ||
        p.zone_name === selectedZone;

      const matchUnassigned = !onlyUnassigned || !p.zone_id || p.zone_id === null;

      return matchSearch && matchCategory && matchZone && matchUnassigned;
    });
  }, [operationalPois, searchQuery, selectedCategory, selectedZone, onlyUnassigned]);

  // Handle Moderation Action
  const handleOpenModeration = (poi, status) => {
    setModerationPoi({ poi, status });
    setModerationNotes("");
  };

  const handleConfirmModeration = () => {
    if (!moderationPoi) return;
    approveMutation.mutate({
      poi_id: moderationPoi.poi.id,
      status: moderationPoi.status,
      notes: moderationNotes.trim() || undefined,
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#FAFAFA] text-[#171717] font-sans">
        {/* Workspace Top Header */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                  SPATIAL MASTER DATA
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                  HUB: SIDOARJO
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#171717] mt-1 tracking-tight">
                POI Intelligence & Moderation Workspace
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manajemen data titik minat (Points of Interest), penelusuran 58 kategori spasial, pipeline sinkronisasi Overpass OSM, dan moderasi persetujuan.
              </p>
            </div>

            {/* Top Workspace Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchOperational();
                  refetchPending();
                  refetchLogs();
                }}
                className="h-8.5 px-3 border-[#E5E5E5] bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-md shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                Refresh Data
              </Button>

              {user?.role === "SUPERADMIN" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => syncMutation.mutate()}
                  loading={syncMutation.isPending}
                  className="h-8.5 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-md shadow-2xs transition-all"
                >
                  <CloudDownload className="w-3.5 h-3.5 mr-1.5" />
                  Sinkronisasi Overpass OSM
                </Button>
              )}
            </div>
          </div>

          {/* Sync Status Feedback */}
          {syncStatus && (
            <div className="mt-3">
              <Alert
                variant={syncStatus.type === "success" ? "success" : "danger"}
                title={syncStatus.type === "success" ? "Sinkronisasi Berhasil" : "Sinkronisasi Gagal"}
                onClose={() => setSyncStatus(null)}
              >
                {syncStatus.msg}
              </Alert>
            </div>
          )}

          {/* KPI Mini Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-100">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Approved POIs
                </div>
                <div className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {isLoadingOperational ? "..." : operationalPois.length}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <MapPin className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Pending Moderation
                </div>
                <div className="text-lg font-bold text-amber-600 mt-0.5">
                  {isLoadingPending ? "..." : pendingPois.length}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Master Kategori
                </div>
                <div className="text-lg font-bold text-neutral-800 mt-0.5">
                  {masterCategories.length || 58}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-neutral-100 text-neutral-600 flex items-center justify-center border border-neutral-200">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Zona Operasional
                </div>
                <div className="text-lg font-bold text-neutral-800 mt-0.5">
                  {masterZones.length}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Rail */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 -mb-px">
            <button
              onClick={() => setActiveTab("operational")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "operational"
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Daftar POI Operasional
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-700 font-mono">
                {operationalPois.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "pending"
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Antrean Moderasi
              {pendingPois.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono font-bold">
                  {pendingPois.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "logs"
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Log Audit Persetujuan
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-700 font-mono">
                {approvalLogs.length}
              </span>
            </button>
          </div>
        </div>

        {/* Workspace Body Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: OPERATIONAL POIS */}
          {activeTab === "operational" && (
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="bg-white p-3.5 rounded-md border border-[#E5E5E5] shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  {/* Search Input */}
                  <div className="relative min-w-[240px] flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Cari nama POI, kategori, atau zona..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                  </div>

                  {/* Dynamic 58 Master Categories Filter */}
                  <div className="min-w-[180px]">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="ALL">Semua Kategori ({masterCategories.length || 58})</option>
                      {masterCategories.map((cat) => (
                        <option key={cat.id || cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Master Zones Filter */}
                  <div className="min-w-[150px]">
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="ALL">Semua Zona</option>
                      {masterZones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unassigned Only Checkbox */}
                  <label className="flex items-center gap-1.5 text-xs text-neutral-600 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyUnassigned}
                      onChange={(e) => setOnlyUnassigned(e.target.checked)}
                      className="rounded border-[#E5E5E5] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    Belum Terploting Zona
                  </label>
                </div>

                <div className="text-xs text-neutral-500 font-medium">
                  Menampilkan <strong className="text-neutral-900">{filteredOperationalPois.length}</strong> dari {operationalPois.length} POI
                </div>
              </div>

              {/* Operational POI Table */}
              <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs overflow-hidden">
                <TableContainer>
                  <Table>
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                        <th className="py-2.5 px-3.5 w-12 text-center">#</th>
                        <th className="py-2.5 px-3.5">Nama POI</th>
                        <th className="py-2.5 px-3.5">Kategori Spasial</th>
                        <th className="py-2.5 px-3.5">Zona Operasional</th>
                        <th className="py-2.5 px-3.5">Koordinat (Lat, Lon)</th>
                        <th className="py-2.5 px-3.5 text-center">Status</th>
                        <th className="py-2.5 px-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] text-xs">
                      {isLoadingOperational ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-neutral-400">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                              <span>Memuat dataset POI operasional...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredOperationalPois.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-neutral-400">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <MapPin className="w-6 h-6 text-neutral-300" />
                              <span className="font-medium text-neutral-500">Tidak ada POI operasional yang sesuai filter</span>
                              <span className="text-[11px] text-neutral-400">Gunakan tombol "Sinkronisasi Overpass OSM" untuk mengimpor titik minat baru.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredOperationalPois.map((poi, idx) => (
                          <tr key={poi.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                            <td className="py-2 px-3.5 text-center text-neutral-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3.5 font-medium text-neutral-900">
                              {poi.name || <span className="text-neutral-400 italic">Tanpa Nama</span>}
                            </td>
                            <td className="py-2 px-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                {poi.category || poi.category_name || "Lainnya"}
                              </span>
                            </td>
                            <td className="py-2 px-3.5">
                              {poi.zone_name ? (
                                <span className="font-medium text-neutral-800">{poi.zone_name}</span>
                              ) : (
                                <span className="text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 font-medium">
                                  Luar Zona
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3.5 font-mono text-[11px] text-neutral-500">
                              {poi.latitude?.toFixed(5) || "N/A"}, {poi.longitude?.toFixed(5) || "N/A"}
                            </td>
                            <td className="py-2 px-3.5 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ACTIVE / APPROVED
                              </span>
                            </td>
                            <td className="py-2 px-3.5 text-right">
                              <button
                                onClick={() => setSelectedPoi(poi)}
                                className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded shadow-2xs transition-colors"
                              >
                                <Eye className="w-3 h-3 mr-1 text-neutral-500" />
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}

          {/* TAB 2: PENDING MODERATION */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-md p-3.5 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>Moderasi Usulan POI:</strong> Titik minat pada antrean ini berasal dari ingest otomatis OpenStreetMap (deteksi cron atau sinkronisasi) yang memerlukan verifikasi manual oleh Supervisor / Superadmin sebelum diikutsertakan dalam pembobotan kriteria DSS C1–C3.
                </div>
              </div>

              <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs overflow-hidden">
                <TableContainer>
                  <Table>
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                        <th className="py-2.5 px-3.5 w-12 text-center">#</th>
                        <th className="py-2.5 px-3.5">Nama Usulan POI</th>
                        <th className="py-2.5 px-3.5">Kategori</th>
                        <th className="py-2.5 px-3.5">Koordinat (Lat, Lon)</th>
                        <th className="py-2.5 px-3.5">Sumber Deteksi</th>
                        <th className="py-2.5 px-3.5">Waktu Ingest</th>
                        <th className="py-2.5 px-3.5 text-right">Keputusan Moderasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] text-xs">
                      {isLoadingPending ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-neutral-400">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                              <span>Memuat antrean moderasi POI...</span>
                            </div>
                          </td>
                        </tr>
                      ) : pendingPois.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-neutral-400">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <ShieldCheck className="w-6 h-6 text-emerald-500" />
                              <span className="font-semibold text-neutral-700">Antrean Moderasi Bersih</span>
                              <span className="text-[11px] text-neutral-400">Seluruh usulan POI telah diverifikasi dan disetujui.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pendingPois.map((poi, idx) => (
                          <tr key={poi.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                            <td className="py-2.5 px-3.5 text-center text-neutral-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3.5 font-medium text-neutral-900">
                              {poi.name || <span className="text-neutral-400 italic">Tanpa Nama</span>}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                {poi.category || poi.category_name || "Lainnya"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-[11px] text-neutral-500">
                              {poi.latitude?.toFixed(5) || "N/A"}, {poi.longitude?.toFixed(5) || "N/A"}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span className="text-[11px] font-mono text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {poi.source || "OVERPASS_OSM"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-[11px] text-neutral-500 font-mono">
                              {poi.created_at ? new Date(poi.created_at).toLocaleString("id-ID") : "N/A"}
                            </td>
                            <td className="py-2.5 px-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenModeration(poi, "APPROVED")}
                                  className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-2xs transition-colors"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleOpenModeration(poi, "REJECTED")}
                                  className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded shadow-2xs transition-colors"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Tolak
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}

          {/* TAB 3: APPROVAL LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs overflow-hidden">
                <TableContainer>
                  <Table>
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                        <th className="py-2.5 px-3.5 w-12 text-center">#</th>
                        <th className="py-2.5 px-3.5">Waktu Moderasi</th>
                        <th className="py-2.5 px-3.5">Nama POI</th>
                        <th className="py-2.5 px-3.5 text-center">Keputusan</th>
                        <th className="py-2.5 px-3.5">Moderator / Admin</th>
                        <th className="py-2.5 px-3.5">Catatan Persetujuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] text-xs">
                      {isLoadingLogs ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-400">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                              <span>Memuat riwayat log audit moderasi...</span>
                            </div>
                          </td>
                        </tr>
                      ) : approvalLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-400">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <FileCheck className="w-6 h-6 text-neutral-300" />
                              <span className="font-medium text-neutral-500">Belum ada riwayat audit persetujuan</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        approvalLogs.map((log, idx) => (
                          <tr key={log.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                            <td className="py-2 px-3.5 text-center text-neutral-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3.5 text-[11px] text-neutral-600 font-mono">
                              {log.created_at ? new Date(log.created_at).toLocaleString("id-ID") : "N/A"}
                            </td>
                            <td className="py-2 px-3.5 font-medium text-neutral-900">
                              {log.poi_name || log.name || `POI ID #${log.poi_id?.substring(0, 8)}`}
                            </td>
                            <td className="py-2 px-3.5 text-center">
                              {log.status === "APPROVED" || log.action === "APPROVE" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  APPROVED
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  REJECTED
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3.5 text-neutral-700 font-medium">
                              {log.moderator_name || log.admin_name || log.user_email || "Superadmin"}
                            </td>
                            <td className="py-2 px-3.5 text-neutral-500 italic">
                              {log.notes || log.note || <span className="text-neutral-300">-</span>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}
        </div>

        {/* POI Detail Drawer */}
        {selectedPoi && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-2xs flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col border-l border-[#E5E5E5] animate-in slide-in-from-right duration-200">
              <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-bold text-sm text-[#171717]">Detail Titik Minat (POI)</h3>
                </div>
                <button
                  onClick={() => setSelectedPoi(null)}
                  className="w-7 h-7 rounded hover:bg-neutral-200/60 flex items-center justify-center text-neutral-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase">Nama POI</div>
                  <div className="text-base font-bold text-[#171717] mt-0.5">
                    {selectedPoi.name || "Tanpa Nama"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Kategori</div>
                    <div className="font-medium text-neutral-800 mt-0.5">
                      {selectedPoi.category || selectedPoi.category_name || "Lainnya"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Status</div>
                    <div className="font-medium text-emerald-600 mt-0.5">ACTIVE / APPROVED</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Zona Operasional</div>
                    <div className="font-medium text-neutral-800 mt-0.5">
                      {selectedPoi.zone_name || "Belum Ditetapkan"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Sumber Data</div>
                    <div className="font-mono text-neutral-700 mt-0.5">
                      {selectedPoi.source || "OVERPASS_OSM"}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase">Koordinat Spasial</div>
                  <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200 mt-1 font-mono text-[11px] text-neutral-700">
                    Latitude: {selectedPoi.latitude ?? "N/A"}<br />
                    Longitude: {selectedPoi.longitude ?? "N/A"}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase">UUID & Metadata</div>
                  <div className="text-[11px] font-mono text-neutral-500 mt-1 break-all">
                    ID: {selectedPoi.id || "N/A"}<br />
                    Category ID: {selectedPoi.category_id || "N/A"}<br />
                    Zone ID: {selectedPoi.zone_id || "N/A"}<br />
                    Created: {selectedPoi.created_at ? new Date(selectedPoi.created_at).toLocaleString("id-ID") : "N/A"}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E5E5E5] bg-neutral-50 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPoi(null)}
                  className="px-4 text-xs font-medium"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Moderation Confirmation Modal */}
        {moderationPoi && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5">
                {moderationPoi.status === "APPROVED" ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-[#171717]">
                    {moderationPoi.status === "APPROVED" ? "Setujui Titik Minat (POI)" : "Tolak Titik Minat (POI)"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Konfirmasi keputusan moderasi data spasial.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-xs space-y-1">
                <div><strong>Nama POI:</strong> {moderationPoi.poi.name || "Tanpa Nama"}</div>
                <div><strong>Kategori:</strong> {moderationPoi.poi.category || moderationPoi.poi.category_name || "Lainnya"}</div>
                <div><strong>Koordinat:</strong> {moderationPoi.poi.latitude}, {moderationPoi.poi.longitude}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Catatan Moderasi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Tambahkan alasan atau catatan persetujuan..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModerationPoi(null)}
                  className="px-3 text-xs"
                >
                  Batal
                </Button>
                <Button
                  variant={moderationPoi.status === "APPROVED" ? "primary" : "danger"}
                  size="sm"
                  onClick={handleConfirmModeration}
                  loading={approveMutation.isPending}
                  className="px-4 text-xs font-semibold"
                >
                  {moderationPoi.status === "APPROVED" ? "Konfirmasi Setujui" : "Konfirmasi Tolak"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
