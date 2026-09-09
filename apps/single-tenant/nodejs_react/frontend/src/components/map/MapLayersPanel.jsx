import React from "react";
import { X, Layers, MapPin, Bike, Navigation, Cloud, ShieldAlert, Sparkles } from "lucide-react";

/**
 * Compact Map Layers Configuration Panel
 */
export function MapLayersPanel({
  layers,
  onToggleLayer,
  poiCategories = [],
  selectedPoiCategory,
  onSelectPoiCategory,
  onClose,
}) {
  const layerOptions = [
    { id: "zones", label: "Operational Zones", icon: MapPin, desc: "Geofence polygon boundaries" },
    { id: "riders", label: "Live Riders", icon: Navigation, desc: "Active GPS telemetry positions" },
    { id: "fleet", label: "Fleet Armadas", icon: Bike, desc: "Vehicle distribution markers" },
    { id: "dss", label: "DSS Recommendations", icon: Sparkles, desc: "TOPSIS rank & preference scores" },
    { id: "protocolRoads", label: "Protocol Roads", icon: ShieldAlert, desc: "Prohibited highway restrictions" },
    { id: "weather", label: "Atmospheric Weather", icon: Cloud, desc: "Zone temperature & precipitation" },
    { id: "pois", label: "Points of Interest (POI)", icon: Layers, desc: "Master category clusters (Default: OFF)" },
  ];

  return (
    <div className="absolute top-12 right-3 z-30 w-72 bg-white border border-[#E5E5E5] rounded-[6px] shadow-md p-3 select-none animate-in fade-in zoom-in-95 duration-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111111]">
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span>Map Layer Controls</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#737373] hover:text-[#111111] p-0.5 rounded-[4px] hover:bg-[#F5F5F5]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-1.5">
        {layerOptions.map((opt) => {
          const Icon = opt.icon;
          const isChecked = !!layers[opt.id];

          return (
            <label
              key={opt.id}
              className={`flex items-start gap-2.5 p-1.5 rounded-[4px] cursor-pointer transition-colors ${
                isChecked ? "bg-[#F5F5F5]" : "hover:bg-[#FAFAFA]"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleLayer(opt.id)}
                className="mt-0.5 rounded-[2px] border-[#D4D4D4] text-[#2563EB] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#111111]">
                  <Icon className="w-3 h-3 text-[#525252]" />
                  <span>{opt.label}</span>
                </div>
                <p className="text-[10px] text-[#737373] truncate">{opt.desc}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Conditional POI Category Filter (When POI Layer is ON) */}
      {layers.pois && (
        <div className="mt-2.5 pt-2 border-t border-[#E5E5E5]">
          <label className="block text-[11px] font-medium text-[#525252] mb-1">
            POI Category Filter
          </label>
          <select
            value={selectedPoiCategory || "ALL"}
            onChange={(e) => onSelectPoiCategory(e.target.value)}
            className="w-full h-7 text-[11px] bg-white border border-[#E5E5E5] rounded-[4px] px-2 text-[#111111] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="ALL">All Categories</option>
            {poiCategories.map((cat) => (
              <option key={cat.id || cat.name} value={cat.name || cat.id}>
                {cat.name || cat.id}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
