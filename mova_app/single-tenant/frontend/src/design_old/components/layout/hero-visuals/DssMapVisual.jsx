import React from "react";
import { Sparkles, MapPin, Layers, TrendingUp } from "lucide-react";

export function DssMapVisual() {
  return (
    <div className="relative w-full h-48 sm:h-52 flex items-center justify-center select-none overflow-hidden">
      {/* 3D Isometric Grid Plane */}
      <div
        className="relative w-64 h-40 transition-transform duration-700 ease-out"
        style={{
          transform: "perspective(600px) rotateX(55deg) rotateZ(-25deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ground grid */}
        <div className="absolute inset-0 bg-blue-900/40 rounded-2xl border-2 border-blue-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div
            className="w-full h-full opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, #60a5fa 1px, transparent 1px), linear-gradient(to bottom, #60a5fa 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Heatmap overlay glow */}
          <div className="absolute top-4 left-6 w-20 h-20 bg-emerald-400/30 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-4 right-6 w-24 h-24 bg-amber-400/25 rounded-full blur-xl" />
        </div>

        {/* Zone 1 Node (High Priority) */}
        <div
          className="absolute top-6 left-10 flex flex-col items-center"
          style={{ transform: "translateZ(30px) rotateX(-55deg) rotateZ(25deg)" }}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/90 border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white shadow">
            Alun-Alun Sidoarjo (0.892)
          </div>
        </div>

        {/* Zone 2 Node */}
        <div
          className="absolute bottom-8 right-10 flex flex-col items-center"
          style={{ transform: "translateZ(20px) rotateX(-55deg) rotateZ(25deg)" }}
        >
          <div className="w-7 h-7 rounded-full bg-blue-500/90 border-2 border-white shadow-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="mt-1 px-1.5 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md border border-white/20 text-[8px] font-semibold text-blue-200 shadow">
            Gajah Mada (0.741)
          </div>
        </div>

        {/* Zone 3 Node */}
        <div
          className="absolute top-16 right-8 flex flex-col items-center"
          style={{ transform: "translateZ(15px) rotateX(-55deg) rotateZ(25deg)" }}
        >
          <div className="w-6 h-6 rounded-full bg-amber-500/90 border border-white shadow flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DssMapVisual;
