import React, { useState } from "react";
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
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  MetricCard,
  Badge,
  StatusBadge,
  Button,
  WeatherIcon,
  PageHeader,
} from "../../components/ui/index.js";
import { MapView } from "../../components/map/MapView.jsx";
import { QuickAlertBanner } from "../../components/dashboard/QuickAlertBanner.jsx";
import { WeatherTimelinePanel } from "../../components/dashboard/WeatherTimelinePanel.jsx";
import { BwmWeightTooltip } from "../../components/dashboard/BwmWeightTooltip.jsx";
import { DomainMetricsBar } from "../../components/dashboard/DomainMetricsBar.jsx";
import {
  MOCK_KPI,
  MOCK_WEATHER,
  MOCK_ZONES,
  MOCK_RIDERS,
} from "./mockData.js";

export function DashboardPage() {
  const [selectedZone, setSelectedZone] = useState(MOCK_ZONES[0]);

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
            {/* Live Status Hub Sidoarjo Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sidoarjo Hub • LIVE</span>
            </div>

            {/* Sync Telemetry Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Sinkronisasi otomatis aktif</span>
            </div>

            {/* Timestamp */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>10 Sep 2026 • 21:45 WIB</span>
            </span>

            <Button variant="secondary" size="sm" icon={RefreshCw}>
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
              <MapView
                height="500px"
                zones={MOCK_ZONES}
                riders={MOCK_RIDERS}
                selectedZoneId={selectedZone.id}
                onZoneClick={(z) => setSelectedZone(z)}
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
              action={<BwmWeightTooltip />}
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
                        <div className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700">
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
      {/* BARIS 5: Operasional Bottom Cards (3 Equal Balanced Columns)   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Distribusi Beban Shift */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title="Distribusi Beban Shift"
            subtitle="Keterisian rider per zona operasi"
          />
          <CardContent className="p-4 space-y-3 flex-1">
            {MOCK_ZONES.slice(0, 4).map((z) => (
              <div key={z.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{z.name}</span>
                  <span className="text-slate-500 font-mono">
                    {z.riderCount}/{z.maxCapacity} ({z.capacityPct}%)
                  </span>
                </div>
                {/* Visual Track Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/70 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      z.capacityPct >= 80
                        ? "bg-emerald-500"
                        : z.capacityPct >= 50
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${z.capacityPct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 2: Telemetri Rider Terkini */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title="Telemetri Rider Terkini"
            subtitle="Status presensi dan pergerakan LBS"
          />
          <CardContent className="p-4 space-y-2.5 flex-1">
            {MOCK_RIDERS.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.zoneName} • <span className="font-mono">{r.armadaCode}</span>
                  </div>
                </div>
                <div className="text-right">
                  {r.status === "ON_TIME" ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                  ) : r.status === "DEVIATION" ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Deviasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Perjalanan
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 3: Performa Penjualan */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title="Performa Penjualan"
            subtitle="Ringkasan omset shift berjalan"
          />
          <CardContent className="p-4 space-y-3 flex-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Avg / Rider</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white font-mono">Rp 452.500</div>
                </div>
                <Badge variant="success" size="sm">+14%</Badge>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">Terlaris</div>
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
                <span className="font-mono font-bold text-blue-600">163 Trans</span>
              </div>
              <div className="grid grid-cols-7 gap-1 items-end h-8">
                {hourlySales.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 h-full justify-end" title={`${h.hour}: ${h.cups} cup`}>
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                      style={{ height: `${h.pct}%` }}
                    />
                    <span className="text-[8px] text-slate-400 font-mono">{h.hour.slice(0, 2)}</span>
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

