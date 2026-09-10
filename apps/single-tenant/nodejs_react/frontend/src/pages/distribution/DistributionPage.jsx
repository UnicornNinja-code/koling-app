import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { LeafletMapCanvas } from "../../components/map/LeafletMapCanvas.jsx";
import { MapLegendPanel } from "../../components/map/MapLegendPanel.jsx";
import { MapRightLayerSidebar } from "../../components/map/MapRightLayerSidebar.jsx";
import { OperationalDetailPanel } from "../../components/map/OperationalDetailPanel.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ErrorBoundary } from "../../components/common/ErrorBoundary.jsx";

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
  Navigation,
  Bike,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

/**
 * Rider Monitoring & Operational Distribution Workspace
 * State Machine Focus: AVAILABLE -> QUEUED -> ASSIGNED -> CONFIRMED -> ACTIVE -> COMPLETED
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
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);

  const [layers, setLayers] = useState({
    zones: true,
    riders: true,
    fleet: true,
    dss: true,
    protocolRoads: true,
    weather: false,
    pois: false,
  });

  const handleToggleLayer = (layerId) => {
    setLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

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

  // 6. Fetch DSS Recommendations
  const { data: dssRecsRes } = useQuery({
    queryKey: ["dss", "recommendations"],
    queryFn: dssService.getTopsisRecommendations,
    staleTime: 60000,
  });
  const dssRecommendations = dssRecsRes?.data?.recommendations || dssRecsRes?.recommendations || [];

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

    // Assigned / Operating / Active Riders
    assignedRiders.forEach((ar) => {
      const liveMatch = liveRiders.find((lr) => lr.id === ar.rider_id || lr.id === ar.id);
      pool.push({
        id: ar.rider_id || ar.id,
        name: ar.rider_name || ar.name || "Rider",
        username: ar.username,
        status: liveMatch?.status || ar.status || "ACTIVE",
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

    // Waiting / Queued Riders
    waitingRiders.forEach((wr) => {
      if (!pool.some((p) => p.id === wr.id)) {
        pool.push({
          id: wr.id,
          name: wr.name || wr.rider_name || wr.username || "Rider",
          username: wr.username,
          status: wr.status || "QUEUED",
          zone_id: null,
          zone_name: "Belum Ada Zona",
          armada_code: wr.armada_code || "Tanpa Gerobak",
          zone_compliance: "STANDBY",
          road_alert: false,
          latitude: wr.latitude,
          longitude: wr.longitude,
          last_ping: wr.confirmed_at ? new Date(wr.confirmed_at).toLocaleTimeString("id-ID") : "Standby",
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
    return matchesSearch && (r.status === statusFilter || (statusFilter === "WAITING" && r.status === "QUEUED"));
  });

  // Socket.io Real-Time Stream
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    socketManager.connect(token);

    const handleMoved = () => {
      queryClient.invalidateQueries({ queryKey: ["lbs", "live-riders"] });
    };

    const handleCheckedIn = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.distribution.overview() });
      queryClient.invalidateQueries({ queryKey: ["lbs", "live-riders"] });
    };

    socketManager.on(SOCKET_EVENTS.SUPERVISOR_RIDER_MOVED, handleMoved);
    socketManager.on(SOCKET_EVENTS.RIDER_CHECKED_IN, handleCheckedIn);

    return () => {
      socketManager.off(SOCKET_EVENTS.SUPERVISOR_RIDER_MOVED, handleMoved);
      socketManager.off(SOCKET_EVENTS.RIDER_CHECKED_IN, handleCheckedIn);
    };
  }, [queryClient]);

  // Auto-Distribution Mutation with in-app banner feedback
  const autoDistributeMutation = useMutation({
    mutationFn: distributionService.autoDistribute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.distribution.overview() });
      setNotification({
        type: "success",
        text: `Plotting DSS Berhasil: ${data?.msg || "Penugasan zona otomatis selesai."}`,
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (err) => {
      setNotification({
        type: "error",
        text: `Gagal auto distribute: ${err.response?.data?.msg || err.message}`,
      });
      setTimeout(() => setNotification(null), 6000);
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

  // Helper for status badge rendering according to operational state machine
  const getStatusBadgeProps = (status) => {
    switch (status) {
      case "ACTIVE":
      case "OPERATING":
        return { variant: "success", label: "ACTIVE", withDot: true };
      case "ASSIGNED":
        return { variant: "primary", label: "ASSIGNED", withDot: false };
      case "CONFIRMED":
        return { variant: "info", label: "CONFIRMED", withDot: false };
      case "QUEUED":
      case "WAITING":
        return { variant: "warning", label: "QUEUED", withDot: false };
      case "COMPLETED":
        return { variant: "neutral", label: "COMPLETED", withDot: false };
      case "DEVIATED":
        return { variant: "danger", label: "DEVIATED", withDot: true };
      default:
        return { variant: "neutral", label: status || "AVAILABLE", withDot: false };
    }
  };

  return (
    <AppLayout
      fullBleed
      title="Rider Fleet Distribution"
      subtitle="Plotting armada dinamis berbasis DSS TOPSIS & monitoring kepatuhan shift"
    >
      <div className="relative w-full h-full overflow-hidden bg-[#FAFAFA] dark:bg-[#0B0F17] isolate select-none font-sans">
        {/* In-app Notification Banner */}
        {notification && (
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-[8px] border text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
              notification.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* 1. Primary GIS Canvas with Local Error Boundary */}
        <ErrorBoundary mode="widget" name="DistributionMapCanvas">
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
        </ErrorBoundary>

        {/* 2. Floating Collapsible Dispatch Panel (Top-Left) */}
        <div className="absolute top-3 left-3 z-30 pointer-events-auto">
          {isListCollapsed ? (
            <button
              type="button"
              onClick={() => setIsListCollapsed(false)}
              title="Buka Panel Distribusi"
              className="w-10 h-10 rounded-[10px] bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#263244] shadow-lg flex items-center justify-center text-[#111111] dark:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B] transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full sm:w-[340px] max-h-[calc(100vh-80px)] flex flex-col rounded-[12px] bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#263244] shadow-xl overflow-hidden select-none transition-colors">
              {/* Header & Quick Dispatch */}
              <div className="p-3 border-b border-[#E5E5E5] dark:border-[#263244] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-heading font-bold text-[#111111] dark:text-[#FAFAFA] uppercase tracking-wider">
                      Distribusi Rider
                    </h2>
                    <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3]">
                      Status shift & plotting armada
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.2 rounded-full">
                      {assignedRiders.length} Terplot
                    </span>
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.2 rounded-full">
                      {waitingRiders.length} Antre
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsListCollapsed(true)}
                      title="Sembunyikan Panel"
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[#737373] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B] transition-colors cursor-pointer ml-0.5"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Auto Distribution Button */}
                {(user?.role === "SUPERADMIN" || user?.role === "SUPERVISOR") && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    onClick={() => autoDistributeMutation.mutate()}
                    disabled={autoDistributeMutation.isPending || waitingRiders.length === 0}
                    isLoading={autoDistributeMutation.isPending}
                    leftIcon={Sparkles}
                  >
                    {autoDistributeMutation.isPending
                      ? "Menghitung DSS TOPSIS..."
                      : `Auto-Plotting DSS (${waitingRiders.length} Antre)`}
                  </Button>
                )}

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
                  <input
                    type="text"
                    placeholder="Cari rider, zona, gerobak..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-7.5 pl-8 pr-3 text-[11px] bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[#111111] dark:text-[#FAFAFA] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* State Machine Status Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {["ALL", "ACTIVE", "ASSIGNED", "QUEUED", "COMPLETED"].map((st) => (
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
              </div>

              {/* Scrollable Riders List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-[#263244] bg-white dark:bg-[#131822]">
                {filteredRiders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Tidak ada rider pada filter ini
                  </div>
                ) : (
                  filteredRiders.map((rider) => {
                    const isSelected = selectedRider?.id === rider.id;
                    const badgeProps = getStatusBadgeProps(rider.status);

                    return (
                      <div
                        key={rider.id}
                        onClick={() => handleSelectRider(rider)}
                        className={`p-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-[#2563EB]"
                            : "hover:bg-[#FAFAFA] dark:hover:bg-[#1E293B]/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-semibold text-[#111111] dark:text-[#FAFAFA] truncate">
                                {rider.name}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-1 truncate">
                              <span className="font-medium text-[#404040] dark:text-[#D4D4D4]">
                                {rider.zone_name}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-[#A3A3A3]">
                                {rider.armada_code}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 gap-1">
                            <StatusBadge
                              variant={badgeProps.variant}
                              size="sm"
                              withDot={badgeProps.withDot}
                            >
                              {badgeProps.label}
                            </StatusBadge>
                            <span className="text-[9px] text-[#A3A3A3]">
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
          )}
        </div>

        {/* 3. Docked Right Layer Sidebar */}
        <MapRightLayerSidebar
          layers={layers}
          onToggleLayer={handleToggleLayer}
          counts={{ zones: enhancedZones.length, riders: allRidersPool.length }}
        />

        {/* 4. Operational Detail Drawer */}
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
    </AppLayout>
  );
}

export default DistributionPage;
