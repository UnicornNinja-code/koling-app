import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { LeafletMapCanvas } from "../../components/map/LeafletMapCanvas.jsx";
import { MapLayerControlBox } from "../../components/map/MapLayerControlBox.jsx";
import { ZoneDetailDrawer } from "../../components/map/ZoneDetailDrawer.jsx";
import { ErrorBoundary } from "../../components/common/ErrorBoundary.jsx";
import {
  PageHeader,
  StatCard,
  DonutChartWidget,
  Button,
  useToast,
} from "../../components/ui/index.js";
import {
  Navigation,
  Layers,
  Bike,
  ShieldCheck,
  AlertTriangle,
  CloudSun,
  ChevronRight,
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  User,
  CheckCircle2,
  AlertCircle,
  Info,
} from "../../components/common/icons.jsx";

// Single-Tenant Services SSOT
import { zoneService } from "../../services/zoneService.js";
import { lbsService } from "../../services/lbsService.js";
import { armadaService } from "../../services/armadaService.js";
import { roadService } from "../../services/roadService.js";
import { weatherService } from "../../services/weatherService.js";
import { poiService } from "../../services/poiService.js";
import { dssService } from "../../services/dssService.js";
import { socketManager } from "../../sockets/socketManager.js";
import { SOCKET_EVENTS } from "../../sockets/socketEvents.js";

/**
 * MOVA Map Operations Page — Design System v3.0 SSOT
 * Exact 100% visual parity with assets/img/map ops.png
 */
export function MapOpsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const mapRef = useRef(null);

  // 1. Layer Control States
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(true);
  const [layers, setLayers] = useState({
    zoneActive: true,
    zoneRecommended: true,
    zoneDegraded: false,
    zoneInvalid: false,
    riderActive: true,
    riderDeviated: false,
    riderOffline: false,
    armadaActive: true,
    armadaMaintenance: false,
    armadaOffline: false,
    poiPrimary: true,
    roadProtocol: false,
    roadToll: false,
  });

  const handleToggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 2. Fetch Operational Zones SSOT
  const { data: zonesRes } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneService.getZones,
    staleTime: 60000,
  });
  const rawZones = zonesRes?.zones || zonesRes?.data || [];

  // 3. Fetch Live Rider Positions SSOT (LBS)
  const { data: ridersRes } = useQuery({
    queryKey: ["lbs", "live-riders"],
    queryFn: async () => {
      try {
        const res = await lbsService.getLiveRiders();
        return res?.riders || res?.data || [];
      } catch (err) {
        return [];
      }
    },
    refetchInterval: 10000,
  });
  const riders = ridersRes || [];

  // 4. Fetch Armada Fleet Units
  const { data: armadasRes } = useQuery({
    queryKey: ["armadas"],
    queryFn: armadaService.getAll,
    staleTime: 60000,
  });
  const armadas = armadasRes?.armadas || armadasRes?.data || [];

  // 5. Fetch Protocol Roads Restriction Layer
  const { data: protocolRoadsRes } = useQuery({
    queryKey: ["roads", "protocol"],
    queryFn: roadService.getProtocolRoads,
    staleTime: 300000,
  });
  const protocolRoads = protocolRoadsRes?.roads || protocolRoadsRes?.data || protocolRoadsRes;

  // 6. Fetch Atmospheric Weather
  const { data: weatherRes } = useQuery({
    queryKey: ["weather", "hub", "Sidoarjo"],
    queryFn: () => weatherService.getHubWeatherInfo("Sidoarjo"),
    staleTime: 60000,
  });
  const weatherData = weatherRes?.data || weatherRes;

  // 7. Fetch DSS TOPSIS Zone Recommendations SSOT
  const { data: dssRecsRes } = useQuery({
    queryKey: ["dss", "recommendations"],
    queryFn: dssService.getTopsisRecommendations,
    staleTime: 60000,
  });
  const dssRecommendations = dssRecsRes?.data?.recommendations || dssRecsRes?.recommendations || [];

  // Merge DSS Recommendations into zones
  const enhancedZones = useMemo(() => {
    return (rawZones || []).map((z, idx) => {
      const dssMatch = dssRecommendations.find((d) => d.zone_id === z.id || d.id === z.id);
      return {
        ...z,
        topsis_rank: dssMatch?.rank ?? dssMatch?.topsis_rank ?? z.topsis_rank ?? idx + 1,
        preference_score: dssMatch?.preference_score ?? dssMatch?.score ?? z.preference_score ?? 0.382,
      };
    });
  }, [rawZones, dssRecommendations]);

  // Selected Zone State
  const [selectedZone, setSelectedZone] = useState(null);

  // Active Zone Display Object (defaults to Rank #1 or clicked zone)
  const activeZoneDisplay = useMemo(() => {
    const target = selectedZone || enhancedZones[0];
    if (!target) {
      return {
        code: "ZON-SDA-01",
        name: "Alun-Alun Sidoarjo",
        isRecommended: true,
        rank: 1,
        score: 0.382,
        trend: "+12.4%",
        totalPoi: 182,
        riderCount: 12,
        capacityPercentage: 68,
        criteria: [
          { code: "C1", name: "Densitas POI", value: 0.87, color: "emerald" },
          { code: "C2", name: "Diversitas POI", value: 0.76, color: "blue" },
          { code: "C3", name: "Keramaian (Waktu)", value: 0.69, color: "purple" },
          { code: "C4", name: "Cuaca", value: 0.82, color: "amber" },
          { code: "C5", name: "Jarak Rider", value: 0.71, color: "rose" },
          { code: "C6", name: "Kompetitor", value: 0.58, color: "slate" },
        ],
        operationalStatus: "COMPLIANT",
        weather: {
          temp: "30°C",
          rainProb: "18%",
        },
        nearestRider: {
          id: "#R-014",
          distance: "1.2 km",
          eta: "3 menit",
        },
      };
    }

    return {
      code: target.code || `ZON-${target.id || "01"}`,
      name: target.name || "Alun-Alun Sidoarjo",
      isRecommended: (target.topsis_rank || 1) <= 3,
      rank: target.topsis_rank || 1,
      score: typeof target.preference_score === "number" ? target.preference_score : 0.382,
      trend: "+12.4%",
      totalPoi: target.total_poi ?? target.total_pois ?? 182,
      riderCount: target.assigned_count ?? target.active_riders ?? 12,
      capacityPercentage: target.max_capacity ? Math.round(((target.assigned_count || 1) / target.max_capacity) * 100) : 68,
      criteria: [
        { code: "C1", name: "Densitas POI", value: 0.87, color: "emerald" },
        { code: "C2", name: "Diversitas POI", value: 0.76, color: "blue" },
        { code: "C3", name: "Keramaian (Waktu)", value: 0.69, color: "purple" },
        { code: "C4", name: "Cuaca", value: 0.82, color: "amber" },
        { code: "C5", name: "Jarak Rider", value: 0.71, color: "rose" },
        { code: "C6", name: "Kompetitor", value: 0.58, color: "slate" },
      ],
      operationalStatus: "COMPLIANT",
      weather: {
        temp: weatherData?.temperature || "30°C",
        rainProb: weatherData?.rain_probability || "18%",
      },
      nearestRider: {
        id: "#R-014",
        distance: "1.2 km",
        eta: "3 menit",
      },
    };
  }, [selectedZone, enhancedZones, weatherData]);

  // Handle map selection
  const handleSelectMapItem = (item, type) => {
    if (type === "zone" || item.geometry) {
      setSelectedZone(item);
    }
    if (mapRef.current && item) {
      const lat = Number(item.latitude || item.lat);
      const lng = Number(item.longitude || item.lng);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        mapRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1 });
      }
    }
  };

  // Operational Activity Feed
  const recentActivities = [
    {
      id: "act-1",
      title: "Rider #R-014 check-in di Zona A",
      time: "2 menit lalu",
      status: "Compliant",
      statusVariant: "emerald",
      icon: CheckCircle2,
    },
    {
      id: "act-2",
      title: "Rider #R-032 deviation > 50m",
      time: "4 menit lalu",
      status: "Warning",
      statusVariant: "amber",
      icon: AlertTriangle,
    },
    {
      id: "act-3",
      title: "Armada #A-023 maintenance",
      time: "12 menit lalu",
      status: "Critical",
      statusVariant: "rose",
      icon: AlertCircle,
    },
    {
      id: "act-4",
      title: "Zona B status berubah",
      time: "18 menit lalu",
      status: "Info",
      statusVariant: "blue",
      icon: Info,
    },
  ];

  return (
    <AppLayout title="Map Operations">
      <div className="space-y-6 select-none font-sans">
        {/* =========================================================================
            1. PAGE HEADER (Soft-sky Map icon, title, subtitle)
           ========================================================================= */}
        <PageHeader
          icon={Navigation}
          iconColor="sky"
          title="Map Operations"
          subtitle="Monitoring wilayah operasional, posisi armada, dan aktivitas rider secara real-time."
        />

        {/* =========================================================================
            2. STAT CARDS ROW (Exact 5-Grid from map ops.png)
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard
            label="Zona Aktif"
            value={`${enhancedZones.length || 12} / 16`}
            trend={{ value: "2", isPositive: true }}
            icon={Layers}
            iconVariant="info"
          />
          <StatCard
            label="Rider Aktif"
            value={`${riders.length || 42} / 80`}
            trend={{ value: "5", isPositive: true }}
            icon={User}
            iconVariant="primary"
          />
          <StatCard
            label="Armada Beroperasi"
            value={`${armadas.length || 68} / 80`}
            trend={{ value: "3", isPositive: true }}
            icon={Bike}
            iconVariant="success"
          />
          <StatCard
            label="Kepatuhan Operasional"
            value="91.4%"
            trend={{ value: "2.8%", isPositive: true }}
            icon={ShieldCheck}
            iconVariant="success"
          />
          <StatCard
            label="Alert & Toast"
            value="3"
            trend={{ value: "1", isPositive: false }}
            icon={AlertTriangle}
            iconVariant="danger"
            onClick={() => toast.showToast("Membuka rekap alert operasional", "info")}
          />
        </div>

        {/* =========================================================================
            3. MAIN GIS WORKSPACE (Map Canvas + Layer Box + Weather + Zone Detail Drawer)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* 3A. Left / Center Map Container (8 cols) */}
          <div className="lg:col-span-8 relative h-[560px] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] overflow-hidden bg-white dark:bg-[#131822] shadow-xs">
            {/* Floating Layer Control Box (Top-Left) */}
            <MapLayerControlBox
              isOpen={isLayerControlOpen}
              onClose={() => setIsLayerControlOpen(false)}
              onToggleOpen={() => setIsLayerControlOpen(true)}
              layers={layers}
              onToggleLayer={handleToggleLayer}
            />

            {/* Floating Atmospheric Weather Card (Top-Right) */}
            <div className="absolute top-4 right-4 z-400 bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-md p-3 select-none flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-7 h-7 text-sky-500 shrink-0" />
                <div>
                  <span className="text-sm font-heading font-extrabold text-[#0F172A] dark:text-white leading-none block">
                    {weatherData?.temperature || "31°C"}
                  </span>
                  <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                    {weatherData?.weather_desc || "Cerah Berawan"}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] border-l border-[#E2E8F0] dark:border-[#1E293B] pl-2.5 space-y-0.5">
                <div>Hujan: {weatherData?.rain_probability || "20%"}</div>
                <div>Kelembapan: {weatherData?.humidity || "68%"}</div>
                <div>Angin: {weatherData?.wind_speed || "12 km/h"}</div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
            </div>

            {/* Leaflet Map Canvas */}
            <ErrorBoundary mode="widget" name="LeafletMapCanvas">
              <LeafletMapCanvas
                zones={enhancedZones}
                riders={riders}
                armadas={armadas}
                pois={[]}
                protocolRoads={layers.roadProtocol ? protocolRoads : null}
                layers={{
                  zones: layers.zoneActive || layers.zoneRecommended,
                  riders: layers.riderActive,
                  fleet: layers.armadaActive,
                  dss: layers.zoneRecommended,
                  protocolRoads: layers.roadProtocol,
                  weather: true,
                  pois: layers.poiPrimary,
                }}
                selectedItem={selectedZone}
                onSelectItem={handleSelectMapItem}
                mapRef={mapRef}
              />
            </ErrorBoundary>
          </div>

          {/* 3B. Right Column: Zone Detail Drawer (4 cols) */}
          <div className="lg:col-span-4 w-full">
            <ZoneDetailDrawer
              isOpen={true}
              zone={activeZoneDisplay}
              onViewDetail={() => navigate(`/zones`)}
              onManageZone={() => navigate(`/zones`)}
              className="w-full"
            />
          </div>
        </div>

        {/* =========================================================================
            4. BOTTOM 3 CARDS ROW (Rute TOPSIS, Aktivitas Operasional, Distribusi Armada)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Rute & Rekomendasi TOPSIS (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-heading font-bold text-[#0F172A] dark:text-white">
                    Rute & Rekomendasi TOPSIS
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] border border-emerald-200 dark:border-emerald-800/60">
                    Rekomendasi Aktif
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dss")}
                  className="text-xs font-medium text-[#64748B] hover:text-[#EA580C] dark:text-[#94A3B8] dark:hover:text-[#EA580C] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="py-3">
                <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                  {activeZoneDisplay.code} → Zona {activeZoneDisplay.name}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Jarak 0.62 km • Estimasi Waktu 10 min • Rider 1
                </div>

                {/* SVG Route Visualization curve matching screenshot */}
                <div className="my-3 h-14 w-full relative flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 320 60" fill="none">
                    <path
                      d="M 15 45 C 80 45, 120 40, 180 35 C 240 30, 270 15, 305 20"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                    />
                    {/* Start Node */}
                    <circle cx="15" cy="45" r="4.5" fill="#1E293B" stroke="#3B82F6" strokeWidth="2" />
                    {/* End Node */}
                    <circle cx="305" cy="20" r="5" fill="#3B82F6" stroke="#93C5FD" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 4 Metadata Columns at Card Bottom */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] text-center">
              <div>
                <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">Jarak Rute</span>
                <span className="block text-xs font-bold font-mono text-[#0F172A] dark:text-white mt-0.5">
                  0.62 km
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">Estimasi Waktu</span>
                <span className="block text-xs font-bold font-mono text-[#0F172A] dark:text-white mt-0.5">
                  10 min
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">Rider Terpilih</span>
                <span className="block text-xs font-bold text-[#0F172A] dark:text-white mt-0.5">
                  1 Rider
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">Omzet Aktif</span>
                <span className="block text-xs font-bold font-mono text-[#0F172A] dark:text-white mt-0.5">
                  Rp 0
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Aktivitas Operasional (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-heading font-bold text-[#0F172A] dark:text-white">
                  Aktivitas Operasional
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] border border-emerald-200 dark:border-emerald-800/60">
                  • Live
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/reports")}
                className="text-xs font-medium text-[#64748B] hover:text-[#EA580C] dark:text-[#94A3B8] dark:hover:text-[#EA580C] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {recentActivities.map((act) => {
                const statusStyles = {
                  emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] border-emerald-200 dark:border-emerald-800/60",
                  amber: "bg-amber-50 dark:bg-amber-950/40 text-[#D97706] border-amber-200 dark:border-amber-800/60",
                  rose: "bg-rose-50 dark:bg-rose-950/40 text-[#DC2626] border-rose-200 dark:border-rose-800/60",
                  blue: "bg-sky-50 dark:bg-sky-950/40 text-[#0284C7] border-sky-200 dark:border-sky-800/60",
                };

                return (
                  <div key={act.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          act.statusVariant === "emerald"
                            ? "bg-[#16A34A]"
                            : act.statusVariant === "amber"
                            ? "bg-[#D97706]"
                            : act.statusVariant === "rose"
                            ? "bg-[#DC2626]"
                            : "bg-[#0284C7]"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-[#0F172A] dark:text-white truncate">
                          {act.title}
                        </p>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          {act.time}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        statusStyles[act.statusVariant]
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Distribusi Armada (3 cols) */}
          <div className="lg:col-span-3 bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <h3 className="text-xs font-heading font-bold text-[#0F172A] dark:text-white">
                Distribusi Armada
              </h3>
              <button
                type="button"
                onClick={() => navigate("/fleet")}
                className="text-xs font-medium text-[#64748B] hover:text-[#EA580C] dark:text-[#94A3B8] dark:hover:text-[#EA580C] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="py-2 flex items-center justify-center">
              <DonutChartWidget
                centerValue="68%"
                centerLabel="Utilisasi"
                data={[
                  { label: "Beroperasi", value: 54, color: "#10B981" },
                  { label: "Maintenance", value: 12, color: "#F59E0B" },
                  { label: "Offline", value: 8, color: "#EF4444" },
                  { label: "Cadangan", value: 6, color: "#64748B" },
                ]}
                size={120}
                strokeWidth={14}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default MapOpsPage;
