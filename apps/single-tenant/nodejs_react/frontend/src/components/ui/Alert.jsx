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
      bg: "bg-blue-500/10 text-blue-300 border-blue-500/25",
      icon: Info,
      iconColor: "text-blue-400",
    },
    success: {
      bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
    },
    warning: {
      bg: "bg-amber-500/10 text-amber-300 border-amber-500/25",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
    },
    danger: {
      bg: "bg-rose-500/10 text-rose-300 border-rose-500/25",
      icon: AlertCircle,
      iconColor: "text-rose-400",
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
