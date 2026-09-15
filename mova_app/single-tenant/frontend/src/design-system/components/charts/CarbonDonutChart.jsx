import React from "react";
import { DonutChart, PieChart } from "@carbon/charts-react";
import { useTheme } from "../../../context/ThemeContext.jsx";

/**
 * Carbon Donut & Pie Charts
 * Proportional operational distribution (Status, Fleet condition, Resource allocation)
 */
export function CarbonDonutChart({
  data = [],
  options = {},
  type = "donut", // "donut" | "pie"
  height = "320px",
  className = "",
}) {
  const { theme } = useTheme();
  const carbonTheme = theme === "dark" ? "g100" : "white";

  const defaultOptions = {
    title: options.title || "Status Distribution",
    resizable: true,
    donut: {
      center: {
        label: options.centerLabel || "Total",
      },
    },
    height,
    theme: carbonTheme,
    ...options,
  };

  if (type === "pie") {
    return (
      <div className={`cds-chart-container w-full ${className}`}>
        <PieChart data={data} options={defaultOptions} />
      </div>
    );
  }

  return (
    <div className={`cds-chart-container w-full ${className}`}>
      <DonutChart data={data} options={defaultOptions} />
    </div>
  );
}
