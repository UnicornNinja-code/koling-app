import React from "react";
import { cn } from "../../lib/utils.js";
import { Inbox } from "lucide-react";

/**
 * MOVA Empty State Component
 * Displayed for valid API responses that contain NO_DATA or 0 records.
 */
export function EmptyState({
  title = "Belum Ada Data",
  description = "Tidak ada rekaman data yang tersedia untuk parameter filter ini.",
  icon: Icon = Inbox,
  action = null,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center space-y-3 rounded-[6px] border border-dashed border-slate-300 dark:border-[#334155] bg-white dark:bg-[#131822] shadow-2xs transition-colors",
        className
      )}
    >
      <div className="w-10 h-10 rounded-[6px] bg-slate-100 dark:bg-[#1E293B] text-slate-500 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-[#334155]">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-heading font-bold text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

