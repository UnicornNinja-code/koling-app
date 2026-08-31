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
      bg: "bg-blue-50/90 text-blue-900 border-blue-200",
      icon: Info,
      iconColor: "text-blue-600",
    },
    success: {
      bg: "bg-emerald-50/90 text-emerald-900 border-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    warning: {
      bg: "bg-amber-50/90 text-amber-900 border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    danger: {
      bg: "bg-rose-50/90 text-rose-900 border-rose-200",
      icon: AlertCircle,
      iconColor: "text-rose-600",
    },
  };

  const config = configs[variant] || configs.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "p-3.5 md:p-4 rounded-xl border flex items-start gap-3 text-xs md:text-sm shadow-xs",
        config.bg,
        className
      )}
      {...props}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-heading font-bold text-xs md:text-sm leading-tight">{title}</h5>}
        <div className="font-normal leading-relaxed text-[11px] md:text-xs opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pemberitahuan"
          className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/5 transition-opacity cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
