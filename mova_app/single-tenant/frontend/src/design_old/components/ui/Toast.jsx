import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

/**
 * MOVA Design System v3.0 Toast Provider & Component
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ title, description, type = "info", duration = 4000 }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, description, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    {
      success: (title, description) =>
        addToast({ title, description, type: "success" }),
      error: (title, description) =>
        addToast({ title, description, type: "danger" }),
      warning: (title, description) =>
        addToast({ title, description, type: "warning" }),
      info: (title, description) =>
        addToast({ title, description, type: "info" }),
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: "border-emerald-200 dark:border-emerald-800/80",
    warning: "border-amber-200 dark:border-amber-800/80",
    danger: "border-red-200 dark:border-red-800/80",
    info: "border-blue-200 dark:border-blue-800/80",
  };

  return (
    <div
      className={`pointer-events-auto bg-white dark:bg-slate-900 border rounded-[10px] p-3.5 shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200 font-['Inter'] ${
        borders[toast.type] || "border-slate-200 dark:border-slate-800"
      }`}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {toast.description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
