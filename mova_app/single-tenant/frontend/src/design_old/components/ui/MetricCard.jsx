import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * MOVA Design System v3.0 Metric KPI Card
 * Features:
 * - Pastel Circular Icon container
 * - Mini Sparkline Trend Chart
 * - Semi-Bold 21px Numerical Value
 * - Highlighted Pill Badge for Trends
 * - Subtext with neat top divider
 */
export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = "text-blue-600 dark:text-blue-400",
  iconBg = "bg-blue-50/80 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/60",
  trend,
  trendDirection = "up", // 'up' | 'down' | 'neutral'
  trendText,
  subtext,
  sparkline = [12, 14, 13, 17, 16, 19, 22],
  sparklineColor = "#3B82F6",
  badgeText,
  badgeVariant = "success",
  className = "",
  onClick,
}) {
  // Generate simple SVG path from sparkline array
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;
  const points = sparkline
    .map((val, i) => {
      const x = (i / (sparkline.length - 1)) * 60;
      const y = 24 - ((val - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-[14px] p-4.5 shadow-2xs transition-all duration-200 ${
        onClick ? "hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md cursor-pointer" : ""
      } ${className}`}
    >
      {/* Top Header: Title & Pastel Circular Icon */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-full border shadow-2xs flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
          >
            {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4" />}
          </div>
        )}
      </div>

      {/* Main Value & Mini Sparkline Graph */}
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <div className="flex items-baseline gap-1.5 text-slate-900 dark:text-white">
          <span className="text-[21px] font-semibold tracking-tight leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          )}
        </div>

        {/* Mini SVG Sparkline */}
        {sparkline && sparkline.length > 1 && (
          <div className="w-16 h-6 shrink-0 opacity-80 select-none">
            <svg viewBox="0 0 60 26" className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke={
                  trendDirection === "up"
                    ? "#10B981"
                    : trendDirection === "down"
                    ? "#EF4444"
                    : sparklineColor
                }
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        )}

        {badgeText && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              badgeVariant === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : badgeVariant === "warning"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Subtext and High-Contrast Trend Pill */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
        {subtext && <span className="truncate font-medium">{subtext}</span>}
        {trend && (
          <div
            className={`flex items-center gap-1 font-bold ml-auto shrink-0 px-2 py-0.5 rounded-full border text-[11px] ${
              trendDirection === "up"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : trendDirection === "down"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30"
            }`}
          >
            {trendDirection === "up" && <TrendingUp className="w-3 h-3" />}
            {trendDirection === "down" && <TrendingDown className="w-3 h-3" />}
            {trendDirection === "neutral" && <Minus className="w-3 h-3" />}
            <span>{trend}</span>
            {trendText && <span className="font-normal opacity-80 ml-0.5">{trendText}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
