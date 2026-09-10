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

      // Tile Layer based on theme
      const tileUrl =
        theme === "dark"
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: "abcd",
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
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    mapInstanceRef.current._tileLayer.setUrl(tileUrl);
  }, [theme]);

  // Render Zones Polygon Layer
  useEffect(() => {
    const group = layerGroupsRef.current.zones;
    if (!group) return;
    group.clearLayers();

    if (!layersVisible.zones) return;

    zones.forEach((zone) => {
      let coordinates = [];

      if (zone.geojson && zone.geojson.coordinates) {
        // GeoJSON uses [lng, lat], Leaflet uses [lat, lng]
        coordinates = zone.geojson.coordinates[0].map((coord) => [coord[1], coord[0]]);
      } else if (zone.boundary_coordinates) {
        coordinates = zone.boundary_coordinates;
      } else if (zone.lat && zone.lng) {
        // Fallback: draw circular zone buffer
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radius || 1200,
          color: selectedZoneId === zone.id ? "#F97316" : "#2563EB",
          fillColor: selectedZoneId === zone.id ? "#F97316" : "#3B82F6",
          fillOpacity: selectedZoneId === zone.id ? 0.35 : 0.18,
          weight: selectedZoneId === zone.id ? 3 : 1.8,
          dashArray: zone.status === "WASPADA_HUJAN" ? "6, 6" : null,
        });

        circle.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; color: #0F172A;">
            <div>${zone.name || zone.zone_name}</div>
            <div style="font-size: 10px; font-weight: 500; color: #64748B;">Rider: ${zone.active_riders || 0} • DSS: ${zone.dss_score || "0.82"}</div>
          </div>
        `, { sticky: true, className: "mova-leaflet-tooltip" });

        circle.on("click", () => onZoneClick(zone));
        group.addLayer(circle);
        return;
      }

      if (coordinates.length > 0) {
        const isSelected = selectedZoneId === zone.id;
        const polygon = L.polygon(coordinates, {
          color: isSelected ? "#F97316" : "#2563EB",
          fillColor: isSelected ? "#F97316" : zone.dss_tier === "BEST" ? "#10B981" : "#3B82F6",
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 3 : 2,
        });

        polygon.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; color: #0F172A;">
            <div>${zone.name || zone.zone_name}</div>
            <div style="font-size: 10px; font-weight: 500; color: #64748B;">
              ${zone.code || "ZON"} • Score: ${zone.dss_score || "0.82"}
            </div>
          </div>
        `, { sticky: true });

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

        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; min-width: 180px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <img src="/assets/avatars/rider.svg" style="width: 32px; height: 32px; border-radius: 50%;" />
              <div>
                <div style="font-weight: 700; font-size: 13px; color: #0F172A;">${rider.name || rider.full_name}</div>
                <div style="font-size: 11px; color: #64748B;">${rider.phone || "0812-xxxx"}</div>
              </div>
            </div>
            <div style="padding-top: 6px; border-top: 1px solid #E2E8F0; font-size: 11px; display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Status:</span>
              <span style="font-weight: 700; color: #10B981;">${rider.status || "AKTIF"}</span>
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

      {/* Floating Control Overlay */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 font-['Inter']">
          {/* Zoom Buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-[8px] border border-slate-200 dark:border-slate-800 shadow-md p-1 flex flex-col gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Perbesar"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Perkecil"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-0.5" />
            <button
              type="button"
              onClick={handleResetCenter}
              title="Pusatkan Peta Sidoarjo"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className="bg-white dark:bg-slate-900 rounded-[8px] border border-slate-200 dark:border-slate-800 shadow-md p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
              >
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>

              {/* Layer Selection Dropdown */}
              {isLayerMenuOpen && (
                <div className="absolute right-0 top-10 w-52 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-lg p-3 space-y-2 text-xs">
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

      {/* Map Legend Overlay at Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[8px] border border-slate-200/80 dark:border-slate-800/80 px-3 py-2 text-[11px] font-['Inter'] shadow-md flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sidoarjo Center</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700" />
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Zona</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Rider</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Spot DSS</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;
