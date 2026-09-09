import React from "react";
import { cn } from "../../lib/utils.js";
import { Coffee, Loader2 } from "lucide-react";

export function MovaLoading({
  size = "md",
  text = "Memuat data operasional...",
  description,
  fullScreen = false,
  className = "",
}) {
  const sizeMap = {
    sm: { container: "p-4", icon: "w-5 h-5", text: "text-xs", ring: "w-10 h-10" },
    md: { container: "p-6", icon: "w-6 h-6", text: "text-sm", ring: "w-14 h-14" },
    lg: { container: "p-8", icon: "w-8 h-8", text: "text-base", ring: "w-20 h-20" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={cn("flex flex-col items-center justify-center text-center gap-3", currentSize.container, className)}>
      <div className="relative flex items-center justify-center">
        {/* Outer pulsating radar ring */}
        <div className={cn("absolute rounded-full border border-orange-500/30 animate-ping opacity-30", currentSize.ring)} />
        {/* Rotating dash spinner */}
        <div className={cn("absolute rounded-full border-2 border-[#ea580c] border-t-transparent animate-spin", currentSize.ring)} />
        {/* Center brand coffee icon */}
        <div className="w-9 h-9 rounded-[6px] bg-white border border-slate-200 flex items-center justify-center text-[#ea580c] shadow-xs">
          <Coffee className={cn("animate-pulse", currentSize.icon)} />
        </div>
      </div>

      {(text || description) && (
        <div className="flex flex-col items-center gap-0.5 mt-2">
          {text && <span className={cn("font-heading font-semibold text-slate-800", currentSize.text)}>{text}</span>}
          {description && <span className="text-xs text-slate-500 max-w-xs">{description}</span>}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}

export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };
  return <Loader2 className={cn("animate-spin text-[#ea580c]", sizes[size] || sizes.md, className)} />;
}
