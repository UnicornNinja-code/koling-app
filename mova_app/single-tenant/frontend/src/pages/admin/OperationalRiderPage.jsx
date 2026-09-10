import React, { useState } from "react";
import {
  Bike,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Filter,
  Download,
  Plus,
  Radio,
  Search,
  Battery,
  Navigation,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  MetricCard,
  Badge,
  StatusBadge,
  Button,
  Input,
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
import { MapView } from "../../components/map/MapView.jsx";
import { MOCK_ZONES, MOCK_RIDERS } from "./mockData.js";

export function OperationalRiderPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("ALL");

  const filteredRiders = MOCK_RIDERS.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesZone = selectedZoneFilter === "ALL" || r.zoneId === selectedZoneFilter;
    return matchesSearch && matchesStatus && matchesZone;
  });

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Monitoring Operasional Rider & Telemetri"
          subtitle="Pelacakan GPS real-time, pengawasan batas geofence zona, dan status kehadiran lapangan"
          actions={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetri Aktif
              </span>
              <Button variant="secondary" size="sm" icon={Download}>
                Export Log
              </Button>
            </div>
          }
        />

        {/* 1. Operational Summary KPIs (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Tepat Waktu (On Time)"
            value="78%"
            subtext="9 dari 12 rider check-in tepat"
            trend="↑ 4%"
            trendDirection="up"
            icon={CheckCircle2}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
          />
          <MetricCard
            title="Terlambat Check-in"
            value="12%"
            subtext="1 rider >15 menit di jalan"
            trend="↓ 2%"
            trendDirection="down"
            icon={Clock}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
          />
          <MetricCard
            title="Deviasi Geofence"
            value="8%"
            subtext="1 rider di luar batas poligon"
            trend="1 alert"
            trendDirection="neutral"
            icon={AlertTriangle}
            iconColor="text-rose-600 dark:text-rose-400"
            iconBg="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
          />
          <MetricCard
            title="Rider Offline"
            value="2%"
            subtext="1 unit baterai habis / sinyal hilang"
            trend="0 fatal"
            trendDirection="neutral"
            icon={XCircle}
            iconColor="text-slate-600 dark:text-slate-400"
            iconBg="bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* 2. Map & Live Activity Feed Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tracking Map View */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <MapView
                height="450px"
                zones={MOCK_ZONES}
                riders={filteredRiders}
              />
            </Card>
          </div>

          {/* Right Live Activity Feed */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader
                title="Aktivitas Lapangan Terkini"
                subtitle="Live event log dari LBS & presensi"
              />
              <CardContent className="p-4 space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Budi Santoso (R-001)</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Check-in di Zona Alun-Alun Sidoarjo [Tepat Waktu]</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">2 menit yang lalu</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Rian Hidayat (R-003)</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Deviasi geofence ±120m di Jl. Pahlawan</div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">8 menit yang lalu</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5">
                  <Navigation className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Ahmad Fauzi (R-002)</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Mengunci spot jualan Jl. Alun-Alun Timur</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">14 menit yang lalu</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 3. Filter Bar & Field Riders Table */}
        <Card>
          <CardHeader
            title="Daftar Telemetri Seluruh Rider Lapangan"
            subtitle="Data live koordinat, status operasional, baterai IoT, dan omset riil"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari nama/ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { label: "Semua Status", value: "ALL" },
                    { label: "On Time", value: "ON_TIME" },
                    { label: "Deviasi", value: "DEVIATION" },
                    { label: "Terlambat", value: "LATE" },
                    { label: "Offline", value: "OFFLINE" },
                  ]}
                  className="w-36 text-xs h-8"
                />
              </div>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Rider ID & Nama</TableHeaderCell>
                  <TableHeaderCell>Zona Saat Ini</TableHeaderCell>
                  <TableHeaderCell>Armada / Baterai</TableHeaderCell>
                  <TableHeaderCell>Status Operasi</TableHeaderCell>
                  <TableHeaderCell>Posisi GPS (Lat, Long)</TableHeaderCell>
                  <TableHeaderCell>Kecepatan</TableHeaderCell>
                  <TableHeaderCell>Omset Hari Ini</TableHeaderCell>
                  <TableHeaderCell align="right">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRiders.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{r.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.zoneName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{r.armadaCode}</span>
                        <span className="flex items-center text-[11px] text-slate-500 font-semibold">
                          <Battery className="w-3 h-3 text-emerald-500 mr-0.5" />
                          {r.battery}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          r.status === "ON_TIME"
                            ? "ACTIVE"
                            : r.status === "DEVIATION"
                            ? "DANGER"
                            : r.status === "LATE"
                            ? "WARNING"
                            : "INACTIVE"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold">{r.speed} km/j</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-900 dark:text-white">{r.revenue}</span>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="secondary" size="sm">
                        Ping / Hubungi
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </div>
  );
}

export default OperationalRiderPage;
