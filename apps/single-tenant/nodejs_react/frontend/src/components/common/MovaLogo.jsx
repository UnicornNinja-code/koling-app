import React from "react";

/**
 * Authentic Mova. Enterprise Brand Logo Component
 * Enforces strict Inter font typography, bold/black weight, and signature orange dot.
 *
 * @param {"xs" | "sm" | "md" | "lg" | "xl" | "2xl"} size - Logo size scale
 * @param {"full" | "mark-only" | "compact"} variant - "full" (Mova.) vs "mark-only" (M.) vs "compact"
 * @param {"auto" | "light" | "dark"} theme - Text color adaptation: dark (white text) or light (dark text)
 * @param {string} className - Extra Tailwind CSS classes
 */
export function MovaLogo({
  size = "md",
  variant = "full",
  theme = "auto",
  showSubtitle = false,
  subtitle = "Operational Intelligence",
  className = "",
  style,
  ...props
}) {
  const sizeMap = {
    xs: { text: "text-sm", dot: "text-[#ea580c] text-sm", sub: "text-[8px]" },
    sm: { text: "text-lg", dot: "text-[#ea580c] text-lg", sub: "text-[9px]" },
    md: { text: "text-2xl", dot: "text-[#ea580c] text-2xl", sub: "text-[10px]" },
    lg: { text: "text-3xl", dot: "text-[#ea580c] text-3xl", sub: "text-xs" },
    xl: { text: "text-5xl", dot: "text-[#ea580c] text-5xl", sub: "text-xs" },
    "2xl": { text: "text-7xl", dot: "text-[#ea580c] text-7xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const textColorClass =
    theme === "dark"
      ? "text-white"
      : theme === "light"
      ? "text-[#111111]"
      : "text-[#111111] dark:text-white";

  const mainText = variant === "mark-only" ? "M" : "Mova";

  return (
    <div
      className={`inline-flex flex-col select-none font-sans ${className}`}
      style={{ fontFamily: "'Inter', sans-serif", ...style }}
      {...props}
    >
      <div className="inline-flex items-baseline leading-none tracking-[-0.04em] font-black">
        <span className={`${currentSize.text} ${textColorClass} font-black leading-none`}>
          {mainText}
        </span>
        <span className={`${currentSize.dot} font-black leading-none inline-block ml-[0.5px] text-[#ea580c]`}>
          .
        </span>
      </div>
      {showSubtitle && (
        <span className={`text-[#737373] font-semibold uppercase tracking-wider mt-0.5 ${currentSize.sub}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

export default MovaLogo;
