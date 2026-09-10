import React from "react";

/**
 * MOVA Design System v3.0 Switch Component
 */
export function Switch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className = "",
  id,
}) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label
      htmlFor={switchId}
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={switchId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`w-10 h-5.5 rounded-full transition-colors duration-200 bg-slate-200 dark:bg-slate-700 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500/20`}
        />
        <div
          className={`absolute left-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 shadow-sm peer-checked:translate-x-4.5`}
        />
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-['Inter']">
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
