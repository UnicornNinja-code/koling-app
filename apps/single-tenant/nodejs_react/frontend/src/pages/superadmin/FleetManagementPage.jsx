import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext.jsx";
import { Sidebar } from "../../components/layout/Sidebar.jsx";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { LeafletMapCanvas } from "../../components/map/LeafletMapCanvas.jsx";
import { MapFloatingToolbar } from "../../components/map/MapFloatingToolbar.jsx";
import { MapLegendPanel } from "../../components/map/MapLegendPanel.jsx";
import { MapLayersPanel } from "../../components/map/MapLayersPanel.jsx";
import { OperationalDetailPanel } from "../../components/map/OperationalDetailPanel.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";

// Single-Tenant Services SSOT
import { armadaService } from "../../services/armadaService.js";
import { zoneService } from "../../services/zoneService.js";
import { lbsService } from "../../services/lbsService.js";
import { roadService } from "../../services/roadService.js";
import { queryKeys } from "../../lib/queryKeys.js";

import {
  Bike,
  Plus,
  Trash2,
  X,
  Search,
  Battery,
  ShieldCheck,
  Clock,
  Filter,
  CheckCircle,
  Crosshair,
  Sliders,
} from "lucide-react";

/**
 * Fleet Monitoring & Mobile Coffee Cart Workspace
 * Enterprise split-screen layout: Left Inventory List (340px) + Right GIS Spatial Map
 */
export function FleetManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mapRef = useRef(null);

  // Filter & Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedArmada, setSelectedArmada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);

  const [layers, setLayers] = useState({
    zones: true,
    riders: false,
    fleet: true,
    dss: false,
    protocolRoads: true,
    weather: false,
    pois: false,
  });

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

  // Add / Edit Armada Form
  const { register, handleSubmit, reset } = useForm();

  const addFleetMutation = useMutation({
    mutationFn: armadaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      setIsModalOpen(false);
      reset();
      alert("Armada baru berhasil ditambahkan!");
    },
    onError: (err) => {
      alert(`Gagal menambah armada: ${err.response?.data?.msg || err.message}`);
    },
  });

  const deleteFleetMutation = useMutation({
    mutationFn: armadaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      alert("Armada berhasil dihapus!");
      setSelectedArmada(null);
    },
    onError: (err) => {
      alert(`Gagal menghapus armada: ${err.response?.data?.msg || err.message}`);
    },
  });

  // Fleet Hold / Claim / Release Actions
  const claimFleetMutation = useMutation({
    mutationFn: (id) => armadaService.update(id, { status: "IN_USE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      alert("Status armada berhasil diubah menjadi IN_USE.");
    },
  });

  const releaseFleetMutation = useMutation({
    mutationFn: (id) => armadaService.update(id, { status: "ACTIVE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      alert("Status armada berhasil diubah menjadi ACTIVE / AVAILABLE.");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      code: data.code || data.name,
      type: data.type || "MOTOR_LISTRIK",
      status: data.status || "ACTIVE",
    };
    addFleetMutation.mutate(payload);
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
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA] font-sans antialiased select-none">
      {/* 1. App Shell Dark Rail (60px) */}
      <Sidebar />

      {/* 2. Main Viewport Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Topbar />

        {/* Workspace Body: Left Fleet List (340px) + Right GIS Spatial Map */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Fleet Column (340px) */}
          <div className="w-full md:w-[340px] bg-white border-r border-[#E5E5E5] flex flex-col h-full shrink-0 relative z-20 shadow-xs">
            {/* Header & Add Armada CTA */}
            <div className="p-3 border-b border-[#E5E5E5] bg-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[13px] font-bold text-[#111111] uppercase tracking-wider">
                    Fleet Monitoring
                  </h2>
                  <p className="text-[11px] text-[#737373]">Bicycle & E-Bike Carts ({fleets.length})</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                    {fleets.filter((f) => f.status === "ACTIVE" || f.status === "READY").length} Ready
                  </span>
                  <span className="text-[10px] font-semibold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                    {fleets.filter((f) => f.status === "IN_USE").length} In Use
                  </span>
                </div>
              </div>

              {/* Add Unit CTA */}
              {(user?.role === "SUPERADMIN" || user?.role === "MANAGEMENT") && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Unit Armada</span>
                </button>
              )}
            </div>

            {/* Filter Bar & Search */}
            <div className="p-2.5 border-b border-[#E5E5E5] bg-[#FAFAFA] space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                <input
                  type="text"
                  placeholder="Search armada code or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] placeholder-[#737373] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {["ALL", "ACTIVE", "IN_USE", "MAINTENANCE"].map((st) => (
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

            {/* Scrollable Fleets List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F0F0F0]">
              {isFleetLoading ? (
                <div className="p-6 text-center text-[12px] text-[#737373]">Loading fleet units...</div>
              ) : filteredFleets.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-[#737373]">
                  No armada units matching current filter
                </div>
              ) : (
                filteredFleets.map((armada) => {
                  const isSelected = selectedArmada?.id === armada.id;
                  const isReady = armada.status === "ACTIVE" || armada.status === "READY";

                  return (
                    <div
                      key={armada.id}
                      onClick={() => handleSelectArmada(armada)}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#EFF6FF] border-l-2 border-[#2563EB]"
                          : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Bike className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                            <h4 className="text-[13px] font-mono font-bold text-[#111111] truncate">
                              {armada.code || armada.name || `Cart #${armada.id}`}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#525252] mt-1 truncate">
                            <span>{armada.type === "MOTOR_LISTRIK" ? "Motor Listrik" : "Bicycle Cart"}</span>
                            <span>•</span>
                            <span className="text-[#16A34A] font-medium">92% Battery</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                              isReady
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : armada.status === "IN_USE"
                                ? "bg-[#DBEAFE] text-[#2563EB]"
                                : "bg-[#FEF3C7] text-[#D97706]"
                            }`}
                          >
                            {armada.status || "ACTIVE"}
                          </span>

                          {user?.role === "SUPERADMIN" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Hapus unit armada ${armada.code}?`)) {
                                  deleteFleetMutation.mutate(armada.id);
                                }
                              }}
                              className="text-[#737373] hover:text-[#DC2626] p-0.5 rounded-[2px]"
                              title="Delete Unit"
                            >
                              <Trash2 className="w-3 h-3" />
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

          {/* Right GIS Spatial Map (Remaining Viewport) */}
          <div className="flex-1 relative h-full w-full overflow-hidden bg-[#E5E5E5] isolate z-10">
            <LeafletMapCanvas
              zones={zones}
              armadas={fleets}
              protocolRoads={protocolRoads}
              layers={layers}
              selectedItem={selectedArmada}
              onSelectItem={(item) => setSelectedArmada(item)}
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
                onClose={() => setActiveFloatingPanel(null)}
              />
            )}

            {/* Legend Panel */}
            {activeFloatingPanel === "legend" && (
              <MapLegendPanel onClose={() => setActiveFloatingPanel(null)} />
            )}

            {/* Operational Detail Panel */}
            {selectedArmada && (
              <OperationalDetailPanel
                selectedItem={selectedArmada}
                itemType="armada"
                onClose={() => setSelectedArmada(null)}
                userRole={user?.role}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Armada Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#E5E5E5] shadow-lg max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <Bike className="w-4 h-4 text-[#2563EB]" /> Tambah Unit Armada Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#737373] hover:text-[#111111] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] mb-1">
                  Kode / Nomor Unit Armada *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: ARM-012"
                  {...register("code", { required: true })}
                  className="w-full h-8 px-3 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#525252] mb-1">
                  Tipe Kendaraan / Gerobak
                </label>
                <select
                  {...register("type")}
                  className="w-full h-8 px-2 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="MOTOR_LISTRIK">Motor Listrik (E-Bike)</option>
                  <option value="GEROBAK">Gerobak Manual / Bicycle Cart</option>
                  <option value="VAN">Van / Support Vehicle</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#525252] mb-1">
                  Status Operasional Awal
                </label>
                <select
                  {...register("status")}
                  className="w-full h-8 px-2 text-[12px] bg-white border border-[#E5E5E5] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="ACTIVE">ACTIVE / Siap Operasi</option>
                  <option value="MAINTENANCE">MAINTENANCE / Servis</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 h-8 bg-white border border-[#E5E5E5] text-[#525252] hover:bg-[#F5F5F5] rounded-[4px] font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addFleetMutation.isPending}
                  className="px-4 h-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[4px] font-medium flex items-center gap-1.5"
                >
                  {addFleetMutation.isPending ? "Menyimpan..." : "Simpan Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
