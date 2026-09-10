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
          className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          {label}
          {required && <span className="text-[#EF4444] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
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
            "w-full bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-[#1E293B] rounded-[6px]",
            "px-3 py-1.5 min-h-[36px] text-xs md:text-sm transition-colors outline-none shadow-2xs",
            "focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] dark:focus:border-[#EA580C]",
            "disabled:bg-slate-100 dark:disabled:bg-[#131822] disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed",
            LeftIcon && "pl-9",
            RightIcon && "pr-9",
            error && "border-[#EF4444] dark:border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
            className
          )}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
            {typeof RightIcon === "string" ? (
              <i className={`bx ${RightIcon.startsWith("bx-") ? RightIcon : `bx-${RightIcon}`} text-sm`} />
            ) : (
              <RightIcon className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-medium text-[#EF4444] flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{helperText}</p>
      )}
    </div>
  );
});

