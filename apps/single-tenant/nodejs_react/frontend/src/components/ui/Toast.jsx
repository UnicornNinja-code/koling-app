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
      {/* Toast Floating Viewport (Top-Right SSOT) */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-[360px] w-full pointer-events-none p-2 sm:p-0"
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
      border: "border-emerald-500/30",
      bg: "bg-card/95",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      barColor: "bg-emerald-500",
    },
    warning: {
      border: "border-amber-500/30",
      bg: "bg-card/95",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      barColor: "bg-amber-500",
    },
    danger: {
      border: "border-destructive/30",
      bg: "bg-card/95",
      icon: AlertCircle,
      iconColor: "text-destructive",
      barColor: "bg-destructive",
    },
    info: {
      border: "border-primary/30",
      bg: "bg-card/95",
      icon: Info,
      iconColor: "text-primary",
      barColor: "bg-primary",
    },
  };

  const current = configs[toast.variant] || configs.info;
  const IconComponent = current.icon;

  return (
    <div
      className={cn(
        "pointer-events-auto w-full rounded-md border shadow-lg overflow-hidden backdrop-blur-md transition-all duration-200",
        "animate-in fade-in slide-in-from-top-2",
        current.bg,
        current.border
      )}
    >
      <div className="p-3 flex items-start gap-3">
        <IconComponent className={cn("w-4 h-4 mt-0.5 shrink-0", current.iconColor)} />

        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-heading font-semibold text-xs text-foreground leading-tight">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
