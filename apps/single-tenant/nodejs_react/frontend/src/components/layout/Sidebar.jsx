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
  Coffee,
  UserCheck,
  ShoppingBag,
  BarChart3,
  MessageSquare,
  Activity,
} from "lucide-react";

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
        { label: "Live Spatial Map", path: "/rider/map", icon: Navigation },
        { label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
      ];
    }

    if (role === "MANAGEMENT") {
      return [
        { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
        { label: "Fleet Management", path: "/fleet", icon: Bike },
        { label: "Product Catalog", path: "/catalog", icon: ShoppingBag },
        { label: "User Management", path: "/users", icon: Users },
        { label: "Live Spatial Map", path: "/rider/map", icon: Navigation },
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
    <aside className="hidden md:flex w-[60px] bg-[#121215] border-r border-[#24242A] flex-col justify-between items-center py-3.5 h-screen sticky top-0 shrink-0 z-40 select-none">
      {/* Top Logo / App Brand */}
      <div className="flex flex-col items-center gap-5 w-full">
        <NavLink
          to="/superadmin/dashboard"
          title="MOVA — Coffee Operational Zone Intelligence System"
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#f97316] flex items-center justify-center text-white shadow-md hover:brightness-110 transition-all"
        >
          <Coffee className="w-5 h-5 text-white" />
        </NavLink>

        {/* Primary Icon Navigation Rail */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive: linkActive }) =>
                  `group relative w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    linkActive
                      ? "bg-[#ea580c] text-white shadow-md font-semibold"
                      : "text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24]"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                
                {/* Floating Tooltip */}
                <span className="absolute left-[48px] px-2.5 py-1 bg-[#18181B] text-white text-[11px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#2E2E38] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Avatar & Logout */}
      <div className="flex flex-col items-center gap-2.5 w-full px-1.5">
        <button
          onClick={logout}
          title="Logout Akun"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-rose-400 hover:bg-[#1F1F24] transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>

        <NavLink
          to="/profile"
          title={`Profil: ${user?.name || user?.username || "User"} (${role})`}
          className="w-8 h-8 rounded-full bg-[#18181B] border border-[#2E2E38] hover:border-[#f97316] flex items-center justify-center text-xs font-bold text-white transition-all overflow-hidden"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{user?.name?.[0] || user?.username?.[0] || "U"}</span>
          )}
        </NavLink>
      </div>
    </aside>
  );
}

