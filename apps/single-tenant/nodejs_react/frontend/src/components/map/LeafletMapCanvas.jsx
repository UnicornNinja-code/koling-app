import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getActiveBasemapProvider } from "../../lib/mapPreferences.js";
import { createGoogleMapsPoiIcon, getPoiCategoryTheme } from "../../lib/poiTheme.js";
import { useTheme } from "../../context/ThemeContext.jsx";

// Fix default Leaflet icon assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * Enterprise Leaflet GIS Spatial Canvas
 * Renders Zones, Live Rider Telemetry, Protocol Roads, and POIs
 */
export function LeafletMapCanvas({
  zones = [],
  riders = [],
  armadas = [],
  pois = [],
  protocolRoads = null,
  layers = {
    zones: true,
    riders: true,
    fleet: true,
    dss: true,
    protocolRoads: true,
    weather: true,
    pois: false,
  },
  selectedPoiCategory = "ALL",
  selectedTimeSlot = "pagi",
  selectedHour = null,
  weatherData = null,
  selectedItem = null,
  onSelectItem,
  mapRef,
}) {
  const { isDark } = useTheme();
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Layer groups refs
  const zonesLayerGroupRef = useRef(null);
  const ridersLayerGroupRef = useRef(null);
  const roadsLayerGroupRef = useRef(null);
  const poisLayerGroupRef = useRef(null);
  const weatherLayerGroupRef = useRef(null);
  const salesHeatmapLayerGroupRef = useRef(null);

  const getEffectiveProvider = () => {
    return getActiveBasemapProvider();
  };

  const createTileLayer = (provider) => {
    const options = {
      maxZoom: provider.maxZoom || 19,
      attribution: provider.attribution,
      crossOrigin: true,
      updateWhenIdle: false, // Stream tiles continuously while dragging for 60fps smooth pan
      updateWhenZooming: true, // Smooth tile scaling and loading during zoom animations
      keepBuffer: 8, // Cache 8 tiles offscreen in RAM so panning back has zero network delay
    };
    if (provider.subdomains) options.subdomains = provider.subdomains;
    if (provider.tileSize) options.tileSize = provider.tileSize;
    if (provider.zoomOffset !== undefined) options.zoomOffset = provider.zoomOffset;
    return L.tileLayer(provider.url, options);
  };

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    if (containerRef.current._leaflet_id) {
      containerRef.current._leaflet_id = null;
    }

    // Default view: Sidoarjo Operations Center with canvas rendering for high performance
    const map = L.map(containerRef.current, {
      center: [-7.4478, 112.7183],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    // Configurable Basemap Tile Provider with Dark Mode Awareness
    const initialProvider = getEffectiveProvider(isDark);
    tileLayerRef.current = createTileLayer(initialProvider).addTo(map);

    // Initialize Layer Groups
    zonesLayerGroupRef.current = L.layerGroup().addTo(map);
    ridersLayerGroupRef.current = L.layerGroup().addTo(map);
    roadsLayerGroupRef.current = L.layerGroup().addTo(map);
    poisLayerGroupRef.current = L.layerGroup().addTo(map);
    weatherLayerGroupRef.current = L.layerGroup().addTo(map);
    salesHeatmapLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    if (mapRef) mapRef.current = map;

    // Listen for tile provider changes from Settings
    const handlePrefChange = () => {
      if (!mapInstanceRef.current) return;
      const newProvider = getEffectiveProvider(isDark);
      if (tileLayerRef.current) {
        try {
          mapInstanceRef.current.removeLayer(tileLayerRef.current);
        } catch (e) {}
      }
      tileLayerRef.current = createTileLayer(newProvider).addTo(mapInstanceRef.current);
      if (tileLayerRef.current.bringToBack) tileLayerRef.current.bringToBack();
    };

    window.addEventListener("mova:map_preferences_changed", handlePrefChange);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      window.removeEventListener("mova:map_preferences_changed", handlePrefChange);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Basemap when Theme (Light/Dark) changes dynamically
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const provider = getEffectiveProvider(isDark);
    if (tileLayerRef.current) {
      try {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      } catch (e) {}
    }
    tileLayerRef.current = createTileLayer(provider).addTo(mapInstanceRef.current);
    if (tileLayerRef.current.bringToBack) {
      tileLayerRef.current.bringToBack();
    }
  }, [isDark]);

  // Update Zones Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !zonesLayerGroupRef.current) return;
    zonesLayerGroupRef.current.clearLayers();

    if (!layers.zones) return;

    zones.forEach((zone, idx) => {
      let geojson = zone.polygon || zone.geojson || zone.geometry;
      if (typeof geojson === "string") {
        try {
          geojson = JSON.parse(geojson);
        } catch (e) {
          return;
        }
      }

      if (!geojson) return;

      const isSelected = selectedItem?.id === zone.id;
      const isTopRank = (zone.topsis_rank || idx + 1) === 1;

      const polyLayer = L.geoJSON(geojson, {
        style: {
          color: isSelected ? "#2563EB" : isTopRank ? "#16A34A" : "#3B82F6",
          weight: isSelected ? 3 : 1.5,
          opacity: 0.9,
          fillColor: isSelected ? "#2563EB" : isTopRank ? "#16A34A" : "#3B82F6",
          fillOpacity: isSelected ? 0.35 : 0.15,
        },
      });

      // Tooltip label
      polyLayer.bindTooltip(
        `<div class="font-sans text-[11px] font-semibold text-[#111111]">
          <div>${zone.name}</div>
          <div class="text-[9px] text-[#737373]">DSS Rank #${zone.topsis_rank || idx + 1}</div>
        </div>`,
        { permanent: false, direction: "center", className: "mova-map-tooltip" }
      );

      polyLayer.on("click", () => {
        onSelectItem(zone, "zone");
      });

      zonesLayerGroupRef.current.addLayer(polyLayer);
    });
  }, [zones, layers.zones, selectedItem]);

  // Update Riders Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !ridersLayerGroupRef.current) return;
    ridersLayerGroupRef.current.clearLayers();

    if (!layers.riders) return;

    riders.forEach((rider) => {
      const lat = Number(rider.latitude || rider.lat);
      const lng = Number(rider.longitude || rider.lng);

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      const isSelected = selectedItem?.id === rider.id;
      const isOperating = rider.status === "OPERATING";
      const isDeviated = rider.zone_compliance === "DEVIATED" || rider.road_alert;

      const markerColor = isDeviated
        ? "#DC2626"
        : isOperating
        ? "#16A34A"
        : "#D97706";

      // Custom Rectangular Indicator Icon
      const customIcon = L.divIcon({
        className: "mova-rider-marker",
        html: `
          <div style="
            position: relative;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FFFFFF;
            border: 2px solid ${markerColor};
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            ${isSelected ? "transform: scale(1.2); ring: 2px solid #2563EB;" : ""}
          ">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${markerColor};"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.bindTooltip(
        `<div class="font-sans text-[11px] font-semibold text-[#111111]">
          <div>${rider.name || rider.username || "Rider"}</div>
          <div class="text-[9px] ${isDeviated ? "text-[#DC2626]" : "text-[#16A34A]"} font-medium">
            ${isDeviated ? "DEVIATED" : "COMPLIANT"} • ${rider.status || "STANDBY"}
          </div>
        </div>`,
        { direction: "top", offset: [0, -10] }
      );

      marker.on("click", () => {
        onSelectItem(rider, "rider");
      });

      ridersLayerGroupRef.current.addLayer(marker);
    });
  }, [riders, layers.riders, selectedItem]);

  // Update Protocol Roads Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !roadsLayerGroupRef.current) return;
    roadsLayerGroupRef.current.clearLayers();

    if (!layers.protocolRoads || !protocolRoads) return;

    try {
      const roadGeojson = L.geoJSON(protocolRoads, {
        style: {
          color: "#DC2626",
          weight: 3,
          dashArray: "6, 6",
          opacity: 0.85,
        },
      });

      roadGeojson.bindTooltip(
        `<div class="font-sans text-[10px] font-bold text-[#DC2626]">
          ⚠️ PROHIBITED PROTOCOL ROAD
        </div>`,
        { sticky: true }
      );

      roadsLayerGroupRef.current.addLayer(roadGeojson);
    } catch (e) {
      console.warn("Could not render protocol roads geojson:", e);
    }
  }, [protocolRoads, layers.protocolRoads]);

  // Update POIs Layer (Default: OFF)
  useEffect(() => {
    if (!mapInstanceRef.current || !poisLayerGroupRef.current) return;
    poisLayerGroupRef.current.clearLayers();

    if (!layers.pois || !pois || pois.length === 0) return;

    const filtered =
      selectedPoiCategory === "ALL"
        ? pois
        : pois.filter(
            (p) =>
              (p.category || p.category_name || "").toLowerCase() ===
              selectedPoiCategory.toLowerCase()
          );

    // Render Google Maps style DivIcons for POIs
    filtered.slice(0, 400).forEach((poi) => {
      const lat = Number(poi.latitude || poi.lat);
      const lng = Number(poi.longitude || poi.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      const isSelected = selectedItem?.id === poi.id;
      const customIcon = createGoogleMapsPoiIcon(poi, isSelected);
      const theme = getPoiCategoryTheme(poi.category || poi.category_name);

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.bindTooltip(
        `<div style="font-family: Inter, sans-serif; padding: 4px; min-width: 130px;">
          <div style="font-weight: 800; color: #111111; font-size: 11px; line-height: 1.2;">${poi.name}</div>
          <div style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: ${theme.color}; margin-top: 4px; background: ${theme.bgLight}; padding: 2px 7px; border-radius: 4px; border: 1px solid ${theme.borderColor || theme.color + '40'};">
            <i class="bx ${theme.boxicon}" style="font-size: 12px; line-height: 1;"></i>
            <span>${theme.label}</span>
          </div>
          ${theme.timePeak ? `<div style="font-size: 9px; color: #737373; margin-top: 3px; font-weight: 500;">Peak: ${theme.timePeak}</div>` : ''}
        </div>`,
        { direction: "top", offset: [0, -28], opacity: 0.98 }
      );

      marker.on("click", () => {
        if (onSelectItem) {
          onSelectItem({ ...poi, itemType: "POI" });
        }
      });

      poisLayerGroupRef.current.addLayer(marker);
    });
  }, [pois, layers.pois, selectedPoiCategory, selectedItem]);

  // Update Atmospheric Weather Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !weatherLayerGroupRef.current) return;
    weatherLayerGroupRef.current.clearLayers();

    if (!layers.weather || !zones || zones.length === 0) return;

    zones.forEach((zone) => {
      let centerLat = Number(zone.latitude || zone.lat);
      let centerLng = Number(zone.longitude || zone.lng);

      // If lat/lng not direct on zone, extract centroid from polygon
      if (isNaN(centerLat) || isNaN(centerLng) || centerLat === 0 || centerLng === 0) {
        let geojson = zone.polygon || zone.geojson || zone.geometry;
        if (typeof geojson === "string") {
          try {
            geojson = JSON.parse(geojson);
          } catch (e) {
            return;
          }
        }
        if (geojson) {
          try {
            const tempLayer = L.geoJSON(geojson);
            const center = tempLayer.getBounds().getCenter();
            centerLat = center.lat;
            centerLng = center.lng;
          } catch (e) {
            return;
          }
        }
      }

      if (isNaN(centerLat) || isNaN(centerLng)) return;

      const current = weatherData?.current || weatherData || {};
      const temp = current?.temperature_c ?? 31.0;
      const rainProb = current?.max_rain_probability_percent ?? current?.rain_probability ?? 10;
      const isRainRisk = rainProb >= 30;
      const isCaution = rainProb >= 15 && rainProb < 30;

      const weatherIcon = isRainRisk ? "bx-cloud-rain" : isCaution ? "bx-cloud" : "bx-sun";
      const badgeBorder = isRainRisk ? "#3B82F6" : isCaution ? "#F59E0B" : "#10B981";
      const statusColor = isRainRisk ? "#2563EB" : isCaution ? "#D97706" : "#16A34A";

      const weatherPillIcon = L.divIcon({
        className: "mova-weather-zone-pill",
        html: `
          <div style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(4px);
            border: 1.5px solid ${badgeBorder};
            border-radius: 6px;
            padding: 2px 7px;
            display: inline-flex;
            align-items: center;
            gap: 4.5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            font-family: Inter, sans-serif;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            <i class="bx ${weatherIcon}" style="color: ${statusColor}; font-size: 14px; line-height: 1;"></i>
            <span style="font-size: 11px; font-weight: 800; color: #111111; font-family: 'JetBrains Mono', monospace;">${temp}°C</span>
            <span style="font-size: 9px; font-weight: 700; color: ${statusColor}; background: ${statusColor}15; padding: 1px 4px; border-radius: 3px;">🌧️ ${rainProb}%</span>
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker([centerLat, centerLng], {
        icon: weatherPillIcon,
        zIndexOffset: 80,
      });

      marker.bindTooltip(
        `<div style="font-family: Inter, sans-serif; padding: 3px;">
          <div style="font-weight: 800; color: #111111; font-size: 11px;">${zone.name}</div>
          <div style="font-size: 10px; color: ${statusColor}; font-weight: 700; margin-top: 2px;">
            Slot: ${selectedTimeSlot.toUpperCase()} ${selectedHour ? `(${selectedHour})` : ''} • Prob: ${rainProb}%
          </div>
        </div>`,
        { direction: "top", offset: [0, -12] }
      );

      marker.on("click", () => {
        if (onSelectItem) onSelectItem({ ...zone, itemType: "ZONE_WEATHER" });
      });

      weatherLayerGroupRef.current.addLayer(marker);
    });
  }, [zones, layers.weather, weatherData, selectedTimeSlot, selectedHour]);

  // Update Sales Heatmap & Demand Velocity Layer (For AI & Sales Forecasting)
  useEffect(() => {
    if (!mapInstanceRef.current || !salesHeatmapLayerGroupRef.current) return;
    salesHeatmapLayerGroupRef.current.clearLayers();

    if (!layers.salesHeatmap || !zones || zones.length === 0) return;

    zones.forEach((zone, idx) => {
      let centerLat = Number(zone.latitude || zone.lat);
      let centerLng = Number(zone.longitude || zone.lng);

      if (isNaN(centerLat) || isNaN(centerLng) || centerLat === 0 || centerLng === 0) {
        let geojson = zone.polygon || zone.geojson || zone.geometry;
        if (typeof geojson === "string") {
          try {
            geojson = JSON.parse(geojson);
          } catch (e) {
            return;
          }
        }
        if (geojson) {
          try {
            const tempLayer = L.geoJSON(geojson);
            const center = tempLayer.getBounds().getCenter();
            centerLat = center.lat;
            centerLng = center.lng;
          } catch (e) {
            return;
          }
        }
      }

      if (isNaN(centerLat) || isNaN(centerLng)) return;

      // Simulated dynamic sales density distribution for the zone
      const rank = zone.topsis_rank || idx + 1;
      const cupsEstimate = Math.max(12, Math.round(75 - rank * 8 + (idx % 3) * 5));
      const revenueEstimate = cupsEstimate * 15000;
      const isHotspot = cupsEstimate >= 40;
      const isWarmspot = cupsEstimate >= 25 && cupsEstimate < 40;

      const heatColor = isHotspot ? "#EA580C" : isWarmspot ? "#F59E0B" : "#10B981";
      const radius = isHotspot ? 240 : isWarmspot ? 180 : 130;

      // 1. Semi-transparent radial gradient pulse circle
      const heatCircle = L.circle([centerLat, centerLng], {
        radius: radius,
        color: heatColor,
        weight: 1.5,
        opacity: 0.65,
        fillColor: heatColor,
        fillOpacity: 0.22,
        dashArray: isHotspot ? "4, 4" : null,
      });

      // 2. High-density Core Dot
      const coreDot = L.circleMarker([centerLat, centerLng], {
        radius: isHotspot ? 8 : 6,
        color: "#FFFFFF",
        weight: 2,
        fillColor: heatColor,
        fillOpacity: 0.95,
      });

      const tooltipContent = `
        <div style="font-family: Inter, sans-serif; padding: 4px; min-width: 140px;">
          <div style="display: flex; items-center; gap: 4px; font-weight: 800; font-size: 11px; color: ${heatColor};">
            <span>🔥 ${zone.name}</span>
          </div>
          <div style="margin-top: 3px; font-size: 10px; color: #111111; font-weight: 700;">
            Estimasi Transaksi: <span style="font-family: 'JetBrains Mono', monospace;">${cupsEstimate} Cups/Hari</span>
          </div>
          <div style="font-size: 9px; color: #64748B;">
            Proyeksi Omset: Rp ${revenueEstimate.toLocaleString("id-ID")}
          </div>
          <div style="margin-top: 3px; font-size: 8.5px; font-weight: 800; color: #2563EB; background: #EFF6FF; padding: 1px 4px; border-radius: 2px; display: inline-block;">
            AI Forecast: ${isHotspot ? "High Velocity Peak" : "Moderate Steady"}
          </div>
        </div>
      `;

      heatCircle.bindTooltip(tooltipContent, { direction: "top", offset: [0, -10] });
      coreDot.bindTooltip(tooltipContent, { direction: "top", offset: [0, -10] });

      salesHeatmapLayerGroupRef.current.addLayer(heatCircle);
      salesHeatmapLayerGroupRef.current.addLayer(coreDot);
    });
  }, [zones, layers.salesHeatmap]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#F8FAFC] select-none isolate z-0 overflow-hidden">
      <div ref={containerRef} className="w-full h-full z-0" />
    </div>
  );
}
