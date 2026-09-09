import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getActiveBasemapProvider } from "../../lib/mapPreferences.js";

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
  selectedItem = null,
  onSelectItem,
  mapRef,
}) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Layer groups refs
  const zonesLayerGroupRef = useRef(null);
  const ridersLayerGroupRef = useRef(null);
  const roadsLayerGroupRef = useRef(null);
  const poisLayerGroupRef = useRef(null);

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

    // Configurable Basemap Tile Provider
    const activeProvider = getActiveBasemapProvider();
    tileLayerRef.current = createTileLayer(activeProvider).addTo(map);

    // Initialize Layer Groups
    zonesLayerGroupRef.current = L.layerGroup().addTo(map);
    ridersLayerGroupRef.current = L.layerGroup().addTo(map);
    roadsLayerGroupRef.current = L.layerGroup().addTo(map);
    poisLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    if (mapRef) mapRef.current = map;

    // Listen for tile provider changes from Settings
    const handlePrefChange = () => {
      if (!mapInstanceRef.current) return;
      const newProvider = getActiveBasemapProvider();
      if (tileLayerRef.current) {
        try {
          mapInstanceRef.current.removeLayer(tileLayerRef.current);
        } catch (e) {}
      }
      tileLayerRef.current = createTileLayer(newProvider).addTo(mapInstanceRef.current);
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

    // Render lightweight circle markers for POIs
    filtered.slice(0, 300).forEach((poi) => {
      const lat = Number(poi.latitude || poi.lat);
      const lng = Number(poi.longitude || poi.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.circleMarker([lat, lng], {
        radius: 4,
        fillColor: "#737373",
        color: "#FFFFFF",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      });

      marker.bindTooltip(
        `<div class="font-sans text-[10px]">
          <div class="font-semibold text-[#111111]">${poi.name}</div>
          <div class="text-[#737373]">${poi.category || "POI"}</div>
        </div>`,
        { direction: "top" }
      );

      poisLayerGroupRef.current.addLayer(marker);
    });
  }, [pois, layers.pois, selectedPoiCategory]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#121215] select-none isolate z-0 overflow-hidden">
      <div ref={containerRef} className="w-full h-full z-0" />
    </div>
  );
}
