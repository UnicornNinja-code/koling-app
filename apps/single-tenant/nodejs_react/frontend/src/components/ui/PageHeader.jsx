import React from "react";
import { Button } from "../common/Button.jsx";
import { cn } from "../../lib/utils.js";

export function PageHeader({
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onActionClick,
  className = "",
  children,
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-xs",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-base md:text-xl font-heading font-extrabold text-slate-900 tracking-tight leading-snug">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
        {actionLabel && onActionClick && (
          <Button
            onClick={onActionClick}
            variant="primary"
            size="sm"
            leftIcon={ActionIcon}
            className="shadow-xs"
          >
            {actionLabel}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
