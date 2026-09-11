import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Radio,
  Scale,
  BrainCircuit,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { dashboardService } from "../../services/dashboardService.js";

// Comprehensive realistic mock scenarios for user preview
const MOCK_ALERT_SCENARIOS = {
  active_alerts: {
    summary: {
      total_active_alerts: 2,
      critical_count: 1,
      warning_count: 1,
      normal_count: 1,
      highest_severity: "CRITICAL",
    },
    alerts: [
      {
        id: "alert-geofence-003",
        category: "GEOFENCE_BREACH",
        severity: "CRITICAL",
        title: "Deviasi Geofence Terdeteksi",
        subtext: "PostGIS LBS • Rider Rian Hidayat (ARM-003)",
        message:
          "Rider terdeteksi 350m di luar batas radius poligon Kawasan Delta Plaza & GOR Sidoarjo. Disarankan verifikasi posisi rute.",
        timestamp: "Baru saja",
        actionLabel: "Lihat di Peta",
      },
      {
        id: "alert-weather-c4",
        category: "WEATHER",
        severity: "WARNING",
        title: "Potensi Hujan Shift Siang",
        subtext: "Kriteria C4 Cost • Peluang Hujan 45%",
        message:
          "Prakiraan hujan ringan-sedang pada slot 13:00 - 15:00 di Alun-Alun Sidoarjo. Siapkan kanopi/terpal pelindung motor keliling.",
        timestamp: "5 mnt lalu",
        actionLabel: "Cek Timeline",
      },
      {
        id: "alert-dss-ready",
        category: "DSS_VALIDATION",
        severity: "NORMAL",
        title: "Kesiapan Model DSS Terverifikasi",
        subtext: "BWM Optimal • CR: 0.0240 ≤ 0.10",
        message:
          "Bobot perbandingan berpasangan BWM valid & konsisten. 6/6 kriteria terisi lengkap untuk kalkulasi TOPSIS.",
        timestamp: "Aktif",
        actionLabel: "Audit BWM",
      },
    ],
    dss_validation_status: {
      is_configured: true,
      is_consistent: true,
      consistency_ratio: 0.024,
      cr_threshold: 0.10,
      active_config_name: "Standar Operasional Sidoarjo",
      criteria_count: 6,
      required_criteria_count: 6,
      decision_matrix_ready: true,
      evaluated_zones_count: 12,
      note: "Konfigurasi BWM konsisten (CR ≤ 0.10). 6/6 kriteria terisi & matriks keputusan siap dieksekusi.",
    },
  },
  normal: {
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
        subtext: "Atmosfer Kondusif",
        message: "Prakiraan cuaca cerah/berawan, mobilitas armada keliling aman.",
        timestamp: "Hari Ini",
      },
      {
        id: "alert-geofence-normal",
        category: "GEOFENCE_BREACH",
        severity: "NORMAL",
        title: "Kepatuhan Geofence Terjaga",
        subtext: "100% In-Bounds",
        message: "Seluruh rider bertugas berada dalam koridor geofence yang sah.",
        timestamp: "Hari Ini",
      },
      {
        id: "alert-dss-normal",
        category: "DSS_VALIDATION",
        severity: "NORMAL",
        title: "Status Model DSS Siap",
        subtext: "CR: 0.0240",
        message: "BWM konsisten dan seluruh kriteria terisi lengkap.",
        timestamp: "Hari Ini",
      },
    ],
    dss_validation_status: {
      is_configured: true,
      is_consistent: true,
      consistency_ratio: 0.024,
      cr_threshold: 0.10,
      active_config_name: "Standar Operasional Sidoarjo",
      criteria_count: 6,
      required_criteria_count: 6,
      decision_matrix_ready: true,
      evaluated_zones_count: 12,
      note: "Seluruh kriteria (C1-C6) aktif dan matriks perankingan 12 zona siap pakai.",
    },
  },
};

export function QuickAlertBanner({ selectedZoneId = null, className = "" }) {
  const [data, setData] = useState(MOCK_ALERT_SCENARIOS.active_alerts);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [previewMode, setPreviewMode] = useState("active_alerts"); // 'active_alerts' | 'normal'

  const fetchQuickAlerts = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getQuickAlerts({
        zone_id: selectedZoneId || "ZON-SDA-01",
      });
      if (res && res.data && res.data.summary?.total_active_alerts !== undefined) {
        if (res.data.summary.total_active_alerts > 0) {
          setData(res.data);
        } else {
          setData(MOCK_ALERT_SCENARIOS[previewMode]);
        }
      } else {
        setData(MOCK_ALERT_SCENARIOS[previewMode]);
      }
    } catch (err) {
      setData(MOCK_ALERT_SCENARIOS[previewMode]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(MOCK_ALERT_SCENARIOS[previewMode]);
  }, [previewMode]);

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
  const dssInfo = data?.dss_validation_status || {};

  // Per-domain status calculation for distinct high-contrast visual indicators
  const weatherAlert = alerts.find((a) => a.category === "WEATHER");
  const isWeatherWarning = weatherAlert?.severity === "WARNING" || weatherAlert?.severity === "CRITICAL";

  const geofenceAlert = alerts.find((a) => a.category === "GEOFENCE_BREACH");
  const isGeofenceCritical = geofenceAlert?.severity === "CRITICAL" || geofenceAlert?.severity === "WARNING";

  const isDssWarning = !dssInfo.is_consistent || (dssInfo.criteria_count && dssInfo.criteria_count < 6);

  const isCritical = summary.highest_severity === "CRITICAL" || summary.critical_count > 0;
  const isWarning = summary.highest_severity === "WARNING" || summary.warning_count > 0;

  // Banner color theme based on overall severity
  const bannerTheme = isCritical
    ? {
      bg: "bg-rose-50/90 dark:bg-rose-950/40",
      border: "border-rose-300 dark:border-rose-800",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300 dark:border-rose-700",
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
      statusText: "Peringatan Kritis Terdeteksi",
    }
    : isWarning
      ? {
        bg: "bg-amber-50/90 dark:bg-amber-950/40",
        border: "border-amber-300 dark:border-amber-800",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 dark:border-amber-700",
        icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
        statusText: "PERINGATAN OPERASIONAL AKTIF",
      }
      : {
        bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
        border: "border-emerald-200/80 dark:border-emerald-800/60",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        statusText: "Sistem & Parameter Operasional Aman",
      };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 font-['Inter'] shadow-xs overflow-hidden ${bannerTheme.bg} ${bannerTheme.border} ${className}`}
    >
      {/* 1. Clean Main Header Strip */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Status Icon */}
          <div className="relative flex items-center justify-center p-1 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
            {bannerTheme.icon}
            {(isCritical || isWarning) && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCritical ? "bg-rose-400" : "bg-amber-400"
                    }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${isCritical ? "bg-rose-500" : "bg-amber-500"
                    }`}
                />
              </span>
            )}
          </div>

          {/* Title & Clean Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white font-['Inter']">
                Early Warning & Quick Alert Center
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${bannerTheme.badge}`}
              >
                {bannerTheme.statusText}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate font-['Inter']">
              {summary.total_active_alerts > 0
                ? `${summary.total_active_alerts} peringatan memerlukan perhatian (${summary.critical_count} kritis, ${summary.warning_count} waspada) • Alun-Alun & Delta Plaza`
                : "Geofence aman • Cuaca shift kondusif • Model DSS BWM-TOPSIS konsisten & siap eksekusi"}
            </p>
          </div>
        </div>

        {/* Right Actions: Clean Mock Switcher & Expand */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Quick Mock Mode Switcher */}
          <div className="flex items-center p-0.5 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold font-['Inter']">
            <button
              type="button"
              onClick={() => setPreviewMode("active_alerts")}
              className={`px-2 py-0.5 rounded-[5px] transition-colors cursor-pointer ${previewMode === "active_alerts"
                ? "bg-rose-500 text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              Simulasi Alert ({MOCK_ALERT_SCENARIOS.active_alerts.summary.total_active_alerts})
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("normal")}
              className={`px-2 py-0.5 rounded-[5px] transition-colors cursor-pointer ${previewMode === "normal"
                ? "bg-emerald-600 text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              Normal
            </button>
          </div>

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
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs font-['Inter']"
          >
            <span>{isExpanded ? "Tutup" : "Rincian"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Expanded Clean Multi-Domain Alert Breakdown */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 space-y-3 font-['Inter']">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Domain 1: Weather Operational Risk */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    Peringatan Cuaca
                  </span>
                  {/* Simple Clean Indicator Dot (🟡 if warning, 🟢 if safe) */}
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${isWeatherWarning ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                        }`}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isWeatherWarning ? "C4 Cost" : "Aman"}
                    </span>
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {weatherAlert?.title || "Kondisi Cuaca Optimal"}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {weatherAlert?.message || "Kondisi atmosfer terpantau kondusif untuk operasional shift."}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">
                  {weatherAlert?.subtext || "Sidoarjo Hub"}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer">
                  Timeline Cuaca →
                </span>
              </div>
            </div>

            {/* Domain 2: Geofence & Rider Deviation */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-rose-500" />
                    Geofence & Deviasi LBS
                  </span>
                  {/* Simple Clean Indicator Dot (🔴 if critical deviation, 🟢 if safe) */}
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${isGeofenceCritical ? "bg-rose-500 animate-ping" : "bg-emerald-500"
                        }`}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isGeofenceCritical ? "PostGIS Live" : "Aman"}
                    </span>
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {geofenceAlert?.title || "Kepatuhan Perimeter Terjaga"}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {geofenceAlert?.message ||
                    "Seluruh rider aktif beroperasi dalam batas perimeter zona yang sah."}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">
                  {geofenceAlert?.subtext || "Perimeter Terjaga"}
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer">
                  Lihat di Peta →
                </span>
              </div>
            </div>

            {/* Domain 3: DSS Validation & BWM Consistency Status */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-purple-500" />
                    Validasi & Kesiapan DSS
                  </span>
                  {/* Simple Clean Indicator Dot (🟢 if consistent/safe, 🟡 if warning) */}
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${isDssWarning ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                        }`}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">
                      CR: {dssInfo.consistency_ratio ? dssInfo.consistency_ratio.toFixed(4) : "0.0240"}
                    </span>
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {dssInfo.is_consistent
                    ? "Bobot BWM Konsisten (CR ≤ 0.10)"
                    : "Konsistensi BWM Perlu Penyesuaian"}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {dssInfo.note || "6/6 Kriteria aktif & matriks keputusan TOPSIS siap dieksekusi."}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">
                  {dssInfo.criteria_count || 6}/6 Kriteria Terisi
                </span>
                <Link
                  to="/dss/bwm"
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Audit BWM →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickAlertBanner;
