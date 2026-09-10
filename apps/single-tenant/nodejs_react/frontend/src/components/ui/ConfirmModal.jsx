import React from "react";
import { AlertTriangle, Info, X } from "../common/icons.jsx";

/**
 * MOVA ConfirmModal Component — Design System v3.0 SSOT
 * Dialog elevation (shadow-2xl), 16px radius (rounded-xl), 8px button radius (rounded-md)
 * Destructive warning explains consequences clearly without native window.confirm()
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  type = "primary", // 'primary' | 'danger' | 'warning' | 'info'
  entityDetails = null,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const isDanger = type === "danger" || type === "destructive";
  const isWarning = type === "warning";

  const getIcon = () => {
    if (isDanger) return <AlertTriangle className="w-5 h-5 text-destructive" />;
    if (isWarning) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <Info className="w-5 h-5 text-primary" />;
  };

  const getButtonClass = () => {
    if (isDanger) {
      return "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-xs";
    }
    if (isWarning) {
      return "bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs";
    }
    return "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 overflow-hidden text-card-foreground transition-colors font-sans">
        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isDanger
                ? "bg-destructive/10 border border-destructive/20 text-destructive"
                : isWarning
                ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                : "bg-primary/10 border border-primary/20 text-primary"
            }`}
          >
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-heading font-bold text-foreground leading-tight">
              {title}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Entity Details Box */}
        {entityDetails && (
          <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
            {typeof entityDetails === "string" ? (
              <p>{entityDetails}</p>
            ) : (
              <div className="space-y-1 font-mono text-[11px]">
                {Object.entries(entityDetails).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="text-foreground font-semibold">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 h-9 rounded-md text-xs font-semibold text-muted-foreground bg-card hover:bg-muted border border-border hover:text-foreground transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 h-9 rounded-md text-xs font-semibold transition-all cursor-pointer ${getButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export const AlertDialog = ConfirmModal;
export default ConfirmModal;
