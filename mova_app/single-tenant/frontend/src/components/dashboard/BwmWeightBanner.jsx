import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Sliders, Info } from "lucide-react";
import { dssService } from "../../services/dssService.js";

// Default criteria weights fallback if offline or no DB config yet
const DEFAULT_WEIGHTS = {
  C1: 0.382, // Potensi Pasar / Densitas POI
  C2: 0.224, // Diversitas Kategori POI
  C3: 0.165, // Keramaian Waktu
  C4: 0.112, // Risiko Cuaca
  C5: 0.076, // Jarak Geografis
  C6: 0.041, // Tingkat Persaingan Kompetitor
};

export function BwmWeightBanner({ className = "" }) {
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
          if (res.config.calculated_weights) {
            setWeights(res.config.calculated_weights);
          }
          if (res.config.consistency_ratio !== undefined) {
            setConsistencyRatio(res.config.consistency_ratio);
          }
        }
      } catch (err) {
        // Graceful fallback to default expert BWM weights
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

  // Format decimal weight into clean percentage string (e.g. 0.382 -> "38.2%")
  const formatWeightPct = (w) => {
    if (w === undefined || w === null || isNaN(w)) return "16.7%";
    return `${(parseFloat(w) * 100).toFixed(1)}%`;
  };

  const isConsistent = consistencyRatio <= 0.10;

  return (
    <div className={`p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 mb-3 space-y-2 select-none ${className}`}>
      {/* Header + Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Sliders className="w-3.5 h-3.5 text-blue-500" />
          <span>Konfigurasi Bobot BWM Aktif</span>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${
            isConsistent
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
          }`}
          title="Consistency Ratio BWM (CR <= 0.10 adalah konsisten)"
        >
          {isConsistent && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
          BWM Active (CR: {consistencyRatio.toFixed(3)})
        </span>
      </div>

      {/* Responsive Horizontal Criteria Weights Bar */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200/60 dark:border-slate-700/60">
        <div title="C1: Densitas POI (Benefit)">
          <span className="font-semibold text-slate-800 dark:text-slate-200">C1:</span>{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{formatWeightPct(weights.C1)}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">•</span>

        <div title="C2: Diversitas Kategori POI (Benefit)">
          <span className="font-semibold text-slate-800 dark:text-slate-200">C2:</span>{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{formatWeightPct(weights.C2)}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">•</span>

        <div title="C3: Keramaian Waktu (Benefit)">
          <span className="font-semibold text-slate-800 dark:text-slate-200">C3:</span>{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{formatWeightPct(weights.C3)}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

        <div title="C4: Risiko Cuaca / Hujan (Cost)">
          <span className="font-semibold text-slate-800 dark:text-slate-200">C4:</span>{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{formatWeightPct(weights.C4)}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">•</span>

        <div title="C5: Jarak Aksesibilitas (Cost)">
          <span className="font-semibold text-slate-800 dark:text-slate-200">C5:</span>{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{formatWeightPct(weights.C5)}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">•</span>

        <div title="C6: Tingkat Persaingan Kompetitor (Cost)">
          <span className="font-semibold text-slate-800 dark:text-slate-200">C6:</span>{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{formatWeightPct(weights.C6)}</span>
        </div>
      </div>
    </div>
  );
}

export default BwmWeightBanner;
