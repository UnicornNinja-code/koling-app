import React from "react";

/**
 * MOVA Design System v3.0 Loading Skeleton Components
 * High-fidelity shimmering skeleton loaders for dashboard widgets and tables.
 */
export function Skeleton({ className = "", rounded = "rounded-[8px]" }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800 ${rounded} ${className}`}
    />
  );
}

/**
 * Top executive summary metric card skeleton
 */
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

/**
 * Interactive map panel skeleton
 */
export function MapSkeleton({ className = "h-[420px]" }) {
  return (
    <div className={`relative w-full ${className} bg-slate-100 dark:bg-slate-900 rounded-[12px] overflow-hidden border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between`}>
      <div className="flex items-center justify-between z-10">
        <Skeleton className="h-8 w-44" rounded="rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" rounded="rounded-xl" />
          <Skeleton className="h-8 w-8" rounded="rounded-xl" />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12" rounded="rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center justify-between z-10">
        <Skeleton className="h-6 w-36" rounded="rounded-lg" />
        <Skeleton className="h-6 w-20" rounded="rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Panel 1: Shift Load Distribution skeleton
 */
export function DistributionPanelSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-20" rounded="rounded-full" />
      </div>
      {/* Top summary chips skeleton */}
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-14 w-full" rounded="rounded-xl" />
        <Skeleton className="h-14 w-full" rounded="rounded-xl" />
      </div>
      {/* Zone rows skeleton */}
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-2 w-full" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Panel 2: Rider Telemetry & Plotting skeleton
 */
export function RiderTelemetrySkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-6 w-24" rounded="rounded-full" />
      </div>
      {/* Top status chips skeleton */}
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-14 w-full" rounded="rounded-xl" />
        <Skeleton className="h-14 w-full" rounded="rounded-xl" />
        <Skeleton className="h-14 w-full" rounded="rounded-xl" />
      </div>
      {/* Rider list items */}
      <div className="space-y-2.5 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-20" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Panel 3: Revenue Recap & Estimation skeleton
 */
export function OmsetChartSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-28" rounded="rounded-full" />
      </div>
      {/* Big Omset Banner skeleton */}
      <Skeleton className="h-24 w-full" rounded="rounded-xl" />
      {/* Sparkline hourly bars */}
      <div className="pt-2 space-y-2">
        <Skeleton className="h-3 w-36" />
        <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-2 border-b border-slate-100 dark:border-slate-800">
          {[40, 70, 100, 60, 85, 90, 50].map((h, i) => (
            <Skeleton key={i} className="w-full" style={{ height: `${h}%` }} rounded="rounded-t-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * TOPSIS Criteria card skeleton (C1 - C6)
 */
export function CriteriaCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-14" rounded="rounded-full" />
      </div>
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-2 w-full" rounded="rounded-full" />
    </div>
  );
}

/**
 * Generic Table skeleton
 */
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

