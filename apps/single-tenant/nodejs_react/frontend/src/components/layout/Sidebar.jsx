import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard,
  MapPin,
  Layers,
  Bike,
  Users,
  BrainCircuit,
  Settings,
  LogOut,
  Navigation,
  UserCheck,
  ShoppingBag,
  BarChart3,
  Activity,
} from "lucide-react";

import { MovaLogo } from "../common/MovaLogo.jsx";

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role || "RIDER";

  const getNavItems = () => {
    if (role === "RIDER") {
      return [
        { label: "Shift Hari Ini", path: "/rider/zone", icon: Activity },
        { label: "Peta Operasional", path: "/rider/map", icon: Navigation },
        { label: "Profil Saya", path: "/profile", icon: UserCheck },
      ];
    }

    if (role === "SUPERVISOR") {
      return [
        { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
        { label: "Zone Management", path: "/zones", icon: MapPin },
        { label: "POI Intelligence", path: "/pois", icon: Layers },
        { label: "Competitor Intelligence", path: "/competitors", icon: ShoppingBag },
        { label: "Rider Distribution", path: "/distribution", icon: Users },
        { label: "Fleet Management", path: "/fleet", icon: Bike },
        { label: "DSS Management", path: "/dss", icon: BrainCircuit },
        { label: "Live Spatial Map", path: "/map-ops", icon: Navigation },
        { label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
      ];
    }

    if (role === "MANAGEMENT") {
      return [
        { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
        { label: "Fleet Management", path: "/fleet", icon: Bike },
        { label: "Product Catalog", path: "/catalog", icon: ShoppingBag },
        { label: "User Management", path: "/users", icon: Users },
        { label: "Live Spatial Map", path: "/map-ops", icon: Navigation },
        { label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
      ];
    }

    // Default: SUPERADMIN
    return [
      { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
      { label: "Map Ops (Live)", path: "/map-ops", icon: Navigation },
      { label: "Zone Management", path: "/zones", icon: MapPin },
      { label: "POI Intelligence", path: "/pois", icon: Layers },
      { label: "Competitor Intelligence", path: "/competitors", icon: ShoppingBag },
      { label: "Rider Distribution", path: "/distribution", icon: Users },
      { label: "Fleet Management", path: "/fleet", icon: Bike },
      { label: "DSS Management", path: "/dss", icon: BrainCircuit },
      { label: "Product Catalog", path: "/catalog", icon: ShoppingBag },
      { label: "User Management", path: "/users", icon: Users },
      { label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
      { label: "Settings & Config", path: "/settings", icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden md:flex flex-col justify-between items-start py-3.5 h-screen sticky top-0 shrink-0 z-50 select-none bg-white border-r border-[#E2E8F0] transition-all duration-300 ease-in-out group/sidebar w-[64px] hover:w-[236px] overflow-x-hidden shadow-sm">
      {/* Top Logo / App Brand */}
      <div className="flex flex-col items-start gap-4 w-full px-2.5">
        <NavLink
          to="/superadmin/dashboard"
          title="MOVA — Coffee Operational Zone Intelligence System"
          className="flex items-center gap-3 w-full p-1 rounded-[8px] hover:bg-[#F8FAFC] transition-all overflow-hidden"
        >
          <div className="w-10 h-10 shrink-0 rounded-[8px] bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#ea580c] shadow-2xs group-hover/sidebar:border-[#ea580c] transition-colors">
            <MovaLogo size="sm" variant="mark-only" theme="light" />
          </div>
          <div className="overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap">
            <MovaLogo size="md" variant="full" theme="light" showSubtitle subtitle="Zone Intelligence" />
          </div>
        </NavLink>

        {/* Primary Icon + Text Navigation Rail */}
        <nav className="flex flex-col gap-1 w-full mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive: linkActive }) =>
                  `flex items-center w-full px-2.5 py-2 rounded-[6px] transition-all duration-150 ${
                    linkActive
                      ? "bg-[#ea580c] text-white shadow-xs font-bold"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                  }`
                }
              >
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Expandable Label */}
                <span className="ml-3 text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Avatar & Logout */}
      <div className="flex flex-col gap-2 w-full px-2.5 pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between w-full p-1 rounded-[6px] hover:bg-[#F8FAFC] transition-colors">
          <NavLink
            to="/profile"
            title={`Profil: ${user?.name || user?.username || "User"} (${role})`}
            className="flex items-center gap-2.5 overflow-hidden flex-1"
          >
            <div className="w-8 h-8 shrink-0 rounded-full bg-orange-100 text-[#ea580c] border border-orange-200 hover:border-[#ea580c] flex items-center justify-center text-xs font-bold transition-colors overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.[0] || user?.username?.[0] || "U"}</span>
              )}
            </div>

            <div className="overflow-hidden transition-all duration-300 opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto whitespace-nowrap">
              <div className="text-xs font-bold text-[#0F172A] truncate max-w-[110px]">
                {user?.name || user?.username || "User"}
              </div>
              <div className="text-[10px] text-[#ea580c] font-extrabold uppercase">
                {role}
              </div>
            </div>
          </NavLink>

          <button
            onClick={logout}
            title="Logout Akun"
            className="w-7 h-7 shrink-0 rounded-[4px] flex items-center justify-center text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
