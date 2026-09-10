import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard,
  Navigation,
  BrainCircuit,
  BarChart3,
  Database,
  Settings,
  LogOut,
  User,
  ChevronRight,
  MapPin,
  Users,
  Bike,
  Layers,
  ShoppingBag,
  Activity,
  FileText,
  Sliders,
  Scale,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  FolderSync,
  Store,
} from "lucide-react";

/**
 * MOVA Sidebar Component — Design System v3.0 SSOT
 * Exact match with assets/img (dss.png, map ops.png, operational rider.png, dashboard.png):
 * - Width: 240px expanded dark navigation (#0F172A / #111827)
 * - Brand: MOVA logo with orange dot above 'A'
 * - 6 Group Sections: OVERVIEW, OPERATIONS, DECISION SUPPORT, REPORTING, MASTER DATA, SYSTEM
 * - Active Item: border-l-2 border-[#EA580C] bg-[#1F2937] text-white with orange icon (#EA580C)
 * - User profile card footer with SA avatar and chevron
 */
export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || "SUPERADMIN";

  const navigationSections = [
    {
      group: "OVERVIEW",
      items: [
        { label: "Overview", path: "/superadmin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        { label: "Map Ops", path: "/map-ops", icon: Navigation },
        { label: "Distribusi", path: "/distribution", icon: Users },
        { label: "Operasional Rider", path: "/rider/zone", icon: Activity },
        { label: "Armada", path: "/fleet", icon: Bike },
      ],
    },
    {
      group: "DECISION SUPPORT",
      items: [
        { label: "DSS", path: "/dss", icon: BrainCircuit },
        { label: "Kriteria", path: "/dss?tab=criteria", icon: Sliders },
        { label: "Konfigurasi BWM", path: "/dss?tab=bwm", icon: Scale },
      ],
    },
    {
      group: "REPORTING",
      items: [
        { label: "Operasional", path: "/reports?tab=operational", icon: BarChart3 },
        { label: "DSS", path: "/reports?tab=dss", icon: FileText },
        { label: "Penjualan", path: "/reports?tab=sales", icon: DollarSign },
        { label: "Audit Log", path: "/reports?tab=audit", icon: ShieldCheck },
      ],
    },
    {
      group: "MASTER DATA",
      items: [
        { label: "Zona", path: "/zones", icon: MapPin },
        { label: "Armada", path: "/fleet", icon: Bike },
        { label: "POI", path: "/pois", icon: Store },
        { label: "Pengguna", path: "/users", icon: Users },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        { label: "Sinkronisasi", path: "/settings?tab=sync", icon: RefreshCw },
        { label: "Pengaturan", path: "/settings", icon: Settings },
      ],
    },
  ];

  const isItemActive = (itemPath) => {
    const currentPath = location.pathname + location.search;
    if (itemPath.includes("?")) {
      return currentPath === itemPath;
    }
    return location.pathname === itemPath.split("?")[0];
  };

  return (
    <aside className="w-[240px] bg-[#0F172A] border-r border-[#1E293B] flex flex-col h-screen shrink-0 select-none z-40 transition-colors duration-150">
      {/* 1. Header / MOVA Brand Logo with Orange Dot */}
      <div className="h-16 flex items-center px-6 border-b border-[#1E293B]/80 shrink-0">
        <NavLink to="/superadmin/dashboard" className="flex items-center gap-1 group">
          <span className="font-extrabold text-2xl tracking-wider text-white flex items-center">
            MOV
            <span className="relative">
              A
              {/* Signature Orange Dot above the letter A */}
              <span className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-[#EA580C] shadow-xs shadow-orange-500/50" />
            </span>
          </span>
        </NavLink>
      </div>

      {/* 2. Navigation Sections (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navigationSections.map((section) => (
          <div key={section.group} className="space-y-1">
            {/* Section Heading */}
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
              {section.group}
            </h3>

            {/* Section Items */}
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.path);

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
                      active
                        ? "bg-[#1E293B] text-white border-l-2 border-[#EA580C] font-semibold"
                        : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? "text-[#EA580C]" : "text-[#94A3B8]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom User Profile Card */}
      <div className="p-3 border-t border-[#1E293B] shrink-0 bg-[#0F172A]">
        <NavLink
          to="/profile"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1E293B] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Circle SA */}
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-[#EA580C] transition-colors">
                {user?.name || "Super Admin"}
              </p>
              <p className="text-[10px] text-[#64748B] truncate leading-tight mt-0.5">
                {user?.email || "superadmin@mova.id"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-white shrink-0 transition-colors" />
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
