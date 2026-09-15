import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "./Button.jsx";

/**
 * Carbon Text Input Component
 * Follows Carbon form field specifications:
 * - Label: label-01
 * - Field: bg(--cds-field), bottom border 1px solid (--cds-border-strong)
 * - Height: 32px (sm), 40px (md), 48px (lg)
 * - Error: border 2px solid (--cds-support-error) with error message
 */
export const Input = forwardRef(function Input(
  {
    className = "",
    type = "text",
    id,
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    size = "md", // sm (32px) | md (40px) | lg (48px)
    disabled = false,
    ...props
  },
  ref
) {
  const sizeStyles = {
    sm: "h-[32px] text-[12px] px-[12px]",
    md: "h-[40px] text-[14px] px-[16px]",
    lg: "h-[48px] text-[14px] px-[16px]",
  };

  return (
    <div className="w-full flex flex-col gap-[var(--cds-spacing-02)]">
      {label && (
        <label
          htmlFor={id}
          className="cds-label-01 text-[var(--cds-text-secondary)] select-none flex items-center justify-between"
        >
          <span>{label}</span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-[12px] flex items-center pointer-events-none text-[var(--cds-icon-secondary)]">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full bg-[var(--cds-field)] hover:bg-[var(--cds-field-hover)] text-[var(--cds-text-primary)] placeholder:text-[var(--cds-text-placeholder)] border-b border-[var(--cds-border-strong)] transition-colors focus:outline-none focus:outline-2 focus:outline-offset-[-2px] focus:outline-[var(--cds-focus)] disabled:opacity-50 disabled:cursor-not-allowed",
            sizeStyles[size] || sizeStyles.md,
            Icon && "pl-[36px]",
            rightElement && "pr-[36px]",
            error && "border-2 border-[var(--cds-support-error)] focus:outline-[var(--cds-support-error)]",
            className
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-[12px] flex items-center text-[var(--cds-icon-secondary)]">
            {rightElement}
          </div>
        )}
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
