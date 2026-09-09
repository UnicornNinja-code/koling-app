import React, { useState } from "react";
import {
  Search,
  Navigation,
  MapPin,
  Bike,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";

/**
 * Left-Hand Operational Control List (320px - 360px)
 * Provides dense, compact, and synchronized navigation between lists and spatial map
 */
export function OperationalList({
  riders = [],
  zones = [],
  armadas = [],
  activeTab = "riders",
  onTabChange,
  selectedItemId,
  onSelectItem,
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

  return (
    <div className="w-full md:w-[340px] bg-[#121215] border-r border-[#24242A] flex flex-col h-full shrink-0 select-none z-20">
      {/* 1. Header & Domain Tabs */}
      <div className="p-3 border-b border-[#24242A] bg-[#121215] space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-white uppercase tracking-wider">
            Operational Stream
          </h2>
          <span className="text-[11px] font-semibold text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-full">
            Live Feed
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-[#18181B] p-1 rounded-[6px] border border-[#24242A]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center justify-center gap-1.5 h-7 rounded-[4px] text-[12px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#24242A] text-white shadow-xs font-semibold"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] text-[#71717A] font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Compact Search & Status Filter */}
      <div className="p-2.5 border-b border-[#24242A] bg-[#121215] space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-[12px] bg-[#18181B] border border-[#24242A] rounded-[6px] text-white placeholder-[#71717A] focus:outline-none focus:border-[#ea580c]"
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
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-[#ea580c] text-white font-bold"
                    : "bg-[#18181B] border border-[#24242A] text-[#A1A1AA] hover:bg-[#1F1F24] hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Dense Scrollable Item List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#24242A]">
        {activeTab === "riders" && (
          <>
            {filteredRiders.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-[#737373]">
                No active riders found
              </div>
            ) : (
              filteredRiders.map((rider) => {
                const isSelected = selectedItemId === rider.id;
                const isOperating = rider.status === "OPERATING";
                const isDeviated = rider.zone_compliance === "DEVIATED" || rider.road_alert;

                return (
                  <div
                    key={rider.id}
                    onClick={() => onSelectItem(rider, "rider")}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-orange-500/10 border-l-2 border-[#ea580c]"
                        : "hover:bg-[#18181B]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isDeviated
                                ? "bg-[#EF4444]"
                                : isOperating
                                ? "bg-[#10B981]"
                                : "bg-[#F59E0B]"
                            }`}
                          />
                          <h4 className="text-[13px] font-semibold text-white truncate">
                            {rider.name || rider.username || `Rider #${rider.id}`}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] mt-1 truncate">
                          <span className="font-medium text-white">
                            {rider.zone_name || "Zone Unassigned"}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[#71717A]">
                            {rider.armada_code || "No Cart"}
                          </span>
                        </div>
                      </div>

                      {/* Compliance Badge */}
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                            isDeviated
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {isDeviated ? "DEVIATED" : "COMPLIANT"}
                        </span>
                        <span className="text-[10px] text-[#71717A]">
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
              <div className="p-6 text-center text-[12px] text-[#71717A]">
                No operational zones found
              </div>
            ) : (
              filteredZones.map((zone, idx) => {
                const isSelected = selectedItemId === zone.id;

                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectItem(zone, "zone")}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-orange-500/10 border-l-2 border-[#ea580c]"
                        : "hover:bg-[#18181B]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                          <h4 className="text-[13px] font-semibold text-white truncate">
                            {zone.name}
                          </h4>
                        </div>
                        <div className="text-[11px] text-[#A1A1AA] mt-0.5">
                          Capacity: {zone.assigned_count || 0} / {zone.max_capacity || 4} Riders
                        </div>
                      </div>

                      {/* DSS TOPSIS Rank Badge */}
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/15 border border-orange-500/30 rounded-[4px] text-[10px] font-semibold text-orange-400">
                        <Sparkles className="w-3 h-3" />
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
              <div className="p-6 text-center text-[12px] text-[#71717A]">
                No armada units found
              </div>
            ) : (
              filteredArmadas.map((armada) => {
                const isSelected = selectedItemId === armada.id;

                return (
                  <div
                    key={armada.id}
                    onClick={() => onSelectItem(armada, "armada")}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-orange-500/10 border-l-2 border-[#ea580c]"
                        : "hover:bg-[#18181B]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-white shrink-0" />
                          <h4 className="text-[13px] font-mono font-bold text-white truncate">
                            {armada.code}
                          </h4>
                        </div>
                        <div className="text-[11px] text-[#71717A] mt-0.5">
                          {armada.type || "MOTOR_LISTRIK"}
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                          armada.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {armada.status || "AVAILABLE"}
                      </span>
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
