import React, { forwardRef } from "react";

/**
 * MOVA Design System v3.0 Input Component
 * Supports left/right icons, error message, label, helper text, and clear button
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    iconRight: IconRight,
    onRightIconClick,
    className = "",
    containerClassName = "",
    id,
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-['Inter'] flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          className={`w-full text-sm font-['Inter'] rounded-[8px] bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed ${
            Icon ? "pl-9" : "pl-3.5"
          } ${IconRight ? "pr-9" : "pr-3.5"} py-2 h-9.5 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
          } ${className}`}
          {...props}
        />

        {IconRight && (
          <button
            type="button"
            onClick={onRightIconClick}
            tabIndex={onRightIconClick ? 0 : -1}
            className={`absolute right-3 text-slate-400 dark:text-slate-500 flex items-center justify-center ${
              onRightIconClick ? "hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" : "pointer-events-none"
            }`}
          >
            <IconRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500 font-medium font-['Inter']">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-slate-400 dark:text-slate-500 font-['Inter']">
          {helperText}
        </span>
      )}
    </div>
  );
});
