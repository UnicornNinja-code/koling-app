import React from "react";
import { AlertTriangle, Bike, Clock, CheckCircle2, UserX } from "lucide-react";

/**
 * RiderStatusBadge
 * Specialized badge for rider operational lifecycle states.
 */
export function RiderStatusBadge({ status, className = "" }) {
  const norm = (status || "").toUpperCase();

  switch (norm) {
    case "OPERATING":
    case "AKTIF":
    case "ON_TIME":
    case "CHECKED_IN":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Aktif Beroperasi
        </span>
      );

    case "PLOTTED":
    case "TERPLOTING":
    case "ASSIGNED":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Terploting
        </span>
      );

    case "WAITING":
    case "FIFO":
    case "DUTY_CONFIRMED":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Siap Shift (FIFO)
        </span>
      );

    case "DEVIATION":
    case "DEVIASI":
    case "OUTSIDE_GEOFENCE":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse ${className}`}
        >
          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
          Deviasi Geofence
        </span>
      );

    case "COMPLETED":
    case "SELESAI":
    case "OFF_DUTY":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${className}`}
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          Selesai Shift
        </span>
      );

    case "UNCONFIRMED":
    case "BELUM_HADIR":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
        >
          <UserX className="w-2.5 h-2.5 text-slate-400" />
          Belum Hadir
        </span>
      );
  }
}

export default RiderStatusBadge;

