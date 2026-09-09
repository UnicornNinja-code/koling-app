import React from "react";
import { Button } from "./Button.jsx";
import { cn } from "../../lib/utils.js";

export function PageHeader({
  title,
  description,
  badge = null,
  actionLabel,
  actionIcon: ActionIcon,
  onActionClick,
  className = "",
  children,
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 md:p-5 rounded-[6px] border border-slate-200 shadow-xs text-slate-900",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-base md:text-xl font-heading font-extrabold text-slate-900 tracking-tight leading-snug">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
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
