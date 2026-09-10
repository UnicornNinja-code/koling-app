import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { Table, TableContainer } from "../../components/ui/Table.jsx";
import { reportService } from "../../services/reportService.js";
import { zoneService } from "../../services/zoneService.js";
import { formatCurrency, formatDate } from "../../lib/utils.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShieldCheck,
  Bike,
  Activity,
  Layers,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Compass,
  FileText,
  UserCheck,
  Cpu,
  History,
  ShieldAlert,
} from "lucide-react";

export function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  // Active Tab & Filters State
  const [activeTab, setActiveTab] = useState("executive");
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedZoneId, setSelectedZoneId] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);

  // 1. Authoritative Zones List
  const { data: zonesRes } = useQuery({
    queryKey: ["zones", "list"],
    queryFn: () => zoneService.getZones(),
  });

  const zones = useMemo(() => {
    return Array.isArray(zonesRes) ? zonesRes : zonesRes?.zones || zonesRes?.data || [];
  }, [zonesRes]);

  // 2. Executive Summary Query
  const {
    data: executiveData,
    isLoading: isLoadingExecutive,
    refetch: refetchExecutive,
  } = useQuery({
    queryKey: ["reports", "executive-summary"],
    queryFn: () => reportService.getExecutiveSummary(),
    enabled: activeTab === "executive",
  });

  // 3. Rider Operational Query
  const {
    data: riderData,
    isLoading: isLoadingRider,
    refetch: refetchRider,
  } = useQuery({
    queryKey: ["reports", "rider-operational", { startDate, endDate }],
    queryFn: () => reportService.getRiderOperationalReport({ startDate, endDate }),
    enabled: activeTab === "rider_operational",
  });

  // 4. Zone Effectiveness Query
  const {
    data: zoneData,
    isLoading: isLoadingZone,
    refetch: refetchZone,
  } = useQuery({
    queryKey: ["reports", "zone-effectiveness", { startDate, endDate, zoneId: selectedZoneId }],
    queryFn: () => reportService.getZoneEffectivenessReport({ startDate, endDate, zoneId: selectedZoneId }),
    enabled: activeTab === "zone_performance",
  });

  // 5. Fleet Report Query
  const {
    data: fleetData,
    isLoading: isLoadingFleet,
    refetch: refetchFleet,
  } = useQuery({
    queryKey: ["reports", "fleet"],
    queryFn: () => reportService.getFleetReport(),
    enabled: activeTab === "fleet",
  });

  // 6. DSS Accuracy Query
  const {
    data: dssData,
    isLoading: isLoadingDss,
    refetch: refetchDss,
  } = useQuery({
    queryKey: ["reports", "dss-accuracy", { startDate, endDate }],
    queryFn: () => reportService.getDssAccuracyReport({ startDate, endDate }),
    enabled: activeTab === "dss_accuracy",
  });

  // 7. Audit Logs Query
  const {
    data: auditData,
    isLoading: isLoadingAudit,
    refetch: refetchAudit,
  } = useQuery({
    queryKey: ["reports", "audit-logs"],
    queryFn: () => reportService.getAuditLogsReport({ limit: 100 }),
    enabled: activeTab === "audit_logs" && isSuperAdmin,
  });

  // Handle File Exports (CSV, XLSX, PDF/Print)
  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      let type = "EXECUTIVE_SUMMARY";
      if (activeTab === "rider_operational") type = "RIDER_OPERATIONAL";
      else if (activeTab === "zone_performance") type = "ZONE_PERFORMANCE";
      else if (activeTab === "fleet") type = "FLEET_REPORT";
      else if (activeTab === "dss_accuracy") type = "DSS_ACCURACY";
      else if (activeTab === "audit_logs") type = "AUDIT_LOGS";

      await reportService.downloadReportExport({
        type,
        format,
        startDate,
        endDate,
        zoneId: selectedZoneId,
      });

      if (showToast) {
        showToast(`Laporan ${type} berhasil diekspor (${format.toUpperCase()})`, "success");
      }
    } catch (err) {
      if (showToast) {
        showToast(err.message || "Gagal mengekspor laporan.", "error");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = executiveData?.kpis || {};

  return (
    <AppLayout>
      <div className="space-y-6 pb-12 font-sans">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pusat Laporan & Analitika</span>
              <span>•</span>
              <span className="text-neutral-500">Ekspor Dokumen Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight mt-1">
              Laporan Analitika & Audit Sistem
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dss")}
              className="flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-purple-500" />
              <span>Konfigurasi DSS</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/superadmin/dashboard")}
              className="flex items-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </div>
        </div>

        {/* Global Filter Bar & Export Actions */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span>Periode:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <span className="text-neutral-400 text-xs">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />

            {activeTab === "zone_performance" && (
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="ALL">Semua Zona Wilayah</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Export Dropdown / Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor CSV / Excel</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </Button>
          </div>
        </div>

        {/* 6-Tab Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab("executive")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeTab === "executive"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span>1. Ringkasan Eksekutif & KPI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rider_operational")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeTab === "rider_operational"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-500" />
            <span>2. Kinerja & Absensi Rider</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("zone_performance")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeTab === "zone_performance"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>3. Efektivitas Zona</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeTab === "fleet"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
            }`}
          >
            <Bike className="w-4 h-4 text-emerald-500" />
            <span>4. Status & Utilisasi Armada</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dss_accuracy")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
              activeTab === "dss_accuracy"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-500" />
            <span>5. Akurasi Rekomendasi DSS</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab("audit_logs")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                activeTab === "audit_logs"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-sm"
                  : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>6. Log Audit Keamanan</span>
            </button>
          )}
        </div>

        {/* TAB 1: EXECUTIVE SUMMARY */}
        {activeTab === "executive" && (
          <div className="space-y-6">
            {isLoadingExecutive ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Pendapatan Hari Ini</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                      {formatCurrency(kpis.revenue_today || 0)}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Bulan Ini: {formatCurrency(kpis.revenue_this_month || 0)}</p>
                  </Card>

                  <Card className="p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Cup Terjual Hari Ini</span>
                      <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                      {kpis.cups_sold_today || 0} <span className="text-sm font-normal text-neutral-500">Cup</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Sesi Aktif: {kpis.active_sessions_today || 0} Rider</p>
                  </Card>

                  <Card className="p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Utilisasi Armada</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                        <Bike className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                      {kpis.fleet_utilization_percent || 0}%
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{kpis.deployed_fleet || 0} dari {kpis.active_fleet || 0} Armada Beroperasi</p>
                  </Card>

                  <Card className="p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Kepatuhan Check-In</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                      {kpis.check_in_compliance_percent || 0}%
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Eksekusi DSS Hari Ini: {kpis.dss_runs_today || 0} kali</p>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: RIDER OPERATIONAL & ATTENDANCE */}
        {activeTab === "rider_operational" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Log Absensi & Rekapitulasi Dinas Rider
              </h3>
              <Badge variant="primary">{riderData?.total_riders_analyzed || 0} Rider Teranalisis</Badge>
            </div>

            <TableContainer>
              <Table>
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-700 text-left text-xs font-bold text-neutral-500 uppercase">
                    <th className="py-3.5 px-4">Nama Rider</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Hari Aktif</th>
                    <th className="py-3.5 px-4">Penugasan</th>
                    <th className="py-3.5 px-4">Check-In</th>
                    <th className="py-3.5 px-4">Rata Jam Kerja</th>
                    <th className="py-3.5 px-4">Cup Terjual</th>
                    <th className="py-3.5 px-4">Total Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {isLoadingRider ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500">Memuat data kinerja rider...</td>
                    </tr>
                  ) : (riderData?.riders || []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500">Tidak ada riwayat penugasan pada periode yang dipilih.</td>
                    </tr>
                  ) : (
                    (riderData?.riders || []).map((r) => (
                      <tr key={r.rider_id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                          {r.rider_name}
                          <div className="text-[10px] text-neutral-400 font-normal">{r.rider_email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={r.is_active ? "success" : "danger"}>
                            {r.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{r.total_days_active || 0} hari</td>
                        <td className="py-3 px-4">{r.total_assignments || 0}</td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">{r.total_check_ins || 0}</td>
                        <td className="py-3 px-4">{r.avg_working_hours ? `${r.avg_working_hours} jam` : "-"}</td>
                        <td className="py-3 px-4 font-medium">{r.total_cups_sold || 0} cup</td>
                        <td className="py-3 px-4 font-bold text-neutral-900 dark:text-emerald-400">
                          {formatCurrency(r.total_revenue || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* TAB 3: ZONE PERFORMANCE & EFFECTIVENESS */}
        {activeTab === "zone_performance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Efektivitas & Kepatuhan Penjualan per Zona Operasional
              </h3>
              <Badge variant="primary">{zoneData?.total_zones_analyzed || 0} Zona Teranalisis</Badge>
            </div>

            <TableContainer>
              <Table>
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-700 text-left text-xs font-bold text-neutral-500 uppercase">
                    <th className="py-3.5 px-4">Nama Zona</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Kapasitas</th>
                    <th className="py-3.5 px-4">Rider Ditugaskan</th>
                    <th className="py-3.5 px-4">Check-In</th>
                    <th className="py-3.5 px-4">Kepatuhan (%)</th>
                    <th className="py-3.5 px-4">Cup Terjual</th>
                    <th className="py-3.5 px-4">Total Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {isLoadingZone ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500">Memuat data zona...</td>
                    </tr>
                  ) : (zoneData?.zones || []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500">Tidak ada data operasional zona pada periode yang dipilih.</td>
                    </tr>
                  ) : (
                    (zoneData?.zones || []).map((z) => (
                      <tr key={z.zone_id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{z.zone_name}</td>
                        <td className="py-3 px-4">
                          <Badge variant={z.zone_status === "ACTIVE" ? "success" : "warning"}>
                            {z.zone_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{z.max_capacity} Unit</td>
                        <td className="py-3 px-4">{z.total_assigned_riders || 0}</td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">{z.total_check_ins || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${z.execution_compliance_rate >= 80 ? "text-emerald-600" : "text-amber-500"}`}>
                            {z.execution_compliance_rate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{z.total_cups_sold || 0} cup</td>
                        <td className="py-3 px-4 font-bold text-neutral-900 dark:text-emerald-400">
                          {formatCurrency(z.total_revenue || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* TAB 4: FLEET REPORT */}
        {activeTab === "fleet" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Status Armada Gerobak & Motor Listrik
              </h3>
              <Badge variant="primary">Utilisasi: {fleetData?.summary?.utilization_rate || 0}%</Badge>
            </div>

            <TableContainer>
              <Table>
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-700 text-left text-xs font-bold text-neutral-500 uppercase">
                    <th className="py-3.5 px-4">Kode Unit</th>
                    <th className="py-3.5 px-4">Tipe Armada</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Rider yang Mengoperasikan</th>
                    <th className="py-3.5 px-4">Riwayat Penugasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {isLoadingFleet ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500">Memuat data armada...</td>
                    </tr>
                  ) : (fleetData?.armadas || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500">Belum ada unit armada terdaftar.</td>
                    </tr>
                  ) : (
                    (fleetData?.armadas || []).map((a) => (
                      <tr key={a.armada_id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">{a.code}</td>
                        <td className="py-3 px-4">{a.type}</td>
                        <td className="py-3 px-4">
                          <Badge variant={a.status === "ACTIVE" ? "success" : a.status === "MAINTENANCE" ? "danger" : "warning"}>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">
                          {a.current_rider_name || <span className="text-neutral-400 italic">Standby di Hub</span>}
                        </td>
                        <td className="py-3 px-4">{a.historical_deployments_count || 0} kali</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* TAB 5: DSS ACCURACY & PLAN-VS-ACTUAL */}
        {activeTab === "dss_accuracy" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Tingkat Penerimaan Rekomendasi (AUTO)</span>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                  {dssData?.metrics?.acceptance_rate || 0}%
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {dssData?.metrics?.accepted_recommendations || 0} dari {dssData?.metrics?.total_assignments || 0} penugasan disetujui tanpa perubahan.
                </p>
              </Card>

              <Card className="p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Penyesuaian Manual Supervisor (OVERRIDE)</span>
                <div className="text-3xl font-extrabold text-amber-500 mt-2">
                  {dssData?.metrics?.override_rate || 0}%
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {dssData?.metrics?.supervisor_overrides || 0} penugasan disesuaikan manual berdasarkan pertimbangan lapangan.
                </p>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Riwayat Eksekusi Rekomendasi DSS</h3>
              <TableContainer>
                <Table>
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-700 text-left text-xs font-bold text-neutral-500 uppercase">
                      <th className="py-3 px-4">Waktu Eksekusi</th>
                      <th className="py-3 px-4">Dieksekusi Oleh</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Rasio Konsistensi (CR)</th>
                      <th className="py-3 px-4">Zona Direkomendasikan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                    {isLoadingDss ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-500">Memuat riwayat eksekusi DSS...</td>
                      </tr>
                    ) : (dssData?.recent_runs || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-500">Belum ada riwayat eksekusi DSS tercatat.</td>
                      </tr>
                    ) : (
                      (dssData?.recent_runs || []).map((run) => (
                        <tr key={run.dss_history_id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                          <td className="py-3 px-4 font-mono">{formatDate(run.execution_date)}</td>
                          <td className="py-3 px-4 font-semibold">{run.executed_by_name || "System"}</td>
                          <td className="py-3 px-4">
                            <Badge variant={run.status === "COMPLETED" ? "success" : "warning"}>
                              {run.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono">{run.consistency_ratio ? parseFloat(run.consistency_ratio).toFixed(4) : "-"}</td>
                          <td className="py-3 px-4">{run.recommended_zones_count || 0} Zona</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT LOGS (SuperAdmin Only) */}
        {activeTab === "audit_logs" && isSuperAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Log Audit & Jejak Keamanan Sistem
              </h3>
              <Badge variant="primary">{auditData?.total || 0} Aktivitas Tercatat</Badge>
            </div>

            <TableContainer>
              <Table>
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-700 text-left text-xs font-bold text-neutral-500 uppercase">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Aksi</th>
                    <th className="py-3 px-4">Entitas</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {isLoadingAudit ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500">Memuat log audit...</td>
                    </tr>
                  ) : (auditData?.logs || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500">Belum ada aktivitas audit tercatat.</td>
                    </tr>
                  ) : (
                    (auditData?.logs || []).map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-mono text-neutral-500">{formatDate(log.created_at)}</td>
                        <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                          {log.user_name || log.user_email || "System"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {log.user_role || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400 font-bold">{log.action}</td>
                        <td className="py-3 px-4">{log.entity_type || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={log.status === "SUCCESS" ? "success" : "danger"}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-400">{log.ip_address || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ReportsPage;
