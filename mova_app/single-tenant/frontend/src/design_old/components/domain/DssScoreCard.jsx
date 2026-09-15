import React from "react";
import { Award, TrendingUp, Sliders, ChevronRight, BarChart3, Info } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { Button } from "../ui/Button.jsx";

export function DssScoreCard({
  zone = {},
  rank = 1,
  onInspect = () => {},
  onReassign = () => {},
  className = "",
}) {
  const {
    id = "ZON-SDA-01",
    name = "Alun-Alun Sidoarjo & Pusat Kota",
    code = "ZON-SDA-01",
    ci_score = 0.823,
    status = "TERBAIK",
    rank_change = "+0",
    recommendation = "Alokasi 3-4 Rider untuk jam makan siang dan sore.",
    criteria_breakdown = [
      { code: "C1", name: "Densitas POI", score: 0.87, weight: "0.26" },
      { code: "C2", name: "Diversitas POI", score: 0.76, weight: "0.19" },
      { code: "C3", name: "Keramaian Jam Operasi", score: 0.84, weight: "0.22" },
      { code: "C4", name: "Kesesuaian Cuaca", score: 0.82, weight: "0.14" },
      { code: "C5", name: "Jarak Hub ke Zona", score: 0.71, weight: "0.11" },
      { code: "C6", name: "Kepadatan Kompetitor", score: 0.58, weight: "0.08" },
    ],
  } = zone;

  const getRankBadgeColor = (r) => {
    if (r === 1) return "bg-amber-500 text-white shadow-amber-500/20";
    if (r === 2) return "bg-slate-400 text-white";
    if (r === 3) return "bg-amber-700 text-white";
    return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
  };

  const getScoreColor = (val) => {
    if (val >= 0.8) return "text-emerald-600 dark:text-emerald-400";
    if (val >= 0.65) return "text-blue-600 dark:text-blue-400";
    if (val >= 0.5) return "text-amber-600 dark:text-amber-400";
    return "text-red-500";
  };

  const getBarColor = (val) => {
    if (val >= 0.8) return "bg-emerald-500";
    if (val >= 0.65) return "bg-blue-500";
    if (val >= 0.5) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 p-5 shadow-xs font-['Inter'] hover:border-blue-300 dark:hover:border-blue-700 transition-all ${className}`}>
      {/* Top Bar: Rank, Zone Name & Status */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center font-extrabold text-sm shadow-xs ${getRankBadgeColor(rank)}`}>
            #{rank}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {name}
            </h4>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {code || id} • Rank Change: <span className="font-bold text-emerald-600 dark:text-emerald-400">{rank_change}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Skor Preferensi (Ci)</div>
          <div className={`text-2xl font-black ${getScoreColor(ci_score)}`}>
            {typeof ci_score === "number" ? ci_score.toFixed(3) : ci_score}
          </div>
        </div>
      </div>

      {/* Criteria Breakdown Grid */}
      <div className="my-4 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Kriteria BWM (C1-C6)</span>
          <span>Skor Ternormalisasi</span>
        </div>

        <div className="space-y-2">
          {criteria_breakdown.map((crit) => (
            <div key={crit.code} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px] font-mono">{crit.code}</span>
                  <span>{crit.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">(w: {crit.weight})</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {typeof crit.score === "number" ? crit.score.toFixed(2) : crit.score}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(crit.score)} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(crit.score) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Advice & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug flex-1">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Rekomendasi: </span>
          {recommendation}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" icon={Info} onClick={() => onInspect(zone)}>
            Detail
          </Button>
          <Button variant="accent" size="sm" onClick={() => onReassign(zone)}>
            Tugaskan Rider
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DssScoreCard;
