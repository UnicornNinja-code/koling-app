import React, { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA Input Component — Design System v3.0 SSOT
 * Height: 36-40px, Radius: 8px (rounded-md), Font: 14px, Focus: ring-primary
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    className = "",
    leftIcon: LeftIcon = null,
    rightIcon: RightIcon = null,
    type = "text",
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="w-full space-y-1.5 text-left font-sans">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-foreground/90"
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 text-muted-foreground pointer-events-none flex items-center justify-center">
            {typeof LeftIcon === "string" ? (
              <span className="material-symbols-outlined text-sm">{LeftIcon}</span>
            ) : (
              <LeftIcon className="w-4 h-4" />
            )}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full bg-background text-foreground placeholder:text-muted-foreground border border-input rounded-md",
            "px-3 py-1.5 min-h-[36px] h-9 text-xs md:text-sm transition-all outline-none shadow-xs",
            "focus:border-primary focus:ring-1 focus:ring-primary/20",
            "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
            LeftIcon && "pl-9",
            RightIcon && "pr-9",
            error && "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/20",
            className
          )}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3 text-muted-foreground pointer-events-none flex items-center justify-center">
            {typeof RightIcon === "string" ? (
              <span className="material-symbols-outlined text-sm">{RightIcon}</span>
            ) : (
              <RightIcon className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-[11px] text-muted-foreground font-normal">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
