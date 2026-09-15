import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Focus,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CloudRain,
  MapPin,
  Bike,
  Store,
  ShieldAlert,
} from "lucide-react";
import {
  createHubMarkerIcon,
  createRiderMarkerIcon,
  createPoiMarkerIcon,
  createCompetitorMarkerIcon,
  createHotspotMarkerIcon,
  TOLL_ROADS_COORDINATES,
  PROTOCOL_ROADS_COORDINATES,
} from "./MapLayers.js";
import { MOCK_COMPETITORS, MOCK_SETTINGS } from "../../pages/superadmin/mockData.js";
import { Tag } from "../ui/Tag.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const SIDOARJO_CENTER = [-7.4520, 112.7170];
const DEFAULT_ZOOM = 13;

const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

/**
 * Carbon Productive MapView Component
 * Renders high-performance Leaflet canvas in a calm, high-density operations frame.
 */
export function MapView({
  center = SIDOARJO_CENTER,
  zoom = DEFAULT_ZOOM,
  zones = [],
  riders = [],
  pois = [],
  competitors = MOCK_COMPETITORS,
  selectedZoneId = null,
  selectedZone = null,
  onZoneClick = () => {},
  onClearZone = null,
  onRiderClick = () => {},
  onPoiClick = () => {},
  height = "560px",
  showControls = true,
  showLayerToggle = true,
  overlayContent = null,
  children,
}) {
  let themeContext = null;
  try {
    themeContext = useTheme();
  } catch (e) {}
  const isDark = themeContext ? themeContext.isDark : true;

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupsRef = useRef({
    hub: null,
    zones: null,
    riders: null,
    competitors: null,
    tollRoads: null,
    protocolRoads: null,
    pois: null,
  });

  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [layersVisible, setLayersVisible] = useState({
    hub: true,
    zones: true,
    riders: true,
    competitors: true,
    tollRoads: true,
    protocolRoads: true,
    pois: true,
  });

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Initialize Layer Groups
      layerGroupsRef.current.hub = L.layerGroup().addTo(map);
      layerGroupsRef.current.zones = L.layerGroup().addTo(map);
      layerGroupsRef.current.riders = L.layerGroup().addTo(map);
      layerGroupsRef.current.competitors = L.layerGroup().addTo(map);
      layerGroupsRef.current.tollRoads = L.layerGroup().addTo(map);
      layerGroupsRef.current.protocolRoads = L.layerGroup().addTo(map);
      layerGroupsRef.current.pois = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Synchronize Leaflet tile layer dynamically with current theme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDark ? TILES.dark : TILES.light;
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    });
    tileLayer.addTo(map);
    tileLayer.bringToBack();
    tileLayerRef.current = tileLayer;
  }, [isDark]);

  // Update Hub Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layerGroupsRef.current.hub) return;

    layerGroupsRef.current.hub.clearLayers();
    if (layersVisible.hub && MOCK_SETTINGS?.hub_latitude && MOCK_SETTINGS?.hub_longitude) {
      const hubMarker = L.marker([MOCK_SETTINGS.hub_latitude, MOCK_SETTINGS.hub_longitude], {
        icon: createHubMarkerIcon(MOCK_SETTINGS.hub_name || "Central Operations Hub"),
      });
      layerGroupsRef.current.hub.addLayer(hubMarker);
    }
  }, [layersVisible.hub]);

  // Update Zone Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layerGroupsRef.current.zones) return;

    layerGroupsRef.current.zones.clearLayers();
    if (!layersVisible.zones || !zones.length) return;

    zones.forEach((zone) => {
      if (!zone.coordinates || !zone.coordinates.length) return;

      const isSelected = selectedZoneId === zone.id || selectedZone?.id === zone.id;
      const polygon = L.polygon(zone.coordinates, {
        color: isSelected ? "#0F62FE" : "#6F6F6F",
        weight: isSelected ? 2.5 : 1.5,
        fillColor: isSelected ? "#0F62FE" : "#262626",
        fillOpacity: isSelected ? 0.35 : 0.15,
        dashArray: isSelected ? undefined : "4, 4",
      });

      polygon.on("click", () => {
        onZoneClick(zone);
      });

      polygon.bindTooltip(
        `<div style="font-family:'IBM Plex Sans',sans-serif;font-size:12px;padding:4px 8px;background:#161616;color:#F4F4F4;border:1px solid #393939;">
          <strong>${zone.name}</strong><br/>
          <span style="color:#C6C6C6;">Kapasitas: ${zone.max_capacity || 4} unit | Riders: ${zone.assigned_riders_count || 0}</span>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      layerGroupsRef.current.zones.addLayer(polygon);
    });
  }, [zones, layersVisible.zones, selectedZoneId, selectedZone, onZoneClick]);

  // Update Riders Live Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layerGroupsRef.current.riders) return;

    layerGroupsRef.current.riders.clearLayers();
    if (!layersVisible.riders || !riders.length) return;

    riders.forEach((rider) => {
      if (!rider.latitude || !rider.longitude) return;

      const marker = L.marker([rider.latitude, rider.longitude], {
        icon: createRiderMarkerIcon(rider),
      });

      marker.on("click", () => onRiderClick(rider));
      layerGroupsRef.current.riders.addLayer(marker);
    });
  }, [riders, layersVisible.riders, onRiderClick]);

  // Update Competitors Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layerGroupsRef.current.competitors) return;

    layerGroupsRef.current.competitors.clearLayers();
    if (!layersVisible.competitors || !competitors.length) return;

    competitors.forEach((comp) => {
      if (!comp.latitude || !comp.longitude) return;

      const marker = L.marker([comp.latitude, comp.longitude], {
        icon: createCompetitorMarkerIcon(comp),
      });
      layerGroupsRef.current.competitors.addLayer(marker);
    });
  }, [competitors, layersVisible.competitors]);

  // Update Roads Restrictive Layers (Toll & Protocol)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layerGroupsRef.current.tollRoads) {
      layerGroupsRef.current.tollRoads.clearLayers();
      if (layersVisible.tollRoads && TOLL_ROADS_COORDINATES?.length) {
        TOLL_ROADS_COORDINATES.forEach((road) => {
          const coords = road?.coordinates || road;
          if (Array.isArray(coords) && coords.length > 0) {
            const line = L.polyline(coords, {
              color: "#DA1E28",
              weight: 3,
              opacity: 0.8,
              dashArray: "6, 6",
            }).bindTooltip(`<strong>${road?.name || "Jalan Tol"}</strong><br/>Jalan Tol Terlarang (Buffer 50m)`);
            layerGroupsRef.current.tollRoads.addLayer(line);
          }
        });
      }
    }

    if (layerGroupsRef.current.protocolRoads) {
      layerGroupsRef.current.protocolRoads.clearLayers();
      if (layersVisible.protocolRoads && PROTOCOL_ROADS_COORDINATES?.length) {
        PROTOCOL_ROADS_COORDINATES.forEach((road) => {
          const coords = road?.coordinates || road;
          if (Array.isArray(coords) && coords.length > 0) {
            const line = L.polyline(coords, {
              color: "#F1C21B",
              weight: 2.5,
              opacity: 0.8,
            }).bindTooltip(`<strong>${road?.name || "Jalan Protokol"}</strong><br/>Jalan Protokol / Jalur Tertib`);
            layerGroupsRef.current.protocolRoads.addLayer(line);
          }
        });
      }
    }
  }, [layersVisible.tollRoads, layersVisible.protocolRoads]);

  const toggleLayer = (key) => {
    setLayersVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="relative w-full border border-[var(--cds-border-subtle)] bg-[var(--cds-layer-01)] select-none overflow-hidden"
      style={{ height }}
    >
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Docked Top-Left Map Tools */}
      {showControls && (
        <div className="absolute top-[16px] left-[16px] z-10 flex flex-col gap-[2px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] shadow-[var(--cds-shadow-elevated)]">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-[36px] h-[36px] flex items-center justify-center text-[var(--cds-icon-primary)] hover:bg-[var(--cds-layer-hover-01)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-[var(--cds-border-subtle)] w-full" />
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-[36px] h-[36px] flex items-center justify-center text-[var(--cds-icon-primary)] hover:bg-[var(--cds-layer-hover-01)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-[var(--cds-border-subtle)] w-full" />
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.setView(center, zoom)}
            className="w-[36px] h-[36px] flex items-center justify-center text-[var(--cds-icon-primary)] hover:bg-[var(--cds-layer-hover-01)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)] cursor-pointer"
            title="Reset Centroid"
          >
            <Focus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Docked Top-Right Layer Toggle Control */}
      {showLayerToggle && (
        <div className="absolute top-[16px] right-[16px] z-10">
          <button
            type="button"
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="h-[36px] px-[12px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] shadow-[var(--cds-shadow-elevated)] text-[var(--cds-text-primary)] cds-label-01 font-medium flex items-center gap-[var(--cds-spacing-02)] hover:bg-[var(--cds-layer-hover-01)] cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)]"
          >
            <Layers className="w-4 h-4 text-[var(--cds-icon-secondary)]" />
            <span>Map Layers</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>

          {isLayerMenuOpen && (
            <div className="absolute right-0 mt-[4px] w-[220px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] shadow-[var(--cds-shadow-overlay)] p-[12px] space-y-[var(--cds-spacing-02)] text-[12px]">
              <div className="cds-heading-compact-01 text-[var(--cds-text-primary)] border-b border-[var(--cds-border-subtle)] pb-1 mb-2 font-semibold">
                Visibility Layers
              </div>

              {[
                { key: "zones", label: "Zone Polygons", color: "bg-[var(--cds-interactive)]" },
                { key: "riders", label: "Live Rider GPS", color: "bg-[var(--cds-support-success)]" },
                { key: "competitors", label: "Competitor Surveys", color: "bg-[var(--cds-support-warning)]" },
                { key: "tollRoads", label: "Toll Restrictions", color: "bg-[var(--cds-support-error)]" },
                { key: "protocolRoads", label: "Protocol Roads", color: "bg-[#F1C21B]" },
                { key: "hub", label: "Central Operations Hub", color: "bg-[#8A3FFC]" },
              ].map((l) => (
                <label
                  key={l.key}
                  className="flex items-center gap-[var(--cds-spacing-03)] text-[var(--cds-text-primary)] cursor-pointer hover:bg-[var(--cds-layer-hover-01)] p-1"
                >
                  <input
                    type="checkbox"
                    checked={layersVisible[l.key]}
                    onChange={() => toggleLayer(l.key)}
                    className="cursor-pointer"
                  />
                  <span className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="truncate">{l.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Docked Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-[32px] bg-[var(--cds-layer-01)]/95 border-t border-[var(--cds-border-subtle)] px-[16px] flex items-center justify-between cds-code-01 text-[11px] text-[var(--cds-text-secondary)]">
        <div className="flex items-center gap-[var(--cds-spacing-04)]">
          <span>SRID: 4326 (WGS84)</span>
          <span>Center: -7.4520, 112.7170</span>
          <span>Active Polygons: {zones.length}</span>
        </div>
        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[var(--cds-support-success)] rounded-full" />
            LBS Synced
          </span>
        </div>
      </div>

      {overlayContent}
      {children}
    </div>
  );
}

export default MapView;
