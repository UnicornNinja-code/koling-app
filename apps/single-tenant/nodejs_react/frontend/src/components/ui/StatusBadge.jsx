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
    primary: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    neutral: "bg-[#18181B] text-[#A1A1AA] border-[#24242A]",
    secondary: "bg-[#18181B] text-[#A1A1AA] border-[#24242A]",
  };

  const dotColors = {
    primary: "bg-[#ea580c]",
    success: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    danger: "bg-[#EF4444]",
    info: "bg-[#3B82F6]",
    neutral: "bg-[#71717A]",
    secondary: "bg-[#71717A]",
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

