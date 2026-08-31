import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard,
  MapPin,
  Bike,
  Users,
  BrainCircuit,
  Settings,
  LogOut,
  Navigation,
  DollarSign,
  Coffee,
  UserCheck,
  ShoppingBag,
  BarChart3,
  User,
} from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role || "RIDER";

  const getNavSections = () => {
    if (role === "RIDER") {
      return [
        {
          title: "MAIN MENU",
          items: [
            { label: "Shift Hari Ini", path: "/rider/zone", icon: DollarSign, badge: "LIVE" },
            { label: "Peta Operasional", path: "/rider/map", icon: Navigation },
            { label: "Profil Saya", path: "/profile", icon: UserCheck },
          ],
        },
      ];
    }

    if (role === "SUPERVISOR") {
      return [
        {
          title: "MAIN MENU",
          items: [
            { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard, badge: "LIVE" },
          ],
        },
        {
          title: "MANAGEMENT",
          items: [
            { label: "Zone Management", path: "/zones", icon: MapPin },
            { label: "Rider Distribution", path: "/distribution", icon: Users },
            { label: "Fleet Management", path: "/fleet", icon: Bike },
            { label: "DSS Management", path: "/dss", icon: BrainCircuit, badge: "BWM" },
          ],
        },
        {
          title: "ANALYTICS & BUSINESS",
          items: [
            { label: "Live Spatial Map", path: "/rider/map", icon: Navigation },
            { label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
          ],
        },
      ];
    }

    if (role === "MANAGEMENT") {
      return [
        {
          title: "MAIN MENU",
          items: [
            { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard, badge: "LIVE" },
          ],
        },
        {
          title: "MANAGEMENT",
          items: [
            { label: "Fleet Management", path: "/fleet", icon: Bike },
            { label: "Product Catalog", path: "/catalog", icon: ShoppingBag },
            { label: "User Management", path: "/users", icon: Users },
          ],
        },
        {
          title: "ANALYTICS & BUSINESS",
          items: [
            { label: "Live Spatial Map", path: "/rider/map", icon: Navigation },
            { label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
          ],
        },
      ];
    }

    // Default: SUPERADMIN (Full Access Matching Image 2)
    return [
      {
        title: "MAIN MENU",
        items: [
          { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard, badge: "LIVE" },
        ],
      },
      {
        title: "MANAGEMENT",
        items: [
          { label: "Zone Management", path: "/zones", icon: MapPin },
          { label: "Rider Distribution", path: "/distribution", icon: Users },
          { label: "Fleet Management", path: "/fleet", icon: Bike },
          { label: "DSS Management", path: "/dss", icon: BrainCircuit, badge: "BWM" },
        ],
      },
      {
        title: "ANALYTICS & BUSINESS",
        items: [
          { label: "Product Catalog", path: "/catalog", icon: ShoppingBag },
          { label: "User Management", path: "/users", icon: Users },
          { label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
          { label: "Settings & Config", path: "/settings", icon: Settings },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#D2D2D4]/60 flex-col justify-between h-screen sticky top-0 shrink-0 z-30 shadow-xs select-none">
      <div>
        {/* Brand Header (Matching Image 2: Starling. / COZIS) */}
        <div className="p-5 border-b border-[#D2D2D4]/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF634A] flex items-center justify-center text-white font-black text-xl shadow-xs shrink-0">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-slate-900 text-base tracking-tight leading-none">
              Starling.
            </h2>
            <span className="text-[10px] text-[#FF634A] font-bold tracking-wider uppercase block mt-0.5">
              Mobile Coffee DSS
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#FFF2EF] text-[#FF634A] font-bold shadow-2xs"
                          : "text-slate-600 hover:bg-[#F4F4F6] hover:text-slate-900"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-red-100/80 text-[#FF634A] border border-red-200 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Info & Logout Footer (Matching Image 2) */}
      <div className="p-3.5 border-t border-[#D2D2D4]/40 space-y-2.5 bg-[#F4F4F6]/50">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2 bg-white rounded-xl transition-all border border-[#D2D2D4]/50 shadow-2xs hover:border-[#FF634A]/30"
        >
          <div className="w-8 h-8 rounded-full bg-[#FF634A] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
            {user?.name?.[0] || user?.username?.[0] || "U"}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">
              {user?.name || user?.username || "BudiSuper"}
            </p>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {user?.role || "SUPERADMIN"}
            </span>
          </div>
        </NavLink>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors border border-[#D2D2D4]/60 shadow-2xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
