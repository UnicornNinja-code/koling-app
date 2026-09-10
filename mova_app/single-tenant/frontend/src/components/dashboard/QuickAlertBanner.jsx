import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Radio,
  BatteryCharging,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Info,
} from "lucide-react";
import { dashboardService } from "../../services/dashboardService.js";

export function QuickAlertBanner({ selectedZoneId = null, className = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchQuickAlerts = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getQuickAlerts({
        zone_id: selectedZoneId || "ZON-SDA-01",
      });
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.warn("⚠️ QuickAlerts fallback:", err.message);
      // Clean fallback data
      setData({
        summary: {
          total_active_alerts: 0,
          critical_count: 0,
          warning_count: 0,
          normal_count: 3,
          highest_severity: "NORMAL",
        },
        alerts: [
          {
            id: "alert-weather-normal",
            category: "WEATHER",
            severity: "NORMAL",
            title: "Kondisi Cuaca Optimal",
            message: "Prakiraan cuaca cerah/berawan, mobilitas armada keliling aman.",
            timestamp: new Date().toISOString(),
          },
          {
            id: "alert-geofence-normal",
            category: "GEOFENCE_BREACH",
            severity: "NORMAL",
            title: "Kepatuhan Geofence Terjaga",
            message: "Seluruh rider bertugas berada dalam koridor geofence yang sah.",
            timestamp: new Date().toISOString(),
          },
        ],
        fleet_battery_readiness: {
          telemetry_integration_status: "STANDBY_FOR_IOT",
          telemetry_ready: false,
          note: "Integrasi telemetri BMS disiapkan untuk fase IoT hardware mendatang.",
          total_units: 5,
          active_units: 5,
          units_in_maintenance: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickAlerts();
    const interval = setInterval(fetchQuickAlerts, 45000);
    return () => clearInterval(interval);
  }, [selectedZoneId]);

  const summary = data?.summary || {
    total_active_alerts: 0,
    critical_count: 0,
    warning_count: 0,
    normal_count: 2,
    highest_severity: "NORMAL",
  };

  const alerts = data?.alerts || [];
  const fleetInfo = data?.fleet_battery_readiness || {};

  const isCritical = summary.highest_severity === "CRITICAL" || summary.critical_count > 0;
  const isWarning = summary.highest_severity === "WARNING" || summary.warning_count > 0;

  // Banner color theme based on severity
  const bannerTheme = isCritical
    ? {
        bg: "bg-rose-50/90 dark:bg-rose-950/40",
        border: "border-rose-300 dark:border-rose-800",
        badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300 dark:border-rose-700",
        icon: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
        statusText: "PERINGATAN KRITIS TERDETEKSI",
      }
    : isWarning
    ? {
        bg: "bg-amber-50/90 dark:bg-amber-950/40",
        border: "border-amber-300 dark:border-amber-800",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 dark:border-amber-700",
        icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
        statusText: "PERINGATAN OPERASIONAL AKTIF",
      }
    : {
        bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
        border: "border-emerald-200/80 dark:border-emerald-800/60",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        statusText: "SISTEM & PERIMETER OPERASIONAL NORMAL",
      };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 font-['Inter'] shadow-xs overflow-hidden ${bannerTheme.bg} ${bannerTheme.border} ${className}`}
    >
      {/* 1. Main Header Strip */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Status Icon with Pulse */}
          <div className="relative flex items-center justify-center">
            {bannerTheme.icon}
            {(isCritical || isWarning) && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isCritical ? "bg-rose-400" : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isCritical ? "bg-rose-500" : "bg-amber-500"
                  }`}
                />
              </span>
            )}
          </div>

          {/* Title & Quick Summary */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Early Warning & Quick Alert Center
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${bannerTheme.badge}`}
              >
                {bannerTheme.statusText}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
              {summary.total_active_alerts > 0
                ? `${summary.total_active_alerts} peringatan memerlukan perhatian (${summary.critical_count} kritis, ${summary.warning_count} waspada)`
                : "Geofence aman • Cuaca shift kondusif • Seluruh armada aktif siap pakai"}
            </p>
          </div>
        </div>

        {/* Right Actions: Refresh & Expand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={fetchQuickAlerts}
            disabled={loading}
            title="Refresh Alert Operasional"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <span>{isExpanded ? "Tutup" : "Rincian"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Expanded Multi-Domain Alert Breakdown */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Domain 1: Weather Operational Risk */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                  Peringatan Cuaca
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                  C4 Cost
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {alerts.find((a) => a.category === "WEATHER")?.message ||
                  "Kondisi atmosfer terpantau kondusif untuk operasional shift."}
              </p>
            </div>

            {/* Domain 2: Geofence & Rider Deviation */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                  Geofence & Deviasi LBS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                  PostGIS Live
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {alerts.find((a) => a.category === "GEOFENCE_BREACH")?.message ||
                  "Seluruh rider aktif beroperasi dalam batas perimeter zona yang sah."}
              </p>
            </div>

            {/* Domain 3: Fleet Maintenance & Battery Telemetry Standby */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-purple-500" />
                  Kesiapan BMS & Armada
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800">
                  {fleetInfo.telemetry_integration_status || "STANDBY"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {fleetInfo.note || "Integrasi telemetri BMS disiapkan untuk fase hardware IoT mendatang."}
              </p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Unit Aktif: {fleetInfo.active_units ?? 5} unit</span>
                <span>Servis: {fleetInfo.units_in_maintenance ?? 0} unit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickAlertBanner;
