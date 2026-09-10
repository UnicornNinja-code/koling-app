import React from "react";
import { cn } from "../../lib/utils.js";

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  label,
  description,
  className = "",
  id,
  ...props
}) {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  const trackSizes = {
    sm: "w-8 h-4.5 p-0.5 rounded-[4px]",
    md: "w-10 h-5.5 p-0.5 rounded-[4px]",
    lg: "w-12 h-6.5 p-0.75 rounded-[5px]",
  };

  const thumbSizes = {
    sm: "w-3.5 h-3.5 rounded-[3px]",
    md: "w-4.5 h-4.5 rounded-[3px]",
    lg: "w-5 h-5 rounded-[3px]",
  };

  const thumbTranslate = {
    sm: "translate-x-3.5",
    md: "translate-x-4.5",
    lg: "translate-x-5.5",
  };

  const handleClick = (e) => {
    if (disabled) return;
    onChange?.(!checked, e);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange?.(!checked, e);
    }
  };

  return (
    <div className={cn("inline-flex items-start gap-3 select-none", disabled && "opacity-50 cursor-not-allowed", className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative inline-flex shrink-0 items-center cursor-pointer transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B0F17]",
          "border",
          checked ? "bg-[#EA580C] border-[#EA580C]" : "bg-slate-200 dark:bg-[#1E293B] border-slate-300 dark:border-[#334155] hover:bg-slate-300 dark:hover:bg-[#334155]",
          disabled && "cursor-not-allowed",
          trackSizes[size] || trackSizes.md
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block transform bg-white shadow-xs transition duration-200 ease-in-out",
            checked ? cn(thumbTranslate[size] || thumbTranslate.md, "bg-white") : "translate-x-0 bg-white",
            thumbSizes[size] || thumbSizes.md
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col cursor-pointer" onClick={handleClick}>
          {label && (
            <label htmlFor={switchId} className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

