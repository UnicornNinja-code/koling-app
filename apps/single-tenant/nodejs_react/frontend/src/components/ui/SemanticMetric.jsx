import React from "react";
import { cn } from "../../lib/utils.js";
import { StatusBadge } from "./StatusBadge.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * MOVA Semantic Metric Card Component
 * Consumes backend SSOT metrics with strict preservation of NO_DATA, PROTECTED_ROLE, and valid 0 values.
 */
export function SemanticMetric({
  label,
  title,
  metric,
  value,
  valueOverride = null,
  unit = "",
  icon: Icon = null,
  iconClass = null,
  iconColor = null,
  badge = null,
  badgeVariant = "primary",
  trend = null, // { value: string|number, isPositive: boolean }
  trendBadge = null,
  trendType = "success",
  subtext = null,
  subtitle = null,
  pulseBadge = false,
  className = "",
}) {
  const finalLabel = label || title || "";
  const finalSubtext = subtext || subtitle || null;

  // Determine display value based on semantic metadata
  let displayValue = "N/A";
  let isProtected = false;
  let isNoData = false;

  if (valueOverride !== null && valueOverride !== undefined) {
    displayValue = valueOverride;
  } else if (value !== null && value !== undefined) {
    displayValue = value;
  } else if (metric !== null && metric !== undefined) {
    if (typeof metric === "object") {
      if (metric.formatted === "PROTECTED_ROLE" || metric.data_status === "PROTECTED_ROLE") {
        displayValue = "Protected";
        isProtected = true;
      } else if (metric.data_status === "NO_DATA" || metric.value === null || metric.value === undefined) {
        displayValue = metric.formatted || "N/A";
        isNoData = true;
      } else {
        displayValue = metric.formatted || `${metric.value}${metric.unit || unit || ""}`;
      }
    } else {
      displayValue = metric;
    }
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#131822] p-4 rounded-[6px] border border-slate-200 dark:border-[#1E293B] space-y-2.5 transition-colors hover:border-slate-300 dark:hover:border-[#334155] text-slate-900 dark:text-slate-100 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
          {finalLabel}
        </span>
        {badge ? (
          <StatusBadge variant={badgeVariant} size="sm">
            {badge}
          </StatusBadge>
        ) : trendBadge ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
              trendType === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                : trendType === "warning"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
            )}
          >
            {pulseBadge && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {trendBadge}
          </span>
        ) : isProtected ? (
          <StatusBadge variant="neutral" size="sm">
            SUPERVISOR
          </StatusBadge>
        ) : isNoData ? (
          <StatusBadge variant="neutral" size="sm">
            NO DATA
          </StatusBadge>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <div className="w-8 h-8 rounded-[4px] bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800/60 shadow-2xs">
              <Icon className="w-4 h-4" />
            </div>
          ) : iconClass ? (
            <div
              className={cn(
                "w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 shadow-2xs",
                iconColor || "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60"
              )}
            >
              <i className={cn(iconClass, "text-base")} />
            </div>
          ) : null}
          <div
            className={cn(
              "text-xl md:text-2xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-none",
              isProtected && "text-xs font-semibold text-slate-400 italic",
              isNoData && "text-lg text-slate-400 dark:text-slate-500"
            )}
          >
            {displayValue}
          </div>
        </div>

        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold",
              trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {finalSubtext && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
          {finalSubtext}
        </p>
      )}
    </div>
  );
}

// Alias export for StatCard
export const StatCard = SemanticMetric;

