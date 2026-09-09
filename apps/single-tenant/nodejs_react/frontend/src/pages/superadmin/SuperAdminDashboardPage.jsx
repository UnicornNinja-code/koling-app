import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { HubWeatherControlCard } from "../../components/dashboard/HubWeatherControlCard.jsx";
import { Panel } from "../../components/ui/Panel.jsx";
import { SemanticMetric } from "../../components/ui/SemanticMetric.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ErrorFallbackBanner } from "../../components/ui/ErrorFallbackBanner.jsx";
import { MetricSkeleton, PanelSkeleton } from "../../components/ui/LoadingSkeleton.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { analyticsService } from "../../services/analyticsService.js";
import { dssService } from "../../services/dssService.js";
import { zoneService } from "../../services/zoneService.js";
import { weatherService } from "../../services/weatherService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { queryKeys } from "../../lib/queryKeys.js";
import { formatCurrency } from "../../lib/utils.js";
import {
  MapPin,
  Bike,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Scale,
  Sparkles,
  BarChart3,
  RotateCw,
  Clock,
  ShieldCheck,
} from "lucide-react";

const CRITERIA_METADATA = {
  C1: { name: "POI Density", type: "BENEFIT" },
  C2: { name: "POI Diversity", type: "BENEFIT" },
  C3: { name: "Time Crowd Density", type: "BENEFIT" },
  C4: { name: "Weather Index", type: "BENEFIT" },
  C5: { name: "Rider Distance", type: "COST" },
  C6: { name: "Competitor Density", type: "COST" },
};

export function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState("today");
  const [isExporting, setIsExporting] = useState(false);

  // 1. Analytics Overview Query (SSOT B-12)
  const {
    data: overviewRes,
    isLoading: loadingOverview,
    error: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: queryKeys.analytics.overview({ range }),
    queryFn: () => analyticsService.getOverview({ range: range === "today" ? undefined : range }),
  });

  // 2. Active BWM Configuration Query (SSOT DSS)
  const {
    data: bwmConfigRes,
    isLoading: loadingBwm,
    error: bwmError,
    refetch: refetchBwm,
  } = useQuery({
    queryKey: queryKeys.dss.active(),
    queryFn: dssService.getActiveDssConfig,
  });

  // 3. Operational Zones Query
  const {
    data: zonesRes,
    isLoading: loadingZones,
  } = useQuery({
    queryKey: queryKeys.zones.list(),
    queryFn: zoneService.getZones,
  });

  // 4. Hub Weather Query
  const {
    data: weatherRes,
  } = useQuery({
    queryKey: queryKeys.weather.byHub("Sidoarjo"),
    queryFn: () => weatherService.getHubWeather("Sidoarjo"),
  });

  const overviewData = overviewRes?.data || overviewRes || {};
  const operational = overviewData.operational || {};
  const compliance = overviewData.compliance || {};
  const sales = overviewData.sales || {};
  const dssEffectiveness = overviewData.dss_effectiveness || {};

  const zonesList = zonesRes?.zones || zonesRes?.data || [];
  const activeZonesCount = zonesList.filter((z) => z.status === "ACTIVE").length || zonesList.length;

  // Active BWM Weights Extraction
  const activeConfig = bwmConfigRes?.config || null;
  const rawWeights = activeConfig?.calculated_weights || {};
  const consistencyRatio = activeConfig?.consistency_ratio !== undefined ? Number(activeConfig.consistency_ratio) : null;
  const isConsistent = consistencyRatio !== null && consistencyRatio <= 0.1;

  const bwmWeightsList = Object.entries(rawWeights).map(([code, weight]) => {
    const numWeight = typeof weight === "number" ? weight : parseFloat(weight) || 0;
    return {
      code,
      name: CRITERIA_METADATA[code]?.name || code,
      weightPct: (numWeight * 100).toFixed(1),
      rawWeight: numWeight,
    };
  });

  // Export Daily Report Handler
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await analyticsService.exportDailyReport({ date: new Date().toISOString().split("T")[0] });
    } catch (err) {
      alert("Gagal mengunduh laporan CSV: " + (err?.message || "Kesalahan jaringan"));
    } finally {
      setIsExporting(false);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Fleet overview
  const fleetOverview = operational.fleet_overview || {};
  const totalFleet = fleetOverview.total_fleet_units || 0;
  const deployedFleet = fleetOverview.currently_deployed_units || 0;
  const fleetUtilityRate = fleetOverview.fleet_utilization_rate_pct?.value !== undefined
    ? fleetOverview.fleet_utilization_rate_pct.formatted
    : `${totalFleet > 0 ? ((deployedFleet / totalFleet) * 100).toFixed(1) : 0}%`;

  // Compliance summary
  const zoneComplianceMetric = compliance.telemetry_kpis?.zone_compliance_rate || null;

  // Sales summary
  const totalRevenueMetric = sales.summary?.total_revenue || null;

  // Plan-vs-Actual Breakdown for Volume / Accuracy Chart
  const rankBreakdown = dssEffectiveness.ranks_breakdown || [];
  const maxRevenue = Math.max(...rankBreakdown.map((r) => r.actual_revenue || 0), 1);

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Monitoring kecerdasan spasial DSS & performa operasional armada lapangan secara real-time."
    >
      {/* 1. Header Action Row: Compact Date Pill & Export CTA */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-neutral-900 tracking-tight">
            Ringkasan Operasional & Intelijen Spasial
          </h1>
          <p className="text-xs text-neutral-500 font-normal">
            Status real-time armada, kepatuhan geofence, dan rekomendasi TOPSIS hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>{currentDateFormatted}</span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            isLoading={isExporting}
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </Button>
        </div>
      </div>

      {/* Global Error Banner if API Fails */}
      {overviewError && (
        <div className="mb-6">
          <ErrorFallbackBanner
            title="Gagal Memuat Data Analitik Dashboard"
            error={overviewError}
            onRetry={refetchOverview}
          />
        </div>
      )}

      {/* 2. Top Hero Showcase Card (Matching Top Showcase Card in Lampiran 1) */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-5 mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left Column: Hub & Fleet Metadata (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-[4px] border border-primary-100">
                  ACTIVE HUB CONTROL
                </span>
                <span className="text-[10px] font-mono text-neutral-400">ID: HUB-SDA-01</span>
              </div>
              <h2 className="text-xl font-heading font-bold text-neutral-900 tracking-tight">
                Sidoarjo Hub Utama
              </h2>
              <p className="text-xs text-neutral-500">
                Pusat Kendali Armada & Distribusi Kopi Keliling • Sidoarjo, Jawa Timur
              </p>
            </div>

            {/* 4-Metric Grid (2x2) matching Lampiran 1 specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-neutral-100">
              <div>
                <span className="text-[10px] text-neutral-500 font-medium block">Armada Siap</span>
                <span className="text-lg font-heading font-bold text-neutral-900 mt-0.5 block">
                  {totalFleet} Units
                </span>
                <span className="text-[10px] text-neutral-400">Terdaftar di Hub</span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 font-medium block">Zonasi Aktif</span>
                <span className="text-lg font-heading font-bold text-neutral-900 mt-0.5 block">
                  {activeZonesCount} Zones
                </span>
                <span className="text-[10px] text-success-600 font-medium">Geofence Valid</span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 font-medium block">Utilisasi Armada</span>
                <span className="text-lg font-heading font-bold text-neutral-900 mt-0.5 block">
                  {fleetUtilityRate}
                </span>
                <span className="text-[10px] text-primary-600 font-medium">{deployedFleet} Unit Aktif</span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 font-medium block">Sesi Operasional</span>
                <span className="text-lg font-heading font-bold text-neutral-900 mt-0.5 block">
                  Shift Pagi
                </span>
                <span className="text-[10px] text-neutral-400">06:00 - 14:00 WIB</span>
              </div>
            </div>

            {/* Bottom License & Document Pills */}
            <div className="flex items-center gap-3 pt-1">
              <div className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded-[4px] font-mono text-xs font-bold text-neutral-800 tracking-wider">
                HUB-01-SDA
              </div>
              <span className="text-xs font-medium text-primary-600 hover:underline cursor-pointer">
                Dokumen SOP Operasional →
              </span>
            </div>
          </div>

          {/* Right Column: Live Weather & Environmental Snapshot (Col 5) */}
          <div className="lg:col-span-5 bg-neutral-50 rounded-[6px] p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> KONDISI CUACA & LINGKUNGAN
              </span>
              <span className="text-[10px] font-semibold text-success-700 bg-success-100 px-2 py-0.5 rounded-full">
                Normal Safe
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-2xl font-heading font-bold text-neutral-900">
                  {weatherRes?.temperature ? `${weatherRes.temperature}°C` : "31.0°C"}
                </span>
                <p className="text-xs text-neutral-600 font-medium mt-0.5">
                  {weatherRes?.weather_description || "Cerah Berawan"}
                </p>
                <p className="text-[10px] text-neutral-400">
                  Feels like {weatherRes?.feels_like ? `${weatherRes.feels_like}°C` : "34.0°C"} • Rain Prob: {weatherRes?.rain_probability ? `${weatherRes.rain_probability}%` : "10%"}
                </p>
              </div>

              <div className="text-right space-y-0.5 text-[11px]">
                <div className="text-neutral-600">
                  Kelembapan: <strong className="text-neutral-900 font-semibold">{weatherRes?.humidity ? `${weatherRes.humidity}%` : "65%"}</strong>
                </div>
                <div className="text-neutral-600">
                  Titik Embun: <strong className="text-neutral-900 font-semibold">23.5°C</strong>
                </div>
                <div className="text-neutral-600">
                  Jarak Pandang: <strong className="text-neutral-900 font-semibold">10.0 km</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between text-[10px] text-neutral-500">
              <span>Sensor PostGIS: Sidoarjo Barat</span>
              <span className="font-mono text-neutral-400">Update Tiap 15 Mnt</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Two-Column Operational & Intelligence Grid (Matching Lampiran 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Routes & TOPSIS Live Performance (Col 7 - matching Routes Card in Lampiran 1) */}
        <div className="lg:col-span-7 bg-white rounded-[6px] border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-semibold text-neutral-900">
              Routes & Rekomendasi TOPSIS
            </h3>
            <span className="text-xs font-medium text-neutral-500 hover:text-neutral-800 cursor-pointer">
              Riwayat Sesi
            </span>
          </div>

          {/* Active Operation Sub-banner */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-primary-600 tracking-wider uppercase">
              NOW ON THE WAY • ACTIVE SHIFT
            </span>
            <p className="text-xs font-bold text-neutral-900">
              ID: {rankBreakdown[0]?.zone_id ? `ZON-${rankBreakdown[0].zone_id.slice(0, 6)}` : "ZON-SDA-01"} • {rankBreakdown[0]?.zone_name || "Zona Alun-Alun Sidoarjo"}
            </p>
            <p className="text-[11px] text-neutral-500">
              Jl. Gubernur Suryo, Sidoarjo Alun-Alun Area
            </p>
          </div>

          {/* Mini Spatial Route / Map Visualization Container */}
          <div className="relative w-full h-32 bg-neutral-100 rounded-[6px] overflow-hidden border border-neutral-200 flex items-center justify-center">
            {/* Map Canvas Background Grid */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Simulated Clean Route Line */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 60 80 Q 180 25 320 60 T 540 40"
                fill="none"
                stroke="#1E293B"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
              <circle cx="60" cy="80" r="5" fill="#111111" />
              <circle cx="60" cy="80" r="2" fill="#FFFFFF" />
              <circle cx="320" cy="60" r="3.5" fill="#2563EB" />
              <circle cx="540" cy="40" r="6" fill="#2563EB" />
              <circle cx="540" cy="40" r="2.5" fill="#FFFFFF" />
            </svg>

            <div className="absolute bottom-2 right-2.5 bg-white/95 px-2 py-0.5 rounded-[4px] text-[10px] font-medium text-neutral-600 border border-neutral-200">
              Spatial Telemetry GPS
            </div>
          </div>

          {/* 4-Column Horizontal Summary Row matching Lampiran 1 */}
          <div className="grid grid-cols-4 gap-2 pt-1 border-b border-neutral-100 pb-3 text-center">
            <div>
              <span className="text-[10px] text-neutral-500 block">Jarak Rute</span>
              <span className="text-xs font-heading font-bold text-neutral-900 mt-0.5 block">0.62 km</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Estimasi Waktu</span>
              <span className="text-xs font-heading font-bold text-neutral-900 mt-0.5 block">10 min</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Rider Terploting</span>
              <span className="text-xs font-heading font-bold text-neutral-900 mt-0.5 block">
                {rankBreakdown[0]?.assigned_riders_count || 1} Rider
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Omzet Aktual</span>
              <span className="text-xs font-heading font-bold text-success-600 mt-0.5 block">
                {formatCurrency(rankBreakdown[0]?.actual_revenue || 0)}
              </span>
            </div>
          </div>

          {/* Past Route & Zone Performance Breakdown Table */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
              <span>Zona Rekomendasi TOPSIS</span>
              <span>Kepatuhan & Omzet</span>
            </div>

            <div className="divide-y divide-neutral-100 text-xs">
              {rankBreakdown.length === 0 ? (
                <div className="py-3 text-center text-neutral-400 text-xs">Belum ada rekap data sesi operasional.</div>
              ) : (
                rankBreakdown.slice(0, 4).map((r) => (
                  <div key={r.zone_id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-[3px] bg-neutral-100 text-neutral-700 font-bold text-[9px] flex items-center justify-center">
                          #{r.topsis_rank}
                        </span>
                        {r.zone_name}
                      </p>
                      <span className="text-[10px] text-neutral-400 block ml-5.5">
                        ID: {r.zone_id ? r.zone_id.slice(0, 8) : "ZON-SDA"} • {r.assigned_riders_count || 0} Rider
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-semibold text-success-600 block text-xs">
                        {formatCurrency(r.actual_revenue || 0)}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {r.compliance_rate_pct !== null ? `Kepatuhan ${r.compliance_rate_pct}%` : "No Telemetry"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Driver Statistics & Criteria Distribution (Col 5 - matching Driver Statistics in Lampiran 1) */}
        <div className="lg:col-span-5 bg-white rounded-[6px] border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-semibold text-neutral-900">
              Statistik Operasional & Kriteria DSS
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-[4px]">
              <span className="text-neutral-900 font-bold">W</span>
              <span>M</span>
              <span>6M</span>
              <span>Y</span>
            </div>
          </div>

          {/* Section 1: Multi-Segmented Progress Bar (AVERAGE TIME PER DAY BY CATEGORY) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                DISTRIBUSI BOBOT KRITERIA BWM (W*)
              </span>
              <StatusBadge variant={isConsistent ? "success" : "neutral"} size="sm">
                {consistencyRatio !== null ? `CR: ${consistencyRatio.toFixed(3)}` : "DEFAULT EQUAL"}
              </StatusBadge>
            </div>

            {/* Segmented Colorful Bar */}
            <div className="h-5 rounded-[4px] overflow-hidden flex items-center font-bold text-[10px] text-white">
              <div
                className="bg-[#818CF8] h-full flex items-center justify-center px-1 text-center transition-all"
                style={{ width: `${bwmWeightsList[0]?.weightPct || 39.7}%` }}
                title="C1 POI Density"
              >
                {bwmWeightsList[0]?.weightPct || 39.7}%
              </div>
              <div
                className="bg-[#2563EB] h-full flex items-center justify-center px-1 text-center transition-all"
                style={{ width: `${bwmWeightsList[1]?.weightPct || 28.3}%` }}
                title="C2 POI Diversity"
              >
                {bwmWeightsList[1]?.weightPct || 28.3}%
              </div>
              <div
                className="bg-[#F59E0B] h-full flex items-center justify-center px-1 text-center transition-all"
                style={{ width: `${bwmWeightsList[2]?.weightPct || 17.4}%` }}
                title="C3 Time Crowd"
              >
                {bwmWeightsList[2]?.weightPct || 17.4}%
              </div>
              <div
                className="bg-[#1E293B] h-full flex items-center justify-center px-1 text-center transition-all"
                style={{ width: `${bwmWeightsList[3]?.weightPct || 14.6}%` }}
                title="C4 Weather / Other"
              >
                {bwmWeightsList[3]?.weightPct || 14.6}%
              </div>
            </div>

            {/* Category Breakdown Table Rows */}
            <div className="space-y-1.5 pt-0.5 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#818CF8]" />
                  C1: POI Density (Benefit)
                </span>
                <span className="font-semibold text-neutral-900 text-xs">{bwmWeightsList[0]?.weightPct || 39.7}%</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#2563EB]" />
                  C2: POI Diversity (Benefit)
                </span>
                <span className="font-semibold text-neutral-900 text-xs">{bwmWeightsList[1]?.weightPct || 28.3}%</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#F59E0B]" />
                  C3: Time Crowd Density (Benefit)
                </span>
                <span className="font-semibold text-neutral-900 text-xs">{bwmWeightsList[2]?.weightPct || 17.4}%</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#1E293B]" />
                  C4: Weather Operational (Benefit)
                </span>
                <span className="font-semibold text-neutral-900 text-xs">{bwmWeightsList[3]?.weightPct || 14.6}%</span>
              </div>
            </div>
          </div>

          {/* Section 2: Working Time Chart per Day (Matching Lampiran 1 Working Time Chart) */}
          <div className="pt-3 border-t border-neutral-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                DURASI OPERASIONAL PER HARI (WORKING TIME)
              </span>
              <div className="bg-[#111111] text-white px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium">
                9/12/22 6 hr 32 min • Avg 8 hr 30 min
              </div>
            </div>

            {/* Dual Bar Chart Visualization */}
            <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1 border-b border-neutral-100">
              {[
                { actual: 65, avg: 85 },
                { actual: 50, avg: 75 },
                { actual: 78, avg: 82 },
                { actual: 95, avg: 80 },
                { actual: 40, avg: 70 },
                { actual: 88, avg: 85 },
                { actual: 72, avg: 80 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex items-end justify-center gap-1 h-full">
                  <div
                    className="w-2 bg-[#111111] rounded-t-[2px] hover:opacity-80 transition-all cursor-pointer"
                    style={{ height: `${bar.actual}%` }}
                    title={`Working Time: ${bar.actual}%`}
                  />
                  <div
                    className="w-2 bg-[#DBEAFE] rounded-t-[2px] hover:opacity-80 transition-all cursor-pointer"
                    style={{ height: `${bar.avg}%` }}
                    title={`Average Benchmark: ${bar.avg}%`}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-[2px] bg-[#111111]" /> Working Time
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-[2px] bg-[#DBEAFE]" /> Average Working Time
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
