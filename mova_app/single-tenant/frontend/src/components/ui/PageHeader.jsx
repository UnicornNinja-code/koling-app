import React from "react";

/**
 * MOVA Design System v3.0 PageHeader Component
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  actions,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-2 pb-5 ${className}`}>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium font-['Inter']">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? "text-slate-700 dark:text-slate-300 font-semibold" : ""}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 dark:text-white font-['Inter'] tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-['Inter']">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
