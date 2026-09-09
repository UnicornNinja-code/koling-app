import React from "react";
import { Sun, SunDim, Sunset, Moon, Clock } from "lucide-react";

/**
 * Enhanced Map TimeSlot & Hourly Slice Bar
 * Allows switching between 4 operational time slots and inspecting specific 1-hour intervals.
 */
export function MapTimeSlotBar({
  selectedSlot = "pagi",
  onSelectSlot,
  selectedHour = null,
  onSelectHour,
}) {
  const slots = [
    { key: "pagi", label: "Pagi", time: "06:00 - 10:00", hours: ["06:00", "07:00", "08:00", "09:00", "10:00"], icon: SunDim },
    { key: "siang", label: "Siang", time: "11:00 - 14:00", hours: ["11:00", "12:00", "13:00", "14:00"], icon: Sun },
    { key: "sore", label: "Sore", time: "15:00 - 17:00", hours: ["15:00", "16:00", "17:00"], icon: Sunset },
    { key: "malam", label: "Malam", time: "18:00 - 21:00", hours: ["18:00", "19:00", "20:00", "21:00"], icon: Moon },
  ];

  const currentSlotObj = slots.find((s) => s.key === selectedSlot) || slots[0];

  return (
    <div className="absolute top-3 left-3 z-30 flex flex-col gap-1 select-none font-sans">
      {/* Main Timeslot Row */}
      <div className="flex items-center bg-white border border-[#E5E5E5] rounded-[6px] p-1 shadow-sm">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 text-[10px] font-bold text-[#737373] uppercase tracking-wider border-r border-[#E5E5E5] mr-1">
          <Clock className="w-3 h-3 text-[#ea580c]" />
          <span>Slot Waktu C3</span>
        </div>

        <div className="flex items-center gap-1">
          {slots.map((slot) => {
            const Icon = slot.icon;
            const isSelected = selectedSlot === slot.key;

            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => {
                  onSelectSlot(slot.key);
                  if (onSelectHour) onSelectHour(null); // Reset hourly slice on slot change
                }}
                className={`flex items-center gap-1.5 px-2.5 h-7 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#ea580c] text-white shadow-xs"
                    : "text-[#525252] hover:text-[#111111] hover:bg-[#F5F5F5]"
                }`}
                title={`${slot.label} (${slot.time})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{slot.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hourly Slices Sub-Bar */}
      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-[#E5E5E5] rounded-[6px] p-1 shadow-2xs self-start">
        <span className="text-[9px] font-bold text-[#737373] uppercase px-1.5 border-r border-[#E5E5E5] mr-0.5">
          Jam:
        </span>
        <button
          type="button"
          onClick={() => onSelectHour && onSelectHour(null)}
          className={`px-1.5 h-5 rounded-[3px] text-[10px] font-bold transition-colors cursor-pointer ${
            selectedHour === null
              ? "bg-[#2563EB] text-white"
              : "text-[#737373] hover:text-[#111111] hover:bg-[#F0F0F0]"
          }`}
        >
          Semua ({currentSlotObj.label})
        </button>
        {currentSlotObj.hours.map((hour) => (
          <button
            key={hour}
            type="button"
            onClick={() => onSelectHour && onSelectHour(hour)}
            className={`px-1.5 h-5 rounded-[3px] text-[10px] font-mono font-bold transition-colors cursor-pointer ${
              selectedHour === hour
                ? "bg-[#ea580c] text-white"
                : "text-[#525252] hover:text-[#111111] hover:bg-[#F0F0F0]"
            }`}
          >
            {hour}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MapTimeSlotBar;
