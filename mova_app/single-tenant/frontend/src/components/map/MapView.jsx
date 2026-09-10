import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import {
  createRiderMarkerIcon,
  createPoiMarkerIcon,
  createCandidateLocationIcon,
  createArmadaMarkerIcon,
} from "./MapLayers.js";
import { useTheme } from "../../context/ThemeContext.jsx";

// Default coordinates centered on Kabupaten Sidoarjo
const DEFAULT_CENTER = [-7.4726, 112.6675];
const DEFAULT_ZOOM = 13;

export function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  zones = [],
  riders = [],
  pois = [],
  candidateSpots = [],
  armadas = [],
  selectedZoneId = null,
  onZoneClick = () => {},
  onRiderClick = () => {},
  onPoiClick = () => {},
  className = "",
  height = "600px",
  showControls = true,
  showLayerToggle = true,
  overlayContent = null,
  children,
}) {
  const { theme } = useTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupsRef = useRef({
    zones: null,
    riders: null,
    pois: null,
    candidateSpots: null,
    armadas: null,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layersVisible, setLayersVisible] = useState({
    zones: true,
    riders: true,
    pois: true,
    candidateSpots: true,
    armadas: true,
  });
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default marker icon issues in Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Clean Tile Layer based on theme without watermark
      const tileUrl =
        theme === "dark"
          ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      mapInstanceRef.current = map;
      mapInstanceRef.current._tileLayer = tileLayer;

      // Initialize layer groups
      layerGroupsRef.current.zones = L.layerGroup().addTo(map);
      layerGroupsRef.current.riders = L.layerGroup().addTo(map);
      layerGroupsRef.current.pois = L.layerGroup().addTo(map);
      layerGroupsRef.current.candidateSpots = L.layerGroup().addTo(map);
      layerGroupsRef.current.armadas = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on Theme Change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInstanceRef.current._tileLayer) return;

    const tileUrl =
      theme === "dark"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    mapInstanceRef.current._tileLayer.setUrl(tileUrl);
  }, [theme]);

  // Render Zones Polygon Layer with High-Fidelity Geofences
  useEffect(() => {
    const group = layerGroupsRef.current.zones;
    if (!group) return;
    group.clearLayers();

    if (!layersVisible.zones) return;

    const zoneColors = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#06B6D4"];

    zones.forEach((zone, idx) => {
      let coordinates = [];
      const color = zoneColors[idx % zoneColors.length];

      if (zone.coordinates) {
        coordinates = zone.coordinates;
      } else if (zone.geojson && zone.geojson.coordinates) {
        coordinates = zone.geojson.coordinates[0].map((coord) => [coord[1], coord[0]]);
      } else if (zone.boundary_coordinates) {
        coordinates = zone.boundary_coordinates;
      } else if (zone.lat && zone.lng) {
        // Draw circular geofence buffer if polygon coords not specified
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radius || 900,
          color: selectedZoneId === zone.id ? "#F97316" : color,
          fillColor: selectedZoneId === zone.id ? "#F97316" : color,
          fillOpacity: selectedZoneId === zone.id ? 0.35 : 0.18,
          weight: selectedZoneId === zone.id ? 3.5 : 2,
        });

        circle.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; padding: 2px;">
            <div style="font-weight: 800; font-size: 12px; color: #0F172A;">${zone.name || zone.zone_name}</div>
            <div style="font-size: 10px; color: #64748B; font-weight: 600;">Rank #${zone.rank || idx + 1} • Kapasitas: ${zone.riderCount || 0}/${zone.maxCapacity || 10} Rider</div>
          </div>
        `, { sticky: true });

        circle.on("click", () => onZoneClick(zone));
        group.addLayer(circle);
        return;
      }

      if (coordinates.length > 0) {
        const isSelected = selectedZoneId === zone.id;
        const polygon = L.polygon(coordinates, {
          color: isSelected ? "#F97316" : color,
          fillColor: isSelected ? "#F97316" : color,
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 3.5 : 2.2,
        });

        polygon.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; padding: 2px;">
            <div style="font-weight: 800; font-size: 12px; color: #0F172A;">${zone.name || zone.zone_name}</div>
            <div style="font-size: 10px; color: #64748B; font-weight: 600;">
              Rank #${zone.rank || idx + 1} • Skor: ${zone.score ? zone.score.toFixed(3) : "0.823"} • Rider: ${zone.riderCount || 0}/${zone.maxCapacity || 10}
            </div>
          </div>
        `, { sticky: true });

        polygon.on("mouseover", () => {
          polygon.setStyle({ weight: 4, fillOpacity: 0.35 });
        });
        polygon.on("mouseout", () => {
          polygon.setStyle({ weight: isSelected ? 3.5 : 2.2, fillOpacity: isSelected ? 0.4 : 0.2 });
        });

        polygon.on("click", () => onZoneClick(zone));
        group.addLayer(polygon);
      }
    });
  }, [zones, selectedZoneId, layersVisible.zones]);

  // Render Riders Markers Layer
  useEffect(() => {
    const group = layerGroupsRef.current.riders;
    if (!group) return;
    group.clearLayers();

    if (!layersVisible.riders) return;

    riders.forEach((rider) => {
      const lat = rider.lat || rider.current_latitude;
      const lng = rider.lng || rider.current_longitude;

      if (lat && lng) {
        const marker = L.marker([lat, lng], {
          icon: createRiderMarkerIcon(rider),
        });

        // 1. Tooltip displayed ONLY on hover (Nama + Armada)
        marker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #0F172A; padding: 1px 2px;">
            ${rider.name || rider.full_name} <span style="color: #64748B; font-weight: 600;">• ${rider.armadaCode || "ARM"}</span>
          </div>
        `, {
          direction: "top",
          offset: [0, -42],
          opacity: 0.95,
        });

        const avatarUrl = rider.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rider.name || "Rider")}&background=0F172A&color=fff&bold=true`;
        const isOnline = rider.status === "AKTIF" || rider.status === "ON_DUTY" || rider.status === "ON_TIME" || rider.status === "AVAILABLE";
        const isDeviation = rider.status === "DEVIATION" || rider.status === "DANGER" || rider.status === "OFFLINE";
        const statusColor = isDeviation ? "#EF4444" : isOnline ? "#10B981" : "#F59E0B";

        // 2. Full Popup displayed on click
        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; min-width: 200px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <img src="${avatarUrl}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid ${statusColor};" onerror="this.src='https://ui-avatars.com/api/?name=Rider&background=0F172A&color=fff';" />
              <div>
                <div style="font-weight: 800; font-size: 13px; color: #0F172A;">${rider.name || rider.full_name}</div>
                <div style="font-size: 11px; color: #64748B; font-weight: 600;">${rider.armadaCode || "ARM"} • ${rider.zoneName || "Sidoarjo"}</div>
              </div>
            </div>
            <div style="padding-top: 6px; border-top: 1px solid #E2E8F0; font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748B;">Status Presensi:</span>
              <span style="font-weight: 700; color: ${statusColor}; font-size: 10px; padding: 2px 6px; background: #F1F5F9; border-radius: 4px;">${rider.status || "AKTIF"}</span>
            </div>
            <div style="padding-top: 4px; font-size: 11px; display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Penjualan Hari Ini:</span>
              <span style="font-weight: 800; color: #0F172A;">${rider.salesToday || 0} Cup (${rider.revenue || "Rp 0"})</span>
            </div>
            <div style="padding-top: 4px; font-size: 10px; color: #94A3B8; display: flex; justify-content: space-between;">
              <span>Baterai: ${rider.battery || 80}%</span>
              <span>Speed: ${rider.speed || 0} km/j</span>
            </div>
          </div>
        `);

        marker.on("click", () => onRiderClick(rider));
        group.addLayer(marker);
      }
    });
  }, [riders, layersVisible.riders]);

  // Render POIs Markers Layer
  useEffect(() => {
    const group = layerGroupsRef.current.pois;
    if (!group) return;
    group.clearLayers();

    if (!layersVisible.pois) return;

    pois.forEach((poi) => {
      const lat = poi.lat || poi.latitude;
      const lng = poi.lng || poi.longitude;

      if (lat && lng) {
        const marker = L.marker([lat, lng], {
          icon: createPoiMarkerIcon(poi),
        });

        marker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700;">
            ${poi.name} <span style="font-size: 10px; opacity: 0.8;">(${poi.category || "POI"})</span>
          </div>
        `);

        marker.on("click", () => onPoiClick(poi));
        group.addLayer(marker);
      }
    });
  }, [pois, layersVisible.pois]);

  // Render Candidate Spots Layer
  useEffect(() => {
    const group = layerGroupsRef.current.candidateSpots;
    if (!group) return;
    group.clearLayers();

    if (!layersVisible.candidateSpots) return;

    candidateSpots.forEach((spot) => {
      const lat = spot.lat || spot.latitude;
      const lng = spot.lng || spot.longitude;

      if (lat && lng) {
        const marker = L.marker([lat, lng], {
          icon: createCandidateLocationIcon(spot),
        });

        marker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700;">
            ★ ${spot.name || "Titik Rekomendasi"} (Skor: ${spot.score || spot.ci_score || 0.85})
          </div>
        `);

        group.addLayer(marker);
      }
    });
  }, [candidateSpots, layersVisible.candidateSpots]);

  // Zoom Helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  };

  const toggleLayer = (layerKey) => {
    setLayersVisible((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div
      className={`relative rounded-[12px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : ""
      } ${className}`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Map DOM Target */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Weather / Custom Overlay Top-Right */}
      {(overlayContent || children) && (
        <div className="absolute top-4 right-4 z-[400] font-['Inter'] pointer-events-auto">
          {overlayContent || children}
        </div>
      )}

      {/* Floating Control Overlay Top-Left */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 font-['Inter']">
          {/* Zoom Buttons */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[10px] border border-slate-200/80 dark:border-slate-800/80 shadow-lg p-1 flex flex-col gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Perbesar"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Perkecil"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-0.5" />
            <button
              type="button"
              onClick={handleResetCenter}
              title="Pusatkan Peta Sidoarjo"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Layer Filter Toggler */}
          {showLayerToggle && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                title="Filter Layer"
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[10px] border border-slate-200/80 dark:border-slate-800/80 shadow-lg p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>

              {/* Layer Selection Dropdown */}
              {isLayerMenuOpen && (
                <div className="absolute left-0 top-11 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[12px] border border-slate-200 dark:border-slate-800 shadow-2xl p-3 space-y-2 text-xs z-[500]">
                  <div className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>Visibilitas Layer</span>
                    <span className="text-[10px] text-slate-400 font-mono">MapOps</span>
                  </div>

                  <label className="flex items-center justify-between cursor-pointer p-1 rounded-[6px] hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Poligon Zona Operasi
                    </span>
                    <input
                      type="checkbox"
                      checked={layersVisible.zones}
                      onChange={() => toggleLayer("zones")}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1 rounded-[6px] hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      GPS Rider Lapangan
                    </span>
                    <input
                      type="checkbox"
                      checked={layersVisible.riders}
                      onChange={() => toggleLayer("riders")}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1 rounded-[6px] hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      POI Potensi Pasar
                    </span>
                    <input
                      type="checkbox"
                      checked={layersVisible.pois}
                      onChange={() => toggleLayer("pois")}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1 rounded-[6px] hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      Titik Rekomendasi DSS
                    </span>
                    <input
                      type="checkbox"
                      checked={layersVisible.candidateSpots}
                      onChange={() => toggleLayer("candidateSpots")}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Map Legend & Quick Filter Overlay at Bottom-Left (Glassmorphism & Clickable) */}
      <div className="absolute bottom-4 left-4 z-[400] font-['Inter'] select-none">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-800/80 p-2 text-xs shadow-xl flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sidoarjo Center</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />

          {/* Quick Clickable Layer Toggles */}
          <button
            type="button"
            onClick={() => toggleLayer("zones")}
            title="Klik untuk menyembunyikan / menampilkan Zona"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer border ${
              layersVisible.zones
                ? "bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-blue-500/30 shadow-2xs"
                : "bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60 line-through"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layersVisible.zones ? "bg-blue-500" : "bg-slate-400"}`} />
            <span>Zona</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer("riders")}
            title="Klik untuk menyembunyikan / menampilkan Rider"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer border ${
              layersVisible.riders
                ? "bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-2xs"
                : "bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60 line-through"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layersVisible.riders ? "bg-emerald-500" : "bg-slate-400"}`} />
            <span>Rider</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer("candidateSpots")}
            title="Klik untuk menyembunyikan / menampilkan Spot DSS"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer border ${
              layersVisible.candidateSpots
                ? "bg-orange-500/15 dark:bg-orange-500/25 text-orange-700 dark:text-orange-300 border-orange-500/30 shadow-2xs"
                : "bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60 line-through"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layersVisible.candidateSpots ? "bg-orange-500" : "bg-slate-400"}`} />
            <span>Spot DSS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapView;
