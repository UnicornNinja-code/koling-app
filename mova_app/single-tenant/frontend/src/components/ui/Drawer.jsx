import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "./Button.jsx";

/**
 * Carbon Side Panel / Drawer Component
 */
export function Drawer({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md", // sm (360px), md (480px), lg (640px)
  className = "",
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: "max-w-[360px]",
    md: "max-w-[480px]",
    lg: "max-w-[640px]",
    full: "max-w-full",
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 select-none animate-fadeIn">
      <div
        className={cn(
          "w-full h-full bg-[var(--cds-layer-01)] border-l border-[var(--cds-border-subtle)] shadow-[var(--cds-shadow-overlay)] flex flex-col justify-between overflow-hidden animate-slideLeft",
          widthStyles[width] || widthStyles.md,
          className
        )}
        role="dialog"
      >
        {/* Drawer Header */}
        <div className="p-[16px] border-b border-[var(--cds-border-subtle)] flex items-start justify-between gap-[var(--cds-spacing-03)] bg-[var(--cds-layer-02)]">
          <div className="space-y-[var(--cds-spacing-01)]">
            <h3 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">{title}</h3>
            {subtitle && <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">{subtitle}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-[6px] hover:bg-[var(--cds-layer-hover-02)] text-[var(--cds-icon-secondary)] hover:text-[var(--cds-icon-primary)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)] cursor-pointer"
              aria-label="Tutup panel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Drawer Content */}
        <div className="p-[20px] overflow-y-auto flex-1 text-[var(--cds-text-primary)] cds-body-compact-01 space-y-[var(--cds-spacing-04)]">
          {children}
        </div>

        {/* Drawer Footer */}
        {footer && (
          <div className="border-t border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
