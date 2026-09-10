import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA Avatar Component — Design System v3.0 SSOT
 * Matches reference designs in assets/img/ (dashboard.png, operational rider.png):
 * - Circular avatar with photo image or fallback initials
 * - Status dot indicator (online/aktif: green, busy/tugas: blue, warning/tersedia: amber, offline: red)
 * - Sizes: xs (20px), sm (24px), md (32px), lg (40px), xl (48px)
 */
export function Avatar({
  src,
  alt = "User Avatar",
  fallback = "SA",
  name,
  size = "md",
  status = null, // 'online' | 'busy' | 'warning' | 'offline' | null
  variant = "primary", // 'primary' | 'neutral' | 'success' | 'warning' | 'purple' | 'orange'
  className = "",
  imageClassName = "",
  ...props
}) {
  const [imageError, setImageError] = React.useState(false);

  // Compute initials if name is provided and fallback is default
  const displayFallback = React.useMemo(() => {
    if (fallback && fallback !== "SA") return fallback;
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return fallback || "SA";
  }, [name, fallback]);

  const sizes = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm font-semibold",
    xl: "w-12 h-12 text-base font-bold",
  };

  const statusDotSizes = {
    xs: "w-1.5 h-1.5 bottom-0 right-0 ring-1",
    sm: "w-2 h-2 bottom-0 right-0 ring-1.5",
    md: "w-2.5 h-2.5 bottom-0 right-0 ring-2",
    lg: "w-3 h-3 bottom-0.5 right-0.5 ring-2",
    xl: "w-3.5 h-3.5 bottom-0.5 right-0.5 ring-2",
  };

  const statusColors = {
    online: "bg-[#10B981]",    // Green / Aktif
    active: "bg-[#10B981]",
    busy: "bg-[#2563EB]",      // Blue / Dalam Tugas
    tugas: "bg-[#2563EB]",
    warning: "bg-[#F59E0B]",   // Amber / Tersedia
    tersedia: "bg-[#F59E0B]",
    offline: "bg-[#EF4444]",   // Red / Offline
  };

  const variantColors = {
    primary: "bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border-[#DBEAFE] dark:border-blue-900/50",
    neutral: "bg-[#F5F5F5] dark:bg-neutral-800 text-[#525252] dark:text-neutral-300 border-[#E5E5E5] dark:border-neutral-700",
    dark: "bg-[#111827] text-white border-neutral-700",
    success: "bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#10B981] dark:text-[#34D399] border-[#A7F3D0] dark:border-emerald-900/50",
    warning: "bg-[#FFFBEB] dark:bg-amber-950/60 text-[#D97706] dark:text-[#FBBF24] border-[#FDE68A] dark:border-amber-900/50",
    orange: "bg-[#FFF7ED] dark:bg-orange-950/60 text-[#EA580C] dark:text-[#FB923C] border-[#FFEDD5] dark:border-orange-900/50",
    purple: "bg-[#F3E8FF] dark:bg-purple-950/60 text-[#8B5CF6] dark:text-[#C084FC] border-[#DDD6FE] dark:border-purple-900/50",
  };

  return (
    <div className="relative inline-flex shrink-0 select-none" {...props}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold tracking-wider uppercase border overflow-hidden transition-all duration-150",
          sizes[size] || sizes.md,
          variantColors[variant] || variantColors.primary,
          className
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className={cn("w-full h-full object-cover", imageClassName)}
          />
        ) : (
          <span>{displayFallback}</span>
        )}
      </div>

      {status && statusColors[status] && (
        <span
          className={cn(
            "absolute rounded-full ring-white dark:ring-[#131822]",
            statusDotSizes[size] || statusDotSizes.md,
            statusColors[status]
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export default Avatar;
