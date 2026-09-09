import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils.js";

export function Tooltip({
  content,
  position = "top",
  delay = 150,
  children,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) return children;

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrows = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent border-t-4 border-x-4 border-b-0",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent border-b-4 border-x-4 border-t-0",
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent border-l-4 border-y-4 border-r-0",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent border-r-4 border-y-4 border-l-0",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-800 border border-slate-700 rounded-[4px] shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-150 animate-in fade-in-0 zoom-in-95",
            positions[position] || positions.top,
            className
          )}
        >
          {content}
          <div className={cn("absolute w-0 h-0", arrows[position] || arrows.top)} />
        </div>
      )}
    </div>
  );
}
