/*
 * AnalyticsContract.js
 * Domain Contract Constants & Semantic Metadata for Milestone B-12: Reporting & Analytics Layer
 * Defines explicit denominators, population scopes, and semantic data statuses.
 */

export const ANALYTICS_VERSION = "MOVA-ANALYTICS-v1.0";

export const DATA_STATUS = {
  COMPLETE: "COMPLETE",
  NO_DATA: "NO_DATA",
  PARTIAL: "PARTIAL",
  DEGRADED: "DEGRADED",
};

export const POPULATION_SCOPES = {
  ALL_ASSIGNED: "ALL_ASSIGNED",          // All riders assigned in zone_assignments
  CHECKED_IN: "CHECKED_IN",              // Riders who successfully checked in
  OPERATING: "OPERATING",                // Riders currently in OPERATING state
  TRANSACTING: "TRANSACTING",            // Riders with >= 1 sales transaction
};

export const TIME_RANGE_PRESETS = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  LAST_7_DAYS: "7d",
  LAST_30_DAYS: "30d",
  THIS_MONTH: "month",
  CUSTOM: "custom",
};

/**
 * Standardized wrapper for numeric metrics with semantic status preservation
 */
export function formatMetric(value, sampleSize = 0, unit = "") {
  const num = typeof value === "number" ? value : parseFloat(value);
  const isValidNumber = !isNaN(num);

  if (!isValidNumber || sampleSize === 0) {
    return {
      value: 0,
      formatted: unit === "Rp" ? "Rp 0" : (unit === "%" ? "0.00%" : "0"),
      sample_size: sampleSize,
      data_status: DATA_STATUS.NO_DATA,
      unit,
    };
  }

  let formatted = String(num);
  if (unit === "Rp") {
    formatted = `Rp ${Math.round(num).toLocaleString("id-ID")}`;
  } else if (unit === "%") {
    formatted = `${num.toFixed(2)}%`;
  } else if (unit === "min") {
    formatted = `${num.toFixed(1)} min`;
  }

  return {
    value: parseFloat(num.toFixed(4)),
    formatted,
    sample_size: sampleSize,
    data_status: DATA_STATUS.COMPLETE,
    unit,
  };
}
