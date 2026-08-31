import React, { useEffect } from "react";
import { cn } from "../../lib/utils.js";
import { X } from "lucide-react";

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "bottom", // 'bottom' for mobile sheet | 'right' for desktop side drawer
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={cn(
          "bg-white w-full flex flex-col shadow-2xl transition-transform duration-300",
          position === "bottom"
            ? "rounded-t-2xl max-h-[85vh] border-t border-slate-200 safe-bottom-padding"
            : "sm:h-full sm:max-w-md sm:border-l border-slate-200 h-[85vh] rounded-t-2xl sm:rounded-none",
          className
        )}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Drawer Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            {title && (
              <h3 className="font-heading font-extrabold text-sm md:text-base text-slate-900 leading-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 text-xs md:text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

// Alias export for Sheet
export const Sheet = Drawer;
