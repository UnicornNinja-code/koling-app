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
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700"
        >
          {label}
          {required && <span className="text-[#FF634A] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full bg-white text-slate-900 border border-[#D2D2D4] rounded-lg appearance-none",
            "px-3.5 py-2.5 pr-9 min-h-[44px] text-xs md:text-sm transition-all outline-none",
            "focus:border-[#FF634A] focus:ring-1 focus:ring-[#FF634A]",
            "disabled:bg-[#F4F4F6] disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
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

        <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </div>
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
