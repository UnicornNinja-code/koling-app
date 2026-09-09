import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Search, MessageSquare, Phone, MoreVertical, MapPin, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  const role = user?.role || "RIDER";

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 select-none font-sans">
      {/* Left Area: Context Header */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-9 h-9 rounded-[8px] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ea580c] font-bold text-sm shrink-0 shadow-2xs">
          <MapPin className="w-4 h-4 text-[#ea580c]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-sm md:text-base text-[#0F172A] leading-tight truncate tracking-tight">
              {title || "Sidoarjo Hub Utama"}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] font-normal truncate mt-0.5">
            {subtitle || "ID: HUB-SDA-01 • Sidoarjo, Jawa Timur"}
          </p>
        </div>
      </div>

      {/* Middle Area: Clean Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari zona, rider, metrik... (Ctrl+K)"
            className="w-full bg-[#F8FAFC] hover:bg-white focus:bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] pl-9 pr-4 py-2 rounded-[8px] border border-[#E2E8F0] focus:border-[#ea580c] focus:outline-none transition-all shadow-2xs font-sans"
          />
        </div>
      </div>

      {/* Right Area: Action Icons + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          type="button"
          title="Notifikasi Sistem"
          className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Pesan & Komunikasi"
          className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Bantuan Operasional"
          className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer"
        >
          <Phone className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#E2E8F0] mx-1 hidden sm:block" />

        {/* User Profile Pill */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-[8px] bg-white hover:bg-[#F8FAFC] transition-colors border border-[#E2E8F0] shadow-2xs select-none"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#f97316] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
            {user?.name?.[0] || user?.username?.[0] || "U"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#0F172A] leading-none truncate max-w-[110px]">
              {user?.name || user?.username || "SuperAdmin"}
            </p>
            <span className="text-[10px] text-[#ea580c] font-extrabold uppercase tracking-wider block mt-0.5">
              {role}
            </span>
          </div>
        </NavLink>
      </div>
    </header>
  );
}

export default Topbar;
