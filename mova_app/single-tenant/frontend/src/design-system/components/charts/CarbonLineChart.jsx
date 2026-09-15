import React from "react";
import { LineChart, AreaChart, StackedAreaChart } from "@carbon/charts-react";
import { useTheme } from "../../../context/ThemeContext.jsx";

/**
 * Carbon Line & Area Charts Suite
 * Real-time operational trends, performance, and telemetry time-series
 */
export function CarbonLineChart({
  data = [],
  options = {},
  type = "line", // "line" | "area" | "stacked-area"
  height = "320px",
  className = "",
}) {
  const { theme } = useTheme();
  const carbonTheme = theme === "dark" ? "g100" : "white";

  const defaultOptions = {
    title: options.title || "Telemetry Time-Series Trends",
    axes: {
      left: { mapsTo: "value", title: options.yAxisTitle || "Metrics" },
      bottom: { mapsTo: "date", scaleType: "labels", title: options.xAxisTitle || "Timeline" },
    },
    curve: "curveMonotoneX",
    height,
    theme: carbonTheme,
    ...options,
  };

  if (type === "area") {
    return (
      <div className={`cds-chart-container w-full ${className}`}>
        <AreaChart data={data} options={defaultOptions} />
      </div>
    );
  }

  if (type === "stacked-area") {
    return (
      <div className={`cds-chart-container w-full ${className}`}>
        <StackedAreaChart data={data} options={defaultOptions} />
      </div>
    );
  }

  return (
    <div className={`cds-chart-container w-full ${className}`}>
      <LineChart data={data} options={defaultOptions} />
    </div>
  );
}
