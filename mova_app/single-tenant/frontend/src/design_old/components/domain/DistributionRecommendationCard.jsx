import React from "react";
import { ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Badge } from "../ui/Badge.jsx";

export function DistributionRecommendationCard({
  recommendation = {},
  onApply = () => {},
  isApplying = false,
  className = "",
}) {
  const {
    id = "REC-01",
    title = "Rebalancing Siang Hari (Pukul 11:30 - 14:00)",
    reason = "Kepadatan POI perkantoran meningkat 40% di ZON-SDA-01, sementara ZON-SDA-04 mengalami penurunan permintaan.",
    source_zone = "ZON-SDA-04 (Taman Pinang)",
    target_zone = "ZON-SDA-01 (Alun-Alun Pusat)",
    riders_count = 2,
    expected_revenue_lift = "+18% Penjualan",
    confidence_score = "94%",
    transfers = [
      { rider_name: "Dedi Kurniawan", from: "ZON-SDA-04", to: "ZON-SDA-01", eta: "8 mnt" },
      { rider_name: "Eka Wahyuni", from: "ZON-SDA-04", to: "ZON-SDA-01", eta: "11 mnt" },
    ],
  } = recommendation;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[12px] border border-blue-200 dark:border-blue-900/50 p-5 shadow-xs font-['Inter'] relative overflow-hidden ${className}`}>
      {/* Subtle Top Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-orange-500 to-emerald-500" />

      {/* Title & Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[8px] bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{title}</span>
            </h4>
            <div className="text-[11px] text-slate-400">
              DSS AI Confidence: <span className="font-bold text-emerald-600 dark:text-emerald-400">{confidence_score}</span> • Estimasi Dampak: <span className="font-bold text-blue-600 dark:text-blue-400">{expected_revenue_lift}</span>
            </div>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
          DSS Recommendation
        </span>
      </div>

      {/* Description / Reason */}
      <p className="text-xs text-slate-600 dark:text-slate-300 my-3 leading-relaxed">
        {reason}
      </p>

      {/* Transfer Flow Visualizer */}
      <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 my-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Source Zone */}
          <div className="flex-1 text-center sm:text-left">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Zona Asal (Surplus)</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{source_zone}</div>
            <div className="text-[11px] text-red-500 font-semibold mt-0.5">-{riders_count} Rider</div>
          </div>

          {/* Transfer Arrow */}
          <div className="flex flex-col items-center px-4">
            <div className="text-[10px] font-bold text-slate-400 font-mono mb-1">REBALANCE</div>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Target Zone */}
          <div className="flex-1 text-center sm:text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Zona Tujuan (High Demand)</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{target_zone}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">+{riders_count} Rider</div>
          </div>
        </div>
      </div>

      {/* Recommended Rider Transfers List */}
      {transfers && transfers.length > 0 && (
        <div className="space-y-1.5 my-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Rider yang Disarankan Ditransfer:
          </div>
          {transfers.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs p-2 rounded-[6px] bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white">{item.rider_name}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Estimasi Tempuh: <span className="font-bold text-slate-700 dark:text-slate-300">{item.eta}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Perubahan penugasan akan dikirim langsung ke notifikasi rider.
        </div>
        <Button
          variant="accent"
          size="sm"
          icon={CheckCircle2}
          isLoading={isApplying}
          onClick={() => onApply(recommendation)}
        >
          Terapkan Rebalancing
        </Button>
      </div>
    </div>
  );
}

export default DistributionRecommendationCard;
