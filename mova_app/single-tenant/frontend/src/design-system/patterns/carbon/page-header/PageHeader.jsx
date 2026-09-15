import React from "react";
import { Breadcrumb, BreadcrumbItem, Tag } from "@carbon/react";

/**
 * Enterprise Carbon PageHeader Pattern (Generic Carbon Pattern)
 * Canonical top banner for enterprise operations:
 * - Breadcrumbs trail
 * - Category / Domain eyebrow tag
 * - Primary heading (heading-04)
 * - Description subtitle (body-compact-01)
 * - Right-aligned primary action buttons
 */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  breadcrumbs = [],
  statusTag,
  actions,
  className = "",
}) {
  return (
    <div className={`cds-page-header border-b border-[var(--cds-border-subtle)] pb-[16px] mb-[24px] space-y-[12px] ${className}`}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb noTrailingSlash>
          {breadcrumbs.map((item, idx) => (
            <BreadcrumbItem key={idx} href={item.href} isCurrentPage={idx === breadcrumbs.length - 1}>
              {item.label}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}

      <div className="flex flex-wrap items-start justify-between gap-[16px]">
        <div className="space-y-[4px]">
          {eyebrow && (
            <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider block">
              {eyebrow}
            </span>
          )}
          <div className="flex items-center gap-[12px]">
            <h1 className="text-[28px] font-semibold text-[var(--cds-text-primary)] leading-[36px]">
              {title}
            </h1>
            {statusTag && (
              <Tag type={statusTag.type || "blue"} size="sm">
                {statusTag.label}
              </Tag>
            )}
          </div>
          {subtitle && (
            <p className="cds-body-compact-01 text-[var(--cds-text-secondary)] max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-[8px] shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
