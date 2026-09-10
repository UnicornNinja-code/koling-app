import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { Search, Bell, Sun, Moon, MapPin } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

/**
 * MOVA Topbar Component — Design System v3.0 SSOT
 * Exact match with assets/img (dss.png, map ops.png, operational rider.png):
 * - Left: Dynamic Breadcrumb + Live indicator
 * - Center/Right: Search bar (Ctrl + K)
 * - Right: Red badge notification bell (3), theme switch, and user badge
 */
export function Topbar({ title, breadcrumb }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const role = user?.role || "SUPERADMIN";

  // Compute breadcrumbs matching screenshot conventions
  const getBreadcrumbs = () => {
    if (breadcrumb) return breadcrumb;
    const p = location.pathname;
    if (p.includes("/dss")) return { parent: "DSS", current: "Manajemen" };
    if (p.includes("/map-ops")) return { parent: "MOVA", current: "Map Ops", isLive: true };
    if (p.includes("/rider")) return { parent: "MOVA", current: "Operasional Rider" };
    if (p.includes("/distribution")) return { parent: "MOVA", current: "Distribusi" };
    if (p.includes("/fleet")) return { parent: "MOVA", current: "Armada" };
    if (p.includes("/zones")) return { parent: "Master Data", current: "Zona" };
    if (p.includes("/pois")) return { parent: "Master Data", current: "POI" };
    if (p.includes("/users")) return { parent: "Master Data", current: "Pengguna" };
    if (p.includes("/reports")) return { parent: "Reporting", current: "Laporan" };
    if (p.includes("/settings")) return { parent: "System", current: "Pengaturan" };
    if (p.includes("/profile")) return { parent: "Akun", current: "Profil" };
    return { parent: "MOVA", current: "Overview" };
  };

  const bc = getBreadcrumbs();

  return (
    <header className="h-14 bg-white dark:bg-[#131822] border-b border-[#E2E8F0] dark:border-[#1E293B] px-6 flex items-center justify-between sticky top-0 z-30 select-none font-sans transition-colors duration-150">
      {/* 1. Left: Breadcrumbs & Status */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-[#64748B] dark:text-[#94A3B8]">
          {bc.parent}
        </span>
        <span className="text-[#94A3B8] dark:text-[#64748B]">/</span>
        <span className="font-bold text-[#0F172A] dark:text-white">
          {bc.current}
        </span>

        {bc.isLive && (
          <div className="flex items-center gap-2 ml-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#DCFCE7] dark:bg-emerald-950/40 text-[#16A34A] border border-[#BBF7D0] dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              LIVE
            </span>
            <span className="hidden lg:inline text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              • Sidoarjo Hub • Sinkronisasi 1 menit lalu
            </span>
          </div>
        )}
      </div>

      {/* 2. Middle: Search Input (Ctrl + K) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kriteria, zona, atau konfigurasi..."
            className="w-full bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-[#1E293B] focus:bg-white dark:focus:bg-[#0B0F17] text-xs text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] pl-8 pr-12 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]/30 focus:outline-none transition-all shadow-2xs font-sans"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-semibold text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] px-1.5 py-0.5 rounded pointer-events-none">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Notifications (3), Theme Switcher, and User Profile Badge */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell with Red Badge 3 */}
        <button
          type="button"
          title="3 Notifikasi Sistem"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            3
          </span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Tema Terang" : "Tema Gelap"}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Sun className="w-4 h-4 text-[#64748B]" />
          )}
        </button>

        {/* User Badge SA */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1 leading-tight">
            <span className="text-xs font-bold text-[#0F172A] dark:text-white group-hover:text-[#EA580C] transition-colors">
              {user?.name || "Super Admin"}
            </span>
            <span className="text-[9px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase">
              {role}
            </span>
          </div>
        </NavLink>
      </div>
    </header>
  );
}

export default Topbar;
