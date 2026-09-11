import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Bike,
  Truck,
  ShieldCheck,
  BadgeDollarSign,
  TrendingUp,
  Sparkles,
  Compass,
  Layers,
  Droplets,
  Wind,
  Eye,
  RefreshCw,
  Clock,
  Radio,
  BarChart2,
  AlertTriangle,
  ArrowUpRight,
  Send,
  Award,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  MetricCard,
  Badge,
  StatusBadge,
  RiderStatusBadge,
  SummaryChip,
  SummaryChipGroup,
  Button,
  WeatherIcon,
  PageHeader,
} from "../../components/ui/index.js";
import { MOVAInteractiveMap } from "../../components/map/index.js";
import { QuickAlertBanner } from "../../components/dashboard/QuickAlertBanner.jsx";
import { WeatherTimelinePanel } from "../../components/dashboard/WeatherTimelinePanel.jsx";
import { BwmWeightTooltip } from "../../components/dashboard/BwmWeightTooltip.jsx";
import { BwmWeightBanner } from "../../components/dashboard/BwmWeightBanner.jsx";
import { DomainMetricsBar } from "../../components/dashboard/DomainMetricsBar.jsx";
import { distributionService } from "../../services/distributionService.js";
import { useDashboardRealtime } from "../../hooks/useDashboardRealtime.js";
import {
  MOCK_KPI,
  MOCK_WEATHER,
  MOCK_ZONES,
  MOCK_RIDERS,
} from "./mockData.js";

export function DashboardPage() {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState(MOCK_ZONES[0]);
  const [distributionData, setDistributionData] = useState(null);
  const [ridersSummary, setRidersSummary] = useState(null);
  const [loadingDistribution, setLoadingDistribution] = useState(false);
  const [activeRiders, setActiveRiders] = useState(MOCK_RIDERS);

  const fetchDashboardDistribution = useCallback(async () => {
    try {
      setLoadingDistribution(true);
      const [overviewRes, summaryRes] = await Promise.allSettled([
        distributionService.getOverview(),
        distributionService.getRidersSummary(),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value?.data) {
        setDistributionData(overviewRes.value.data);
      }
      if (summaryRes.status === "fulfilled" && summaryRes.value?.data) {
        setRidersSummary(summaryRes.value.data);
      }
    } catch (e) {
      // Fallback gracefully
    } finally {
      setLoadingDistribution(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardDistribution();
  }, [fetchDashboardDistribution]);

  // Real-Time Socket Connection & Live GPS Tracking
  const { isConnected } = useDashboardRealtime({
    onRiderMoved: (data) => {
      setActiveRiders((prev) =>
        prev.map((r) => {
          if (r.id === data.rider_id || r.name === data.rider_name) {
            return {
              ...r,
              lat: data.latitude,
              lng: data.longitude,
              latitude: data.latitude,
              longitude: data.longitude,
              speed: data.speed,
            };
          }
          return r;
        })
      );
    },
    onRiderAssigned: () => {
      fetchDashboardDistribution();
    },
    onRiderCheckedIn: () => {
      fetchDashboardDistribution();
    },
    onRiderCheckedOut: () => {
      fetchDashboardDistribution();
    },
    onGeofenceBreach: (data) => {
      setActiveRiders((prev) =>
        prev.map((r) => {
          if (r.id === data.rider_id || r.name === data.rider_name) {
            return { ...r, status: "DEVIATION" };
          }
          return r;
        })
      );
    },
  });

  // Hourly sales progression sparkline mock
  const hourlySales = [
    { hour: "08:00", cups: 18, pct: 35 },
    { hour: "10:00", cups: 36, pct: 70 },
    { hour: "12:00", cups: 52, pct: 100 },
    { hour: "14:00", cups: 28, pct: 54 },
    { hour: "16:00", cups: 44, pct: 85 },
    { hour: "18:00", cups: 39, pct: 75 },
    { hour: "20:00", cups: 24, pct: 46 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Consolidated Right-Aligned Status & Actions */}
      <PageHeader
        title="Dashboard Operasional & DSS"
        subtitle="Sistem Pendukung Keputusan Lokasi Penjualan Usaha Keliling — Sejuta Jiwa Cabang Sidoarjo"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Real-Time WebSocket Telemetry Status Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border shadow-2xs transition-all ${
                isConnected
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">Live Stream WebSocket Aktif</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sinkronisasi Polling Standar</span>
                </>
              )}
            </div>

            {/* Timestamp */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>10 Sep 2026 • 21:45 WIB</span>
            </span>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchDashboardDistribution()}
              loading={loadingDistribution}
            >
              Refresh Data
            </Button>
          </div>
        }
      />

      {/* ------------------------------------------------------------- */}
      {/* PANEL 1: Early Warning & Quick Alert Center Banner             */}
      {/* ------------------------------------------------------------- */}
      <QuickAlertBanner selectedZoneId={selectedZone.id} />

      {/* ------------------------------------------------------------- */}
      {/* BARIS 1: Top KPI Metric Cards (5 Columns)                     */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Slot 1: Penjualan Hari Ini (Focal Business Metric) */}
        <MetricCard
          title="Penjualan Hari Ini"
          value="Rp 2,45"
          unit="Jt"
          subtext="163 Transaksi Selesai"
          trend={MOCK_KPI.todaySales.trend}
          trendDirection="up"
          sparkline={[0.8, 1.2, 1.5, 1.8, 2.1, 2.3, 2.45]}
          icon={BadgeDollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800"
        />

        {/* Slot 2: Zona Aktif */}
        <MetricCard
          title="Zona Aktif"
          value={`${MOCK_KPI.activeZones.value}`}
          unit="Zona"
          subtext={`dari total ${MOCK_KPI.activeZones.total} zona`}
          trend="↑ 2"
          trendDirection="up"
          trendText="zona"
          sparkline={[10, 11, 10, 12, 11, 12, 12]}
          icon={MapPin}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800"
        />

        {/* Slot 3: Rider Aktif */}
        <MetricCard
          title="Rider Aktif"
          value={`${MOCK_KPI.activeRiders.value}`}
          unit="Rider"
          subtext={`dari total ${MOCK_KPI.activeRiders.total} rider`}
          trend="↑ 1"
          trendDirection="up"
          trendText="rider"
          sparkline={[6, 7, 7, 8, 7, 8, 8]}
          icon={Bike}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800"
        />

        {/* Slot 4: Armada Tersedia */}
        <MetricCard
          title="Armada Tersedia"
          value={`${MOCK_KPI.availableFleets.value}`}
          unit="Unit Ready"
          subtext={`dari total ${MOCK_KPI.availableFleets.total} armada`}
          trend="→ 0"
          trendDirection="neutral"
          trendText="unit"
          sparkline={[5, 6, 5, 5, 6, 5, 5]}
          icon={Truck}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800"
        />

        {/* Slot 5: Tingkat Kepatuhan */}
        <MetricCard
          title="Tingkat Kepatuhan"
          value={MOCK_KPI.complianceRate.value}
          subtext="akurasi GPS & geofence"
          trend={MOCK_KPI.complianceRate.trend}
          trendDirection="up"
          sparkline={[82, 84, 83, 85, 86, 88, 87]}
          icon={ShieldCheck}
          iconColor="text-orange-600 dark:text-orange-400"
          iconBg="bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BARIS 2: Prakiraan Cuaca Operasional (Full-Width Banner)       */}
      {/* ------------------------------------------------------------- */}
      <WeatherTimelinePanel
        zoneId={selectedZone.id}
        zoneName={selectedZone.name}
      />

      {/* ------------------------------------------------------------- */}
      {/* BARIS 3: Peta Spasial Real-Time (Kiri) + Rekomendasi TOPSIS (Kanan) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* GIS Live Map Canvas (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader
              title="Peta Operasi Spasial Real-Time"
              subtitle="Visualisasi poligon geofence zona, telemetri avatar GPS rider, dan sebaran POI Sidoarjo"
              action={
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Stream
                  </span>
                </div>
              }
            />
            <CardContent className="p-0 flex-1 min-h-[500px]">
              <MOVAInteractiveMap
                mode="dashboard"
                height="500px"
                zones={MOCK_ZONES}
                riders={activeRiders}
                selectedZoneId={selectedZone?.id}
                selectedZone={selectedZone}
                onZoneClick={(z) => setSelectedZone(z)}
                onClearZone={() => setSelectedZone(MOCK_ZONES[0])}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: TOPSIS Recommendation List with BWM Info Tooltip */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader
              title="Rekomendasi Zona TOPSIS"
              subtitle="Hasil evaluasi 6 multi-kriteria ilmiah"
              className="items-center"
              action={
                <div className="flex items-center gap-1.5">
                  <BwmWeightTooltip />
                  <button
                    type="button"
                    onClick={() => navigate("/dss")}
                    title="Buka Modul DSS & Evaluasi Rekomendasi"
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              }
            />
            <CardContent className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-[500px] scrollbar-thin">
              {MOCK_ZONES.slice(0, 5).map((zone) => {
                const isRank1 = zone.rank === 1;
                const isRank2 = zone.rank === 2;
                const isRank3 = zone.rank === 3;
                const isSelected = selectedZone.id === zone.id;

                // Subtle 3px left border accent
                const leftAccent = isRank1
                  ? "border-l-[3px] border-l-amber-500"
                  : isRank2
                  ? "border-l-[3px] border-l-slate-400"
                  : isRank3
                  ? "border-l-[3px] border-l-amber-700"
                  : "border-l-[3px] border-l-slate-200 dark:border-l-slate-700";

                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${leftAccent} ${
                      isSelected
                        ? "bg-blue-50/50 dark:bg-blue-950/40 border-blue-400/80 shadow-2xs"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Minimalist Rank Badge with Standard Emoji */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isRank1 ? (
                            <span className="text-base" title="Peringkat 1">🥇</span>
                          ) : isRank2 ? (
                            <span className="text-base" title="Peringkat 2">🥈</span>
                          ) : isRank3 ? (
                            <span className="text-base" title="Peringkat 3">🥉</span>
                          ) : (
                            <span className="w-5 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                              #{zone.rank}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {zone.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            POI: {zone.poiCount} • Rider: {zone.riderCount}/{zone.maxCapacity}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2 shrink-0">
                        <div className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                          {zone.score.toFixed(3)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedZone(zone);
                          }}
                          title="Fokuskan ke Peta"
                          className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Flat Solid Progress Bar (No Heavy Gradients or Glows) */}
                    <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${zone.score * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BARIS 4: Domain Metrics Bar (POI Stats, Jarak Rider, Kompetitor) */}
      {/* ------------------------------------------------------------- */}
      <DomainMetricsBar selectedZoneId={selectedZone.id} />

      {/* ------------------------------------------------------------- */}
      {/* BARIS 5: Konfigurasi Bobot BWM Aktif (C1 - C6 Breakdown & CR)  */}
      {/* ------------------------------------------------------------- */}
      <BwmWeightBanner />

      {/* ------------------------------------------------------------- */}
      {/* BARIS 6: Operasional Bottom Cards (3 Equal Balanced Columns)   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Distribusi Beban Shift */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title="Distribusi Beban Shift"
            subtitle="Keterisian kuota rider per zona operasi DSS"
            action={
              <div className="flex items-center gap-2">
                {distributionData?.total_remaining_capacity !== undefined ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold">
                    Sisa {distributionData.total_remaining_capacity} Slot
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => navigate("/distribution")}
                  title="Buka Manajemen Distribusi Armada"
                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            }
          />
          <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            {/* Executive Top Summary Chips */}
            {(() => {
              const zonesList = distributionData?.zones_overview || MOCK_ZONES;
              const totalCapacity = zonesList.reduce((acc, z) => acc + (z.max_capacity ?? z.maxCapacity ?? 10), 0) || 43;
              const totalAssigned = zonesList.reduce((acc, z) => acc + (z.assigned_count ?? z.riderCount ?? 0), 0) || 31;
              const occupancyPct = Math.round((totalAssigned / totalCapacity) * 100);
              const fullZonesCount = zonesList.filter(
                (z) => z.is_full || z.remaining_capacity === 0 || (z.assigned_count ?? z.riderCount ?? 0) >= (z.max_capacity ?? z.maxCapacity ?? 10)
              ).length;
              const totalZonesCount = zonesList.length;

              return (
                <SummaryChipGroup cols={2}>
                  <SummaryChip
                    label="Total Terisi"
                    value={`${totalAssigned}/${totalCapacity} Slot`}
                    subvalue={`(${occupancyPct}%)`}
                    variant="blue"
                  />
                  <SummaryChip
                    label="Zona Penuh / Kritis"
                    value={`${fullZonesCount}/${totalZonesCount} Zona`}
                    subvalue={fullZonesCount > 0 ? "Siaga" : "Optimal"}
                    variant={fullZonesCount > 0 ? "amber" : "emerald"}
                  />
                </SummaryChipGroup>
              );
            })()}

            {/* Zone list breakdown */}
            <div className="space-y-2.5 flex-1">
              {(distributionData?.zones_overview || MOCK_ZONES).slice(0, 4).map((z) => {
                const assigned = z.assigned_count ?? z.riderCount ?? 0;
                const maxCap = z.max_capacity ?? z.maxCapacity ?? 10;
                const pct = Math.min(100, Math.round((assigned / maxCap) * 100));

                return (
                  <div key={z.zone_id || z.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-slate-700 dark:text-slate-300 font-bold truncate">
                          {z.zone_name || z.name}
                        </span>
                        {z.rank && (
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            #{z.rank}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 font-semibold text-[11px] shrink-0">
                        {assigned}/{maxCap} ({pct}%)
                      </span>
                    </div>
                    {/* Visual Track Bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/70 dark:border-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 80
                            ? "bg-emerald-500"
                            : pct >= 50
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Telemetri & Status Plotting Rider */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title="Telemetri & Status Plotting Rider"
            subtitle="Monitoring antrean FIFO & status lapangan"
            action={
              <div className="flex items-center gap-2">
                {distributionData?.total_waiting_riders ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold">
                    {distributionData.total_waiting_riders} Menunggu
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => navigate("/rider/zone")}
                  title="Buka Halaman Operasional Rider"
                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            }
          />
          <CardContent className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
            {/* Executive Top Status Summary Chips (Horizontal Badges) */}
            {(() => {
              const totalRiders = ridersSummary?.total_riders ?? 12;
              const operating = ridersSummary?.operating ?? 8;
              const plotted = ridersSummary?.plotted ?? 2;
              const waiting = ridersSummary?.waiting_queue ?? (distributionData?.total_waiting_riders ?? 1);
              const deviated = ridersSummary?.deviated ?? 1;
              const unconfirmed = ridersSummary?.unconfirmed ?? 1;

              return (
                <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 text-[10px]">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                    Total: {totalRiders}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Aktif: {operating}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Plotted: {plotted}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Siap/FIFO: {waiting}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Deviasi: {deviated}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700">
                    Belum Hadir: {unconfirmed}
                  </span>
                </div>
              );
            })()}

            {/* Rider details list */}
            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[190px] scrollbar-thin">
              {/* 1. Waiting Queue Items if any */}
              {distributionData?.waiting_queue && distributionData.waiting_queue.length > 0
                ? distributionData.waiting_queue.slice(0, 2).map((wq, i) => (
                    <div
                      key={wq.queue_id || `wq-${i}`}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{wq.rider_name}</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            [FIFO #{i + 1}]
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Menunggu Plotting Hub
                        </div>
                      </div>
                      <div className="text-right">
                        <RiderStatusBadge status="WAITING" />
                      </div>
                    </div>
                  ))
                : null}

              {/* 2. Active & Plotted Riders */}
              {MOCK_RIDERS.slice(0, distributionData?.waiting_queue?.length ? 3 : 4).map((r, idx) => {
                const status = idx === 0 ? "ON_TIME" : idx === 1 ? "PLOTTED" : idx === 2 ? "DEVIATION" : "UNCONFIRMED";

                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {r.zoneName} • <span>{r.armadaCode}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <RiderStatusBadge status={status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Performa Penjualan */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title="Performa Penjualan"
            subtitle="Ringkasan omset shift berjalan"
            action={
              <button
                type="button"
                onClick={() => navigate("/reports/sales")}
                title="Buka Laporan Penjualan Lengkap"
                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            }
          />
          <CardContent className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
            {/* Executive Focal Total Omset Metric */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/40 dark:via-slate-800/60 dark:to-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  <BadgeDollarSign className="w-3 h-3" />
                  <span>Total Omset Shift</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  Rp 3.620.000
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  163 Trans
                </span>
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +18.2% vs target
                </div>
              </div>
            </div>

            {/* Secondary Metrics: Avg/Rider & Terlaris */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Avg / Rider</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Rp 452.500</div>
                </div>
                <Badge variant="success" size="sm">+14%</Badge>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">Terlaris</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white truncate">Kopi Susu</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  84 Cup
                </span>
              </div>
            </div>

            {/* Hourly Sales Sparkline Bar Visual */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5 text-blue-500" /> Tren Shift
                </span>
                <span className="font-bold text-blue-600">163 Trans</span>
              </div>
              <div className="grid grid-cols-7 gap-1 items-end h-8">
                {hourlySales.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 h-full justify-end" title={`${h.hour}: ${h.cups} cup`}>
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                      style={{ height: `${h.pct}%` }}
                    />
                    <span className="text-[8px] text-slate-400 font-medium">{h.hour.slice(0, 2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;

