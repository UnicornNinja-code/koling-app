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
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700"
        >
          {label}
          {required && <span className="text-[#FF634A] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full bg-white text-slate-900 placeholder:text-slate-400 border border-[#D2D2D4] rounded-lg",
            "px-3.5 py-2.5 min-h-[44px] text-xs md:text-sm transition-all outline-none",
            "focus:border-[#FF634A] focus:ring-1 focus:ring-[#FF634A]",
            "disabled:bg-[#F4F4F6] disabled:text-slate-400 disabled:cursor-not-allowed",
            LeftIcon && "pl-9",
            RightIcon && "pr-9",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
            className
          )}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-[11px] text-slate-500 font-normal">{helperText}</p>
      )}
    </div>
  );
});
