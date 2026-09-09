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
        "flex flex-col items-center justify-center p-8 text-center space-y-3 rounded-[12px] border border-dashed border-[#E5E5E5] bg-[#FAFAFA]",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#F5F5F5] text-[#737373] flex items-center justify-center border border-[#E5E5E5]">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-heading font-bold text-[#111111]">{title}</h4>
        <p className="text-xs text-[#737373] leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
