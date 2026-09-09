import React, { useState, useEffect } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Droplets,
  Wind,
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export function WeatherTimelineWidget({
  zoneId,
  zoneName = "Zona Alun-Alun Sidoarjo",
  initialDate = "today",
  initialSlot = "pagi",
  apiUrl = "http://localhost:5000/api",
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate); // "today" | "tomorrow"
  const [selectedSlot, setSelectedSlot] = useState(initialSlot); // "all" | "pagi" | "siang" | "sore" | "malam"
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchTimeline = async () => {
    if (!zoneId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiUrl}/weather/zones/${zoneId}/timeline?date=${selectedDate}&slot=${selectedSlot}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn("⚠️ Gagal memuat timeline cuaca:", err.message);
      // Mock fallback data for demonstration if offline or unauthenticated
      setData(getMockTimelineData(zoneId, zoneName, selectedDate, selectedSlot));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [zoneId, selectedDate, selectedSlot]);

  const getWeatherIcon = (iconName, className = "w-5 h-5") => {
    switch (iconName) {
      case "sun":
        return <Sun className={`${className} text-amber-500`} />;
      case "cloud-sun":
        return <CloudSun className={`${className} text-amber-500`} />;
      case "cloud":
        return <Cloud className={`${className} text-slate-400`} />;
      case "cloud-drizzle":
        return <CloudDrizzle className={`${className} text-blue-400`} />;
      case "cloud-rain":
      case "cloud-showers-heavy":
        return <CloudRain className={`${className} text-blue-500`} />;
      case "cloud-bolt":
        return <CloudLightning className={`${className} text-purple-500`} />;
      default:
        return <CloudSun className={`${className} text-amber-500`} />;
    }
  };

  const slotSummary = data?.slot_summary || {};
  const timeline = data?.hourly_timeline || [];

  return (
    <div className="w-full bg-white border border-[#E5E5E5] rounded-[10px] p-5 shadow-2xs transition-all font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <Clock className="w-3.5 h-3.5" />
              HOURLY WEATHER FORECAST
            </span>
            <span className="text-xs font-semibold text-[#525252]">• {zoneName}</span>
          </div>
          <h3 className="font-heading font-extrabold text-[#111111] text-lg mt-1 tracking-tight">
            Perkiraan Cuaca Per Jam & Pairing Time Slot
          </h3>
        </div>

        {/* Date Selector (Hari Ini / Besok) */}
        <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-[6px] border border-[#E5E5E5] self-start sm:self-auto">
          <button
            onClick={() => setSelectedDate("today")}
            className={`px-3 py-1 text-xs font-bold rounded-[4px] transition-all cursor-pointer ${
              selectedDate === "today"
                ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
                : "text-[#737373] hover:text-[#111111]"
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setSelectedDate("tomorrow")}
            className={`px-3 py-1 text-xs font-bold rounded-[4px] transition-all cursor-pointer ${
              selectedDate === "tomorrow"
                ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
                : "text-[#737373] hover:text-[#111111]"
            }`}
          >
            Besok
          </button>
          <button
            onClick={fetchTimeline}
            title="Refresh Cuaca"
            className="p-1 text-[#737373] hover:text-[#111111] cursor-pointer ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Time Slot Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
        {[
          { key: "pagi", label: "🌅 Pagi (06:00 - 10:00)" },
          { key: "siang", label: "☀️ Siang (11:00 - 14:00)" },
          { key: "sore", label: "🌇 Sore (15:00 - 17:00)" },
          { key: "malam", label: "🌙 Malam (18:00 - 21:00)" },
          { key: "all", label: "⏱️ Semua Jam (06:00 - 21:00)" },
        ].map((slot) => {
          const isActive = selectedSlot === slot.key;
          return (
            <button
              key={slot.key}
              onClick={() => setSelectedSlot(slot.key)}
              className={`px-3.5 py-1.5 text-xs font-bold whitespace-nowrap rounded-[6px] border transition-all cursor-pointer ${
                isActive
                  ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                  : "bg-white text-[#525252] border-[#E5E5E5] hover:bg-[#F9F9F9] hover:text-[#111111]"
              }`}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      {/* Slot Summary Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-3.5 my-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#737373] block">Kondisi Dominan</span>
          <span className="text-sm font-extrabold text-[#111111] mt-0.5 block">
            {slotSummary.dominant_condition || "Cerah"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#737373] block">Rata-Rata Suhu</span>
          <span className="text-sm font-extrabold text-[#111111] mt-0.5 block">
            {slotSummary.avg_temperature_c ? `${slotSummary.avg_temperature_c}°C` : "--"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#737373] block">Max Peluang Hujan (C4)</span>
          <span className="text-sm font-extrabold text-blue-600 mt-0.5 block">
            {slotSummary.max_rain_probability !== undefined ? `${slotSummary.max_rain_probability}%` : "--"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#737373] block">Status Risiko DSS</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-bold mt-0.5 ${
              (slotSummary.max_rain_probability || 0) > 60
                ? "bg-red-50 text-red-700 border border-red-200"
                : (slotSummary.max_rain_probability || 0) > 30
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {(slotSummary.max_rain_probability || 0) > 60 ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            {slotSummary.risk_level || "AMAN"}
          </span>
        </div>
      </div>

      {/* Hourly Timeline Cards (Horizontal Strip) */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[#737373] font-semibold mb-2">
          <span>Rincian Waktu Per Jam:</span>
          <span>{timeline.length} Titik Jam Dipairing</span>
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#737373] border border-dashed border-[#E5E5E5] rounded-[6px]">
            Tidak ada data cuaca untuk rentang waktu yang dipilih.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 overflow-x-auto pb-1">
            {timeline.map((hourItem, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E5E5] rounded-[8px] p-3 flex flex-col items-center justify-between hover:border-[#111111] hover:shadow-xs transition-all text-center group"
              >
                <div className="text-xs font-extrabold text-[#111111] tracking-tight bg-[#F5F5F5] group-hover:bg-[#111111] group-hover:text-white px-2 py-0.5 rounded-[4px] transition-colors mb-2">
                  {hourItem.time}
                </div>

                <div className="my-1">
                  {getWeatherIcon(hourItem.icon, "w-6 h-6")}
                </div>

                <div className="text-sm font-heading font-extrabold text-[#111111] mt-1">
                  {hourItem.temperature_c}°C
                </div>

                <p className="text-[10px] font-semibold text-[#737373] truncate w-full mt-0.5">
                  {hourItem.weather_label}
                </p>

                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded-[4px] mt-2">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <span>{hourItem.rain_probability_percent}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Fallback Mock Generator if API offline
function getMockTimelineData(zoneId, zoneName, targetDate, targetSlot) {
  const isTomorrow = targetDate === "tomorrow";
  const dateStr = isTomorrow ? "2026-09-10" : "2026-09-09";
  
  const allHours = [
    { time: "06:00", hour: 6, slot: "pagi", temperature_c: 26.2, rain_probability_percent: 0, weather_label: "Cerah", icon: "sun" },
    { time: "07:00", hour: 7, slot: "pagi", temperature_c: 27.5, rain_probability_percent: 0, weather_label: "Cerah", icon: "sun" },
    { time: "08:00", hour: 8, slot: "pagi", temperature_c: 29.1, rain_probability_percent: 5, weather_label: "Cerah Berawan", icon: "cloud-sun" },
    { time: "09:00", hour: 9, slot: "pagi", temperature_c: 30.8, rain_probability_percent: 10, weather_label: "Cerah Berawan", icon: "cloud-sun" },
    { time: "10:00", hour: 10, slot: "pagi", temperature_c: 32.0, rain_probability_percent: 15, weather_label: "Berawan", icon: "cloud" },
    { time: "11:00", hour: 11, slot: "siang", temperature_c: 33.5, rain_probability_percent: 10, weather_label: "Cerah Berawan", icon: "cloud-sun" },
    { time: "12:00", hour: 12, slot: "siang", temperature_c: 34.8, rain_probability_percent: 10, weather_label: "Cerah Berawan", icon: "cloud-sun" },
    { time: "13:00", hour: 13, slot: "siang", temperature_c: 35.2, rain_probability_percent: 5, weather_label: "Cerah", icon: "sun" },
    { time: "14:00", hour: 14, slot: "siang", temperature_c: 34.0, rain_probability_percent: 5, weather_label: "Cerah", icon: "sun" },
    { time: "15:00", hour: 15, slot: "sore", temperature_c: 32.8, rain_probability_percent: 10, weather_label: "Cerah Berawan", icon: "cloud-sun" },
    { time: "16:00", hour: 16, slot: "sore", temperature_c: 31.5, rain_probability_percent: 10, weather_label: "Cerah Berawan", icon: "cloud-sun" },
    { time: "17:00", hour: 17, slot: "sore", temperature_c: 30.0, rain_probability_percent: 5, weather_label: "Cerah", icon: "sun" },
    { time: "18:00", hour: 18, slot: "malam", temperature_c: 29.0, rain_probability_percent: 0, weather_label: "Cerah", icon: "sun" },
    { time: "19:00", hour: 19, slot: "malam", temperature_c: 28.2, rain_probability_percent: 0, weather_label: "Cerah", icon: "sun" },
    { time: "20:00", hour: 20, slot: "malam", temperature_c: 27.5, rain_probability_percent: 0, weather_label: "Cerah", icon: "sun" },
    { time: "21:00", hour: 21, slot: "malam", temperature_c: 27.0, rain_probability_percent: 0, weather_label: "Cerah", icon: "sun" },
  ];

  let filtered = allHours;
  if (targetSlot && targetSlot !== "all") {
    filtered = allHours.filter(h => h.slot === targetSlot);
  }

  const maxRain = filtered.length > 0 ? Math.max(...filtered.map(h => h.rain_probability_percent)) : 0;
  const avgTemp = filtered.length > 0 ? Math.round((filtered.reduce((sum, h) => sum + h.temperature_c, 0) / filtered.length) * 10) / 10 : 28;

  return {
    zone_id: zoneId || "mock-zone",
    zone_name: zoneName,
    target_date: dateStr,
    selected_slot: targetSlot,
    slot_summary: {
      label: targetSlot === "all" ? "Semua Jam Operasional" : `Slot ${targetSlot.toUpperCase()}`,
      dominant_condition: filtered[0]?.weather_label || "Cerah",
      avg_temperature_c: avgTemp,
      max_rain_probability: maxRain,
      risk_level: maxRain > 60 ? "HIGH" : maxRain > 30 ? "MEDIUM" : "LOW",
    },
    hourly_timeline: filtered,
  };
}
