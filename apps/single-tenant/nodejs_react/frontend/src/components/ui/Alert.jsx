import React from "react";
import { cn } from "../../lib/utils.js";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
  ...props
}) {
  const configs = {
    info: {
      bg: "bg-blue-50/90 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800/60",
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    success: {
      bg: "bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      bg: "bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    danger: {
      bg: "bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800/60",
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  };

  const config = configs[variant] || configs.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "p-4 rounded-[6px] border flex items-start gap-3 text-xs md:text-sm shadow-xs transition-colors",
        config.bg,
        className
      )}
      {...props}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-heading font-bold text-xs md:text-sm leading-tight text-slate-900 dark:text-white">{title}</h5>}
        <div className="font-normal leading-relaxed text-xs text-slate-700 dark:text-slate-300">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pemberitahuan"
          className="p-1 rounded-[4px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-opacity cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

