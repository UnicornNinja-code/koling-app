import React from "react";
import { X, Layers } from "lucide-react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA MapLayerControlBox Component — Design System v3.0 SSOT
 * Exact match with floating "Layer" box in assets/img/map ops.png & operational rider.png
 */
export function MapLayerControlBox({
  isOpen = true,
  onClose,
  onToggleOpen,
  layers = {
    // Zona Operasional
    zoneActive: true,
    zoneRecommended: true,
    zoneDegraded: false,
    zoneInvalid: false,
    // Rider
    riderActive: true,
    riderDeviated: false,
    riderOffline: false,
    // Armada
    armadaActive: true,
    armadaMaintenance: false,
    armadaOffline: false,
    // POI & Roads
    poiPrimary: true,
    roadProtocol: false,
    roadToll: false,
  },
  onToggleLayer,
  className = "",
}) {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggleOpen}
        className={cn(
          "absolute top-4 left-4 z-400 bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B]",
          "text-[#0F172A] dark:text-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#1A2234] transition-all duration-150",
          className
        )}
      >
        <Layers className="w-4 h-4 text-[#EA580C]" />
        <span>Layer</span>
      </button>
    );
  }

  const handleToggle = (key) => {
    if (onToggleLayer) {
      onToggleLayer(key);
    }
  };

  return (
    <div
      className={cn(
        "absolute top-4 left-4 z-400 w-56 bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B]",
        "rounded-xl shadow-lg p-3 text-xs font-sans select-none animate-in fade-in zoom-in-95 duration-150",
        className
      )}
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <span className="font-heading font-bold text-[#0F172A] dark:text-white text-xs tracking-wide">
          Layer
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* 2. Group: Zona Operasional */}
        <div>
          <span className="block text-[11px] font-semibold text-[#0F172A] dark:text-white mb-1.5">
            Zona Operasional
          </span>
          <div className="space-y-1 pl-0.5">
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.zoneActive}
                onChange={() => handleToggle("zoneActive")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#3B82F6] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Zona Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.zoneRecommended}
                onChange={() => handleToggle("zoneRecommended")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#EA580C] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#EA580C] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Zona Rekomendasi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.zoneDegraded}
                onChange={() => handleToggle("zoneDegraded")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#F59E0B] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Zona Degradasi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.zoneInvalid}
                onChange={() => handleToggle("zoneInvalid")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#EF4444] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Zona Invalid</span>
            </label>
          </div>
        </div>

        {/* 3. Group: Rider */}
        <div>
          <span className="block text-[11px] font-semibold text-[#0F172A] dark:text-white mb-1.5">
            Rider
          </span>
          <div className="space-y-1 pl-0.5">
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.riderActive}
                onChange={() => handleToggle("riderActive")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#3B82F6] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Rider Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.riderDeviated}
                onChange={() => handleToggle("riderDeviated")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#EF4444] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Rider Deviasi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.riderOffline}
                onChange={() => handleToggle("riderOffline")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#94A3B8] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2 h-2 rounded-full bg-[#94A3B8] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Rider Offline</span>
            </label>
          </div>
        </div>

        {/* 4. Group: Armada */}
        <div>
          <span className="block text-[11px] font-semibold text-[#0F172A] dark:text-white mb-1.5">
            Armada
          </span>
          <div className="space-y-1 pl-0.5">
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.armadaActive}
                onChange={() => handleToggle("armadaActive")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#10B981] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Armada Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.armadaMaintenance}
                onChange={() => handleToggle("armadaMaintenance")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#F59E0B] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Armada Maintenance</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.armadaOffline}
                onChange={() => handleToggle("armadaOffline")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#94A3B8] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#94A3B8] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Armada Offline</span>
            </label>
          </div>
        </div>

        {/* 5. Group: POI & Jalan */}
        <div>
          <span className="block text-[11px] font-semibold text-[#0F172A] dark:text-white mb-1.5">
            POI
          </span>
          <div className="space-y-1 pl-0.5">
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.poiPrimary}
                onChange={() => handleToggle("poiPrimary")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#8B5CF6] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">POI Utama</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.roadProtocol}
                onChange={() => handleToggle("roadProtocol")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#3B82F6] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-3 h-0.5 bg-[#3B82F6] shrink-0 rounded-full" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Jalan Protokol</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-0.5">
              <input
                type="checkbox"
                checked={!!layers.roadToll}
                onChange={() => handleToggle("roadToll")}
                className="rounded-xs border-[#CBD5E1] dark:border-[#334155] text-[#EA580C] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="w-3 h-0.5 bg-[#EA580C] shrink-0 rounded-full" />
              <span className="text-[#334155] dark:text-[#CBD5E1] text-[11.5px]">Jalan Tol</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapLayerControlBox;
