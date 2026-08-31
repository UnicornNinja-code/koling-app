import React from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { cn } from "../../lib/utils.js";

export function AppLayout({ children, title, subtitle, className = "" }) {
  return (
    <div className="flex min-h-screen bg-[#F4F4F6] text-slate-900 font-sans antialiased selection:bg-[#FF634A]/20 selection:text-[#FF634A]">
      {/* Persistent Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Sticky Topbar */}
        <Topbar title={title} subtitle={subtitle} />

        {/* Page Body Container */}
        <main className={cn("p-3.5 sm:p-4 md:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto", className)}>
          {children}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
