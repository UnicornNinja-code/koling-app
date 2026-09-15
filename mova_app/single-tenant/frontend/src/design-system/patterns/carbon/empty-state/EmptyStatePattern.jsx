import React from "react";
import { Button } from "@carbon/react";
import { Information } from "@carbon/icons-react";

/**
 * Enterprise Carbon EmptyStatePattern (Generic Carbon Pattern)
 * Standard view when datasets, filters, or operational entities return 0 results
 */
export function EmptyStatePattern({
  title = "No Records Found",
  description = "There are currently no active items matching your criteria.",
  icon: Icon = Information,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div className={`cds-empty-state flex flex-col items-center justify-center p-[48px] text-center border border-dashed border-[var(--cds-border-subtle)] bg-[var(--cds-layer-01)] space-y-[16px] ${className}`}>
      <div className="w-12 h-12 flex items-center justify-center bg-[var(--cds-layer-02)] text-[var(--cds-icon-secondary)]">
        <Icon size={24} />
      </div>
      <div className="space-y-[4px] max-w-md">
        <h3 className="text-[16px] font-semibold text-[var(--cds-text-primary)]">
          {title}
        </h3>
        <p className="cds-body-compact-01 text-[var(--cds-text-secondary)]">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button kind="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
