import React from "react";
import { ComboChart } from "@carbon/charts-react";
import { useTheme } from "../../../context/ThemeContext.jsx";

/**
 * Carbon Combo Chart
 * Multidimensional comparison (e.g. Bar volumes vs Line compliance rate)
 */
export function CarbonComboChart({
  data = [],
  options = {},
  height = "340px",
  className = "",
}) {
  const { theme } = useTheme();
  const carbonTheme = theme === "dark" ? "g100" : "white";

  const defaultOptions = {
    title: options.title || "Multidimensional Operational Metrics",
    axes: {
      left: { mapsTo: "value", title: options.yAxisTitle || "Volume" },
      bottom: { mapsTo: "date", scaleType: "labels", title: options.xAxisTitle || "Timeline" },
      right: { mapsTo: "rate", title: options.rightYAxisTitle || "Rate (%)", correspondingDatasets: options.correspondingDatasets || ["compliance"] },
    },
    comboChartTypes: options.comboChartTypes || [
      { type: "simple-bar", options: {}, correspondingDatasets: ["orders"] },
      { type: "line", options: {}, correspondingDatasets: ["compliance"] },
    ],
    height,
    theme: carbonTheme,
    ...options,
  };

  return (
    <div className={`cds-chart-container w-full ${className}`}>
      <ComboChart data={data} options={defaultOptions} />
    </div>
  );
}
