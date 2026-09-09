import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA Panel Primitive — Enterprise Operations Control Room SSOT
 * Dense, 6-8px rectangular radius, 1px border (#E2E8F0), Clean White Background (#FFFFFF).
 */
export function Panel({
  title,
  description,
  actions,
  header,
  footer,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  variant = "default", // 'default' | 'subtle' | 'floating'
  ...props
}) {
  const variantStyles = {
    default: "bg-white border border-slate-200 text-slate-900 shadow-xs",
    subtle: "bg-slate-50 border border-slate-200 text-slate-900",
    floating: "bg-white border border-slate-200 shadow-md text-slate-900",
  };

  const hasHeader = header || title || description || actions;

  return (
    <div
      className={cn(
        "rounded-[6px] overflow-hidden transition-all",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div
          className={cn(
            "px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 bg-white",
            headerClassName
          )}
        >
          {header || (
            <div className="space-y-0.5">
              {title && (
                <h3 className="font-heading font-bold text-sm md:text-base text-slate-900 leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 leading-normal">
                  {description}
                </p>
              )}
            </div>
          )}
          {actions && <div className="flex items-center gap-1.5 self-start sm:self-auto">{actions}</div>}
        </div>
      )}

      <div className={cn("p-4 md:p-5", bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
}
