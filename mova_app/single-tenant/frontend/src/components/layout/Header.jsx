import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Header as CarbonHeader,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  Tag,
} from "@carbon/react";
import {
  Menu,
  Sun,
  Moon,
  UserAvatar,
  Logout,
  Time,
} from "@carbon/icons-react";

/**
 * Enterprise Carbon UI Shell Header Component
 * Strict Separation: Visual presentation owned by Carbon, state by MOVA
 */
export function Header({
  onToggleSidebar,
  isSidebarExpanded,
  currentTheme,
  onThemeChange,
  user,
  onLogout,
}) {
  const [timeStr, setTimeStr] = useState("");

  // Isolated Presentation Clock (Asia/Jakarta WIB) - Clock failure never affects app
  useEffect(() => {
    function updateClock() {
      try {
        const now = new Date();
        const formatted = now.toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        setTimeStr(`${formatted} WIB`);
      } catch (e) {
        setTimeStr("WIB");
      }
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDark = currentTheme === "g100" || currentTheme === "dark" || currentTheme === "g90";

  return (
    <CarbonHeader aria-label="MOVA Operational Control System" className="cds-ui-shell-header">
      {/* Sidebar Toggle & Brand Name */}
      <HeaderMenuButton
        aria-label={isSidebarExpanded ? "Tutup Menu Navigasi" : "Buka Menu Navigasi"}
        isActive={isSidebarExpanded}
        onClick={onToggleSidebar}
      />
      <HeaderName href="/dashboard" prefix="MOVA">
        [Enterprise Control Room]
      </HeaderName>

      {/* Global Actions Bar: Live Clock, Theme Switcher, User Role, Logout */}
      <HeaderGlobalBar>
        {/* Live Operational Clock */}
        {timeStr && (
          <div className="hidden sm:flex items-center gap-[6px] px-[12px] text-[12px] text-[var(--cds-text-secondary)] font-mono border-r border-[var(--cds-border-subtle)]">
            <Time size={16} />
            <span>{timeStr}</span>
          </div>
        )}

        {/* Theme Toggle (Dark g100 / Light White) */}
        <HeaderGlobalAction
          aria-label={`Beralih ke tema ${isDark ? "Light (White)" : "Dark (Gray 100)"}`}
          tooltipAlignment="end"
          onClick={() => onThemeChange && onThemeChange(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </HeaderGlobalAction>

        {/* User Identity Link to Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-[8px] px-[12px] h-full hover:bg-[var(--cds-layer-hover-01)] text-[var(--cds-text-primary)] transition-colors select-none"
          title="Buka Pengaturan Profil Pengguna"
        >
          <UserAvatar size={20} className="text-[var(--cds-icon-primary)]" />
          <div className="text-left hidden lg:block">
            <div className="text-[12px] font-medium leading-tight text-[var(--cds-text-primary)]">
              {user?.name || user?.full_name || "Petugas MOVA"}
            </div>
            <div className="text-[10px] text-[var(--cds-text-secondary)] leading-tight uppercase font-mono">
              {user?.role || "GUEST"}
            </div>
          </div>
          <Tag type={user?.role === "SUPERADMIN" ? "purple" : "blue"} size="sm" className="hidden sm:inline-flex">
            {user?.role || "GUEST"}
          </Tag>
        </Link>

        {/* Logout Action */}
        {onLogout && (
          <HeaderGlobalAction
            aria-label="Keluar dari Sesi (Logout)"
            tooltipAlignment="end"
            onClick={onLogout}
          >
            <Logout size={20} className="text-[var(--cds-support-error)]" />
          </HeaderGlobalAction>
        )}
      </HeaderGlobalBar>
    </CarbonHeader>
  );
}
