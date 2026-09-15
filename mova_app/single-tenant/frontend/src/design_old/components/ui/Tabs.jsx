import React from "react";

/**
 * MOVA Design System v3.0 Tabs Component
 * Variants: 'pill' (Background toggle) | 'underline' (Underlined active tab)
 */
export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = "pill", // 'pill' | 'underline'
  size = "md",
  className = "",
}) {
  if (variant === "underline") {
    return (
      <div className={`border-b border-slate-200 dark:border-slate-800 flex gap-6 ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange && onChange(tab.id)}
              className={`pb-3 text-sm font-['Inter'] font-medium transition-all duration-150 flex items-center gap-2 relative ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Pill style
  return (
    <div
      className={`inline-flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-[10px] border border-slate-200/80 dark:border-slate-750 gap-1 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange && onChange(tab.id)}
            className={`px-3 py-1.5 rounded-[7px] text-xs font-['Inter'] font-semibold transition-all duration-150 flex items-center gap-1.5 select-none ${
              isActive
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
