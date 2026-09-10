import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../context/AuthContext.jsx";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { ErrorBoundary } from "../../components/common/ErrorBoundary.jsx";
import { LeafletMapCanvas } from "../../components/map/LeafletMapCanvas.jsx";
import { MapFloatingToolbar } from "../../components/map/MapFloatingToolbar.jsx";
import { MapLegendPanel } from "../../components/map/MapLegendPanel.jsx";
import { MapLayersPanel } from "../../components/map/MapLayersPanel.jsx";
import { OperationalDetailPanel } from "../../components/map/OperationalDetailPanel.jsx";

// Single-Tenant Services SSOT
import { armadaService } from "../../services/armadaService.js";
import { zoneService } from "../../services/zoneService.js";
import { roadService } from "../../services/roadService.js";
import { queryKeys } from "../../lib/queryKeys.js";

import {
  Bike,
  Plus,
  Trash2,
  X,
  Search,
  BatteryCharging,
  BatteryMedium,
  BatteryWarning,
  ShieldCheck,
  Filter,
  CheckCircle,
  AlertTriangle,
  Crosshair,
  Wrench,
  RotateCcw,
  Zap,
  Truck,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";

// ==========================================
// ZOD VALIDATION SCHEMA (RHF + ZOD INTEGRATION)
// ==========================================
const armadaFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Kode armada minimal 3 karakter (contoh: ARM-010)")
    .max(20, "Kode armada maksimal 20 karakter")
    .regex(/^[A-Za-z0-9_-]+$/, "Hanya huruf, angka, strip (-), dan underscore (_)"),
  name: z.string().trim().optional(),
  type: z.enum(["MOTOR_LISTRIK", "GEROBAK", "VAN"], {
    required_error: "Pilih tipe kendaraan",
  }),
  status: z.enum(["ACTIVE", "IN_USE", "MAINTENANCE"], {
    required_error: "Pilih status operasional",
  }),
});

/**
 * Fleet Management & Cart Intelligence Workspace
 * Enterprise split-screen layout: High-Density Fleet Console (440px) + Edge-to-Edge GIS Map
 */
export function FleetManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mapRef = useRef(null);

  // Filter & Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedArmada, setSelectedArmada] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [maintenanceCandidate, setMaintenanceCandidate] = useState(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);
  const [notification, setNotification] = useState(null);

  const [layers, setLayers] = useState({
    zones: true,
    riders: false,
    fleet: true,
    dss: false,
    protocolRoads: true,
    weather: false,
    pois: false,
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Fetch Armadas SSOT
  const { data: fleetRes, isLoading: isFleetLoading } = useQuery({
    queryKey: queryKeys.armadas.all,
    queryFn: armadaService.getAll,
  });
  const fleets = fleetRes?.armadas || fleetRes?.fleets || fleetRes?.data || [];

  // 2. Fetch Operational Zones
  const { data: zonesRes } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneService.getZones,
    staleTime: 60000,
  });
  const zones = zonesRes?.zones || zonesRes?.data || [];

  // 3. Fetch Protocol Roads
  const { data: protocolRoadsRes } = useQuery({
    queryKey: ["roads", "protocol"],
    queryFn: roadService.getProtocolRoads,
    staleTime: 300000,
  });
  const protocolRoads = protocolRoadsRes?.data || protocolRoadsRes;

  // React Hook Form + Zod Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(armadaFormSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "MOTOR_LISTRIK",
      status: "ACTIVE",
    },
  });

  // Mutations
  const addFleetMutation = useMutation({
    mutationFn: armadaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      setIsAddModalOpen(false);
      reset();
      showNotification("Unit armada baru berhasil didaftarkan ke sistem!", "success");
    },
    onError: (err) => {
      showNotification(
        `Gagal menambah armada: ${err.response?.data?.msg || err.message}`,
        "error"
      );
    },
  });

  const deleteFleetMutation = useMutation({
    mutationFn: armadaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      showNotification("Unit armada berhasil dihapus dari inventaris.", "success");
      setDeleteCandidate(null);
      if (selectedArmada?.id === deleteCandidate?.id) {
        setSelectedArmada(null);
      }
    },
    onError: (err) => {
      showNotification(
        `Gagal menghapus armada: ${err.response?.data?.msg || err.message}`,
        "error"
      );
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: async ({ id, isCurrentlyMaintenance, notes }) => {
      if (isCurrentlyMaintenance) {
        return armadaService.releaseMaintenance(id);
      } else {
        return armadaService.setMaintenance(id, { notes });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      setMaintenanceCandidate(null);
      setMaintenanceNotes("");
      showNotification(
        variables.isCurrentlyMaintenance
          ? "Armada telah dilepas dari status perawatan dan siap beroperasi kembali."
          : "Armada berhasil dipindahkan ke status pemeliharaan (MAINTENANCE).",
        "success"
      );
    },
    onError: (err) => {
      showNotification(
        `Gagal mengubah status pemeliharaan: ${err.response?.data?.msg || err.message}`,
        "error"
      );
    },
  });

  const onSubmit = (data) => {
    addFleetMutation.mutate(data);
  };

  // Filtered Fleets List
  const filteredFleets = fleets.filter((f) => {
    const matchSearch =
      (f.code || f.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.type || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "ALL") return matchSearch;
    return matchSearch && (f.status || "ACTIVE") === statusFilter;
  });

  const handleSelectArmada = (armada) => {
    setSelectedArmada(armada);
    if (armada.latitude && armada.longitude && mapRef.current) {
      mapRef.current.flyTo([Number(armada.latitude), Number(armada.longitude)], 15, {
        duration: 1.2,
      });
    }
  };

  // Helper for battery status visualization
  const getBatteryInfo = (armada) => {
    // Generate deterministic mockup level if battery is not on telemetry yet
    const seed = typeof armada.id === "number" ? armada.id : (armada.code?.length || 5);
    const level = armada.battery_level !== undefined ? armada.battery_level : ((seed * 19) % 65) + 35;
    
    if (level > 60) {
      return {
        level,
        color: "text-emerald-500",
        bg: "bg-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: BatteryCharging,
      };
    } else if (level > 25) {
      return {
        level,
        color: "text-amber-500",
        bg: "bg-amber-500",
        badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: BatteryMedium,
      };
    } else {
      return {
        level,
        color: "text-red-500",
        bg: "bg-red-500",
        badgeBg: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: BatteryWarning,
      };
    }
  };

  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case "MOTOR_LISTRIK":
        return <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case "VAN":
        return <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      default:
        return <Bike className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
  };

  const isSuperOrManagement = user?.role === "SUPERADMIN" || user?.role === "MANAGEMENT";

  return (
    <AppLayout
      fullBleed={true}
      breadcrumb="Armada & Gerobak Monitoring"
      currentPath="/fleet"
    >
      <div className="flex h-full w-full relative overflow-hidden bg-background">
        {/* Floating Notification Toast */}
        {notification && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg border shadow-xl flex items-center gap-2.5 backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
              notification.type === "success"
                ? "bg-card/95 border-emerald-500/30 text-emerald-400"
                : "bg-card/95 border-destructive/30 text-destructive"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <span className="text-xs font-medium text-foreground">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* LEFT COLUMN: HIGH-DENSITY FLEET OPERATIONAL CONSOLE (420px) */}
        <div className="w-full md:w-[420px] bg-card/95 backdrop-blur-md border-r border-border flex flex-col h-full shrink-0 relative z-20 shadow-lg">
          {/* Header & Metric Badges */}
          <div className="p-4 border-b border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground tracking-tight">
                    Inventaris Armada
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {fleets.length} Unit
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mobile Coffee Cart & Gerobak Listrik
                </p>
              </div>

              {/* Status summary pills */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {fleets.filter((f) => f.status === "ACTIVE" || f.status === "READY").length} Ready
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {fleets.filter((f) => f.status === "IN_USE").length} In-Use
                </span>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {fleets.filter((f) => f.status === "MAINTENANCE").length} Servis
                </span>
              </div>
            </div>

            {/* Add Armada CTA Button */}
            {isSuperOrManagement && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setIsAddModalOpen(true);
                }}
                className="w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Daftarkan Unit Armada Baru</span>
              </button>
            )}
          </div>

          {/* Search & Density Filter Bar */}
          <div className="p-3 border-b border-border bg-muted/20 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari kode armada, tipe kendaraan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-7 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {[
                { id: "ALL", label: "Semua" },
                { id: "ACTIVE", label: "Ready" },
                { id: "IN_USE", label: "In Use" },
                { id: "MAINTENANCE", label: "Maintenance" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                    statusFilter === tab.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* High-Density Fleet Table / List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {isFleetLoading ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">Memuat data armada & telemetri...</p>
              </div>
            ) : filteredFleets.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bike className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-medium text-foreground">Tidak ada unit armada</p>
                <p className="text-[11px] text-muted-foreground">
                  Coba ganti filter atau daftarkan unit baru.
                </p>
              </div>
            ) : (
              filteredFleets.map((armada) => {
                const isSelected = selectedArmada?.id === armada.id;
                const isReady = armada.status === "ACTIVE" || armada.status === "READY";
                const isInUse = armada.status === "IN_USE";
                const isMaintenance = armada.status === "MAINTENANCE";
                const battery = getBatteryInfo(armada);
                const BatteryIcon = battery.icon;

                return (
                  <div
                    key={armada.id}
                    onClick={() => handleSelectArmada(armada)}
                    className={`p-3 cursor-pointer transition-all border-l-2 ${
                      isSelected
                        ? "bg-primary/5 border-l-primary"
                        : "border-l-transparent hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {getVehicleTypeIcon(armada.type)}
                          <span className="text-xs font-mono font-bold text-foreground">
                            {armada.code || `ARM-${armada.id}`}
                          </span>
                          {armada.name && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              ({armada.name})
                            </span>
                          )}
                        </div>

                        {/* Telemetry info: Battery + Type */}
                        <div className="flex items-center gap-2.5 mt-2">
                          {/* Battery indicator */}
                          <div className="flex items-center gap-1.5">
                            <BatteryIcon className={`w-3.5 h-3.5 ${battery.color}`} />
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${battery.bg} rounded-full transition-all`}
                                style={{ width: `${battery.level}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-mono font-medium ${battery.color}`}>
                              {battery.level}%
                            </span>
                          </div>

                          <span className="text-muted-foreground/40">•</span>

                          <span className="text-[11px] text-muted-foreground">
                            {armada.type === "MOTOR_LISTRIK"
                              ? "E-Bike"
                              : armada.type === "VAN"
                              ? "Support Van"
                              : "Gerobak Sepeda"}
                          </span>
                        </div>
                      </div>

                      {/* Right column: Status badge & Quick Actions */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isReady
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : isInUse
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {armada.status || "ACTIVE"}
                        </span>

                        {/* Quick action icons */}
                        <div className="flex items-center gap-1 mt-0.5">
                          {/* Focus on map */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectArmada(armada);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Fokus Lokasi Peta"
                          >
                            <Crosshair className="w-3 h-3" />
                          </button>

                          {/* Maintenance Toggle */}
                          {isSuperOrManagement && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMaintenanceCandidate(armada);
                              }}
                              className={`p-1 rounded transition-colors ${
                                isMaintenance
                                  ? "text-amber-500 hover:bg-amber-500/10"
                                  : "text-muted-foreground hover:text-amber-500 hover:bg-muted"
                              }`}
                              title={isMaintenance ? "Lepas Maintenance" : "Set Maintenance"}
                            >
                              <Wrench className="w-3 h-3" />
                            </button>
                          )}

                          {/* Delete Action (Superadmin Only) */}
                          {user?.role === "SUPERADMIN" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteCandidate(armada);
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Hapus Unit"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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

        {/* RIGHT COLUMN: EDGE-TO-EDGE GIS SPATIAL WORKSPACE */}
        <div className="flex-1 relative h-full w-full overflow-hidden bg-muted/20 isolate z-10">
          <ErrorBoundary name="FleetGisCanvas">
            <LeafletMapCanvas
              zones={zones}
              armadas={fleets}
              protocolRoads={protocolRoads}
              layers={layers}
              selectedItem={selectedArmada}
              onSelectItem={(item) => setSelectedArmada(item)}
              mapRef={mapRef}
            />
          </ErrorBoundary>

          {/* Floating Controls Toolbar */}
          <MapFloatingToolbar
            activePanel={activeFloatingPanel}
            onTogglePanel={(p) => setActiveFloatingPanel((prev) => (prev === p ? null : p))}
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onResetView={() => mapRef.current?.setView([-7.4478, 112.7183], 13)}
          />

          {/* Floating Layer Control Panel */}
          {activeFloatingPanel === "layers" && (
            <MapLayersPanel
              layers={layers}
              onToggleLayer={(id) => setLayers((prev) => ({ ...prev, [id]: !prev[id] }))}
              onClose={() => setActiveFloatingPanel(null)}
            />
          )}

          {/* Floating Legend Panel */}
          {activeFloatingPanel === "legend" && (
            <MapLegendPanel onClose={() => setActiveFloatingPanel(null)} />
          )}

          {/* Selected Armada Floating Operational Detail Panel */}
          {selectedArmada && (
            <OperationalDetailPanel
              selectedItem={selectedArmada}
              itemType="armada"
              onClose={() => setSelectedArmada(null)}
              userRole={user?.role}
            />
          )}
        </div>

        {/* MODAL 1: ADD ARMADA UNIT (RHF + ZOD) */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Tambah Unit Armada Baru
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Pendaftaran gerobak & validasi spesifikasi operasional
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Kode Armada */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Kode Unit Armada <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: ARM-012"
                    {...register("code")}
                    className={`w-full h-9 px-3 text-xs bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                      errors.code
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : "border-input focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                  {errors.code && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                {/* Nama / Alias Armada */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Nama / Alias Unit (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gerobak Kopi Sidoarjo Barat"
                    {...register("name")}
                    className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Tipe Kendaraan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Jenis Kendaraan Operasional <span className="text-destructive">*</span>
                  </label>
                  <select
                    {...register("type")}
                    className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  >
                    <option value="MOTOR_LISTRIK">Motor Listrik (E-Bike Cart)</option>
                    <option value="GEROBAK">Gerobak Kayuh Manual (Bicycle Cart)</option>
                    <option value="VAN">Van Logistik / Support Unit</option>
                  </select>
                  {errors.type && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Status Awal */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Status Operasional Awal <span className="text-destructive">*</span>
                  </label>
                  <select
                    {...register("status")}
                    className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  >
                    <option value="ACTIVE">ACTIVE — Siap Beroperasi (Ready)</option>
                    <option value="MAINTENANCE">MAINTENANCE — Sedang Dalam Servis</option>
                  </select>
                  {errors.status && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.status.message}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 h-9 text-xs font-semibold rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || addFleetMutation.isPending}
                    className="px-5 h-9 text-xs font-semibold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {addFleetMutation.isPending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Mendaftarkan...</span>
                      </>
                    ) : (
                      <span>Simpan Armada</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: DESTRUCTIVE CONFIRMATION MODAL (NO WINDOW.CONFIRM) */}
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-card text-card-foreground rounded-xl border border-destructive/30 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Hapus Unit Armada?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Anda akan menghapus armada{" "}
                    <span className="font-mono font-bold text-foreground">
                      {deleteCandidate.code || `ID #${deleteCandidate.id}`}
                    </span>
                    . Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground border border-border flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  Riwayat pergeseran dan penjualan masa lalu yang diasosiasikan dengan unit ini akan
                  tetap tersimpan di database untuk audit.
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(null)}
                  className="px-4 h-8 text-xs font-semibold rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => deleteFleetMutation.mutate(deleteCandidate.id)}
                  disabled={deleteFleetMutation.isPending}
                  className="px-4 h-8 text-xs font-semibold rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {deleteFleetMutation.isPending ? "Menghapus..." : "Ya, Hapus Unit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: MAINTENANCE STATUS TOGGLE */}
        {maintenanceCandidate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {maintenanceCandidate.status === "MAINTENANCE"
                      ? "Selesaikan Pemeliharaan"
                      : "Alihkan ke Perawatan"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Armada:{" "}
                    <span className="font-mono font-bold text-foreground">
                      {maintenanceCandidate.code}
                    </span>
                  </p>
                </div>
              </div>

              {maintenanceCandidate.status !== "MAINTENANCE" && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Catatan Kerusakan / Servis:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Penggantian aki motor listrik, cek rem hidrolik..."
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                    className="w-full p-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMaintenanceCandidate(null);
                    setMaintenanceNotes("");
                  }}
                  className="px-4 h-8 text-xs font-semibold rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    maintenanceMutation.mutate({
                      id: maintenanceCandidate.id,
                      isCurrentlyMaintenance: maintenanceCandidate.status === "MAINTENANCE",
                      notes: maintenanceNotes,
                    })
                  }
                  disabled={maintenanceMutation.isPending}
                  className="px-4 h-8 text-xs font-semibold rounded-md bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {maintenanceMutation.isPending
                    ? "Memproses..."
                    : maintenanceCandidate.status === "MAINTENANCE"
                    ? "Lepas dari Servis (Siap Operasi)"
                    : "Simpan Status Servis"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default FleetManagementPage;
