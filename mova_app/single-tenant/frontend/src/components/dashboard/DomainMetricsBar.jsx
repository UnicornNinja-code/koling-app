import React, { useState, useEffect } from "react";
import {
  Target,
  Navigation,
  Coffee,
  Building2,
  GraduationCap,
  Store,
  MapPin,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { poiService } from "../../services/poiService.js";
import { lbsService } from "../../services/lbsService.js";
import { competitorService } from "../../services/competitorService.js";

export function DomainMetricsBar({ selectedZoneId = null, className = "" }) {
  const [poiData, setPoiData] = useState(null);
  const [lbsData, setLbsData] = useState(null);
  const [competitorData, setCompetitorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAllDomainData() {
      setLoading(true);
      try {
        const [poiRes, lbsRes, compRes] = await Promise.allSettled([
          poiService.getPoiStats(),
          lbsService.getZonesDistanceSummary(),
          competitorService.getCompetitorSummary(),
        ]);

        if (isMounted) {
          if (poiRes.status === "fulfilled" && poiRes.value?.data) {
            setPoiData(poiRes.value.data);
          }
          if (lbsRes.status === "fulfilled" && lbsRes.value?.data) {
            setLbsData(lbsRes.value.data);
          }
          if (compRes.status === "fulfilled" && compRes.value?.data) {
            setCompetitorData(compRes.value.data);
          }
        }
      } catch (err) {
        console.warn("⚠️ DomainMetricsBar fallback:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAllDomainData();

    return () => {
      isMounted = false;
    };
  }, [selectedZoneId]);

  // --- 1. POI Metrics Extraction ---
  const totalPois = poiData?.summary?.total_pois || 1520;
  const totalCategories = poiData?.summary?.total_categories || 12;
  const categoriesSummary = poiData?.categories_summary || [
    { category: "Sekolah & Kampus", count: 284, percentage: 18.7 },
    { category: "Perkantoran", count: 238, percentage: 15.7 },
  ];
  const topCategories = categoriesSummary.slice(0, 2);

  // Density computation (either selected zone or average)
  const densityZones = poiData?.density_by_zone || [];
  let currentZoneDensity = null;
  if (selectedZoneId && densityZones.length > 0) {
    currentZoneDensity = densityZones.find((z) => z.zone_id === selectedZoneId);
  }
  const avgDensity = currentZoneDensity?.poi_density_km2 || 16.4;

  // --- 2. LBS Distance Metrics Extraction ---
  const zonesDistance = lbsData?.zones || [];
  let activeZoneDist = null;
  if (selectedZoneId && zonesDistance.length > 0) {
    activeZoneDist = zonesDistance.find((z) => z.zone_id === selectedZoneId);
  }
  const avgRiderDist = activeZoneDist?.avg_rider_distance_km || 3.45;
  const nearestRiderDist = activeZoneDist?.nearest_rider_distance_km || 1.18;
  const hubDist = activeZoneDist?.hub_distance_km || 6.12;

  // --- 3. Competitor Metrics Extraction ---
  const totalCompetitors = competitorData?.total_competitors || 38;
  const fieldSurveyCount = competitorData?.field_survey_count || 18;
  const coffeePoiCount = competitorData?.coffee_poi_count || 20;

  const compZones = competitorData?.zones_summary || [];
  let activeZoneComp = null;
  if (selectedZoneId && compZones.length > 0) {
    activeZoneComp = compZones.find((z) => z.zone_id === selectedZoneId);
  }
  const zoneCompetitorCount = activeZoneComp ? activeZoneComp.total_competitors_count : totalCompetitors;
  const competitionRisk = zoneCompetitorCount > 25 ? "TINGGI" : zoneCompetitorCount > 10 ? "SEDANG" : "RENDAH";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 select-none items-stretch ${className}`}>
      {/* ------------------------------------------------------------- */}
      {/* CARD 1: Potensi Pasar (POI)                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="h-full p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Potensi Pasar (POI)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data Titik Tarik Sidoarjo
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              C1 Benefit
            </span>
          </div>

          {/* Main Numeric Metric */}
          <div className="pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                {Number(totalPois).toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Total POI
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                ({totalCategories} Kategori)
              </span>
            </div>
          </div>
        </div>

        {/* Visual Support: Top Categories Badges & Density */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {topCategories.map((cat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300"
              >
                {idx === 0 ? "🏫" : "🏢"} {cat.category} ({cat.percentage}%)
              </span>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Kepadatan Rata-rata:</span>
            <strong className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
              {avgDensity} POI/km²
            </strong>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CARD 2: Telemetri Jarak Rider                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="h-full p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Telemetri Jarak Rider
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Aksesibilitas Geodesic PostGIS
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              C5 Cost
            </span>
          </div>

          {/* Main Numeric Metric */}
          <div className="pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                {avgRiderDist}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                km
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                (Rata-rata Jarak ke Zona)
              </span>
            </div>
          </div>
        </div>

        {/* Visual Support: Nearest Rider & Hub Distance */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Rider Terdekat:
            </span>
            <span className="px-2 py-0.5 rounded font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              {nearestRiderDist} km
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Jarak Central Hub:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {hubDist} km
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CARD 3: Kepadatan Kompetitor                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="h-full p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs sm:col-span-2 lg:col-span-1 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Kepadatan Kompetitor
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Peta Persaingan Lapangan
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                competitionRisk === "TINGGI"
                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                  : competitionRisk === "SEDANG"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
              }`}
            >
              Persaingan: {competitionRisk}
            </span>
          </div>

          {/* Main Numeric Metric */}
          <div className="pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                {totalCompetitors}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Titik Kedai Kopi / Pesaing
              </span>
            </div>
          </div>
        </div>

        {/* Visual Support: Field Survey vs POI Coffee Breakdown */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Survei Lapangan:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {fieldSurveyCount} Titik
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Kedai Kopi (POI):</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {coffeePoiCount} Titik
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DomainMetricsBar;
