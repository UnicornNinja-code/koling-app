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
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  type = "button",
  onClick,
  ...props
}) {
  const isLoading = isPending || loading;
  const isDisabled = disabled || isLoading;

  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all rounded-lg select-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer " +
    "active:scale-[0.98]";

  const variants = {
    primary:
      "bg-[#FF634A] hover:bg-[#E54E36] text-white focus-visible:ring-[#FF634A] shadow-xs font-semibold border border-transparent",
    secondary:
      "bg-slate-900 hover:bg-slate-800 text-white focus-visible:ring-slate-700 font-semibold border border-transparent",
    outline:
      "border border-[#D2D2D4] bg-white text-slate-700 hover:bg-[#E7E7E7] hover:text-slate-900 focus-visible:ring-[#D2D2D4] font-medium shadow-xs",
    ghost:
      "bg-transparent hover:bg-[#E7E7E7] text-slate-600 hover:text-slate-900 focus-visible:ring-slate-300 font-medium border border-transparent",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500 font-semibold shadow-xs border border-transparent",
    subtle:
      "bg-[#FF634A]/10 text-[#FF634A] hover:bg-[#FF634A]/20 focus-visible:ring-[#FF634A] font-semibold border border-[#FF634A]/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[36px]",
    md: "px-4 py-2.5 text-xs md:text-sm gap-2 min-h-[44px]",
    lg: "px-5 py-3 text-sm md:text-base gap-2.5 min-h-[48px]",
    icon: "w-10 h-10 p-0 min-h-[40px] min-w-[40px]",
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
