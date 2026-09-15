import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  Button,
  Table,
  Badge,
  PageHeader,
  MetricCard,
} from "../../components/ui/index.js";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Activity,
  Award,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  MapPin,
  Clock,
  Filter,
} from "lucide-react";
import {
  MOCK_REPORTS_SUMMARY,
  MOCK_AUDIT_LOGS,
  MOCK_ZONES,
  MOCK_RIDERS,
  MOCK_PRODUCTS,
} from "./mockData.js";

export default function ReportsPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes("dss")) return "dss";
    if (location.pathname.includes("sales")) return "sales";
    if (location.pathname.includes("audit")) return "audit";
    return "operational";
  });
  const [dateRange, setDateRange] = useState("TODAY"); // 'TODAY' | 'WEEK' | 'MONTH'

  useEffect(() => {
    if (location.pathname.includes("dss")) setActiveTab("dss");
    else if (location.pathname.includes("sales")) setActiveTab("sales");
    else if (location.pathname.includes("audit")) setActiveTab("audit");
    else if (location.pathname.includes("operational") || location.pathname === "/reports") setActiveTab("operational");
  }, [location.pathname]);

  const handleExportCSV = () => {
    alert(`Mengekspor laporan kategori [${activeTab.toUpperCase()}] untuk periode [${dateRange}] dalam format CSV...`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Laporan & Audit Log Operasional"
          subtitle="Analisis agregat performa rider, efektivitas rekomendasi DSS TOPSIS, rekapitulasi penjualan, dan jejak audit sistem."
        />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-surface-subtle border border-theme rounded-lg text-xs font-semibold text-text-secondary">
            <button
              onClick={() => setDateRange("TODAY")}
              className={`px-3 py-1 rounded-md transition-colors ${
                dateRange === "TODAY" ? "bg-brand-500 text-white shadow-sm" : "hover:text-text-primary"
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateRange("WEEK")}
              className={`px-3 py-1 rounded-md transition-colors ${
                dateRange === "WEEK" ? "bg-brand-500 text-white shadow-sm" : "hover:text-text-primary"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setDateRange("MONTH")}
              className={`px-3 py-1 rounded-md transition-colors ${
                dateRange === "MONTH" ? "bg-brand-500 text-white shadow-sm" : "hover:text-text-primary"
              }`}
            >
              30 Hari
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-2 border-theme">
            <Download className="w-4 h-4 text-brand-500" /> Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-text-muted" /> Cetak
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-theme pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("operational")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shrink-0 transition-colors ${
            activeTab === "operational"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          <Activity className="w-4 h-4" /> Kinerja Operasional & Rider
        </button>
        <button
          onClick={() => setActiveTab("dss")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shrink-0 transition-colors ${
            activeTab === "dss"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          <Award className="w-4 h-4" /> Efektivitas Algoritma DSS
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shrink-0 transition-colors ${
            activeTab === "sales"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Rekap Penjualan Minuman
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shrink-0 transition-colors ${
            activeTab === "audit"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Log Jejak Audit
        </button>
      </div>

      {/* TAB 1: OPERATIONAL REPORT */}
      {activeTab === "operational" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Shift Selesai"
              value={MOCK_REPORTS_SUMMARY.operational.totalShifts}
              icon={<Calendar className="w-5 h-5 text-brand-500" />}
              trend="100% On-Duty"
              trendDirection="up"
            />
            <MetricCard
              title="Tingkat Kepatuhan (GPS)"
              value={MOCK_REPORTS_SUMMARY.operational.avgComplianceRate}
              icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
              trend="Zona Geofence Valid"
              trendDirection="up"
            />
            <MetricCard
              title="Jarak Tempuh Rata-Rata"
              value={`${MOCK_REPORTS_SUMMARY.operational.avgDistancePerRiderKm} km`}
              icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
              trend="Per rider per hari"
              trendDirection="neutral"
            />
            <MetricCard
              title="Total Deviasi Terdeteksi"
              value={MOCK_REPORTS_SUMMARY.operational.totalDeviations}
              icon={<Activity className="w-5 h-5 text-amber-500" />}
              trend="Avg response 4.2 mnt"
              trendDirection="neutral"
            />
          </div>

          <Card className="p-0 overflow-hidden border-theme">
            <div className="p-4 bg-surface-subtle border-b border-theme font-bold text-sm text-text-primary">
              Rekapitulasi Kepatuhan Geofence Rider Lapangan
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle/50 border-b border-theme text-text-secondary uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3.5">ID Rider</th>
                    <th className="px-6 py-3.5">Nama Petugas</th>
                    <th className="px-6 py-3.5">Zona Penugasan</th>
                    <th className="px-6 py-3.5">Armada</th>
                    <th className="px-6 py-3.5">Check-In</th>
                    <th className="px-6 py-3.5">Status Kepatuhan</th>
                    <th className="px-6 py-3.5 text-right">Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {MOCK_RIDERS.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-text-primary">{r.id}</td>
                      <td className="px-6 py-4 font-semibold text-text-primary">{r.name}</td>
                      <td className="px-6 py-4 text-text-secondary">{r.zoneName}</td>
                      <td className="px-6 py-4 font-mono text-xs">{r.armadaCode}</td>
                      <td className="px-6 py-4 text-text-muted">{r.checkInTime}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            r.status === "ON_TIME"
                              ? "success"
                              : r.status === "DEVIATION"
                              ? "danger"
                              : r.status === "LATE"
                              ? "warning"
                              : "outline"
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-text-primary">
                        {r.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: DSS & TOPSIS EFFECTIVENESS */}
      {activeTab === "dss" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Rekomendasi Dihasilkan"
              value={MOCK_REPORTS_SUMMARY.dss.totalRankingsGenerated}
              icon={<Award className="w-5 h-5 text-brand-500" />}
              trend="Otomatis setiap shift"
              trendDirection="up"
            />
            <MetricCard
              title="Stabilitas Top Zone"
              value={MOCK_REPORTS_SUMMARY.dss.topZoneStabilityPct}
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              trend="Konsistensi ranking"
              trendDirection="up"
            />
            <MetricCard
              title="Rata-rata Rasio BWM (ξ*)"
              value={MOCK_REPORTS_SUMMARY.dss.avgBwmXi}
              icon={<ShieldCheck className="w-5 h-5 text-indigo-500" />}
              trend="Kriteria sangat konsisten"
              trendDirection="up"
            />
            <MetricCard
              title="Korelasi Skor vs Sales"
              value={MOCK_REPORTS_SUMMARY.dss.accuracyVsSalesCorr}
              icon={<BarChart3 className="w-5 h-5 text-emerald-500" />}
              trend="Korelasi positif kuat"
              trendDirection="up"
            />
          </div>

          <Card className="p-0 overflow-hidden border-theme">
            <div className="p-4 bg-surface-subtle border-b border-theme font-bold text-sm text-text-primary">
              Performa & Akurasi Prediksi Skor Zona TOPSIS vs Realisasi Penjualan
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle/50 border-b border-theme text-text-secondary uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3.5">Peringkat</th>
                    <th className="px-6 py-3.5">Nama Zona</th>
                    <th className="px-6 py-3.5">Skor Kedekatan (Ci+)</th>
                    <th className="px-6 py-3.5">Alokasi Rider</th>
                    <th className="px-6 py-3.5">Utilisasi Kapasitas</th>
                    <th className="px-6 py-3.5 text-right">Status Prediksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {MOCK_ZONES.map((z) => (
                    <tr key={z.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 font-bold text-xs flex items-center justify-center">
                          #{z.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-primary">{z.name}</td>
                      <td className="px-6 py-4 font-bold text-brand-500">{z.score.toFixed(3)}</td>
                      <td className="px-6 py-4 text-text-primary">
                        {z.riderCount} / {z.maxCapacity} unit
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-subtle h-2 rounded-full overflow-hidden border border-theme">
                            <div
                              className="bg-brand-500 h-full rounded-full"
                              style={{ width: `${z.capacityPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-text-muted">{z.capacityPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="success">AKURAT (High Volume)</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SALES & REVENUE */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Omset Penjualan"
              value={MOCK_REPORTS_SUMMARY.sales.grossRevenue}
              icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
              trend="+18% vs bulan lalu"
              trendDirection="up"
            />
            <MetricCard
              title="Total Cup Terjual"
              value={`${MOCK_REPORTS_SUMMARY.sales.totalCupsSold} Cup`}
              icon={<TrendingUp className="w-5 h-5 text-brand-500" />}
              trend="Rata-rata 41.5 cup/hari"
              trendDirection="up"
            />
            <MetricCard
              title="Zona Kontributor Terbesar"
              value="Alun-Alun Sidoarjo"
              icon={<MapPin className="w-5 h-5 text-indigo-500" />}
              trend="38% Total Revenue"
              trendDirection="up"
            />
            <MetricCard
              title="Menu Terlaris"
              value="Kopi Susu Sejuta Jiwa"
              icon={<Award className="w-5 h-5 text-amber-500" />}
              trend="54% Total Cup"
              trendDirection="up"
            />
          </div>

          <Card className="p-0 overflow-hidden border-theme">
            <div className="p-4 bg-surface-subtle border-b border-theme font-bold text-sm text-text-primary">
              Distribusi Penjualan per Menu Minuman
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle/50 border-b border-theme text-text-secondary uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3.5">Kode Produk</th>
                    <th className="px-6 py-3.5">Nama Menu</th>
                    <th className="px-6 py-3.5">Kategori</th>
                    <th className="px-6 py-3.5">Harga Jual</th>
                    <th className="px-6 py-3.5">Volume Terjual</th>
                    <th className="px-6 py-3.5 text-right">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {MOCK_PRODUCTS.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-text-primary">{p.id}</td>
                      <td className="px-6 py-4 font-semibold text-text-primary">{p.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{p.category}</Badge>
                      </td>
                      <td className="px-6 py-4">Rp {p.price.toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4 font-bold text-text-primary">{p.salesCount || 10} cup</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-500">
                        Rp {((p.salesCount || 10) * p.price).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === "audit" && (
        <Card className="p-0 overflow-hidden border-theme">
          <div className="p-4 bg-surface-subtle border-b border-theme flex items-center justify-between">
            <div className="font-bold text-sm text-text-primary">
              Jejak Audit & Log Keamanan Sistem (Immutable Trail)
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              4 Aktivitas Terakhir
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-subtle/50 border-b border-theme text-text-secondary uppercase text-xs">
                <tr>
                  <th className="px-6 py-3.5">Log ID</th>
                  <th className="px-6 py-3.5">Aktor / Pengguna</th>
                  <th className="px-6 py-3.5">Aksi Sistem</th>
                  <th className="px-6 py-3.5">Target Entitas</th>
                  <th className="px-6 py-3.5">Waktu Kejadian</th>
                  <th className="px-6 py-3.5 text-right">Alamat IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {MOCK_AUDIT_LOGS.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-text-primary">{log.id}</td>
                    <td className="px-6 py-4 font-semibold text-text-primary">{log.user}</td>
                    <td className="px-6 py-4">
                      <Badge variant="primary" className="font-mono text-xs">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-text-secondary">{log.target}</td>
                    <td className="px-6 py-4 text-xs text-text-muted flex items-center gap-1.5 mt-2">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-text-muted">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
