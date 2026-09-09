import React from "react";
import { X, Cloud, CloudRain, Sun, Wind, Droplets, RefreshCw } from "lucide-react";

/**
 * Compact Contextual Weather Floating Card
 * Preserves backend quality, freshness, and mode metadata (NO_DATA -> N/A)
 */
export function MapWeatherPanel({ weatherData, isLoading, onSync, onClose }) {
  const current = weatherData?.current || weatherData || {};
  const temp = current?.temperature_c ?? current?.temp_c ?? "N/A";
  const condition = current?.condition || current?.weather_desc || "Clear / Mild";
  const humidity = current?.humidity_pct ?? current?.humidity ?? "N/A";
  const windSpeed = current?.wind_speed_kmh ?? current?.wind_kmh ?? "N/A";
  const rainStatus = current?.rain_alert || (current?.is_raining ? "Rain Alert" : "No Rain");
  const freshness = weatherData?.metadata?.freshness || "FRESH";
  const quality = weatherData?.metadata?.quality || "VALID";

  return (
    <div className="absolute top-12 right-3 z-30 w-72 bg-white border border-[#E5E5E5] rounded-[6px] shadow-md p-3 select-none animate-in fade-in zoom-in-95 duration-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111111]">
          <Cloud className="w-4 h-4 text-[#2563EB]" />
          <span>Operational Weather</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSync}
            disabled={isLoading}
            title="Sync Weather"
            className="p-1 text-[#737373] hover:text-[#111111] rounded-[4px] hover:bg-[#F5F5F5] disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#737373] hover:text-[#111111] rounded-[4px] hover:bg-[#F5F5F5]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Temperature / Condition */}
      <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2.5 mb-2.5">
        <div>
          <div className="text-[20px] font-bold text-[#111111] tracking-tight">
            {temp !== "N/A" ? `${temp}°C` : "N/A"}
          </div>
          <div className="text-[11px] font-medium text-[#525252] flex items-center gap-1 mt-0.5">
            {rainStatus.includes("Rain") ? (
              <CloudRain className="w-3.5 h-3.5 text-[#2563EB]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#D97706]" />
            )}
            <span>{condition}</span>
          </div>
        </div>

        {/* Semantic Quality / Freshness Badges */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
              quality === "VALID"
                ? "bg-[#DCFCE7] text-[#16A34A]"
                : "bg-[#FEF3C7] text-[#D97706]"
            }`}
          >
            {quality}
          </span>
          <span className="text-[9px] text-[#737373]">{freshness}</span>
        </div>
      </div>

      {/* Atmospheric Telemetry Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2 flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-[#525252] shrink-0" />
          <div>
            <div className="text-[9px] text-[#737373] uppercase">Humidity</div>
            <div className="font-semibold text-[#111111]">
              {humidity !== "N/A" ? `${humidity}%` : "N/A"}
            </div>
          </div>
        </div>

        <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2 flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-[#525252] shrink-0" />
          <div>
            <div className="text-[9px] text-[#737373] uppercase">Wind Speed</div>
            <div className="font-semibold text-[#111111]">
              {windSpeed !== "N/A" ? `${windSpeed} km/h` : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
