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
    primary: "bg-orange-50 text-orange-700 border-orange-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "bg-transparent text-slate-700 border-slate-300",
  };

  const dotColors = {
    primary: "bg-[#EA580C]",
    success: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    danger: "bg-[#EF4444]",
    info: "bg-[#3B82F6]",
    neutral: "bg-[#64748B]",
    secondary: "bg-[#64748B]",
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
        "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border select-none",
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
