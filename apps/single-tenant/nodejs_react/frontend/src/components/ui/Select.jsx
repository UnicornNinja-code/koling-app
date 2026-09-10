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
          className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          {label}
          {required && <span className="text-[#EF4444] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-[#1E293B] rounded-[6px] appearance-none shadow-2xs",
            "px-3 py-1.5 pr-8 min-h-[36px] text-xs md:text-sm transition-colors outline-none",
            "focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] dark:focus:border-[#EA580C]",
            "disabled:bg-slate-100 dark:disabled:bg-[#131822] disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer",
            error && "border-[#EF4444] dark:border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
            className
          )}
          {...props}
        >
          {placeholder && <option value="" className="text-slate-400 dark:text-slate-500 bg-white dark:bg-[#131822]">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-[#131822]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </div>
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

