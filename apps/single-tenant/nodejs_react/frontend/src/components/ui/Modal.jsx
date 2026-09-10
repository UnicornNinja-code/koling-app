import React, { useEffect } from "react";
import { cn } from "../../lib/utils.js";
import { X } from "lucide-react";

/**
 * MOVA Modal / Dialog Component — Design System v3.0 SSOT
 * Radius: 16px (rounded-xl), elevation: shadow-2xl, backdrop blur
 * Standard anatomy: Header (Title + Description) → Body → Footer
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
  className = "",
}) {
  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={cn(
          "bg-card text-card-foreground w-full rounded-t-xl sm:rounded-xl border border-border shadow-2xl",
          "max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200",
          maxWidth,
          className
        )}
      >
        {/* Modal Header */}
        {(title || onClose) && (
          <div className="p-5 border-b border-border flex items-start justify-between gap-3 bg-card shrink-0">
            <div>
              {title && (
                <h3 className="font-heading font-bold text-base text-foreground leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 text-sm text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Dialog = Modal;
export default Modal;
