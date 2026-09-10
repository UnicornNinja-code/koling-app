import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA PageHeader Component — Design System v3.0 SSOT
 * Exact match with assets/img (dss.png, map ops.png, operational rider.png):
 * - Left: Soft-colored square icon box
 * - Center: Title (20-22px bold) + Subtitle description (13-14px)
 * - Right: Action buttons slot
 */
export function PageHeader({
  title,
  description,
  icon: IconComponent,
  iconVariant = "info", // 'info' | 'primary' | 'warning' | 'success'
  className = "",
  actions = null,
  children,
}) {
  const iconVariants = {
    info: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-[#0284C7]",
    primary: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60 text-[#EA580C]",
    warning: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-[#D97706]",
    success: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-[#16A34A]",
  };

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none", className)}>
      <div className="flex items-start gap-3.5">
        {IconComponent && (
          <div
            className={cn(
              "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs mt-0.5",
              iconVariants[iconVariant] || iconVariants.info
            )}
          >
            <IconComponent className="w-5 h-5" />
          </div>
        )}

        <div className="space-y-0.5">
          <h1 className="text-xl md:text-2xl font-heading font-bold text-[#0F172A] dark:text-white tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {(actions || children) && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
