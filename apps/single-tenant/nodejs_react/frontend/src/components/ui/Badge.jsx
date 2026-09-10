import React from "react";
import { cn } from "../../lib/utils.js";

export function Badge({
  children,
  variant = "primary",
  size = "md",
  shape = "pill",
  withDot = false,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/60",
    success: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
    warning: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
    danger: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
    info: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60",
    neutral: "bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#334155]",
    secondary: "bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#334155]",
    outline: "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#334155]",
  };

  const dotColors = {
    primary: "bg-[#EA580C]",
    success: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    danger: "bg-[#EF4444]",
    info: "bg-[#3B82F6]",
    neutral: "bg-[#64748B] dark:bg-[#94A3B8]",
    secondary: "bg-[#64748B] dark:bg-[#94A3B8]",
    outline: "bg-[#94A3B8]",
  };

  const shapes = {
    pill: "rounded-full",
    rect: "rounded-[4px]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] leading-tight",
    md: "px-2.5 py-0.5 text-[11px] leading-tight",
    lg: "px-3 py-1 text-xs leading-tight font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border select-none transition-colors",
        variants[variant] || variants.primary,
        shapes[shape] || shapes.pill,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColors[variant] || dotColors.primary
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export const StatusBadge = Badge;

