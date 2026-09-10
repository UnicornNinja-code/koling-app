import React from "react";
import { Sun, SunDim, Sunset, Moon, Clock } from "lucide-react";

/**
 * Enhanced Map TimeSlot & Hourly Slice Bar
 * Centered floating operational time-control with Antimetal dark/light styling
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
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 hidden sm:flex flex-col items-center gap-1 select-none font-sans pointer-events-auto">
      {/* Main Timeslot Row */}
      <div className="flex items-center bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#263244] rounded-[8px] p-1 shadow-lg transition-colors">
        <div className="flex items-center gap-1.5 px-2.5 text-[10px] font-bold text-[#737373] dark:text-[#A3A3A3] uppercase tracking-wider border-r border-[#E5E5E5] dark:border-[#263244] mr-1">
          <Clock className="w-3 h-3 text-[#2563EB]" />
          <span>Slot C3</span>
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
                  if (onSelectHour) onSelectHour(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 h-6.5 rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B]"
                }`}
                title={`${slot.label} (${slot.time})`}
              >
                <Icon className="w-3 h-3" />
                <span>{slot.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hourly Slices Sub-Bar */}
      <div className="flex items-center gap-1 bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] px-1.5 py-0.5 shadow-md transition-colors">
        <span className="text-[9px] font-bold text-[#737373] dark:text-[#A3A3A3] uppercase px-1 border-r border-[#E5E5E5] dark:border-[#263244] mr-0.5">
          Jam:
        </span>
        <button
          type="button"
          onClick={() => onSelectHour && onSelectHour(null)}
          className={`px-1.5 h-5 rounded-[4px] text-[9px] font-bold transition-colors cursor-pointer ${
            selectedHour === null
              ? "bg-[#2563EB] text-white font-extrabold"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B]"
          }`}
        >
          Semua ({currentSlotObj.label})
        </button>
        {currentSlotObj.hours.map((hour) => (
          <button
            key={hour}
            type="button"
            onClick={() => onSelectHour && onSelectHour(hour)}
            className={`px-1.5 h-5 rounded-[4px] text-[9px] font-mono font-bold transition-colors cursor-pointer ${
              selectedHour === hour
                ? "bg-[#2563EB] text-white"
                : "text-[#525252] dark:text-[#D4D4D4] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B]"
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
