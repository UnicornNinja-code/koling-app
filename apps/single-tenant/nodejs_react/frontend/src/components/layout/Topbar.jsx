import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Coffee, Search, MessageSquare, Phone, MoreVertical, Bell, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  const role = user?.role || "RIDER";

  return (
    <header className="h-16 bg-[#121215] border-b border-[#24242A] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left Area: Context Header matching Lampiran 1 */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#18181B] border border-[#24242A] flex items-center justify-center text-[#f97316] font-bold text-sm shrink-0 shadow-xs">
          <MapPin className="w-4 h-4 text-[#f97316]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-sm md:text-base text-white leading-tight truncate">
              {title || "Sidoarjo Hub Utama"}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-[11px] text-[#71717A] font-normal truncate mt-0.5">
            {subtitle || "ID: HUB-SDA-01 • Sidoarjo, Jawa Timur"}
          </p>
        </div>
      </div>

      {/* Middle Area: Clean Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari zona, rider, metrik... (Ctrl+K)"
            className="w-full bg-[#18181B] hover:bg-[#1F1F24] focus:bg-[#1F1F24] text-xs text-white placeholder:text-[#71717A] pl-9 pr-4 py-2 rounded-full border border-[#24242A] focus:border-[#f97316] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Area: Action Icons + Profile matching Lampiran 1 */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          title="Pesan & Komunikasi"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Bantuan Operasional"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24] transition-colors cursor-pointer"
        >
          <Phone className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Menu Opsi"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24] transition-colors cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#24242A] mx-1 hidden sm:block" />

        {/* User Profile Pill */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-[#18181B] transition-colors border border-transparent hover:border-[#24242A] select-none"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#f97316] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
            {user?.name?.[0] || user?.username?.[0] || "U"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-none truncate max-w-[110px]">
              {user?.name || user?.username || "SuperAdmin"}
            </p>
            <span className="text-[10px] text-[#f97316] font-bold uppercase tracking-wider block mt-0.5">
              {role}
            </span>
          </div>
        </NavLink>
      </div>
    </header>
  );
}

