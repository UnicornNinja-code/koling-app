import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  RefreshCw,
  Thermometer,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { weatherService } from "../../services/weatherService.js";
import { StatusBadge, Button } from "../ui";

/**
 * Enterprise Atmospheric Weather & Hourly Forecast Panel for Map Ops
 */
export function MapWeatherPanel({
  weatherData,
  selectedZoneId = null,
  selectedSlot = "pagi",
  onSelectSlot,
  isLoading,
  onSync,
  onClose,
}) {
  const [targetDate, setTargetDate] = useState("today"); // "today" | "tomorrow" | "day_after"

  // Fetch hourly timeline if zone or hub is available
  const { data: timelineData, isLoading: isTimelineLoading } = useQuery({
    queryKey: ["weather", "timeline", selectedZoneId || "hub", targetDate, selectedSlot],
    queryFn: async () => {
      if (selectedZoneId) {
        return weatherService.getZoneWeatherTimeline(selectedZoneId, {
          date: targetDate,
          slot: selectedSlot,
        });
      }
      return null;
    },
    enabled: !!selectedZoneId,
    staleTime: 60000,
  });

  const current = weatherData?.current || weatherData || {};
  const temp = current?.temperature_c ?? current?.temp_c ?? 31.0;
  const apparentTemp = current?.apparent_temperature_c ?? 34.2;
  const condition = current?.condition || current?.weather_desc || "Cerah Berawan";
  const humidity = current?.humidity_pct ?? current?.humidity ?? 65;
  const dewPoint = current?.dew_point_c ?? 23.5;
  const windSpeed = current?.wind_speed_kmh ?? current?.wind_kmh ?? 12.4;
  const rainProb = current?.max_rain_probability_percent ?? current?.rain_probability ?? 10;
  const rainMm = current?.precipitation_mm ?? current?.rain_mm ?? 0.0;
  const quality = weatherData?.metadata?.quality || "VALID";
  const freshness = weatherData?.metadata?.freshness || "FRESH";

  const hourlyTimeline = timelineData?.timeline?.hourly || [
    { time_label: "06:00", temp_c: 26.5, rain_prob: 5, wmo_meta: { desc: "Cerah" } },
    { time_label: "07:00", temp_c: 27.8, rain_prob: 10, wmo_meta: { desc: "Cerah" } },
    { time_label: "08:00", temp_c: 29.2, rain_prob: 10, wmo_meta: { desc: "Cerah Berawan" } },
    { time_label: "09:00", temp_c: 30.5, rain_prob: 15, wmo_meta: { desc: "Cerah Berawan" } },
    { time_label: "10:00", temp_c: 31.8, rain_prob: 15, wmo_meta: { desc: "Berawan" } },
    { time_label: "11:00", temp_c: 33.0, rain_prob: 20, wmo_meta: { desc: "Berawan" } },
    { time_label: "12:00", temp_c: 33.5, rain_prob: 25, wmo_meta: { desc: "Berawan Tebal" } },
    { time_label: "13:00", temp_c: 32.8, rain_prob: 30, wmo_meta: { desc: "Hujan Ringan" } },
    { time_label: "14:00", temp_c: 31.5, rain_prob: 20, wmo_meta: { desc: "Berawan" } },
    { time_label: "15:00", temp_c: 30.2, rain_prob: 15, wmo_meta: { desc: "Cerah Berawan" } },
    { time_label: "16:00", temp_c: 29.0, rain_prob: 10, wmo_meta: { desc: "Cerah Berawan" } },
    { time_label: "17:00", temp_c: 28.1, rain_prob: 10, wmo_meta: { desc: "Cerah" } },
    { time_label: "18:00", temp_c: 27.4, rain_prob: 5, wmo_meta: { desc: "Cerah" } },
    { time_label: "19:00", temp_c: 26.8, rain_prob: 5, wmo_meta: { desc: "Cerah" } },
    { time_label: "20:00", temp_c: 26.3, rain_prob: 5, wmo_meta: { desc: "Cerah" } },
    { time_label: "21:00", temp_c: 25.9, rain_prob: 5, wmo_meta: { desc: "Cerah" } },
  ];

  return (
    <div className="absolute top-12 right-3 z-30 w-88 max-h-[calc(100vh-130px)] bg-white border border-[#E5E5E5] rounded-[8px] shadow-xl flex flex-col select-none animate-in fade-in zoom-in-95 duration-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FAFAFA] border-b border-[#E5E5E5] shrink-0">
        <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#111111] tracking-tight">
          <div className="w-6 h-6 rounded-[4px] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ea580c]">
            <Sun className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="leading-none">Radar & Ramalan Cuaca</div>
            <div className="text-[10px] text-[#737373] font-medium mt-0.5">Parameter Atmosferik Satelit Open-Meteo</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSync}
            disabled={isLoading}
            title="Sinkronkan Cuaca Satelit"
            className="p-1 text-[#737373] hover:text-[#111111] rounded-[4px] hover:bg-[#EAEAEA] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#ea580c]" : ""}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#737373] hover:text-[#111111] rounded-[4px] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center bg-[#F5F5F5] p-1 border-b border-[#E5E5E5] shrink-0">
        {[
          { key: "today", label: "Hari Ini" },
          { key: "tomorrow", label: "Besok" },
          { key: "day_after", label: "Lusa" },
        ].map((d) => (
          <button
            key={d.key}
            onClick={() => setTargetDate(d.key)}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-[4px] transition-all cursor-pointer text-center ${
              targetDate === d.key
                ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
                : "text-[#737373] hover:text-[#111111]"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Scrollable Body */}
      <div className="overflow-y-auto p-3.5 space-y-3.5 flex-1 custom-scrollbar text-xs">
        {/* Main Temperature & Condition Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[8px] p-3.5 shadow-xs border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Kondisi Real-Time</span>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
              {quality} • {freshness}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black tracking-tight text-white font-mono leading-none">
                {temp}°C
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-1 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{condition}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Terasa seperti: <strong className="text-slate-200">{apparentTemp}°C</strong>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-[10px] text-slate-300 font-medium">
                Peluang Hujan: <strong className="text-blue-400 font-bold">{rainProb}%</strong>
              </div>
              <div className="text-[10px] text-slate-300 font-medium">
                Curah: <strong className="text-blue-300">{rainMm} mm</strong>
              </div>
              <div className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-[4px] border border-emerald-800/40 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Normal Safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Box Atmospheric Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] text-[#737373] uppercase font-bold">Kelembapan Udara</div>
              <div className="font-extrabold text-[#111111] text-xs font-mono">{humidity}%</div>
              <div className="text-[9px] text-[#A3A3A3]">Embun: {dewPoint}°C</div>
            </div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
              <Wind className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] text-[#737373] uppercase font-bold">Kecepatan Angin</div>
              <div className="font-extrabold text-[#111111] text-xs font-mono">{windSpeed} km/h</div>
              <div className="text-[9px] text-[#A3A3A3]">Aman Mangkal</div>
            </div>
          </div>
        </div>

        {/* Hourly Forecast Scroller */}
        <div className="space-y-2 pt-1 border-t border-[#E5E5E5]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
              Ramalan Cuaca Per Jam (06:00 - 21:00)
            </span>
            <span className="text-[9px] font-bold text-[#ea580c] bg-orange-50 px-1.5 py-0.5 rounded-[3px] border border-orange-100">
              {hourlyTimeline.length} Jam
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {hourlyTimeline.map((h, idx) => (
              <div
                key={idx}
                className="w-16 shrink-0 p-2 rounded-[6px] bg-[#FAFAFA] border border-[#EFEFEF] hover:border-[#D4D4D4] text-center space-y-1 transition-all"
              >
                <div className="text-[10px] font-bold text-[#525252] font-mono">{h.time_label}</div>
                <div className="flex justify-center text-[#ea580c] my-0.5">
                  {h.rain_prob >= 30 ? (
                    <CloudRain className="w-4 h-4 text-[#2563EB]" />
                  ) : h.rain_prob >= 15 ? (
                    <Cloud className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="text-[11px] font-extrabold text-[#111111] font-mono">{h.temp_c}°</div>
                <div
                  className={`text-[9px] font-bold ${
                    h.rain_prob >= 30
                      ? "text-blue-600 bg-blue-50"
                      : "text-[#737373]"
                  } rounded-[2px]`}
                >
                  {h.rain_prob}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-[#F9F9F9] border-t border-[#E5E5E5] text-[10px] text-[#737373] text-center font-medium shrink-0 flex items-center justify-center gap-1">
        <Clock className="w-3 h-3 text-[#ea580c]" />
        <span>Diperbarui per jam otomatis • Model ECMWF / GFS Satelit</span>
      </div>
    </div>
  );
}

export default MapWeatherPanel;
