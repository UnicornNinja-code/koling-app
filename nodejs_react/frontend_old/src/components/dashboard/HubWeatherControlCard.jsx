import React from "react";
import {
  Sun,
  CloudSun,
  Droplets,
  Eye,
  Thermometer,
  ShieldCheck,
  MapPin,
  Clock,
  Bike,
} from "lucide-react";

export function HubWeatherControlCard({
  hubName = "Sidoarjo Hub, Kota Sidoarjo",
  hubCountry = "Indonesia",
  temperature = "31.2°C",
  weatherCondition = "Cerah Berawan",
  feelsLike = "35.1°C",
  rainProb = "10%",
  humidity = "64%",
  dewPoint = "23.5°C",
  visibility = "10.0km",
  activeZonesCount = 18,
  activeFleetCount = 42,
  shiftInfo = "Shift 1 (06:00-18:00 WIB)",
}) {
  return (
    <div className="w-full bg-white rounded-3xl border border-[#D2D2D4]/70 p-5 md:p-6 shadow-sm mb-6 transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-center">
        
        {/* Section 1: Active Hub Info (Col 4) */}
        <div className="lg:col-span-4 space-y-2.5 pr-0 lg:pr-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE HUB CONTROL
          </span>

          <div className="space-y-0.5">
            <h3 className="font-heading font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-tight">
              {hubName}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{hubCountry}</p>
          </div>
        </div>

        {/* Section 2: Weather Overview (Col 3) */}
        <div className="lg:col-span-3 lg:border-l lg:border-[#D2D2D4]/60 lg:pl-6 space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-heading font-black text-slate-900 tracking-tight leading-none">
                {temperature}
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {weatherCondition}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
            <span>Feels like {feelsLike}</span>
            <span>•</span>
            <span>Rain Prob: {rainProb}</span>
          </div>
        </div>

        {/* Section 3: Atmosphere Metrics (Col 2) */}
        <div className="lg:col-span-2 lg:border-l lg:border-[#D2D2D4]/60 lg:pl-6 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-none">Humidity</span>
              <span className="font-bold text-slate-800">{humidity}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-none">Dew Pt</span>
              <span className="font-bold text-slate-800">{dewPoint}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Eye className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-none">Visibility</span>
              <span className="font-bold text-slate-800">{visibility}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Operational Badges / Pills (Col 3) */}
        <div className="lg:col-span-3 lg:border-l lg:border-[#D2D2D4]/60 lg:pl-6 flex flex-col gap-2 justify-center">
          <div className="bg-[#F4F4F6] text-slate-700 font-semibold px-4 py-2 rounded-full text-xs flex items-center justify-between border border-[#D2D2D4]/40">
            <span className="text-slate-500">Zonasi Aktif:</span>
            <span className="font-bold text-slate-900">{activeZonesCount} Zones</span>
          </div>

          <div className="bg-[#F4F4F6] text-slate-700 font-semibold px-4 py-2 rounded-full text-xs flex items-center justify-between border border-[#D2D2D4]/40">
            <span className="text-slate-500">Armada Siap:</span>
            <span className="font-bold text-slate-900">{activeFleetCount} Units</span>
          </div>

          <div className="bg-[#F4F4F6] text-slate-700 font-semibold px-4 py-2 rounded-full text-xs flex items-center justify-between border border-[#D2D2D4]/40">
            <span className="text-slate-500">Sesi Operasional:</span>
            <span className="font-bold text-[#FF634A]">{shiftInfo}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
