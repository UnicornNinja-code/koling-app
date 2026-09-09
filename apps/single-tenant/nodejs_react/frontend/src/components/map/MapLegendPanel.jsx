import React from "react";
import { X, Info } from "lucide-react";

/**
 * Compact Map Semantic Legend Panel
 */
export function MapLegendPanel({ onClose }) {
  const riderStatuses = [
    { label: "Operating (In Zone)", color: "bg-[#16A34A]", border: "border-[#16A34A]" },
    { label: "Waiting / Standby", color: "bg-[#D97706]", border: "border-[#D97706]" },
    { label: "Deviated / Route Violation", color: "bg-[#DC2626]", border: "border-[#DC2626]" },
    { label: "Outside Operational Zone", color: "bg-[#737373]", border: "border-[#737373]" },
  ];

  const spatialElements = [
    { label: "Operational Geofence", symbol: "h-3 w-4 border border-[#2563EB] bg-[#2563EB]/15 rounded-[2px]" },
    { label: "Prohibited Protocol Road", symbol: "h-0.5 w-4 bg-[#DC2626] border-t-2 border-dashed border-[#DC2626]" },
    { label: "DSS Rank #1 Best Zone", symbol: "h-3 w-4 border border-[#16A34A] bg-[#16A34A]/25 rounded-[2px]" },
    { label: "Active Mobile Fleet (Bike)", symbol: "w-3 h-3 rounded-full bg-[#111111] border border-white" },
  ];

  return (
    <div className="absolute top-12 right-3 z-30 w-64 bg-white border border-[#E5E5E5] rounded-[6px] shadow-md p-3 select-none animate-in fade-in zoom-in-95 duration-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111111]">
          <Info className="w-4 h-4 text-[#2563EB]" />
          <span>Operational GIS Legend</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#737373] hover:text-[#111111] p-0.5 rounded-[4px] hover:bg-[#F5F5F5]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rider Status Legend */}
      <div className="mb-2.5">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-1.5">
          Rider LBS Status
        </h4>
        <div className="space-y-1.5">
          {riderStatuses.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] text-[#111111]">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spatial Geometry Legend */}
      <div className="pt-2 border-t border-[#E5E5E5]">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-1.5">
          Spatial Boundaries
        </h4>
        <div className="space-y-1.5">
          {spatialElements.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] text-[#111111]">
              <div className="w-4 flex items-center justify-center shrink-0">
                <span className={item.symbol} />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
