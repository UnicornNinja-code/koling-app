import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button.jsx";
import { cn } from "./Button.jsx";

/**
 * Carbon Empty State Component
 * Quiet, informative message without decorative cartoon illustrations.
 */
export function EmptyState({
  title = "Tidak Ada Data Ditemukan",
  description = "Belum ada rekaman operasional atau filter yang dipilih tidak menghasilkan data.",
  actionText,
  onAction,
  icon: Icon = FolderOpen,
  className = "",
}) {
  return (
    <div
      className={cn(
        "p-[32px] text-center flex flex-col items-center justify-center border border-[var(--cds-border-subtle)] bg-[var(--cds-layer-01)] space-y-[var(--cds-spacing-03)] select-none",
        className
      )}
    >
      <div className="p-[12px] bg-[var(--cds-layer-02)] text-[var(--cds-icon-secondary)]">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-[var(--cds-spacing-01)] max-w-sm">
        <h4 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">{title}</h4>
        <p className="cds-body-compact-01 text-[var(--cds-text-secondary)] text-[13px]">{description}</p>
      </div>
      {actionText && onAction && (
        <div className="pt-[var(--cds-spacing-02)]">
          <Button kind="tertiary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
