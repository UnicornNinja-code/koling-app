import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function CandidateMapVisualization({
  zonePolygon = null,
  protocolRoads = [],
  candidates = [],
  rankings = [],
  selectedCandidateId = null,
  onSelectCandidate = () => {},
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean previous instance
    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch (e) {}
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    // Initialize Leaflet Map centered at Sidoarjo (-7.4478, 112.7183)
    const map = L.map(mapContainerRef.current).setView([-7.4478, 112.7183], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers dynamically when zone, roads, or candidates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const bounds = [];

    // 1. Render Zone Polygon
    if (zonePolygon) {
      try {
        let polyGeo = zonePolygon;
        if (typeof zonePolygon === "string") polyGeo = JSON.parse(zonePolygon);
        const geoLayer = L.geoJSON(polyGeo, {
          style: {
            color: "#dc2626",
            weight: 2,
            fillColor: "#ef4444",
            fillOpacity: 0.15,
            dashArray: "4, 4",
          },
        });
        geoLayer.addTo(layerGroup);
        bounds.push(geoLayer.getBounds());
      } catch (e) {
        console.warn("Invalid zone polygon GeoJSON:", e);
      }
    }

function normalizeRoadFeatureCollection(data) {
  if (!data) return { type: "FeatureCollection", features: [] };
  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    return data;
  }
  if (Array.isArray(data)) {
    const features = data
      .map((r) => {
        if (r && r.type === "Feature" && r.geometry) return r;
        if (!r) return null;
        const geom = typeof r.geom === "string" ? JSON.parse(r.geom) : (r.geom || r.geometry);
        if (!geom) return null;
        return {
          type: "Feature",
          geometry: geom,
          properties: { name: r.name, highway: r.highway_type || r.highway },
        };
      })
      .filter((f) => f && f.geometry && Array.isArray(f.geometry.coordinates));
    return { type: "FeatureCollection", features };
  }
  return { type: "FeatureCollection", features: [] };
}

    // 2. Render Protocol Roads Restriction Layer (Phase 1)
    const normalizedRoads = normalizeRoadFeatureCollection(protocolRoads);
    if (normalizedRoads.features.length > 0) {
      try {
        L.geoJSON(normalizedRoads, {
          style: {
            color: "#b91c1c",
            weight: 4,
            opacity: 0.8,
          },
        }).addTo(layerGroup);
      } catch (e) {
        console.warn("Invalid protocol roads GeoJSON:", e);
      }
    }

    // 3. Render Candidate Markers (with Visual Hierarchy)
    const rankMap = new Map();
    if (Array.isArray(rankings)) {
      rankings.forEach((r) => rankMap.set(r.id, r));
    }

    candidates.forEach((cand) => {
      const lat = parseFloat(cand.latitude);
      const lon = parseFloat(cand.longitude);
      if (isNaN(lat) || isNaN(lon)) return;

      const rankInfo = rankMap.get(cand.id);
      const rank = rankInfo?.rank;
      const score = rankInfo?.preference_score;

      let markerColor = "#2563eb"; // Default Blue for ALLOWED
      let markerRadius = 8;
      let labelText = cand.name;

      if (cand.validation_status === "REJECTED") {
        markerColor = "#ef4444"; // Red for REJECTED
        labelText += ` (REJECTED: ${cand.rejection_reason || 'N/A'})`;
      } else if (rank === 1) {
        markerColor = "#eab308"; // Gold Star for Rank 1
        markerRadius = 12;
        labelText = `🥇 [RANK #1] ${cand.name} (V_i: ${score})`;
      } else if (rank === 2 || rank === 3) {
        markerColor = "#10b981"; // Emerald for Rank 2 & 3
        markerRadius = 10;
        labelText = `🥈 [RANK #${rank}] ${cand.name} (V_i: ${score})`;
      } else if (rank > 3) {
        labelText = `[RANK #${rank}] ${cand.name} (V_i: ${score})`;
      }

      const circleMarker = L.circleMarker([lat, lon], {
        radius: markerRadius,
        fillColor: markerColor,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      circleMarker.bindTooltip(labelText, { permanent: rank === 1, direction: "top" });
      circleMarker.on("click", () => onSelectCandidate(cand));
      circleMarker.addTo(layerGroup);

      bounds.push(L.latLngBounds([[lat, lon], [lat, lon]]));
    });

    // Adjust map zoom bounds
    if (bounds.length > 0) {
      try {
        const combinedBounds = bounds.reduce((acc, b) => acc.extend(b), bounds[0]);
        if (combinedBounds.isValid()) {
          map.fitBounds(combinedBounds, { padding: [30, 30] });
        }
      } catch (e) {}
    }
  }, [zonePolygon, protocolRoads, candidates, rankings]);

  return (
    <div className="relative w-full h-[420px] rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 z-10 shadow-xs">
        <div className="font-bold text-slate-800 text-xs mb-1">Legenda Peta Spasial:</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
          <span className="text-slate-700 font-semibold">Rank #1 Rekomendasi Utama</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-700">Rank #2 & #3 Rekomendasi Tinggi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span className="text-slate-700">Kandidat ALLOWED (Layak)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          <span className="text-slate-700">Kandidat REJECTED (Ditolak Spasial)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
          <span className="w-3 h-0.5 bg-red-700 inline-block"></span>
          <span className="text-slate-700">Jalan Protokol (Terlarang)</span>
        </div>
      </div>
    </div>
  );
}
