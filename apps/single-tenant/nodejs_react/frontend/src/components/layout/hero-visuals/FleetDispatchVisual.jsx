import React from "react";
import { Users, TrendingUp, Compass, ArrowRight } from "lucide-react";
import { ArmadaIcon } from "../../ui/ArmadaIcon.jsx";

export function FleetDispatchVisual() {
  return (
    <div className="relative w-full h-48 sm:h-52 flex items-center justify-center select-none overflow-hidden">
      {/* 3D Isometric Dispatch Board */}
      <div
        className="relative w-64 h-40 flex items-center justify-center"
        style={{
          transform: "perspective(600px) rotateX(50deg) rotateZ(-20deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ground Platform with Routes */}
        <div className="absolute inset-0 bg-blue-900/40 rounded-2xl border-2 border-indigo-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Dispatch route line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 border-t-2 border-dashed border-indigo-300/40 transform -translate-y-1/2" />
        </div>

        {/* Center Armada Icon with 3D elevation */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{ transform: "translateZ(30px) rotateX(-50deg) rotateZ(20deg)" }}
        >
          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 shadow-2xl">
            <ArmadaIcon size={120} alt="Mova Fleet" />
          </div>

          {/* Dynamic Rebalance Badge */}
          <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-white/20 text-[9px] font-bold text-emerald-400 shadow flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Optimal 8/8 Rider Terdistribusi</span>
          </div>
        </div>

        {/* Left origin marker */}
        <div
          className="absolute left-3 top-10"
          style={{ transform: "translateZ(15px) rotateX(-50deg) rotateZ(20deg)" }}
        >
          <div className="px-1.5 py-0.5 rounded bg-blue-600/80 border border-white/20 text-[8px] text-white">
            Pusat Hub
          </div>
        </div>

        {/* Right destination marker */}
        <div
          className="absolute right-3 bottom-8"
          style={{ transform: "translateZ(15px) rotateX(-50deg) rotateZ(20deg)" }}
        >
          <div className="px-1.5 py-0.5 rounded bg-emerald-600/80 border border-white/20 text-[8px] text-white">
            Zona Target
          </div>
        </div>
      </div>
    </div>
  );
}

export default FleetDispatchVisual;
