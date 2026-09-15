import React from "react";

/**
 * MOVA Design System v3.0 Button Component
 * Variants: primary (Blue), accent (Orange), secondary (Outline), ghost, danger, success
 * Sizes: sm, md, lg, icon
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium font-['Inter'] transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5 rounded-[6px] gap-1.5 h-8",
    md: "text-sm px-3.5 py-2 rounded-[8px] gap-2 h-9",
    lg: "text-sm px-5 py-2.5 rounded-[8px] gap-2.5 h-11 text-base font-semibold",
    icon: "p-2 rounded-[8px] h-9 w-9 justify-center",
    "icon-sm": "p-1.5 rounded-[6px] h-7 w-7 justify-center",
  };

  const variantStyles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus:ring-blue-500",
    accent:
      "bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow focus:ring-orange-500 font-semibold",
    secondary:
      "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-slate-400 shadow-2xs",
    ghost:
      "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow focus:ring-red-500",
    "danger-ghost":
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 focus:ring-red-400",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow focus:ring-emerald-500",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      ) : null}
      {children}
      {!isLoading && IconRight ? (
        <IconRight className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      ) : null}
    </button>
  );
}
