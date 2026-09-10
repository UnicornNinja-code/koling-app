import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Send,
  Bike,
  Truck,
  BrainCircuit,
  SlidersHorizontal,
  Scale,
  FileBarChart,
  FileSpreadsheet,
  BadgeDollarSign,
  ScrollText,
  Map,
  Users,
  Package,
  Store,
  Compass,
  RefreshCw,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export function Sidebar({ collapsed = false, onToggleCollapse }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationGroups = [
    {
      title: "OPERATIONS",
      items: [
        { label: "Map Ops", href: "/map-ops", icon: MapPin },
        { label: "Distribusi", href: "/distribution", icon: Send },
        { label: "Operasional Rider", href: "/rider/zone", icon: Bike },
        { label: "Manajemen Armada", href: "/fleet", icon: Truck },
      ],
    },
    {
      title: "DECISION SUPPORT",
      items: [
        { label: "DSS & Rekomendasi", href: "/dss", icon: BrainCircuit },
        { label: "Kriteria & Bobot", href: "/dss/criteria", icon: SlidersHorizontal },
        { label: "Konfigurasi BWM", href: "/dss/bwm", icon: Scale },
      ],
    },
    {
      title: "REPORTING",
      items: [
        { label: "Laporan Operasional", href: "/reports/operational", icon: FileBarChart },
        { label: "Laporan DSS", href: "/reports/dss", icon: FileSpreadsheet },
        { label: "Laporan Penjualan", href: "/reports/sales", icon: BadgeDollarSign },
        { label: "Audit & Log", href: "/audit-logs", icon: ScrollText },
      ],
    },
    {
      title: "MASTER DATA",
      items: [
        { label: "Zona Master", href: "/zones", icon: Map },
        { label: "Pengguna", href: "/users", icon: Users },
        { label: "Armada", href: "/armadas", icon: Truck },
        { label: "Produk", href: "/catalog", icon: Package },
        { label: "POI Ingestion", href: "/pois", icon: Store },
        { label: "Kompetitor", href: "/competitors", icon: Compass },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Sinkronisasi", href: "/sync", icon: RefreshCw },
        { label: "Pengaturan", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 bg-[#131822] text-slate-300 border-r border-slate-800/80 flex flex-col transition-all duration-200 ${
        collapsed ? "w-18" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-gradient-to-tr from-blue-600 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            M
          </div>
          {!collapsed && (
            <div>
              <div className="font-black text-sm tracking-wide text-white font-['Inter'] uppercase">
                Mova
              </div>
              <div className="text-[9px] text-slate-400 font-medium truncate">
                Sejuta Jiwa Sidoarjo
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin">
        {/* Top-Level Standalone Dashboard Link */}
        <div>
          <Link
            to="/dashboard"
            title={collapsed ? "Dashboard" : undefined}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-xs font-semibold font-['Inter'] transition-all duration-150 ${
              location.pathname === "/dashboard" || location.pathname === "/"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80"
            } ${collapsed ? "justify-center px-2" : ""}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Dashboard Utama</span>}
          </Link>
        </div>

        {/* Grouped Categories */}
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-['Inter']">
                {group.title}
              </div>
            )}
            {group.items.map((item, iIdx) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={iIdx}
                  to={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-xs font-semibold font-['Inter'] transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 shrink-0">
        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-300 flex items-center justify-center text-xs font-black shadow-inner">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "SA"}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate font-['Inter']">
                  {user?.full_name || "Super Admin"}
                </div>
                <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider truncate">
                  {user?.role || "SUPERADMIN"}
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={logout}
              title="Keluar / Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-[8px] transition-colors cursor-pointer shrink-0 border border-transparent hover:border-red-900/50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
