import React from "react";
import { cn } from "../../lib/utils.js";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  isPending = false,
  loading = false,
  isLoading: isLoadingProp,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  type = "button",
  onClick,
  ...props
}) {
  const isLoading = isPending || loading || !!isLoadingProp;
  const isDisabled = disabled || isLoading;

  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-[6px] select-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer " +
    "active:scale-[0.99]";

  const variants = {
    primary:
      "bg-[#EA580C] hover:bg-[#C2410C] text-white focus-visible:ring-[#EA580C] font-semibold border border-transparent shadow-xs",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-800 focus-visible:ring-slate-400 font-semibold border border-slate-300 shadow-2xs hover:border-slate-400",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 focus-visible:ring-slate-400 font-medium",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-400 font-medium border border-transparent",
    danger:
      "bg-[#EF4444] hover:bg-[#DC2626] text-white focus-visible:ring-[#EF4444] font-semibold border border-transparent shadow-xs",
    subtle:
      "bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 focus-visible:ring-orange-500 font-semibold border border-orange-200",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1.5 h-8",
    md: "px-3.5 py-1.5 text-xs gap-2 h-9",
    lg: "px-4 py-2 text-sm gap-2 h-10",
    icon: "w-8 h-8 p-0 min-h-[32px] min-w-[32px]",
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
