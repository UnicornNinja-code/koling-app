import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

/**
 * ThemeToggle Component
 * Provides seamless light/dark theme switching with rich visual states.
 * Supports variants: "button" (compact icon button), "pill" (interactive switcher), and "segmented".
 */
export function ThemeToggle({
  variant = "button",
  size = "md",
  showLabel = false,
  className = "",
}) {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner select-none ${className}`}
        role="group"
        aria-label="Pengaturan Tema"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
            !isDark
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
          title="Mode Terang"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          {showLabel && <span>Terang</span>}
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
            isDark
              ? "bg-slate-900 text-white shadow-xs border border-slate-700 font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
          title="Mode Gelap"
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          {showLabel && <span>Gelap</span>}
        </button>
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div
        className={`flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            !isDark
              ? "bg-white text-blue-600 shadow-xs border border-slate-200/80"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Mode Terang</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            isDark
              ? "bg-slate-900 text-blue-400 shadow-xs border border-slate-700"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Moon className="w-4 h-4 text-blue-400" />
          <span>Mode Gelap</span>
        </button>
      </div>
    );
  }

  // Default "button" variant
  const sizeClasses = {
    sm: "p-1.5 text-xs rounded-lg",
    md: "p-2 text-sm rounded-xl",
    lg: "p-2.5 text-base rounded-xl",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      aria-label="Toggle Mode Terang / Gelap"
      className={`inline-flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    >
      {isDark ? (
        <Sun className={`${iconSizes[size] || iconSizes.md} text-amber-400 animate-in spin-in-180 duration-300`} />
      ) : (
        <Moon className={`${iconSizes[size] || iconSizes.md} text-slate-700 dark:text-slate-200 animate-in spin-in-180 duration-300`} />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? "Mode Terang" : "Mode Gelap"}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
