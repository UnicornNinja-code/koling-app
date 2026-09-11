import React from "react";

/**
 * SummaryChip
 * Compact metric chip for panel headers & executive summaries.
 */
export function SummaryChip({
  label,
  value,
  subvalue,
  variant = "blue",
  icon: Icon,
  className = "",
}) {
  const variantStyles = {
    blue: "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/50 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400",
    slate: "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300",
  };

  const textStyles = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    slate: "text-slate-600 dark:text-slate-300",
  };

  return (
    <div
      className={`p-2 rounded-xl border flex flex-col justify-center transition-all ${
        variantStyles[variant] || variantStyles.slate
      } ${className}`}
    >
      <div className="flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3 shrink-0" />}
        <span className={`text-[10px] font-semibold ${textStyles[variant] || textStyles.slate}`}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-xs font-black text-slate-900 dark:text-white">
          {value}
        </span>
        {subvalue && (
          <span className={`text-[10px] font-bold ${textStyles[variant] || textStyles.slate}`}>
            {subvalue}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * SummaryChipGroup
 * Container grid for multiple summary chips.
 */
export function SummaryChipGroup({ children, cols = 2, className = "" }) {
  const colClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1";
  return (
    <div className={`grid ${colClass} gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
}

export default SummaryChip;

