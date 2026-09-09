import React from "react";
import {
  Layers,
  MapPin,
  Bike,
  Users,
  BrainCircuit,
  Cloud,
  ShieldAlert,
  Flame,
  Info,
  RotateCcw,
  Sparkles,
  Search,
  Check,
} from "lucide-react";
import { Switch } from "../ui/Switch.jsx";

/**
 * Enterprise Right-Side Docked Layering & GIS Intelligence Sidebar
 * Features smooth expanding hover behavior matching the main left navigation sidebar.
 */
export function MapRightLayerSidebar({
  layers = {},
  onToggleLayer,
  poiCategories = [],
  selectedPoiCategory = "ALL",
  onSelectPoiCategory,
  onOpenLegend,
  onOpenWeather,
  onResetView,
  counts = {},
}) {
  const layerItems = [
    {
      id: "zones",
      label: "Zona Operasional",
      desc: "Poligon resmi area jualan kopi",
      icon: MapPin,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
      count: counts.zones || 0,
    },
    {
      id: "riders",
      label: "Telemetri Rider LBS",
      desc: "Posisi GPS real-time armada aktif",
      icon: Users,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50",
      count: counts.riders || 0,
    },
    {
      id: "fleet",
      label: "Unit Armada Lapangan",
      desc: "Status motor listrik & gerobak",
      icon: Bike,
      color: "text-[#D97706]",
      bg: "bg-amber-50",
      count: counts.armadas || 0,
    },
    {
      id: "dss",
      label: "Rekomendasi TOPSIS #1",
      desc: "Highlight zona prioritas penjualan",
      icon: BrainCircuit,
      color: "text-[#7C3AED]",
      bg: "bg-purple-50",
      badge: "DSS AI",
    },
    {
      id: "protocolRoads",
      label: "Batas Jalan Protokol/Tol",
      desc: "Buffer 50m zona terlarang jualan",
      icon: ShieldAlert,
      color: "text-[#DC2626]",
      bg: "bg-rose-50",
      badge: "Red Zone",
    },
    {
      id: "weather",
      label: "Atmospheric Weather",
      desc: "Suhu & radar risiko hujan (C4)",
      icon: Cloud,
      color: "text-[#0284C7]",
      bg: "bg-sky-50",
      badge: "Satelit",
    },
    {
      id: "salesHeatmap",
      label: "🔥 Sales Heatmap & Demand",
      desc: "Kerapatan transaksi & forecasting AI",
      icon: Flame,
      color: "text-[#EA580C]",
      bg: "bg-orange-50",
      badge: "Forecasting",
    },
    {
      id: "pois",
      label: "Point of Interest (POI)",
      desc: "Fasilitas umum & sentra crowd",
      icon: Layers,
      color: "text-[#4F46E5]",
      bg: "bg-indigo-50",
      count: counts.pois || 0,
    },
  ];

  return (
    <aside className="absolute top-0 right-0 h-full z-20 flex flex-col justify-between items-start bg-white/95 backdrop-blur-md border-l border-[#E2E8F0] shadow-lg transition-all duration-300 ease-in-out group/layers w-[56px] hover:w-[290px] overflow-x-hidden font-sans select-none">
      {/* Top Header */}
      <div className="flex flex-col items-start w-full px-2.5 pt-3">
        <div className="flex items-center gap-3 w-full p-1 rounded-[8px] overflow-hidden">
          <div className="w-9 h-9 shrink-0 rounded-[8px] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ea580c] shadow-2xs group-hover/layers:border-[#ea580c] transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div className="overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/layers:opacity-100 group-hover/layers:w-auto whitespace-nowrap">
            <h3 className="font-extrabold text-xs text-[#0F172A] tracking-tight leading-none">
              GIS Layering & Filter
            </h3>
            <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
              Kendali Visibilitas Spasial
            </p>
          </div>
        </div>

        <div className="w-full h-[1px] bg-[#E2E8F0] my-2" />

        {/* Layer Toggles List */}
        <div className="flex flex-col gap-1.5 w-full overflow-y-auto max-h-[calc(100vh-230px)] custom-scrollbar pr-0.5">
          {layerItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = !!layers[item.id];

            return (
              <div
                key={item.id}
                onClick={() => onToggleLayer(item.id)}
                className={`flex items-center justify-between w-full p-1.5 rounded-[6px] transition-all cursor-pointer border ${
                  isEnabled
                    ? "bg-[#F8FAFC] border-[#CBD5E1]"
                    : "bg-white border-transparent hover:bg-[#F1F5F9]"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className={`w-7 h-7 shrink-0 rounded-[6px] ${item.bg} ${item.color} flex items-center justify-center border border-current/20`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/layers:opacity-100 group-hover/layers:w-[155px] text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[#0F172A] truncate leading-tight">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#64748B] truncate leading-none mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Right Switch Control & Count Badge */}
                <div className="overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/layers:opacity-100 group-hover/layers:w-auto shrink-0 pl-1">
                  <div className="flex items-center gap-1.5">
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[9px] font-bold text-[#64748B] bg-slate-100 px-1.5 py-0.2 rounded-[3px]">
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span className="text-[8px] font-black text-[#ea580c] bg-orange-50 px-1 py-0.2 rounded-[2px] border border-orange-200 uppercase">
                        {item.badge}
                      </span>
                    )}
                    <Switch
                      checked={isEnabled}
                      onChange={() => onToggleLayer(item.id)}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* POI Category Filter (When POI layer is enabled) */}
        {layers.pois && (
          <div className="w-full mt-2 pt-2 border-t border-[#E2E8F0] overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/layers:opacity-100 group-hover/layers:w-full">
            <label className="block text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-1">
              Filter Kategori POI:
            </label>
            <select
              value={selectedPoiCategory}
              onChange={(e) => onSelectPoiCategory(e.target.value)}
              className="w-full px-2 py-1 text-[11px] font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:outline-none focus:border-[#ea580c]"
            >
              <option value="ALL">Semua Kategori ({poiCategories.length})</option>
              {poiCategories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Bottom Quick Tools */}
      <div className="flex flex-col gap-1 w-full px-2.5 pb-3 pt-2 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={onOpenLegend}
          className="flex items-center gap-2.5 w-full p-1.5 rounded-[6px] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          title="Buka Legenda Peta"
        >
          <div className="w-7 h-7 shrink-0 rounded-[6px] bg-slate-100 flex items-center justify-center text-[#475569]">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/layers:opacity-100 group-hover/layers:w-auto text-xs font-semibold whitespace-nowrap">
            Kamus Legenda Peta
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenWeather}
          className="flex items-center gap-2.5 w-full p-1.5 rounded-[6px] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          title="Buka Radar Cuaca Satelit"
        >
          <div className="w-7 h-7 shrink-0 rounded-[6px] bg-orange-50 flex items-center justify-center text-[#ea580c]">
            <Cloud className="w-3.5 h-3.5" />
          </div>
          <span className="overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/layers:opacity-100 group-hover/layers:w-auto text-xs font-semibold whitespace-nowrap">
            Panel Cuaca & Jam
          </span>
        </button>

        <button
          type="button"
          onClick={onResetView}
          className="flex items-center gap-2.5 w-full p-1.5 rounded-[6px] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          title="Reset Sudut Pandang Peta"
        >
          <div className="w-7 h-7 shrink-0 rounded-[6px] bg-slate-100 flex items-center justify-center text-[#475569]">
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
          <span className="overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/layers:opacity-100 group-hover/layers:w-auto text-xs font-semibold whitespace-nowrap">
            Reset Kamera Peta
          </span>
        </button>
      </div>
    </aside>
  );
}

export default MapRightLayerSidebar;
