/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   FleetManagementPage.jsx (Hub Fleet Inventory & Reservation Center - Single Tenant)
 *   Core Concept: Separation of Physical Fleet Status & Reservation Operational Lifecycle
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Truck,
  Plus,
  Search,
  Battery,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit,
  Clock,
  RefreshCw,
  Eye,
  Activity,
  User,
  Zap,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  MetricCard,
  Badge,
  Button,
  Modal,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  PageHeader,
  TableSkeleton,
} from "../../components/ui/index.js";
import { ArmadaDetailDrawer } from "../../components/domain/ArmadaDetailDrawer.jsx";
import { armadaService } from "../../services/armadaService.js";
import { useDashboardRealtime } from "../../hooks/useDashboardRealtime.js";

const FLEET_TYPES = [
  { value: "GEROBAK", label: "Gerobak Listrik (Sejuta Jiwa)" },
  { value: "MOTOR_LISTRIK", label: "Motor Listrik Keliling" },
  { value: "LAINNYA", label: "Unit Khusus / Booth Portable" },
];

export function FleetManagementPage() {
  // 1. Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 2. Data States
  const [fleets, setFleets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Modal & Drawer States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Selected armada for modals / drawer
  const [selectedArmada, setSelectedArmada] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "GEROBAK",
    status: "ACTIVE",
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    notes: "",
    cost: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Live Socket connection hook
  const { isConnected, socketEvents } = useDashboardRealtime();

  // Fetch all fleet data from backend
  const fetchFleets = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await armadaService.getAll();
      const armadaList = res.armadas || res.data || (Array.isArray(res) ? res : []);
      setFleets(armadaList);
    } catch (err) {
      console.error("Error fetching fleet data:", err);
      setError("Gagal memuat data armada dari server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFleets();
  }, [fetchFleets]);

  // Real-time socket events sync
  useEffect(() => {
    if (socketEvents && socketEvents.length > 0) {
      const lastEvent = socketEvents[socketEvents.length - 1];
      if (
        lastEvent.type === "RIDER_ASSIGNED" ||
        lastEvent.type === "ARMADA_HOLD" ||
        lastEvent.type === "ARMADA_CLAIM" ||
        lastEvent.type === "ARMADA_RELEASE"
      ) {
        fetchFleets(false);
      }
    }
  }, [socketEvents, fetchFleets]);

  // Derived KPI Counters
  const totalFleetCount = fleets.length;
  const availableCount = fleets.filter((f) => f.status === "ACTIVE" || f.status === "AVAILABLE").length;
  const reservedCount = fleets.filter((f) => f.status === "RESERVED" || f.reserved_until).length;
  const inUseCount = fleets.filter((f) => f.status === "IN_USE" || f.current_rider_id).length;
  const maintenanceCount = fleets.filter((f) => f.status === "MAINTENANCE").length;

  // Active reservations (Held units currently locked by riders)
  const activeReservations = useMemo(() => {
    return fleets.filter(
      (f) =>
        f.status === "RESERVED" ||
        (f.reserved_until && new Date(f.reserved_until) > new Date())
    );
  }, [fleets]);

  // Filtered Fleets List
  const filteredFleets = useMemo(() => {
    return fleets.filter((f) => {
      // Status filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "AVAILABLE" && f.status !== "ACTIVE" && f.status !== "AVAILABLE") return false;
        if (statusFilter === "RESERVED" && f.status !== "RESERVED" && !f.reserved_until) return false;
        if (statusFilter === "IN_USE" && f.status !== "IN_USE") return false;
        if (statusFilter === "MAINTENANCE" && f.status !== "MAINTENANCE") return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && f.type !== typeFilter) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCode = f.code?.toLowerCase().includes(q);
        const matchRider = f.current_rider_name?.toLowerCase().includes(q) || f.reserved_by_rider_name?.toLowerCase().includes(q);
        const matchZone = f.zone_name?.toLowerCase().includes(q);
        const matchType = f.type?.toLowerCase().includes(q);
        if (!matchCode && !matchRider && !matchZone && !matchType) return false;
      }

      return true;
    });
  }, [fleets, statusFilter, typeFilter, searchTerm]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setFormData({
      code: `ARM-${String(totalFleetCount + 1).padStart(3, "0")}`,
      name: `Gerobak Listrik #${totalFleetCount + 1}`,
      type: "GEROBAK",
      status: "ACTIVE",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (armada) => {
    setSelectedArmada(armada);
    setFormData({
      code: armada.code || "",
      name: armada.name || "",
      type: armada.type || "GEROBAK",
      status: armada.status || "ACTIVE",
    });
    setIsEditModalOpen(true);
  };

  const handleOpenMaintenanceModal = (armada) => {
    setSelectedArmada(armada);
    setMaintenanceForm({
      notes: "Pemeriksaan berkala & kalibrasi baterai IoT",
      cost: "150000",
    });
    setIsMaintenanceModalOpen(true);
  };

  const handleOpenDrawer = (armada) => {
    setSelectedArmada(armada);
    setIsDrawerOpen(true);
  };

  const handleOpenDeleteModal = (armada) => {
    setSelectedArmada(armada);
    setIsDeleteModalOpen(true);
  };

  // Submit Add Armada
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert("Kode unit armada harus diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      await armadaService.create(formData);
      setActionFeedback(`Unit armada ${formData.code} berhasil ditambahkan!`);
      setIsAddModalOpen(false);
      await fetchFleets(false);
    } catch (err) {
      alert(err.response?.data?.msg || err.message || "Gagal menambahkan unit armada.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Armada
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedArmada) return;
    setIsSubmitting(true);
    try {
      await armadaService.update(selectedArmada.id, formData);
      setActionFeedback(`Data unit armada ${formData.code} berhasil diperbarui!`);
      setIsEditModalOpen(false);
      await fetchFleets(false);
    } catch (err) {
      alert(err.response?.data?.msg || err.message || "Gagal memperbarui data armada.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Set Maintenance
  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedArmada) return;
    setIsSubmitting(true);
    try {
      await armadaService.setMaintenance(selectedArmada.id, maintenanceForm);
      setActionFeedback(`Unit ${selectedArmada.code} telah dialihkan ke status perbaikan bengkel.`);
      setIsMaintenanceModalOpen(false);
      setIsDrawerOpen(false);
      await fetchFleets(false);
    } catch (err) {
      alert(err.response?.data?.msg || err.message || "Gagal mengatur status pemeliharaan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Release from Maintenance
  const handleReleaseMaintenance = async (armada) => {
    setIsSubmitting(true);
    try {
      await armadaService.releaseMaintenance(armada.id);
      setActionFeedback(`Unit ${armada.code} telah selesai diservis dan standby di Hub.`);
      setIsDrawerOpen(false);
      await fetchFleets(false);
    } catch (err) {
      alert(err.response?.data?.msg || err.message || "Gagal merilis status pemeliharaan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Armada
  const handleSubmitDelete = async () => {
    if (!selectedArmada) return;
    setIsSubmitting(true);
    try {
      await armadaService.delete(selectedArmada.id);
      setActionFeedback(`Unit armada ${selectedArmada.code} telah dihapus dari sistem.`);
      setIsDeleteModalOpen(false);
      await fetchFleets(false);
    } catch (err) {
      alert(err.response?.data?.msg || err.message || "Gagal menghapus unit armada.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Manajemen Armada & Inventaris Hub"
        subtitle="Pusat inventaris fisik gerobak/motor keliling Sejuta Jiwa, kontrol status reservasi hold, dan log pemeliharaan bengkel"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchFleets(true)}
              className={isRefreshing ? "animate-spin" : ""}
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenAddModal}
              className="shadow-md shadow-blue-500/20"
            >
              Tambah Armada Baru
            </Button>
          </div>
        }
      />

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. Top 5 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Armada"
          value={`${totalFleetCount} Unit`}
          subtext="Aset terdaftar di Central Hub"
          icon={Truck}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
        />
        <MetricCard
          title="Standby di Hub"
          value={`${availableCount} Unit`}
          subtext="Siap dipilih rider presensi"
          trend={`${Math.round((availableCount / (totalFleetCount || 1)) * 100)}% siap`}
          trendDirection={availableCount > 0 ? "up" : "down"}
          icon={CheckCircle2}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
        />
        <MetricCard
          title="Direservasi (Held)"
          value={`${reservedCount} Unit`}
          subtext="Lock 5-Menit inspeksi fisik"
          trend="Sedang proses"
          trendDirection="neutral"
          icon={Clock}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
        />
        <MetricCard
          title="Sedang Beroperasi"
          value={`${inUseCount} Unit`}
          subtext="Aktif dibawa bertugas"
          trend={`${inUseCount} di lapangan`}
          trendDirection="up"
          icon={Activity}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800"
        />
        <MetricCard
          title="Dalam Perbaikan"
          value={`${maintenanceCount} Unit`}
          subtext="Penanganan servis bengkel"
          trend={maintenanceCount > 0 ? "Nonaktif" : "0 unit rusak"}
          trendDirection={maintenanceCount > 0 ? "down" : "up"}
          icon={Wrench}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
        />
      </div>

      {/* 3. Active Reservations Section (If any) */}
      {activeReservations.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <h3 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                Reservasi Aktif Berjalan (5-Minute In-Hub Hold)
              </h3>
            </div>
            <Badge variant="warning" size="xs">
              {activeReservations.length} Unit Ter-lock
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeReservations.map((res) => (
              <div
                key={res.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {res.code}
                    </span>
                    <Badge variant="warning" size="xs">
                      HOLD
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Rider: <strong>{res.reserved_by_rider_name || res.current_rider_name || "Rider Presensi"}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Batas Waktu:</span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {res.reserved_until
                      ? new Date(res.reserved_until).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "08:35 WIB"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Fleet Inventory Table Card */}
      <Card>
        <CardHeader
          title="Inventaris Unit Armada Lapangan"
          subtitle="Daftar lengkap seluruh unit gerobak dan motor listrik operasional Central Hub"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode, rider, atau zona..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">Semua Status Fisik</option>
                <option value="AVAILABLE">Tersedia (Hub)</option>
                <option value="RESERVED">Direservasi (Held)</option>
                <option value="IN_USE">Sedang Beroperasi</option>
                <option value="MAINTENANCE">Dalam Perbaikan</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">Semua Tipe Unit</option>
                <option value="GEROBAK">Gerobak Listrik</option>
                <option value="MOTOR_LISTRIK">Motor Listrik</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
          }
        />

        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} columns={7} />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Kode Unit</TableHeaderCell>
                  <TableHeaderCell>Kategori Tipe</TableHeaderCell>
                  <TableHeaderCell>Status Fisik</TableHeaderCell>
                  <TableHeaderCell>Rider Bertugas / Pemesan</TableHeaderCell>
                  <TableHeaderCell>Zona Operasi</TableHeaderCell>
                  <TableHeaderCell>Status IoT Sensor</TableHeaderCell>
                  <TableHeaderCell align="right">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFleets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <div className="py-10 text-center text-slate-400 space-y-2">
                        <Truck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-semibold">Tidak ada data armada ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFleets.map((armada) => {
                    const status = armada.status || "ACTIVE";
                    const isMaint = status === "MAINTENANCE";
                    const isInUse = status === "IN_USE";
                    const isRes = status === "RESERVED" || armada.reserved_until;
                    const activeRider = armada.current_rider_name || armada.reserved_by_rider_name;

                    return (
                      <TableRow key={armada.id}>
                        <TableCell>
                          <button
                            onClick={() => handleOpenDrawer(armada)}
                            className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{armada.code}</span>
                          </button>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                            {armada.type || "GEROBAK"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                              isMaint
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-300"
                                : isInUse
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-300"
                                : isRes
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isMaint
                                  ? "bg-rose-500"
                                  : isInUse
                                  ? "bg-blue-500"
                                  : isRes
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            {status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {activeRider ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                              <User className="w-3 h-3 text-blue-500 shrink-0" />
                              <span>{activeRider}</span>
                              {isRes && !isInUse && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                  HOLD
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">- Standby Hub -</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {armada.zone_name ? (
                            <div className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                              <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>{armada.zone_name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Central Hub Sidoarjo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <Battery className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Online (90%+)</span>
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="xs"
                              icon={Eye}
                              onClick={() => handleOpenDrawer(armada)}
                              title="Detail Armada"
                            >
                              Detail
                            </Button>

                            {isMaint ? (
                              <Button
                                variant="primary"
                                size="xs"
                                icon={CheckCircle2}
                                onClick={() => handleReleaseMaintenance(armada)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                title="Selesai Servis"
                              >
                                Rilis
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="xs"
                                icon={Wrench}
                                onClick={() => handleOpenMaintenanceModal(armada)}
                                className="text-amber-600 hover:text-amber-700"
                                title="Set Servis"
                              >
                                Servis
                              </Button>
                            )}

                            <Button
                              variant="secondary"
                              size="xs"
                              icon={Edit}
                              onClick={() => handleOpenEditModal(armada)}
                              title="Edit Unit"
                            />

                            <Button
                              variant="secondary"
                              size="xs"
                              icon={Trash2}
                              onClick={() => handleOpenDeleteModal(armada)}
                              className="text-rose-600 hover:text-rose-700 hover:border-rose-300"
                              title="Hapus Unit"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ======================================================== */}
      {/* MODAL 1: ADD ARMADA */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Unit Armada Baru"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmitAdd}>
              Simpan Unit
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Seri / Kode Unit <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: ARM-012"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kategori Tipe Armada
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FLEET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Status Fisik Awal
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">ACTIVE / AVAILABLE (Standby di Hub)</option>
              <option value="MAINTENANCE">MAINTENANCE (Perbaikan)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: EDIT ARMADA */}
      {/* ======================================================== */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Data Unit: ${selectedArmada?.code}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmitEdit}>
              Perbarui Data
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Seri / Kode Unit
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tipe Armada
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              {FLEET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Status Fisik
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE / AVAILABLE</option>
              <option value="IN_USE">IN_USE (Beroperasi)</option>
              <option value="RESERVED">RESERVED (Direservasi)</option>
              <option value="MAINTENANCE">MAINTENANCE (Perbaikan)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: SET MAINTENANCE */}
      {/* ======================================================== */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title={`Set Status Servis: ${selectedArmada?.code}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsMaintenanceModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleSubmitMaintenance}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Simpan & Alihkan ke Servis
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitMaintenance} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
            Unit ini akan dinonaktifkan sementara dari antrean plotting rider hingga teknisi selesai melakukan perbaikan.
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Keluhan / Jenis Servis <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Penggantian kampas rem, pelumasan roda, pengecekan modul IoT..."
              value={maintenanceForm.notes}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Estimasi Biaya Perbaikan (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 150000"
              value={maintenanceForm.cost}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Armada"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleSubmitDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Hapus Permanen
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Apakah Anda yakin ingin menghapus unit armada <strong>{selectedArmada?.code}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* SLIDE-OVER DRAWER: ARMADA DETAIL & CONTEXT */}
      {/* ======================================================== */}
      <ArmadaDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        armada={selectedArmada}
        onSetMaintenance={handleOpenMaintenanceModal}
        onReleaseMaintenance={handleReleaseMaintenance}
        onEdit={handleOpenEditModal}
      />
    </div>
  );
}

export default FleetManagementPage;
