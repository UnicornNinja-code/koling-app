import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";
import { cn } from "./Button.jsx";

const ToastContext = createContext(null);

/**
 * Carbon Notification / Toast Component & Provider
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, kind = "info", duration = 4500 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, title, message, kind, timestamp: new Date() };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast({ title, message, kind: "success" }),
    error: (title, message) => addToast({ title, message, kind: "error" }),
    warning: (title, message) => addToast({ title, message, kind: "warning" }),
    info: (title, message) => addToast({ title, message, kind: "info" }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-[24px] right-[24px] z-50 flex flex-col gap-[var(--cds-spacing-03)] max-w-[420px] w-full pointer-events-none">
        {toasts.map((t) => (
          <NotificationItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function NotificationItem({ toast, onClose, inline = false }) {
  const kindConfig = {
    error: {
      borderColor: "border-l-[var(--cds-support-error)]",
      Icon: AlertOctagon,
      iconColor: "text-[var(--cds-support-error)]",
    },
    success: {
      borderColor: "border-l-[var(--cds-support-success)]",
      Icon: CheckCircle2,
      iconColor: "text-[var(--cds-support-success)]",
    },
    warning: {
      borderColor: "border-l-[var(--cds-support-warning)]",
      Icon: AlertTriangle,
      iconColor: "text-[var(--cds-support-warning)]",
    },
    info: {
      borderColor: "border-l-[var(--cds-support-info)]",
      Icon: Info,
      iconColor: "text-[var(--cds-support-info)]",
    },
  };

  const config = kindConfig[toast.kind] || kindConfig.info;
  const Icon = config.Icon;

  return (
    <div
      className={cn(
        "pointer-events-auto w-full bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] border-l-4 shadow-[var(--cds-shadow-elevated)] p-[14px] flex items-start justify-between gap-[var(--cds-spacing-03)] animate-fadeIn",
        config.borderColor,
        inline && "shadow-none"
      )}
      role="alert"
    >
      <div className="flex items-start gap-[var(--cds-spacing-03)] flex-1 min-w-0">
        <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", config.iconColor)} />
        <div className="space-y-0.5 flex-1 min-w-0">
          {toast.title && (
            <h5 className="cds-heading-compact-01 text-[var(--cds-text-primary)] font-semibold text-[13px] truncate">
              {toast.title}
            </h5>
          )}
          {toast.message && (
            <p className="cds-body-compact-01 text-[var(--cds-text-secondary)] text-[12px] leading-[16px] break-words">
              {toast.message}
            </p>
          )}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-[var(--cds-layer-hover-02)] text-[var(--cds-icon-secondary)] hover:text-[var(--cds-icon-primary)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)] cursor-pointer shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
