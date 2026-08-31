import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Coffee, Search, HelpCircle, Bell, User } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  const role = user?.role || "RIDER";

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xs border-b border-[#D2D2D4]/60 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Area: Mobile logo + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden w-9 h-9 rounded-xl bg-[#FF634A] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
          <Coffee className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <h2 className="font-heading font-extrabold text-sm md:text-base text-slate-900 leading-tight truncate">
            {title || "COZIS"}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs md:max-w-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Middle Area: Global Search Bar (Matching Image 2) */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search zones, riders, metrics..."
            className="w-full bg-[#F4F4F6] text-xs text-slate-900 placeholder:text-slate-400 pl-9 pr-4 py-2 rounded-full border border-[#D2D2D4]/50 focus:outline-none focus:border-[#FF634A] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Area: Help, Notifications & User Profile (Matching Image 2) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Help Icon */}
        <button
          type="button"
          title="Bantuan & Panduan"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-[#F4F4F6] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          title="Notifikasi Sistem"
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-[#F4F4F6] transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF634A] ring-2 ring-white" />
        </button>

        {/* User Profile Pill */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-[#F4F4F6] transition-colors border border-transparent hover:border-[#D2D2D4]/50 select-none"
        >
          <div className="w-8 h-8 rounded-full bg-[#FF634A] text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
            {user?.name?.[0] || user?.username?.[0] || "U"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[110px]">
              {user?.name || user?.username || "Pengguna"}
            </p>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              {role}
            </span>
          </div>
        </NavLink>
      </div>
    </header>
  );
}
