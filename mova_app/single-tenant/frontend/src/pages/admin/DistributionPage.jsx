import React, { useState } from "react";
import {
  Send,
  Users,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  Play,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  MetricCard,
  Badge,
  StatusBadge,
  Button,
  Modal,
  Select,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  PageHeader,
} from "../../components/ui/index.js";
import { MOCK_ZONES, MOCK_RIDERS, MOCK_FLEETS } from "./mockData.js";

export function DistributionPage() {
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(MOCK_RIDERS[0]?.id);
  const [selectedZone, setSelectedZone] = useState(MOCK_ZONES[0]?.id);

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Distribusi & Plotting Rider"
          subtitle="Manajemen alokasi penugasan armada gerobak keliling berdasarkan prioritas skor TOPSIS & kapasitas zona"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Play}
                onClick={() => setIsAutoModalOpen(true)}
              >
                Auto-Distribute DSS
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setIsManualModalOpen(true)}
              >
                Penugasan Manual
              </Button>
            </div>
          }
        />

        {/* 1. Top KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Kuota Terbuka"
            value="35 Slot"
            subtext="dari 5 zona aktif"
            trend="+5 slot"
            trendDirection="up"
            icon={Users}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
          />
          <MetricCard
            title="Rider Siap Shift (FIFO)"
            value="12 Rider"
            subtext="terkonfirmasi hadir di Hub"
            trend="100% siap"
            trendDirection="up"
            icon={CheckCircle2}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
          />
          <MetricCard
            title="Rasio Penyeimbangan"
            value="94.2%"
            subtext="beban seimbang tanpa penumpukan"
            trend="+3.4%"
            trendDirection="up"
            icon={Sliders}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800"
          />
          <MetricCard
            title="Kepatuhan DSS"
            value="91.8%"
            subtext="alokasi sesuai ranking TOPSIS"
            trend="+6.2%"
            trendDirection="up"
            icon={ShieldCheck}
            iconColor="text-orange-600 dark:text-orange-400"
            iconBg="bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800"
          />
        </div>

        {/* 2. Zone Capacity & Allocation Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_ZONES.map((zone) => (
            <Card key={zone.id} className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">
                    Rank #{zone.rank}
                  </Badge>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Ci: {zone.score}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {zone.name}
                  </div>
                  <div className="text-[11px] text-slate-400">{zone.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <span>Kapasitas:</span>
                    <span>{zone.riderCount} / {zone.maxCapacity} ({zone.capacityPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        zone.capacityPct >= 80 ? "bg-emerald-500" : zone.capacityPct >= 50 ? "bg-blue-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${zone.capacityPct}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3. Rider Allocation & Live Table */}
        <Card>
          <CardHeader
            title="Daftar Alokasi Penugasan Rider Hari Ini"
            subtitle="Jadwal penempatan rider ke zona operasional Sidoarjo berdasarkan antrean dan algoritma DSS"
            action={
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Shift Pagi: 07:00 - 15:00 WIB</span>
              </div>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Rider</TableHeaderCell>
                  <TableHeaderCell>Armada</TableHeaderCell>
                  <TableHeaderCell>Zona Alokasi</TableHeaderCell>
                  <TableHeaderCell>Prioritas TOPSIS</TableHeaderCell>
                  <TableHeaderCell>Status Check-in</TableHeaderCell>
                  <TableHeaderCell>Omset Hari Ini</TableHeaderCell>
                  <TableHeaderCell align="right">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_RIDERS.map((rider) => (
                  <TableRow key={rider.id}>
                    <TableCell>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{rider.name}</div>
                        <div className="text-slate-400 text-[11px]">{rider.id} • {rider.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                        {rider.armadaCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {rider.zoneName}
                      </div>
                      <div className="text-slate-400 text-[10px]">{rider.zoneId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" size="sm">
                        High Priority
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold">{rider.checkInTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rider.revenue}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="secondary" size="sm">
                        Pindahkan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Modal Auto Distribute Confirmation */}
        <Modal
          isOpen={isAutoModalOpen}
          onClose={() => setIsAutoModalOpen(false)}
          title="Konfirmasi Auto-Distribusi DSS"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsAutoModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" icon={Play} onClick={() => setIsAutoModalOpen(false)}>
                Eksekusi Sekarang
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs leading-relaxed">
            <p className="text-slate-600 dark:text-slate-300">
              Sistem akan menjalankan algoritma perankingan <strong>TOPSIS</strong> terhadap 12 rider yang siap bertugas di Hub Sidoarjo dan mendistribusikannya secara optimal ke zona dengan skor tertinggi tanpa melanggar kuota kapasitas maksimum.
            </p>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              ✓ 5 Zona sasaran aktif<br />
              ✓ 12 Rider siap shift<br />
              ✓ Rekomendasi bobot BWM v1.0.0 diterapkan
            </div>
          </div>
        </Modal>

        {/* Modal Manual Assignment */}
        <Modal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          title="Penugasan Rider Manual"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsManualModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" onClick={() => setIsManualModalOpen(false)}>
                Simpan Penugasan
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Rider
              </label>
              <Select
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                options={MOCK_RIDERS.map((r) => ({ label: `${r.name} (${r.id})`, value: r.id }))}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Zona Tujuan
              </label>
              <Select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                options={MOCK_ZONES.map((z) => ({ label: `${z.name} (Sisa slot: ${z.maxCapacity - z.riderCount})`, value: z.id }))}
              />
            </div>
          </div>
        </Modal>
      </div>
  );
}

export default DistributionPage;
