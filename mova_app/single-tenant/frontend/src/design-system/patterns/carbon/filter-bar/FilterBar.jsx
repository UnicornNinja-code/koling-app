import React from "react";
import { Search, Button } from "@carbon/react";
import { Filter, Renew } from "@carbon/icons-react";

/**
 * Enterprise Carbon FilterBar Pattern (Generic Carbon Pattern)
 * Standard multi-criteria filter strip:
 * - Real-time keyword search
 * - Custom slot for Select / Dropdown filters
 * - Reset and Apply actions
 */
export function FilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters = [],
  children,
  onReset,
  onApply,
  showApplyButton = false,
  className = "",
}) {
  return (
    <div className={`cds-filter-bar flex flex-wrap items-center justify-between gap-[12px] bg-[var(--cds-layer-01)] p-[12px] border border-[var(--cds-border-subtle)] ${className}`}>
      <div className="flex flex-1 flex-wrap items-center gap-[12px] min-w-[280px]">
        {onSearchChange && (
          <div className="w-full max-w-[320px]">
            <Search
              size="md"
              labelText="Filter search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onClear={() => onSearchChange("")}
            />
          </div>
        )}
        {children}
      </div>

      <div className="flex items-center gap-[8px] shrink-0">
        {onReset && (
          <Button
            kind="ghost"
            size="md"
            renderIcon={Renew}
            onClick={onReset}
          >
            Reset
          </Button>
        )}
        {showApplyButton && onApply && (
          <Button
            kind="secondary"
            size="md"
            renderIcon={Filter}
            onClick={onApply}
          >
            Apply Filters
          </Button>
        )}
      </div>
    </div>
  );
}
