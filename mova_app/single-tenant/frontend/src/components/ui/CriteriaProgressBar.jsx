import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA CriteriaProgressBar Component — Design System v3.0 SSOT
 * Exact match with Detail Zona in assets/img/map ops.png:
 * Displays labeled progress bar for DSS criteria (C1–C6)
 */
export function CriteriaProgressBar({
  code = "C1",
  name = "Densitas POI",
  value = 0.87,
  color = "emerald", // 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate'
  className = "",
}) {
  const percentage = Math.min(Math.max(value * 100, 0), 100);

  const colors = {
    emerald: {
      bar: "bg-[#10B981]",
      text: "text-[#10B981]",
    },
    blue: {
      bar: "bg-[#3B82F6]",
      text: "text-[#3B82F6]",
    },
    purple: {
      bar: "bg-[#8B5CF6]",
      text: "text-[#8B5CF6]",
    },
    amber: {
      bar: "bg-[#F59E0B]",
      text: "text-[#F59E0B]",
    },
    rose: {
      bar: "bg-[#F43F5E]",
      text: "text-[#F43F5E]",
    },
    slate: {
      bar: "bg-[#64748B]",
      text: "text-[#64748B]",
    },
  };

  const c = colors[color] || colors.emerald;

  return (
    <div className={cn("space-y-1.5 text-xs font-sans", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate">
          <span className={cn("font-mono font-bold", c.text)}>{code}</span>
          <span className="text-[#0F172A] dark:text-white font-medium truncate">{name}</span>
        </div>
        <span className="font-mono font-bold text-[#0F172A] dark:text-white shrink-0">
          {Number(value).toFixed(2)}
        </span>
      </div>

      <div className="h-1.5 w-full bg-slate-100 dark:bg-[#1E293B] rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", c.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default CriteriaProgressBar;
