import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { Sidebar } from "../../components/layout/Sidebar.jsx";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { LeafletMapCanvas } from "../../components/map/LeafletMapCanvas.jsx";
import { MapFloatingToolbar } from "../../components/map/MapFloatingToolbar.jsx";
import { MapLegendPanel } from "../../components/map/MapLegendPanel.jsx";
import { MapLayersPanel } from "../../components/map/MapLayersPanel.jsx";
import { OperationalDetailPanel } from "../../components/map/OperationalDetailPanel.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";

// Single-Tenant Services SSOT
import { distributionService } from "../../services/distributionService.js";
import { zoneService } from "../../services/zoneService.js";
import { lbsService } from "../../services/lbsService.js";
import { armadaService } from "../../services/armadaService.js";
import { roadService } from "../../services/roadService.js";
import { dssService } from "../../services/dssService.js";
import { socketManager } from "../../sockets/socketManager.js";
import { SOCKET_EVENTS } from "../../sockets/socketEvents.js";
import { queryKeys } from "../../lib/queryKeys.js";

import {
  Users,
  Search,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Navigation,
  Bike,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";

/**
 * Rider Monitoring & Operational Distribution Workspace
 * Enterprise split-screen view: Left Dispatch List (340px) + Right GIS Spatial Canvas
 */
export function DistributionPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mapRef = useRef(null);

  // Filter & Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRider, setSelectedRider] = useState(null);
  const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [layers, setLayers] = useState({
    zones: true,
    riders: true,
    fleet: true,
    dss: true,
    protocolRoads: true,
    weather: false,
    pois: false,
  });

  // 1. Fetch Distribution Overview SSOT
  const { data: overviewRes, isLoading: isOverviewLoading } = useQuery({
    queryKey: queryKeys.distribution.overview(),
    queryFn: distributionService.getOverview,
  });
  const overview = overviewRes?.data || overviewRes || {};
  const waitingRiders = overview.waiting_riders || [];
  const assignedRiders = overview.assigned_riders || [];

  // 2. Fetch Live Rider Positions & Telemetry (LBS)
  const { data: liveRidersRes } = useQuery({
    queryKey: ["lbs", "live-riders"],
    queryFn: async () => {
      try {
        const res = await lbsService.getLiveRiders();
        return res?.riders || res?.data || [];
      } catch (err) {
        return [];
      }
    },
    refetchInterval: 10000,
  });
  const liveRiders = liveRidersRes || [];

  // 3. Fetch Operational Zones
  const { data: zonesRes } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneService.getZones,
    staleTime: 60000,
  });
  const zones = zonesRes?.zones || zonesRes?.data || [];

  // 4. Fetch Armadas
  const { data: armadasRes } = useQuery({
    queryKey: ["armadas"],
    queryFn: armadaService.getAll,
    staleTime: 60000,
  });
  const armadas = armadasRes?.armadas || armadasRes?.data || [];

  // 5. Fetch Protocol Roads
  const { data: protocolRoadsRes } = useQuery({
    queryKey: ["roads", "protocol"],
    queryFn: roadService.getProtocolRoads,
    staleTime: 300000,
  });
  const protocolRoads = protocolRoadsRes?.data || protocolRoadsRes;

  // 6. Fetch DSS TOPSIS Zone Recommendations SSOT
  const { data: dssRecsRes } = useQuery({
    queryKey: ["dss", "recommendations"],
    queryFn: dssService.getTopsisRecommendations,
    staleTime: 60000,
  });
  const dssRecommendations = dssRecsRes?.data?.recommendations || dssRecsRes?.recommendations || [];

  // Merge DSS Recommendations into zones for ranking badges
  const enhancedZones = (zones || []).map((z, idx) => {
    const dssMatch = dssRecommendations.find((d) => d.zone_id === z.id || d.id === z.id);
    return {
      ...z,
      topsis_rank: dssMatch?.rank ?? dssMatch?.topsis_rank ?? z.topsis_rank ?? idx + 1,
      preference_score: dssMatch?.preference_score ?? dssMatch?.score ?? z.preference_score,
    };
  });

  // Combine waiting and assigned riders into unified monitoring pool
  const allRidersPool = useMemo(() => {
    const pool = [];

    // Add Assigned / Operating Riders
    assignedRiders.forEach((ar) => {
      const liveMatch = liveRiders.find((lr) => lr.id === ar.rider_id || lr.id === ar.id);
      pool.push({
        id: ar.rider_id || ar.id,
        name: ar.rider_name || ar.name || "Rider",
        username: ar.username,
        status: liveMatch?.status || ar.status || "OPERATING",
        zone_id: ar.zone_id,
        zone_name: ar.zone_name || "Assigned Zone",
        armada_code: ar.armada_code || liveMatch?.armada_code || "Cart #01",
        zone_compliance: liveMatch?.zone_compliance || "COMPLIANT",
        road_alert: liveMatch?.road_alert || false,
        latitude: liveMatch?.latitude || ar.latitude,
        longitude: liveMatch?.longitude || ar.longitude,
        last_ping: liveMatch?.recorded_at ? new Date(liveMatch.recorded_at).toLocaleTimeString("id-ID") : "Live",
      });
    });

    // Add Waiting Riders
    waitingRiders.forEach((wr) => {
      if (!pool.some((p) => p.id === wr.id)) {
        pool.push({
          id: wr.id,
          name: wr.name || wr.rider_name || wr.username || "Rider",
          username: wr.username,
          status: "WAITING",
          zone_id: null,
          zone_name: "Unassigned",
          armada_code: "None",
          zone_compliance: "OUTSIDE_ZONE",
          road_alert: false,
          latitude: wr.latitude,
          longitude: wr.longitude,
          last_ping: wr.confirmed_at ? new Date(wr.confirmed_at).toLocaleTimeString("id-ID") : "Pending",
        });
      }
    });

    return pool;
  }, [assignedRiders, waitingRiders, liveRiders]);

  // Filtered Riders List
  const filteredRiders = allRidersPool.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.zone_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.armada_code.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  // Real-time Event Listener (Socket.io)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = socketManager.connect(token);

    if (socket) {
      setIsLiveConnected(true);

      socketManager.on(SOCKET_EVENTS.SUPERVISOR_RIDER_MOVED, () => {
        queryClient.invalidateQueries({ queryKey: ["lbs", "live-riders"] });
      });

      socketManager.on(SOCKET_EVENTS.RIDER_CHECKED_IN, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.distribution.overview() });
        queryClient.invalidateQueries({ queryKey: ["lbs", "live-riders"] });
      });

      socketManager.on(SOCKET_EVENTS.GEOFENCE_BREACH, () => {
        queryClient.invalidateQueries({ queryKey: ["lbs", "live-riders"] });
      });
    }
  }, [queryClient]);

  // Mutations for Auto & Manual Distribution
  const autoDistributeMutation = useMutation({
    mutationFn: distributionService.autoDistribute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.distribution.overview() });
      alert(`[Auto-Distribution Selesai] ${data?.msg || "Plotting rider berbasis DSS berhasil dilakukan."}`);
    },
    onError: (err) => {
      alert(`Gagal auto distribute: ${err.response?.data?.msg || err.message}`);
    },
  });

  const handleSelectRider = (rider) => {
    setSelectedRider(rider);
    if (mapRef.current && rider.latitude && rider.longitude) {
      const lat = Number(rider.latitude);
      const lng = Number(rider.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0) {
        mapRef.current.flyTo([lat, lng], 15, { animate: true, duration: 0.8 });
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA] font-sans antialiased select-none">
      {/* 1. App Shell Dark Rail (60px) */}
      <Sidebar />

      {/* 2. Main Viewport Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Topbar />

        {/* Workspace Body: Left Dispatch List (340px) + Right GIS Spatial Map */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Dispatch Column (340px) */}
          <div className="w-full md:w-[340px] bg-white border-r border-[#E5E5E5] flex flex-col h-full shrink-0 relative z-20 shadow-xs">
            {/* Header & Quick Dispatch CTA */}
            <div className="p-3 border-b border-[#E5E5E5] bg-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[13px] font-bold text-[#111111] uppercase tracking-wider">
                    Rider Monitoring
                  </h2>
                  <p className="text-[11px] text-[#737373]">Live shift & assignment status</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                    {assignedRiders.length} Active
                  </span>
                  <span className="text-[10px] font-semibold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                    {waitingRiders.length} Waiting
                  </span>
                </div>
              </div>

              {/* Auto Distribution Button */}
              {(user?.role === "SUPERADMIN" || user?.role === "SUPERVISOR") && (
                <button
                  type="button"
                  onClick={() => autoDistributeMutation.mutate()}
                  disabled={autoDistributeMutation.isPending || waitingRiders.length === 0}
                  className="w-full h-8 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#A3A3A3] text-white text-[12px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {autoDistributeMutation.isPending
                      ? "Menghitung DSS TOPSIS..."
                      : `Auto-Distribute (${waitingRiders.length} Waiting)`}
                  </span>
                </button>
              )}
            </div>

            {/* Filter Bar & Search */}
            <div className="p-2.5 border-b border-[#E5E5E5] bg-[#FAFAFA] space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                <input
                  type="text"
                  placeholder="Search rider, zone, or cart..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] placeholder-[#737373] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {["ALL", "OPERATING", "WAITING", "DEVIATED"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? "bg-[#2563EB] text-white"
                        : "bg-white border border-[#E5E5E5] text-[#525252] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Riders List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F0F0F0]">
              {filteredRiders.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-[#737373]">
                  No riders matching current filter
                </div>
              ) : (
                filteredRiders.map((rider) => {
                  const isSelected = selectedRider?.id === rider.id;
                  const isOperating = rider.status === "OPERATING";
                  const isDeviated = rider.zone_compliance === "DEVIATED" || rider.road_alert;

                  return (
                    <div
                      key={rider.id}
                      onClick={() => handleSelectRider(rider)}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#EFF6FF] border-l-2 border-[#2563EB]"
                          : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isDeviated
                                  ? "bg-[#DC2626]"
                                  : isOperating
                                  ? "bg-[#16A34A]"
                                  : "bg-[#D97706]"
                              }`}
                            />
                            <h4 className="text-[13px] font-semibold text-[#111111] truncate">
                              {rider.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#525252] mt-1 truncate">
                            <span className="font-medium text-[#111111]">
                              {rider.zone_name}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[#737373]">
                              {rider.armada_code}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                              isDeviated
                                ? "bg-[#FEE2E2] text-[#DC2626]"
                                : isOperating
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : "bg-[#FEF3C7] text-[#D97706]"
                            }`}
                          >
                            {rider.status}
                          </span>
                          <span className="text-[10px] text-[#737373]">
                            {rider.last_ping}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right GIS Spatial Map (Remaining Viewport) */}
          <div className="flex-1 relative h-full w-full overflow-hidden bg-[#E5E5E5] isolate z-10">
            <LeafletMapCanvas
              zones={enhancedZones}
              riders={allRidersPool}
              armadas={armadas}
              protocolRoads={protocolRoads}
              layers={layers}
              selectedItem={selectedRider}
              onSelectItem={(item) => setSelectedRider(item)}
              mapRef={mapRef}
            />

            {/* Floating Map Controls */}
            <MapFloatingToolbar
              activePanel={activeFloatingPanel}
              onTogglePanel={(p) => setActiveFloatingPanel((prev) => (prev === p ? null : p))}
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onResetView={() => mapRef.current?.setView([-7.4478, 112.7183], 13)}
              isLiveConnected={isLiveConnected}
            />

            {/* Layer Toggle Panel */}
            {activeFloatingPanel === "layers" && (
              <MapLayersPanel
                layers={layers}
                onToggleLayer={(id) => setLayers((prev) => ({ ...prev, [id]: !prev[id] }))}
                onClose={() => setActiveFloatingPanel(null)}
              />
            )}

            {/* Legend Panel */}
            {activeFloatingPanel === "legend" && (
              <MapLegendPanel onClose={() => setActiveFloatingPanel(null)} />
            )}

            {/* Operational Detail Panel */}
            {selectedRider && (
              <OperationalDetailPanel
                selectedItem={selectedRider}
                itemType="rider"
                onClose={() => setSelectedRider(null)}
                onCenterMap={() => handleSelectRider(selectedRider)}
                userRole={user?.role}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
