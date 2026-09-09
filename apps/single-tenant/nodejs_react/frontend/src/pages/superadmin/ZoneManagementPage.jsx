import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext.jsx";
import { Sidebar } from "../../components/layout/Sidebar.jsx";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { LeafletMapCanvas } from "../../components/map/LeafletMapCanvas.jsx";
import { MapFloatingToolbar } from "../../components/map/MapFloatingToolbar.jsx";
import { MapLegendPanel } from "../../components/map/MapLegendPanel.jsx";
import { MapLayersPanel } from "../../components/map/MapLayersPanel.jsx";
import { MapWeatherPanel } from "../../components/map/MapWeatherPanel.jsx";
import { OperationalDetailPanel } from "../../components/map/OperationalDetailPanel.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";

// Single-Tenant Services SSOT
import { zoneService } from "../../services/zoneService.js";
import { poiService } from "../../services/poiService.js";
import { roadService } from "../../services/roadService.js";
import { weatherService } from "../../services/weatherService.js";
import { dssService } from "../../services/dssService.js";
import { queryKeys } from "../../lib/queryKeys.js";

import {
  MapPin,
  Plus,
  Trash2,
  Edit,
  Search,
  Users,
  Sparkles,
  Layers,
  Cloud,
  X,
  CheckCircle,
  Filter,
  Eye,
} from "lucide-react";

// Form Schema Validation via Zod
const zoneFormSchema = z.object({
  name: z.string().min(3, "Nama zona minimal 3 karakter"),
  description: z.string().optional(),
  max_capacity: z.coerce.number().min(1, "Kapasitas minimal 1 rider"),
  status: z.enum(["ACTIVE", "RESTRICTED", "INACTIVE"]),
});

/**
 * Zone Operations & Spatial Intelligence Workspace
 * Enterprise split-screen view: Left Zone List (340px) + Right GIS Spatial Canvas
 */
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
  const [selectedPoiCategory, setSelectedPoiCategory] = useState("ALL");

  const [layers, setLayers] = useState({
    zones: true,
    riders: false,
    fleet: false,
    dss: true,
    protocolRoads: true,
    weather: true,
    pois: false, // Default OFF
  });

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

  // 5. Fetch POIs (Loaded when POI layer enabled)
  const { data: poisRes } = useQuery({
    queryKey: ["pois", "operational-area"],
    queryFn: poiService.getOperationalAreaPois,
    enabled: layers.pois,
    staleTime: 300000,
  });
  const pois = poisRes?.pois || poisRes?.data || [];

  // 6. Fetch POI Categories for category filter
  const { data: poiCategoriesRes } = useQuery({
    queryKey: ["poi-categories", "crowd-scores"],
    queryFn: poiService.getCrowdScores,
    staleTime: 300000,
  });
  const poiCategories = poiCategoriesRes?.categories || poiCategoriesRes?.data || [];

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      name: "",
      description: "",
      max_capacity: 4,
      status: "ACTIVE",
    },
  });

  // Create Zone Mutation
  const createZoneMutation = useMutation({
    mutationFn: zoneService.createZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      setIsModalOpen(false);
      reset();
      alert("Zona operasional baru berhasil dibuat!");
    },
    onError: (err) => {
      alert(`Gagal membuat zona: ${err.response?.data?.msg || err.message}`);
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
      alert("Zona operasional berhasil diperbarui!");
    },
    onError: (err) => {
      alert(`Gagal memperbarui zona: ${err.response?.data?.msg || err.message}`);
    },
  });

  // Delete Zone Mutation
  const deleteZoneMutation = useMutation({
    mutationFn: zoneService.deleteZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      setSelectedZone(null);
      alert("Zona berhasil dihapus!");
    },
    onError: (err) => {
      alert(`Gagal menghapus zona: ${err.response?.data?.msg || err.message}`);
    },
  });

  const handleOpenEdit = (zone) => {
    setEditingZone(zone);
    setValue("name", zone.name);
    setValue("description", zone.description || "");
    setValue("max_capacity", zone.max_capacity || 4);
    setValue("status", zone.status || "ACTIVE");
    setIsModalOpen(true);
  };

  const onSubmit = (formData) => {
    if (editingZone) {
      updateZoneMutation.mutate({ id: editingZone.id, data: formData });
    } else {
      createZoneMutation.mutate(formData);
    }
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    if (mapRef.current) {
      const lat = Number(zone.center_lat || -7.4478);
      const lng = Number(zone.center_lng || 112.7183);
      mapRef.current.flyTo([lat, lng], 14, { animate: true, duration: 0.8 });
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA] font-sans antialiased select-none">
      {/* 1. App Shell Dark Rail (60px) */}
      <Sidebar />

      {/* 2. Main Viewport Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Topbar />

        {/* Workspace Body: Left Zone List (340px) + Right GIS Spatial Map */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Zone Column (340px) */}
          <div className="w-full md:w-[340px] bg-white border-r border-[#E5E5E5] flex flex-col h-full shrink-0 relative z-20 shadow-xs">
            {/* Header & Add Zone CTA */}
            <div className="p-3 border-b border-[#E5E5E5] bg-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[13px] font-bold text-[#111111] uppercase tracking-wider">
                    Zone Operations
                  </h2>
                  <p className="text-[11px] text-[#737373]">Geofence & TOPSIS Ranks ({rawZones.length})</p>
                </div>

                <span className="text-[10px] font-semibold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                  DSS Active
                </span>
              </div>

              {/* Add Zone CTA */}
              {(user?.role === "SUPERADMIN" || user?.role === "SUPERVISOR") && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingZone(null);
                    reset();
                    setIsModalOpen(true);
                  }}
                  className="w-full h-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Zona Geofence</span>
                </button>
              )}
            </div>

            {/* Filter Bar & Search */}
            <div className="p-2.5 border-b border-[#E5E5E5] bg-[#FAFAFA] space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                <input
                  type="text"
                  placeholder="Search zone name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] placeholder-[#737373] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {["ALL", "ACTIVE", "RESTRICTED", "INACTIVE"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? "bg-[#2563EB] text-white"
                        : "bg-white border border-[#E5E5E5] text-[#525252] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Zones List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F0F0F0]">
              {isZonesLoading ? (
                <div className="p-6 text-center text-[12px] text-[#737373]">Loading operational zones...</div>
              ) : filteredZones.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-[#737373]">
                  No zones matching current filter
                </div>
              ) : (
                filteredZones.map((zone) => {
                  const isSelected = selectedZone?.id === zone.id;

                  return (
                    <div
                      key={zone.id}
                      onClick={() => handleSelectZone(zone)}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#EFF6FF] border-l-2 border-[#2563EB]"
                          : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                            <h4 className="text-[13px] font-semibold text-[#111111] truncate">
                              {zone.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#525252] mt-1 truncate">
                            <span>Capacity: {zone.assigned_count || 0} / {zone.max_capacity || 4} Riders</span>
                            <span>•</span>
                            <span className="font-mono text-[#737373]">
                              V_i: {zone.preference_score !== undefined && zone.preference_score !== null ? Number(zone.preference_score).toFixed(4) : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1">
                          {/* DSS Rank Badge */}
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-[4px] text-[10px] font-semibold text-[#2563EB]">
                            <Sparkles className="w-3 h-3" />
                            <span>#{zone.topsis_rank}</span>
                          </div>

                          <div className="flex items-center gap-1 mt-0.5">
                            {(user?.role === "SUPERADMIN" || user?.role === "SUPERVISOR") && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(zone);
                                  }}
                                  className="text-[#737373] hover:text-[#2563EB] p-0.5 rounded-[2px]"
                                  title="Edit Zone"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                {user?.role === "SUPERADMIN" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Hapus zona operasional ${zone.name}?`)) {
                                        deleteZoneMutation.mutate(zone.id);
                                      }
                                    }}
                                    className="text-[#737373] hover:text-[#DC2626] p-0.5 rounded-[2px]"
                                    title="Delete Zone"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right GIS Spatial Map (Remaining Viewport) */}
          <div className="flex-1 relative h-full w-full overflow-hidden bg-[#E5E5E5] isolate z-10">
            <LeafletMapCanvas
              zones={enhancedZones}
              pois={pois}
              protocolRoads={protocolRoads}
              layers={layers}
              selectedPoiCategory={selectedPoiCategory}
              selectedItem={selectedZone}
              onSelectItem={(item) => setSelectedZone(item)}
              mapRef={mapRef}
            />

            {/* Floating Controls */}
            <MapFloatingToolbar
              activePanel={activeFloatingPanel}
              onTogglePanel={(p) => setActiveFloatingPanel((prev) => (prev === p ? null : p))}
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onResetView={() => mapRef.current?.setView([-7.4478, 112.7183], 13)}
            />

            {/* Layer Control Panel */}
            {activeFloatingPanel === "layers" && (
              <MapLayersPanel
                layers={layers}
                onToggleLayer={(id) => setLayers((prev) => ({ ...prev, [id]: !prev[id] }))}
                poiCategories={poiCategories}
                selectedPoiCategory={selectedPoiCategory}
                onSelectPoiCategory={setSelectedPoiCategory}
                onClose={() => setActiveFloatingPanel(null)}
              />
            )}

            {/* Legend Panel */}
            {activeFloatingPanel === "legend" && (
              <MapLegendPanel onClose={() => setActiveFloatingPanel(null)} />
            )}

            {/* Weather Panel */}
            {activeFloatingPanel === "weather" && (
              <MapWeatherPanel
                weatherData={weatherData}
                isLoading={isWeatherLoading}
                onClose={() => setActiveFloatingPanel(null)}
              />
            )}

            {/* Operational Detail Panel */}
            {selectedZone && (
              <OperationalDetailPanel
                selectedItem={selectedZone}
                itemType="zone"
                onClose={() => setSelectedZone(null)}
                userRole={user?.role}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Zone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#E5E5E5] shadow-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB]" />
                {editingZone ? "Edit Zona Operasional" : "Tambah Zona Geofence Baru"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingZone(null);
                }}
                className="text-[#737373] hover:text-[#111111] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] mb-1">
                  Nama Zona Operasional *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Alun-Alun Sidoarjo"
                  {...register("name")}
                  className="w-full h-8 px-3 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#2563EB]"
                />
                {errors.name && (
                  <span className="text-[10px] text-[#DC2626] mt-0.5 block">{errors.name.message}</span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#525252] mb-1">
                  Deskripsi / Keterangan Area
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan titik keramaian, batas jalan, atau event..."
                  {...register("description")}
                  className="w-full p-2 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#525252] mb-1">
                    Kapasitas Rider Max *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    {...register("max_capacity")}
                    className="w-full h-8 px-3 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#2563EB]"
                  />
                  {errors.max_capacity && (
                    <span className="text-[10px] text-[#DC2626] mt-0.5 block">{errors.max_capacity.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#525252] mb-1">
                    Status Operasional
                  </label>
                  <select
                    {...register("status")}
                    className="w-full h-8 px-2 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingZone(null);
                  }}
                  className="px-3 h-8 bg-white border border-[#E5E5E5] text-[#525252] hover:bg-[#F5F5F5] rounded-[4px] font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createZoneMutation.isPending || updateZoneMutation.isPending}
                  className="px-4 h-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[4px] font-medium flex items-center gap-1.5"
                >
                  {createZoneMutation.isPending || updateZoneMutation.isPending
                    ? "Menyimpan..."
                    : editingZone
                    ? "Update Zona"
                    : "Simpan Zona"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
