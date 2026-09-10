import React from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { ErrorBoundary } from "../common/ErrorBoundary.jsx";
import { cn } from "../../lib/utils.js";

/**
 * MOVA AppLayout — Design System v3.0 SSOT
 * Exact match with assets/img (dss.png, map ops.png, operational rider.png, dashboard.png):
 * - Left: 240px expanded dark Sidebar
 * - Right: Topbar (56px) + Scrollable / Full-bleed Main Workspace
 */
export function AppLayout({ children, title, breadcrumb, className = "", fullBleed = false }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F17] text-[#0F172A] dark:text-[#F8FAFC] font-sans antialiased selection:bg-[#EA580C]/20 selection:text-[#EA580C] transition-colors duration-150">
      {/* 1. Persistent 240px Expanded Dark Navigation Sidebar */}
      <Sidebar />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Sticky Control Room Topbar */}
        <Topbar title={title} breadcrumb={breadcrumb} />

        {/* Page Content Container */}
        <main
          className={cn(
            fullBleed
              ? "flex-1 w-full h-[calc(100vh-56px)] p-0 m-0 overflow-hidden relative"
              : "flex-1 w-full overflow-y-auto p-6 space-y-6",
            className
          )}
        >
          <ErrorBoundary mode="widget" title="Terjadi kendala pada komponen ini">
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
