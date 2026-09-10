import React from "react";
import { Sun, Cloud, CloudRain, Wind, Thermometer } from "lucide-react";
import { WeatherIcon } from "../../ui/WeatherIcon.jsx";

export function WeatherStationVisual() {
  return (
    <div className="relative w-full h-48 sm:h-52 flex items-center justify-center select-none overflow-hidden">
      {/* 3D Isometric Weather Hub */}
      <div
        className="relative w-64 h-40 flex items-center justify-center"
        style={{
          transform: "perspective(600px) rotateX(45deg) rotateZ(-20deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ground Platform */}
        <div className="absolute inset-0 bg-blue-900/40 rounded-2xl border-2 border-cyan-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
          {/* Radar Waves */}
          <div className="w-32 h-32 rounded-full border border-cyan-400/30 animate-ping opacity-25" />
          <div className="absolute w-44 h-44 rounded-full border border-blue-400/20" />
        </div>

        {/* Center Floating Weather Pod */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{ transform: "translateZ(35px) rotateX(-45deg) rotateZ(20deg)" }}
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-2xl border-2 border-white/80 animate-pulse">
            <WeatherIcon condition="Cerah" size={42} />
          </div>

          <div className="mt-2 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>32°C Cerah • Risiko Rendah</span>
          </div>
        </div>

        {/* Floating Satellite Sensor Top */}
        <div
          className="absolute -top-2 right-4"
          style={{ transform: "translateZ(25px) rotateX(-45deg) rotateZ(20deg)" }}
        >
          <div className="px-2 py-0.5 rounded-md bg-blue-500/80 backdrop-blur-md border border-white/20 text-[8px] font-semibold text-white shadow flex items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-200" />
            <span>Angin 8 km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherStationVisual;
