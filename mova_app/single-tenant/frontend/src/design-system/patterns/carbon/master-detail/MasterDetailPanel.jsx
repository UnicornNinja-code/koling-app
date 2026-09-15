import React from "react";
import { Button } from "@carbon/react";
import { Close } from "@carbon/icons-react";

/**
 * Enterprise Carbon MasterDetailPanel Pattern (Generic Carbon Pattern)
 * Canonical slide-over side panel for master-detail views (Map Ops, Rider Telemetry, POI Moderation)
 */
export function MasterDetailPanel({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "480px",
  className = "",
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{ width }}
      className={`cds-master-detail-panel h-full bg-[var(--cds-layer-01)] border-l border-[var(--cds-border-subtle)] flex flex-col justify-between shadow-2xl z-40 cds-motion-slide-in-right ${className}`}
    >
      {/* Panel Header */}
      <div className="flex items-start justify-between p-[16px] border-b border-[var(--cds-border-subtle)]">
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--cds-text-primary)]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[12px] text-[var(--cds-text-secondary)] mt-[2px]">
              {subtitle}
            </p>
          )}
        </div>
        <Button
          kind="ghost"
          size="sm"
          hasIconOnly
          renderIcon={Close}
          iconDescription="Close detail panel"
          onClick={onClose}
        />
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-[16px] space-y-[16px]">
        {children}
      </div>

      {/* Panel Footer */}
      {footer && (
        <div className="p-[16px] border-t border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)]">
          {footer}
        </div>
      )}
    </div>
  );
}
