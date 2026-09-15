import React from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Radio,
  Clock,
  Menu,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Avatar } from "../ui/Avatar.jsx";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";
import { NotificationDropdown } from "./NotificationDropdown.jsx";

export function Topbar({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 font-['Inter']">
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-[6px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari zona, rider, menu... (Ctrl+K)"
            className="w-full text-xs font-medium bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-[8px] pl-9 pr-14 py-1.5 h-8.5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-[4px] pointer-events-none shadow-2xs">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2">
        {/* Dark/Light Theme Toggle */}
        <ThemeToggle variant="button" size="md" />

        {/* Live Notification Dropdown */}
        <NotificationDropdown />

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <Avatar
            role={user?.role || "admin"}
            name={user?.full_name || "Super Admin"}
            size="sm"
            status="online"
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.full_name || "Super Admin"}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {user?.role || "SUPERADMIN"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
