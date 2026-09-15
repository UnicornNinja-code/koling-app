import React, { useState } from "react";
import { Content } from "@carbon/react";
import { Header } from "./Header.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

/**
 * Enterprise Application Shell
 * Orchestrates Carbon Header & SideNav with application Auth and Theme State
 */
export function AppLayout({ children, user: customUser, onLogout: customLogout, fullWidth = false }) {
  const authContext = useAuth();
  const themeContext = useTheme();

  const user = customUser || authContext?.user;
  const onLogout = customLogout || authContext?.logout;

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const currentTheme = themeContext?.carbonTheme || (themeContext?.isDark ? "g100" : "white");

  const handleThemeChange = (newTheme) => {
    if (themeContext) {
      themeContext.setTheme(newTheme === "white" || newTheme === "light" ? "light" : "dark");
    }
  };

  return (
    <div className="h-screen w-full bg-[var(--cds-background)] text-[var(--cds-text-primary)] flex flex-col antialiased overflow-hidden">
      {/* Carbon Fixed Header */}
      <Header
        isSidebarExpanded={isSidebarExpanded}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        user={user}
        onLogout={onLogout}
      />

      {/* Main App Body with Carbon SideNav */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isExpanded={isSidebarExpanded} />

        {/* Carbon Content Viewport */}
        <Content className="flex-1 overflow-y-auto bg-[var(--cds-background)] p-[24px]">
          <div className={fullWidth ? "w-full space-y-[var(--cds-spacing-06)]" : "max-w-[1600px] mx-auto w-full space-y-[var(--cds-spacing-06)]"}>
            {children}
          </div>
        </Content>
      </div>
    </div>
  );
}

export default AppLayout;
