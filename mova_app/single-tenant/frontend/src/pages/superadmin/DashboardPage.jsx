import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Bike,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Button,
  Tag,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableToolbar,
} from "../../components/ui/index.js";
import { MapView } from "../../components/map/MapView.jsx";
import { distributionService } from "../../services/distributionService.js";
import {
  MOCK_KPI,
  MOCK_ZONES,
  MOCK_RIDERS,
} from "./mockData.js";

export function DashboardPage() {
  const navigate = useNavigate();
  const [distributionData, setDistributionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await distributionService.getOverview();
      if (res?.data) {
        setDistributionData(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      {/* Executive Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Ringkasan Operasional Eksekutif
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            Executive Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="secondary" size="md" icon={RefreshCw} onClick={loadData} loading={loading}>
            Sinkronisasi Data
          </Button>

        </div>
      </div>

      {/* 4 Macro KPI Metric Containers (Carbon Productive Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--cds-spacing-04)]">
        <div className="bg-[var(--cds-layer-01)] p-[20px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-02)]">
          <div className="flex items-center justify-between">
            <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase">ESTIMASI OMZET HARIAN</span>
            <Tag type="green" size="sm">+12.4%</Tag>
          </div>
          <div className="cds-heading-04 text-[var(--cds-text-primary)] font-sans font-bold">
            Rp {Number(MOCK_KPI?.total_revenue || 4850000).toLocaleString("id-ID")}
          </div>
          <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">
            Dari total {MOCK_KPI?.total_transactions || 324} transaksi POS tervalidasi.
          </p>
        </div>

        <div className="bg-[var(--cds-layer-01)] p-[20px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-02)]">
          <div className="flex items-center justify-between">
            <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase">ARMADA AKTIF LAPANGAN</span>
            <Tag type="blue" size="sm">8/12 Unit</Tag>
          </div>
          <div className="cds-heading-04 text-[var(--cds-text-primary)] font-sans font-bold">
            {MOCK_RIDERS.filter((r) => r.status === "OPERATING").length} Unit Bertugas
          </div>
          <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">
            4 unit dalam antrean FIFO distribusi shift pagi.
          </p>
        </div>

        <div className="bg-[var(--cds-layer-01)] p-[20px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-02)]">
          <div className="flex items-center justify-between">
            <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase">KEPATUHAN GEOFENCE</span>
            <Tag type="green" size="sm">91.2%</Tag>
          </div>
          <div className="cds-heading-04 text-[var(--cds-text-primary)] font-sans font-bold">
            91.2% Compliant
          </div>
          <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">
            1 rider terdeteksi berada di luar poligon zona aktif.
          </p>
        </div>

        <div className="bg-[var(--cds-layer-01)] p-[20px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-02)]">
          <div className="flex items-center justify-between">
            <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase">KONSISTENSI BWM (CR)</span>
            <Tag type="purple" size="sm">CR = 0.0029</Tag>
          </div>
          <div className="cds-heading-04 text-[var(--cds-text-primary)] font-sans font-bold">
            CR ≤ 0.30 (Valid)
          </div>
          <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">
            Bobot BWM kriteria C1-C6 terverifikasi mathematically consistent.
          </p>
        </div>
      </div>
      

      {/* Grid: Mini Map Overview + Operational Dispatch Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--cds-spacing-05)]">
        {/* Left: GIS Mini Overview (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] flex flex-col">
          <div className="p-[16px] border-b border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)] flex items-center justify-between">
            <h3 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
              Sebaran Geospasial Wilayah & Armada
            </h3>
            <Button kind="secondary" size="sm" icon={ArrowUpRight} onClick={() => navigate("/map-ops")}>
              Buka Map Ops
            </Button>
          </div>
          <div className="flex-1">
            <MapView
              zones={MOCK_ZONES}
              riders={MOCK_RIDERS}
              height="380px"
              showControls={false}
            />
          </div>
        </div>

        {/* Right: Distribution & Queue Summary (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] flex flex-col">
          <div className="p-[16px] border-b border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)] flex items-center justify-between">
            <h3 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
              Rekomendasi TOPSIS Teratas
            </h3>
            <Tag type="blue" size="sm">Time Slot: Pagi</Tag>
          </div>
          <div className="p-[16px] flex-1 space-y-[var(--cds-spacing-03)] overflow-y-auto">
            {MOCK_ZONES.slice(0, 4).map((z, idx) => (
              <div
                key={z.id}
                className="p-[12px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] flex items-center justify-between gap-[var(--cds-spacing-03)]"
              >
                <div className="flex items-center gap-[var(--cds-spacing-03)]">
                  <span className="w-6 h-6 flex items-center justify-center font-mono font-bold text-[12px] bg-[var(--cds-layer-03)] text-[var(--cds-text-primary)]">
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="cds-heading-compact-01 text-[var(--cds-text-primary)] font-semibold text-[13px]">
                      {z.name}
                    </h5>
                    <span className="cds-label-01 text-[var(--cds-text-secondary)] font-mono text-[11px]">
                      {z.code} • Kapasitas: {z.max_capacity} Unit
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="cds-label-01 text-[var(--cds-text-secondary)] block text-[10px]">Skor $C_i$</span>
                  <span className="cds-heading-compact-01 font-mono font-semibold text-[var(--cds-interactive)] text-[13px]">
                    {z.topsis_score || "0.854"}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-[var(--cds-spacing-02)]">
              <Button kind="secondary" size="sm" className="w-full justify-center" onClick={() => navigate("/distribution")}>
                Kelola Antrean FIFO & Penugasan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Operational Activity Logs */}
      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <TableToolbar
          title="Log Sesi Lapangan Terbaru"
          description="Aktivitas check-in PostGIS, reservasi armada, dan pencatatan transaksi POS."
          actions={
            <Button kind="ghost" size="sm" onClick={() => navigate("/reports")}>
              Lihat Laporan Lengkap
            </Button>
          }
        />
        <Table>
          <TableHead>
            <TableRow isHeader>
              <TableHeader>Waktu</TableHeader>
              <TableHeader>Rider</TableHeader>
              <TableHeader>Armada</TableHeader>
              <TableHeader>Zona</TableHeader>
              <TableHeader>Status Check-In</TableHeader>
              <TableHeader className="text-right">Kepatuhan</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_RIDERS.map((r, i) => (
              <TableRow key={r.id || i}>
                <TableCell className="cds-code-01 text-[11px] text-[var(--cds-text-secondary)]">
                  {`08:${20 + i * 4}:00`}
                </TableCell>
                <TableCell className="font-medium text-[var(--cds-text-primary)]">{r.name}</TableCell>
                <TableCell className="font-mono text-[12px]">{r.armada_code}</TableCell>
                <TableCell>{r.zone_name || "Alun-Alun Sidoarjo"}</TableCell>
                <TableCell>
                  <Tag type={r.status === "OPERATING" ? "green" : "gray"} size="sm">
                    {r.status === "OPERATING" ? "CHECKED_IN" : "ASSIGNED"}
                  </Tag>
                </TableCell>
                <TableCell className="text-right">
                  <Tag type={r.geofence_status === "IN_ZONE" ? "green" : "red"} size="sm">
                    {r.geofence_status === "IN_ZONE" ? "COMPLIANT" : "DEVIATED"}
                  </Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DashboardPage;
