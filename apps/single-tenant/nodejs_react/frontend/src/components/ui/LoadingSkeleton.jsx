import React from "react";
import { cn } from "../../lib/utils.js";
import { Skeleton } from "./Skeleton.jsx";

/**
 * MOVA Loading Skeleton Primitives (SSOT from MOVA_DESIGN_SYSTEM.md)
 */

export function MetricSkeleton({ count = 4, className = "" }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-4 md:p-5 rounded-[12px] border border-[#E5E5E5] space-y-3 shadow-2xs"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-24 rounded-[4px]" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 rounded-[6px]" />
          <Skeleton className="h-3 w-40 rounded-[4px]" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({ className = "", height = "h-48" }) {
  return (
    <div
      className={cn(
        "bg-white p-5 rounded-[12px] border border-[#E5E5E5] space-y-4 shadow-2xs",
        className
      )}
    >
      <div className="flex justify-between items-center border-b border-[#E5E5E5]/60 pb-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-40 rounded-[4px]" />
          <Skeleton className="h-3 w-56 rounded-[4px]" />
        </div>
        <Skeleton className="h-6 w-20 rounded-[6px]" />
      </div>
      <Skeleton className={cn("w-full rounded-[8px]", height)} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4, className = "" }) {
  return (
    <div className={cn("bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden", className)}>
      <div className="p-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex justify-between">
        <Skeleton className="h-4 w-32 rounded-[4px]" />
        <Skeleton className="h-4 w-20 rounded-[4px]" />
      </div>
      <div className="divide-y divide-[#E5E5E5]/60 p-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="py-3 px-2 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="h-3.5 flex-1 rounded-[4px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
