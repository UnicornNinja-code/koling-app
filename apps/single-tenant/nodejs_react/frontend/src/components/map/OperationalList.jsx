import React, { useState } from "react";
import {
  Search,
  Navigation,
  MapPin,
  Bike,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge.jsx";

/**
 * Floating Operational Control List
 * v3.0 Antimetal aesthetics, high-density telemetry, collapsible overlay
 */
export function OperationalList({
  riders = [],
  zones = [],
  armadas = [],
  activeTab = "riders",
  onTabChange,
  selectedItemId,
  onSelectItem,
  isCollapsed = false,
  onToggleCollapse = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Tab Definitions
  const tabs = [
    { id: "riders", label: "Riders", count: riders.length, icon: Navigation },
    { id: "zones", label: "Zones", count: zones.length, icon: MapPin },
    { id: "fleet", label: "Fleet", count: armadas.length, icon: Bike },
  ];

  // Filter logic
  const filteredRiders = riders.filter((r) => {
    const matchQuery =
      (r.name || r.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.zone_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === "ALL") return matchQuery;
    return matchQuery && (r.status || "WAITING") === statusFilter;
  });

  const filteredZones = zones.filter((z) =>
    (z.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArmadas = armadas.filter((a) =>
    (a.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onToggleCollapse}
        title="Buka Operational Stream"
        className="w-10 h-10 rounded-[10px] bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#263244] shadow-lg flex items-center justify-center text-[#111111] dark:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B] transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="w-full sm:w-[330px] max-h-[calc(100vh-80px)] flex flex-col rounded-[12px] bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#263244] shadow-xl overflow-hidden select-none transition-colors">
      {/* 1. Header & Collapse Control */}
      <div className="p-3 border-b border-[#E5E5E5] dark:border-[#263244] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-heading font-bold text-[#111111] dark:text-[#FAFAFA] uppercase tracking-wider">
              Operational Stream
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/60 px-1.5 py-0.2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              Live
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            title="Sembunyikan Panel"
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[#737373] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-[#F5F5F5] dark:bg-[#0B0F17] p-1 rounded-[8px] border border-[#E5E5E5] dark:border-[#263244]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center justify-center gap-1 h-6.5 rounded-[6px] text-[11px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-[#171717] text-[#111111] dark:text-[#FAFAFA] shadow-2xs font-semibold"
                    : "text-[#737373] hover:text-[#111111] dark:hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
                <span className="text-[9px] text-[#A3A3A3] font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Compact Search & Status Filter */}
      <div className="p-2.5 border-b border-[#E5E5E5] dark:border-[#263244] bg-[#FAFAFA] dark:bg-[#0B0F17] space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder={`Cari ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7.5 pl-8 pr-3 text-[11px] bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[#111111] dark:text-[#FAFAFA] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        {/* Rider Status Filter Pills */}
        {activeTab === "riders" && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {["ALL", "OPERATING", "WAITING", "DEVIATED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 text-[9px] font-semibold rounded-[4px] transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#2563EB] text-white font-bold"
                    : "bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] text-[#737373] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Dense Scrollable Item List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-[#263244] bg-white dark:bg-[#131822]">
        {activeTab === "riders" && (
          <>
            {filteredRiders.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                Tidak ada rider aktif
              </div>
            ) : (
              filteredRiders.map((rider, idx) => {
                const isSelected = selectedItemId === rider.id;
                const isOperating = rider.status === "OPERATING";
                const isDeviated = rider.zone_compliance === "DEVIATED" || rider.road_alert;
                const riderDisplayName =
                  rider.name || rider.full_name || rider.username || `Rider #${rider.id || idx + 1}`;

                return (
                  <div
                    key={rider.id || idx}
                    onClick={() => onSelectItem(rider, "rider")}
                    className={`p-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-[#2563EB]"
                        : "hover:bg-[#FAFAFA] dark:hover:bg-[#1E293B]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isDeviated
                                ? "bg-rose-500"
                                : isOperating
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <h4 className="text-xs font-semibold text-[#111111] dark:text-[#FAFAFA] truncate">
                            {riderDisplayName}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-1 truncate">
                          <span className="font-medium text-[#404040] dark:text-[#D4D4D4]">
                            {rider.zone_name || "Tanpa Zona"}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[#A3A3A3]">
                            {rider.armada_code || "Tanpa Gerobak"}
                          </span>
                        </div>
                      </div>

                      {/* Compliance Badge */}
                      <div className="flex flex-col items-end shrink-0 gap-0.5">
                        <StatusBadge
                          variant={isDeviated ? "danger" : "success"}
                          size="sm"
                          shape="pill"
                        >
                          {isDeviated ? "DEVIATED" : "COMPLIANT"}
                        </StatusBadge>
                        <span className="text-[9px] text-[#A3A3A3]">
                          {rider.last_ping_ago || "Live"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === "zones" && (
          <>
            {filteredZones.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                Tidak ada zona ditemukan
              </div>
            ) : (
              filteredZones.map((zone, idx) => {
                const isSelected = selectedItemId === zone.id;

                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectItem(zone, "zone")}
                    className={`p-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-[#2563EB]"
                        : "hover:bg-[#FAFAFA] dark:hover:bg-[#1E293B]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <h4 className="text-xs font-semibold text-[#111111] dark:text-[#FAFAFA] truncate">
                            {zone.name}
                          </h4>
                        </div>
                        <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                          Kapasitas: {zone.assigned_count || 0} / {zone.max_capacity || 4} Riders
                        </div>
                      </div>

                      {/* DSS TOPSIS Rank Badge */}
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-[4px] text-[10px] font-bold text-[#2563EB] dark:text-[#60A5FA]">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>#{zone.topsis_rank || idx + 1}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === "fleet" && (
          <>
            {filteredArmadas.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                Tidak ada armada ditemukan
              </div>
            ) : (
              filteredArmadas.map((armada) => {
                const isSelected = selectedItemId === armada.id;

                return (
                  <div
                    key={armada.id}
                    onClick={() => onSelectItem(armada, "armada")}
                    className={`p-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-[#2563EB]"
                        : "hover:bg-[#FAFAFA] dark:hover:bg-[#1E293B]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-[#111111] dark:text-[#FAFAFA] shrink-0" />
                          <h4 className="text-xs font-mono font-bold text-[#111111] dark:text-[#FAFAFA] truncate">
                            {armada.code}
                          </h4>
                        </div>
                        <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                          {armada.type || "MOTOR_LISTRIK"}
                        </div>
                      </div>

                      <StatusBadge
                        variant={armada.status === "ACTIVE" ? "success" : "warning"}
                        size="sm"
                      >
                        {armada.status || "AVAILABLE"}
                      </StatusBadge>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OperationalList;
