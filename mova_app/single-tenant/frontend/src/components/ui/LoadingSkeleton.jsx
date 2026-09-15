import React from "react";
import { cn } from "./Button.jsx";

/**
 * Carbon Skeleton Component
 */
export function SkeletonText({ className = "", width = "w-full", lines = 1 }) {
  return (
    <div className="space-y-[var(--cds-spacing-02)] w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-[14px] bg-[var(--cds-layer-02)] animate-pulse",
            i === lines - 1 && lines > 1 ? "w-3/4" : width,
            className
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonPlaceholder({ className = "", height = "h-[40px]" }) {
  return (
    <div
      className={cn("w-full bg-[var(--cds-layer-02)] animate-pulse", height, className)}
    />
  );
}

export function SkeletonTableRow({ columns = 5, density = "normal" }) {
  const densityHeight = {
    compact: "h-[32px]",
    normal: "h-[40px]",
    tall: "h-[48px]",
  };

  return (
    <tr className="border-b border-[var(--cds-border-subtle)]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className={cn("px-[16px]", densityHeight[density] || densityHeight.normal)}>
          <div className="h-[12px] bg-[var(--cds-layer-02)] animate-pulse w-4/5" />
        </td>
      ))}
    </tr>
  );
}
