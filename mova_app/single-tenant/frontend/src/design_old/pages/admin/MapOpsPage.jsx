import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Layers,
  MapPin,
  Bike,
  Truck,
  Compass,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sliders,
  TrendingUp,
  CloudRain,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  Radio,
  Coffee,
  Store,
  ShieldAlert,
  ShieldCheck,
  Eye,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  PageHeader,
} from "../../components/ui/index.js";
import { MOVAInteractiveMap } from "../../components/map/MOVAInteractiveMap.jsx";
import { ZoneDetailDrawer } from "../../components/domain/ZoneDetailDrawer.jsx";
import { QuickAlertBanner } from "../../components/dashboard/QuickAlertBanner.jsx";
import {
  MOCK_ZONES,
  MOCK_RIDERS,
  MOCK_POIS,
  MOCK_COMPETITORS,
} from "./mockData.js";
import { useDashboardRealtime } from "../../hooks/useDashboardRealtime.js";

export function MapOpsPage() {
  // Real-Time WebSockets / LBS Integration Hook
  const {
    isConnected,
    liveRiders: socketRiders,
    geofenceAlerts,
    dismissAlert,
  } = useDashboardRealtime();

  // Selected Zone & Drawer State
  const [selectedZone, setSelectedZone] = useState(MOCK_ZONES[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [focusedCoordinates, setFocusedCoordinates] = useState(null);

  // Collapsible Section Accordion States
  const [isRiderSectionOpen, setIsRiderSectionOpen] = useState(true);
  const [isZoneSectionOpen, setIsZoneSectionOpen] = useState(true);
  const [isSpotsSectionOpen, setIsSpotsSectionOpen] = useState(true);
  const [isCompetitorSectionOpen, setIsCompetitorSectionOpen] = useState(true);

  // Table Filters & Search Queries
  const [riderSearch, setRiderSearch] = useState("");
  const [riderStatusFilter, setRiderStatusFilter] = useState("ALL");
  const [riderZoneFilter, setRiderZoneFilter] = useState("ALL");

  const [zoneSearch, setZoneSearch] = useState("");
  const [spotSearch, setSpotSearch] = useState("");
  const [spotZoneFilter, setSpotZoneFilter] = useState("ALL");

  const [competitorSearch, setCompetitorSearch] = useState("");
  const [competitorZoneFilter, setCompetitorZoneFilter] = useState("ALL");

  // Map Top Ref for Smooth Scroll on Fly To
  const mapTopRef = useRef(null);

  // Merge mock riders with live WebSocket telemetry if available
  const activeRiders = useMemo(() => {
    if (!socketRiders || Object.keys(socketRiders).length === 0) {
      return MOCK_RIDERS;
    }
    return MOCK_RIDERS.map((rider) => {
      const live = socketRiders[rider.id];
      if (live) {
        return {
          ...rider,
          lat: live.latitude || rider.lat,
          lng: live.longitude || rider.lng,
          speed: live.speed !== undefined ? `${live.speed} km/h` : rider.speed,
          status: live.zone_compliance === "DEVIATED" ? "DEVIATION" : "OPERATING",
        };
      }
      return rider;
    });
  }, [socketRiders]);

  // Filtered Rider List for Seksi 1 Table
  const filteredRiders = useMemo(() => {
    return activeRiders.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(riderSearch.toLowerCase()) ||
        r.armadaCode.toLowerCase().includes(riderSearch.toLowerCase());
      const matchStatus =
        riderStatusFilter === "ALL" ||
        (riderStatusFilter === "OPERATING" && (r.status === "OPERATING" || r.status === "ACTIVE")) ||
        (riderStatusFilter === "DEVIATION" && r.status === "DEVIATION") ||
        (riderStatusFilter === "PLOTTED" && r.status === "PLOTTED");
      const matchZone =
        riderZoneFilter === "ALL" ||
        r.zoneId === riderZoneFilter ||
        r.zoneName.toLowerCase().includes(riderZoneFilter.toLowerCase());
      return matchSearch && matchStatus && matchZone;
    });
  }, [activeRiders, riderSearch, riderStatusFilter, riderZoneFilter]);

  // Mock Candidate Selling Spots Data
  const allCandidateSpots = useMemo(() => {
    return [
      {
        id: "spot-1",
        name: "Spot Depan Masjid Agung Sidoarjo",
        zoneId: "ZONE-SDA-01",
        zoneName: "Zona Alun-Alun Sidoarjo",
        revenuePotential: "Rp 650.000",
        crowdLevel: "Sangat Padat",
        isLocked: true,
        assignedRider: "Ahmad Fauzi",
        lat: -7.4475,
        lng: 112.7180,
      },
      {
        id: "spot-2",
        name: "Spot Pintu Masuk Kolam Renang GOR",
        zoneId: "ZONE-SDA-02",
        zoneName: "Zona GOR Delta Sidoarjo",
        revenuePotential: "Rp 520.000",
        crowdLevel: "Padat",
        isLocked: true,
        assignedRider: "Doni Pratama",
        lat: -7.4450,
        lng: 112.7090,
      },
      {
        id: "spot-3",
        name: "Spot Simpang Empat Gajah Mada",
        zoneId: "ZONE-SDA-03",
        zoneName: "Zona Taman Pinang",
        revenuePotential: "Rp 480.000",
        crowdLevel: "Sedang",
        isLocked: false,
        assignedRider: null,
        lat: -7.4520,
        lng: 112.7120,
      },
      {
        id: "spot-4",
        name: "Spot Kampus Utama Umsida",
        zoneId: "ZONE-SDA-04",
        zoneName: "Zona Kawasan Kampus",
        revenuePotential: "Rp 450.000",
        crowdLevel: "Padat",
        isLocked: false,
        assignedRider: null,
        lat: -7.4610,
        lng: 112.7230,
      },
      {
        id: "spot-5",
        name: "Spot Pintu Timur Delta Plaza",
        zoneId: "ZONE-SDA-01",
        zoneName: "Zona Alun-Alun Sidoarjo",
        revenuePotential: "Rp 610.000",
        crowdLevel: "Sangat Padat",
        isLocked: true,
        assignedRider: "Siti Rahma",
        lat: -7.4485,
        lng: 112.7195,
      },
    ];
  }, []);

  const filteredSpots = useMemo(() => {
    return allCandidateSpots.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(spotSearch.toLowerCase()) ||
        s.zoneName.toLowerCase().includes(spotSearch.toLowerCase());
      const matchZone = spotZoneFilter === "ALL" || s.zoneId === spotZoneFilter;
      return matchSearch && matchZone;
    });
  }, [allCandidateSpots, spotSearch, spotZoneFilter]);

  // Filtered Competitors for Seksi 4 Table
  const filteredCompetitors = useMemo(() => {
    return MOCK_COMPETITORS.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(competitorSearch.toLowerCase()) ||
        (c.category && c.category.toLowerCase().includes(competitorSearch.toLowerCase()));
      const matchZone =
        competitorZoneFilter === "ALL" ||
        (c.zoneId && c.zoneId === competitorZoneFilter) ||
        (c.zoneName && c.zoneName.toLowerCase().includes(competitorZoneFilter.toLowerCase()));
      return matchSearch && matchZone;
    });
  }, [competitorSearch, competitorZoneFilter]);

  // Handlers for Bi-Directional Fly-To Interactions
  const handleFlyToRider = (rider) => {
    setSelectedRider(rider);
    const targetZone = MOCK_ZONES.find((z) => z.id === rider.zoneId) || selectedZone;
    setSelectedZone(targetZone);
    setFocusedCoordinates([rider.lat, rider.lng]);
    mapTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFlyToZone = (zone) => {
    setSelectedZone(zone);
    setFocusedCoordinates(zone.coordinates ? zone.coordinates[0] : [zone.lat, zone.lng]);
    setIsDrawerOpen(true);
    mapTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFlyToSpot = (spot) => {
    const targetZone = MOCK_ZONES.find((z) => z.id === spot.zoneId) || selectedZone;
    setSelectedZone(targetZone);
    setFocusedCoordinates([spot.lat, spot.lng]);
    mapTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFlyToCompetitor = (comp) => {
    setFocusedCoordinates([comp.lat, comp.lng]);
    mapTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Export Log CSV Handler
  const handleExportTelemetry = () => {
    const headers = "Rider,Armada,Zona,Latitude,Longitude,Kecepatan,Status,Presensi\n";
    const rows = filteredRiders
      .map(
        (r) =>
          `"${r.name}","${r.armadaCode}","${r.zoneName}",${r.lat},${r.lng},"${r.speed || '0 km/h'}","${r.status}","${r.checkInTime || '08:00'}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `telemetri_map_ops_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div ref={mapTopRef}>
        <PageHeader
          title="Peta Operasional"
          subtitle="Pantau posisi armada, status zona, dan rekomendasi titik jual secara langsung."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {/* Live Socket.io Indicator */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                  isConnected
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span>{isConnected ? "Live WebSockets" : "Polling Mode"}</span>
              </div>

              {/* Hub Weather Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                <span>Sidoarjo Hub: 29°C · Cerah</span>
              </div>

              {/* Export Log Action */}
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleExportTelemetry}
              >
                Export Log Operasional
              </Button>
            </div>
          }
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. KANVAS PETA ULTRA-WIDE (FULL-HEIGHT 80vh) WITH FLOATING HUDs           */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
        <MOVAInteractiveMap
          height="78vh"
          zones={MOCK_ZONES}
          riders={activeRiders}
          pois={MOCK_POIS}
          competitors={MOCK_COMPETITORS}
          selectedZoneId={selectedZone?.id}
          selectedZone={selectedZone}
          onZoneClick={(zone) => {
            setSelectedZone(zone);
            setIsDrawerOpen(true);
          }}
          onRiderClick={handleFlyToRider}
        >
          {/* FLOATING TOP-CENTER: Quick Alert Banner */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-11/12 max-w-2xl pointer-events-auto">
            <QuickAlertBanner />
          </div>

          {/* FLOATING TOP-RIGHT: Ringkasan Operasi Glassmorphism HUD */}
          <div className="absolute top-4 right-4 z-[1000] pointer-events-auto hidden md:block">
            <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 shadow-2xl w-72 text-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-700/60">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Ringkasan Operasi
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              {/* Metric Items */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rider Aktif</span>
                  <span className="font-semibold text-slate-100">{activeRiders.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Penyimpangan Rute</span>
                  {activeRiders.filter((r) => r.status === "DEVIATION").length > 0 ? (
                    <span className="font-semibold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {activeRiders.filter((r) => r.status === "DEVIATION").length}
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-100">0</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kapasitas Zona</span>
                  <span className="font-semibold text-slate-100">
                    31/43 <span className="text-slate-400 text-[11px] font-normal">(72%)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kompetitor</span>
                  <span className="font-semibold text-slate-100">{MOCK_COMPETITORS.length} lokasi</span>
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING BOTTOM-CENTER: Horizontal Zone Selector Carousel Pills */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto w-11/12 max-w-4xl">
            <div className="p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
                Pilih Zona:
              </span>
              {MOCK_ZONES.map((zone) => {
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleFlyToZone(zone)}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50"
                    }`}
                  >
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-black">
                      #{zone.rank}
                    </span>
                    <span className="truncate max-w-[140px]">{zone.name}</span>
                    <span className="text-[10px] text-blue-200">
                      {zone.riderCount || 8}/{zone.maxCapacity || 10} Slot
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </MOVAInteractiveMap>
      </div>

      {/* ========================================================================= */}
      {/* 2. DAFTAR & TABEL OPERASIONAL LENGKAP                                     */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* ----------------------------------------------------------------------- */}
        {/* TABEL 1: STATUS & POSISI RIDER                                          */}
        {/* ----------------------------------------------------------------------- */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Status & Posisi Rider ({filteredRiders.length})</span>
              </div>
            }
            subtitle="Lokasi terkini, status presensi, dan kepatuhan rute."
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={isRiderSectionOpen ? ChevronUp : ChevronDown}
                  onClick={() => setIsRiderSectionOpen(!isRiderSectionOpen)}
                >
                  {isRiderSectionOpen ? "Ciutkan" : "Bentangkan"}
                </Button>
              </div>
            }
          />

          {isRiderSectionOpen && (
            <CardContent className="p-0">
              {/* Filter Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Cari nama rider / kode armada..."
                      value={riderSearch}
                      onChange={(e) => setRiderSearch(e.target.value)}
                      className="pl-9 text-xs h-8"
                    />
                  </div>
                  <Select
                    value={riderStatusFilter}
                    onChange={(e) => setRiderStatusFilter(e.target.value)}
                    options={[
                      { label: "Semua Status", value: "ALL" },
                      { label: "🟢 Aktif Bertugas", value: "OPERATING" },
                      { label: "🔴 Keluar Batas", value: "DEVIATION" },
                      { label: "🔵 Belum Check-in", value: "PLOTTED" },
                    ]}
                    className="w-48 text-xs h-8"
                  />
                  <Select
                    value={riderZoneFilter}
                    onChange={(e) => setRiderZoneFilter(e.target.value)}
                    options={[
                      { label: "Semua Zona Tugas", value: "ALL" },
                      ...MOCK_ZONES.map((z) => ({ label: z.name, value: z.id })),
                    ]}
                    className="w-52 text-xs h-8"
                  />
                </div>
              </div>

              {/* Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Rider</TableHeaderCell>
                      <TableHeaderCell>Armada</TableHeaderCell>
                      <TableHeaderCell>Zona Tugas</TableHeaderCell>
                      <TableHeaderCell>Posisi GPS</TableHeaderCell>
                      <TableHeaderCell>Kecepatan</TableHeaderCell>
                      <TableHeaderCell>Kepatuhan Rute</TableHeaderCell>
                      <TableHeaderCell>Presensi</TableHeaderCell>
                      <TableHeaderCell align="right">Aksi</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRiders.map((rider) => {
                      const isDeviated = rider.status === "DEVIATION";
                      return (
                        <TableRow key={rider.id}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs ${
                                isDeviated
                                  ? "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800"
                                  : "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                              }`}>
                                {rider.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {rider.name}
                                </div>
                                <div className="text-[10px] text-slate-400">{rider.phone || "0812-3456-7890"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              {rider.armadaCode}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {rider.zoneName}
                            </div>
                            <div className="text-[10px] text-slate-400">{rider.zoneId}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                              {typeof rider.lat === "number" ? rider.lat.toFixed(4) : rider.lat},{" "}
                              {typeof rider.lng === "number" ? rider.lng.toFixed(4) : rider.lng}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {rider.speed || "0.0 km/h"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {isDeviated ? (
                              <Badge variant="danger" size="sm">
                                ⚠️ Keluar Batas
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm">
                                🟢 Dalam Rute
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {rider.checkInTime || "08:12 WIB"}
                            </span>
                          </TableCell>
                          <TableCell align="right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isDeviated && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon={MessageSquare}
                                  onClick={() => {
                                    const phone = (rider.phone || "081234567890").replace(/[^0-9]/g, "");
                                    const waUrl = `https://wa.me/${phone.startsWith("0") ? "62" + phone.slice(1) : phone}?text=${encodeURIComponent(
                                      `Halo ${rider.name}, terdeteksi armada ${rider.armadaCode} Anda saat ini berada di luar batas zona penugasan (${rider.zoneName}). Mohon segera kembali ke area tugas atau konfirmasi status ke supervisor.`
                                    )}`;
                                    window.open(waUrl, "_blank");
                                  }}
                                >
                                  Tegur via WA
                                </Button>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Compass}
                                onClick={() => handleFlyToRider(rider)}
                              >
                                Lihat di Peta
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}
        </Card>

        {/* ----------------------------------------------------------------------- */}
        {/* TABEL 2: PERINGKAT POTENSI ZONA                                         */}
        {/* ----------------------------------------------------------------------- */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Peringkat Potensi Zona ({MOCK_ZONES.length})</span>
              </div>
            }
            subtitle="Urutan prioritas wilayah berdasarkan potensi penjualan dan cuaca."
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={isZoneSectionOpen ? ChevronUp : ChevronDown}
                onClick={() => setIsZoneSectionOpen(!isZoneSectionOpen)}
              >
                {isZoneSectionOpen ? "Ciutkan" : "Bentangkan"}
              </Button>
            }
          />

          {isZoneSectionOpen && (
            <CardContent className="p-0">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Peringkat</TableHeaderCell>
                      <TableHeaderCell>Nama Zona Operasional</TableHeaderCell>
                      <TableHeaderCell>Skor Potensi</TableHeaderCell>
                      <TableHeaderCell>Kuota Rider (Terisi/Maks)</TableHeaderCell>
                      <TableHeaderCell>Cuaca & Suhu</TableHeaderCell>
                      <TableHeaderCell>Titik Ramai (POI)</TableHeaderCell>
                      <TableHeaderCell align="right">Aksi</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {MOCK_ZONES.map((zone) => {
                      const rawScore = parseFloat(zone.score) || 0.84;
                      const score100 = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);

                      return (
                        <TableRow key={zone.id}>
                          <TableCell>
                            <Badge
                              variant={zone.rank === 1 ? "primary" : zone.rank <= 3 ? "secondary" : "default"}
                              size="sm"
                            >
                              Peringkat #{zone.rank}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {zone.name}
                            </div>
                            <div className="text-[10px] text-slate-400">{zone.id}</div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {score100} / 100
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span>{zone.riderCount} / {zone.maxCapacity} Slot</span>
                                <span>{zone.capacityPct}%</span>
                              </div>
                              <div className="w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    zone.capacityPct >= 80
                                      ? "bg-emerald-500"
                                      : zone.capacityPct >= 50
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                  }`}
                                  style={{ width: `${zone.capacityPct}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                              <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                              <span>29°C Cerah</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {zone.poiCount} Titik Terdaftar
                            </span>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Eye}
                              onClick={() => handleFlyToZone(zone)}
                            >
                              Lihat di Peta
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}
        </Card>

        {/* ----------------------------------------------------------------------- */}
        {/* TABEL 3: TITIK JUAL STRATEGIS                                           */}
        {/* ----------------------------------------------------------------------- */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Titik Jual Strategis ({filteredSpots.length})</span>
              </div>
            }
            subtitle="Lokasi mangkal potensial dan status ketersediaannya."
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={isSpotsSectionOpen ? ChevronUp : ChevronDown}
                onClick={() => setIsSpotsSectionOpen(!isSpotsSectionOpen)}
              >
                {isSpotsSectionOpen ? "Ciutkan" : "Bentangkan"}
              </Button>
            }
          />

          {isSpotsSectionOpen && (
            <CardContent className="p-0">
              {/* Filter Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari nama titik jual..."
                    value={spotSearch}
                    onChange={(e) => setSpotSearch(e.target.value)}
                    className="pl-9 text-xs h-8"
                  />
                </div>
                <Select
                  value={spotZoneFilter}
                  onChange={(e) => setSpotZoneFilter(e.target.value)}
                  options={[
                    { label: "Semua Zona", value: "ALL" },
                    ...MOCK_ZONES.map((z) => ({ label: z.name, value: z.id })),
                  ]}
                  className="w-52 text-xs h-8"
                />
              </div>

              {/* Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Nama Titik Jual</TableHeaderCell>
                      <TableHeaderCell>Zona Operasional</TableHeaderCell>
                      <TableHeaderCell>Potensi Omset Shift</TableHeaderCell>
                      <TableHeaderCell>Tingkat Keramaian</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Rider Bertugas</TableHeaderCell>
                      <TableHeaderCell align="right">Aksi</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSpots.map((spot) => (
                      <TableRow key={spot.id}>
                        <TableCell>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {spot.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{spot.id}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {spot.zoneName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {spot.revenuePotential}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            {spot.crowdLevel}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={spot.isLocked ? "warning" : "success"} size="sm">
                            {spot.isLocked ? "Sedang Digunakan" : "Tersedia"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {spot.assignedRider || "Belum Ada"}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Compass}
                            onClick={() => handleFlyToSpot(spot)}
                          >
                            Tampilkan Titik
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}
        </Card>

        {/* ----------------------------------------------------------------------- */}
        {/* TABEL 4: SEBARAN KOMPETITOR                                             */}
        {/* ----------------------------------------------------------------------- */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-rose-500" />
                <span>Sebaran Kompetitor ({filteredCompetitors.length})</span>
              </div>
            }
            subtitle="Lokasi kompetitor aktif di sekitar area jangkauan."
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={isCompetitorSectionOpen ? ChevronUp : ChevronDown}
                onClick={() => setIsCompetitorSectionOpen(!isCompetitorSectionOpen)}
              >
                {isCompetitorSectionOpen ? "Ciutkan" : "Bentangkan"}
              </Button>
            }
          />

          {isCompetitorSectionOpen && (
            <CardContent className="p-0">
              {/* Filter Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari brand / kedai kompetitor..."
                    value={competitorSearch}
                    onChange={(e) => setCompetitorSearch(e.target.value)}
                    className="pl-9 text-xs h-8"
                  />
                </div>
                <Select
                  value={competitorZoneFilter}
                  onChange={(e) => setCompetitorZoneFilter(e.target.value)}
                  options={[
                    { label: "Semua Zona Terdekat", value: "ALL" },
                    ...MOCK_ZONES.map((z) => ({ label: z.name, value: z.id })),
                  ]}
                  className="w-52 text-xs h-8"
                />
              </div>

              {/* Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Nama Brand / Kedai</TableHeaderCell>
                      <TableHeaderCell>Tipe Usaha</TableHeaderCell>
                      <TableHeaderCell>Zona Terdekat</TableHeaderCell>
                      <TableHeaderCell>Perkiraan Jarak</TableHeaderCell>
                      <TableHeaderCell>Tingkat Persaingan</TableHeaderCell>
                      <TableHeaderCell align="right">Aksi</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCompetitors.map((comp) => (
                      <TableRow key={comp.id}>
                        <TableCell>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {comp.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{comp.category || "Kedai Kopi"}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            {comp.brand || "Independent Warkop"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {comp.zoneName || "Zona Alun-Alun Sidoarjo"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                            {comp.distance || "250 meter"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              comp.threatLevel === "HIGH"
                                ? "danger"
                                : comp.threatLevel === "MEDIUM"
                                ? "warning"
                                : "success"
                            }
                            size="sm"
                          >
                            {comp.threatLevel === "HIGH"
                              ? "⚠️ Tinggi (Radius 300m)"
                              : comp.threatLevel === "MEDIUM"
                              ? "⚡ Sedang"
                              : "🟢 Rendah"}
                          </Badge>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={MapPin}
                            onClick={() => handleFlyToCompetitor(comp)}
                          >
                            Lihat di Peta
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. SLIDE-OVER INSPECTOR: 3-TAB ZONE DETAIL DRAWER                         */}
      {/* ========================================================================= */}
      <ZoneDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        zone={selectedZone}
        riders={activeRiders}
        sellingSpots={allCandidateSpots.filter((s) => s.zoneId === selectedZone?.id)}
        onFlyToRider={handleFlyToRider}
        onFlyToSpot={handleFlyToSpot}
      />
    </div>
  );
}

export default MapOpsPage;
