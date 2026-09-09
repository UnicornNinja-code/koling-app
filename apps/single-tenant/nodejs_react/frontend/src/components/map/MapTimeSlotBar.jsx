import React from "react";
import { Sun, SunDim, Sunset, Moon } from "lucide-react";

/**
 * Compact Temporal Crowd Slot Bar
 */
export function MapTimeSlotBar({ selectedSlot, onSelectSlot }) {
  const slots = [
    { key: "pagi", label: "Pagi", time: "06:00 - 11:00", icon: SunDim },
    { key: "siang", label: "Siang", time: "11:00 - 15:00", icon: Sun },
    { key: "sore", label: "Sore", time: "15:00 - 19:00", icon: Sunset },
    { key: "malam", label: "Malam", time: "19:00 - 24:00", icon: Moon },
  ];

  return (
    <div className="absolute top-3 left-3 z-30 flex items-center bg-white border border-[#E5E5E5] rounded-[6px] p-1 shadow-sm select-none">
      <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-semibold text-[#737373] uppercase tracking-wider border-r border-[#E5E5E5] mr-1">
        <span>C3 Slot</span>
      </div>

      <div className="flex items-center gap-1">
        {slots.map((slot) => {
          const Icon = slot.icon;
          const isSelected = selectedSlot === slot.key;

          return (
            <button
              key={slot.key}
              type="button"
              onClick={() => onSelectSlot(slot.key)}
              className={`flex items-center gap-1.5 px-2.5 h-7 rounded-[4px] text-[12px] font-medium transition-colors ${
                isSelected
                  ? "bg-[#2563EB] text-white"
                  : "text-[#525252] hover:text-[#111111] hover:bg-[#F5F5F5]"
              }`}
              title={`${slot.label}: ${slot.time}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{slot.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
