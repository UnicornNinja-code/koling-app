import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "./Button.jsx";

/**
 * Carbon Data Table Primitive Component
 * Row densities: compact (32px), normal (40px), tall (48px)
 */
export function Table({ children, className = "", ...props }) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--cds-border-subtle)] bg-[var(--cds-layer-01)]">
      <table className={cn("w-full text-left border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = "", ...props }) {
  return (
    <thead className={cn("bg-[var(--cds-layer-02)] border-b border-[var(--cds-border-subtle)] select-none", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={cn("divide-y divide-[var(--cds-border-subtle)]", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", selected = false, isHeader = false, ...props }) {
  return (
    <tr
      className={cn(
        "transition-colors duration-100",
        !isHeader && "hover:bg-[var(--cds-layer-hover-01)]",
        selected && "bg-[var(--cds-layer-02)] border-l-4 border-l-[var(--cds-interactive)]",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeader({
  children,
  className = "",
  sortable = false,
  sortDirection = null, // 'asc' | 'desc' | null
  onSort,
  ...props
}) {
  return (
    <th
      className={cn(
        "h-[40px] px-[16px] cds-heading-compact-01 text-[var(--cds-text-primary)] font-semibold text-[13px]",
        sortable && "cursor-pointer hover:bg-[var(--cds-layer-hover-02)]",
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-[var(--cds-spacing-02)] justify-between">
        <span className="truncate">{children}</span>
        {sortable && (
          <span className="text-[var(--cds-icon-secondary)] shrink-0">
            {sortDirection === "asc" ? (
              <ArrowUp className="w-3.5 h-3.5 text-[var(--cds-interactive)]" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="w-3.5 h-3.5 text-[var(--cds-interactive)]" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-40" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}

export function TableCell({ children, className = "", density = "normal", ...props }) {
  const densityStyles = {
    compact: "py-[6px] h-[32px] text-[12px]",
    normal: "py-[10px] h-[40px] text-[13px]",
    tall: "py-[14px] h-[48px] text-[14px]",
  };

  return (
    <td
      className={cn(
        "px-[16px] cds-body-compact-01 text-[var(--cds-text-primary)] align-middle",
        densityStyles[density] || densityStyles.normal,
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableToolbar({ children, title, description, actions, className = "" }) {
  return (
    <div className={cn("p-[16px] bg-[var(--cds-layer-01)] border-b border-[var(--cds-border-subtle)] flex flex-wrap items-center justify-between gap-[var(--cds-spacing-04)]", className)}>
      {(title || description) && (
        <div className="space-y-[var(--cds-spacing-01)]">
          {title && <h4 className="cds-heading-02 text-[var(--cds-text-primary)]">{title}</h4>}
          {description && <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">{description}</p>}
        </div>
      )}
      {actions && <div className="flex items-center gap-[var(--cds-spacing-03)] ml-auto">{actions}</div>}
      {children}
    </div>
  );
}
