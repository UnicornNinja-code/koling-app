import React from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { cn } from "../../lib/utils.js";

export function AppLayout({ children, title, subtitle, className = "" }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#ea580c]/20 selection:text-[#ea580c]">
      {/* Persistent Desktop Expandable Light Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Sticky Clean Light Topbar */}
        <Topbar title={title} subtitle={subtitle} />

        {/* Page Body Container — Full Viewport Operations Workspace */}
        <main className={cn("p-4 md:p-6 flex-1 w-full min-w-0", className)}>
          {children}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default AppLayout;
