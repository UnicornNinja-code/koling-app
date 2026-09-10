import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA Panel Primitive — v3.0 Specification
 * 12px radius, 1px border (#E5E5E5 / #263244), clean surface background.
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
    default: "bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] text-[#111111] dark:text-[#FAFAFA] shadow-xs",
    subtle: "bg-[#FAFAFA] dark:bg-[#0B0F17] border border-[#E5E5E5] dark:border-[#263244] text-[#111111] dark:text-[#FAFAFA]",
    floating: "bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] shadow-md text-[#111111] dark:text-[#FAFAFA]",
  };

  const hasHeader = header || title || description || actions;

  return (
    <div
      className={cn(
        "rounded-[12px] overflow-hidden transition-colors",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div
          className={cn(
            "px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]",
            headerClassName
          )}
        >
          {header || (
            <div className="space-y-0.5">
              {title && (
                <h3 className="font-heading font-bold text-sm md:text-base text-[#111111] dark:text-[#FAFAFA] leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] leading-normal">
                  {description}
                </p>
              )}
            </div>
          )}
          {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
        </div>
      )}

      <div className={cn("p-5", bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-5 py-3.5 bg-[#FAFAFA] dark:bg-[#0B0F17] border-t border-[#E5E5E5] dark:border-[#263244] text-xs text-[#737373] dark:text-[#A3A3A3]">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Panel;
