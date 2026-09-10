import React, { useState } from "react";
import {
  MapPin,
  Bike,
  Truck,
  ShieldCheck,
  BadgeDollarSign,
  Plus,
  Send,
  Download,
  Filter,
  Check,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Sliders,
} from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  MetricCard,
  Badge,
  StatusBadge,
  Input,
  Select,
  Switch,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TablePagination,
  Modal,
  Drawer,
  Tabs,
  Tooltip,
  Skeleton,
  MetricCardSkeleton,
  TableSkeleton,
  EmptyState,
  PageHeader,
  useToast,
  WeatherIcon,
  Avatar,
  ArmadaIcon,
  ThemeToggle,
} from "../../components/ui/index.js";

export function ShowcasePage() {
  const { toast } = useToast();

  // State controls for showcase interactive testing
  const [activeTab, setActiveTab] = useState("components");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [switchVal, setSwitchVal] = useState(true);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  // Sample Table Data for Demonstration
  const sampleTableData = [
    {
      id: "R-012",
      name: "Budi Santoso",
      zone: "ZON-SDA-01",
      location: "Jl. Alun-Alun Sidoarjo",
      status: "AKTIF",
      task: "Titik 1 - Alun-Alun",
      duration: "34 mnt",
    },
    {
      id: "R-018",
      name: "Citra Lestari",
      zone: "ZON-SDA-03",
      location: "Jl. RS Siti Hajar",
      status: "AKTIF",
      task: "Titik 2 - RS Siti Hajar",
      duration: "18 mnt",
    },
    {
      id: "R-021",
      name: "Dedi Kurniawan",
      zone: "ZON-SDA-04",
      location: "Jl. Taman Pinang",
      status: "TUGAS",
      task: "Titik 5 - Taman Pinang",
      duration: "42 mnt",
    },
    {
      id: "R-030",
      name: "Eka Wahyuni",
      zone: "ZON-SDA-02",
      location: "Jl. Gajah Mada",
      status: "TERSEDIA",
      task: "-",
      duration: "-",
    },
    {
      id: "R-041",
      name: "Fajar Nugroho",
      zone: "ZON-SDA-01",
      location: "Jl. Kartini",
      status: "OFFLINE",
      task: "-",
      duration: "-",
    },
  ];

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === sampleTableData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sampleTableData.map((d) => d.id));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Design System v3.0 Showcase"
        subtitle="Koleksi token, komponen atomik, dan pola antarmuka MOVA Single-Tenant SSOT."
        breadcrumbs={[
          { label: "MOVA", href: "#" },
          { label: "Sistem Desain", href: "#" },
          { label: "Showcase" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => toast.info("Ekspor", "Data desain sistem berhasil diunduh.")}
            >
              Export Tokens
            </Button>
            <Button
              variant="accent"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              + Modal Preview
            </Button>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="mb-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "components", label: "Komponen UI", icon: Layers },
            { id: "graphic-assets", label: "Aset Gambar, Avatar & Gerobak", icon: Sparkles },
            { id: "colors", label: "Token Warna & Status", icon: Sparkles },
            { id: "tables", label: "Tabel & Data Grid", icon: Filter },
            { id: "feedback", label: "Feedback & Toast", icon: Info },
          ]}
        />
      </div>

      {/* TAB 1: Core Components & Cards */}
      {activeTab === "components" && (
        <div className="space-y-8">
          {/* Section 1: KPI Metric Cards (As seen in Reference Mockups) */}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span>1. Top KPI Metric Cards</span>
              <span className="text-xs text-slate-400 font-normal">(Sesuai superadmin-dashboard.png & mapops.png)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Zona Aktif"
                value="12"
                subtext="dari 17 zona"
                trend="↑ 2"
                trendDirection="up"
                trendText="zona"
                icon={MapPin}
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
              />
              <MetricCard
                title="Rider Aktif"
                value="8"
                subtext="dari 12 rider"
                trend="↑ 1"
                trendDirection="up"
                trendText="rider"
                icon={Bike}
                iconColor="text-blue-600 dark:text-blue-400"
                iconBg="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
              />
              <MetricCard
                title="Armada Tersedia"
                value="5"
                subtext="dari 8 unit"
                trend="→ 0"
                trendDirection="neutral"
                trendText="unit"
                icon={Truck}
                iconColor="text-purple-600 dark:text-purple-400"
                iconBg="bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800"
              />
              <MetricCard
                title="Tingkat Kepatuhan Zona"
                value="87%"
                subtext="berdasarkan GPS & geofence"
                trend="↑ 5%"
                trendDirection="up"
                icon={ShieldCheck}
                iconColor="text-orange-600 dark:text-orange-400"
                iconBg="bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800"
              />
              <MetricCard
                title="Penjualan Hari Ini"
                value="Rp 2.450.000"
                subtext="dari 163 transaksi"
                trend="↑ 12%"
                trendDirection="up"
                icon={BadgeDollarSign}
                iconColor="text-cyan-600 dark:text-cyan-400"
                iconBg="bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800"
              />
            </div>
          </div>

          {/* Section: Dark & Light Theme Switcher */}
          <Card>
            <CardHeader
              title="2. Pengontrol Tema (Theme Switchers)"
              subtitle="Komponen pengalih tema Terang & Gelap yang tersinkronisasi ke seluruh layout (Pill, Segmented, Button)."
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pill Switcher (Aktif di Auth & Topbar)</div>
                  <div className="text-[11px] text-slate-400 mb-3">Interaktif dengan status label</div>
                  <ThemeToggle variant="pill" showLabel={true} />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Segmented Control</div>
                  <div className="text-[11px] text-slate-400 mb-3">Cocok untuk panel pengaturan</div>
                  <ThemeToggle variant="segmented" />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Icon Button (Compact)</div>
                  <div className="text-[11px] text-slate-400 mb-3">Tersedia dalam ukuran sm, md, lg</div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle variant="button" size="sm" />
                    <ThemeToggle variant="button" size="md" />
                    <ThemeToggle variant="button" size="lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Buttons */}
          <Card>
            <CardHeader
              title="3. Tombol (Buttons) & Variasi Aksi"
              subtitle="Warna primary biru #2563EB, accent orange #F97316, secondary outline, dan ghost."
            />
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Blue</Button>
                <Button variant="accent">Accent Orange</Button>
                <Button variant="secondary">Secondary Outline</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" icon={Plus}>With Icon</Button>
                <Button variant="accent" iconRight={Send}>Next Step</Button>
                <Button variant="primary" isLoading>Loading State</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Ukuran:</span>
                <Button variant="primary" size="sm">Small (sm)</Button>
                <Button variant="primary" size="md">Medium (md)</Button>
                <Button variant="primary" size="lg">Large (lg)</Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="3. Form Input & Controls" subtitle="Input field, select dropdown, dan state error." />
              <CardContent className="space-y-4">
                <Input
                  label="Nama Zona Geofence"
                  placeholder="Contoh: Alun-Alun Sidoarjo"
                  required
                  helperText="Nama unik untuk identifikasi poligon wilayah operasional."
                />
                <Input
                  label="Pencarian Rider"
                  placeholder="Ketik nama atau ID..."
                  icon={Filter}
                />
                <Input
                  label="Input dengan Validasi Error"
                  defaultValue="Invalid Value"
                  error="Kapasitas maksimal harus lebih besar dari 0."
                />
                <Select
                  label="Pilih Status Operasional"
                  options={[
                    { value: "ACTIVE", label: "Aktif (Beroperasi)" },
                    { value: "INACTIVE", label: "Nonaktif" },
                    { value: "MAINTENANCE", label: "Dalam Pemeliharaan" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="4. Switches, Checkboxes, & Tooltips" subtitle="Kontrol interaktif seleksi dan toggling." />
              <CardContent className="space-y-5">
                <Switch
                  checked={switchVal}
                  onChange={setSwitchVal}
                  label="Aktifkan Geofence GPS Auto-Tracking"
                  description="Kirim sinyal telemetri lokasi rider setiap 10 detik."
                />

                <Switch
                  checked={false}
                  label="Kunci Spot Penjualan Otomatis"
                  description="Cegah rider lain masuk ke radius 100m dari spot yang sedang ditempati."
                />

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <Checkbox
                    checked={checkboxVal}
                    onChange={setCheckboxVal}
                    label="Pilih seluruh rider di zona ini untuk penugasan massal"
                  />
                  <Checkbox
                    checked={false}
                    label="Kirim notifikasi push ke aplikasi mobile rider"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-500">Tooltips:</span>
                  <Tooltip content="Informasi algoritma Best-Worst Method (BWM)">
                    <Button variant="secondary" size="sm">Hover Me (BWM Info)</Button>
                  </Tooltip>
                  <Tooltip content="Detail batas kuota armada">
                    <Button variant="ghost" size="sm">Hover Me (Armada)</Button>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: Graphic Assets (Weather, Avatars, Gerobak/Armada) */}
      {activeTab === "graphic-assets" && (
        <div className="space-y-8">
          {/* Section 1: Weather Graphic Icons (Rich SVGs replacing Material Icons) */}
          <Card>
            <CardHeader
              title="1. Ikon Grafis Cuaca (Weather Image Assets)"
              subtitle="Asset grafis cuaca SVG / gambar beresolusi tinggi menggantikan ikon font/material."
            />
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-3">
                  <WeatherIcon condition="Cerah" size={56} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Cerah / Sunny</div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">32°C • Terang</div>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-3">
                  <WeatherIcon condition="Cerah Berawan" size={56} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Cerah Berawan</div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">30°C • Teduh</div>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-3">
                  <WeatherIcon condition="Berawan" size={56} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Mendung / Cloudy</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">28°C • Berawan</div>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-3">
                  <WeatherIcon condition="Hujan Ringan" size={56} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Hujan / Rainy</div>
                    <div className="text-[11px] text-blue-500 font-medium">25°C • Presipitasi</div>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-3">
                  <WeatherIcon condition="Petir Badai" size={56} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Badai Petir</div>
                    <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">24°C • Waspada</div>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-3">
                  <WeatherIcon condition="Kabut" size={56} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Berkabut / Foggy</div>
                    <div className="text-[11px] text-slate-500 font-medium">26°C • Visibilitas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: User Avatar SVGs */}
          <Card>
            <CardHeader
              title="2. Avatar User (Role-Based SVG & Status Badges)"
              subtitle="Asset grafis avatar pengguna khusus Superadmin, Rider Lapangan, Area Manager, dan Operator."
            />
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <Avatar role="admin" size="lg" status="online" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Super Admin</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Headquarters Control</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      SUPERADMIN
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <Avatar role="rider" size="lg" status="online" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Ahmad Fauzi</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Rider ZON-SDA-01</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      RIDER AKTIF
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <Avatar role="rider" size="lg" status="busy" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Budi Santoso</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Rider ZON-SDA-02</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      DALAM TUGAS
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <Avatar role="manager" size="lg" status="offline" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Dian Pratama</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Area Manager Sidoarjo</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      SUPERVISOR
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Gerobak Kopi Keliling (Armada Cart Asset) */}
          <Card>
            <CardHeader
              title="3. Gambar Gerobak Kopi Keliling (Mobile Coffee Cart / Armada)"
              subtitle="Asset ilustrasi gerobak kopi keliling Indonesia dengan barista machine, canopy MOVA, dan roda mobilitas."
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-[12px] bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800 dark:to-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                  <ArmadaIcon size={160} />
                  <div className="mt-4">
                    <div className="text-base font-bold text-slate-900 dark:text-white font-['Inter']">
                      Gerobak Kopi Standar MOVA
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Armada tipe sepeda kopi dorong lengkap dengan mesin espresso & grinder.
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[12px] bg-gradient-to-b from-emerald-50/50 to-white dark:from-slate-800 dark:to-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                  <ArmadaIcon size={120} />
                  <div className="mt-6 flex items-center justify-between w-full pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">ARM-SDA-01</div>
                      <div className="text-[11px] text-slate-500">Unit Siap Pakai</div>
                    </div>
                    <StatusBadge status="AVAILABLE" />
                  </div>
                </div>

                <div className="p-6 rounded-[12px] bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-800 dark:to-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                  <ArmadaIcon size={120} />
                  <div className="mt-6 flex items-center justify-between w-full pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">ARM-SDA-04</div>
                      <div className="text-[11px] text-slate-500">Dalam Penugasan</div>
                    </div>
                    <StatusBadge status="IN_USE" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Colors & Badges */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Status Badges SSOT" subtitle="Daftar badge status terstandarisasi untuk seluruh domain operasi." />
            <CardContent>
              <div className="flex flex-wrap gap-2.5">
                <StatusBadge status="ACTIVE" />
                <StatusBadge status="INACTIVE" />
                <StatusBadge status="AVAILABLE" />
                <StatusBadge status="IN_USE" />
                <StatusBadge status="MAINTENANCE" />
                <StatusBadge status="ON_DUTY" />
                <StatusBadge status="ON_TIME" />
                <StatusBadge status="LATE" />
                <StatusBadge status="DEVIATION" />
                <StatusBadge status="OFFLINE" />
                <StatusBadge status="TERBAIK" />
                <StatusBadge status="SANGAT_BAIK" />
                <StatusBadge status="BAIK" />
                <StatusBadge status="CUKUP" />
                <StatusBadge status="SUPERADMIN" />
                <StatusBadge status="MANAGEMENT" />
                <StatusBadge status="SUPERVISOR" />
                <StatusBadge status="RIDER" />
                <StatusBadge status="COMPLIANT" />
              </div>
            </CardContent>
          </Card>

          {/* Color Palettes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-[10px] bg-blue-600 text-white shadow-xs text-center">
              <div className="font-bold text-sm">Primary</div>
              <div className="text-xs opacity-80 font-mono">#2563EB</div>
            </div>
            <div className="p-4 rounded-[10px] bg-orange-500 text-white shadow-xs text-center">
              <div className="font-bold text-sm">Accent Orange</div>
              <div className="text-xs opacity-80 font-mono">#F97316</div>
            </div>
            <div className="p-4 rounded-[10px] bg-emerald-500 text-white shadow-xs text-center">
              <div className="font-bold text-sm">Success</div>
              <div className="text-xs opacity-80 font-mono">#10B981</div>
            </div>
            <div className="p-4 rounded-[10px] bg-amber-500 text-white shadow-xs text-center">
              <div className="font-bold text-sm">Warning</div>
              <div className="text-xs opacity-80 font-mono">#F59E0B</div>
            </div>
            <div className="p-4 rounded-[10px] bg-red-500 text-white shadow-xs text-center">
              <div className="font-bold text-sm">Danger</div>
              <div className="text-xs opacity-80 font-mono">#EF4444</div>
            </div>
            <div className="p-4 rounded-[10px] bg-slate-900 text-white border border-slate-800 shadow-xs text-center">
              <div className="font-bold text-sm">Surface Dark</div>
              <div className="text-xs opacity-80 font-mono">#131822</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Tables & Data Grid */}
      {activeTab === "tables" && (
        <div className="space-y-6">
          <TableContainer>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Inter']">
                  Daftar Rider Operasional
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data rider, lokasi terkini, status tugas, dan riwayat penugasan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Filter}
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Filter & Detail
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => toast.success("Penugasan Massal", `${selectedRows.length} rider dipilih.`)}
                >
                  + Penugasan Massal
                </Button>
              </div>
            </div>

            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell width="40px">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === sampleTableData.length}
                      onChange={toggleAll}
                      className="w-4 h-4 text-blue-600 rounded-[4px] cursor-pointer"
                    />
                  </TableHeaderCell>
                  <TableHeaderCell>ID Rider</TableHeaderCell>
                  <TableHeaderCell>Nama Rider</TableHeaderCell>
                  <TableHeaderCell>Zona Saat Ini</TableHeaderCell>
                  <TableHeaderCell>Lokasi Terakhir</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Tugas Aktif</TableHeaderCell>
                  <TableHeaderCell>Waktu Tugas</TableHeaderCell>
                  <TableHeaderCell width="80px">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleTableData.map((row) => (
                  <TableRow
                    key={row.id}
                    selected={selectedRows.includes(row.id)}
                    onClick={() => toggleRow(row.id)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded-[4px] cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {row.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center">
                          {row.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {row.zone}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500">{row.location}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-slate-500">{row.task}</TableCell>
                    <TableCell className="font-medium">{row.duration}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDrawerOpen(true);
                        }}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              currentPage={currentPage}
              totalPages={5}
              totalItems={48}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </TableContainer>

          {/* Skeleton Loaders Preview */}
          <div className="pt-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Skeleton Loaders (State Memuat Data)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>
            <TableSkeleton rows={3} columns={6} />
          </div>
        </div>
      )}

      {/* TAB 4: Feedback & Toast Triggers */}
      {activeTab === "feedback" && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Toast Notification Triggers" subtitle="Uji coba sistem floating toast notifications." />
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="success"
                  onClick={() =>
                    toast.success(
                      "Data Berhasil Disimpan",
                      "Perubahan konfigurasi bobot BWM telah diterapkan ke seluruh zona."
                    )
                  }
                >
                  Trigger Success Toast
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    toast.error(
                      "Koneksi GPS Terputus",
                      "Rider #R-041 tidak merespons sinyal telemetri selama 15 menit."
                    )
                  }
                >
                  Trigger Error Toast
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    toast.warning(
                      "Deviasi Geofence Terdeteksi",
                      "Rider #R-021 berada 120m di luar poligon zona tugas."
                    )
                  }
                >
                  Trigger Warning Toast
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    toast.info(
                      "Sinkronisasi Cuaca Selesai",
                      "Data Open-Meteo untuk Sidoarjo Hub telah dimutakhirkan."
                    )
                  }
                >
                  Trigger Info Toast
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Empty State Component" subtitle="Tampilan saat query atau filter tidak menemukan hasil." />
            <CardContent>
              <EmptyState
                title="Tidak Ada Armada Tersedia di Hub"
                description="Seluruh 80 unit armada saat ini sedang beroperasi di lapangan atau dalam status perawatan berkala."
                actionText="+ Tambah Unit Armada"
                onAction={() => setIsModalOpen(true)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactive Demonstration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Zona Geofence Baru"
        subtitle="Wizard 3 Langkah pembuatan zona operasional PostGIS."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                toast.success("Zona Berhasil Dibuat", "Zona baru telah ditambahkan ke sistem.");
              }}
            >
              Simpan Zona
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nama Zona *" placeholder="Contoh: Zona E - Pasar Porong" />
          <Input label="Deskripsi Area" placeholder="Deskripsi potensi wilayah komersial..." />
          <Input label="Kapasitas Maksimal Rider" type="number" defaultValue="20" />
          <Select
            label="Status Operasional"
            options={[
              { value: "ACTIVE", label: "Aktif" },
              { value: "INACTIVE", label: "Nonaktif" },
            ]}
          />
        </div>
      </Modal>

      {/* Interactive Demonstration Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Detail Zona & Performa Kriteria"
        subtitle="Analisis multi-kriteria DSS BWM-TOPSIS ZON-SDA-01."
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Tutup
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setIsDrawerOpen(false);
                toast.success("Penugasan Disimpan", "Penugasan rider ke zona ini telah diperbarui.");
              }}
            >
              Simpan Penugasan
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Skor Preferensi (Ci)</span>
              <StatusBadge status="TERBAIK" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-['Inter']">
              0.823
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Peringkat #1 dari 17 zona aktif di Kabupaten Sidoarjo.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Breakdown Kriteria (C1-C6)
            </h4>
            {[
              { code: "C1", name: "Densitas POI", score: "0.87", color: "bg-emerald-500" },
              { code: "C2", name: "Diversitas POI", score: "0.76", color: "bg-blue-500" },
              { code: "C3", name: "Keramaian Jam Operasi", score: "0.84", color: "bg-purple-500" },
              { code: "C4", name: "Kesesuaian Cuaca", score: "0.82", color: "bg-amber-500" },
              { code: "C5", name: "Jarak Hub ke Zona", score: "0.71", color: "bg-red-500" },
              { code: "C6", name: "Kepadatan Kompetitor", score: "0.58", color: "bg-slate-500" },
            ].map((crit) => (
              <div key={crit.code} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{crit.code} - {crit.name}</span>
                  <span className="font-bold">{crit.score}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${crit.color} rounded-full`}
                    style={{ width: `${parseFloat(crit.score) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </AppLayout>
  );
}
