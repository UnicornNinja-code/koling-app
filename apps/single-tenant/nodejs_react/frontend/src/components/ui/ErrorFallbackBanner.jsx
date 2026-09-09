import React from "react";
import { cn } from "../../lib/utils.js";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button.jsx";

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
        "p-4 rounded-[6px] bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[4px] bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-rose-900">{title}</h4>
          <p className="text-xs text-rose-700 leading-tight">{errorMessage}</p>
        </div>
      </div>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="shrink-0 text-xs font-semibold"
        >
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
