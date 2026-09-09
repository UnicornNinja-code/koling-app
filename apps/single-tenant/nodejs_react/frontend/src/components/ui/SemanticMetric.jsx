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
  metric,
  valueOverride = null,
  unit = "",
  icon: Icon = null,
  badge = null,
  badgeVariant = "primary",
  trend = null, // { value: string|number, isPositive: boolean }
  subtext = null,
  className = "",
}) {
  // Determine display value based on semantic metadata
  let displayValue = "N/A";
  let isProtected = false;
  let isNoData = false;

  if (valueOverride !== null && valueOverride !== undefined) {
    displayValue = valueOverride;
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
        "bg-white p-4 rounded-[6px] border border-slate-200 space-y-2.5 transition-all hover:border-slate-300 text-slate-900 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
          {label}
        </span>
        {badge ? (
          <StatusBadge variant={badgeVariant} size="sm">
            {badge}
          </StatusBadge>
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
          {Icon && (
            <div className="w-8 h-8 rounded-[4px] bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200 shadow-2xs">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div
            className={cn(
              "text-xl md:text-2xl font-heading font-extrabold text-slate-900 tracking-tight leading-none",
              isProtected && "text-xs font-semibold text-slate-400 italic",
              isNoData && "text-lg text-slate-400"
            )}
          >
            {displayValue}
          </div>
        </div>

        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold",
              trend.isPositive ? "text-emerald-600" : "text-rose-600"
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

      {subtext && (
        <p className="text-[11px] text-slate-500 font-medium leading-tight">
          {subtext}
        </p>
      )}
    </div>
  );
}

// Alias export for StatCard
export const StatCard = SemanticMetric;
