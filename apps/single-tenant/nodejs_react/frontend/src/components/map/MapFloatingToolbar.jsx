import React from "react";
import {
  Layers,
  MapPin,
  Cloud,
  Compass,
  Plus,
  Minus,
  RotateCcw,
  ListFilter,
  Info,
} from "lucide-react";

/**
 * Compact Enterprise Map Floating Toolbar
 * Rectangular geometry (6px radius), 1px border separation, subtle elevation
 */
export function MapFloatingToolbar({
  activePanel,
  onTogglePanel,
  onZoomIn,
  onZoomOut,
  onResetView,
  isLiveConnected = false,
}) {
  const tools = [
    { id: "layers", label: "Layers", icon: Layers },
    { id: "legend", label: "Legend", icon: Info },
    { id: "weather", label: "Weather", icon: Cloud },
  ];

  return (
    <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white border border-[#E5E5E5] rounded-[6px] p-1 shadow-sm select-none">
      {/* Live Status Indicator */}
      <div
        className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#525252] border-r border-[#E5E5E5] mr-0.5"
        title={isLiveConnected ? "Socket.IO Live Telemetry Connected" : "Connecting Live Stream..."}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isLiveConnected ? "bg-[#16A34A] animate-pulse" : "bg-[#D97706]"
          }`}
        />
        <span className="hidden sm:inline">{isLiveConnected ? "LIVE" : "SYNC"}</span>
      </div>

      {/* Layer / Legend / Weather Popover Toggles */}
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activePanel === tool.id;

        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onTogglePanel(tool.id)}
            title={tool.label}
            className={`flex items-center gap-1 px-2.5 h-7 rounded-[4px] text-[12px] font-medium transition-colors ${
              isActive
                ? "bg-[#2563EB] text-white"
                : "text-[#525252] hover:text-[#111111] hover:bg-[#F5F5F5]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{tool.label}</span>
          </button>
        );
      })}

      <div className="h-4 w-px bg-[#E5E5E5] mx-0.5" />

      {/* Map Action Controls */}
      <button
        type="button"
        onClick={onResetView}
        title="Reset Map View (Sidoarjo Hub)"
        className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[#525252] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom In"
        className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[#525252] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom Out"
        className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[#525252] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
