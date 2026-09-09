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
    <div className="w-full md:w-[340px] bg-white border-r border-[#E2E8F0] flex flex-col h-full shrink-0 select-none z-20">
      {/* 1. Header & Domain Tabs */}
      <div className="p-3 border-b border-[#E2E8F0] bg-white space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider">
            Operational Stream
          </h2>
          <span className="text-[11px] font-semibold text-[#EA580C] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-full">
            Live Feed
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-[#F1F5F9] p-1 rounded-[6px] border border-[#E2E8F0]">
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
                    ? "bg-white text-[#0F172A] shadow-xs font-semibold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] text-[#94A3B8] font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Compact Search & Status Filter */}
      <div className="p-2.5 border-b border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[6px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
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
                    ? "bg-[#EA580C] text-white font-bold"
                    : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Dense Scrollable Item List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0] bg-white">
        {activeTab === "riders" && (
          <>
            {filteredRiders.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-[#94A3B8]">
                No active riders found
              </div>
            ) : (
              filteredRiders.map((rider, idx) => {
                const isSelected = selectedItemId === rider.id;
                const isOperating = rider.status === "OPERATING";
                const isDeviated = rider.zone_compliance === "DEVIATED" || rider.road_alert;
                const riderDisplayName = rider.name || rider.full_name || rider.username || `Rider #${rider.id || idx + 1}`;

                return (
                  <div
                    key={rider.id || idx}
                    onClick={() => onSelectItem(rider, "rider")}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#FFF7ED] border-l-2 border-[#EA580C]"
                        : "hover:bg-[#F8FAFC]"
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
                          <h4 className="text-[13px] font-semibold text-[#0F172A] truncate">
                            {riderDisplayName}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-1 truncate">
                          <span className="font-medium text-[#334155]">
                            {rider.zone_name || "Zone Unassigned"}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[#94A3B8]">
                            {rider.armada_code || "No Cart"}
                          </span>
                        </div>
                      </div>

                      {/* Compliance Badge */}
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                            isDeviated
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          {isDeviated ? "DEVIATED" : "COMPLIANT"}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
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
              <div className="p-6 text-center text-[12px] text-[#94A3B8]">
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
                        ? "bg-[#FFF7ED] border-l-2 border-[#EA580C]"
                        : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                          <h4 className="text-[13px] font-semibold text-[#0F172A] truncate">
                            {zone.name}
                          </h4>
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          Capacity: {zone.assigned_count || 0} / {zone.max_capacity || 4} Riders
                        </div>
                      </div>

                      {/* DSS TOPSIS Rank Badge */}
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#FFF7ED] border border-[#FFEDD5] rounded-[4px] text-[10px] font-semibold text-[#EA580C]">
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
              <div className="p-6 text-center text-[12px] text-[#94A3B8]">
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
                        ? "bg-[#FFF7ED] border-l-2 border-[#EA580C]"
                        : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-[#0F172A] shrink-0" />
                          <h4 className="text-[13px] font-mono font-bold text-[#0F172A] truncate">
                            {armada.code}
                          </h4>
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {armada.type || "MOTOR_LISTRIK"}
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                          armada.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
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
