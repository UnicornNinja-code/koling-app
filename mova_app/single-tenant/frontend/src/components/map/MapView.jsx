
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ChevronsUpDown,
  ChevronsDownUp,
  Sparkles,
} from "lucide-react";
import {
  createHubMarkerIcon,
  createRiderMarkerIcon,
  createPoiMarkerIcon,
  createCompetitorMarkerIcon,
  createHotspotMarkerIcon,
  TOLL_ROADS_COORDINATES,
  PROTOCOL_ROADS_COORDINATES,
  MOCK_POI_HOTSPOTS,
} from "./MapLayers.js";
import { MOCK_COMPETITORS, MOCK_SETTINGS } from "../../pages/admin/mockData.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import { WeatherIcon } from "../ui/WeatherIcon.jsx";

// Precise Sidoarjo Urban & Central Hub Coordinates
const SIDOARJO_CENTER = [-7.4520, 112.7170];
const DEFAULT_ZOOM = 13.5;

export function MapView({
  center = SIDOARJO_CENTER,
  zoom = DEFAULT_ZOOM,
  zones = [],
  riders = [],
  pois = [],
  competitors = MOCK_COMPETITORS,
  hotspots = MOCK_POI_HOTSPOTS,
  selectedZoneId = null,
  selectedZone = null,
  onZoneClick = () => {},
  onClearZone = null,
  onRiderClick = () => {},
  onPoiClick = () => {},
  showWeatherPanel = true,
  className = "",
  height = "500px",
  showControls = true,
  showLayerToggle = true,
  overlayContent = null,
  children,
}) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupsRef = useRef({
    hub: null,
    zones: null,
    riders: null,
    competitors: null,
    tollRoads: null,
    protocolRoads: null,
    pois: null,
    hotspots: null,
  });

  const [isWeatherPanelOpen, setIsWeatherPanelOpen] = useState(true);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Layer visibility states
  const [layersVisible, setLayersVisible] = useState({
    // Layer Operasional Dasar
    hub: true,
    zones: true,
    riders: true,
    hotspots: true,
    // Layer Tematik Wilayah
    competitors: true,
    tollRoads: true,
    protocolRoads: true,
    pois: true,
  });

  // Collapsible sub-panel states
  const [isCompetitorListOpen, setIsCompetitorListOpen] = useState(false);
  const [selectedCompetitorBrands, setSelectedCompetitorBrands] = useState({
    "Kopi Kenangan": true,
    "Tomoro Coffee": true,
    "Point Coffee": true,
    "Janji Jiwa": true,
    "Independent Warkop": true,
  });

  // POI Category Search & Sub-group Accordion States
  const [poiSearchQuery, setPoiSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({
    pendidikan: false,
    perkantoran: false,
    kuliner: false,
    transportasi: false,
  });

  const activeZone = selectedZone || zones.find((z) => z.id === selectedZoneId) || null;

  const handleZoneClick = (zone) => {
    setIsWeatherPanelOpen(true);
    onZoneClick(zone);
  };

  // Toggle all POI sub-categories at once (Shortcut)
  const areAllGroupsExpanded = Object.values(expandedGroups).every(Boolean);
  const handleToggleAllGroups = () => {
    const nextState = !areAllGroupsExpanded;
    setExpandedGroups({
      pendidikan: nextState,
      perkantoran: nextState,
      kuliner: nextState,
      transportasi: nextState,
    });
  };

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

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

      const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      mapInstanceRef.current = map;
      mapInstanceRef.current._tileLayer = tileLayer;

      // Initialize layer groups
      layerGroupsRef.current.hub = L.layerGroup().addTo(map);
      layerGroupsRef.current.tollRoads = L.layerGroup().addTo(map);
      layerGroupsRef.current.protocolRoads = L.layerGroup().addTo(map);
      layerGroupsRef.current.zones = L.layerGroup().addTo(map);
      layerGroupsRef.current.riders = L.layerGroup().addTo(map);
      layerGroupsRef.current.competitors = L.layerGroup().addTo(map);
      layerGroupsRef.current.hotspots = L.layerGroup().addTo(map);
      layerGroupsRef.current.pois = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Reactive Auto FlyTo when Selected Zone Changes (TOPSIS Recommendation Interaction)
  useEffect(() => {
    if (!mapInstanceRef.current || !activeZone) return;

    let targetLat = null;
    let targetLng = null;

    if (activeZone.coordinates && activeZone.coordinates.length > 0) {
      const lats = activeZone.coordinates.map((c) => c[0]);
      const lngs = activeZone.coordinates.map((c) => c[1]);
      targetLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      targetLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    } else if (activeZone.lat && activeZone.lng) {
      targetLat = activeZone.lat;
      targetLng = activeZone.lng;
    }

    if (targetLat && targetLng) {
      mapInstanceRef.current.flyTo([targetLat, targetLng], 14.5, {
        animate: true,
        duration: 1.0,
      });
      setIsWeatherPanelOpen(true);
    }
  }, [selectedZoneId, selectedZone?.id]);

  // 3. Render Central Hub Marker
  useEffect(() => {
    const group = layerGroupsRef.current.hub;
    if (!group) return;
    group.clearLayers();

    if (!layersVisible.hub) return;

    const hubLat = MOCK_SETTINGS?.hubCoordinates?.lat || -7.4478;
    const hubLng = MOCK_SETTINGS?.hubCoordinates?.lng || 112.7183;

    const hubMarker = L.marker([hubLat, hubLng], {
      icon: createHubMarkerIcon("Central Hub Sidoarjo"),
      zIndexOffset: 1000,
    });

    hubMarker.bindTooltip(`
      <div style="font-family: 'Inter', sans-serif; padding: 2px;">
        <div style="font-weight: 800; font-size: 12px; color: #0F172A;">🏢 Central Hub Sidoarjo</div>
        <div style="font-size: 10px; color: #2563EB; font-weight: 700;">Pusat Logistik & Depo Armada Utama</div>
      </div>
    `, { direction: "top", offset: [0, -50] });

    group.addLayer(hubMarker);
  }, [layersVisible.hub]);

  // 4. Render Spatial Roads (Jalan Tol & Jalan Protokol)
  useEffect(() => {
    const tollGroup = layerGroupsRef.current.tollRoads;
    const protocolGroup = layerGroupsRef.current.protocolRoads;
    if (!tollGroup || !protocolGroup) return;

    tollGroup.clearLayers();
    protocolGroup.clearLayers();

    if (layersVisible.tollRoads) {
      TOLL_ROADS_COORDINATES.forEach((segment) => {
        const polyline = L.polyline(segment, {
          color: "#E11D48",
          weight: 4.5,
          opacity: 0.85,
          dashArray: "8, 6",
        });
        polyline.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #E11D48;">
            🛣️ Jalan Tol Surabaya - Porong (Sidoarjo)
          </div>
        `, { sticky: true });
        tollGroup.addLayer(polyline);
      });
    }

    if (layersVisible.protocolRoads) {
      PROTOCOL_ROADS_COORDINATES.forEach((segment) => {
        const polyline = L.polyline(segment, {
          color: "#0284C7",
          weight: 4,
          opacity: 0.8,
        });
        polyline.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #0284C7;">
            🚗 Jalan Protokol Arteri Utama (Jl. Ahmad Yani / Pahlawan)
          </div>
        `, { sticky: true });
        protocolGroup.addLayer(polyline);
      });
    }
  }, [layersVisible.tollRoads, layersVisible.protocolRoads]);

  // 5. Render Zones Polygon Layer with Geofences
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
      }

      if (coordinates.length > 0) {
        const isSelected = selectedZoneId === zone.id;
        const polygon = L.polygon(coordinates, {
          color: isSelected ? "#F97316" : color,
          fillColor: isSelected ? "#F97316" : color,
          fillOpacity: isSelected ? 0.4 : 0.18,
          weight: isSelected ? 3.8 : 2.2,
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
          polygon.setStyle({ weight: isSelected ? 3.8 : 2.2, fillOpacity: isSelected ? 0.4 : 0.18 });
        });

        polygon.on("click", () => handleZoneClick(zone));
        group.addLayer(polygon);
      }
    });
  }, [zones, selectedZoneId, layersVisible.zones]);

  // 6. Render Riders Markers Layer
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
        const isOnline = rider.status === "AKTIF" || rider.status === "ON_DUTY" || rider.status === "ON_TIME";
        const isDeviation = rider.status === "DEVIATION" || rider.status === "DANGER";
        const statusColor = isDeviation ? "#EF4444" : isOnline ? "#10B981" : "#F59E0B";

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
              <span style="color: #64748B;">Status:</span>
              <span style="font-weight: 700; color: ${statusColor}; font-size: 10px; padding: 2px 6px; background: #F1F5F9; border-radius: 4px;">${rider.status || "AKTIF"}</span>
            </div>
            <div style="padding-top: 4px; font-size: 11px; display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Penjualan:</span>
              <span style="font-weight: 800; color: #0F172A;">${rider.salesToday || 0} Cup</span>
            </div>
          </div>
        `);

        marker.on("click", () => onRiderClick(rider));
        group.addLayer(marker);
      }
    });
  }, [riders, layersVisible.riders]);

  // 7. Render Competitors Layer (Filtered by Brand selection)
  useEffect(() => {
    const group = layerGroupsRef.current.competitors;
    if (!group) return;
    group.clearLayers();

    if (!layersVisible.competitors) return;

    competitors.forEach((comp) => {
      const isBrandVisible = selectedCompetitorBrands[comp.brand] !== false;
      if (!isBrandVisible) return;

      if (comp.lat && comp.lng) {
        const marker = L.marker([comp.lat, comp.lng], {
          icon: createCompetitorMarkerIcon(comp),
        });

        marker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #0F172A;">
            ☕ ${comp.name} <span style="font-weight: 600; color: #64748B;">(${comp.brand})</span>
            <div style="font-size: 10px; color: #EF4444; font-weight: 600;">Skor C6: ${(comp.c6Score || 0.75).toFixed(2)} • ${comp.distanceMeters || 120}m</div>
          </div>
        `);

        group.addLayer(marker);
      }
    });
  }, [competitors, layersVisible.competitors, selectedCompetitorBrands]);

  // 8. Render POI Hotspots Layer (Time-Based Crowd Prediction)
  useEffect(() => {
    const group = layerGroupsRef.current.hotspots;
    if (!group) return;
    group.clearLayers();

    if (!layersVisible.hotspots) return;

    hotspots.forEach((spot) => {
      if (spot.lat && spot.lng) {
        const marker = L.marker([spot.lat, spot.lng], {
          icon: createHotspotMarkerIcon(spot),
        });

        marker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #0F172A;">
            🔥 ${spot.name}
            <div style="font-size: 10px; color: #EA580C; font-weight: 600;">Jam Ramai: ${spot.peakTime} • Skor C3: ${spot.crowdScore || 90}/100</div>
            <div style="font-size: 9px; color: #64748B;">${spot.description}</div>
          </div>
        `);

        group.addLayer(marker);
      }
    });
  }, [hotspots, layersVisible.hotspots]);

  // 9. Render POIs Markers Layer
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

  // Zoom & Center Helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(SIDOARJO_CENTER, DEFAULT_ZOOM, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  const toggleLayer = (layerKey) => {
    setLayersVisible((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const toggleCompetitorBrand = (brand) => {
    setSelectedCompetitorBrands((prev) => ({
      ...prev,
      [brand]: !prev[brand],
    }));
  };

  const poiGroups = [
    {
      id: "pendidikan",
      name: "Pendidikan & Sekolah",
      icon: "🎓",
      items: ["SMAN 1 Sidoarjo", "SMPN 1 Sidoarjo", "Universitas Muhammadiyah", "Bimbel Ganesha"],
    },
    {
      id: "perkantoran",
      name: "Perkantoran & Bisnis",
      icon: "🏢",
      items: ["Kantor BPN Sidoarjo", "Kantor Bupati Sidoarjo", "Perbankan Jl. Ahmad Yani", "Kawasan Ruko Pahlawan"],
    },
    {
      id: "kuliner",
      name: "Kuliner & Ritel",
      icon: "🍔",
      items: ["Sentra Kuliner PKL Pahlawan", "Pasar Larangan", "Indomaret Point GOR", "Delta Plaza Mall"],
    },
    {
      id: "transportasi",
      name: "Transportasi & Publik",
      icon: "🚆",
      items: ["Stasiun Sidoarjo", "Terminal Purabaya / Waru", "Alun-Alun Sidoarjo", "GOR Delta Sidoarjo"],
    },
  ];

  return (
    <div
      className={`relative isolate z-0 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs font-['Inter'] ${className}`}
      style={{ height }}
    >
      {/* Map DOM Target */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* ------------------------------------------------------------- */}
      {/* 1. Compact Collapsible Layer Control Drawer (Sisi Kiri Map)   */}
      {/* ------------------------------------------------------------- */}
      {showLayerToggle && isLayerMenuOpen && (
        <div className="absolute top-3 bottom-3 left-14 w-60 sm:w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2.5 space-y-2 z-30 flex flex-col max-h-[calc(100%-24px)] font-['Inter'] animate-in fade-in slide-in-from-left-4 duration-200 select-none">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  Filter Layer & Spasial
                </div>
                <div className="text-[9px] text-slate-400">
                  Sidoarjo Geographic Engine
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLayerMenuOpen(false)}
              title="Tutup Filter"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Category Input */}
          <div className="relative shrink-0">
            <input
              type="text"
              value={poiSearchQuery}
              onChange={(e) => setPoiSearchQuery(e.target.value)}
              placeholder="Cari layer / POI / kompetitor..."
              className="w-full text-[11px] bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin text-xs">
            {/* ----------------------------------------------------------- */}
            {/* A. LAYER TEMATIK WILAYAH (Kompetitor, Jalan Tol, Protokol)   */}
            {/* ----------------------------------------------------------- */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Layer Tematik Wilayah</span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">Tematik</span>
              </div>

              {/* 1. Titik Kompetitor dengan Hide/Show List Brand */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 overflow-hidden">
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                      Kompetitor ({competitors.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCompetitorListOpen(!isCompetitorListOpen)}
                      className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      title={isCompetitorListOpen ? "Sembunyikan Brand" : "Tampilkan Brand"}
                    >
                      {isCompetitorListOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  <input
                    type="checkbox"
                    checked={layersVisible.competitors}
                    onChange={() => toggleLayer("competitors")}
                    className="rounded text-blue-600 cursor-pointer w-3.5 h-3.5"
                  />
                </div>

                {/* Sub-list Brand Kompetitor (Collapsible) */}
                {layersVisible.competitors && isCompetitorListOpen && (
                  <div className="p-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 space-y-0.5 animate-in fade-in duration-150">
                    <div className="text-[9px] text-slate-400 font-medium px-1 pb-0.5">
                      Pilih Brand:
                    </div>
                    {Object.keys(selectedCompetitorBrands).map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center justify-between py-0.5 px-1 rounded text-[10px] text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <span>☕</span>
                          <span>{brand}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedCompetitorBrands[brand]}
                          onChange={() => toggleCompetitorBrand(brand)}
                          className="rounded text-rose-600 cursor-pointer w-3 h-3"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Layer Jalan Tol */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-all">
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>Jalan Tol (Waru - Porong)</span>
                </span>
                <input
                  type="checkbox"
                  checked={layersVisible.tollRoads}
                  onChange={() => toggleLayer("tollRoads")}
                  className="rounded text-rose-600 cursor-pointer w-3.5 h-3.5"
                />
              </label>

              {/* 3. Layer Jalan Protokol */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-sky-50/40 dark:hover:bg-sky-950/20 transition-all">
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Jalan Protokol (Arteri Utama)</span>
                </span>
                <input
                  type="checkbox"
                  checked={layersVisible.protocolRoads}
                  onChange={() => toggleLayer("protocolRoads")}
                  className="rounded text-sky-600 cursor-pointer w-3.5 h-3.5"
                />
              </label>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* B. LAYER DASAR OPERASIONAL (Letak di Atas POI Spasial)        */}
            {/* ----------------------------------------------------------- */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Layer Operasional Dasar</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Live GIS</span>
              </div>

              {/* 1. HUB (Pusat Distribusi) */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>🏢 Central Hub Sidoarjo</span>
                </span>
                <input
                  type="checkbox"
                  checked={layersVisible.hub}
                  onChange={() => toggleLayer("hub")}
                  className="rounded text-blue-600 cursor-pointer w-3.5 h-3.5"
                />
              </label>

              {/* 2. Zona Operasional */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>🔷 Poligon Geofence Zona</span>
                </span>
                <input
                  type="checkbox"
                  checked={layersVisible.zones}
                  onChange={() => toggleLayer("zones")}
                  className="rounded text-blue-600 cursor-pointer w-3.5 h-3.5"
                />
              </label>

              {/* 3. Rider Live */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>🛵 GPS Telemetri Rider</span>
                </span>
                <input
                  type="checkbox"
                  checked={layersVisible.riders}
                  onChange={() => toggleLayer("riders")}
                  className="rounded text-blue-600 cursor-pointer w-3.5 h-3.5"
                />
              </label>

              {/* 4. POI Hotspot (Prediksi Keramaian Waktu C3) */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>🔥 POI Hotspot (Jam Ramai)</span>
                </span>
                <input
                  type="checkbox"
                  checked={layersVisible.hotspots}
                  onChange={() => toggleLayer("hotspots")}
                  className="rounded text-amber-600 cursor-pointer w-3.5 h-3.5"
                />
              </label>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* C. TITIK POI SPASIAL DENGAN SHORTCUT HIDE/SHOW SUB-KATEGORI */}
            {/* ----------------------------------------------------------- */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Titik POI Spasial
                </span>
                {layersVisible.pois && (
                  <button
                    type="button"
                    onClick={handleToggleAllGroups}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    {areAllGroupsExpanded ? "Sembunyikan Semua" : "Buka Semua"}
                  </button>
                )}
              </div>

              {/* Master POI Checkbox */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Titik POI (Semua Kategori)</span>
                </span>
                <input
                  type="checkbox"
                  checked={layersVisible.pois}
                  onChange={() => toggleLayer("pois")}
                  className="rounded text-blue-600 cursor-pointer w-3.5 h-3.5"
                />
              </div>

              {/* Sub-Kategori POI Accordion */}
              {layersVisible.pois && (
                <div className="space-y-1 pl-1">
                  {poiGroups.map((group) => {
                    const isExpanded = expandedGroups[group.id];
                    const matchingItems = group.items.filter((item) =>
                      item.toLowerCase().includes(poiSearchQuery.toLowerCase())
                    );

                    if (poiSearchQuery && matchingItems.length === 0) return null;

                    return (
                      <div
                        key={group.id}
                        className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedGroups((prev) => ({
                              ...prev,
                              [group.id]: !prev[group.id],
                            }))
                          }
                          className="w-full flex items-center justify-between p-1.5 text-left font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs">{group.icon}</span>
                            <span className="text-[10px]">{group.name}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-400 font-medium">
                              {matchingItems.length}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3 h-3 opacity-60" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-1.5 pt-0 space-y-0.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-100">
                            {matchingItems.map((item, idx) => (
                              <label
                                key={idx}
                                className="flex items-center justify-between py-0.5 px-1 text-[10px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                              >
                                <span>{item}</span>
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="rounded text-blue-600 cursor-pointer w-3 h-3"
                                />
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Floating Weather Panel (Pas di Pojok Kanan Atas Map)        */}
      {/* ------------------------------------------------------------- */}
      {overlayContent || children ? (
        <div className="absolute top-3 right-3 z-20 font-['Inter'] pointer-events-auto">
          {overlayContent || children}
        </div>
      ) : showWeatherPanel ? (
        <div className="absolute top-3 right-3 z-20 font-['Inter'] pointer-events-auto max-w-[280px]">
          {isWeatherPanelOpen ? (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-3.5 space-y-3 text-xs transition-all animate-in fade-in zoom-in-95 duration-150">
              {/* Header with Zone Name & Close Button */}
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white truncate text-xs">
                      {activeZone ? (activeZone.name || activeZone.zone_name) : "Pusat Hub Sidoarjo"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {activeZone ? `Rank #${activeZone.rank || 1} • ${activeZone.id}` : "Pusat Operasional Utama"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsWeatherPanelOpen(false);
                    if (onClearZone) onClearZone();
                  }}
                  title="Tutup Panel Cuaca"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Weather Main Metrics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center">
                    <WeatherIcon
                      condition={activeZone?.condition || "Cerah Berawan"}
                      weatherCode={activeZone?.weather_code}
                      size={32}
                    />
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-white leading-none">
                      {activeZone?.temp !== undefined ? `${activeZone.temp}°C` : "31°C"}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {activeZone?.condition || "Cerah Berawan"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    💧 {activeZone?.rainProb || "15%"} Hujan
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium">
                    💨 {activeZone?.wind || "12.5 km/j"}
                  </div>
                </div>
              </div>

              {/* Operational Sub-Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-medium">Kapasitas Rider</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activeZone ? `${activeZone.riderCount || 0}/${activeZone.maxCapacity || 10} Unit` : "8/12 Rider"}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-medium">Skor TOPSIS</div>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {activeZone?.score ? activeZone.score.toFixed(3) : "0.823"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Minimized Weather Badge (Posisi Tepat di Sudut Pojok Kanan Atas) */
            <button
              type="button"
              onClick={() => setIsWeatherPanelOpen(true)}
              title="Buka Panel Cuaca Zona"
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <WeatherIcon
                condition={activeZone?.condition || "Cerah Berawan"}
                weatherCode={activeZone?.weather_code}
                size={18}
              />
              <span className="truncate max-w-[120px]">{activeZone ? (activeZone.name || activeZone.zone_name) : "Cuaca Sidoarjo"}</span>
            </button>
          )}
        </div>
      ) : null}

      {/* ------------------------------------------------------------- */}
      {/* 3. Floating Control Overlay Top-Left                          */}
      {/* ------------------------------------------------------------- */}
      {showControls && (
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 font-['Inter']">
          {/* Zoom Buttons, Focus Center, and Shortcut to Map Ops */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[10px] border border-slate-200/80 dark:border-slate-800/80 shadow-md p-1 flex flex-col gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Perbesar Peta"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Perkecil Peta"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-0.5" />
            {/* Focus Square / Crosshair Icon for Recenter Sidoarjo */}
            <button
              type="button"
              onClick={handleResetCenter}
              title="Pusatkan Peta Sidoarjo (Focus Center)"
              className="p-1.5 rounded-[6px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Focus className="w-4 h-4" />
            </button>
            {/* Shortcut to Map Ops Page */}
            <button
              type="button"
              onClick={() => navigate("/map-ops")}
              title="Beralih ke Halaman Map Ops Lengkap"
              className="p-1.5 rounded-[6px] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Layer Filter Toggler Button */}
          {showLayerToggle && (
            <button
              type="button"
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              title="Buka Filter Layer & POI Spasial"
              className={`backdrop-blur-md rounded-[10px] border shadow-md p-2 transition-all flex items-center justify-center cursor-pointer ${
                isLayerMenuOpen
                  ? "bg-blue-600 text-white border-blue-700 shadow-blue-500/20"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. Quick Toggles Bar at Bottom-Left (Clean: HUB, Zona, Rider, Hotspot) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-3 left-3 z-20 font-['Inter'] select-none">
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-xl border border-white/40 dark:border-slate-800/80 p-1.5 text-xs shadow-xl flex flex-wrap items-center gap-1.5">
          {/* Quick Clickable Layer Toggles */}
          <button
            type="button"
            onClick={() => toggleLayer("hub")}
            title="Sembunyikan / Tampilkan HUB"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer border ${
              layersVisible.hub
                ? "bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-blue-500/30 shadow-2xs"
                : "bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60 line-through"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layersVisible.hub ? "bg-blue-600" : "bg-slate-400"}`} />
            <span>HUB</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer("zones")}
            title="Sembunyikan / Tampilkan Zona"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer border ${
              layersVisible.zones
                ? "bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 shadow-2xs"
                : "bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60 line-through"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layersVisible.zones ? "bg-indigo-500" : "bg-slate-400"}`} />
            <span>Zona</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer("riders")}
            title="Sembunyikan / Tampilkan Rider"
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
            onClick={() => toggleLayer("hotspots")}
            title="Sembunyikan / Tampilkan POI Hotspot Prediksi Waktu"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer border ${
              layersVisible.hotspots
                ? "bg-amber-500/15 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-2xs"
                : "bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60 line-through"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layersVisible.hotspots ? "bg-amber-500" : "bg-slate-400"}`} />
            <span>Hotspot</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapView;

