import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Checkbox,
  Drawer,
  EmptyState,
  ErrorFallbackBanner,
  Input,
  LoadingSkeleton,
  Modal,
  MovaLoading,
  PageHeader,
  Panel,
  Select,
  StatCard,
  Switch,
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  useToast,
  CriteriaProgressBar,
  DonutChartWidget,
} from "../../components/ui/index.js";
import {
  WeatherCardWidget,
  WeatherHeaderWidget,
} from "../../components/dashboard/WeatherCardWidget.jsx";
import {
  Sparkles,
  Layers,
  BarChart3,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  Eye,
  Shield,
  MapPin,
  Truck,
  Activity,
  Calendar,
  ExternalLink,
  CloudSun,
  Sun,
  Moon,
  Info,
  Check,
  Compass,
  Bike,
  RefreshCw,
  Clock,
  Printer,
  Navigation,
  Cpu,
  Users,
  GerobakKopiIcon,
  MotorListrikIcon,
  Droplets,
  WindSpeed,
  CloudRain,
  Visibility,
  Thermometer,
  MoreHorizontal,
  ListFilter,
} from "../../components/common/icons.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export function ShowcasePage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // State for interactive table showcase
  const [selectedRiders, setSelectedRiders] = useState([1, 2]);
  const [searchRider, setSearchRider] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const sampleRiders = [
    {
      id: 1,
      riderId: "R-012",
      name: "Budi Santoso",
      avatarVariant: "primary",
      avatarStatus: "online",
      zone: "ZON-SDA-01",
      zoneColor: "text-orange-600 dark:text-orange-400",
      status: "aktif",
      statusLabel: "Aktif",
      coords: "-7.3121, 112.7228",
      task: "Antar pesanan",
      duration: "34 mnt",
      vehicle: "Gerobak Kopi",
    },
    {
      id: 2,
      riderId: "R-018",
      name: "Citra Lestari",
      avatarVariant: "success",
      avatarStatus: "online",
      zone: "ZON-SDA-03",
      zoneColor: "text-emerald-600 dark:text-emerald-400",
      status: "aktif",
      statusLabel: "Aktif",
      coords: "-7.3156, 112.7281",
      task: "Antar pesanan",
      duration: "16 mnt",
      vehicle: "Motor Listrik",
    },
    {
      id: 3,
      riderId: "R-021",
      name: "Dedi Kurniawan",
      avatarVariant: "primary",
      avatarStatus: "busy",
      zone: "ZON-SDA-04",
      zoneColor: "text-red-600 dark:text-red-400",
      status: "tugas",
      statusLabel: "Dalam Tugas",
      coords: "-7.3189, 112.7312",
      task: "Ambil pesanan",
      duration: "42 mnt",
      vehicle: "Gerobak Kopi",
    },
    {
      id: 4,
      riderId: "R-027",
      name: "Eka Wahyuni",
      avatarVariant: "warning",
      avatarStatus: "warning",
      zone: "ZON-SDA-02",
      zoneColor: "text-blue-600 dark:text-blue-400",
      status: "tersedia",
      statusLabel: "Tersedia",
      coords: "-7.3102, 112.7198",
      task: "Standby di Hub",
      duration: "-",
      vehicle: "Motor Listrik",
    },
    {
      id: 5,
      riderId: "R-033",
      name: "Fajar Nugroho",
      avatarVariant: "neutral",
      avatarStatus: "offline",
      zone: "ZON-SDA-01",
      zoneColor: "text-orange-600 dark:text-orange-400",
      status: "offline",
      statusLabel: "Offline",
      coords: "-",
      task: "-",
      duration: "-",
      vehicle: "Gerobak Kopi",
    },
    {
      id: 6,
      riderId: "R-036",
      name: "Gita Pratama",
      avatarVariant: "purple",
      avatarStatus: "online",
      zone: "ZON-SDA-03",
      zoneColor: "text-emerald-600 dark:text-emerald-400",
      status: "aktif",
      statusLabel: "Aktif",
      coords: "-7.3147, 112.7256",
      task: "Antar pesanan",
      duration: "22 mnt",
      vehicle: "Motor Listrik",
    },
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRiders(sampleRiders.map((r) => r.id));
    } else {
      setSelectedRiders([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedRiders.includes(id)) {
      setSelectedRiders(selectedRiders.filter((rId) => rId !== id));
    } else {
      setSelectedRiders([...selectedRiders, id]);
    }
  };

  const filteredRiders = sampleRiders.filter((rider) => {
    const matchesSearch =
      rider.name.toLowerCase().includes(searchRider.toLowerCase()) ||
      rider.riderId.toLowerCase().includes(searchRider.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || rider.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Top Header */}
      <PageHeader
        title="MOVA Design System v3.0"
        description="Living Component Showcase & Visual Style Guide — Sesuai referensi assets/img (dashboard.png & operational rider.png)"
        badge="SSOT v3.0"
        actions={
          <div className="flex items-center gap-3">
            {/* Header Weather Widget Replica */}
            <WeatherHeaderWidget
              temperature="31°C"
              condition="Cerah Berawan"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Showcase Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#FAFAFA] dark:bg-[#18202F] p-1 border border-[#E5E5E5] dark:border-[#263244] rounded-xl flex-wrap">
          <TabsTrigger value="overview">Design System & Colors</TabsTrigger>
          <TabsTrigger value="weather_vehicles">Weather & Vehicles</TabsTrigger>
          <TabsTrigger value="statcards">Metrics StatCards</TabsTrigger>
          <TabsTrigger value="badges_avatars">Badges & Avatars</TabsTrigger>
          <TabsTrigger value="rider_table">Daftar Rider Table</TabsTrigger>
          <TabsTrigger value="controls">Form Controls</TabsTrigger>
        </TabsList>

        {/* ====================================================================
            TAB 1: DESIGN SYSTEM, COLORS & TYPOGRAPHY
            ==================================================================== */}
        <TabsContent value="overview" className="space-y-8 mt-6">
          {/* 1. Color Palette Tokens from assets/img/desain color.png */}
          <Panel title="Color Palette Tokens (SSOT: assets/img/desain color.png)">
            <p className="text-xs text-[#525252] dark:text-[#CBD5E1] mb-4">
              Palet warna resmi yang diekstrak langsung dari panduan desain sistem v3.0.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {/* Primary Blue */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#2563EB] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Primary Blue</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#2563EB</div>
              </div>

              {/* Primary Hover */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#1D4ED8] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Primary Hover</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#1D4ED8</div>
              </div>

              {/* Accent Orange */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#F97316] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Accent Orange</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#F97316</div>
              </div>

              {/* Success */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#10B981] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Success</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#10B981</div>
              </div>

              {/* Warning */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#F59E0B] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Warning</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#F59E0B</div>
              </div>

              {/* Danger */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#EF4444] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Danger</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#EF4444</div>
              </div>

              {/* Neutral 50 */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#FAFAFA] border border-[#E5E5E5] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Neutral 50</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#FAFAFA</div>
              </div>

              {/* Neutral 900 */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#171717] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Neutral 900</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#171717</div>
              </div>

              {/* Surface Light */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#FFFFFF] border border-[#E5E5E5] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Surface Light</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#FFFFFF</div>
              </div>

              {/* Surface Dark */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#263244] bg-white dark:bg-[#131822]">
                <div className="w-full h-12 rounded bg-[#131822] mb-2 shadow-xs" />
                <div className="text-xs font-bold text-[#171717] dark:text-white">Surface Dark</div>
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#94A3B8]">#131822</div>
              </div>
            </div>
          </Panel>

          {/* 2. Typography Hierarchy (Inter) */}
          <Panel title="Typography Hierarchy (Font: Inter)">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#F0F0F0] dark:border-[#1E293B] pb-2">
                <div>
                  <h1 className="text-3xl font-bold text-[#171717] dark:text-white font-heading">
                    Heading 1 — 32px / Bold (700)
                  </h1>
                </div>
                <span className="text-xs font-mono text-[#737373]">32px / 700</span>
              </div>

              <div className="flex items-baseline justify-between border-b border-[#F0F0F0] dark:border-[#1E293B] pb-2">
                <div>
                  <h2 className="text-2xl font-semibold text-[#171717] dark:text-white font-heading">
                    Heading 2 — 24px / SemiBold (600)
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#737373]">24px / 600</span>
              </div>

              <div className="flex items-baseline justify-between border-b border-[#F0F0F0] dark:border-[#1E293B] pb-2">
                <div>
                  <h3 className="text-xl font-semibold text-[#171717] dark:text-white font-heading">
                    Heading 3 — 20px / SemiBold (600)
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#737373]">20px / 600</span>
              </div>

              <div className="flex items-baseline justify-between border-b border-[#F0F0F0] dark:border-[#1E293B] pb-2">
                <div>
                  <p className="text-sm font-normal text-[#171717] dark:text-[#E2E8F0]">
                    Body Regular — 14px / Regular (400) · Operational table data, form inputs, and descriptive texts.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#737373]">14px / 400</span>
              </div>

              <div className="flex items-baseline justify-between border-b border-[#F0F0F0] dark:border-[#1E293B] pb-2">
                <div>
                  <p className="text-xs font-normal text-[#525252] dark:text-[#CBD5E1]">
                    Small Text — 12px / Regular (400) · Subtext, captions, and secondary metadata.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#737373]">12px / 400</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#94A3B8]">
                    Caption / Header — 11px / SemiBold (600) · Table headers, badges, metric labels.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#737373]">11px / 600</span>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ====================================================================
            TAB 2: WEATHER WIDGET & RIDER VEHICLES
            ==================================================================== */}
        <TabsContent value="weather_vehicles" className="space-y-8 mt-6">
          {/* Weather Widget */}
          <Panel title="Kondisi Cuaca & Lingkungan (assets/img/dashboard.png)">
            <p className="text-xs text-[#525252] dark:text-[#CBD5E1] mb-4">
              Komponen widget cuaca operasional lengkap dengan parameter suhu, kelembaban, curah hujan, angin, dan jarak pandang.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Full Card Widget */}
              <WeatherCardWidget
                city="Sidoarjo"
                temperature="31°C"
                condition="Cerah Berawan"
                humidity="65%"
                rainfall="20%"
                windSpeed="12.5 km/j"
                visibility="10.0 km"
                onDetailClick={() => addToast("Membuka detail intelijen cuaca...", "info")}
              />

              {/* Mini Weather Header Variants */}
              <div className="space-y-4 bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#1E293B] rounded-xl p-4">
                <h4 className="text-xs font-bold text-[#171717] dark:text-white">
                  Header & Topbar Weather Badges
                </h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <WeatherHeaderWidget temperature="31°C" condition="Cerah Berawan" />
                  <WeatherHeaderWidget temperature="28°C" condition="Hujan Ringan" />
                  <WeatherHeaderWidget temperature="33°C" condition="Cerah Panas" />
                </div>
              </div>
            </div>
          </Panel>

          {/* Rider Vehicle Icons */}
          <Panel title="Ikon Kendaraan Operasional Rider (Gerobak Kopi & Motor Listrik)">
            <p className="text-xs text-[#525252] dark:text-[#CBD5E1] mb-4">
              Ikon custom SVG presisi tinggi untuk armada operasional MOVA (Gerobak Kopi keliling dan Motor Listrik ramah lingkungan).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Gerobak Kopi Light Card */}
              <div className="p-4 bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#1E293B] rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] border border-orange-200 dark:border-orange-800/40 flex items-center justify-center">
                  <GerobakKopiIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#171717] dark:text-white">Gerobak Kopi</div>
                  <div className="text-[11px] text-[#737373]">Coffee Cart Portable</div>
                </div>
              </div>

              {/* Motor Listrik Card */}
              <div className="p-4 bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#1E293B] rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] border border-blue-200 dark:border-blue-800/40 flex items-center justify-center">
                  <MotorListrikIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#171717] dark:text-white">Motor Listrik</div>
                  <div className="text-[11px] text-[#737373]">Electric Vehicle (EV)</div>
                </div>
              </div>

              {/* Gerobak Kopi Green Card */}
              <div className="p-4 bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#1E293B] rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#10B981] border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center">
                  <GerobakKopiIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#171717] dark:text-white">Gerobak Aktif</div>
                  <div className="text-[11px] text-[#10B981] font-semibold">12 Unit Bertugas</div>
                </div>
              </div>

              {/* Motor Listrik Sky Card */}
              <div className="p-4 bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#1E293B] rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#0284C7] border border-sky-200 dark:border-sky-800/40 flex items-center justify-center">
                  <MotorListrikIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#171717] dark:text-white">Motor EV Aktif</div>
                  <div className="text-[11px] text-[#0284C7] font-semibold">8 Unit Bertugas</div>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ====================================================================
            TAB 3: METRICS STATCARDS
            ==================================================================== */}
        <TabsContent value="statcards" className="space-y-8 mt-6">
          {/* Dashboard Stats */}
          <Panel title="Dashboard Top StatCards (assets/img/dashboard.png)">
            <p className="text-xs text-[#525252] dark:text-[#CBD5E1] mb-4">
              Kartu metrik dashboard 5-kolom dengan icon badge, denominator, dan tren operasional.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard
                label="Zona Aktif"
                value="12"
                denominator="dari 17 zona"
                trend="↑ 2 zona"
                trendType="success"
                icon={MapPin}
                iconVariant="success"
              />
              <StatCard
                label="Rider Aktif"
                value="8"
                denominator="dari 12 rider"
                trend="↑ 1 rider"
                trendType="success"
                icon={Users}
                iconVariant="primary"
              />
              <StatCard
                label="Armada Tersedia"
                value="5"
                denominator="dari 8 unit"
                trend="→ 0 unit"
                trendType="neutral"
                icon={Truck}
                iconVariant="purple"
              />
              <StatCard
                label="Tingkat Kepatuhan Zona"
                value="87%"
                subtext="berdasarkan GPS & geofence"
                trend="↑ 5%"
                trendType="success"
                icon={Shield}
                iconVariant="orange"
              />
              <StatCard
                label="Penjualan Hari Ini"
                value="Rp 2.450.000"
                denominator="dari 163 transaksi"
                trend="↑ 12%"
                trendType="success"
                icon={BarChart3}
                iconVariant="info"
              />
            </div>
          </Panel>

          {/* Operational Rider Stats */}
          <Panel title="Operasional Rider StatCards (assets/img/operational rider.png)">
            <p className="text-xs text-[#525252] dark:text-[#CBD5E1] mb-4">
              Metrik khusus untuk halaman Operasional Rider dengan indikator status kehadiran dan rata-rata durasi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard
                label="Total Rider"
                value="48"
                trend="↑ 12%"
                trendLabel="dari kemarin"
                trendType="success"
                icon={Users}
                iconVariant="orange"
              />
              <StatCard
                label="Rider Aktif"
                value="42"
                denominator="/ 48"
                subtext="• 87.5%"
                icon={Users}
                iconVariant="primary"
              />
              <StatCard
                label="Dalam Tugas"
                value="36"
                trend="↑ 75.0%"
                trendType="info"
                icon={Bike}
                iconVariant="info"
              />
              <StatCard
                label="Offline"
                value="6"
                subtext="• 12.5%"
                icon={AlertTriangle}
                iconVariant="danger"
              />
              <StatCard
                label="Rata-rata Waktu Tugas"
                value="28 mnt"
                trend="↓ 18%"
                trendLabel="dari kemarin"
                trendType="success"
                icon={Clock}
                iconVariant="warning"
              />
            </div>
          </Panel>
        </TabsContent>

        {/* ====================================================================
            TAB 4: BADGES & AVATARS
            ==================================================================== */}
        <TabsContent value="badges_avatars" className="space-y-8 mt-6">
          {/* Avatars */}
          <Panel title="Avatar System & Status Indicators">
            <p className="text-xs text-[#525252] dark:text-[#CBD5E1] mb-4">
              Avatar dengan inisial fallback dinamis, variasi warna peran, dan status dot indikator (online, busy, warning, offline).
            </p>

            <div className="space-y-6">
              {/* Sizes */}
              <div>
                <h4 className="text-xs font-bold text-[#171717] dark:text-white mb-3">
                  Ukuran Avatar (xs: 20px, sm: 24px, md: 32px, lg: 40px, xl: 48px)
                </h4>
                <div className="flex items-center gap-4">
                  <Avatar fallback="SA" size="xs" status="online" />
                  <Avatar fallback="BS" size="sm" status="online" />
                  <Avatar fallback="CL" size="md" status="busy" />
                  <Avatar fallback="DK" size="lg" status="warning" />
                  <Avatar fallback="EW" size="xl" status="offline" />
                </div>
              </div>

              {/* Status Indicator Dots */}
              <div>
                <h4 className="text-xs font-bold text-[#171717] dark:text-white mb-3">
                  Status Indicator Dots
                </h4>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex items-center gap-2">
                    <Avatar fallback="BS" status="online" variant="success" />
                    <span className="text-xs text-[#525252] dark:text-[#CBD5E1]">Online / Aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar fallback="DK" status="busy" variant="primary" />
                    <span className="text-xs text-[#525252] dark:text-[#CBD5E1]">Dalam Tugas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar fallback="EW" status="warning" variant="warning" />
                    <span className="text-xs text-[#525252] dark:text-[#CBD5E1]">Tersedia / Standby</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar fallback="FN" status="offline" variant="neutral" />
                    <span className="text-xs text-[#525252] dark:text-[#CBD5E1]">Offline</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Badges & Status Pills */}
          <Panel title="Badges & Semantic Status Pills (assets/img)">
            <div className="space-y-6">
              {/* Status Pills */}
              <div>
                <h4 className="text-xs font-bold text-[#171717] dark:text-white mb-3">
                  Operational Status Pills
                </h4>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge variant="live">Live Tracking</Badge>
                  <Badge variant="aktif" withDot>Aktif</Badge>
                  <Badge variant="tugas" withDot>Dalam Tugas</Badge>
                  <Badge variant="tersedia" withDot>Tersedia</Badge>
                  <Badge variant="offline" withDot>Offline</Badge>
                  <Badge variant="orange" withDot>Pending Sync</Badge>
                </div>
              </div>

              {/* TOPSIS & Ranking Badges */}
              <div>
                <h4 className="text-xs font-bold text-[#171717] dark:text-white mb-3">
                  DSS & TOPSIS Ranking Badges
                </h4>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge variant="success">Terbaik</Badge>
                  <Badge variant="success">Sangat Baik</Badge>
                  <Badge variant="info">Baik</Badge>
                  <Badge variant="warning">Cukup</Badge>
                  <Badge variant="danger">Kurang</Badge>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ====================================================================
            TAB 5: OPERATIONAL RIDER DATA TABLE
            ==================================================================== */}
        <TabsContent value="rider_table" className="space-y-8 mt-6">
          <Panel title="Daftar Rider Table (assets/img/operational rider.png)">
            <p className="text-xs text-[#525252] dark:text-[#CBD5E1] mb-4">
              Replika presisi komponen tabel Daftar Rider dengan search, filter status, checkbox multi-select, avatar, zona badge, dan font typography Inter.
            </p>

            {/* Table Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <input
                    type="text"
                    placeholder="Cari rider..."
                    value={searchRider}
                    onChange={(e) => setSearchRider(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] rounded-lg text-[#171717] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] rounded-lg text-[#171717] dark:text-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="tugas">Dalam Tugas</option>
                  <option value="tersedia">Tersedia</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </Button>
                <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Penugasan Manual</span>
                </Button>
              </div>
            </div>

            {/* Table Container */}
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedRiders.length === sampleRiders.length}
                        className="rounded border-[#E5E5E5] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                    </TableHead>
                    <TableHead className="w-12 text-center">No.</TableHead>
                    <TableHead className="w-24">Rider ID</TableHead>
                    <TableHead>Nama Rider</TableHead>
                    <TableHead>Zona Saat Ini</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posisi Terakhir</TableHead>
                    <TableHead>Tugas Aktif</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead className="w-12 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRiders.map((rider, index) => {
                    const isSelected = selectedRiders.includes(rider.id);
                    return (
                      <TableRow key={rider.id} isSelected={isSelected}>
                        {/* Checkbox */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(rider.id)}
                            className="rounded border-[#E5E5E5] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                          />
                        </TableCell>

                        {/* No */}
                        <TableCell className="text-center text-xs font-mono text-[#737373]">
                          {index + 1}
                        </TableCell>

                        {/* Rider ID */}
                        <TableCell className="font-mono text-xs font-bold text-[#171717] dark:text-white">
                          {rider.riderId}
                        </TableCell>

                        {/* Nama Rider with Avatar */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              fallback={rider.name}
                              size="sm"
                              variant={rider.avatarVariant}
                              status={rider.avatarStatus}
                            />
                            <div>
                              <div className="font-semibold text-xs text-[#171717] dark:text-white">
                                {rider.name}
                              </div>
                              <div className="text-[10px] text-[#737373] flex items-center gap-1">
                                {rider.vehicle === "Gerobak Kopi" ? (
                                  <GerobakKopiIcon className="w-3 h-3 text-[#EA580C]" />
                                ) : (
                                  <MotorListrikIcon className="w-3 h-3 text-[#2563EB]" />
                                )}
                                <span>{rider.vehicle}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Zona */}
                        <TableCell>
                          <span className={`text-xs font-bold ${rider.zoneColor}`}>
                            {rider.zone}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={rider.status} withDot size="sm">
                            {rider.statusLabel}
                          </Badge>
                        </TableCell>

                        {/* Posisi Terakhir */}
                        <TableCell className="font-mono text-xs text-[#737373] dark:text-[#94A3B8]">
                          {rider.coords}
                        </TableCell>

                        {/* Tugas Aktif */}
                        <TableCell className="text-xs text-[#525252] dark:text-[#CBD5E1]">
                          {rider.task}
                        </TableCell>

                        {/* Waktu Tugas */}
                        <TableCell className="text-xs font-mono text-[#737373] dark:text-[#94A3B8]">
                          {rider.duration}
                        </TableCell>

                        {/* Aksi */}
                        <TableCell className="text-center">
                          <button className="p-1 rounded-md hover:bg-[#F0F0F0] dark:hover:bg-[#1E293B] text-[#737373] transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Panel>
        </TabsContent>

        {/* ====================================================================
            TAB 6: FORM CONTROLS & BUTTONS
            ==================================================================== */}
        <TabsContent value="controls" className="space-y-8 mt-6">
          <Panel title="Buttons & Interactive Controls">
            <div className="space-y-6">
              {/* Button Variants */}
              <div>
                <h4 className="text-xs font-bold text-[#171717] dark:text-white mb-3">
                  Button Variants (Primary Blue #2563EB)
                </h4>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary" size="md">
                    Primary Button
                  </Button>
                  <Button variant="secondary" size="md">
                    Secondary Button
                  </Button>
                  <Button variant="outline" size="md">
                    Outline Button
                  </Button>
                  <Button variant="ghost" size="md">
                    Ghost Button
                  </Button>
                  <Button variant="destructive" size="md">
                    Destructive Button
                  </Button>
                  <Button variant="primary" size="md" disabled>
                    Disabled Button
                  </Button>
                </div>
              </div>

              {/* Form Inputs */}
              <div>
                <h4 className="text-xs font-bold text-[#171717] dark:text-white mb-3">
                  Form Inputs (Radius 6px / md)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input placeholder="Nama Zona Geofence..." label="Input Text" />
                  <Input placeholder="admin@kopikeliling.com" label="Input Email" />
                  <Input placeholder="Password..." type="password" label="Input Password" />
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ShowcasePage;
