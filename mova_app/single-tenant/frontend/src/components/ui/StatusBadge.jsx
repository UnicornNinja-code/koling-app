import React from "react";
import { Badge } from "./Badge.jsx";

/**
 * MOVA Design System v3.0 StatusBadge
 * Auto-maps domain status codes to correct label, colors, and dot indicators
 */
export function StatusBadge({ status, label, size = "md", className = "" }) {
  const normStatus = (status || "").toUpperCase();

  const statusMap = {
    // General Active / Inactive
    ACTIVE: { variant: "success", label: "Aktif", dot: true },
    AKTIF: { variant: "success", label: "Aktif", dot: true },
    INACTIVE: { variant: "neutral", label: "Nonaktif", dot: false },
    NONAKTIF: { variant: "neutral", label: "Nonaktif", dot: false },

    // Fleet / Armada Statuses
    AVAILABLE: { variant: "info", label: "Tersedia", dot: true },
    TERSEDIA: { variant: "info", label: "Tersedia", dot: true },
    IN_USE: { variant: "primary", label: "Digunakan", dot: true },
    DIGUNAKAN: { variant: "primary", label: "Digunakan", dot: true },
    MAINTENANCE: { variant: "warning", label: "Maintenance", dot: true },
    PERAWATAN: { variant: "warning", label: "Perawatan", dot: true },
    RESERVED: { variant: "warning", label: "Reserved", dot: true },
    HELD: { variant: "warning", label: "Hold 5 Menit", dot: true },
    CLAIMED: { variant: "primary", label: "Klaim Aktif", dot: true },

    // Rider & Distribution Operational Statuses
    ON_DUTY: { variant: "warning", label: "Tugas", dot: true },
    TUGAS: { variant: "warning", label: "Tugas", dot: true },
    OPERATING: { variant: "success", label: "Aktif", dot: true },
    CHECKED_IN: { variant: "success", label: "Check-in", dot: true },
    OFFLINE: { variant: "danger", label: "Offline", dot: true },
    DEVIATION: { variant: "danger", label: "Deviasi", dot: true },
    DEVIASI: { variant: "danger", label: "Deviasi", dot: true },
    OUTSIDE_GEOFENCE: { variant: "danger", label: "Luar Geofence", dot: true },
    ON_TIME: { variant: "success", label: "On Time", dot: true },
    LATE: { variant: "warning", label: "Terlambat", dot: true },
    TERLAMBAT: { variant: "warning", label: "Terlambat", dot: true },
    COMPLETED: { variant: "info", label: "Selesai", dot: false },
    SELESAI: { variant: "info", label: "Selesai", dot: false },
    OFF_DUTY: { variant: "neutral", label: "Off Duty", dot: false },
    WAITING: { variant: "warning", label: "Siap Shift (FIFO)", dot: true },
    PLOTTED: { variant: "info", label: "Terploting", dot: true },
    ASSIGNED: { variant: "info", label: "Ditugaskan", dot: true },
    UNCONFIRMED: { variant: "neutral", label: "Belum Hadir", dot: false },
    BELUM_HADIR: { variant: "neutral", label: "Belum Hadir", dot: false },

    // TOPSIS Evaluation Badges
    TERBAIK: { variant: "success", label: "Terbaik", dot: false },
    SANGAT_BAIK: { variant: "success", label: "Sangat Baik", dot: false },
    BAIK: { variant: "info", label: "Baik", dot: false },
    CUKUP: { variant: "warning", label: "Cukup", dot: false },
    KURANG: { variant: "danger", label: "Kurang", dot: false },

    // Roles
    SUPERADMIN: { variant: "purple", label: "SUPERADMIN", dot: false },
    MANAGEMENT: { variant: "primary", label: "MANAGEMENT", dot: false },
    SUPERVISOR: { variant: "cyan", label: "SUPERVISOR", dot: false },
    RIDER: { variant: "success", label: "RIDER", dot: false },

    // System Data Health
    VALID: { variant: "success", label: "VALID", dot: true },
    PENDING: { variant: "warning", label: "Pending", dot: true },
    COMPLIANT: { variant: "success", label: "COMPLIANT", dot: true },
  };

  const config = statusMap[normStatus] || {
    variant: "neutral",
    label: label || status || "Unknown",
    dot: false,
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={config.dot}
      className={className}
    >
      {label || config.label}
    </Badge>
  );
}
