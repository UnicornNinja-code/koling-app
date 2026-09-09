import React, { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

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
    <div className="w-full space-y-1 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#A1A1AA]"
        >
          {label}
          {required && <span className="text-[#EF4444] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 text-[#71717A] pointer-events-none flex items-center justify-center">
            {typeof LeftIcon === "string" ? (
              <i className={`bx ${LeftIcon.startsWith("bx-") ? LeftIcon : `bx-${LeftIcon}`} text-sm`} />
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
            "w-full bg-[#18181B] text-[#FAFAFA] placeholder:text-[#71717A] border border-[#24242A] rounded-[6px]",
            "px-2.5 py-1.5 min-h-[34px] text-xs transition-colors outline-none",
            "focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]",
            "disabled:bg-[#121215] disabled:text-[#52525B] disabled:cursor-not-allowed",
            LeftIcon && "pl-8",
            RightIcon && "pr-8",
            error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
            className
          )}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3 text-[#71717A] pointer-events-none flex items-center justify-center">
            {typeof RightIcon === "string" ? (
              <i className={`bx ${RightIcon.startsWith("bx-") ? RightIcon : `bx-${RightIcon}`} text-sm`} />
            ) : (
              <RightIcon className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-medium text-[#DC2626] flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-[11px] text-[#737373] font-normal">{helperText}</p>
      )}
    </div>
  );
});

