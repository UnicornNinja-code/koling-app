import React, { useState } from "react";
import { Calculator, RefreshCw, Layers, CheckCircle2, ShieldCheck } from "lucide-react";
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
import { MOCK_ZONES } from "./mockData.js";

export function DssPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [timeSlot, setTimeSlot] = useState("morning");
  const toast = useToast();

  const bwmCriteria = [
    { code: "C1", name: "Kepadatan POI Komersial", weight: 0.285, type: "Benefit" },
    { code: "C2", name: "Diversitas Kategori POI", weight: 0.195, type: "Benefit" },
    { code: "C3", name: "Skor Keramaian Dinamis (Jam)", weight: 0.245, type: "Benefit" },
    { code: "C4", name: "Risiko Presipitasi Cuaca", weight: 0.115, type: "Cost" },
    { code: "C5", name: "Jarak Tempuh dari Central Hub", weight: 0.095, type: "Cost" },
    { code: "C6", name: "Tekanan Saturasi Kompetitor", weight: 0.065, type: "Cost" },
  ];

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Mesin Sintesis Keputusan Spasial-Temporal
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            Decision Support System (BWM + TOPSIS Engine)
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button
            kind="secondary"
            size="md"
            icon={RefreshCw}
            onClick={() => toast.success("Kalkulasi Ulang", "Matriks keputusan TOPSIS diperbarui berdasarkan data cuaca & POI terbaru.")}
          >
            Kalkulasi Ulang TOPSIS
          </Button>
        </div>
      </div>

      {/* BWM Mathematical Provenance & Consistency Banner */}
      <div className="p-[16px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] flex flex-wrap items-center justify-between gap-[var(--cds-spacing-04)]">
        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <ShieldCheck className="w-6 h-6 text-[var(--cds-support-success)] shrink-0" />
          <div>
            <h4 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
              BWM Simplex LP Terverifikasi Konsisten
            </h4>
            <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">
              Rasio Konsistensi $CR = 0.0029 \le 0.30$ (Batas Ambang Konsistensi Salimi & Rezaei).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-02)]">
          <Tag type="purple">BOBOT BWM LOCKED</Tag>
          <Tag type="green">MATRIKS VALID</Tag>
        </div>
      </div>

      {/* Tabs: TOPSIS Leaderboard vs BWM Weights */}
      <Tabs>
        <Tab active={activeTab === 0} onClick={() => setActiveTab(0)}>
          1. Peringkat Zona TOPSIS ($C_i$)
        </Tab>
        <Tab active={activeTab === 1} onClick={() => setActiveTab(1)}>
          2. Bobot Kriteria BWM ($w_j$)
        </Tab>
      </Tabs>

      {/* TAB 1: TOPSIS Leaderboard */}
      <TabPanel active={activeTab === 0} className="space-y-[var(--cds-spacing-05)] p-0 pt-[16px]">
        <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
          <TableToolbar
            title="Hasil Perankingan Kedekatan Relatif TOPSIS"
            description="Zona dengan koefisien kedekatan tertinggi diprioritaskan pertama pada antrean distribusi FIFO."
            actions={
              <div className="w-56">
                <Select
                  id="dss-slot-select"
                  size="sm"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  options={[
                    { value: "morning", label: "07:00 - 09:30 (Pagi / Commuter)" },
                    { value: "lunch", label: "11:30 - 13:30 (Siang / Dining)" },
                    { value: "evening", label: "16:00 - 18:30 (Sore / Transit)" },
                  ]}
                />
              </div>
            }
          />
          <Table>
            <TableHead>
              <TableRow isHeader>
                <TableHeader>Ranking</TableHeader>
                <TableHeader>Kode & Nama Wilayah</TableHeader>
                <TableHeader>Kapasitas</TableHeader>
                <TableHeader>Jarak Positif ($D^+$)</TableHeader>
                <TableHeader>Jarak Negatif ($D^-$)</TableHeader>
                <TableHeader className="text-right">Skor Kedekatan ($C_i$)</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_ZONES.map((z, idx) => (
                <TableRow key={z.id} selected={idx === 0}>
                  <TableCell className="font-mono font-bold text-[14px]">
                    <span className="inline-block w-6 text-center">#{idx + 1}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-[var(--cds-text-primary)]">{z.name}</div>
                    <span className="cds-label-01 font-mono text-[var(--cds-text-secondary)]">{z.code}</span>
                  </TableCell>
                  <TableCell>{z.max_capacity || 4} Unit</TableCell>
                  <TableCell className="font-mono text-[12px] text-[var(--cds-support-error)]">
                    {Number(0.042 + idx * 0.015).toFixed(4)}
                  </TableCell>
                  <TableCell className="font-mono text-[12px] text-[var(--cds-support-success)]">
                    {Number(0.245 - idx * 0.035).toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono font-bold text-[14px] text-[var(--cds-interactive)]">
                      {z.topsis_score || Number(0.854 - idx * 0.08).toFixed(4)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabPanel>

      {/* TAB 2: BWM Weights */}
      <TabPanel active={activeTab === 1} className="space-y-[var(--cds-spacing-05)] p-0 pt-[16px]">
        <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
          <TableToolbar
            title="Daftar Bobot Vektor Kriteria BWM ($w_j$)"
            description="Dihasilkan dari optimasi Linear Programming berdasarkan perbandingan Best-to-Others dan Others-to-Worst."
          />
          <Table>
            <TableHead>
              <TableRow isHeader>
                <TableHeader>Kode</TableHeader>
                <TableHeader>Nama Kriteria</TableHeader>
                <TableHeader>Tipe Atribut</TableHeader>
                <TableHeader className="text-right">Bobot Relatif ($w_j$)</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {bwmCriteria.map((c) => (
                <TableRow key={c.code}>
                  <TableCell className="font-mono font-bold text-[13px]">{c.code}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Tag type={c.type === "Benefit" ? "green" : "yellow"} size="sm">
                      {c.type}
                    </Tag>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-[13px] text-[var(--cds-text-primary)]">
                    {(c.weight * 100).toFixed(1)}% ({c.weight})
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

export default DssPage;
