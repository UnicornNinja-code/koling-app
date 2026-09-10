import React from "react";
import { cn } from "../../lib/utils.js";
import { TrendingUp, TrendingDown } from "../common/icons.jsx";

/**
 * MOVA StatCard Component — Design System v3.0 SSOT
 * Matches assets/img/dashboard.png and operational rider.png:
 * - Icon: Rounded square with soft tint
 * - Label: 11-12px muted
 * - Main Value: 22-24px bold font-heading
 * - Denominator/Target: text-xs text-neutral-400
 * - Trend: Colored pill or inline text (↑ 12% dari kemarin, etc.)
 */
export function StatCard({
  label,
  title,
  value,
  subtext,
  subtitle,
  denominator, // e.g. "dari 17 zona", "/ 48"
  trend = null, // string like "↑ 12%" or "+12%"
  trendLabel = null, // string like "dari kemarin"
  trendType = "neutral", // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  badge = null,
  icon: IconComponent,
  iconColor,
  iconVariant = "primary", // 'primary' | 'orange' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
  className = "",
  onClick,
  actionIcon: ActionIconComponent,
}) {
  const displayLabel = label || title;
  const displaySubtext = subtext || subtitle;

  const iconVariants = {
    primary: "bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#60A5FA] border-blue-200/60 dark:border-blue-800/40",
    orange: "bg-orange-50 dark:bg-orange-950/50 text-[#EA580C] dark:text-[#FB923C] border-orange-200/60 dark:border-orange-800/40",
    success: "bg-emerald-50 dark:bg-emerald-950/50 text-[#10B981] dark:text-[#34D399] border-emerald-200/60 dark:border-emerald-800/40",
    warning: "bg-amber-50 dark:bg-amber-950/50 text-[#F59E0B] dark:text-[#FBBF24] border-amber-200/60 dark:border-amber-800/40",
    danger: "bg-red-50 dark:bg-red-950/50 text-[#EF4444] dark:text-[#F87171] border-red-200/60 dark:border-red-800/40",
    info: "bg-sky-50 dark:bg-sky-950/50 text-[#0284C7] dark:text-[#38BDF8] border-sky-200/60 dark:border-sky-800/40",
    purple: "bg-purple-50 dark:bg-purple-950/50 text-[#8B5CF6] dark:text-[#C084FC] border-purple-200/60 dark:border-purple-800/40",
    neutral: "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700",
  };

  const trendColors = {
    success: "text-[#10B981] dark:text-[#34D399]",
    warning: "text-[#F59E0B] dark:text-[#FBBF24]",
    danger: "text-[#EF4444] dark:text-[#F87171]",
    info: "text-[#2563EB] dark:text-[#60A5FA]",
    neutral: "text-[#737373] dark:text-[#94A3B8]",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#1E293B] rounded-xl p-4 shadow-xs",
        "flex flex-col justify-between transition-all duration-150 select-none relative",
        onClick && "cursor-pointer hover:border-[#2563EB]/40 hover:shadow-sm",
        className
      )}
    >
      {/* Top Row: Icon + Label + Optional Top Right Action/Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div
              className={cn(
                "w-9 h-9 rounded-lg border flex items-center justify-center shrink-0",
                iconColor || iconVariants[iconVariant] || iconVariants.primary
              )}
            >
              <IconComponent className="w-5 h-5" />
            </div>
          )}
          <span className="text-xs font-semibold text-[#525252] dark:text-[#CBD5E1] truncate">
            {displayLabel}
          </span>
        </div>

        {ActionIconComponent && (
          <ActionIconComponent className="w-4 h-4 text-[#A3A3A3] dark:text-[#64748B]" />
        )}
      </div>

      {/* Middle: Big Value & Denominator */}
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold font-heading text-[#171717] dark:text-white tracking-tight">
          {value}
        </span>
        {denominator && (
          <span className="text-xs font-medium text-[#737373] dark:text-[#94A3B8]">
            {denominator}
          </span>
        )}
      </div>

      {/* Bottom: Subtext, Trends, or Badges */}
      {(trend || displaySubtext || badge) && (
        <div className="flex items-center gap-1.5 mt-2 text-xs">
          {trend && (
            <span className={cn("inline-flex items-center gap-0.5 font-semibold", trendColors[trendType] || trendColors.neutral)}>
              {trend.startsWith("+") || trend.startsWith("↑") ? (
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              ) : trend.startsWith("-") || trend.startsWith("↓") ? (
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
              ) : null}
              <span>{trend}</span>
            </span>
          )}

          {trendLabel && (
            <span className="text-[#737373] dark:text-[#94A3B8]">
              {trendLabel}
            </span>
          )}

          {displaySubtext && !trend && (
            <span className="text-[#737373] dark:text-[#94A3B8]">
              {displaySubtext}
            </span>
          )}

          {badge && (
            <div className="ml-auto">{badge}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
