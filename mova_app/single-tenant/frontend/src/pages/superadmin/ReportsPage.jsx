import React, { useState } from "react";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import {
  Button,
  Select,
  Tag,
  Tabs,
  Tab,
  TabPanel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableToolbar,
  useToast,
} from "../../components/ui/index.js";
import { MOCK_ZONES, MOCK_RIDERS } from "./mockData.js";

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState("today");
  const toast = useToast();

  const handleExportCsv = () => {
    toast.success("Ekspor Dimulai", "File CSV ringkasan operasional sedang diunduh...");
    // Stream CSV download logic
    const csvContent = "data:text/csv;charset=utf-8,Tanggal,Zona,Rider,Omzet,Kepatuhan\n2026-09-14,Alun-Alun Sidoarjo,Febriyan,425000,100%\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mova_daily_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Analitik Kinerja Operasional & Ekspor Data
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            Operational Reports & Export Center
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="primary" size="md" icon={Download} onClick={handleExportCsv}>
            Ekspor Ringkasan (CSV)
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs>
        <Tab active={activeTab === 0} onClick={() => setActiveTab(0)}>
          1. Kinerja Penjualan per Zona
        </Tab>
        <Tab active={activeTab === 1} onClick={() => setActiveTab(1)}>
          2. Log Kepatuhan Spasial
        </Tab>
      </Tabs>

      {/* TAB 1 */}
      <TabPanel active={activeTab === 0} className="space-y-[var(--cds-spacing-05)] p-0 pt-[16px]">
        <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
          <TableToolbar
            title="Agregasi Penjualan & Efektivitas TOPSIS"
            description="Evaluasi korelasi antara ranking rekomendasi zona dengan realisasi omzet lapangan."
          />
          <Table>
            <TableHead>
              <TableRow isHeader>
                <TableHeader>Ranking TOPSIS</TableHeader>
                <TableHeader>Nama Zona Wilayah</TableHeader>
                <TableHeader>Total Transaksi</TableHeader>
                <TableHeader>Total Unit Terjual</TableHeader>
                <TableHeader className="text-right">Total Pendapatan (Omzet)</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_ZONES.map((z, idx) => (
                <TableRow key={z.id}>
                  <TableCell className="font-mono font-bold">#{idx + 1}</TableCell>
                  <TableCell className="font-medium text-[var(--cds-text-primary)]">{z.name}</TableCell>
                  <TableCell>{72 - idx * 12} Transaksi</TableCell>
                  <TableCell>{98 - idx * 16} Cup</TableCell>
                  <TableCell className="text-right font-mono font-bold text-[var(--cds-text-primary)]">
                    Rp {Number(1450000 - idx * 240000).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabPanel>

      {/* TAB 2 */}
      <TabPanel active={activeTab === 1} className="space-y-[var(--cds-spacing-05)] p-0 pt-[16px]">
        <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
          <TableToolbar
            title="Audit Trail Kepatuhan Perimeter Geofence"
            description="Rekaman deteksi batas poligon PostGIS dan waktu operasi."
          />
          <Table>
            <TableHead>
              <TableRow isHeader>
                <TableHeader>Rider</TableHeader>
                <TableHeader>Kode Armada</TableHeader>
                <TableHeader>Zona</TableHeader>
                <TableHeader>Durasi Operasi</TableHeader>
                <TableHeader className="text-right">Status Kepatuhan</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_RIDERS.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-[var(--cds-text-primary)]">{r.name}</TableCell>
                  <TableCell className="font-mono text-[12px]">{r.armada_code}</TableCell>
                  <TableCell>{r.zone_name || "Alun-Alun Sidoarjo"}</TableCell>
                  <TableCell className="font-mono">4j 15m</TableCell>
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
      </TabPanel>
    </div>
  );
}

export default ReportsPage;
