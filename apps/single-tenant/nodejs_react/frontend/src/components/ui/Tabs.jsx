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
        "inline-flex items-center gap-1 p-0.5 bg-[#121215] rounded-[6px] border border-[#24242A] text-xs font-semibold overflow-x-auto max-w-full select-none",
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
        "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-all min-h-[28px] cursor-pointer whitespace-nowrap text-xs",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#EA580C]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        isActive
          ? "bg-[#18181B] text-[#FAFAFA] font-bold border border-[#3F3F46] shadow-xs"
          : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-zinc-800/60 border border-transparent",
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

