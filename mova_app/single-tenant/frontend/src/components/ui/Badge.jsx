import React from "react";

/**
 * MOVA Design System v3.0 Badge Component
 * Variants: primary, accent, success, warning, danger, neutral, outline
 * Sizes: sm, md
 */
export function Badge({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  dot = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center font-semibold font-['Inter'] rounded-full whitespace-nowrap transition-colors";

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-0.5 gap-1.5",
  };

  const variantStyles = {
    primary:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    accent:
      "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
    success:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    warning:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    danger:
      "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
    neutral:
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    outline:
      "bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-750",
    purple:
      "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
    cyan:
      "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800",
  };

  const dotColors = {
    primary: "bg-blue-500",
    accent: "bg-orange-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    neutral: "bg-slate-400",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || "bg-current"}`}
        />
      )}
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
