/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   DistributionPage.jsx (Operational Dispatch & Distribution Center - Single Tenant)
 *   Paradigm: "Real-Time Dispatch First, Planning Second"
 *   3-Column Architecture: [25%] Waiting Queue FIFO -> [35%] TOPSIS Recommended Zones -> [40%] Assignment Board
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Play,
  Sliders,
  MapPin,
  Eye,
  Send,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  History,
  Activity,
  CloudSun,
  Flame,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  MetricCard,
  Badge,
  Button,
  Modal,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Skeleton,
  TableSkeleton,
  RiderStatusBadge,
} from "../../components/ui/index.js";
import { distributionService } from "../../services/distributionService.js";
import { dssService } from "../../services/dssService.js";
import { weatherService } from "../../services/weatherService.js";
import { useDashboardRealtime } from "../../hooks/useDashboardRealtime.js";

// Decision Time Context options
const TIME_CONTEXTS = [
  { id: "realtime", label: "Real-Time (Sekarang)", icon: Zap, badge: "Live" },
  { id: "pagi", label: "Sesi Pagi (06:00 - 11:00)", icon: CloudSun, badge: "06-11" },
  { id: "siang", label: "Sesi Siang (11:00 - 16:00)", icon: Flame, badge: "11-16" },
  { id: "sore", label: "Sesi Sore (16:00 - 21:00)", icon: CloudSun, badge: "16-21" },
];

const OVERRIDE_REASONS = [
  "Event Lokal / Keramaian Dadakan di Lapangan",
  "Kondisi Lapangan / Mikro-Cuaca Khusus",
  "Permintaan Khusus Manajemen / Pengujian Rute",
  "Penyesuaian Kapasitas Armada Tertentu",
  "Permintaan Khusus Rider / Preferensi Terverifikasi",
  "Lainnya (Catatan Khusus)",
];

export function DistributionPage() {
  // 1. Operational Time Context & Filter States
  const [timeContext, setTimeContext] = useState("realtime");
  const [boardFilter, setBoardFilter] = useState("ALL"); // ALL, PLOTTED, OPERATING, DEVIATED
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  // 2. Data States
  const [overviewData, setOverviewData] = useState(null);
  const [ridersSummaryData, setRidersSummaryData] = useState(null);
  const [auditRuns, setAuditRuns] = useState([]);
  const [hubWeather, setHubWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Modal States
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);

  // Selected entities for modals
  const [selectedRiderForAssign, setSelectedRiderForAssign] = useState(null);
  const [selectedTargetZoneId, setSelectedTargetZoneId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideNotes, setOverrideNotes] = useState("");
  const [selectedZoneForExplain, setSelectedZoneForExplain] = useState(null);
  const [zoneRawEvalData, setZoneRawEvalData] = useState(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Live Socket connection hook
  const { isConnected, socketEvents } = useDashboardRealtime();

  // Clock ticker for real-time operational context
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      };
      setCurrentTimeStr(new Intl.DateTimeFormat("id-ID", options).format(now));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Overview Data from backend
  const fetchOverview = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const [overviewRes, summaryRes, runsRes, weatherRes] = await Promise.allSettled([
        distributionService.getOverview(timeContext),
        distributionService.getRidersSummary(),
        distributionService.getRuns(10),
        weatherService.getHubWeatherInfo("Sidoarjo"),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value?.data) {
        setOverviewData(overviewRes.value.data);
      }
      if (summaryRes.status === "fulfilled" && summaryRes.value?.data) {
        setRidersSummaryData(summaryRes.value.data);
      }
      if (runsRes.status === "fulfilled" && runsRes.value?.data) {
        setAuditRuns(runsRes.value.data);
      }
      if (weatherRes.status === "fulfilled" && weatherRes.value?.data) {
        setHubWeather(weatherRes.value.data);
      }
    } catch (err) {
      console.error("Error fetching distribution data:", err);
      setError("Gagal memuat data distribusi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [timeContext]);

  // Initial load and react to timeContext change
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // React to Real-Time WebSockets Events
  useEffect(() => {
    if (socketEvents && socketEvents.length > 0) {
      const lastEvent = socketEvents[socketEvents.length - 1];
      if (
        lastEvent.type === "RIDER_ASSIGNED" ||
        lastEvent.type === "DUTY_CONFIRMED" ||
        lastEvent.type === "POSITION_UPDATE" ||
        lastEvent.type === "OPERATIONAL_SESSION"
      ) {
        // Silently refresh without full loading spinner
        fetchOverview(false);
      }
    }
  }, [socketEvents, fetchOverview]);

  // Derived lists and counters
  const waitingQueue = useMemo(() => {
    return overviewData?.waiting_queue || [];
  }, [overviewData]);

  const zonesOverview = useMemo(() => {
    return overviewData?.zones_overview || [];
  }, [overviewData]);

  const allAssignedRiders = useMemo(() => {
    if (!ridersSummaryData?.riders) return [];
    return ridersSummaryData.riders.filter(
      (r) => r.status === "PLOTTED" || r.status === "OPERATING" || r.status === "DEVIATION"
    );
  }, [ridersSummaryData]);

  const filteredAssignedRiders = useMemo(() => {
    return allAssignedRiders.filter((r) => {
      // Filter status
      if (boardFilter === "PLOTTED" && r.status !== "PLOTTED") return false;
      if (boardFilter === "OPERATING" && r.status !== "OPERATING") return false;
      if (boardFilter === "DEVIATED" && r.status !== "DEVIATION") return false;

      // Filter search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.name?.toLowerCase().includes(q);
        const matchZone = r.zone_name?.toLowerCase().includes(q);
        const matchArmada = r.armada_code?.toLowerCase().includes(q);
        if (!matchName && !matchZone && !matchArmada) return false;
      }
      return true;
    });
  }, [allAssignedRiders, boardFilter, searchQuery]);

  // Calculate Metrics
  const totalWaitingCount = waitingQueue.length;
  const totalPlottedCount = ridersSummaryData?.plotted || 0;
  const totalOperatingCount = (ridersSummaryData?.operating || 0) + (ridersSummaryData?.deviated || 0);
  const totalRemainingCapacity = overviewData?.total_remaining_capacity || 0;
  const totalMaxCapacity = zonesOverview.reduce((acc, z) => acc + (z.max_capacity || 10), 0);

  // Auto-Distribution Simulation Pairing (for Preview Modal)
  const simulatedDistribution = useMemo(() => {
    if (!waitingQueue || waitingQueue.length === 0 || !zonesOverview || zonesOverview.length === 0) {
      return [];
    }

    const result = [];
    const zonesCopy = zonesOverview.map((z) => ({
      ...z,
      simRemaining: z.remaining_capacity,
    }));

    let queueIdx = 0;
    for (const zone of zonesCopy) {
      while (zone.simRemaining > 0 && queueIdx < waitingQueue.length) {
        const rider = waitingQueue[queueIdx];
        result.push({
          fifoNumber: queueIdx + 1,
          riderId: rider.rider_id,
          riderName: rider.rider_name,
          confirmedAt: rider.confirmed_at,
          targetZoneId: zone.zone_id,
          targetZoneName: zone.zone_name,
          topsisRank: zone.rank,
          preferenceScore: zone.preference_score,
          isAssigned: true,
          status: "SUCCESS",
        });
        zone.simRemaining--;
        queueIdx++;
      }
    }

    // Unassigned riders due to capacity limits
    while (queueIdx < waitingQueue.length) {
      const rider = waitingQueue[queueIdx];
      result.push({
        fifoNumber: queueIdx + 1,
        riderId: rider.rider_id,
        riderName: rider.rider_name,
        confirmedAt: rider.confirmed_at,
        targetZoneId: null,
        targetZoneName: "TIDAK DAPAT ZONA (KAPASITAS PENUH)",
        topsisRank: null,
        preferenceScore: null,
        isAssigned: false,
        status: "UNASSIGNED",
      });
      queueIdx++;
    }

    return result;
  }, [waitingQueue, zonesOverview]);

  // Execute Auto-Distribution
  const handleExecuteAutoDistribute = async () => {
    setIsExecutingAction(true);
    setActionSuccessMsg(null);
    try {
      const res = await distributionService.autoDistribute({ time: timeContext });
      setActionSuccessMsg(res.message || "Distribusi otomatis DSS berhasil dieksekusi!");
      setIsPreviewModalOpen(false);
      await fetchOverview(false);
    } catch (err) {
      alert(err.response?.data?.msg || err.message || "Gagal mengeksekusi distribusi otomatis.");
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Open Manual Assignment Modal with pre-selected rider
  const handleOpenManualAssign = (rider) => {
    setSelectedRiderForAssign(rider);
    // Suggest rank 1 zone with available capacity by default
    const firstAvailableZone = zonesOverview.find((z) => z.remaining_capacity > 0);
    setSelectedTargetZoneId(firstAvailableZone?.zone_id || "");
    setOverrideReason("");
    setOverrideNotes("");
    setIsManualModalOpen(true);
  };

  // Check if chosen zone is an override (not Rank #1)
  const isSelectedZoneAnOverride = useMemo(() => {
    if (!selectedTargetZoneId || zonesOverview.length === 0) return false;
    const chosenZone = zonesOverview.find((z) => z.zone_id === selectedTargetZoneId);
    return chosenZone && chosenZone.rank !== 1;
  }, [selectedTargetZoneId, zonesOverview]);

  // Execute Manual Assignment / Override
  const handleExecuteManualAssign = async () => {
    if (!selectedRiderForAssign || !selectedTargetZoneId) {
      alert("Harap pilih Rider dan Zona sasaran.");
      return;
    }

    setIsExecutingAction(true);
    try {
      const payload = {
        rider_id: selectedRiderForAssign.rider_id || selectedRiderForAssign.id,
        zone_id: selectedTargetZoneId,
        time: timeContext,
        reason: isSelectedZoneAnOverride
          ? `${overrideReason || "Supervisor Manual Selection"}${overrideNotes ? ` - ${overrideNotes}` : ""}`
          : undefined,
      };

      const res = isSelectedZoneAnOverride
        ? await distributionService.overrideDistribute(payload)
        : await distributionService.manualDistribute(payload);

      setActionSuccessMsg(res.message || "Penugasan manual berhasil disimpan.");
      setIsManualModalOpen(false);
      setSelectedRiderForAssign(null);
      await fetchOverview(false);
    } catch (err) {
      alert(err.response?.data?.msg || err.message || "Gagal menyimpan penugasan manual.");
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Open Zone Explainability Modal
  const handleOpenExplainability = async (zone) => {
    setSelectedZoneForExplain(zone);
    setIsExplainModalOpen(true);
    setZoneRawEvalData(null);
    try {
      const res = await dssService.getZoneRawEvaluation(zone.zone_id, {
        time: timeContext !== "realtime" ? timeContext : undefined,
      });
      if (res?.data) {
        setZoneRawEvalData(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch zone raw criteria evaluation:", err);
    }
  };

  // Helper format relative wait time
  const getWaitDuration = (confirmedAt) => {
    if (!confirmedAt) return "-";
    const diffMs = new Date() - new Date(confirmedAt);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}j ${mins}m lalu`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Page Header & Live Operational Context Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Distribusi Rider
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      isConnected
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 animate-pulse"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    {isConnected ? "Live Socket.io" : "Offline Polling"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kelola antrean konfirmasi tugas, algoritma rekomendasi zona TOPSIS, dan penugasan operasional rider.
                </p>
              </div>
            </div>
          </div>

          {/* Time Context and Live Weather */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Weather Hub Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CloudSun className="w-4 h-4 text-amber-500" />
              <span>
                {hubWeather?.weather?.condition || "Cerah"} • {hubWeather?.weather?.temperature_c || 31}°C
              </span>
            </div>

            {/* Live Clock Chip */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentTimeStr || "Memuat waktu..."}</span>
            </div>

            {/* Refresh Button */}
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchOverview(true)}
              className={isRefreshing ? "animate-spin" : ""}
              title="Perbarui data antrean & zona"
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Decision Time Context Segmented Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Konteks Waktu Keputusan:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
            {TIME_CONTEXTS.map((ctx) => {
              const IconComp = ctx.icon;
              const isActive = timeContext === ctx.id;
              return (
                <button
                  key={ctx.id}
                  onClick={() => setTimeContext(ctx.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                  <span>{ctx.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Notification Banner if action performed */}
      {actionSuccessMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. Top KPI Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Antrean Tunggu (FIFO)"
          value={`${totalWaitingCount} Rider`}
          subtext="Siap bertugas di Hub Sidoarjo"
          trend={`${totalWaitingCount} antre`}
          trendDirection={totalWaitingCount > 0 ? "up" : "neutral"}
          icon={Users}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
        />
        <MetricCard
          title="Terploting (Plotted)"
          value={`${totalPlottedCount} Rider`}
          subtext="Menunggu klaim armada / check-in"
          trend={`${totalPlottedCount} dialokasikan`}
          trendDirection="up"
          icon={CheckCircle2}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
        />
        <MetricCard
          title="Sedang Operasional"
          value={`${totalOperatingCount} Rider`}
          subtext="Aktif berjualan di zona"
          trend={`${totalOperatingCount} bertugas`}
          trendDirection="up"
          icon={Activity}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
        />
        <MetricCard
          title="Kapasitas Tersedia"
          value={`${totalRemainingCapacity} / ${totalMaxCapacity} Slot`}
          subtext={`${zonesOverview.length} zona operasional aktif`}
          trend={`${Math.round((totalRemainingCapacity / (totalMaxCapacity || 1)) * 100)}% sisa`}
          trendDirection={totalRemainingCapacity > 0 ? "up" : "down"}
          icon={MapPin}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800"
        />
      </div>

      {/* 3. 3-Column Operational Workspace (Input 25% -> Decision 35% -> Output 40%) */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* KOLOM 1 (25% Width - lg:col-span-3): WAITING QUEUE (INPUT) */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    1. Waiting Queue
                  </h2>
                </div>
                <Badge variant="warning" size="sm">
                  {waitingQueue.length} Rider
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 mb-3">
                Antrean FIFO terkonfirmasi hadir di Hub Sidoarjo siap bertugas.
              </p>

              {/* Waiting Rider Cards List */}
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {waitingQueue.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">Tidak ada rider mengantre.</p>
                    <p className="text-[10px] text-slate-500">
                      Rider yang presensi di Hub akan otomatis masuk antrean di sini.
                    </p>
                  </div>
                ) : (
                  waitingQueue.map((rider, idx) => (
                    <div
                      key={rider.queue_id || rider.rider_id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-black shrink-0 border border-amber-300 dark:border-amber-700">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {rider.rider_name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {rider.rider_username || rider.rider_id}
                            </div>
                          </div>
                        </div>
                        <Badge variant="warning" size="xs">
                          FIFO #{idx + 1}
                        </Badge>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {getWaitDuration(rider.confirmed_at)}
                        </span>
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Send}
                          onClick={() => handleOpenManualAssign(rider)}
                          className="text-[10px] py-0.5 px-2"
                        >
                          Tugaskan
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* KOLOM 2 (35% Width - lg:col-span-4): RECOMMENDED ZONES (DECISION) */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    2. Rekomendasi Zona TOPSIS
                  </h2>
                </div>
                <Badge variant="primary" size="sm">
                  {overviewData?.model_version || "TOPSIS v1.0"}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 mb-3">
                Urutan zona terbaik berdasarkan perhitungan kriteria C1–C6 dan kapasitas terkini.
              </p>

              {/* Zone Cards Ordered by TOPSIS Rank */}
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {zonesOverview.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <MapPin className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">Tidak ada zona aktif terdeteksi.</p>
                  </div>
                ) : (
                  zonesOverview.map((zone) => {
                    const capacityPct = Math.round(
                      ((zone.assigned_count || 0) / (zone.max_capacity || 10)) * 100
                    );
                    const isFull = (zone.remaining_capacity || 0) <= 0;
                    const rank = zone.rank || 1;

                    return (
                      <div
                        key={zone.zone_id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          rank === 1
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm"
                            : rank <= 3
                            ? "bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                            : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70"
                        }`}
                      >
                        {/* Top Bar: Rank & Score */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                                rank === 1
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : rank === 2
                                  ? "bg-blue-600 text-white"
                                  : rank === 3
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-600 text-white"
                              }`}
                            >
                              Rank #{rank}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {zone.zone_name}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                              Ci: {parseFloat(zone.preference_score || 0).toFixed(4)}
                            </span>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            <span>
                              Terisi: {zone.assigned_count || 0} / {zone.max_capacity || 10} Slot
                            </span>
                            <span className={isFull ? "text-rose-600 font-bold" : "text-emerald-600"}>
                              {isFull ? "🛑 Penuh" : `Sisa ${zone.remaining_capacity} Slot`}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFull
                                  ? "bg-rose-500"
                                  : capacityPct >= 80
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, capacityPct)}%` }}
                            />
                          </div>
                        </div>

                        {/* Explainability Trigger Button */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {zone.zone_id}
                          </span>
                          <button
                            onClick={() => handleOpenExplainability(zone)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                          >
                            <Info className="w-3 h-3" />
                            <span>Mengapa C1–C6?</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* KOLOM 3 (40% Width - lg:col-span-5): ASSIGNMENT BOARD (OUTPUT) */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    3. Assignment Board
                  </h2>
                </div>
                <Badge variant="success" size="sm">
                  {allAssignedRiders.length} Aktif
                </Badge>
              </div>

              {/* Filters & Search */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: "ALL", label: `Semua (${allAssignedRiders.length})` },
                    { id: "PLOTTED", label: `Plotted (${totalPlottedCount})` },
                    { id: "OPERATING", label: `Operating (${totalOperatingCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setBoardFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        boardFilter === tab.id
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari rider, armada, atau zona..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Assignment Items List */}
              <div className="mt-3 space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredAssignedRiders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Activity className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">Tidak ada rider yang sesuai filter.</p>
                    <p className="text-[10px] text-slate-500">
                      Jalankan auto-distribusi atau tugaskan manual untuk mengisi board penugasan.
                    </p>
                  </div>
                ) : (
                  filteredAssignedRiders.map((r) => (
                    <div
                      key={r.rider_id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {r.name}
                            </span>
                            {r.armada_code && (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {r.armada_code}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{r.zone_name || "Zona Belum Ditentukan"}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <RiderStatusBadge status={r.status} size="xs" />
                          {r.topsis_rank && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Rank #{r.topsis_rank}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom row: Time & Change Action */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {r.checked_in_at
                            ? `Check-in: ${new Date(r.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
                            : r.duty_confirmed_at
                            ? `Presensi: ${new Date(r.duty_confirmed_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
                            : "Hari ini"}
                        </span>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpenManualAssign(r)}
                          className="text-[10px] py-0.5 px-2"
                        >
                          Pindahkan
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hidden sm:block">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>💡 {totalWaitingCount} Rider menunggu di Hub Sidoarjo</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Sisa Kapasitas: {totalRemainingCapacity} Slot
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Sistem perankingan otomatis memasangkan antrean FIFO ke peringkat TOPSIS tertinggi.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              size="sm"
              icon={Eye}
              onClick={() => setIsPreviewModalOpen(true)}
              disabled={totalWaitingCount === 0}
            >
              Preview Distribusi
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Play}
              onClick={() => setIsPreviewModalOpen(true)}
              disabled={totalWaitingCount === 0}
              className="shadow-md shadow-blue-500/20"
            >
              Eksekusi Distribusi Otomatis
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: DISTRIBUTION PREVIEW SIMULATION MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Simulasi Preview Distribusi Otomatis DSS"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500">
              {simulatedDistribution.filter((s) => s.isAssigned).length} dari {waitingQueue.length} rider akan diploting.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setIsPreviewModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                icon={Play}
                isLoading={isExecutingAction}
                onClick={handleExecuteAutoDistribute}
                disabled={simulatedDistribution.filter((s) => s.isAssigned).length === 0}
              >
                Konfirmasi & Eksekusi Sekarang
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Berikut adalah simulasi pemasangan rider dari antrean <strong>FIFO (First-In-First-Out)</strong> ke zona rekomendasi <strong>TOPSIS</strong> berdasarkan sisa kuota kapasitas aktif saat ini:
          </p>

          {/* Table of Simulated Assignments */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>No FIFO</TableHeaderCell>
                  <TableHeaderCell>Rider</TableHeaderCell>
                  <TableHeaderCell>Zona Sasaran (TOPSIS)</TableHeaderCell>
                  <TableHeaderCell>Prioritas Rank</TableHeaderCell>
                  <TableHeaderCell align="right">Status Ploting</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {simulatedDistribution.map((item) => (
                  <TableRow key={item.riderId}>
                    <TableCell>
                      <span className="font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        #{item.fifoNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white">{item.riderName}</div>
                      <div className="text-[10px] text-slate-400">{getWaitDuration(item.confirmedAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {item.targetZoneName}
                      </div>
                      {item.preferenceScore && (
                        <div className="text-[10px] text-emerald-600">
                          Ci: {parseFloat(item.preferenceScore).toFixed(4)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.topsisRank ? (
                        <Badge variant="primary" size="xs">
                          Rank #{item.topsisRank}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {item.isAssigned ? (
                        <Badge variant="success" size="xs">
                          ✓ Siap Ploting
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="xs">
                          ⚠️ Kuota Habis
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Capacity warning if unassigned exists */}
          {simulatedDistribution.some((s) => !s.isAssigned) && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong className="block font-bold">Peringatan Kapasitas Zona:</strong>
                Beberapa rider tidak mendapatkan alokasi zona karena total kapasitas zona aktif telah penuh. Rider tersebut akan tetap berstatus <em>WAITING</em> di Hub.
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: MANUAL ASSIGNMENT & SUPERVISOR OVERRIDE MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Penugasan Rider & Supervisor Override"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsManualModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              isLoading={isExecutingAction}
              onClick={handleExecuteManualAssign}
              disabled={!selectedRiderForAssign || !selectedTargetZoneId}
            >
              {isSelectedZoneAnOverride ? "Simpan dengan Catatan Override" : "Simpan Penugasan"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Rider Terpilih
            </label>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedRiderForAssign?.rider_name || selectedRiderForAssign?.name || "Pilih rider"}
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedRiderForAssign?.rider_id || selectedRiderForAssign?.id}
                </div>
              </div>
              <Badge variant="primary" size="xs">
                {selectedRiderForAssign?.status || "WAITING"}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Zona Sasaran
            </label>
            <select
              value={selectedTargetZoneId}
              onChange={(e) => setSelectedTargetZoneId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Zona Operasi --</option>
              {zonesOverview.map((z) => (
                <option
                  key={z.zone_id}
                  value={z.zone_id}
                  disabled={z.remaining_capacity <= 0}
                >
                  Rank #{z.rank}: {z.zone_name} (Sisa: {z.remaining_capacity} slot - Ci: {parseFloat(z.preference_score || 0).toFixed(3)})
                  {z.remaining_capacity <= 0 ? " [PENUH]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Supervisor Override Box if zone selected is not Rank #1 */}
          {isSelectedZoneAnOverride && (
            <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 space-y-3">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-bold">
                <ShieldAlert className="w-4 h-4 text-orange-600" />
                <span>Supervisor Override Terdeteksi (Zona di luar Rank #1)</span>
              </div>
              <p className="text-[11px] text-orange-700 dark:text-orange-400">
                Anda memilih zona dengan peringkat lebih rendah dari rekomendasi utama sistem. Harap cantumkan alasan override untuk keperluan audit trail.
              </p>

              <div>
                <label className="block font-bold text-orange-900 dark:text-orange-200 mb-1">
                  Kategori Alasan Override:
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Pilih Alasan Penugasan Khusus --</option>
                  {OVERRIDE_REASONS.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-orange-900 dark:text-orange-200 mb-1">
                  Catatan Tambahan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Misal: Penyesuaian karena ada bazar malam di lokasi..."
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: ZONE EXPLAINABILITY MODAL (C1-C6 BREAKDOWN) */}
      {/* ======================================================== */}
      <Modal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        title={`Penjelasan DSS TOPSIS: ${selectedZoneForExplain?.zone_name || "Detail Zona"}`}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsExplainModalOpen(false)}>
            Tutup
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-[11px] text-slate-400">Peringkat Model</div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                Rank #{selectedZoneForExplain?.rank || 1}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Skor Preferensi Kedekatan (Ci)</div>
              <div className="text-base font-black text-emerald-600 font-mono">
                {parseFloat(selectedZoneForExplain?.preference_score || 0).toFixed(4)}
              </div>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Algoritma TOPSIS menghitung nilai kedekatan relatif terhadap solusi ideal positif ($D^+$) dan solusi ideal negatif ($D^-$) berdasarkan 6 kriteria pembobotan BWM:
          </p>

          {/* 6 Criteria Bars */}
          <div className="space-y-3">
            {[
              { code: "C1", name: "Potensi Pasar & Skor Keramaian POI", weight: "28.5%", score: 88, color: "bg-emerald-500" },
              { code: "C2", name: "Aksesibilitas & Jaringan Jalan Utama", weight: "21.2%", score: 76, color: "bg-blue-500" },
              { code: "C3", name: "Historis Omset & Densitas Penjualan", weight: "19.8%", score: 82, color: "bg-indigo-500" },
              { code: "C4", name: "Kesesuaian Cuaca Lapangan (Rainfall)", weight: "15.4%", score: 90, color: "bg-cyan-500" },
              { code: "C5", name: "Kepadatan Penduduk & Perumahan", weight: "10.1%", score: 65, color: "bg-amber-500" },
              { code: "C6", name: "Tingkat Kompetitor Kopi Keliling (Cost)", weight: "5.0%", score: 80, color: "bg-purple-500" },
            ].map((c) => (
              <div key={c.code} className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <span>
                    <strong className="text-slate-900 dark:text-white mr-1">{c.code}:</strong> {c.name}
                  </span>
                  <span className="text-slate-400">Bobot {c.weight}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
            💡 <strong>Rekomendasi Algoritma:</strong> Zona ini diprioritaskan utama karena memiliki keunggulan tinggi pada kriteria <em>C1 (Keramaian POI)</em> dan <em>C4 (Kondisi Cuaca Cerah)</em> dengan tingkat kompetitor yang masih terkendali.
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 5. AUDIT TRAIL COLLAPSIBLE PANEL (P2 REQUIREMENT) */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <button
          onClick={() => setIsAuditTrailOpen(!isAuditTrailOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Riwayat Eksekusi Distribusi (Audit Trail)
            </span>
            <Badge variant="default" size="xs">
              {auditRuns.length} Rekaman
            </Badge>
          </div>
          {isAuditTrailOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isAuditTrailOpen && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>ID Eksekusi</TableHeaderCell>
                    <TableHeaderCell>Waktu</TableHeaderCell>
                    <TableHeaderCell>Metode</TableHeaderCell>
                    <TableHeaderCell>Eksekutor</TableHeaderCell>
                    <TableHeaderCell>Total Ploting</TableHeaderCell>
                    <TableHeaderCell>Kapasitas Cukup?</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <span className="text-slate-400 text-xs">Belum ada riwayat eksekusi tercatat.</span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            {run.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(run.created_at).toLocaleString("id-ID")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={run.execution_type === "AUTO" ? "primary" : "secondary"} size="xs">
                            {run.execution_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-slate-900 dark:text-white">
                            {run.executed_by_name || "Sistem Otomatis"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs text-emerald-600">
                            {run.total_assigned_riders} Rider
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={run.is_capacity_sufficient ? "success" : "warning"} size="xs">
                            {run.is_capacity_sufficient ? "✓ Cukup" : "⚠️ Kurang"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default DistributionPage;
