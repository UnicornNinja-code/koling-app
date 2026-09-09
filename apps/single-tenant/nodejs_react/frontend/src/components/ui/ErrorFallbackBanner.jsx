import React from "react";
import { cn } from "../../lib/utils.js";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "../common/Button.jsx";

/**
 * MOVA Error Fallback Banner Component
 * Distinct from EmptyState: strictly displayed when an API or network error occurs.
 */
export function ErrorFallbackBanner({
  title = "Gagal Memuat Data",
  error = null,
  onRetry = null,
  className = "",
}) {
  const errorMessage =
    (typeof error === "string" ? error : error?.message || error?.msg) ||
    "Terjadi kesalahan saat berkomunikasi dengan server backend.";

  return (
    <div
      className={cn(
        "p-4 rounded-[12px] bg-[#FEF2F2] border border-[#FECACA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[8px] bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#DC2626]">{title}</h4>
          <p className="text-xs text-[#525252] leading-tight">{errorMessage}</p>
        </div>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 bg-white hover:bg-[#F5F5F5] border-[#E5E5E5] text-xs font-semibold text-[#111111]"
        >
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
