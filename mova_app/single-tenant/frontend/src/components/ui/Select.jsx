import React, { forwardRef } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "./Button.jsx";

/**
 * Carbon Select Component
 */
export const Select = forwardRef(function Select(
  {
    className = "",
    id,
    label,
    error,
    helperText,
    options = [],
    children,
    size = "md", // sm (32px) | md (40px) | lg (48px)
    disabled = false,
    ...props
  },
  ref
) {
  const sizeStyles = {
    sm: "h-[32px] text-[12px] pl-[12px] pr-[32px]",
    md: "h-[40px] text-[14px] pl-[16px] pr-[36px]",
    lg: "h-[48px] text-[14px] pl-[16px] pr-[36px]",
  };

  return (
    <div className="w-full flex flex-col gap-[var(--cds-spacing-02)]">
      {label && (
        <label
          htmlFor={id}
          className="cds-label-01 text-[var(--cds-text-secondary)] select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            "w-full appearance-none bg-[var(--cds-field)] hover:bg-[var(--cds-field-hover)] text-[var(--cds-text-primary)] border-b border-[var(--cds-border-strong)] transition-colors focus:outline-none focus:outline-2 focus:outline-offset-[-2px] focus:outline-[var(--cds-focus)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
            sizeStyles[size] || sizeStyles.md,
            error && "border-2 border-[var(--cds-support-error)] focus:outline-[var(--cds-support-error)]",
            className
          )}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[var(--cds-layer-01)] text-[var(--cds-text-primary)] py-1"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-[12px] pointer-events-none text-[var(--cds-icon-secondary)]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-[var(--cds-spacing-02)] text-[var(--cds-support-error)] cds-helper-text-01 font-normal not-italic">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="cds-helper-text-01 text-[var(--cds-text-helper)]">{helperText}</p>
      ) : null}
    </div>
  );
});
