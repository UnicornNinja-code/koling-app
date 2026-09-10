import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * MOVA Design System v3.0 Metric KPI Card
 * Features:
 * - Icon container with soft-tinted background
 * - Large numerical value
 * - Label / Title
 * - Trend indicator (delta value, direction: up/down/neutral, text)
 * - Subtext (e.g., "dari 17 zona", "berdasarkan GPS & geofence")
 */
export function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600 dark:text-blue-400",
  iconBg = "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50",
  trend,
  trendDirection = "up", // 'up' | 'down' | 'neutral'
  trendText,
  subtext,
  badgeText,
  badgeVariant = "success",
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] p-5 shadow-xs transition-all duration-200 ${
        onClick ? "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-[8px] border flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {badgeText && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
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

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
        {subtext && <span className="truncate">{subtext}</span>}
        {trend && (
          <div
            className={`flex items-center gap-1 font-semibold ml-auto shrink-0 ${
              trendDirection === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trendDirection === "down"
                ? "text-red-600 dark:text-red-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {trendDirection === "up" && <TrendingUp className="w-3.5 h-3.5" />}
            {trendDirection === "down" && <TrendingDown className="w-3.5 h-3.5" />}
            {trendDirection === "neutral" && <Minus className="w-3.5 h-3.5" />}
            <span>{trend}</span>
            {trendText && <span className="font-normal text-slate-400 text-[11px] ml-0.5">{trendText}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
