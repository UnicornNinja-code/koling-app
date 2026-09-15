import React from "react";
import { Phone, MapPin, Battery, Wifi, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { Avatar } from "../ui/Avatar.jsx";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { Button } from "../ui/Button.jsx";

export function RiderOperationalCard({
  rider = {},
  onCall = () => {},
  onReassign = () => {},
  onViewDetails = () => {},
  className = "",
}) {
  const {
    id = "R-001",
    name = "Ahmad Fauzi",
    phone = "0812-3456-7890",
    zone = "ZON-SDA-01",
    zone_name = "Alun-Alun Sidoarjo",
    current_location = "Jl. Cokronegoro No. 1",
    status = "AKTIF",
    shift_start = "07:30",
    shift_duration = "3 jam 45 mnt",
    battery = 84,
    gps_signal = "Kuat (3m)",
    sales_today = 42,
    sales_target = 60,
    compliance_score = "98%",
  } = rider;

  const salesPercent = Math.min(100, Math.round((sales_today / (sales_target || 1)) * 100));

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 p-4 shadow-xs font-['Inter'] hover:shadow-md transition-all ${className}`}>
      {/* Header: Avatar, Name, Phone & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar role="rider" name={name} size="md" status={status === "AKTIF" ? "online" : "busy"} />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {name}
            </h4>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {id} • {phone}
            </div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Operational Indicators: Battery, GPS, Shift Time */}
      <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Battery className={`w-3.5 h-3.5 ${battery > 30 ? "text-emerald-500" : "text-red-500"}`} />
          <span className="font-semibold text-slate-900 dark:text-white">{battery}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Wifi className="w-3.5 h-3.5 text-blue-500" />
          <span className="truncate">{gps_signal}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 justify-end">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{shift_duration}</span>
        </div>
      </div>

      {/* Zone & Location */}
      <div className="space-y-1.5 text-xs mb-3">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-semibold">{zone_name}</span>
          <span className="text-[10px] text-slate-400 font-mono">({zone})</span>
        </div>
        <div className="text-[11px] text-slate-500 pl-5 truncate">
          Titik: {current_location}
        </div>
      </div>

      {/* Sales Target Progress */}
      <div className="space-y-1 mb-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-500">Penjualan Hari Ini</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {sales_today} / {sales_target} cup ({salesPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            style={{ width: `${salesPercent}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 text-xs"
          icon={Phone}
          onClick={() => onCall(rider)}
        >
          Hubungi
        </Button>
        <Button
          variant="accent"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onReassign(rider)}
        >
          Reallokasi
        </Button>
      </div>
    </div>
  );
}

export default RiderOperationalCard;
