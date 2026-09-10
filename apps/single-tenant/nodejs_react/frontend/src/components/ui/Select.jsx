import React, { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
import { ChevronDown } from "lucide-react";

/**
 * MOVA Select Component — Design System v3.0 SSOT
 * Height: 36-40px, Radius: 8px (rounded-md), Font: 14px, Focus: ring-primary
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    className = "",
    options = [],
    placeholder = "-- Pilih Opsi --",
    id,
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="w-full space-y-1.5 text-left font-sans">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-foreground/90"
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full bg-background text-foreground border border-input rounded-md appearance-none shadow-xs",
            "px-3 py-1.5 pr-8 min-h-[36px] h-9 text-xs md:text-sm transition-colors outline-none",
            "focus:border-primary focus:ring-1 focus:ring-primary/20",
            "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed cursor-pointer",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-muted-foreground bg-card">
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="text-foreground bg-card"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3 text-muted-foreground pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </div>
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

export default Select;
