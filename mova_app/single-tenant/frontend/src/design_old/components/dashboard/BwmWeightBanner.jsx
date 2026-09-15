import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Scale, ExternalLink } from "lucide-react";
import { dssService } from "../../services/dssService.js";

// Master criteria definitions with tailored contextual colors
const CRITERIA_DEFINITIONS = [
  {
    code: "C1",
    name: "Densitas di Tiap Zona",
    shortName: "Densitas POI",
    type: "Benefit",
    cardBg: "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700",
    barColor: "bg-blue-500",
    badgeBg: "bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  {
    code: "C2",
    name: "Diversitas POI d Tiap Zona",
    shortName: "Diversitas POI",
    type: "Benefit",
    cardBg: "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/60 hover:border-indigo-300 dark:hover:border-indigo-700",
    barColor: "bg-indigo-500",
    badgeBg: "bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  {
    code: "C3",
    name: "Skor Keramaian Berbasis Waktu",
    shortName: "Keramaian Berbasis Waktu",
    type: "Benefit",
    cardBg: "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-300 dark:hover:border-emerald-700",
    barColor: "bg-emerald-500",
    badgeBg: "bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  {
    code: "C4",
    name: "Peluang Hujan",
    shortName: "Peluang Hujan",
    type: "Cost",
    cardBg: "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60 hover:border-amber-300 dark:hover:border-amber-700",
    barColor: "bg-amber-500",
    badgeBg: "bg-amber-100/80 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  {
    code: "C5",
    name: "Jarak Tempuh dari Central Hub ke Zona",
    shortName: "Jarak dari Central Hub",
    type: "Cost",
    cardBg: "bg-orange-50/40 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/60 hover:border-orange-300 dark:hover:border-orange-700",
    barColor: "bg-orange-500",
    badgeBg: "bg-orange-100/80 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  },
  {
    code: "C6",
    name: "Tingkat Persaingan Kompetitor",
    shortName: "Kompetitor",
    type: "Cost",
    cardBg: "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-700",
    barColor: "bg-rose-500",
    badgeBg: "bg-rose-100/80 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
];

// Default expert weights fallback
const DEFAULT_WEIGHTS = {
  C1: 0.382,
  C2: 0.224,
  C3: 0.165,
  C4: 0.112,
  C5: 0.076,
  C6: 0.041,
};

export function BwmWeightBanner({ className = "" }) {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [consistencyRatio, setConsistencyRatio] = useState(0.024);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchBwmConfig() {
      setLoading(true);
      try {
        const res = await dssService.getActiveDssConfig();
        if (isMounted && res && res.config) {
          setConfig(res.config);
          const activeWeights = res.config.calculated_weights || res.config.weights;
          if (activeWeights) {
            setWeights(activeWeights);
          }
          if (res.config.consistency_ratio !== undefined && res.config.consistency_ratio !== null) {
            setConsistencyRatio(Number(res.config.consistency_ratio));
          }
        }
      } catch (err) {
        if (isMounted) {
          setWeights(DEFAULT_WEIGHTS);
          setConsistencyRatio(0.024);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBwmConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatWeightPct = (w) => {
    if (w === undefined || w === null || isNaN(w)) return "16.7%";
    return `${(parseFloat(w) * 100).toFixed(1)}%`;
  };

  const isConsistent = consistencyRatio <= 0.10;

  // Determine Best (C_B) and Worst (C_W) criteria dynamically from weights
  const sortedWeights = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const bestCriteriaCode = sortedWeights[0]?.[0] || "C1";
  const worstCriteriaCode = sortedWeights[sortedWeights.length - 1]?.[0] || "C6";

  const bestCriteriaDef = CRITERIA_DEFINITIONS.find((c) => c.code === bestCriteriaCode) || CRITERIA_DEFINITIONS[0];
  const worstCriteriaDef = CRITERIA_DEFINITIONS.find((c) => c.code === worstCriteriaCode) || CRITERIA_DEFINITIONS[5];

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs font-['Inter'] space-y-4 select-none ${className}`}
    >
      {/* 1. Header Section: Title, Subtitle with Simple Best/Worst text & CR Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-2xs shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Konfigurasi Bobot BWM Aktif
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                SSOT DSS Engine
              </span>
            </div>
            {/* Simple Subtitle with 👍🏼 and 👎🏼 indicators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {config?.name || "Standar Operasional Sidoarjo"}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <span>⭐</span>
                <span>Kriteria Terbaik: <strong>{bestCriteriaCode}</strong> ({bestCriteriaDef.shortName})</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <span>📛</span>
                <span>Kriteria Terburuk: <strong>{worstCriteriaCode}</strong> ({worstCriteriaDef.shortName})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Consistency Ratio (CR) Status Pill & Shortcut Button */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-2xs transition-all ${isConsistent
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              }`}
            title={`Consistency Ratio: ${consistencyRatio.toFixed(4)} (Syarat konsistensi BWM: CR <= 0.10)`}
          >
            {isConsistent ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span className="font-bold">
              {isConsistent ? "Model Valid & Konsisten" : "Konsistensi Perlu Penyesuaian"}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200">
              CR: {consistencyRatio.toFixed(4)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dss/bwm")}
            title="Buka Halaman Konfigurasi BWM & Matriks Pembobotan"
            className="p-1.5 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 6-Column Clean Criteria Breakdown Grid (C1 to C6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CRITERIA_DEFINITIONS.map((c) => {
          const rawWeight = weights[c.code] !== undefined ? weights[c.code] : 0.167;
          const weightNum = parseFloat(rawWeight);
          const weightPct = weightNum * 100;
          const isBenefit = c.type?.toUpperCase() === "BENEFIT";

          return (
            <div
              key={c.code}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 group shadow-2xs ${c.cardBg}`}
            >
              {/* Top Tag & Benefit/Cost Type Badge */}
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${c.badgeBg}`}>
                  {c.code}
                </span>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${isBenefit
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                    }`}
                >
                  {isBenefit ? "Benefit" : "Cost"}
                </span>
              </div>

              {/* Criteria Title */}
              <div>
                <div
                  className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  title={c.name}
                >
                  {c.shortName}
                </div>
                <div className="text-[10px] text-slate-400 truncate" title={c.name}>
                  {c.name}
                </div>
              </div>

              {/* Weight Value & Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                    {formatWeightPct(rawWeight)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-medium">
                    w*={weightNum.toFixed(3)}
                  </span>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-200/70 dark:bg-slate-700/70 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(weightPct * 2.2, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BwmWeightBanner;
