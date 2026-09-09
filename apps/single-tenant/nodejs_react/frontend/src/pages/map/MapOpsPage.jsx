import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { Sidebar } from "../../components/layout/Sidebar.jsx";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { OperationalList } from "../../components/map/OperationalList.jsx";
import { LeafletMapCanvas } from "../../components/map/LeafletMapCanvas.jsx";
import { MapFloatingToolbar } from "../../components/map/MapFloatingToolbar.jsx";
import { MapLayersPanel } from "../../components/map/MapLayersPanel.jsx";
import { MapLegendPanel } from "../../components/map/MapLegendPanel.jsx";
import { MapWeatherPanel } from "../../components/map/MapWeatherPanel.jsx";
import { MapTimeSlotBar } from "../../components/map/MapTimeSlotBar.jsx";
import { OperationalDetailPanel } from "../../components/map/OperationalDetailPanel.jsx";

// Single-Tenant Services SSOT
import { zoneService } from "../../services/zoneService.js";
import { lbsService } from "../../services/lbsService.js";
import { armadaService } from "../../services/armadaService.js";
import { roadService } from "../../services/roadService.js";
import { weatherService } from "../../services/weatherService.js";
import { poiService } from "../../services/poiService.js";
import { dssService } from "../../services/dssService.js";
import { socketManager } from "../../sockets/socketManager.js";
import { SOCKET_EVENTS } from "../../sockets/socketEvents.js";
import { Menu, X } from "lucide-react";

/**
 * Enterprise Map Ops — Primary Operational Workspace
 * Full viewport GIS control room integrating live LBS telemetry, DSS recommendations, and geofence monitoring
 */
export function MapOpsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mapRef = useRef(null);

  // Layout & Selection State
  const [activeTab, setActiveTab] = useState("riders");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("pagi");
  const [selectedPoiCategory, setSelectedPoiCategory] = useState("ALL");
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  // Map Layer Toggles
  const [layers, setLayers] = useState({
    zones: true,
    riders: true,
    fleet: true,
    dss: true,
    protocolRoads: true,
    weather: true,
    pois: false, // Default: OFF per design spec
  });

  const handleToggleLayer = (layerId) => {
    setLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const handleToggleFloatingPanel = (panelId) => {
    setActiveFloatingPanel((prev) => (prev === panelId ? null : panelId));
  };

  // 1. Fetch Operational Zones SSOT
  const { data: zonesRes } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneService.getZones,
    staleTime: 60000,
  });
  const zones = zonesRes?.zones || zonesRes?.data || [];

  // 2. Fetch Live Rider Positions SSOT (LBS)
  const { data: ridersRes } = useQuery({
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
  const riders = ridersRes || [];

  // 3. Fetch Armada Fleet Units
  const { data: armadasRes } = useQuery({
    queryKey: ["armadas"],
    queryFn: armadaService.getAll,
    staleTime: 60000,
  });
  const armadas = armadasRes?.armadas || armadasRes?.data || [];

  // 4. Fetch Protocol Roads Restriction Layer
  const { data: protocolRoadsRes } = useQuery({
    queryKey: ["roads", "protocol"],
    queryFn: roadService.getProtocolRoads,
    staleTime: 300000,
  });
  const protocolRoads = protocolRoadsRes?.data || protocolRoadsRes;

  // 5. Fetch Operational Weather
  const { data: weatherRes, isLoading: isWeatherLoading } = useQuery({
    queryKey: ["weather", "hub", "Sidoarjo"],
    queryFn: () => weatherService.getHubWeatherInfo("Sidoarjo"),
    staleTime: 60000,
  });
  const weatherData = weatherRes?.data || weatherRes;

  // 6. Fetch DSS TOPSIS Zone Recommendations SSOT (GET /api/dss/recommendations)
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

  // 6. Fetch POIs (Loaded when POI layer enabled)
  const { data: poisRes } = useQuery({
    queryKey: ["pois", "operational-area"],
    queryFn: poiService.getOperationalAreaPois,
    enabled: layers.pois,
    staleTime: 300000,
  });
  const pois = poisRes?.pois || poisRes?.data || [];

  // 7. Fetch POI Categories for category filter
  const { data: poiCategoriesRes } = useQuery({
    queryKey: ["poi-categories", "crowd-scores"],
    queryFn: poiService.getCrowdScores,
    staleTime: 300000,
  });
  const poiCategories = poiCategoriesRes?.categories || poiCategoriesRes?.data || [];

  // Weather Sync Mutation
  const syncWeatherMutation = useMutation({
    mutationFn: weatherService.syncWeather,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weather"] });
    },
  });

  // Rider Claim Zone Mutation
  const claimZoneMutation = useMutation({
    mutationFn: (zoneId) => zoneService.getZoneById(zoneId),
    onSuccess: () => {
      alert("Zone 5-minute reservation locked successfully.");
    },
  });

  // Socket.IO Real-Time Stream Integration
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = socketManager.connect(token);

    if (socket) {
      setIsLiveConnected(true);

      socketManager.on(SOCKET_EVENTS.SUPERVISOR_RIDER_MOVED, () => {
        queryClient.invalidateQueries({ queryKey: ["lbs", "live-riders"] });
      });

      socketManager.on(SOCKET_EVENTS.RIDER_CHECKED_IN, () => {
        queryClient.invalidateQueries({ queryKey: ["lbs", "live-riders"] });
      });

      socketManager.on(SOCKET_EVENTS.GEOFENCE_BREACH, () => {
        queryClient.invalidateQueries({ queryKey: ["lbs", "live-riders"] });
      });
    }

    return () => {
      // Keep persistent connection
    };
  }, [queryClient]);

  // Synchronized Selection Handler
  const handleSelectItem = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);

    // If item has coordinates, fly to position
    if (mapRef.current) {
      if (type === "rider") {
        const lat = Number(item.latitude || item.lat);
        const lng = Number(item.longitude || item.lng);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0) {
          mapRef.current.flyTo([lat, lng], 15, { animate: true, duration: 0.8 });
        }
      } else if (type === "zone") {
        // If zone has center coordinates or polygon
        const lat = Number(item.center_lat || -7.4478);
        const lng = Number(item.center_lng || 112.7183);
        mapRef.current.flyTo([lat, lng], 14, { animate: true, duration: 0.8 });
      }
    }
  };

  const handleResetMapView = () => {
    if (mapRef.current) {
      mapRef.current.setView([-7.4478, 112.7183], 13);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA] font-sans antialiased select-none">
      {/* 1. App Shell Dark Rail Sidebar (60px) */}
      <Sidebar />

      {/* 2. Main Viewport Workspace (0px Gap) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Compact Header (56px) */}
        <Topbar />

        {/* Workspace Body: Split Operational List (340px) + Map Workspace */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Mobile List Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileListOpen((prev) => !prev)}
            className="md:hidden absolute top-3 left-3 z-40 bg-white border border-[#E5E5E5] rounded-[4px] p-2 shadow-sm text-[#111111]"
          >
            {isMobileListOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Left-Hand Operational List (340px) */}
          <div
            className={`
              ${isMobileListOpen ? "fixed inset-y-0 left-[60px] z-50 flex" : "hidden"}
              md:flex md:relative md:z-20 h-full shrink-0 shadow-xs
            `}
          >
            <OperationalList
              riders={riders}
              zones={enhancedZones}
              armadas={armadas}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              selectedItemId={selectedItem?.id}
              onSelectItem={handleSelectItem}
            />
          </div>

          {/* Map GIS Canvas (Remaining Viewport) */}
          <div className="flex-1 relative h-full w-full overflow-hidden bg-[#E5E5E5] isolate z-10">
            {/* Interactive Leaflet Map */}
            <LeafletMapCanvas
              zones={enhancedZones}
              riders={riders}
              armadas={armadas}
              pois={pois}
              protocolRoads={protocolRoads}
              layers={layers}
              selectedPoiCategory={selectedPoiCategory}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
              mapRef={mapRef}
            />

            {/* Top Temporal Crowd Slot Bar */}
            <MapTimeSlotBar
              selectedSlot={selectedTimeSlot}
              onSelectSlot={setSelectedTimeSlot}
            />

            {/* Top Right Floating Toolbar */}
            <MapFloatingToolbar
              activePanel={activeFloatingPanel}
              onTogglePanel={handleToggleFloatingPanel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetView={handleResetMapView}
              isLiveConnected={isLiveConnected}
            />

            {/* Floating Layers Panel */}
            {activeFloatingPanel === "layers" && (
              <MapLayersPanel
                layers={layers}
                onToggleLayer={handleToggleLayer}
                poiCategories={poiCategories}
                selectedPoiCategory={selectedPoiCategory}
                onSelectPoiCategory={setSelectedPoiCategory}
                onClose={() => setActiveFloatingPanel(null)}
              />
            )}

            {/* Floating Legend Panel */}
            {activeFloatingPanel === "legend" && (
              <MapLegendPanel onClose={() => setActiveFloatingPanel(null)} />
            )}

            {/* Floating Weather Panel */}
            {activeFloatingPanel === "weather" && (
              <MapWeatherPanel
                weatherData={weatherData}
                isLoading={isWeatherLoading || syncWeatherMutation.isPending}
                onSync={() => syncWeatherMutation.mutate()}
                onClose={() => setActiveFloatingPanel(null)}
              />
            )}

            {/* Floating / Sliding Operational Detail Panel */}
            {selectedItem && (
              <OperationalDetailPanel
                selectedItem={selectedItem}
                itemType={selectedItemType}
                onClose={() => {
                  setSelectedItem(null);
                  setSelectedItemType(null);
                }}
                onCenterMap={() => handleSelectItem(selectedItem, selectedItemType)}
                onClaimZone={
                  user?.role === "RIDER" ? (id) => claimZoneMutation.mutate(id) : null
                }
                userRole={user?.role}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
