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
    <div className="w-full bg-white dark:bg-[#131822] rounded-[12px] border border-[#E5E5E5] dark:border-[#1E293B] p-4 md:p-5 shadow-2xs mb-6 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-center">
        
        {/* Section 1: Active Hub Info (Col 4) */}
        <div className="lg:col-span-4 space-y-2 pr-0 lg:pr-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DCFCE7] dark:bg-emerald-950/50 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] dark:bg-emerald-400 animate-pulse" />
            ACTIVE HUB CONTROL
          </span>

          <div className="space-y-0.5">
            <h3 className="font-heading font-extrabold text-[#111111] dark:text-white text-lg md:text-xl tracking-tight leading-tight">
              {hubName}
            </h3>
            <p className="text-xs text-[#737373] dark:text-[#94A3B8] font-normal">{hubCountry}</p>
          </div>
        </div>

        {/* Section 2: Weather Overview (Col 3) */}
        <div className="lg:col-span-3 lg:border-l lg:border-[#E5E5E5] dark:lg:border-[#1E293B] lg:pl-5 space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/60">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#111111] dark:text-white tracking-tight leading-none">
                {temperature}
              </div>
              <p className="text-xs font-semibold text-[#525252] dark:text-slate-300 mt-0.5">
                {weatherCondition}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#737373] dark:text-[#94A3B8] font-medium pt-1">
            <span>Feels like {feelsLike}</span>
            <span>•</span>
            <span>Rain Prob: {rainProb}</span>
          </div>
        </div>

        {/* Section 3: Atmosphere Metrics (Col 2) */}
        <div className="lg:col-span-2 lg:border-l lg:border-[#E5E5E5] dark:lg:border-[#1E293B] lg:pl-5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#525252] dark:text-slate-300 font-medium">
            <Droplets className="w-4 h-4 text-[#0284C7] shrink-0" />
            <div>
              <span className="text-[10px] text-[#737373] dark:text-[#94A3B8] block leading-none">Humidity</span>
              <span className="font-bold text-[#111111] dark:text-white">{humidity}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#525252] dark:text-slate-300 font-medium">
            <Thermometer className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] text-[#737373] dark:text-[#94A3B8] block leading-none">Dew Pt</span>
              <span className="font-bold text-[#111111] dark:text-white">{dewPoint}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#525252] dark:text-slate-300 font-medium">
            <Eye className="w-4 h-4 text-[#737373] dark:text-[#94A3B8] shrink-0" />
            <div>
              <span className="text-[10px] text-[#737373] dark:text-[#94A3B8] block leading-none">Visibility</span>
              <span className="font-bold text-[#111111] dark:text-white">{visibility}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Operational Badges / Pills (Col 3) */}
        <div className="lg:col-span-3 lg:border-l lg:border-[#E5E5E5] dark:lg:border-[#1E293B] lg:pl-5 flex flex-col gap-2 justify-center">
          <div className="bg-[#F5F5F5] dark:bg-[#0B0F17] text-[#525252] dark:text-slate-300 font-medium px-3.5 py-1.5 rounded-full text-xs flex items-center justify-between border border-[#E5E5E5] dark:border-[#1E293B]">
            <span className="text-[#737373] dark:text-[#94A3B8]">Zonasi Aktif:</span>
            <span className="font-bold text-[#111111] dark:text-white">{activeZonesCount} Zones</span>
          </div>

          <div className="bg-[#F5F5F5] dark:bg-[#0B0F17] text-[#525252] dark:text-slate-300 font-medium px-3.5 py-1.5 rounded-full text-xs flex items-center justify-between border border-[#E5E5E5] dark:border-[#1E293B]">
            <span className="text-[#737373] dark:text-[#94A3B8]">Armada Siap:</span>
            <span className="font-bold text-[#111111] dark:text-white">{activeFleetCount} Units</span>
          </div>

          <div className="bg-[#F5F5F5] dark:bg-[#0B0F17] text-[#525252] dark:text-slate-300 font-medium px-3.5 py-1.5 rounded-full text-xs flex items-center justify-between border border-[#E5E5E5] dark:border-[#1E293B]">
            <span className="text-[#737373] dark:text-[#94A3B8]">Sesi Operasional:</span>
            <span className="font-bold text-[#2563EB] dark:text-blue-400">{shiftInfo}</span>
          </div>
        </div>

      </div>
    </div>
  );
}


