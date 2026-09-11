import React from "react";
import { cn } from "../../lib/utils.js";
import {
  Droplets,
  CloudRain,
  WindSpeed,
  Visibility,
  ChevronRight,
} from "../common/icons.jsx";
import { WeatherIcon } from "../ui/WeatherIcon.jsx";

/**
 * MOVA WeatherCardWidget — Kondisi Cuaca & Lingkungan
 * Exact SSOT from assets/img/dashboard.png
 */
export function WeatherCardWidget({
  city = "Sidoarjo",
  temperature = "31°C",
  condition = "Cerah Berawan",
  humidity = "65%",
  rainfall = "20%",
  windSpeed = "12.5 km/j",
  visibility = "10.0 km",
  onDetailClick,
  className = "",
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#1E293B] rounded-xl p-4 shadow-xs",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F5F5F5] dark:border-[#1E293B]">
        <h3 className="text-xs font-bold text-[#171717] dark:text-white tracking-tight">
          Kondisi Cuaca & Lingkungan
        </h3>
        <button
          onClick={onDetailClick}
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer transition-colors"
        >
          <span>Detail</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Weather Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Main Temp & Visual */}
        <div className="flex items-center gap-3 bg-[#FAFAFA] dark:bg-[#18202F] p-3 rounded-lg border border-[#E5E5E5]/60 dark:border-[#263244]">
          <div className="w-12 h-12 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-center shrink-0">
            <WeatherIcon condition={condition} size={36} />
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-[#171717] dark:text-white leading-none">
              {temperature}
            </div>
            <div className="text-xs font-medium text-[#525252] dark:text-[#CBD5E1] mt-1">
              {condition}
            </div>
          </div>
        </div>

        {/* Right: 4 Environmental Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Kelembaban */}
          <div className="flex items-center gap-2 p-2 bg-[#FAFAFA] dark:bg-[#18202F] rounded-md border border-[#E5E5E5]/60 dark:border-[#263244]">
            <Droplets className="w-4 h-4 text-[#2563EB] shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#737373] dark:text-[#94A3B8] truncate">Kelembaban</div>
              <div className="font-semibold text-[#171717] dark:text-white">{humidity}</div>
            </div>
          </div>

          {/* Curah Hujan */}
          <div className="flex items-center gap-2 p-2 bg-[#FAFAFA] dark:bg-[#18202F] rounded-md border border-[#E5E5E5]/60 dark:border-[#263244]">
            <CloudRain className="w-4 h-4 text-sky-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#737373] dark:text-[#94A3B8] truncate">Hujan</div>
              <div className="font-semibold text-[#171717] dark:text-white">{rainfall}</div>
            </div>
          </div>

          {/* Kecepatan Angin */}
          <div className="flex items-center gap-2 p-2 bg-[#FAFAFA] dark:bg-[#18202F] rounded-md border border-[#E5E5E5]/60 dark:border-[#263244]">
            <WindSpeed className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#737373] dark:text-[#94A3B8] truncate">Angin</div>
              <div className="font-semibold text-[#171717] dark:text-white truncate">{windSpeed}</div>
            </div>
          </div>

          {/* Jarak Pandang */}
          <div className="flex items-center gap-2 p-2 bg-[#FAFAFA] dark:bg-[#18202F] rounded-md border border-[#E5E5E5]/60 dark:border-[#263244]">
            <Visibility className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#737373] dark:text-[#94A3B8] truncate">Jarak Pandang</div>
              <div className="font-semibold text-[#171717] dark:text-white truncate">{visibility}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Topbar Header Weather Widget (Compact from assets/img/dashboard.png)
 */
export function WeatherHeaderWidget({
  temperature = "31°C",
  condition = "Cerah Berawan",
  className = "",
}) {
  return (
    <div
      className={cn(
        "hidden sm:inline-flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#1E293B] rounded-lg shadow-xs select-none",
        className
      )}
    >
      <div className="w-7 h-7 rounded-md bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-center shrink-0">
        <WeatherIcon condition={condition} size={22} />
      </div>
      <div className="leading-tight">
        <div className="text-xs font-bold text-[#171717] dark:text-white font-heading">
          {temperature}
        </div>
        <div className="text-[10px] font-medium text-[#737373] dark:text-[#94A3B8]">
          {condition}
        </div>
      </div>
    </div>
  );
}

export default WeatherCardWidget;
