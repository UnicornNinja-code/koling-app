import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA Panel Primitive — Enterprise Operations Control Room SSOT
 * Compact, 6-8px rectangular radius, 1px border (#E5E5E5), white background, zero default shadow.
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
    default: "bg-white border border-[#E5E5E5]",
    subtle: "bg-[#FAFAFA] border border-[#E5E5E5]",
    floating: "bg-white border border-[#E5E5E5] shadow-sm",
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
            "px-3.5 py-3 md:px-4 md:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5]",
            headerClassName
          )}
        >
          {header || (
            <div className="space-y-0.5">
              {title && (
                <h3 className="font-heading font-semibold text-xs md:text-sm text-[#111111] leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-[11px] text-[#737373] leading-normal">
                  {description}
                </p>
              )}
            </div>
          )}
          {actions && <div className="flex items-center gap-1.5 self-start sm:self-auto">{actions}</div>}
        </div>
      )}

      <div className={cn("p-3.5 md:p-4", bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-3.5 py-2.5 md:px-4 bg-[#FAFAFA] border-t border-[#E5E5E5] text-[11px] text-[#737373]">
          {footer}
        </div>
      )}
    </div>
  );
}
