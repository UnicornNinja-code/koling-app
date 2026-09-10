import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext.jsx";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { LeafletMapCanvas } from "../../components/map/LeafletMapCanvas.jsx";
import { MapLegendPanel } from "../../components/map/MapLegendPanel.jsx";
import { MapRightLayerSidebar } from "../../components/map/MapRightLayerSidebar.jsx";
import { MapWeatherPanel } from "../../components/map/MapWeatherPanel.jsx";
import { OperationalDetailPanel } from "../../components/map/OperationalDetailPanel.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ErrorBoundary } from "../../components/common/ErrorBoundary.jsx";

// Single-Tenant Services SSOT
import { zoneService } from "../../services/zoneService.js";
import { roadService } from "../../services/roadService.js";
import { weatherService } from "../../services/weatherService.js";
import { dssService } from "../../services/dssService.js";
import { poiService } from "../../services/poiService.js";

import {
  MapPin,
  Plus,
  Trash2,
  Edit,
  Search,
  Users,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Layers,
} from "lucide-react";

// Sidoarjo Geofence Presets
const SIDOARJO_ZONE_PRESETS = [
  {
    name: "Zona Alun-Alun Sidoarjo",
    description: "Pusat keramaian publik Alun-Alun & Masjid Agung Sidoarjo",
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [112.7160, -7.4465],
          [112.7210, -7.4465],
          [112.7210, -7.4505],
          [112.7160, -7.4505],
          [112.7160, -7.4465],
        ],
      ],
    },
  },
  {
    name: "Zona GOR Gelora Delta",
    description: "Kawasan olahraga, car free day & sentra kuliner Gelora Delta",
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [112.7050, -7.4480],
          [112.7120, -7.4480],
          [112.7120, -7.4540],
          [112.7050, -7.4540],
          [112.7050, -7.4480],
        ],
      ],
    },
  },
  {
    name: "Zona Stasiun Sidoarjo",
    description: "Hub komuter transit & area ruko komersial Jl. Gajah Mada",
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [112.7180, -7.4510],
          [112.7240, -7.4510],
          [112.7240, -7.4560],
          [112.7180, -7.4560],
          [112.7180, -7.4510],
        ],
      ],
    },
  },
  {
    name: "Zona Pasar Larangan",
    description: "Sentra perdagangan pagi & malam Pasar Larangan Sidoarjo",
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [112.7100, -7.4600],
          [112.7160, -7.4600],
          [112.7160, -7.4650],
          [112.7100, -7.4650],
          [112.7100, -7.4600],
        ],
      ],
    },
  },
];

// Form Schema Validation via Zod
const zoneFormSchema = z.object({
  name: z.string().min(3, "Nama zona minimal 3 karakter"),
  description: z.string().optional(),
  max_capacity: z.coerce.number().min(1, "Kapasitas minimal 1 rider"),
  status: z.enum(["ACTIVE", "RESTRICTED", "INACTIVE"]),
  polygonText: z.string().min(10, "Polygon GeoJSON wajib diisi"),
});

export function ZoneManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mapRef = useRef(null);

  // Selection & UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);

  // Pre-validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const [layers, setLayers] = useState({
    zones: true,
    riders: false,
    fleet: false,
    dss: true,
    protocolRoads: true,
    weather: true,
    pois: false,
  });

  const handleToggleLayer = (layerId) => {
    setLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  // 1. Fetch Zones SSOT
  const { data: zonesRes, isLoading: isZonesLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneService.getZones,
    staleTime: 60000,
  });
  const rawZones = zonesRes?.zones || zonesRes?.data || [];

  // 2. Fetch Protocol Roads
  const { data: protocolRoadsRes } = useQuery({
    queryKey: ["roads", "protocol"],
    queryFn: roadService.getProtocolRoads,
    staleTime: 300000,
  });
  const protocolRoads = protocolRoadsRes?.data || protocolRoadsRes;

  // 3. Fetch Operational Weather
  const { data: weatherRes, isLoading: isWeatherLoading } = useQuery({
    queryKey: ["weather", "hub", "Sidoarjo"],
    queryFn: () => weatherService.getHubWeatherInfo("Sidoarjo"),
    staleTime: 60000,
  });
  const weatherData = weatherRes?.data || weatherRes;

  // 4. Fetch DSS TOPSIS Zone Recommendations SSOT
  const { data: dssRecsRes } = useQuery({
    queryKey: ["dss", "recommendations"],
    queryFn: dssService.getTopsisRecommendations,
    staleTime: 60000,
  });
  const dssRecommendations = dssRecsRes?.data?.recommendations || dssRecsRes?.recommendations || [];

  // Merge DSS Recommendations into zones
  const enhancedZones = (rawZones || []).map((z, idx) => {
    const dssMatch = dssRecommendations.find((d) => d.zone_id === z.id || d.id === z.id);
    return {
      ...z,
      topsis_rank: dssMatch?.rank ?? dssMatch?.topsis_rank ?? z.topsis_rank ?? idx + 1,
      preference_score: dssMatch?.preference_score ?? dssMatch?.score ?? z.preference_score,
      total_poi: z.total_poi ?? z.total_pois ?? "N/A",
    };
  });

  // Filtered Zones List
  const filteredZones = enhancedZones.filter((z) => {
    const matchSearch =
      (z.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (z.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "ALL") return matchSearch;
    return matchSearch && (z.status || "ACTIVE") === statusFilter;
  });

  // Form Management
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      name: "",
      description: "",
      max_capacity: 4,
      status: "ACTIVE",
      polygonText: JSON.stringify(SIDOARJO_ZONE_PRESETS[0].polygon, null, 2),
    },
  });

  const currentPolygonText = watch("polygonText");

  // Create Zone Mutation
  const createZoneMutation = useMutation({
    mutationFn: zoneService.createZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      setIsModalOpen(false);
      reset();
      setValidationResult(null);
      setNotification({ type: "success", text: "Zona operasional baru berhasil dibuat dengan validasi PostGIS!" });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err) => {
      setNotification({
        type: "error",
        text: `Gagal membuat zona: ${err.response?.data?.msg || err.message}`,
      });
      setTimeout(() => setNotification(null), 6000);
    },
  });

  // Update Zone Mutation
  const updateZoneMutation = useMutation({
    mutationFn: ({ id, data }) => zoneService.updateZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      setIsModalOpen(false);
      setEditingZone(null);
      reset();
      setValidationResult(null);
      setNotification({ type: "success", text: "Zona operasional berhasil diperbarui!" });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err) => {
      setNotification({
        type: "error",
        text: `Gagal memperbarui zona: ${err.response?.data?.msg || err.message}`,
      });
      setTimeout(() => setNotification(null), 6000);
    },
  });

  // Delete Zone Mutation
  const deleteZoneMutation = useMutation({
    mutationFn: zoneService.deleteZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      setSelectedZone(null);
      setNotification({ type: "success", text: "Zona berhasil dihapus dari sistem." });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err) => {
      setNotification({
        type: "error",
        text: `Gagal menghapus zona: ${err.response?.data?.msg || err.message}`,
      });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  // Dry-run Pre-Validation Handler
  const handlePreValidate = async () => {
    try {
      setIsValidating(true);
      setValidationResult(null);
      let parsedPoly;
      try {
        parsedPoly = JSON.parse(currentPolygonText);
      } catch (e) {
        setValidationResult({
          valid: false,
          errors: ["Format teks polygon bukan JSON yang valid."],
        });
        return;
      }

      const res = await zoneService.validatePolygon({
        polygon: parsedPoly,
        name: watch("name"),
        excludeId: editingZone?.id || null,
      });

      setValidationResult(res);
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [err.response?.data?.msg || err.message || "Gagal memvalidasi polygon"],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingZone(null);
    reset({
      name: "",
      description: "",
      max_capacity: 4,
      status: "ACTIVE",
      polygonText: JSON.stringify(SIDOARJO_ZONE_PRESETS[0].polygon, null, 2),
    });
    setValidationResult(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (zone) => {
    setEditingZone(zone);
    const polyString =
      typeof zone.polygon === "string"
        ? zone.polygon
        : JSON.stringify(zone.polygon || zone.geojson || zone.geometry, null, 2);

    reset({
      name: zone.name,
      description: zone.description || "",
      max_capacity: zone.max_capacity || 4,
      status: zone.status || "ACTIVE",
      polygonText: polyString || "",
    });
    setValidationResult(null);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset) => {
    setValue("name", preset.name);
    setValue("description", preset.description);
    setValue("polygonText", JSON.stringify(preset.polygon, null, 2));
    setValidationResult(null);
  };

  const onSubmit = (data) => {
    let parsedPoly;
    try {
      parsedPoly = JSON.parse(data.polygonText);
    } catch (e) {
      setValidationResult({ valid: false, errors: ["Format JSON polygon tidak valid."] });
      return;
    }

    const payload = {
      name: data.name,
      description: data.description || "",
      max_capacity: Number(data.max_capacity),
      status: data.status,
      polygon: parsedPoly,
    };

    if (editingZone) {
      updateZoneMutation.mutate({ id: editingZone.id, data: payload });
    } else {
      createZoneMutation.mutate(payload);
    }
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    if (mapRef.current && zone) {
      let geojson = zone.polygon || zone.geojson || zone.geometry;
      if (typeof geojson === "string") {
        try {
          geojson = JSON.parse(geojson);
        } catch (e) {}
      }
      if (geojson?.coordinates?.[0]?.[0]) {
        const firstPoint = geojson.coordinates[0][0];
        // [lng, lat] to [lat, lng]
        mapRef.current.flyTo([firstPoint[1], firstPoint[0]], 15, { animate: true, duration: 1 });
      }
    }
  };

  return (
    <AppLayout
      fullBleed
      title="Operational Zone Management"
      subtitle="Pengaturan wilayah geofence, kapasitas armada, dan audit spasial PostGIS"
    >
      <div className="relative w-full h-full overflow-hidden bg-[#FAFAFA] dark:bg-[#0B0F17] isolate select-none font-sans">
        {/* In-app Notification Banner */}
        {notification && (
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-[8px] border text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
              notification.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* 1. Primary GIS Canvas with Local Error Boundary */}
        <ErrorBoundary mode="widget" name="ZoneLeafletMapCanvas">
          <LeafletMapCanvas
            zones={enhancedZones}
            riders={[]}
            armadas={[]}
            pois={[]}
            protocolRoads={protocolRoads}
            layers={layers}
            selectedItem={selectedZone}
            onSelectItem={(item) => handleSelectZone(item)}
            mapRef={mapRef}
          />
        </ErrorBoundary>

        {/* 2. Floating Collapsible Zone List (Top-Left) */}
        <div className="absolute top-3 left-3 z-30 pointer-events-auto">
          {isListCollapsed ? (
            <button
              type="button"
              onClick={() => setIsListCollapsed(false)}
              title="Buka Daftar Zona"
              className="w-10 h-10 rounded-[10px] bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#263244] shadow-lg flex items-center justify-center text-[#111111] dark:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B] transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full sm:w-[330px] max-h-[calc(100vh-80px)] flex flex-col rounded-[12px] bg-white/95 dark:bg-[#131822]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#263244] shadow-xl overflow-hidden select-none transition-colors">
              {/* Header & Add Button */}
              <div className="p-3 border-b border-[#E5E5E5] dark:border-[#263244] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-heading font-bold text-[#111111] dark:text-[#FAFAFA] uppercase tracking-wider">
                      Wilayah Geofence
                    </h2>
                    <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/60 px-1.5 py-0.2 rounded-full">
                      {enhancedZones.length} Zona
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {user?.role === "SUPERADMIN" && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleOpenCreateModal}
                        leftIcon={Plus}
                      >
                        Tambah
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsListCollapsed(true)}
                      title="Sembunyikan Panel"
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[#737373] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B] transition-colors cursor-pointer ml-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
                  <input
                    type="text"
                    placeholder="Cari zona operasional..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-7.5 pl-8 pr-3 text-[11px] bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[#111111] dark:text-[#FAFAFA] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {["ALL", "ACTIVE", "RESTRICTED", "INACTIVE"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2 py-0.5 text-[9px] font-semibold rounded-[4px] transition-colors whitespace-nowrap cursor-pointer ${
                        statusFilter === st
                          ? "bg-[#2563EB] text-white font-bold"
                          : "bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] text-[#737373] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Zones List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-[#263244] bg-white dark:bg-[#131822]">
                {filteredZones.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Tidak ada zona ditemukan
                  </div>
                ) : (
                  filteredZones.map((zone, idx) => {
                    const isSelected = selectedZone?.id === zone.id;

                    return (
                      <div
                        key={zone.id}
                        onClick={() => handleSelectZone(zone)}
                        className={`p-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-[#2563EB]"
                            : "hover:bg-[#FAFAFA] dark:hover:bg-[#1E293B]/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                              <h4 className="text-xs font-semibold text-[#111111] dark:text-[#FAFAFA] truncate">
                                {zone.name}
                              </h4>
                            </div>
                            <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                              Kapasitas: {zone.assigned_riders_count || 0} / {zone.max_capacity || 4} Riders
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <StatusBadge
                              variant={zone.status === "ACTIVE" ? "success" : "warning"}
                              size="sm"
                            >
                              {zone.status || "ACTIVE"}
                            </StatusBadge>
                            {user?.role === "SUPERADMIN" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(zone);
                                }}
                                className="p-1 rounded text-[#737373] hover:text-[#2563EB] hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B] cursor-pointer"
                                title="Edit Zona"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Docked Right Layer Sidebar */}
        <MapRightLayerSidebar
          layers={layers}
          onToggleLayer={handleToggleLayer}
          counts={{ zones: enhancedZones.length }}
        />

        {/* 4. Interactive Create / Edit Zone Modal with Polygon & PostGIS Pre-Validation */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] rounded-[12px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5E5] dark:border-[#263244]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-heading font-bold text-sm text-[#111111] dark:text-[#FAFAFA]">
                    {editingZone ? "Edit Zona Operasional" : "Tambah Zona Operasional Baru"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded text-[#737373] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E293B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#404040] dark:text-[#D4D4D4] mb-1">
                    Nama Zona Operasional *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Zona Alun-Alun Sidoarjo"
                    {...register("name")}
                    className="w-full h-8 px-3 text-xs bg-[#FAFAFA] dark:bg-[#0B0F17] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[#111111] dark:text-[#FAFAFA] focus:outline-none focus:border-[#2563EB]"
                  />
                  {errors.name && (
                    <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.name.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#404040] dark:text-[#D4D4D4] mb-1">
                    Deskripsi / Keterangan Area
                  </label>
                  <input
                    type="text"
                    placeholder="Keterangan titik keramaian, batas jalan, atau event..."
                    {...register("description")}
                    className="w-full h-8 px-3 text-xs bg-[#FAFAFA] dark:bg-[#0B0F17] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[#111111] dark:text-[#FAFAFA] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#404040] dark:text-[#D4D4D4] mb-1">
                      Kapasitas Armada Max *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      {...register("max_capacity")}
                      className="w-full h-8 px-3 text-xs bg-[#FAFAFA] dark:bg-[#0B0F17] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[#111111] dark:text-[#FAFAFA] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#404040] dark:text-[#D4D4D4] mb-1">
                      Status Operasional
                    </label>
                    <select
                      {...register("status")}
                      className="w-full h-8 px-2 text-xs bg-[#FAFAFA] dark:bg-[#0B0F17] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[#111111] dark:text-[#FAFAFA] focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="ACTIVE">ACTIVE (Aktif)</option>
                      <option value="RESTRICTED">RESTRICTED (Terbatas)</option>
                      <option value="INACTIVE">INACTIVE (Nonaktif)</option>
                    </select>
                  </div>
                </div>

                {/* Spatial Polygon Presets & GeoJSON Input */}
                <div className="space-y-1.5 pt-1 border-t border-[#E5E5E5] dark:border-[#263244]">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-[#404040] dark:text-[#D4D4D4] uppercase tracking-wider">
                      Geometri Poligon GeoJSON (PostGIS) *
                    </label>
                    <span className="text-[10px] text-[#737373]">EPSG:4326</span>
                  </div>

                  {/* Preset Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[10px] text-[#737373] shrink-0 font-medium">Preset Sidoarjo:</span>
                    {SIDOARJO_ZONE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2 py-0.5 text-[10px] font-medium bg-[#F5F5F5] dark:bg-[#1E293B] border border-[#E5E5E5] dark:border-[#334155] rounded-[4px] text-[#404040] dark:text-[#D4D4D4] hover:border-[#2563EB] hover:text-[#2563EB] whitespace-nowrap cursor-pointer transition-colors"
                      >
                        {preset.name.replace("Zona ", "")}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    {...register("polygonText")}
                    placeholder='{"type": "Polygon", "coordinates": [[[lng, lat], ...]]}'
                    className="w-full p-2.5 font-mono text-[11px] bg-[#FAFAFA] dark:bg-[#0B0F17] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[#111111] dark:text-[#FAFAFA] focus:outline-none focus:border-[#2563EB]"
                  />
                  {errors.polygonText && (
                    <span className="text-[10px] text-rose-500 block">{errors.polygonText.message}</span>
                  )}
                </div>

                {/* Live PostGIS Pre-Validation Action & Feedback Box */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePreValidate}
                      disabled={isValidating}
                      className="px-3 py-1 bg-[#F5F5F5] dark:bg-[#1E293B] border border-[#E5E5E5] dark:border-[#334155] hover:border-[#2563EB] text-[#404040] dark:text-[#D4D4D4] rounded-[6px] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{isValidating ? "Memvalidasi PostGIS..." : "Cek Validasi Spasial PostGIS"}</span>
                    </button>
                  </div>

                  {validationResult && (
                    <div
                      className={`p-2.5 rounded-[6px] border text-[11px] space-y-1 ${
                        validationResult.valid
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {validationResult.valid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Geometri Valid & Memenuhi Syarat PostGIS</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Geometri Ditolak oleh PostGIS</span>
                          </>
                        )}
                      </div>

                      {validationResult.metrics?.area_km2 !== undefined && (
                        <div className="text-[10px] opacity-90">
                          Luas Area: <strong>{Number(validationResult.metrics.area_km2).toFixed(3)} km²</strong>
                        </div>
                      )}

                      {validationResult.warnings && validationResult.warnings.length > 0 && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-300">
                          Peringatan: {validationResult.warnings.join("; ")}
                        </div>
                      )}

                      {validationResult.errors && validationResult.errors.length > 0 && (
                        <div className="text-[10px] font-medium text-rose-700 dark:text-rose-300">
                          Error: {validationResult.errors.join("; ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5] dark:border-[#263244]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingZone(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={createZoneMutation.isPending || updateZoneMutation.isPending}
                    isLoading={createZoneMutation.isPending || updateZoneMutation.isPending}
                  >
                    {editingZone ? "Perbarui Zona" : "Simpan Zona ke PostGIS"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ZoneManagementPage;
