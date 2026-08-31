import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import L from "leaflet";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { zoneService } from "../../services/zoneService.js";
import { poiService } from "../../services/poiService.js";
import { roadService } from "../../services/roadService.js";
import { operationalRuleService } from "../../services/operationalRuleService.js";
import { weatherService } from "../../services/weatherService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  latLngsToGeoJsonPolygon,
  geoJsonToLatLngs,
  calculatePolygonCentroid,
} from "../../utils/geoJsonAdapter.js";
import {
  POI_CATEGORY_CONFIG,
  getCategoryConfig,
  createCategoryLeafletIcon,
} from "../../utils/poiCategoryConfig.js";
import {
  MapPin,
  Plus,
  Trash2,
  Edit,
  Power,
  Eye,
  Undo2,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Search,
  Users,
  Layers,
  MousePointerClick,
  RefreshCw,
  CloudSun,
  Building2,
  Check,
  Umbrella,
  Thermometer,
  Wind,
  Droplets,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Navigation,
  ShieldAlert,
  GraduationCap,
  Landmark,
  Factory,
  TreePine,
  Store,
  Utensils,
  Bus,
} from "lucide-react";

// Form Schema Validation via Zod
const createZoneSchema = z.object({
  name: z.string().min(3, "Nama zona minimal 3 karakter"),
  description: z.string().optional(),
  max_capacity: z.coerce.number().min(1, "Kapasitas minimal 1 rider"),
  status: z.enum(["ACTIVE", "RESTRICTED", "INACTIVE"]),
});

const editZoneSchema = z.object({
  name: z.string().min(3, "Nama zona minimal 3 karakter"),
  description: z.string().optional(),
  max_capacity: z.coerce.number().min(1, "Kapasitas minimal 1 rider"),
  status: z.enum(["ACTIVE", "RESTRICTED", "INACTIVE"]),
});

// Category Icon Mapping helper for POI Legend UI
const CATEGORY_ICON_MAP = {
  Pendidikan: GraduationCap,
  Kampus: Landmark,
  Perkantoran: Building2,
  Industri: Factory,
  Taman: TreePine,
  Komersial: Store,
  Kuliner: Utensils,
  Transportasi: Bus,
  Fasilitas: Landmark,
  Lainnya: MapPin,
};

export function ZoneManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Tab State: "zones" | "pending-pois"
  const [activeTab, setActiveTab] = useState("zones");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState(null);

  // Centralized Spatial Map Layer Visibility State
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showPoiCategoryDropdown, setShowPoiCategoryDropdown] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    zones: true,
    roads: true, // Jalan Protokol / Area Terlarang Operasional (Default ON)
    tollRoads: true, // Jalan Tol / Area Terlarang Operasional (Default ON)
    hub: true,
    riders: true,
    poiMaster: false, // Default OFF to avoid visual clutter from ~1,551 POI markers on mount
    poiCategories: {
      Pendidikan: true,
      Kampus: true,
      Perkantoran: true,
      Industri: true,
      Taman: true,
      Komersial: true,
      Kuliner: true,
      Transportasi: true,
      Fasilitas: true,
      Lainnya: true,
    },
  });

  // Drawing & Geometry State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [draftGeoJson, setDraftGeoJson] = useState(null);

  // Modals & Errors State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingZone, setEditingZone] = useState(null);
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [newCapacity, setNewCapacity] = useState(10);
  const [overlapError, setOverlapError] = useState(null);
  const [mapError, setMapError] = useState(false);

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const zonesLayerGroupRef = useRef(null);
  const roadsLayerGroupRef = useRef(null);
  const tollRoadsLayerGroupRef = useRef(null);
  const drawingLayerGroupRef = useRef(null);
  const poiLayerGroupRef = useRef(null);
  const hubLayerGroupRef = useRef(null);

  // 1. Fetch Spatial Hub Config
  const {
    data: configRes,
    isLoading: loadingConfig,
    isError: isConfigError,
    error: configError,
  } = useQuery({
    queryKey: ["zoneConfig"],
    queryFn: zoneService.getZoneConfig,
  });

  // 2. Fetch Zones List
  const { data: zonesRes, isLoading, isError, error, refetch: refetchZones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getZones({ status: statusFilter !== "ALL" ? statusFilter : undefined }),
  });

  // 3. Fetch Operational Area POIs
  const {
    data: areaPoisRes,
    isLoading: loadingAreaPois,
    refetch: refetchAreaPois,
  } = useQuery({
    queryKey: ["operationalPois"],
    queryFn: poiService.getOperationalAreaPois,
  });

  // 4. Fetch Protocol Roads Static GeoJSON (Jalan Protokol / Area Terlarang)
  const { data: protocolRoadsRes } = useQuery({
    queryKey: ["protocolRoads"],
    queryFn: roadService.getProtocolRoads,
  });

  // 4b. Fetch Toll Roads GeoJSON from Overpass / PostGIS
  const { data: tollRoadsRes } = useQuery({
    queryKey: ["tollRoads"],
    queryFn: roadService.getTollRoads,
  });

  // 4c. Fetch Operational Rules Config
  const { data: opRulesRes } = useQuery({
    queryKey: ["operationalRules"],
    queryFn: operationalRuleService.getOperationalRules,
  });
  const opRules = opRulesRes?.data || { protocol_road_prohibited: true, toll_road_prohibited: true };

  // 5. Fetch Hub Weather Info
  const hubCityName = configRes?.hub_city_name;
  const { data: hubWeatherRes } = useQuery({
    queryKey: ["hubWeather", hubCityName],
    queryFn: () => weatherService.getHubWeatherInfo(hubCityName),
    enabled: !!hubCityName,
  });

  // 6. Fetch Pending POIs for Approval Workflow
  const { data: pendingPoisRes, isLoading: loadingPendingPois } = useQuery({
    queryKey: ["pendingPois"],
    queryFn: poiService.getPendingPois,
    enabled: ["SUPERADMIN", "SUPERVISOR"].includes(currentUser?.role),
  });

  // 7. Fetch Selected Zone C1/C2 Scores
  const { data: c1c2Res } = useQuery({
    queryKey: ["zoneC1C2", selectedZone?.id],
    queryFn: () => poiService.getC1C2Scores(selectedZone?.id),
    enabled: !!selectedZone?.id,
  });

  // 8. Fetch Selected Zone Weather Info (C4 Precipitation Criteria)
  const { data: zoneWeatherRes } = useQuery({
    queryKey: ["zoneWeather", selectedZone?.id],
    queryFn: () => weatherService.getZoneWeatherInfo(selectedZone?.id),
    enabled: !!selectedZone?.id,
  });

  const zonesList = useMemo(() => zonesRes?.zones || zonesRes?.data || [], [zonesRes]);
  const operationalPoisList = useMemo(() => areaPoisRes?.pois || areaPoisRes?.data || [], [areaPoisRes]);
  const pendingPoisList = useMemo(() => pendingPoisRes?.pois || pendingPoisRes?.data || [], [pendingPoisRes]);

  // Filtered Zones List
  const filteredZones = useMemo(() => {
    return zonesList.filter((z) => {
      const matchSearch =
        !searchTerm ||
        z.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        z.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || z.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [zonesList, searchTerm, statusFilter]);

  // React Hook Forms
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors, isSubmitting: isSubmittingCreate },
    reset: resetCreateForm,
  } = useForm({
    resolver: zodResolver(createZoneSchema),
    defaultValues: { name: "", description: "", max_capacity: 10, status: "ACTIVE" },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit },
    reset: resetEditForm,
  } = useForm({
    resolver: zodResolver(editZoneSchema),
  });

  // Mutations
  const syncOverpassMutation = useMutation({
    mutationFn: () => poiService.syncCityPois({ cityName: hubCityName }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["pendingPois"]);
      queryClient.invalidateQueries(["operationalPois"]);
      alert(data?.msg || "Sinkronisasi Overpass POI kota berhasil diproses!");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal sinkronisasi POI Overpass.");
    },
  });

  const syncWeatherMutation = useMutation({
    mutationFn: weatherService.syncWeather,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["hubWeather"]);
      queryClient.invalidateQueries(["zoneWeather"]);
      alert(data?.msg || "Sinkronisasi data cuaca Open-Meteo berhasil!");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal sinkronisasi cuaca.");
    },
  });

  const approvePoiMutation = useMutation({
    mutationFn: ({ poi_id, status }) => poiService.approveOrRejectPoi({ poi_id, status }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["pendingPois"]);
      queryClient.invalidateQueries(["operationalPois"]);
      alert(data?.msg || "Persetujuan POI berhasil diproses!");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal memproses persetujuan POI.");
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: zoneService.createZone,
    onSuccess: () => {
      queryClient.invalidateQueries(["zones"]);
      setShowCreateModal(false);
      setIsDrawingMode(false);
      setDrawnPoints([]);
      setDraftGeoJson(null);
      setOverlapError(null);
      resetCreateForm();
      if (drawingLayerGroupRef.current) drawingLayerGroupRef.current.clearLayers();
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || err?.message || "Gagal menyimpan zona operasional.";
      setOverlapError(msg);
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ id, payload }) => zoneService.updateZone(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["zones"]);
      setShowEditModal(false);
      setEditingZone(null);
      setIsDrawingMode(false);
      setDrawnPoints([]);
      setDraftGeoJson(null);
      setOverlapError(null);
      resetEditForm();
      if (data?.zone) setSelectedZone(data.zone);
      if (drawingLayerGroupRef.current) drawingLayerGroupRef.current.clearLayers();
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || err?.message || "Gagal memperbarui data zona.";
      setOverlapError(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => zoneService.updateZoneStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["zones"]);
      setShowStatusModal(false);
      if (data?.zone) setSelectedZone(data.zone);
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal mengubah status zona.");
    },
  });

  const updateCapacityMutation = useMutation({
    mutationFn: ({ id, max_capacity }) => zoneService.updateZoneCapacity(id, max_capacity),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["zones"]);
      setShowCapacityModal(false);
      if (data?.zone) setSelectedZone(data.zone);
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal mengubah kapasitas kuota zona.");
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: zoneService.deleteZone,
    onSuccess: () => {
      queryClient.invalidateQueries(["zones"]);
      setShowDeleteModal(false);
      setSelectedZone(null);
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal menghapus zona.");
    },
  });

  // Layer Toggle Handlers (Pure In-Memory Operations — 0 Backend API Calls)
  const toggleMasterLayer = (layerName) => {
    setMapLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  const togglePoiCategory = (catKey) => {
    setMapLayers((prev) => ({
      ...prev,
      poiCategories: {
        ...prev.poiCategories,
        [catKey]: !prev.poiCategories[catKey],
      },
    }));
  };

  const toggleAllPoiCategories = (enable) => {
    setMapLayers((prev) => {
      const updated = {};
      Object.keys(prev.poiCategories).forEach((key) => {
        updated[key] = enable;
      });
      return {
        ...prev,
        poiCategories: updated,
      };
    });
  };

  // Map Initialization (With Custom Leaflet Panes Z-Index Hierarchy)
  useEffect(() => {
    if (activeTab !== "zones" || !mapContainerRef.current || !configRes) return;

    const { hub_latitude, hub_longitude, operational_bounds } = configRes;
    if (typeof hub_latitude !== "number" || typeof hub_longitude !== "number") return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    try {
      delete L.Icon.Default.prototype._getIconUrl;
    } catch (e) {}

    try {
      const center = [hub_latitude, hub_longitude];
      const mapOptions = {
        center,
        zoom: 13,
      };

      if (operational_bounds) {
        const { min_lat, max_lat, min_lng, max_lng } = operational_bounds;
        mapOptions.maxBounds = [
          [min_lat, min_lng],
          [max_lat, max_lng],
        ];
        mapOptions.maxBoundsViscosity = 0.8;
      }

      const map = L.map(mapContainerRef.current, mapOptions);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Create Custom Map Panes to Enforce Strict Visual Hierarchy
      map.createPane("hubPane");
      map.getPane("hubPane").style.zIndex = 650; // Priority 1 (Topmost)

      map.createPane("riderPane");
      map.getPane("riderPane").style.zIndex = 620; // Priority 2

      map.createPane("selectedZonePane");
      map.getPane("selectedZonePane").style.zIndex = 550; // Priority 3

      map.createPane("roadPane");
      map.getPane("roadPane").style.zIndex = 500; // Priority 4 (Protected Road Layer)

      map.createPane("zonesPane");
      map.getPane("zonesPane").style.zIndex = 450; // Priority 5

      map.createPane("poiPane");
      map.getPane("poiPane").style.zIndex = 350; // Priority 6 (Bottom overlay)

      zonesLayerGroupRef.current = L.layerGroup().addTo(map);
      roadsLayerGroupRef.current = L.layerGroup().addTo(map);
      tollRoadsLayerGroupRef.current = L.layerGroup().addTo(map);
      drawingLayerGroupRef.current = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = L.layerGroup().addTo(map);
      hubLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 300);
    } catch (err) {
      console.error("Failed to initialize Leaflet map:", err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [configRes, activeTab]);

  // Render Hub Marker (Controlled by mapLayers.hub)
  useEffect(() => {
    if (activeTab !== "zones" || !mapInstanceRef.current || !hubLayerGroupRef.current || !configRes) return;

    hubLayerGroupRef.current.clearLayers();

    if (mapLayers.hub && configRes.hub_latitude && configRes.hub_longitude) {
      const hubHtml = `
        <div style="
          background-color: #DC2626;
          color: #FFFFFF;
          padding: 4px 8px;
          border-radius: 12px;
          font-family: sans-serif;
          font-size: 10px;
          font-weight: 800;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.5);
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>HQ</span>
          <span>${configRes.hub_city_name || "Hub"}</span>
        </div>
      `;

      const hubIcon = L.divIcon({
        html: hubHtml,
        className: "custom-hub-icon",
        iconSize: [80, 24],
        iconAnchor: [40, 12],
        pane: "hubPane",
      });

      L.marker([configRes.hub_latitude, configRes.hub_longitude], { icon: hubIcon })
        .addTo(hubLayerGroupRef.current)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: #dc2626; font-size: 12px;">Gudang / Hub Operasional Utama</strong><br/>
            <span>Kota: ${configRes.hub_city_name}</span><br/>
            <span>Koordinat: ${configRes.hub_latitude}, ${configRes.hub_longitude}</span>
          </div>
        `);
    }
  }, [configRes, mapLayers.hub, activeTab]);

  // Render Protocol Roads Layer (Jalan Protokol / Area Terlarang Operasional)
  useEffect(() => {
    if (activeTab !== "zones" || !mapInstanceRef.current || !roadsLayerGroupRef.current) return;

    roadsLayerGroupRef.current.clearLayers();

    if (!mapLayers.roads || !protocolRoadsRes) return;

    const isBlocking = opRules.protocol_road_prohibited;
    const badgeText = isBlocking ? "BLOCKING" : "ADVISORY / WARNING ONLY";
    const badgeColor = isBlocking ? "#dc2626" : "#d97706";

    L.geoJSON(protocolRoadsRes, {
      style: {
        color: isBlocking ? "#EF4444" : "#F59E0B",
        weight: 3.5,
        dashArray: "8, 6",
        opacity: 0.85,
      },
      pane: "roadPane",
      onEachFeature: (feature, layer) => {
        const roadName = feature.properties?.name || "Jalan Protokol";
        const highway = feature.properties?.highway || "primary";
        layer.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: ${badgeColor};">Area Terlarang: Jalan Protokol (${badgeText})</strong><br/>
            <span>${roadName} (${highway})</span><br/>
            <span style="color: #64748b; font-size: 10px;">Status Penegakan: ${badgeText}</span>
          </div>
        `);
      },
    }).addTo(roadsLayerGroupRef.current);
  }, [protocolRoadsRes, mapLayers.roads, opRules.protocol_road_prohibited, activeTab]);

  // Render Toll Roads Layer (Jalan Tol / Area Terlarang Operasional)
  useEffect(() => {
    if (activeTab !== "zones" || !mapInstanceRef.current || !tollRoadsLayerGroupRef.current) return;

    tollRoadsLayerGroupRef.current.clearLayers();

    if (!mapLayers.tollRoads || !tollRoadsRes) return;

    const isBlocking = opRules.toll_road_prohibited;
    const badgeText = isBlocking ? "BLOCKING" : "ADVISORY / WARNING ONLY";
    const badgeColor = isBlocking ? "#7f1d1d" : "#d97706";

    L.geoJSON(tollRoadsRes, {
      style: {
        color: isBlocking ? "#7F1D1D" : "#D97706",
        weight: 4.5,
        opacity: 0.95,
      },
      pane: "roadPane",
      onEachFeature: (feature, layer) => {
        const roadName = feature.properties?.name || "Jalan Tol";
        const highway = feature.properties?.highway || "motorway";
        const ref = feature.properties?.metadata?.ref || "";
        const refLabel = ref ? ` [${ref}]` : "";
        layer.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: ${badgeColor};">Area Terlarang: Jalan Tol (${badgeText})</strong><br/>
            <span>${roadName}${refLabel} (${highway})</span><br/>
            <span style="color: #64748b; font-size: 10px;">Status Penegakan: ${badgeText}</span>
          </div>
        `);
      },
    }).addTo(tollRoadsLayerGroupRef.current);
  }, [tollRoadsRes, mapLayers.tollRoads, opRules.toll_road_prohibited, activeTab]);

  // Render Zone Polygons on Map (Controlled by mapLayers.zones)
  useEffect(() => {
    if (activeTab !== "zones" || !mapInstanceRef.current || !zonesLayerGroupRef.current) return;

    zonesLayerGroupRef.current.clearLayers();

    if (!mapLayers.zones) return;

    zonesList.forEach((zone) => {
      const latLngs = geoJsonToLatLngs(zone.polygon);
      if (latLngs.length >= 3) {
        const isSelected = selectedZone?.id === zone.id;
        const color =
          zone.status === "ACTIVE"
            ? "#10B981"
            : zone.status === "RESTRICTED"
            ? "#F59E0B"
            : "#EF4444";

        const polygonLayer = L.polygon(latLngs, {
          color: isSelected ? "#DC2626" : color,
          fillColor: color,
          fillOpacity: isSelected ? 0.45 : 0.25,
          weight: isSelected ? 4 : 2,
          dashArray: isSelected ? "4, 4" : undefined,
          pane: isSelected ? "selectedZonePane" : "zonesPane",
        }).addTo(zonesLayerGroupRef.current);

        polygonLayer.on("click", () => {
          setSelectedZone(zone);
          const centroid = calculatePolygonCentroid(latLngs);
          if (mapInstanceRef.current && centroid) {
            mapInstanceRef.current.flyTo(centroid, 14, { duration: 0.8 });
          }
        });

        polygonLayer.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; font-weight: bold;">
            ${zone.name}<br/>
            <span style="color: #64748b;">Kuota: ${zone.active_riders_count || 0}/${zone.max_capacity} Rider</span>
          </div>
        `);
      }
    });
  }, [zonesList, selectedZone, mapLayers.zones, activeTab]);

  // Render Operational POI Markers Layer (Controlled by mapLayers.poiMaster & mapLayers.poiCategories)
  useEffect(() => {
    if (activeTab !== "zones" || !mapInstanceRef.current || !poiLayerGroupRef.current) return;

    poiLayerGroupRef.current.clearLayers();

    if (!mapLayers.poiMaster || !operationalPoisList || operationalPoisList.length === 0) return;

    operationalPoisList.forEach((poi) => {
      const lat = Number(poi.latitude);
      const lng = Number(poi.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const categoryName = poi.category_name || poi.category || "Lainnya";
        const catConfig = getCategoryConfig(categoryName);

        // Check category level visibility filter
        if (mapLayers.poiCategories[catConfig.key] !== false) {
          const customIcon = createCategoryLeafletIcon(categoryName, "poiPane");

          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(poiLayerGroupRef.current);

          const rawCategory = poi.category || "Lainnya";
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 11px; min-width: 170px;">
              <strong style="font-size: 12px; color: #0f172a;">${poi.name || "POI Tanpa Nama"}</strong><br/>
              <span style="color: #475569;">Kategori Raw: <strong>${rawCategory}</strong></span><br/>
              <span style="color: ${catConfig.color}; font-weight: bold;">Visual Group: ${catConfig.label}</span><br/>
              <span style="color: #64748b;">Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}</span><br/>
              <span style="color: #10b981; font-weight: bold;">Status: APPROVED</span>
            </div>
          `);
        }
      }
    });
  }, [operationalPoisList, mapLayers.poiMaster, mapLayers.poiCategories, activeTab]);

  // Handle Drawing Mode Map Clicks
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (!isDrawingMode) return;
      if (e && e.latlng) {
        setDrawnPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    };

    if (isDrawingMode) {
      map.on("click", handleMapClick);
    }
    return () => {
      map.off("click", handleMapClick);
    };
  }, [isDrawingMode]);

  // Render Temporary Drawing Polygon
  useEffect(() => {
    if (!mapInstanceRef.current || !drawingLayerGroupRef.current) return;

    drawingLayerGroupRef.current.clearLayers();
    if (!drawnPoints || drawnPoints.length === 0) return;

    const latLngs = drawnPoints.map((pt) => L.latLng(pt[0], pt[1]));

    latLngs.forEach((latLng, idx) => {
      L.circleMarker(latLng, {
        radius: 6,
        color: idx === 0 ? "#10B981" : "#DC2626",
        fillColor: "#FFFFFF",
        fillOpacity: 1,
        weight: 2,
        pane: "selectedZonePane",
      }).addTo(drawingLayerGroupRef.current);
    });

    if (latLngs.length >= 2) {
      L.polyline(latLngs, { color: "#DC2626", weight: 3, dashArray: "6, 6", pane: "selectedZonePane" }).addTo(
        drawingLayerGroupRef.current
      );
    }

    if (latLngs.length >= 3) {
      L.polygon(latLngs, { color: "#DC2626", fillColor: "#EF4444", fillOpacity: 0.3, weight: 2, pane: "selectedZonePane" }).addTo(
        drawingLayerGroupRef.current
      );
    }
  }, [drawnPoints]);

  // Drawing Handlers
  const handleStartDrawing = () => {
    setIsDrawingMode(true);
    setDrawnPoints([]);
    setDraftGeoJson(null);
    setOverlapError(null);
    if (drawingLayerGroupRef.current) drawingLayerGroupRef.current.clearLayers();
  };

  const handleFinishDrawing = () => {
    if (drawnPoints.length < 3) {
      alert("Poligon membutuhkan minimal 3 titik sudut koordinat!");
      return;
    }

    const geoJsonPolygon = latLngsToGeoJsonPolygon(drawnPoints);
    if (!geoJsonPolygon) {
      alert("Gagal mengonversi poligon ke format GeoJSON yang valid.");
      return;
    }

    setDraftGeoJson(geoJsonPolygon);

    if (editingZone) {
      setShowEditModal(true);
    } else {
      resetCreateForm({ name: "", description: "", max_capacity: 10, status: "ACTIVE" });
      setShowCreateModal(true);
    }
  };

  const handleCancelDrawing = () => {
    setIsDrawingMode(false);
    setDrawnPoints([]);
    setDraftGeoJson(null);
    setOverlapError(null);
    if (drawingLayerGroupRef.current) drawingLayerGroupRef.current.clearLayers();
  };

  // Form Submit Handlers
  const onCreateSubmit = (data) => {
    const polygonToSubmit = draftGeoJson;
    if (!polygonToSubmit) {
      setOverlapError("Silakan gambar poligon area zona pada peta terlebih dahulu.");
      return;
    }
    setOverlapError(null);
    createZoneMutation.mutate({ ...data, polygon: polygonToSubmit });
  };

  const onEditSubmit = (data) => {
    const polygonToSubmit = draftGeoJson || editingZone?.polygon;
    setOverlapError(null);
    updateZoneMutation.mutate({
      id: editingZone.id,
      payload: { ...data, polygon: polygonToSubmit },
    });
  };

  // Action Helpers
  const handleSelectZoneFromList = (zone) => {
    setSelectedZone(zone);
    const latLngs = geoJsonToLatLngs(zone.polygon);
    if (latLngs.length > 0 && mapInstanceRef.current) {
      const centroid = calculatePolygonCentroid(latLngs);
      if (centroid) {
        mapInstanceRef.current.flyTo(centroid, 14, { duration: 0.8 });
      }
    }
  };

  const openEditZoneModal = (zone) => {
    setEditingZone(zone);
    setDraftGeoJson(zone.polygon);
    const existingLatLngs = geoJsonToLatLngs(zone.polygon);
    setDrawnPoints(existingLatLngs);
    setOverlapError(null);
    resetEditForm({
      name: zone.name || "",
      description: zone.description || "",
      max_capacity: zone.max_capacity || 10,
      status: zone.status || "ACTIVE",
    });
    setShowEditModal(true);
  };

  const isSuperAdmin = currentUser?.role === "SUPERADMIN";
  const isSuperAdminOrMgmt = ["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"].includes(currentUser?.role);
  const isSuperAdminOrMgmtOnly = ["SUPERADMIN", "MANAGEMENT"].includes(currentUser?.role);
  const isSpvOrSuperAdmin = ["SUPERADMIN", "SUPERVISOR"].includes(currentUser?.role);

  // Weather data mapping
  const hubWeatherWidget = hubWeatherRes?.weather_widget || hubWeatherRes;
  const zoneWeatherWidget = zoneWeatherRes?.weather_widget;

  return (
    <AppLayout title="Manajemen Zona, POI & Cuaca" subtitle="Geofence Spatial, Overpass POI & Open-Meteo Weather">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title="Spatial Zone & Environmental Integration"
            description="Kelola zona spasial PostGIS, integrasi POI Overpass API, dan area terlarang operasional jalan protokol."
          />

          <div className="flex items-center gap-2">
            {isSpvOrSuperAdmin && (
              <Button
                onClick={() => syncWeatherMutation.mutate()}
                disabled={syncWeatherMutation.isPending}
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {syncWeatherMutation.isPending ? "Syncing Open-Meteo..." : "Sync Weather"}
              </Button>
            )}

            {isSuperAdmin && (
              <Button
                onClick={() => syncOverpassMutation.mutate()}
                disabled={syncOverpassMutation.isPending}
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
              >
                <Building2 className="w-3.5 h-3.5" />
                {syncOverpassMutation.isPending ? "Syncing Overpass..." : "Sync Overpass POI"}
              </Button>
            )}

            {activeTab === "zones" && !isDrawingMode && isSuperAdminOrMgmt && (
              <Button onClick={handleStartDrawing} variant="primary" size="sm" className="text-xs shrink-0">
                <MousePointerClick className="w-4 h-4" /> Gambar Poligon Zona Baru
              </Button>
            )}

            {activeTab === "zones" && isDrawingMode && (
              <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-2xl shadow-lg border border-slate-800">
                <span className="text-xs font-bold text-emerald-400">
                  Mode Gambar ({drawnPoints.length} titik)
                </span>
                <Button
                  onClick={() => setDrawnPoints((p) => p.slice(0, -1))}
                  disabled={drawnPoints.length === 0}
                  variant="outline"
                  size="sm"
                  className="text-xs text-white border-slate-700 hover:bg-slate-800 py-1 px-2.5"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo
                </Button>
                <Button
                  onClick={handleCancelDrawing}
                  variant="outline"
                  size="sm"
                  className="text-xs text-rose-300 border-rose-900/50 hover:bg-rose-950 py-1 px-2.5"
                >
                  <X className="w-3.5 h-3.5" /> Batal
                </Button>
                <Button
                  onClick={handleFinishDrawing}
                  disabled={drawnPoints.length < 3}
                  variant="primary"
                  size="sm"
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 py-1 px-3"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Selesai ({drawnPoints.length})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hub Weather Overview Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <CloudSun className="w-8 h-8" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span>Cuaca Operasional Hub (Open-Meteo API)</span>
                  {hubCityName && <span className="bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">Hub: {hubCityName}</span>}
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl font-black text-white">
                    {hubWeatherWidget?.condition || hubWeatherWidget?.weather_desc || "Cerah / Berawan"}
                  </span>
                  <span className="text-xl font-bold text-red-400">
                    {hubWeatherWidget?.temperature || hubWeatherWidget?.temperature_c || "30"}°C
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Timestamp Konteks: {hubWeatherRes?.forecast_time || hubWeatherRes?.timestamp || new Date().toLocaleTimeString("id-ID")}
                </p>
              </div>
            </div>

            {/* Prominent C4 Primary Metric vs Supporting Operational Parameters */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
              <div className="pr-3 border-r border-slate-800 space-y-0.5">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Umbrella className="w-3.5 h-3.5" /> Primary Metric C4
                </div>
                <p className="font-extrabold text-white text-base">
                  Peluang Hujan:{" "}
                  <span className="text-amber-400">
                    {hubWeatherWidget?.max_rain_probability_percent ?? hubWeatherWidget?.precipitation_probability ?? 0}%
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 text-slate-300 text-[11px]">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Curah Hujan: {hubWeatherWidget?.rain_mm ?? hubWeatherWidget?.precipitation ?? 0} mm</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-slate-400" />
                  <span>Angin: {hubWeatherWidget?.wind_speed_kmh ?? hubWeatherWidget?.wind_speed ?? 0} km/h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span>Kelembapan: {hubWeatherWidget?.humidity_percent ?? hubWeatherWidget?.humidity ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("zones")}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all ${
              activeTab === "zones"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Peta Spasial Zona & Layer POI
          </button>
          {isSpvOrSuperAdmin && (
            <button
              onClick={() => setActiveTab("pending-pois")}
              className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "pending-pois"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Verifikasi Pending POI (Overpass)
              {pendingPoisList.length > 0 && (
                <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  {pendingPoisList.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab Content 1: Zones & Spatial Map */}
        {activeTab === "zones" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-bold text-slate-900">Peta Spasial Operasional</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-slate-500">
                      {loadingAreaPois ? "Memuatkan POI..." : `POI Tersedia: ${operationalPoisList.length}`}
                    </span>
                    <button
                      onClick={() => refetchAreaPois()}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Reload POI Data"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Map Container */}
                {loadingConfig ? (
                  <div className="h-[460px] w-full rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Memuat Konfigurasi Spasial Hub...</h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                        Mengunduh koordinat hub operasional & batas wilayah spasial dari backend...
                      </p>
                    </div>
                  </div>
                ) : isConfigError ? (
                  <div className="h-[460px] w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-800">Gagal Memuat Konfigurasi Spasial Backend</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {configError?.response?.data?.msg || "Konfigurasi hub operasional tidak tersedia di backend."}
                    </p>
                  </div>
                ) : mapError ? (
                  <div className="h-[460px] w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-800">Gagal Memuat Peta Leaflet</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Terjadi masalah saat inisialisasi peta spasial.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      ref={mapContainerRef}
                      style={{ height: "460px", width: "100%", zIndex: 1 }}
                      className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner"
                    />

                    {/* Compact Popover Layer Control Overlay (Top Right) */}
                    <div className="absolute top-3 right-3 z-20 flex flex-col items-end">
                      <button
                        onClick={() => setShowLayerPanel(!showLayerPanel)}
                        className="px-3 py-2 bg-white/95 backdrop-blur-xs text-slate-800 rounded-2xl border border-slate-300 shadow-md font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-red-600" />
                        <span>Layers</span>
                        {showLayerPanel ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {showLayerPanel && (
                        <div className="mt-2 w-72 bg-white/95 backdrop-blur-xs p-4 rounded-3xl border border-slate-200 shadow-2xl space-y-3 text-xs font-semibold">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-red-600" /> Map Layers & Restriksi
                            </span>
                            <button
                              onClick={() => setShowLayerPanel(false)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Master Layer Switches */}
                          <div className="space-y-1.5">
                            <label className="flex items-center justify-between p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                              <span className="flex items-center gap-2 text-slate-800">
                                <Layers className="w-3.5 h-3.5 text-emerald-600" /> Zones
                              </span>
                              <input
                                type="checkbox"
                                checked={mapLayers.zones}
                                onChange={() => toggleMasterLayer("zones")}
                                className="rounded text-red-600 focus:ring-red-500"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                              <span className="flex items-center gap-2 text-slate-800">
                                <Navigation className="w-3.5 h-3.5 text-red-600" /> Hub HQ
                              </span>
                              <input
                                type="checkbox"
                                checked={mapLayers.hub}
                                onChange={() => toggleMasterLayer("hub")}
                                className="rounded text-red-600 focus:ring-red-500"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                              <span className="flex items-center gap-2 text-slate-800">
                                <Users className="w-3.5 h-3.5 text-blue-600" /> Riders
                              </span>
                              <input
                                type="checkbox"
                                checked={mapLayers.riders}
                                onChange={() => toggleMasterLayer("riders")}
                                className="rounded text-red-600 focus:ring-red-500"
                              />
                            </label>

                            {/* Jalan Protokol Layer (Area Terlarang Operasional) */}
                            <label className="flex items-center justify-between p-2 bg-rose-50/70 border border-rose-200/60 rounded-xl cursor-pointer hover:bg-rose-100/70">
                              <span className="flex items-center gap-2 text-rose-900 font-bold">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Jalan Protokol
                              </span>
                              <input
                                type="checkbox"
                                checked={mapLayers.roads}
                                onChange={() => toggleMasterLayer("roads")}
                                className="rounded text-red-600 focus:ring-red-500"
                              />
                            </label>

                            {/* Jalan Tol Layer (Area Terlarang Operasional) */}
                            <label className="flex items-center justify-between p-2 bg-red-950/10 border border-red-900/30 rounded-xl cursor-pointer hover:bg-red-900/20">
                              <span className="flex items-center gap-2 text-red-950 font-bold">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-900" /> Jalan Tol
                              </span>
                              <input
                                type="checkbox"
                                checked={mapLayers.tollRoads}
                                onChange={() => toggleMasterLayer("tollRoads")}
                                className="rounded text-red-700 focus:ring-red-600"
                              />
                            </label>

                            {/* POI Master & Category Sub-dropdown */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden">
                              <div className="p-2 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-slate-800">
                                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> POI Master
                                </span>
                                <div className="flex items-center gap-2">
                                  {mapLayers.poiMaster && (
                                    <button
                                      onClick={() => setShowPoiCategoryDropdown(!showPoiCategoryDropdown)}
                                      className="text-[10px] text-red-600 font-bold hover:underline flex items-center gap-0.5"
                                    >
                                      {showPoiCategoryDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      Sub Filter
                                    </button>
                                  )}
                                  <input
                                    type="checkbox"
                                    checked={mapLayers.poiMaster}
                                    onChange={() => toggleMasterLayer("poiMaster")}
                                    className="rounded text-red-600 focus:ring-red-500"
                                  />
                                </div>
                              </div>

                              {/* Collapsible Category List + Visual Legend */}
                              {mapLayers.poiMaster && showPoiCategoryDropdown && (
                                <div className="p-2.5 bg-white border-t border-slate-200 space-y-2 text-[11px]">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-slate-600">Legend & Filter Kategori</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => toggleAllPoiCategories(true)}
                                        className="text-red-600 font-bold hover:underline"
                                      >
                                        Select All
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        onClick={() => toggleAllPoiCategories(false)}
                                        className="text-slate-500 hover:underline"
                                      >
                                        Reset
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                                    {Object.values(POI_CATEGORY_CONFIG).map((cat) => {
                                      const IconComp = CATEGORY_ICON_MAP[cat.key] || MapPin;
                                      return (
                                        <label
                                          key={cat.key}
                                          className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                                        >
                                          <span className="flex items-center gap-1.5 text-slate-700">
                                            <IconComp
                                              className="w-3.5 h-3.5"
                                              style={{ color: cat.color }}
                                            />
                                            <span>{cat.label}</span>
                                          </span>
                                          <input
                                            type="checkbox"
                                            checked={mapLayers.poiCategories[cat.key] !== false}
                                            onChange={() => togglePoiCategory(cat.key)}
                                            className="rounded text-red-600 focus:ring-red-500"
                                          />
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Zone Panel & Selected Zone Details */}
            <div className="space-y-4">
              {/* Search & Filter Controls */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs font-semibold">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari zona..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                  <button
                    onClick={() => refetchZones()}
                    title="Refresh Data Zona"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Selected Zone Card & Environmental Metrics */}
              {selectedZone && (
                <div className="bg-white p-5 rounded-3xl border-2 border-red-500/30 shadow-md space-y-4 relative">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Zona Terpilih</span>
                      <h4 className="text-base font-bold text-slate-900">{selectedZone.name}</h4>
                    </div>
                    <button onClick={() => setSelectedZone(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* SPK Environmental Evaluation Panel (C1, C2, C4) */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-red-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Metrik Evaluasi SPK Zona
                      </span>
                      <span className="text-[10px] text-slate-400">Backend PostGIS</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-slate-800/80 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">C1 Densitas POI</span>
                        <span className="font-black text-white text-sm">
                          {c1c2Res?.c1_density ?? c1c2Res?.poi_density ?? 0}
                        </span>
                        <span className="text-[9px] text-slate-400 block">POI / km²</span>
                      </div>

                      <div className="p-2 bg-slate-800/80 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">C2 Diversitas</span>
                        <span className="font-black text-white text-sm">
                          {c1c2Res?.c2_diversity ?? c1c2Res?.poi_diversity ?? 0}
                        </span>
                        <span className="text-[9px] text-slate-400 block">Indeks Variasi</span>
                      </div>

                      <div className="p-2 bg-amber-950/50 border border-amber-500/40 rounded-xl">
                        <span className="text-[10px] text-amber-400 font-bold block">C4 Peluang Hujan</span>
                        <span className="font-black text-amber-400 text-sm">
                          {zoneWeatherWidget?.max_rain_probability_percent ?? zoneWeatherRes?.max_precipitation_probability ?? 0}%
                        </span>
                        <span className="text-[9px] text-amber-300 block">Parameter Utama</span>
                      </div>
                    </div>

                    {/* Operational Supporting Weather Info */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Suhu: {zoneWeatherWidget?.temperature_c || 0}°C</span>
                      <span>Hujan: {zoneWeatherWidget?.rain_mm || 0} mm</span>
                      <span>Angin: {zoneWeatherWidget?.wind_speed_kmh || 0} km/h</span>
                    </div>

                    {/* Spatial Compliance & Invalidation Card */}
                    {selectedZone.status === "RESTRICTED" && (
                      <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-1 text-xs text-rose-200 mt-2">
                        <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Restriksi Spasial Terdeteksi (RESTRICTED)</span>
                        </div>
                        <p className="text-rose-200 text-[11px]">
                          {selectedZone.invalid_reason?.code === "ZONE_INTERSECTS_TOLL_ROAD"
                            ? "Zona beririsan dengan Jalan Tol. Penegakan aturan: BLOCKING."
                            : "Zona beririsan dengan Jalan Protokol. Penegakan aturan: BLOCKING."}
                        </p>
                        {selectedZone.invalid_reason?.intersected_roads && (
                          <div className="text-[10px] text-rose-300 font-mono pt-1">
                            Restriksi: {selectedZone.invalid_reason.intersected_roads.map((r) => r.name || r.external_id).join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                    {isSuperAdminOrMgmt && (
                      <>
                        <button
                          onClick={() => openEditZoneModal(selectedZone)}
                          title="Edit Zona"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setNewStatus(selectedZone.status);
                            setShowStatusModal(true);
                          }}
                          title="Ubah Status"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                        >
                          <Power className="w-3.5 h-3.5" /> Status
                        </button>
                        <button
                          onClick={() => {
                            setNewCapacity(selectedZone.max_capacity);
                            setShowCapacityModal(true);
                          }}
                          title="Ubah Kapasitas"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" /> Kapasitas
                        </button>
                      </>
                    )}
                    {isSuperAdminOrMgmtOnly && (
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        title="Hapus Zona"
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Zone List Items */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
                  <span>Daftar Zona Operasional ({filteredZones.length})</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-6 text-center text-slate-400 text-xs">Memuat data zona operasional...</div>
                  ) : isError ? (
                    <div className="p-6 text-center text-red-500 text-xs font-bold">
                      {error?.response?.data?.msg || "Gagal memuat data zona."}
                    </div>
                  ) : filteredZones.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold">Tidak ada zona operasional yang ditemukan.</p>
                    </div>
                  ) : (
                    filteredZones.map((z) => {
                      const isSelected = selectedZone?.id === z.id;
                      return (
                        <div
                          key={z.id}
                          onClick={() => handleSelectZoneFromList(z)}
                          className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                            isSelected ? "bg-red-50/70 border-l-4 border-red-600" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="space-y-0.5 overflow-hidden pr-2">
                            <h5 className="font-bold text-slate-900 truncate">{z.name}</h5>
                            <p className="text-slate-400 text-[11px] truncate">
                              {z.description || "Tanpa deskripsi"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge
                              variant={
                                z.status === "ACTIVE"
                                  ? "success"
                                  : z.status === "RESTRICTED"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {z.status}
                            </StatusBadge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Pending POI Approval Workflow */}
        {activeTab === "pending-pois" && isSpvOrSuperAdmin && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">Verifikasi Pending POI Baru (Overpass Sync)</h4>
                <p className="text-xs text-slate-500">
                  Tinjau dan setujui POI terdeteksi sebelum dimasukkan ke dalam perhitungan kriteria SPK (C1/C2).
                </p>
              </div>
              <span className="bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full">
                {pendingPoisList.length} Item Menunggu
              </span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-4">Nama POI</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Koordinat (Lat, Lng)</th>
                  <th className="p-4">Sumber</th>
                  <th className="p-4 text-center">Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loadingPendingPois ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Memuat data pending POI...
                    </td>
                  </tr>
                ) : pendingPoisList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Tidak ada POI baru yang membutuhkan persetujuan.
                    </td>
                  </tr>
                ) : (
                  pendingPoisList.map((poi) => (
                    <tr key={poi.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{poi.name || poi.osm_id || "POI Terdeteksi"}</td>
                      <td className="p-4 text-slate-600 font-semibold">{poi.category_name || poi.category || "Umum"}</td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {Number(poi.latitude).toFixed(5)}, {Number(poi.longitude).toFixed(5)}
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">{poi.source || "OVERPASS_API"}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => approvePoiMutation.mutate({ poi_id: poi.id, status: "APPROVED" })}
                            disabled={approvePoiMutation.isPending}
                            className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Setujui
                          </button>
                          <button
                            onClick={() => approvePoiMutation.mutate({ poi_id: poi.id, status: "REJECTED" })}
                            disabled={approvePoiMutation.isPending}
                            className="px-3 py-1.5 bg-red-50 border border-red-300 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1 text-xs"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Create Zone */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Tambah Zona Operasional Baru</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {overlapError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Restriksi Area / Overlap Zona:</p>
                    <p className="font-normal text-[11px] mt-0.5">{overlapError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setIsDrawingMode(true);
                      }}
                      className="mt-2 px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold text-[10px] hover:bg-red-700"
                    >
                      Gambar Ulang Poligon di Peta
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Nama Zona</label>
                  <input
                    {...registerCreate("name")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Zona Pusat Keramaian"
                  />
                  {createErrors.name && <p className="text-red-500 mt-1">{createErrors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Deskripsi Area</label>
                  <textarea
                    {...registerCreate("description")}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Maksimal Kapasitas Rider (Kuota)</label>
                  <input
                    type="number"
                    {...registerCreate("max_capacity")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {createErrors.max_capacity && (
                    <p className="text-red-500 mt-1">{createErrors.max_capacity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Status Operasional</label>
                  <select
                    {...registerCreate("status")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Poligon GeoJSON ({drawnPoints.length} titik sudut) telah siap diunggah.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" onClick={() => setShowCreateModal(false)} variant="outline" size="sm">
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmittingCreate} size="sm">
                    {isSubmittingCreate ? "Memproses PostGIS..." : "Simpan Zona"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Zone */}
        {showEditModal && editingZone && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Edit Data Zona Operasional</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {overlapError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Restriksi Area / Overlap Zona:</p>
                    <p className="font-normal text-[11px] mt-0.5">{overlapError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setIsDrawingMode(true);
                      }}
                      className="mt-2 px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold text-[10px] hover:bg-red-700"
                    >
                      Ubah Gambar Poligon di Peta
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Nama Zona</label>
                  <input
                    {...registerEdit("name")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {editErrors.name && <p className="text-red-500 mt-1">{editErrors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Deskripsi Area</label>
                  <textarea
                    {...registerEdit("description")}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Maksimal Kapasitas Rider (Kuota)</label>
                  <input
                    type="number"
                    {...registerEdit("max_capacity")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {editErrors.max_capacity && (
                    <p className="text-red-500 mt-1">{editErrors.max_capacity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Status Operasional</label>
                  <select
                    {...registerEdit("status")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">Ingin mengubah batas poligon geofence?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setIsDrawingMode(true);
                    }}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Gambar Ulang Poligon
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" onClick={() => setShowEditModal(false)} variant="outline" size="sm">
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmittingEdit} size="sm">
                    {isSubmittingEdit ? "Memproses..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Quick Change Status */}
        {showStatusModal && selectedZone && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Power className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ubah Status Zona</h3>
              <p className="text-xs text-slate-500">
                Pilih status baru untuk zona <span className="font-bold text-slate-900">{selectedZone.name}</span>:
              </p>

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-800"
              >
                <option value="ACTIVE">ACTIVE (Aktif Operasional)</option>
                <option value="RESTRICTED">RESTRICTED (Dibatasi)</option>
                <option value="INACTIVE">INACTIVE (Nonaktif)</option>
              </select>

              <div className="flex items-center justify-center gap-2 pt-2">
                <Button onClick={() => setShowStatusModal(false)} variant="outline" size="sm">
                  Batal
                </Button>
                <Button
                  onClick={() => updateStatusMutation.mutate({ id: selectedZone.id, status: newStatus })}
                  variant="primary"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Simpan..." : "Perbarui Status"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Quick Change Capacity */}
        {showCapacityModal && selectedZone && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ubah Kapasitas Maksimum</h3>
              <p className="text-xs text-slate-500">
                Atur kuota jumlah maksimum Rider untuk zona <span className="font-bold text-slate-900">{selectedZone.name}</span>:
              </p>

              <input
                type="number"
                min={1}
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-800 text-center"
              />

              <div className="flex items-center justify-center gap-2 pt-2">
                <Button onClick={() => setShowCapacityModal(false)} variant="outline" size="sm">
                  Batal
                </Button>
                <Button
                  onClick={() => updateCapacityMutation.mutate({ id: selectedZone.id, max_capacity: newCapacity })}
                  variant="primary"
                  size="sm"
                  disabled={updateCapacityMutation.isPending}
                >
                  {updateCapacityMutation.isPending ? "Simpan..." : "Perbarui Kapasitas"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete Zone */}
        {showDeleteModal && selectedZone && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-slate-200 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hapus Zona Operasional?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus zona <span className="font-bold text-slate-900">{selectedZone.name}</span>? Batas poligon geofence di PostGIS akan dihapus secara permanen.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button onClick={() => setShowDeleteModal(false)} variant="outline" size="sm">
                  Batal
                </Button>
                <Button
                  onClick={() => deleteZoneMutation.mutate(selectedZone.id)}
                  variant="danger"
                  size="sm"
                  disabled={deleteZoneMutation.isPending}
                >
                  {deleteZoneMutation.isPending ? "Menghapus..." : "Ya, Hapus Zona"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
