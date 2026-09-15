import React from "react";
import { cn } from "./Button.jsx";

/**
 * Carbon Line Tabs Component
 */
export function Tabs({ children, className = "", ...props }) {
  return (
    <div className={cn("flex items-center border-b border-[var(--cds-border-subtle)] bg-[var(--cds-layer-01)] overflow-x-auto", className)} role="tablist" {...props}>
      {children}
    </div>
  );
}

export function Tab({
  children,
  active = false,
  onClick,
  icon: Icon,
  badge,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-[40px] px-[16px] flex items-center gap-[var(--cds-spacing-03)] cds-heading-compact-01 text-[13px] font-medium border-b-2 transition-colors duration-100 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--cds-focus)] shrink-0",
        active
          ? "border-b-[var(--cds-interactive)] text-[var(--cds-text-primary)] bg-[var(--cds-layer-02)]"
          : "border-b-transparent text-[var(--cds-text-secondary)] hover:text-[var(--cds-text-primary)] hover:bg-[var(--cds-layer-hover-01)]",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="truncate">{children}</span>
      {badge !== undefined && (
        <span className="ml-[var(--cds-spacing-01)] px-[6px] py-[1px] text-[11px] font-semibold bg-[var(--cds-layer-03)] text-[var(--cds-text-primary)]">
          {badge}
        </span>
      )}
    </button>
  );
}

export function TabPanel({ children, active = false, className = "", ...props }) {
  if (!active) return null;
  return (
    <div role="tabpanel" className={cn("p-[16px] focus:outline-none", className)} {...props}>
      {children}
    </div>
  );
}
