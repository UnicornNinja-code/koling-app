import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  BrainCircuit,
  Scale,
  SlidersHorizontal,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Plus,
  Play,
  ArrowRight,
  ShieldCheck,
  History,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  MetricCard,
  Badge,
  Button,
  Tabs,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Modal,
  PageHeader,
} from "../../components/ui/index.js";
import { MOCK_CRITERIA, MOCK_ZONES } from "./mockData.js";

export function DssPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes("criteria") || location.pathname.includes("bwm")) {
      return "bwm";
    }
    return "topsis";
  });
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("criteria") || location.pathname.includes("bwm")) {
      setActiveTab("bwm");
    } else if (location.pathname === "/dss") {
      setActiveTab("topsis");
    }
  }, [location.pathname]);

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Sistem Pendukung Keputusan (DSS) BWM-TOPSIS"
          subtitle="Konfigurasi pembobotan ilmiah Best-Worst Method (BWM) dan evaluasi perankingan zona potensial TOPSIS"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Play}
                onClick={() => setIsSimulateModalOpen(true)}
              >
                Simulasi Hitung TOPSIS
              </Button>
            </div>
          }
        />

        {/* 1. Top KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Kriteria Penilaian"
            value="6 Kriteria"
            subtext="C1–C6 aktif & terverifikasi"
            trend="100% aktif"
            trendDirection="up"
            icon={SlidersHorizontal}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
          />
          <MetricCard
            title="Metode DSS"
            value="BWM + TOPSIS"
            subtext="Hybrid multi-criteria model"
            trend="Optimal"
            trendDirection="up"
            icon={BrainCircuit}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800"
          />
          <MetricCard
            title="Konsistensi BWM (ξ*)"
            value="0.042"
            subtext="Sangat konsisten (≤ 0.10)"
            trend="Valid"
            trendDirection="up"
            icon={CheckCircle2}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
          />
          <MetricCard
            title="Konfigurasi Aktif"
            value="v1.0.0 (Master)"
            subtext="Diperbarui: 10 Sep 2026"
            trend="Stabil"
            trendDirection="neutral"
            icon={Scale}
            iconColor="text-orange-600 dark:text-orange-400"
            iconBg="bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800"
          />
        </div>

        {/* 2. Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("topsis")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "topsis"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Rekomendasi TOPSIS (Hasil Ranking)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bwm")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "bwm"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Pembobotan BWM (Best-Worst Method)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Riwayat Snapshot & Flashback
            </button>
          </div>
        </div>

        {/* 3. Tab Contents */}
        {activeTab === "topsis" && (
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Tabel Perankingan Zona Potensial (TOPSIS)"
                subtitle="Matriks evaluasi nilai kedekatan relatif (Ci) terhadap solusi ideal positif (D+) dan negatif (D-)"
              />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Peringkat</TableHeaderCell>
                      <TableHeaderCell>Nama Zona Operasional</TableHeaderCell>
                      <TableHeaderCell>Skor Preferensi (Ci)</TableHeaderCell>
                      <TableHeaderCell>POI / Rider</TableHeaderCell>
                      <TableHeaderCell>Kategori Potensi</TableHeaderCell>
                      <TableHeaderCell>Breakdown Kriteria Dominan</TableHeaderCell>
                      <TableHeaderCell align="right">Aksi</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {MOCK_ZONES.map((zone) => (
                      <TableRow key={zone.id}>
                        <TableCell>
                          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs inline-flex items-center justify-center shadow-xs">
                            #{zone.rank}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{zone.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{zone.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {zone.score}
                          </div>
                          <span className="text-[10px] text-slate-400">{zone.scoreTrend}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {zone.poiCount} POI • {zone.riderCount}/{zone.maxCapacity} Rider
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              zone.rank === 1
                                ? "success"
                                : zone.rank <= 3
                                ? "primary"
                                : "warning"
                            }
                            size="sm"
                          >
                            {zone.rank === 1 ? "Sangat Potensial" : zone.rank <= 3 ? "Potensial" : "Cukup Potensial"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            C1: {(zone.c1 * 100).toFixed(0)}% • C3: {(zone.c3 * 100).toFixed(0)}% • C5: {(zone.c5 * 100).toFixed(0)}%
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <Button variant="secondary" size="sm">
                            Detail Kriteria
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </div>
        )}

        {activeTab === "bwm" && (
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Tabel 6 Kriteria Penilaian DSS (C1 - C6)"
                subtitle="Daftar parameter pembobotan ilmiah berbasis Best-Worst Method"
              />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Kode</TableHeaderCell>
                      <TableHeaderCell>Nama Kriteria & Deskripsi</TableHeaderCell>
                      <TableHeaderCell>Tipe</TableHeaderCell>
                      <TableHeaderCell>Bobot BWM (wj)</TableHeaderCell>
                      <TableHeaderCell>Persentase</TableHeaderCell>
                      <TableHeaderCell align="right">Aksi</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {MOCK_CRITERIA.map((c) => (
                      <TableRow key={c.code}>
                        <TableCell>
                          <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                            {c.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                            <div className="text-[11px] text-slate-500">{c.desc}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.type === "BENEFIT" ? "success" : "danger"} size="sm">
                            {c.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                            {c.weight.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${c.weight * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold">{c.weight * 100}%</span>
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <Button variant="ghost" size="sm">
                            Sesuaikan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </div>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader
              title="Riwayat Snapshot & Audit DSS"
              subtitle="Log immutable seluruh eksekusi perankingan TOPSIS terdahulu"
            />
            <CardContent className="p-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Eksekusi Shift Pagi Sidoarjo Hub</div>
                    <div className="text-[11px] text-slate-400">10 Sep 2026, 07:00 WIB • Evaluasi 5 Zona • 12 Rider</div>
                  </div>
                </div>
                <Button variant="secondary" size="sm">Lihat Snapshot</Button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Penyesuaian Bobot BWM Cuaca Ekstrem</div>
                    <div className="text-[11px] text-slate-400">09 Sep 2026, 14:30 WIB • Bobot C4 dinaikkan ke 0.20</div>
                  </div>
                </div>
                <Button variant="secondary" size="sm">Lihat Snapshot</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal Simulasi Perhitungan TOPSIS */}
        <Modal
          isOpen={isSimulateModalOpen}
          onClose={() => setIsSimulateModalOpen(false)}
          title="Simulasi Perhitungan DSS TOPSIS"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsSimulateModalOpen(false)}>
                Tutup
              </Button>
              <Button variant="primary" onClick={() => setIsSimulateModalOpen(false)}>
                Simpan Sebagai Snapshot Aktif
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs leading-relaxed">
            <p className="text-slate-600 dark:text-slate-300">
              Hasil simulasi perhitungan matriks ternormalisasi terbobot (Rij × Wj) menunjukkan <strong>ZON-SDA-01 (Alun-Alun Sidoarjo)</strong> mempertahankan peringkat <strong>#1</strong> dengan skor preferensi tertinggi <strong>0.823</strong>.
            </p>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
              ✓ Nilai D+ = 0.041 (Sangat dekat dengan solusi ideal positif)<br />
              ✓ Nilai D- = 0.192 (Sangat jauh dari solusi ideal negatif)<br />
              ✓ Rasio Preferensi Ci = 0.823
            </div>
          </div>
        </Modal>
      </div>
  );
}

export default DssPage;
