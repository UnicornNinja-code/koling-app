import React from "react";

/**
 * MOVA Design System v3.0 Checkbox Component
 */
export function Checkbox({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = "",
  id,
}) {
  const checkId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label
      htmlFor={checkId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        id={checkId}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 rounded-[4px] border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
      />
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 font-['Inter']">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-['Inter']">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
