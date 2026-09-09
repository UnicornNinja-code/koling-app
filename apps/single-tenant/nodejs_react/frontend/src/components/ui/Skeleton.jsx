import React from "react";
import { cn } from "../../lib/utils.js";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-200/80 shrink-0",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={cn("p-5 bg-white rounded-xl border border-slate-200 space-y-3", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonRow({ cols = 4, className = "" }) {
  return (
    <tr className={cn("border-b border-slate-100", className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
