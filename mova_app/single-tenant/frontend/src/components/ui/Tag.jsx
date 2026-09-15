import React from "react";
import { cn } from "./Button.jsx";

/**
 * Carbon Tag / Status Badge Component
 * Varian fungsional: red (error), green (success), yellow (warning), blue (info), gray (neutral), purple, cyan, teal
 * Ukuran: sm (18px height), md (24px height)
 */
export function Tag({
  children,
  className = "",
  type = "gray", // red | green | yellow | blue | gray | purple | cyan | teal
  size = "md",    // sm (18px) | md (24px)
  filter = false,
  onClose,
  ...props
}) {
  const sizeStyles = {
    sm: "h-[18px] px-[6px] text-[10px] leading-[14px] tracking-[0.32px]",
    md: "h-[24px] px-[8px] text-[12px] leading-[16px] tracking-[0.32px]",
  };

  const typeStyles = {
    red: "bg-[#FA4D56]/20 text-[#FF8389] border border-[#FA4D56]/40",
    green: "bg-[#24A148]/20 text-[#42BE65] border border-[#24A148]/40",
    yellow: "bg-[#F1C21B]/20 text-[#F1C21B] border border-[#F1C21B]/40",
    blue: "bg-[#0F62FE]/20 text-[#78A9FF] border border-[#0F62FE]/40",
    gray: "bg-[var(--cds-layer-02)] text-[var(--cds-text-secondary)] border border-[var(--cds-border-subtle)]",
    purple: "bg-[#8A3FFC]/20 text-[#BE95FF] border border-[#8A3FFC]/40",
    cyan: "bg-[#0072C3]/20 text-[#33B1FF] border border-[#0072C3]/40",
    teal: "bg-[#007D79]/20 text-[#08BDBA] border border-[#007D79]/40",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[var(--cds-spacing-02)] font-normal select-none rounded-[2px]",
        sizeStyles[size] || sizeStyles.md,
        typeStyles[type] || typeStyles.gray,
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {filter && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="hover:opacity-75 focus:outline-none ml-[var(--cds-spacing-01)] cursor-pointer"
          aria-label="Remove filter"
        >
          ×
        </button>
      )}
    </span>
  );
}
