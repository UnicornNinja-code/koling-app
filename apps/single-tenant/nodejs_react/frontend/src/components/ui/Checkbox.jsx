import React, { useRef, useEffect } from "react";
import { cn } from "../../lib/utils.js";
import { Check, Minus } from "lucide-react";

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  description,
  className = "",
  id,
  ...props
}) {
  const inputRef = useRef(null);
  const checkboxId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e) => {
    if (disabled) return;
    onChange?.(e.target.checked, e);
  };

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "inline-flex items-start gap-2.5 cursor-pointer select-none group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
        <input
          ref={inputRef}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "w-4.5 h-4.5 rounded-[4px] border transition-all duration-150 flex items-center justify-center",
            "border-slate-300 bg-white shadow-2xs",
            (checked || indeterminate) && "bg-[#EA580C] border-[#EA580C] text-white",
            !checked && !indeterminate && !disabled && "group-hover:border-slate-400 group-hover:bg-slate-50",
            "focus-within:ring-2 focus-within:ring-[#EA580C] focus-within:ring-offset-1 focus-within:ring-offset-white"
          )}
        >
          {indeterminate ? (
            <Minus className="w-3 h-3 stroke-[3] text-white" />
          ) : checked ? (
            <Check className="w-3 h-3 stroke-[3] text-white" />
          ) : null}
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs md:text-sm font-semibold text-slate-800 leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] md:text-xs text-slate-500 leading-relaxed mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
