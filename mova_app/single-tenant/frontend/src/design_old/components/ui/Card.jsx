import React from "react";

/**
 * MOVA Design System v3.0 Card Component
 */
export function Card({
  children,
  className = "",
  hoverable = false,
  padding = "p-5",
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] shadow-xs ${padding} ${
        hoverable
          ? "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", action, title, subtitle }) {
  const hasAlignClass = className.includes("items-");
  return (
    <div className={`flex ${hasAlignClass ? "" : "items-start"} justify-between gap-4 mb-4 ${className}`}>
      <div>
        {title && (
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0 flex items-center">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      {children}
    </div>
  );
}
