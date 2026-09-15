import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA DonutChartWidget Component — Design System v3.0 SSOT
 * Pure lightweight SVG Donut Chart with center value and legend
 * Exact match with Ringkasan Bobot Kriteria in assets/img/dss.png & Distribusi Armada in map ops.png
 */
export function DonutChartWidget({
  centerValue = "100%",
  centerLabel = "Total Bobot",
  data = [
    { label: "C1 Densitas POI", value: 18, color: "#10B981" },
    { label: "C2 Diversitas POI", value: 16, color: "#06B6D4" },
    { label: "C3 Skor Keramaian", value: 14, color: "#3B82F6" },
    { label: "C4 Cuaca", value: 12, color: "#F59E0B" },
    { label: "C5 Jarak Rider", value: 10, color: "#EF4444" },
    { label: "C6 Kompetitor", value: 10, color: "#64748B" },
  ],
  size = 140,
  strokeWidth = 16,
  showLegend = true,
  className = "",
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-6 font-sans select-none", className)}>
      {/* 1. SVG Donut Canvas */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-[#1E293B]"
          />

          {/* Segment strokes */}
          {data.map((item, idx) => {
            const strokeDasharray = (item.value / total) * circumference;
            const strokeDashoffset = -cumulativeOffset;
            cumulativeOffset += strokeDasharray;

            return (
              <circle
                key={item.label || idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xl font-heading font-extrabold text-[#0F172A] dark:text-white leading-tight">
            {centerValue}
          </span>
          {centerLabel && (
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-none mt-0.5">
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* 2. Legend List */}
      {showLegend && (
        <div className="flex-1 w-full space-y-1.5 text-xs">
          {data.map((item, idx) => (
            <div key={item.label || idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#0F172A] dark:text-white truncate font-medium">
                  {item.label}
                </span>
              </div>
              <span className="font-mono font-bold text-[#64748B] dark:text-[#94A3B8] shrink-0">
                {typeof item.value === "number" && item.value < 1
                  ? item.value.toFixed(2)
                  : item.displayValue || item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DonutChartWidget;
