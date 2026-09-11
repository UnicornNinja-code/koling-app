import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardContent, Badge, Button, WeatherIcon } from "../ui/index.js";
import { weatherService } from "../../services/weatherService.js";

// Helper for weather icons based on weather_code / icon key
function getWeatherIconComponent(iconType = "cloud-sun", code = 0) {
  if (iconType === "sun" || code === 0 || code === 1) {
    return <Sun className="w-5 h-5 text-amber-500" />;
  }
  if (iconType === "cloud-rain" || code >= 51) {
    return <CloudRain className="w-5 h-5 text-blue-500" />;
  }
  if (iconType === "cloud-lightning" || code >= 95) {
    return <CloudLightning className="w-5 h-5 text-purple-500" />;
  }
  if (iconType === "cloud" || code === 3) {
    return <Cloud className="w-5 h-5 text-slate-400" />;
  }
  return <CloudSun className="w-5 h-5 text-amber-400" />;
}

// Fallback mock generator if offline / error
function generateFallbackTimeline(zoneName = "Alun-Alun Sidoarjo", targetDate = "today") {
  const isTomorrow = targetDate === "tomorrow";
  const dateStr = isTomorrow ? "2026-09-11" : "2026-09-10";

  const hourly = [
    { time: "06:00", hour: 6, slot: "pagi", temperature_c: 25.8, rain_probability_percent: 5, weather_label: "Cerah", icon: "sun", weather_code: 1 },
    { time: "07:00", hour: 7, slot: "pagi", temperature_c: 27.2, rain_probability_percent: 10, weather_label: "Cerah Berawan", icon: "cloud-sun", weather_code: 2 },
    { time: "08:00", hour: 8, slot: "pagi", temperature_c: 29.0, rain_probability_percent: 15, weather_label: "Cerah Berawan", icon: "cloud-sun", weather_code: 2 },
    { time: "09:00", hour: 9, slot: "pagi", temperature_c: 30.5, rain_probability_percent: 20, weather_label: "Berawan", icon: "cloud", weather_code: 3 },
    { time: "10:00", hour: 10, slot: "pagi", temperature_c: 31.8, rain_probability_percent: 25, weather_label: "Berawan", icon: "cloud", weather_code: 3 },
    { time: "11:00", hour: 11, slot: "siang", temperature_c: 33.1, rain_probability_percent: 30, weather_label: "Berawan", icon: "cloud", weather_code: 3 },
    { time: "12:00", hour: 12, slot: "siang", temperature_c: 34.0, rain_probability_percent: 35, weather_label: "Cerah Berawan", icon: "cloud-sun", weather_code: 2 },
    { time: "13:00", hour: 13, slot: "siang", temperature_c: 33.5, rain_probability_percent: 40, weather_label: "Hujan Ringan", icon: "cloud-rain", weather_code: 51 },
    { time: "14:00", hour: 14, slot: "siang", temperature_c: 32.0, rain_probability_percent: 45, weather_label: "Hujan Ringan", icon: "cloud-rain", weather_code: 51 },
    { time: "15:00", hour: 15, slot: "sore", temperature_c: 30.8, rain_probability_percent: 35, weather_label: "Berawan", icon: "cloud", weather_code: 3 },
    { time: "16:00", hour: 16, slot: "sore", temperature_c: 29.5, rain_probability_percent: 25, weather_label: "Cerah Berawan", icon: "cloud-sun", weather_code: 2 },
    { time: "17:00", hour: 17, slot: "sore", temperature_c: 28.2, rain_probability_percent: 15, weather_label: "Cerah Berawan", icon: "cloud-sun", weather_code: 2 },
    { time: "18:00", hour: 18, slot: "malam", temperature_c: 27.5, rain_probability_percent: 10, weather_label: "Cerah", icon: "sun", weather_code: 1 },
    { time: "19:00", hour: 19, slot: "malam", temperature_c: 27.0, rain_probability_percent: 5, weather_label: "Cerah", icon: "sun", weather_code: 1 },
    { time: "20:00", hour: 20, slot: "malam", temperature_c: 26.5, rain_probability_percent: 5, weather_label: "Cerah", icon: "sun", weather_code: 1 },
    { time: "21:00", hour: 21, slot: "malam", temperature_c: 26.0, rain_probability_percent: 5, weather_label: "Cerah", icon: "sun", weather_code: 1 },
  ];

  return {
    zone_id: "ZON-SDA-01",
    zone_name: zoneName,
    target_date: dateStr,
    selected_slot: "all",
    slot_summary: {
      slot_key: "all",
      label: "Seluruh Jam Operasional (06:00 - 21:00)",
      avg_temperature_c: 29.5,
      max_rain_probability: 45,
      dominant_condition: "Cerah Berawan",
      skor_c4_dss: 35,
      risk_level: "LOW",
    },
    hourly_timeline: hourly,
    available_slots: {
      pagi: { label: "Pagi (06:00 - 10:00)", hours_count: 5, avg_temperature_c: 28.8, max_rain_probability: 25 },
      siang: { label: "Siang (11:00 - 14:00)", hours_count: 4, avg_temperature_c: 33.2, max_rain_probability: 45 },
      sore: { label: "Sore (15:00 - 17:00)", hours_count: 3, avg_temperature_c: 29.5, max_rain_probability: 35 },
      malam: { label: "Malam (18:00 - 21:00)", hours_count: 4, avg_temperature_c: 26.8, max_rain_probability: 10 },
    },
  };
}

export function WeatherTimelinePanel({
  zoneId = "ZON-SDA-01",
  zoneName = "Alun-Alun Sidoarjo",
  className = "",
}) {
  const [selectedDate, setSelectedDate] = useState("today"); // 'today' | 'tomorrow'
  const [selectedSlot, setSelectedSlot] = useState("all"); // 'all' | 'pagi' | 'siang' | 'sore' | 'malam'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchTimeline() {
      setLoading(true);
      try {
        const res = await weatherService.getZoneWeatherTimeline(zoneId, {
          date: selectedDate,
          slot: selectedSlot,
        });

        if (isMounted) {
          if (res && res.data) {
            setData(res.data);
          } else {
            setData(generateFallbackTimeline(zoneName, selectedDate));
          }
        }
      } catch (err) {
        if (isMounted) {
          setData(generateFallbackTimeline(zoneName, selectedDate));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTimeline();

    return () => {
      isMounted = false;
    };
  }, [zoneId, zoneName, selectedDate, selectedSlot]);

  const rawTimeline = data?.hourly_timeline || [];
  const summary = data?.slot_summary || {};
  const slots = data?.available_slots || {};

  // Client-side fallback slot filter if API returns full day
  const timeline = rawTimeline.filter((item) => {
    if (selectedSlot === "all") return true;
    if (!item.slot) {
      // Map hour to slot if slot field missing
      const hour = parseInt(item.time.split(":")[0], 10);
      if (selectedSlot === "pagi") return hour >= 6 && hour <= 10;
      if (selectedSlot === "siang") return hour >= 11 && hour <= 14;
      if (selectedSlot === "sore") return hour >= 15 && hour <= 17;
      if (selectedSlot === "malam") return hour >= 18 && hour <= 21;
      return true;
    }
    return item.slot === selectedSlot;
  });

  // Slot definitions for the tab buttons
  const tabOptions = [
    { key: "all", label: "Semua Jam", sub: "06:00 - 21:00", temp: summary?.avg_temperature_c, rain: summary?.max_rain_probability },
    { key: "pagi", label: "Pagi", sub: "06:00 - 10:00", temp: slots?.pagi?.avg_temperature_c, rain: slots?.pagi?.max_rain_probability },
    { key: "siang", label: "Siang", sub: "11:00 - 14:00", temp: slots?.siang?.avg_temperature_c, rain: slots?.siang?.max_rain_probability },
    { key: "sore", label: "Sore", sub: "15:00 - 17:00", temp: slots?.sore?.avg_temperature_c, rain: slots?.sore?.max_rain_probability },
    { key: "malam", label: "Malam", sub: "18:00 - 21:00", temp: slots?.malam?.avg_temperature_c, rain: slots?.malam?.max_rain_probability },
  ];

  // Real-time system time detection for active slot and current hour
  const getActiveSlot = (hour) => {
    if (hour >= 6 && hour < 11) return "pagi";
    if (hour >= 11 && hour < 15) return "siang";
    if (hour >= 15 && hour < 18) return "sore";
    if (hour >= 18 && hour <= 21) return "malam";
    return null;
  };

  const currentHour = new Date().getHours();
  const activeSlot = getActiveSlot(currentHour);

  // Risk Level computation
  const riskLevel = summary?.risk_level || (summary?.max_rain_probability > 50 ? "HIGH" : summary?.max_rain_probability > 25 ? "MEDIUM" : "LOW");

  return (
    <Card className={`overflow-hidden flex flex-col font-['Inter'] ${className}`}>
      {/* 1. Header Card with clean divider & spacing */}
      <CardHeader
        title={
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Prakiraan Cuaca Operasional
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sidoarjo Hub • LIVE</span>
            </div>
          </div>
        }
        subtitle={`${zoneName} • Evaluasi Spasial per Jam`}
        className="items-center pb-3 mb-1 border-b border-slate-100 dark:border-slate-800"
        action={
          <div className="flex items-center gap-2">
            {/* Date Segmented Control */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setSelectedDate("today")}
                className={`px-2.5 py-1 rounded-[6px] font-semibold transition-colors cursor-pointer ${
                  selectedDate === "today"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate("tomorrow")}
                className={`px-2.5 py-1 rounded-[6px] font-semibold transition-colors cursor-pointer ${
                  selectedDate === "tomorrow"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Besok
              </button>
            </div>
          </div>
        }
      />

      <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-between space-y-4">
        {/* 2. Slot Segmentation Tabs (Pagi, Siang, Sore, Malam, Semua) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {tabOptions.map((tab) => {
            const isSelected = selectedSlot === tab.key;
            const isCurrentSlot = selectedDate === "today" && tab.key === activeSlot;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedSlot(tab.key)}
                className={`relative p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-2xs ring-1 ring-blue-500/50"
                    : isCurrentSlot
                    ? "bg-blue-50/40 dark:bg-blue-950/30 border-blue-400/80 dark:border-blue-600/80 shadow-2xs"
                    : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-xs truncate ${
                        isSelected || isCurrentSlot
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 font-semibold"
                      }`}
                    >
                      {tab.label}
                    </span>
                    {isCurrentSlot && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-blue-600 text-white dark:bg-blue-500 shrink-0 leading-tight shadow-2xs animate-pulse">
                        Saat Ini
                      </span>
                    )}
                  </div>
                  {tab.rain !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        tab.rain > 50
                          ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                          : tab.rain > 20
                          ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                          : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                      }`}
                    >
                      💧 {tab.rain}%
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">{tab.sub}</div>
              </button>
            );
          })}
        </div>

        {/* 3. Hourly Timeline Cards (Horizontal Slider with ample vertical space so badge is never cut off) */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-0.5">
            <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Timeline Jam Operasional ({timeline.length} titik jam)
            </span>
            <span className="text-[10px] text-slate-400">Geser ke kanan →</span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pt-4 pb-3 px-2 scrollbar-thin select-none">
            {timeline.length > 0 ? (
              timeline.map((item, idx) => {
                const itemHour = item.hour !== undefined ? item.hour : parseInt(item.time.split(":")[0], 10);
                const isCurrentHour = selectedDate === "today" && itemHour === currentHour;

                const rainPct = item.rain_probability_percent || 0;
                const rainColor =
                  rainPct > 50
                    ? "bg-rose-500"
                    : rainPct > 20
                    ? "bg-amber-500"
                    : "bg-emerald-500";

                const rainTextColor =
                  rainPct > 50
                    ? "text-rose-600 dark:text-rose-400"
                    : rainPct > 20
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400";

                return (
                  <div
                    key={idx}
                    className={`relative flex flex-col items-center justify-between min-w-[80px] w-[80px] sm:min-w-[84px] sm:w-[84px] px-2 py-2.5 rounded-xl transition-all shrink-0 ${
                      isCurrentHour
                        ? "bg-blue-100/75 dark:bg-blue-950/90 border-2 border-blue-600 dark:border-blue-400 shadow-md ring-2 ring-blue-500/50 scale-[1.05] z-10"
                        : "bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    {/* Active Hour Indicator Badge */}
                    {isCurrentHour && (
                      <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-[8px] font-black uppercase tracking-wider shadow-md animate-pulse">
                        Saat Ini
                      </div>
                    )}

                    {/* Hour Label */}
                    <span
                      className={`text-[11px] font-bold ${
                        isCurrentHour
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {item.time}
                    </span>

                    {/* Rich Realistic SVG Weather Icon */}
                    <div className="my-1.5 flex items-center justify-center h-9 w-9">
                      <WeatherIcon
                        condition={item.weather_label || item.condition || "Cerah"}
                        weatherCode={item.weather_code}
                        size={34}
                      />
                    </div>

                    {/* Temperature */}
                    <span
                      className={`text-[12px] sm:text-[13px] leading-none ${
                        isCurrentHour
                          ? "font-black text-blue-700 dark:text-blue-300"
                          : "font-semibold text-slate-900 dark:text-white"
                      }`}
                    >
                      {item.temperature_c}°C
                    </span>

                    {/* Rain Probability Mini Track Bar + Explicit Water Drop Icon */}
                    <div className="w-full mt-1.5 space-y-1">
                      <div className="w-full h-1 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${rainColor}`}
                          style={{ width: `${Math.max(rainPct, 6)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        <span className={`text-[10px] font-bold ${rainTextColor} flex items-center gap-0.5`}>
                          <span>💧</span>{rainPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 w-full text-center text-xs text-slate-400">
                Data timeline cuaca tidak tersedia untuk filter ini.
              </div>
            )}
          </div>
        </div>

        {/* 4. Footer & DSS Risk Alert Badge */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          {/* Risk Level Badge */}
          <div className="flex items-center gap-2">
            {riskLevel === "LOW" ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Kondisi Operasional Aman</span>
              </div>
            ) : riskLevel === "MEDIUM" ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Waspada Potensi Hujan</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Risiko Hujan Tinggi - Siapkan Rute Alternatif</span>
              </div>
            )}
            <span className="text-[11px] text-slate-500 hidden md:inline">
              Rata-rata: <strong className="text-slate-800 dark:text-slate-200">{summary?.avg_temperature_c || 29}°C</strong>
            </span>
          </div>

          {/* DSS C4 Criterion Score */}
          <div className="flex items-center gap-2 text-[11px] shrink-0 font-['Inter']">
            <span className="text-slate-500">Skor C4 DSS (Cuaca):</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
              {summary?.skor_c4_dss ?? (summary?.max_rain_probability || 20)} / 100
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeatherTimelinePanel;
