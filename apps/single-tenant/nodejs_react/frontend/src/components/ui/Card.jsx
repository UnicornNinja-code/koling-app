import React from "react";
import { cn } from "../../lib/utils.js";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#131822] rounded-[6px] border border-slate-200 dark:border-[#1E293B] transition-colors overflow-hidden text-slate-900 dark:text-slate-100 shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-4 py-3.5 flex flex-col space-y-0.5 border-b border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#131822]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "font-heading font-bold text-sm md:text-base text-slate-900 dark:text-white leading-tight tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn("text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-4 md:p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-4 py-3 bg-slate-50 dark:bg-[#0B0F17] border-t border-slate-200 dark:border-[#1E293B] flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

