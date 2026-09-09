import React, { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
import { ChevronDown } from "lucide-react";

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
    <div className="w-full space-y-1 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#525252]"
        >
          {label}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full bg-white text-[#111111] border border-[#E5E5E5] rounded-[4px] appearance-none",
            "px-2.5 py-1.5 pr-8 min-h-[34px] text-xs transition-colors outline-none",
            "focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
            "disabled:bg-[#F5F5F5] disabled:text-[#A3A3A3] disabled:cursor-not-allowed cursor-pointer",
            error && "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3 text-[#A3A3A3] pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </div>
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

