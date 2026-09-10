import React from "react";
import { AlertTriangle, Info, CheckCircle2, X } from "../common/icons.jsx";

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

  const isDanger = type === "danger";
  const isWarning = type === "warning";

  const getIcon = () => {
    if (isDanger) return <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />;
    if (isWarning) return <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400" />;
    return <Info className="w-6 h-6 text-[#EA580C]" />;
  };

  const getButtonClass = () => {
    if (isDanger) {
      return "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20 border border-transparent";
    }
    if (isWarning) {
      return "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-500/20 border border-transparent";
    }
    return "bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-md shadow-orange-500/20 border border-transparent";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl shadow-2xl p-6 overflow-hidden text-slate-900 dark:text-white transition-colors">
        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isDanger
                ? "bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/40"
                : isWarning
                ? "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40"
                : "bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/40"
            }`}
          >
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-[#A1A1AA] leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 dark:text-[#71717A] hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded-[4px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Entity Details Box */}
        {entityDetails && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#27272A] text-xs text-slate-700 dark:text-[#D4D4D8]">
            {typeof entityDetails === "string" ? (
              <p>{entityDetails}</p>
            ) : (
              <div className="space-y-1 font-mono text-[11px]">
                {Object.entries(entityDetails).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#71717A] capitalize">{key}:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{String(val)}</span>
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
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#A1A1AA] bg-slate-100 dark:bg-[#27272A]/60 hover:bg-slate-200 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

