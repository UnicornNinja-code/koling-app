import React, { useState, useEffect, useRef } from "react";
import { Info, CheckCircle2, Sliders, ChevronDown, ChevronUp, X } from "lucide-react";
import { dssService } from "../../services/dssService.js";

const DEFAULT_WEIGHTS = {
  C1: 0.382, // Potensi Pasar / Densitas POI
  C2: 0.224, // Diversitas Kategori POI
  C3: 0.165, // Keramaian Waktu
  C4: 0.112, // Risiko Cuaca
  C5: 0.076, // Jarak Geografis
  C6: 0.041, // Tingkat Persaingan Kompetitor
};

const CRITERIA_METADATA = [
  { code: "C1", name: "Potensi Pasar (Densitas POI)", type: "BENEFIT", color: "bg-blue-500" },
  { code: "C2", name: "Diversitas Kategori POI", type: "BENEFIT", color: "bg-indigo-500" },
  { code: "C3", name: "Keramaian Waktu Operasional", type: "BENEFIT", color: "bg-emerald-500" },
  { code: "C4", name: "Risiko Cuaca & Hujan", type: "COST", color: "bg-amber-500" },
  { code: "C5", name: "Jarak Aksesibilitas Centroid", type: "COST", color: "bg-orange-500" },
  { code: "C6", name: "Tingkat Persaingan Kompetitor", type: "COST", color: "bg-rose-500" },
];

export function BwmWeightTooltip({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [consistencyRatio, setConsistencyRatio] = useState(0.024);
  const popoverRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchBwmConfig() {
      try {
        const res = await dssService.getActiveDssConfig();
        if (isMounted && res && res.config) {
          if (res.config.calculated_weights) {
            setWeights(res.config.calculated_weights);
          }
          if (res.config.consistency_ratio !== undefined) {
            setConsistencyRatio(res.config.consistency_ratio);
          }
        }
      } catch (err) {
        if (isMounted) {
          setWeights(DEFAULT_WEIGHTS);
          setConsistencyRatio(0.024);
        }
      }
    }

    fetchBwmConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isConsistent = consistencyRatio <= 0.10;

  const formatWeightPct = (w) => {
    if (w === undefined || w === null || isNaN(w)) return "16.7%";
    return `${(parseFloat(w) * 100).toFixed(1)}%`;
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Small interactive Badge Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Klik untuk melihat rincian bobot preferensi BWM"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer shadow-2xs ${
          isConsistent
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/80"
            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/80"
        }`}
      >
        <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>BWM Active</span>
        <span className="text-[10px] font-medium opacity-80">(CR: {consistencyRatio.toFixed(3)})</span>
        {isOpen ? <ChevronUp className="w-3 h-3 opacity-60" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
      </button>

      {/* Floating Popover Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 font-['Inter']">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Bobot Kriteria BWM
                </div>
                <div className="text-[10px] text-slate-500">
                  Best-Worst Method Vektor Terbobot
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CR Status Indicator */}
          <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Consistency Ratio (CR):</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              {consistencyRatio.toFixed(4)} ({isConsistent ? "Konsisten" : "Perlu Penyesuaian"})
            </span>
          </div>

          {/* 6 Criteria Bars Breakdown */}
          <div className="mt-3 space-y-2 text-xs">
            {CRITERIA_METADATA.map((c) => {
              const weightVal = weights[c.code] !== undefined ? weights[c.code] : 0.167;
              const weightPct = parseFloat(weightVal) * 100;
              return (
                <div key={c.code} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{c.code}:</span>
                      {c.name}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {formatWeightPct(weightVal)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.color} transition-all duration-300`}
                      style={{ width: `${Math.min(weightPct * 2, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
            Preferensi ilmiah dikonfigurasi melalui modul DSS BWM.
          </div>
        </div>
      )}
    </div>
  );
}

export default BwmWeightTooltip;
