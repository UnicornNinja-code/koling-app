import React from "react";
import { MeterChart, GaugeChart } from "@carbon/charts-react";
import { useTheme } from "../../../context/ThemeContext.jsx";

/**
 * Carbon Meter & Gauge Charts
 * SLA, compliance rates, battery levels, quota consumption
 */
export function CarbonMeterChart({
  data = [],
  options = {},
  type = "meter", // "meter" | "gauge"
  height = "240px",
  className = "",
}) {
  const { theme } = useTheme();
  const carbonTheme = theme === "dark" ? "g100" : "white";

  const defaultOptions = {
    title: options.title || "Compliance & SLA Rate",
    meter: {
      peak: options.peak || 100,
      status: {
        ranges: options.ranges || [
          { range: [0, 50], status: "danger" },
          { range: [50, 79], status: "warning" },
          { range: [80, 100], status: "success" },
        ],
      },
    },
    height,
    theme: carbonTheme,
    ...options,
  };

  if (type === "gauge") {
    return (
      <div className={`cds-chart-container w-full ${className}`}>
        <GaugeChart data={data} options={defaultOptions} />
      </div>
    );
  }

  return (
    <div className={`cds-chart-container w-full ${className}`}>
      <MeterChart data={data} options={defaultOptions} />
    </div>
  );
}
