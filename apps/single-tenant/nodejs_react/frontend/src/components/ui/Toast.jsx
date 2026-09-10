import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "../../lib/utils.js";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, variant = "info", duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, title, message, variant, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = "Berhasil") => addToast({ message, title, variant: "success" }),
    error: (message, title = "Terjadi Kesalahan") => addToast({ message, title, variant: "danger" }),
    warning: (message, title = "Peringatan") => addToast({ message, title, variant: "warning" }),
    info: (message, title = "Informasi") => addToast({ message, title, variant: "info" }),
    showToast: (message, variant = "info", title) => {
      const v = variant === "error" ? "danger" : variant;
      return addToast({
        message,
        variant: v,
        title: title || (v === "success" ? "Berhasil" : v === "danger" ? "Peringatan Sistem" : v === "warning" ? "Peringatan" : "Informasi"),
      });
    },
    custom: addToast,
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Floating Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log("[Toast Success]", msg),
      error: (msg) => console.error("[Toast Error]", msg),
      warning: (msg) => console.warn("[Toast Warning]", msg),
      info: (msg) => console.info("[Toast Info]", msg),
      custom: () => {},
      dismiss: () => {},
    };
  }
  return context;
}

function ToastItem({ toast, onDismiss }) {
  const configs = {
    success: {
      border: "border-emerald-200 dark:border-emerald-800/60",
      bg: "bg-white dark:bg-[#131822]",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      barColor: "bg-emerald-600",
    },
    warning: {
      border: "border-amber-200 dark:border-amber-800/60",
      bg: "bg-white dark:bg-[#131822]",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
      barColor: "bg-amber-600",
    },
    danger: {
      border: "border-rose-200 dark:border-rose-800/60",
      bg: "bg-white dark:bg-[#131822]",
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
      barColor: "bg-rose-600",
    },
    info: {
      border: "border-blue-200 dark:border-blue-800/60",
      bg: "bg-white dark:bg-[#131822]",
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
      barColor: "bg-blue-600",
    },
  };

  const config = configs[toast.variant] || configs.info;
  const Icon = config.icon;

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto relative flex items-start gap-3 p-4 rounded-[6px] border shadow-xl transition-all duration-200 ease-out",
        "animate-in slide-in-from-bottom-5 fade-in",
        config.bg,
        config.border
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 space-y-0.5 pr-2">
        {toast.title && <h5 className="font-heading font-bold text-xs text-slate-900 dark:text-white leading-tight">{toast.title}</h5>}
        {toast.message && <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="p-1 rounded-[4px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
