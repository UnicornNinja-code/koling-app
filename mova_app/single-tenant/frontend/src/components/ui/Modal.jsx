import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button.jsx";
import { cn } from "./Button.jsx";

/**
 * Carbon Modal Dialog Primitive
 */
export function Modal({
  isOpen = false,
  onClose,
  title,
  label,
  children,
  primaryButtonText = "Konfirmasi",
  secondaryButtonText = "Batal",
  onPrimarySubmit,
  primaryButtonDisabled = false,
  primaryButtonLoading = false,
  danger = false,
  size = "md", // sm (400px), md (600px), lg (800px)
  className = "",
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-[440px]",
    md: "max-w-[640px]",
    lg: "max-w-[840px]",
    full: "max-w-[95vw]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-black/70 animate-fadeIn select-none">
      <div
        className={cn(
          "w-full bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] shadow-[var(--cds-shadow-overlay)] flex flex-col max-h-[90vh] overflow-hidden",
          sizeStyles[size] || sizeStyles.md,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-[20px] pb-[16px] border-b border-[var(--cds-border-subtle)] flex items-start justify-between gap-[var(--cds-spacing-04)]">
          <div className="space-y-[var(--cds-spacing-01)]">
            {label && <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase">{label}</span>}
            <h3 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold">{title}</h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-[8px] hover:bg-[var(--cds-layer-hover-01)] text-[var(--cds-icon-secondary)] hover:text-[var(--cds-icon-primary)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)] cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-[20px] overflow-y-auto flex-1 text-[var(--cds-text-primary)] cds-body-compact-01">
          {children}
        </div>

        {/* Modal Footer (Carbon Split Action Footer) */}
        {(onPrimarySubmit || onClose) && (
          <div className="grid grid-cols-2 border-t border-[var(--cds-border-subtle)]">
            {onClose && (
              <Button
                kind="secondary"
                size="lg"
                onClick={onClose}
                className="w-full justify-center border-none rounded-none"
              >
                {secondaryButtonText}
              </Button>
            )}
            {onPrimarySubmit && (
              <Button
                kind={danger ? "danger" : "primary"}
                size="lg"
                onClick={onPrimarySubmit}
                disabled={primaryButtonDisabled}
                loading={primaryButtonLoading}
                className="w-full justify-center border-none rounded-none"
              >
                {primaryButtonText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
