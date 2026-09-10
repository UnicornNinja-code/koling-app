import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA Badge Component — Design System v3.0 SSOT
 * Exact reference match from assets/img (dashboard.png, operational rider.png, dss.png):
 * - Status pills: Aktif, Dalam Tugas, Tersedia, Offline
 * - Ranking pills: Terbaik, Sangat Baik, Baik, Cukup
 * - Live Tracking badge with pulsating indicator
 */
export function Badge({
  children,
  variant = "primary", // 'primary' | 'orange' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' | 'live'
  size = "md",
  shape = "pill",
  withDot = false,
  className = "",
  ...props
}) {
  const variants = {
    // Primary / Blue (Dalam Tugas / Assigned / Active Filter)
    primary:
      "bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border-[#DBEAFE] dark:border-blue-900/50",
    tugas:
      "bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border-[#DBEAFE] dark:border-blue-900/50",

    // Accent Orange (MOVA Brand Accent / Highlight)
    orange:
      "bg-[#FFF7ED] dark:bg-orange-950/60 text-[#EA580C] dark:text-[#FB923C] border-[#FFEDD5] dark:border-orange-900/50",

    // Success / Green (Aktif / Terbaik / On Time / Compliant)
    success:
      "bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399] border-[#A7F3D0] dark:border-emerald-900/50",
    aktif:
      "bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399] border-[#A7F3D0] dark:border-emerald-900/50",
    terbaik:
      "bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399] border-[#A7F3D0] dark:border-emerald-900/50",

    // Warning / Amber (Tersedia / Cukup / Deviasi)
    warning:
      "bg-[#FFFBEB] dark:bg-amber-950/60 text-[#D97706] dark:text-[#FBBF24] border-[#FDE68A] dark:border-amber-900/50",
    tersedia:
      "bg-[#FFFBEB] dark:bg-amber-950/60 text-[#D97706] dark:text-[#FBBF24] border-[#FDE68A] dark:border-amber-900/50",
    cukup:
      "bg-[#FFFBEB] dark:bg-amber-950/60 text-[#D97706] dark:text-[#FBBF24] border-[#FDE68A] dark:border-amber-900/50",

    // Danger / Red (Offline / Terlambat / Alert)
    danger:
      "bg-[#FEF2F2] dark:bg-rose-950/60 text-[#DC2626] dark:text-[#F87171] border-[#FECACA] dark:border-rose-900/50",
    offline:
      "bg-[#FEF2F2] dark:bg-rose-950/60 text-[#DC2626] dark:text-[#F87171] border-[#FECACA] dark:border-rose-900/50",

    // Info / Sky
    info:
      "bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] border-[#BAE6FD] dark:border-sky-900/50",

    // Purple / POI
    purple:
      "bg-[#F3E8FF] dark:bg-purple-950/60 text-[#8B5CF6] dark:text-[#C084FC] border-[#DDD6FE] dark:border-purple-900/50",

    // Neutral
    neutral:
      "bg-[#F5F5F5] dark:bg-neutral-800 text-[#525252] dark:text-neutral-300 border-[#E5E5E5] dark:border-neutral-700",

    // Live Tracking Badge (Green with white text or pill)
    live:
      "bg-[#059669] text-white border-[#047857] shadow-2xs font-bold",
  };

  const dotColors = {
    primary: "bg-[#2563EB]",
    tugas: "bg-[#2563EB]",
    orange: "bg-[#EA580C]",
    success: "bg-[#10B981]",
    aktif: "bg-[#10B981]",
    terbaik: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    tersedia: "bg-[#F59E0B]",
    cukup: "bg-[#F59E0B]",
    danger: "bg-[#EF4444]",
    offline: "bg-[#EF4444]",
    info: "bg-[#0284C7]",
    purple: "bg-[#8B5CF6]",
    neutral: "bg-[#737373]",
    live: "bg-white animate-pulse",
  };

  const shapes = {
    pill: "rounded-full",
    rect: "rounded-[4px]",
  };

  const sizes = {
    xs: "px-1.5 py-0.5 text-[9px] leading-none",
    sm: "px-2 py-0.5 text-[10px] leading-tight font-medium",
    md: "px-2.5 py-0.5 text-[11px] leading-tight font-semibold",
    lg: "px-3 py-1 text-xs leading-tight font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold tracking-wide border select-none transition-colors",
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
      {variant === "live" && !withDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
      )}
      <span>{children}</span>
    </span>
  );
}

export const StatusBadge = Badge;
export default Badge;
