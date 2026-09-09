import React, { useEffect } from "react";
import { cn } from "../../lib/utils.js";
import { X } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={cn(
          "bg-[#121215] w-full rounded-t-2xl sm:rounded-2xl border border-[#24242A] shadow-2xl text-white",
          "max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200",
          maxWidth,
          className
        )}
      >
        {/* Modal Header */}
        {(title || onClose) && (
          <div className="p-4 md:p-5 border-b border-[#24242A] flex items-start justify-between gap-3 bg-[#121215] shrink-0">
            <div>
              {title && (
                <h3 className="font-heading font-extrabold text-base text-white leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#A1A1AA] mt-0.5">{description}</p>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                className="p-1.5 text-[#71717A] hover:text-white hover:bg-[#18181B] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 text-xs md:text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

// Alias export for Dialog
export const Dialog = Modal;
