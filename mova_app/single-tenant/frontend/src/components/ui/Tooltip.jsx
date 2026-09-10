import React, { useState } from "react";

/**
 * MOVA Design System v3.0 Tooltip Component
 */
export function Tooltip({
  children,
  content,
  position = "top", // 'top' | 'bottom' | 'left' | 'right'
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-[11px] font-medium font-['Inter'] px-2 py-1 rounded-[6px] shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
            positionStyles[position] || positionStyles.top
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
