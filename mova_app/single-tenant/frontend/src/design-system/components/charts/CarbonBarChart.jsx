import React from "react";
import { SimpleBarChart, GroupedBarChart, StackedBarChart } from "@carbon/charts-react";
import { useTheme } from "../../../context/ThemeContext.jsx";

/**
 * Carbon Bar Charts Suite (Simple, Grouped, Stacked)
 * Automatically syncs with current Carbon theme (g100 dark / white light)
 */
export function CarbonBarChart({
  data = [],
  options = {},
  type = "simple", // "simple" | "grouped" | "stacked"
  height = "320px",
  className = "",
}) {
  const { theme } = useTheme();
  const carbonTheme = theme === "dark" ? "g100" : "white";

  const defaultOptions = {
    title: options.title || "Operational Metric Distribution",
    axes: {
      left: { mapsTo: "value", title: options.yAxisTitle || "Value" },
      bottom: { mapsTo: "group", scaleType: "labels", title: options.xAxisTitle || "Category" },
    },
    height,
    theme: carbonTheme,
    ...options,
  };

  if (type === "grouped") {
    return (
      <div className={`cds-chart-container w-full ${className}`}>
        <GroupedBarChart data={data} options={defaultOptions} />
      </div>
    );
  }

  if (type === "stacked") {
    return (
      <div className={`cds-chart-container w-full ${className}`}>
        <StackedBarChart data={data} options={defaultOptions} />
      </div>
    );
  }

  return (
    <div className={`cds-chart-container w-full ${className}`}>
      <SimpleBarChart data={data} options={defaultOptions} />
    </div>
  );
}
