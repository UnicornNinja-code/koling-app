import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Button } from "../../components/common/Button.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { Table, TableContainer } from "../../components/ui/Table.jsx";
import { analyticsService } from "../../services/analyticsService.js";
import { zoneService } from "../../services/zoneService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { formatCurrency, formatDate } from "../../lib/utils.js";
import { useAuth } from "../../context/AuthContext.jsx";
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
  Lock,
  FileSpreadsheet,
  PieChart,
  Target,
  Navigation,
} from "lucide-react";

export function ReportsPage() {
  const { user } = useAuth();
  const isSupervisor = user?.role === "SUPERVISOR";

  // Date and Filter State
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'operational' | 'compliance' | 'dss' | 'daily'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedZoneId, setSelectedZoneId] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // 1. Authoritative Zones List
  const { data: zonesRes } = useQuery({
    queryKey: queryKeys.zones.list(),
    queryFn: () => zoneService.getZones(),
  });

  const zones = useMemo(() => {
    return Array.isArray(zonesRes) ? zonesRes : zonesRes?.zones || zonesRes?.data || [];
  }, [zonesRes]);

  // 2. Overview Query
  const {
    data: overviewRes,
    isLoading: isLoadingOverview,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: queryKeys.analytics.overview({ date: selectedDate }),
    queryFn: () => analyticsService.getOverview({ date: selectedDate }),
  });

  const overview = overviewRes?.data || overviewRes || {};

  // 3. Operational Analytics Query
  const {
    data: operationalRes,
    isLoading: isLoadingOperational,
    refetch: refetchOperational,
  } = useQuery({
    queryKey: queryKeys.analytics.operational({ date: selectedDate }),
    queryFn: () => analyticsService.getOperational({ date: selectedDate }),
  });

  const operational = operationalRes?.data || operationalRes || {};

  // 4. Fleet Utilization Query
  const { data: fleetRes } = useQuery({
    queryKey: queryKeys.armadas.all,
    queryFn: () => analyticsService.getFleetUtilization(),
  });

  const fleet = fleetRes?.data || fleetRes || {};

  // 5. Compliance Analytics Query
  const {
    data: complianceRes,
    isLoading: isLoadingCompliance,
    refetch: refetchCompliance,
  } = useQuery({
    queryKey: queryKeys.analytics.compliance({ date: selectedDate }),
    queryFn: () => analyticsService.getCompliance({ date: selectedDate }),
  });

  const compliance = complianceRes?.data || complianceRes || {};

  // 6. Sales Performance Query
  const {
    data: salesRes,
    isLoading: isLoadingSales,
    refetch: refetchSales,
  } = useQuery({
    queryKey: queryKeys.analytics.sales({ date: selectedDate }),
    queryFn: () => analyticsService.getSales({ date: selectedDate }),
  });

  const sales = salesRes?.data || salesRes || {};

  // 7. DSS Plan vs Actual Query
  const {
    data: dssPerformanceRes,
    isLoading: isLoadingDss,
    refetch: refetchDss,
  } = useQuery({
    queryKey: queryKeys.analytics.dssPerformance({ date: selectedDate }),
    queryFn: () => analyticsService.getDssPerformance({ date: selectedDate }),
  });

  const dssPerformance = dssPerformanceRes?.data || dssPerformanceRes || {};

  // 8. Daily Detailed Report Query
  const {
    data: dailyReportRes,
    isLoading: isLoadingDaily,
    refetch: refetchDaily,
  } = useQuery({
    queryKey: queryKeys.analytics.dailyReport({
      date: selectedDate,
      zoneId: selectedZoneId === "ALL" ? undefined : selectedZoneId,
    }),
    queryFn: () =>
      analyticsService.getDailyReport({
        date: selectedDate,
        zoneId: selectedZoneId === "ALL" ? undefined : selectedZoneId,
      }),
  });

  const dailyReport = dailyReportRes?.data || dailyReportRes || {};
  const dailyRows = dailyReport?.rows || dailyReport?.sessions || [];

  // Handle CSV Export
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      await analyticsService.exportDailyReport({
        date: selectedDate,
        zoneId: selectedZoneId === "ALL" ? undefined : selectedZoneId,
      });
    } catch (err) {
      setExportError(err?.response?.data?.msg || "Gagal mengunduh file CSV laporan harian.");
    } finally {
      setIsExporting(false);
    }
  };

  // Safe Financial Display
  const renderRevenue = (val, formattedVal) => {
    if (formattedVal === "PROTECTED_ROLE" || isSupervisor) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-neutral-500 font-medium bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
          <Lock className="w-3 h-3 text-neutral-400" />
          Protected (Supervisor)
        </span>
      );
    }
    if (val === null || val === undefined || formattedVal === "NO_DATA") {
      return <span className="text-neutral-400 italic">N/A</span>;
    }
    return formatCurrency(val);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#FAFAFA] text-[#171717] font-sans">
        {/* Workspace Top Header */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                  ANALYTICS & REPORTING
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 font-mono">
                  SSOT ENGINE B-12
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#171717] mt-1 tracking-tight">
                Reports & Historical Analytics Center
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Rekapitulasi komprehensif performa penjualan harian, utilisasi armada, kepatuhan spasial geofence, dan evaluasi efektivitas DSS TOPSIS.
              </p>
            </div>

            {/* Filter & Export Bar */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded border border-[#E5E5E5]">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 font-mono focus:outline-none"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchOverview();
                  refetchOperational();
                  refetchCompliance();
                  refetchSales();
                  refetchDss();
                  refetchDaily();
                }}
                className="h-8.5 px-3 border-[#E5E5E5] bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-md shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                Refresh
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCsv}
                loading={isExporting}
                className="h-8.5 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-md shadow-2xs transition-all"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Ekspor Laporan CSV
              </Button>
            </div>
          </div>

          {/* Export Error Alert */}
          {exportError && (
            <div className="mt-3">
              <Alert variant="danger" title="Gagal Mengekspor Laporan" onClose={() => setExportError(null)}>
                {exportError}
              </Alert>
            </div>
          )}

          {/* Macro KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-100">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Total Pendapatan
                </div>
                <div className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {renderRevenue(
                    overview?.sales?.summary?.total_revenue?.raw ?? sales?.summary?.total_revenue,
                    overview?.sales?.summary?.total_revenue?.formatted
                  )}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Total Cup Terjual
                </div>
                <div className="text-lg font-bold text-[#0F172A] mt-0.5 font-mono">
                  {overview?.sales?.summary?.total_cups ?? sales?.summary?.total_cups ?? 0} Cup
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Rata-rata Kepatuhan
                </div>
                <div className="text-lg font-bold text-neutral-900 mt-0.5 font-mono">
                  {compliance?.compliance_rate_percent !== undefined
                    ? `${Number(compliance.compliance_rate_percent).toFixed(1)}%`
                    : "100%"}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Sesi Shift Aktif
                </div>
                <div className="text-lg font-bold text-neutral-900 mt-0.5 font-mono">
                  {operational?.active_sessions_count ?? 0} Rider
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Bike className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "overview"
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Ringkasan & Penjualan
            </button>

            <button
              onClick={() => setActiveTab("operational")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "operational"
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              Operasional & Armada
            </button>

            <button
              onClick={() => setActiveTab("compliance")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "compliance"
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Kepatuhan Spasial
            </button>

            <button
              onClick={() => setActiveTab("dss")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "dss"
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              DSS Plan vs Actual
            </button>

            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "daily"
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Laporan Harian & CSV
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* TAB 1: OVERVIEW & SALES */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sales Breakdown by Product */}
                <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                    <h3 className="font-bold text-xs text-[#171717] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                      Kontribusi Penjualan per Produk Menu
                    </h3>
                  </div>

                  <TableContainer>
                    <Table>
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                          <th className="py-2 px-3">Produk</th>
                          <th className="py-2 px-3 text-center">Volume (Cup)</th>
                          <th className="py-2 px-3 text-right">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5] text-xs">
                        {(sales?.by_product || overview?.sales?.by_product || []).length === 0 ? (
                          <tr><td colSpan={3} className="py-6 text-center text-neutral-400">Belum ada transaksi menu.</td></tr>
                        ) : (
                          (sales?.by_product || overview?.sales?.by_product || []).map((p, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50/70">
                              <td className="py-2 px-3 font-semibold text-neutral-900">{p.product_name || p.name}</td>
                              <td className="py-2 px-3 text-center font-mono">{p.total_cups || p.qty || 0}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">
                                {renderRevenue(p.total_revenue, isSupervisor ? "PROTECTED_ROLE" : undefined)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </TableContainer>
                </div>

                {/* Sales Breakdown by Zone */}
                <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                    <h3 className="font-bold text-xs text-[#171717] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Kontribusi Revenue per Zona Operasional
                    </h3>
                  </div>

                  <TableContainer>
                    <Table>
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                          <th className="py-2 px-3">Zona</th>
                          <th className="py-2 px-3 text-center">Volume</th>
                          <th className="py-2 px-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5] text-xs">
                        {(sales?.by_zone || overview?.sales?.by_zone || []).length === 0 ? (
                          <tr><td colSpan={3} className="py-6 text-center text-neutral-400">Belum ada transaksi zona.</td></tr>
                        ) : (
                          (sales?.by_zone || overview?.sales?.by_zone || []).map((z, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50/70">
                              <td className="py-2 px-3 font-semibold text-neutral-900">{z.zone_name || z.name}</td>
                              <td className="py-2 px-3 text-center font-mono">{z.total_cups || 0}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                                {renderRevenue(z.total_revenue, isSupervisor ? "PROTECTED_ROLE" : undefined)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIONAL & FLEET */}
          {activeTab === "operational" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-md border border-[#E5E5E5] shadow-2xs">
                  <div className="text-[11px] font-medium text-neutral-500 uppercase">Total Sesi Shift</div>
                  <div className="text-xl font-bold text-neutral-900 mt-1 font-mono">
                    {operational?.total_sessions_count ?? 0} Sesi
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-md border border-[#E5E5E5] shadow-2xs">
                  <div className="text-[11px] font-medium text-neutral-500 uppercase">Sesi Checkout Selesai</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">
                    {operational?.completed_sessions_count ?? 0} Sesi
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-md border border-[#E5E5E5] shadow-2xs">
                  <div className="text-[11px] font-medium text-neutral-500 uppercase">Rata-rata Durasi Shift</div>
                  <div className="text-xl font-bold text-neutral-900 mt-1 font-mono">
                    {operational?.average_duration_hours ? `${operational.average_duration_hours} Jam` : "N/A"}
                  </div>
                </div>
              </div>

              {/* Fleet Status Breakdown */}
              <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs p-4 space-y-3">
                <h3 className="font-bold text-xs text-[#171717] flex items-center gap-2 border-b border-neutral-100 pb-2.5">
                  <Bike className="w-4 h-4 text-[#2563EB]" />
                  Status Utilisasi Unit Armada Sepeda Listrik
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                    <div className="text-neutral-500 text-[10px] uppercase font-semibold">Tersedia di Hub</div>
                    <div className="text-lg font-bold text-emerald-600 mt-0.5">{fleet?.available_count ?? 0} Unit</div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                    <div className="text-neutral-500 text-[10px] uppercase font-semibold">Sedang Bertugas</div>
                    <div className="text-lg font-bold text-blue-600 mt-0.5">{fleet?.in_use_count ?? 0} Unit</div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                    <div className="text-neutral-500 text-[10px] uppercase font-semibold">Hold 5-Menit</div>
                    <div className="text-lg font-bold text-amber-600 mt-0.5">{fleet?.held_count ?? 0} Unit</div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                    <div className="text-neutral-500 text-[10px] uppercase font-semibold">Perlu Maintenance</div>
                    <div className="text-lg font-bold text-rose-600 mt-0.5">{fleet?.maintenance_count ?? 0} Unit</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPATIAL COMPLIANCE */}
          {activeTab === "compliance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-md border border-[#E5E5E5] shadow-2xs">
                  <div className="text-[11px] font-medium text-neutral-500 uppercase">Geofence Compliance Rate</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">
                    {compliance?.compliance_rate_percent ? `${compliance.compliance_rate_percent}%` : "100%"}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-md border border-[#E5E5E5] shadow-2xs">
                  <div className="text-[11px] font-medium text-neutral-500 uppercase">Total Ping Telemetri Ingest</div>
                  <div className="text-xl font-bold text-neutral-900 mt-1 font-mono">
                    {compliance?.total_telemetry_points ?? 0} Pings
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-md border border-[#E5E5E5] shadow-2xs">
                  <div className="text-[11px] font-medium text-neutral-500 uppercase">Pelanggaran Jalur Protokol</div>
                  <div className="text-xl font-bold text-rose-600 mt-1 font-mono">
                    {compliance?.road_violations_count ?? 0} Kali
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DSS PLAN VS ACTUAL */}
          {activeTab === "dss" && (
            <div className="space-y-4">
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-md p-3.5 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong>Evaluasi Model DSS TOPSIS:</strong> Membandingkan ranking rekomendasi analitik TOPSIS dengan perolehan omzet nyata harian per zona untuk mengukur tingkat keselarasan (*Rank Order Alignment*).
                </div>
              </div>

              <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                  <h3 className="font-bold text-xs text-[#171717] flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#2563EB]" />
                    Tabel Evaluasi Plan vs Actual per Zona
                  </h3>
                  <div className="text-xs font-semibold text-neutral-700">
                    Status Keselarasan:{" "}
                    <span className="font-mono text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {dssPerformance?.rank_order_alignment || "INSUFFICIENT_DATA"}
                    </span>
                  </div>
                </div>

                <TableContainer>
                  <Table>
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                        <th className="py-2 px-3">Nama Zona</th>
                        <th className="py-2 px-3 text-center">Rank Prediksi TOPSIS</th>
                        <th className="py-2 px-3 text-center">Rank Realisasi Omzet</th>
                        <th className="py-2 px-3 text-right">Revenue Aktual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] text-xs">
                      {(dssPerformance?.zones || []).length === 0 ? (
                        <tr><td colSpan={4} className="py-6 text-center text-neutral-400">Belum ada snapshot evaluasi DSS harian.</td></tr>
                      ) : (
                        (dssPerformance?.zones || []).map((z, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50/70">
                            <td className="py-2 px-3 font-semibold text-neutral-900">{z.zone_name}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-[#2563EB]">#{z.predicted_rank || idx + 1}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-emerald-600">#{z.realized_rank || idx + 1}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">
                              {renderRevenue(z.actual_revenue, isSupervisor ? "PROTECTED_ROLE" : undefined)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}

          {/* TAB 5: DETAILED DAILY REPORT & CSV */}
          {activeTab === "daily" && (
            <div className="space-y-4">
              {/* Zone Filter Toolbar */}
              <div className="bg-white p-3 rounded-md border border-[#E5E5E5] shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500">Filter Zona:</span>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="bg-white border border-[#E5E5E5] rounded px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="ALL">Semua Zona</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-neutral-500">
                  Total Baris Rekapitulasi: <strong className="text-neutral-900">{dailyRows.length}</strong> sesi
                </div>
              </div>

              {/* Daily Report Table */}
              <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs overflow-hidden">
                <TableContainer>
                  <Table>
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Nama Rider</th>
                        <th className="py-2.5 px-3">Zona Bertugas</th>
                        <th className="py-2.5 px-3">Kode Armada</th>
                        <th className="py-2.5 px-3 text-center">Mulai Shift</th>
                        <th className="py-2.5 px-3 text-center">Status Sesi</th>
                        <th className="py-2.5 px-3 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] text-xs">
                      {isLoadingDaily ? (
                        <tr><td colSpan={7} className="py-8 text-center text-neutral-400">Memuat laporan harian...</td></tr>
                      ) : dailyRows.length === 0 ? (
                        <tr><td colSpan={7} className="py-8 text-center text-neutral-400">Tidak ada data sesi operasional pada tanggal terpilih.</td></tr>
                      ) : (
                        dailyRows.map((r, idx) => (
                          <tr key={r.session_id || idx} className="hover:bg-neutral-50/70">
                            <td className="py-2 px-3 text-center text-neutral-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-neutral-900">{r.rider_name || r.name}</td>
                            <td className="py-2 px-3 font-medium text-neutral-700">{r.zone_name || "N/A"}</td>
                            <td className="py-2 px-3 font-mono text-[11px] text-neutral-600">{r.armada_code || r.armada_id || "N/A"}</td>
                            <td className="py-2 px-3 text-center text-neutral-500 font-mono text-[11px]">
                              {r.start_time ? new Date(r.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {r.status || "ACTIVE"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">
                              {renderRevenue(r.total_revenue, isSupervisor ? "PROTECTED_ROLE" : undefined)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
