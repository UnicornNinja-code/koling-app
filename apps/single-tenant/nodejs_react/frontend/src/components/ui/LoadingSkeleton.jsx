import React from "react";

/**
 * MOVA Design System v3.0 Loading Skeleton Components
 */
export function Skeleton({ className = "", rounded = "rounded-[8px]" }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800 ${rounded} ${className}`}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] p-5 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-9" rounded="rounded-[8px]" />
      </div>
      <Skeleton className="h-7 w-20" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] overflow-hidden p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-2">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              className={`h-4 ${cIdx === 0 ? "w-10" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
