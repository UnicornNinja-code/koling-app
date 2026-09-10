import React from "react";
import { CloudRain, Wind, Droplets, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { WeatherIcon } from "../ui/WeatherIcon.jsx";

export function WeatherWidget({
  weatherData = {},
  cityName = "Sidoarjo",
  onRefresh = () => {},
  isLoading = false,
  className = "",
}) {
  const {
    current_temp = 31,
    condition = "Cerah Berawan",
    humidity = 68,
    wind_speed = "12 km/h",
    rainfall_prob = "15%",
    dss_impact = "OPTIMAL",
    operational_advice = "Kondisi cuaca sangat ideal. Maksimalkan alokasi rider di zona komersial terbuka dan titik keramaian publik.",
    forecast = [
      { time: "12:00", temp: "32°C", condition: "Cerah", prob: "10%" },
      { time: "14:00", temp: "31°C", condition: "Cerah Berawan", prob: "20%" },
      { time: "16:00", temp: "29°C", condition: "Hujan Ringan", prob: "60%" },
      { time: "18:00", temp: "27°C", condition: "Berawan", prob: "30%" },
    ],
  } = weatherData;

  const isRainRisk = condition.toLowerCase().includes("hujan") || condition.toLowerCase().includes("petir");

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 p-5 shadow-xs font-['Inter'] ${className}`}>
      {/* Header & City Selector */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[8px] bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Weather Intelligence Hub</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {cityName}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Integrasi data real-time BMKG & Model Prediksi Cuaca DSS</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title="Segarkan data cuaca"
          className="p-1.5 rounded-[6px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Main Temperature & Conditions Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 items-center">
        {/* Left: Big Temp & Graphic Icon */}
        <div className="flex items-center gap-4">
          <WeatherIcon condition={condition} size={64} />
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {current_temp}°C
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
              {condition}
            </div>
            <div className="text-[11px] text-slate-400">Terasa seperti {current_temp + 2}°C</div>
          </div>
        </div>

        {/* Center: Atmospheric Metrics */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-[10px] bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <div className="text-slate-400 flex justify-center mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-[10px] text-slate-500">Kelembaban</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{humidity}%</div>
          </div>
          <div className="text-center border-x border-slate-200 dark:border-slate-700">
            <div className="text-slate-400 flex justify-center mb-1">
              <Wind className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <div className="text-[10px] text-slate-500">Angin</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{wind_speed}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 flex justify-center mb-1">
              <CloudRain className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-[10px] text-slate-500">Peluang Hujan</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{rainfall_prob}</div>
          </div>
        </div>

        {/* Right: Operational Advice Pill */}
        <div className={`p-3 rounded-[10px] border text-xs ${
          isRainRisk
            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200"
            : "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-200"
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {isRainRisk ? <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> : <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
            <span>Rekomendasi Operasional DSS (C4)</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">{operational_advice}</p>
        </div>
      </div>

      {/* Hourly Mini Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Prakiraan Jam Operasi Berikutnya
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {forecast.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <WeatherIcon condition={item.condition} size={28} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{item.time}</div>
                    <div className="text-[10px] text-slate-400">{item.condition}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{item.temp}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{item.prob}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherWidget;
