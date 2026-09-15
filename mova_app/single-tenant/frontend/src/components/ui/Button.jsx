import React from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Carbon Productive Button Component
 * Varian: primary (Blue 60), secondary (Gray 80 / Gray 20), tertiary (1px Blue outline), ghost (transparent), danger (Red 60)
 * Ukuran: sm (32px), md (40px), lg (48px)
 * Geometri: Flat sharp (0px radius), explicit Carbon focus ring
 */
export function Button({
  children,
  className = "",
  kind = "primary", // primary | secondary | tertiary | ghost | danger
  size = "md",      // sm (32px) | md (40px) | lg (48px)
  icon: Icon,
  iconPosition = "right", // Carbon standard icon placement is right for action
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-between font-normal text-left transition-colors duration-700 select-none border border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--cds-focus)]";

  const sizeStyles = {
    sm: "h-[32px] px-[15px] text-[12px] leading-[16px] tracking-[0.32px]",
    md: "h-[40px] px-[15px] text-[14px] leading-[18px] tracking-[0.16px]",
    lg: "h-[48px] px-[15px] text-[14px] leading-[18px] tracking-[0.16px]",
  };

  const kindStyles = {
    primary: "bg-[var(--cds-interactive)] hover:bg-[var(--cds-interactive-hover)] active:bg-[var(--cds-interactive-active)] text-[var(--cds-text-on-color)]",
    secondary: "bg-[var(--cds-layer-02)] hover:bg-[var(--cds-layer-hover-02)] active:bg-[var(--cds-layer-03)] text-[var(--cds-text-primary)] border-[var(--cds-border-subtle)]",
    tertiary: "bg-transparent hover:bg-[var(--cds-interactive)] text-[var(--cds-interactive)] hover:text-[var(--cds-text-on-color)] border-[var(--cds-interactive)]",
    ghost: "bg-transparent hover:bg-[var(--cds-layer-hover-01)] active:bg-[var(--cds-layer-02)] text-[var(--cds-text-primary)]",
    danger: "bg-[var(--cds-support-error)] hover:bg-[#BA1B23] active:bg-[#750E13] text-[var(--cds-text-on-color)]",
    "danger-ghost": "bg-transparent hover:bg-[var(--cds-support-error)] text-[var(--cds-support-error)] hover:text-[var(--cds-text-on-color)]",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(baseStyles, sizeStyles[size] || sizeStyles.md, kindStyles[kind] || kindStyles.primary, className)}
      {...props}
    >
      <span className="flex-1 truncate mr-[var(--cds-spacing-03)]">{children}</span>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current ml-[var(--cds-spacing-03)]" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0 text-current ml-[var(--cds-spacing-03)]" />
      )}
    </button>
  );
}
