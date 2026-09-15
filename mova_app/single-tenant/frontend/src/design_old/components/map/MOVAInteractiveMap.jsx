import React from "react";
import { MapView } from "./MapView.jsx";

/**
 * MOVAInteractiveMap
 * Enterprise generic map component wrapper for MOVA Single-Tenant Platform.
 * Supports dashboard overview, operational telemetry, distribution zone assignment, and POI density viewing.
 */
export function MOVAInteractiveMap({
  mode = "dashboard",
  center,
  zoom,
  zones = [],
  riders = [],
  pois = [],
  competitors = [],
  hotspots = [],
  selectedZoneId = null,
  selectedZone = null,
  onZoneClick = () => {},
  onClearZone = null,
  onRiderClick = () => {},
  onPoiClick = () => {},
  showWeatherPanel = true,
  showControls = true,
  showLayerToggle = true,
  height = "500px",
  className = "",
  overlayContent = null,
  children,
}) {
  // Mode-based presets
  const isMinimal = mode === "minimal";

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden ${className}`}>
      <MapView
        center={center}
        zoom={zoom}
        zones={zones}
        riders={riders}
        pois={pois}
        competitors={competitors}
        hotspots={hotspots}
        selectedZoneId={selectedZoneId}
        selectedZone={selectedZone}
        onZoneClick={onZoneClick}
        onClearZone={onClearZone}
        onRiderClick={onRiderClick}
        onPoiClick={onPoiClick}
        showWeatherPanel={!isMinimal && showWeatherPanel}
        showControls={showControls}
        showLayerToggle={!isMinimal && showLayerToggle}
        height={height}
        overlayContent={overlayContent}
      >
        {children}
      </MapView>
    </div>
  );
}

export default MOVAInteractiveMap;

