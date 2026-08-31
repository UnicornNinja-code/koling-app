import React from "react";
import { cn } from "../../lib/utils.js";

export function StatusBadge({
  children,
  variant = "primary",
  size = "md",
  withDot = false,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-[#FF5052]/10 text-[#FF5052] border-[#FF5052]/20",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const dotColors = {
    primary: "bg-[#FF5052]",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
    neutral: "bg-slate-400",
    secondary: "bg-slate-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-[11px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border select-none",
        variants[variant] || variants.primary,
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

// Alias export for Badge
export const Badge = StatusBadge;
