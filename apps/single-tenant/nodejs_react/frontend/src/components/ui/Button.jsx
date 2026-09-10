import React from "react";
import { cn } from "../../lib/utils.js";
import { Loader2 } from "lucide-react";

/**
 * MOVA Button Component — Design System v3.0 SSOT
 * Variants: primary (#EA580C Signature Orange), secondary, outline, ghost, destructive, subtle
 * Heights: 36-40px (md: 36px, lg: 40px, sm: 32px), Radius: 8px (md), Font: 14px (md/lg)
 */
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
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md select-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-ring focus-visible:ring-offset-background " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer " +
    "active:scale-[0.99]";

  const variants = {
    primary:
      "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold border border-transparent shadow-xs active:bg-primary/95",
    secondary:
      "bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold border border-border shadow-xs",
    outline:
      "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground font-medium",
    ghost:
      "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground font-medium border border-transparent",
    destructive:
      "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold border border-transparent shadow-xs",
    danger:
      "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold border border-transparent shadow-xs",
    subtle:
      "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-semibold",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs gap-1.5 h-8",
    md: "px-4 py-1.5 text-sm gap-2 h-9",
    lg: "px-5 py-2 text-sm gap-2 h-10",
    icon: "w-9 h-9 p-0 min-h-[36px] min-w-[36px]",
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
      {children && <span>{children}</span>}
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </button>
  );
}

export default Button;
