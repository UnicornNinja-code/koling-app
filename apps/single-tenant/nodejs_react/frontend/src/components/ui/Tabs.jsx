import React from "react";
import { cn } from "../../lib/utils.js";

export function Tabs({ value, onValueChange, className, children, ...props }) {
  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child, { activeValue: value, onValueChange });
      })}
    </div>
  );
}

export function TabsList({ activeValue, onValueChange, className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-slate-100 rounded-[6px] border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full select-none",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child, {
          isActive: child.props.value === activeValue,
          onSelect: () => onValueChange?.(child.props.value),
        });
      })}
    </div>
  );
}

export function TabsTrigger({
  value,
  isActive = false,
  onSelect,
  disabled = false,
  leftIcon: LeftIcon = null,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-[4px] transition-all min-h-[30px] cursor-pointer whitespace-nowrap text-xs font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-1 focus-visible:ring-offset-white",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        isActive
          ? "bg-white text-slate-900 font-bold border border-slate-300/80 shadow-2xs"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent",
        className
      )}
      {...props}
    >
      {LeftIcon && <LeftIcon className="w-3.5 h-3.5 shrink-0 text-[#EA580C]" />}
      <span>{children}</span>
    </button>
  );
}

export function TabsContent({ value, activeValue, onValueChange, className, children, ...props }) {
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      className={cn("animate-in fade-in duration-150 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
