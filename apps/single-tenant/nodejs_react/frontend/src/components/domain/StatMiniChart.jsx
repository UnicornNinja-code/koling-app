import React from "react";

/**
 * StatMiniChart Component
 * Renders lightweight vector SVG area / line / bar sparklines with gradients.
 */
export function StatMiniChart({
  data = [12, 18, 14, 25, 32, 28, 42, 38, 45, 52, 48, 60],
  labels = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  type = "area", // "area" | "bar"
  color = "blue", // "blue" | "orange" | "emerald" | "purple"
  height = 80,
  showLabels = false,
  className = "",
}) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  const colorMap = {
    blue: {
      stroke: "#2563EB",
      fill: "url(#blueAreaGrad)",
      barFill: "#3B82F6",
    },
    orange: {
      stroke: "#F97316",
      fill: "url(#orangeAreaGrad)",
      barFill: "#FB923C",
    },
    emerald: {
      stroke: "#10B981",
      fill: "url(#emeraldAreaGrad)",
      barFill: "#34D399",
    },
    purple: {
      stroke: "#8B5CF6",
      fill: "url(#purpleAreaGrad)",
      barFill: "#A78BFA",
    },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  // Compute SVG Polyline points
  const width = 300;
  const padding = 10;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const points = data.map((val, index) => {
    const x = padding + (index / (data.length - 1)) * plotWidth;
    const y = height - padding - ((val - minVal) / range) * plotHeight;
    return `${x},${y}`;
  });

  const areaPath = `M ${padding},${height - padding} L ${points.join(" L ")} L ${width - padding},${height - padding} Z`;
  const linePath = `M ${points.join(" L ")}`;

  return (
    <div className={`w-full font-['Inter'] ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        style={{ maxHeight: `${height}px` }}
      >
        <defs>
          <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563EB" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#2563EB" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F97316" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#F97316" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10B981" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        {type === "area" ? (
          <>
            {/* Area Fill */}
            <path d={areaPath} fill={selectedColor.fill} />
            {/* Smooth Stroke Line */}
            <path
              d={linePath}
              fill="none"
              stroke={selectedColor.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* End Point Glow */}
            {data.length > 0 && (
              <circle
                cx={width - padding}
                cy={height - padding - ((data[data.length - 1] - minVal) / range) * plotHeight}
                r="4"
                fill={selectedColor.stroke}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            )}
          </>
        ) : (
          /* Mini Bar Chart */
          <g>
            {data.map((val, idx) => {
              const barWidth = (plotWidth / data.length) * 0.7;
              const x = padding + (idx / data.length) * plotWidth + barWidth * 0.15;
              const barH = ((val - minVal) / range) * plotHeight;
              const y = height - padding - barH;

              return (
                <rect
                  key={idx}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="2"
                  fill={selectedColor.barFill}
                  className="transition-all hover:opacity-80"
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Optional bottom timestamp labels */}
      {showLabels && labels && (
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
          <span>{labels[0]}</span>
          <span>{labels[Math.floor(labels.length / 2)]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      )}
    </div>
  );
}

export default StatMiniChart;
