import React from "react";
import {
  X,
  Trophy,
  MapPin,
  Users,
  Gauge,
  CloudSun,
  Bike,
  ArrowUp,
  Info,
} from "lucide-react";
import { cn } from "../../lib/utils.js";
import { Button } from "../ui/Button.jsx";
import { CriteriaProgressBar } from "../ui/CriteriaProgressBar.jsx";
import { WeatherIcon } from "../ui/WeatherIcon.jsx";

/**
 * MOVA ZoneDetailDrawer Component — Design System v3.0 SSOT
 * Exact match with "Detail Zona" right-side panel in assets/img/map ops.png
 */
export function ZoneDetailDrawer({
  isOpen = true,
  onClose,
  zone = {
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
  },
  onViewDetail,
  onManageZone,
  className = "",
}) {
  if (!isOpen || !zone) return null;

  return (
    <div
      className={cn(
        "w-80 bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-lg",
        "flex flex-col select-none overflow-hidden transition-all duration-200",
        className
      )}
    >
      {/* 1. Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <span className="text-xs font-heading font-bold text-[#0F172A] dark:text-white">
          Detail Zona
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
        {/* 2. Recommendation Pill & Zone Code Title */}
        <div>
          {zone.isRecommended && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-[#D97706] border border-amber-200 dark:border-amber-800/60 mb-2">
              <Info className="w-3 h-3" />
              <span>Zona Rekomendasi</span>
            </div>
          )}

          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[#D97706] mt-0.5 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-tight">
                {zone.code}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {zone.name}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Rank, Score, Trend Row */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#1A2234] border border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-heading font-extrabold bg-amber-500 text-white shadow-xs">
              Rank #{zone.rank || 1}
            </span>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Skor{" "}
              <strong className="text-[#0F172A] dark:text-white font-mono">
                {typeof zone.score === "number" ? zone.score.toFixed(3) : zone.score}
              </strong>
            </span>
          </div>

          {zone.trend && (
            <div className="flex items-center gap-0.5 text-xs font-mono font-bold text-[#16A34A]">
              <ArrowUp className="w-3 h-3" />
              <span>{zone.trend}</span>
            </div>
          )}
        </div>

        {/* 4. Quick Stats (3 Columns) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A2234] border border-[#E2E8F0] dark:border-[#1E293B] text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold">
              <MapPin className="w-3 h-3" />
              <span>POI</span>
            </div>
            <div className="text-base font-heading font-extrabold text-[#0F172A] dark:text-white mt-0.5">
              {zone.totalPoi}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A2234] border border-[#E2E8F0] dark:border-[#1E293B] text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold">
              <Users className="w-3 h-3" />
              <span>Rider</span>
            </div>
            <div className="text-base font-heading font-extrabold text-[#0F172A] dark:text-white mt-0.5">
              {zone.riderCount}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A2234] border border-[#E2E8F0] dark:border-[#1E293B] text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold">
              <Gauge className="w-3 h-3" />
              <span>Kapasitas</span>
            </div>
            <div className="text-base font-heading font-extrabold text-[#0F172A] dark:text-white mt-0.5">
              {zone.capacityPercentage}%
            </div>
          </div>
        </div>

        {/* 5. Kriteria Utama Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
              Kriteria Utama
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
          </div>

          <div className="space-y-2.5">
            {zone.criteria?.map((item) => (
              <CriteriaProgressBar
                key={item.code}
                code={item.code}
                name={item.name}
                value={item.value}
                color={item.color}
              />
            ))}
          </div>
        </div>

        {/* 6. Status Operasional */}
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs">
          <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">
            Status Operasional
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            {zone.operationalStatus || "COMPLIANT"}
          </span>
        </div>

        {/* 7. Cuaca di Zona */}
        {zone.weather && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">
              Cuaca di Zona
            </span>
            <div className="flex items-center gap-1.5 font-medium text-[#0F172A] dark:text-white">
              <WeatherIcon condition={zone.weather.condition || zone.weather.label || "Cerah Berawan"} size={18} />
              <span>{zone.weather.temp}</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Hujan: {zone.weather.rainProb}
              </span>
            </div>
          </div>
        )}

        {/* 8. Nearest Rider */}
        {zone.nearestRider && (
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#1A2234] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-[#EA580C]" />
              <span className="font-semibold text-[#0F172A] dark:text-white">
                Rider {zone.nearestRider.id}
              </span>
            </div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              {zone.nearestRider.distance} • {zone.nearestRider.eta}
            </span>
          </div>
        )}
      </div>

      {/* 9. Action Buttons */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#1A2234]/50 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetail}
          className="w-full text-xs font-semibold"
        >
          Lihat Detail
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onManageZone}
          className="w-full text-xs font-semibold bg-[#EA580C] hover:bg-[#C2410C] text-white"
        >
          Kelola Zona
        </Button>
      </div>
    </div>
  );
}

export default ZoneDetailDrawer;
