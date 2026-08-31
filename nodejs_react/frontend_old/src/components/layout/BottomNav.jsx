import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard,
  MapPin,
  Bike,
  Users,
  BrainCircuit,
  Navigation,
  DollarSign,
  UserCheck,
  BarChart3,
  ShoppingBag,
  Settings,
} from "lucide-react";

export function BottomNav() {
  const { user } = useAuth();
  const role = user?.role || "RIDER";

  const getNavItems = () => {
    switch (role) {
      case "RIDER":
        return [
          { label: "Shift", path: "/rider/zone", icon: DollarSign },
          { label: "Peta", path: "/rider/map", icon: Navigation },
          { label: "Profil", path: "/profile", icon: UserCheck },
        ];

      case "SUPERVISOR":
        return [
          { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
          { label: "Zona", path: "/zones", icon: MapPin },
          { label: "Plotting", path: "/distribution", icon: Users },
          { label: "Live Map", path: "/rider/map", icon: Navigation },
          { label: "Laporan", path: "/reports", icon: BarChart3 },
        ];

      case "MANAGEMENT":
        return [
          { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
          { label: "Akun", path: "/users", icon: Users },
          { label: "Armada", path: "/fleet", icon: Bike },
          { label: "Katalog", path: "/catalog", icon: ShoppingBag },
          { label: "Laporan", path: "/reports", icon: BarChart3 },
        ];

      case "SUPERADMIN":
      default:
        return [
          { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
          { label: "DSS", path: "/dss", icon: BrainCircuit },
          { label: "Zona", path: "/zones", icon: MapPin },
          { label: "Distribusi", path: "/distribution", icon: Users },
          { label: "Sistem", path: "/settings", icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border-t border-[#D2D2D4] z-40 px-2 py-1.5 flex items-center justify-around shadow-lg safe-bottom-padding select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-[11px] font-semibold min-h-[44px] min-w-[56px] justify-center ${
                isActive
                  ? "text-[#FF634A] font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="truncate max-w-[64px]">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
