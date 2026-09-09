import React from "react";
import { cn } from "../../lib/utils.js";
import { StatusBadge } from "./StatusBadge.jsx";

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
  subtext = null,
  className = "",
}) {
  // Determine display value based on semantic metadata
  let displayValue = "N/A";
  let isProtected = false;
  let isNoData = false;

  if (valueOverride !== null && valueOverride !== undefined) {
    displayValue = valueOverride;
  } else if (metric) {
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
        "bg-white p-3.5 rounded-[6px] border border-[#E5E5E5] space-y-2.5 transition-all hover:border-[#D4D4D4]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider truncate">
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
            <div className="w-7 h-7 rounded-[4px] bg-[#F5F5F5] text-[#111111] flex items-center justify-center shrink-0 border border-[#E5E5E5]">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <div
            className={cn(
              "text-xl font-heading font-bold text-[#111111] tracking-tight leading-none",
              isProtected && "text-xs font-semibold text-[#737373] italic",
              isNoData && "text-lg text-[#A3A3A3]"
            )}
          >
            {displayValue}
          </div>
        </div>
      </div>

      {subtext && (
        <p className="text-[11px] text-[#737373] font-medium leading-tight">
          {subtext}
        </p>
      )}
    </div>
  );
}
