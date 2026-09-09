import React, { useState } from "react";
import {
  Alert,
  Badge,
  StatusBadge,
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
  MetricSkeleton,
  PanelSkeleton,
  TableSkeleton,
  Modal,
  MovaLoading,
  Spinner,
  PageHeader,
  Panel,
  Select,
  SemanticMetric,
  StatCard,
  Skeleton,
  Switch,
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  useToast,
  Tooltip,
} from "../../components/ui/index.js";
import {
  Sparkles,
  Layers,
  MousePointerClick,
  SlidersHorizontal,
  Tag,
  BarChart3,
  LayoutGrid,
  BellRing,
  Table2,
  FolderSync,
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
} from "lucide-react";
import { HubWeatherControlCard, WeatherTimelineWidget } from "../../components/dashboard/index.js";

export function ShowcasePage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("buttons");

  // Interactive state hooks
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState("right");
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);
  const [checkbox1, setCheckbox1] = useState(true);
  const [checkbox2, setCheckbox2] = useState(false);
  const [checkboxIndet, setCheckboxIndet] = useState(true);
  const [sampleText, setSampleText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("SUPERADMIN");
  const [showAlert, setShowAlert] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSimulateAction = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      toast.success("Aksi simulasi berhasil dieksekusi!");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <PageHeader
        title="Design System & Component Showcase"
        description="Pusat pratinjau komponen UI enterprise, tipografi Inter, token Signature Orange, dan geometri 4-8px Single-Tenant."
        badge={
          <Badge variant="primary" size="sm" withDot>
            MOVA SSOT v2.0
          </Badge>
        }
        actionLabel="Simulasi Aksi"
        actionIcon={Sparkles}
        onActionClick={handleSimulateAction}
      >
        <Button
          variant="secondary"
          size="sm"
          leftIcon={Layers}
          onClick={() => {
            setIsDrawerOpen(true);
            setDrawerPosition("right");
          }}
        >
          Buka Drawer
        </Button>
      </PageHeader>

      {/* Main Showcase Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 border-slate-200 p-1 flex-wrap">
          <TabsTrigger value="buttons" leftIcon={MousePointerClick}>
            Buttons
          </TabsTrigger>
          <TabsTrigger value="forms" leftIcon={SlidersHorizontal}>
            Form Controls
          </TabsTrigger>
          <TabsTrigger value="badges" leftIcon={Tag}>
            Badges & Status
          </TabsTrigger>
          <TabsTrigger value="metrics" leftIcon={BarChart3}>
            Metrics & KPIs
          </TabsTrigger>
          <TabsTrigger value="containers" leftIcon={LayoutGrid}>
            Panels & Cards
          </TabsTrigger>
          <TabsTrigger value="feedback" leftIcon={BellRing}>
            Alerts & Toasts
          </TabsTrigger>
          <TabsTrigger value="tables" leftIcon={Table2}>
            Data Tables
          </TabsTrigger>
          <TabsTrigger value="tokens" leftIcon={FolderSync}>
            Design Tokens
          </TabsTrigger>
        </TabsList>

        {/* ==========================================================================
            TAB 1: BUTTONS & ACTION TRIGGERS
           ========================================================================== */}
        <TabsContent value="buttons" className="space-y-6">
          <Panel
            title="Button Variants & Semantic Actions"
            description="Semua variasi tombol menggunakan font Inter, warna Signature Orange (#ea580c), background kontras tinggi, dan border radius 6px."
          >
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  1. Visual Variants (Size: Medium)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" leftIcon={Sparkles}>
                    Primary Action
                  </Button>
                  <Button variant="secondary" leftIcon={Layers}>
                    Secondary Action
                  </Button>
                  <Button variant="outline" leftIcon={Download}>
                    Outline Action
                  </Button>
                  <Button variant="subtle" leftIcon={Flame}>
                    Subtle Accent
                  </Button>
                  <Button variant="danger" leftIcon={Trash2}>
                    Danger / Destructive
                  </Button>
                  <Button variant="ghost" leftIcon={Eye}>
                    Ghost Action
                  </Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  2. Size Hierarchy (Small 32px, Medium 36px, Large 40px, Icon)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="primary">
                    Small (32px)
                  </Button>
                  <Button size="md" variant="primary">
                    Medium (36px)
                  </Button>
                  <Button size="lg" variant="primary">
                    Large (40px)
                  </Button>
                  <Button size="icon" variant="secondary" aria-label="Settings">
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" aria-label="Refresh">
                    <FolderSync className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Dynamic States */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  3. Dynamic States (Loading, Pending, Disabled)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" loading={btnLoading} onClick={handleSimulateAction}>
                    {btnLoading ? "Memproses..." : "Klik untuk Loading State"}
                  </Button>
                  <Button variant="secondary" loading>
                    Loading Secondary
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled Primary
                  </Button>
                  <Button variant="secondary" disabled>
                    Disabled Secondary
                  </Button>
                  <Button variant="danger" disabled>
                    Disabled Danger
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 2: FORM CONTROLS & INPUTS
           ========================================================================== */}
        <TabsContent value="forms" className="space-y-6">
          <Panel
            title="Enterprise Form Controls & Input Fields"
            description="Input teks, search bar, dropdown select, switch toggle, dan custom checkbox dengan font Inter dan focus ring Signature Orange."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Text Inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Text & Search Inputs
                </h4>
                <Input
                  label="Nama Rider Operasional"
                  placeholder="Contoh: Budi Santoso"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  helperText="Wajib sesuai dengan identitas KTP resmi."
                  required
                />
                <Input
                  label="Pencarian Spasial & POI"
                  placeholder="Ketik nama jalan atau landmark..."
                  leftIcon={Search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Input
                  label="Input dengan Error State"
                  placeholder="email@mova.id"
                  defaultValue="invalid-email"
                  error="Format email tidak valid atau belum terdaftar."
                  required
                />
                <Input
                  label="Disabled Input Field"
                  defaultValue="ID_SYS_READ_ONLY_001"
                  disabled
                />
              </div>

              {/* Select & Toggles */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Select Dropdowns & Toggles
                </h4>
                <Select
                  label="Pilih Role Pengguna (RBAC)"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  options={[
                    { value: "SUPERADMIN", label: "SUPERADMIN — Kontrol Penuh Sistem" },
                    { value: "MANAGEMENT", label: "MANAGEMENT — Analitik & Keuangan" },
                    { value: "SUPERVISOR", label: "SUPERVISOR — Komando Lapangan" },
                    { value: "RIDER", label: "RIDER — Eksekusi Lapangan & POS" },
                  ]}
                  helperText="Hak akses akan disesuaikan otomatis dengan peran ini."
                  required
                />

                <div className="p-4 rounded-[6px] bg-slate-50 border border-slate-200 space-y-4">
                  <h5 className="text-xs font-semibold text-slate-800">Switch Toggles (4px Rectangular Track)</h5>
                  <Switch
                    checked={switch1}
                    onChange={setSwitch1}
                    label="Notifikasi Real-Time LBS Geofence"
                    description="Kirim push alert ke ruang Supervisor jika ada rider yang keluar zona."
                  />
                  <Switch
                    checked={switch2}
                    onChange={setSwitch2}
                    label="Mode Auto-Assign Antrean FIFO"
                    description="Zona rekomendasi teratas TOPSIS akan dipasangkan otomatis."
                  />
                </div>

                <div className="p-4 rounded-[6px] bg-slate-50 border border-slate-200 space-y-3">
                  <h5 className="text-xs font-semibold text-slate-800">Custom Checkboxes (4px Corner)</h5>
                  <Checkbox
                    checked={checkbox1}
                    onChange={setCheckbox1}
                    label="Aktifkan Validasi PostGIS ST_Covers"
                    description="Hanya izinkan check-in jika koordinat GPS rider berada di dalam poligon."
                  />
                  <Checkbox
                    checked={checkbox2}
                    onChange={setCheckbox2}
                    label="Otomatis Lepas Hold Armada setelah 5 Menit"
                  />
                  <Checkbox
                    indeterminate={checkboxIndet}
                    onChange={() => setCheckboxIndet(!checkboxIndet)}
                    label="Indeterminate State (Multi-selection)"
                  />
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 3: BADGES & STATUS TAGS
           ========================================================================== */}
        <TabsContent value="badges" className="space-y-6">
          <Panel
            title="Badges, Operational Status & Semantic Tags"
            description="Tag status operasional dengan palet warna semantic (Success, Warning, Danger, Info, Neutral) dalam varian Pill dan Rectangular."
          >
            <div className="space-y-6">
              {/* Operational Fleet & Session Statuses */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  1. Operational State Tags (with Live Pulse Dot)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge variant="success" withDot>
                    OPERATING / ACTIVE
                  </StatusBadge>
                  <StatusBadge variant="warning" withDot>
                    RESERVED (5 MIN)
                  </StatusBadge>
                  <StatusBadge variant="primary" withDot>
                    IN_USE (ARMADA)
                  </StatusBadge>
                  <StatusBadge variant="danger" withDot>
                    MAINTENANCE
                  </StatusBadge>
                  <StatusBadge variant="info" withDot>
                    CHECKED_IN
                  </StatusBadge>
                  <StatusBadge variant="neutral" withDot>
                    COMPLETED / OFF-DUTY
                  </StatusBadge>
                </div>
              </div>

              {/* LBS & Compliance Statuses */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  2. Geofence & Spatial Compliance
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success" shape="pill">
                    COMPLIANT (IN ZONE)
                  </Badge>
                  <Badge variant="danger" shape="pill">
                    DEVIATED (OUT OF BOUNDS)
                  </Badge>
                  <Badge variant="warning" shape="pill">
                    PROHIBITED ROAD ALERT (≤50M)
                  </Badge>
                  <Badge variant="info" shape="pill">
                    WAITING (FIFO QUEUE)
                  </Badge>
                </div>
              </div>

              {/* Rectangular Enterprise Tags */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  3. Enterprise Rectangular Tags (Shape: rect, 4px radius)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="primary" shape="rect">
                    BWM OPTIMIZED
                  </Badge>
                  <Badge variant="success" shape="rect">
                    TOPSIS RANK #1
                  </Badge>
                  <Badge variant="warning" shape="rect">
                    WEATHER C4 HIGH
                  </Badge>
                  <Badge variant="danger" shape="rect">
                    COMPETITOR C6 DENSE
                  </Badge>
                  <Badge variant="neutral" shape="rect">
                    OVERPASS RAW POI
                  </Badge>
                  <Badge variant="outline" shape="rect">
                    SYSTEM SSOT
                  </Badge>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 4: METRICS & KPI CARDS
           ========================================================================== */}
        <TabsContent value="metrics" className="space-y-6">
          <Panel
            title="SemanticMetric & Executive KPI Cards"
            description="Komponen kartu KPI dengan penanganan khusus nilai 0, NO_DATA, PROTECTED_ROLE, dan indikator tren naik/turun."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SemanticMetric
                label="Total Pendapatan Lapangan"
                metric={{ value: 14850000, formatted: "Rp 14.850.000" }}
                icon={Activity}
                trend={{ value: "+18.4%", isPositive: true }}
                badge="HARI INI"
                badgeVariant="success"
                subtext="Dari 342 transaksi valid"
              />
              <SemanticMetric
                label="Rider Sedang Beroperasi"
                metric={{ value: 18, formatted: "18 Rider" }}
                icon={Truck}
                trend={{ value: "+3 Rider", isPositive: true }}
                badge="LIVE"
                badgeVariant="primary"
                subtext="18 dari 20 armada terpakai"
              />
              <SemanticMetric
                label="Tingkat Kepatuhan Geofence"
                metric={{ value: 96.5, formatted: "96.5%" }}
                icon={MapPin}
                trend={{ value: "-1.2%", isPositive: false }}
                badge="COMPLIANT"
                badgeVariant="info"
                subtext="Zona Alun-Alun & GOR Delta"
              />
              <SemanticMetric
                label="Konsistensi DSS (BWM CR)"
                metric={{ value: 0.042, formatted: "0.042" }}
                icon={Sparkles}
                badge="OPTIMAL"
                badgeVariant="success"
                subtext="Nilai Konsisten (CR < 0.20)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <SemanticMetric
                label="Financial Ledger (Supervisor View)"
                metric={{ data_status: "PROTECTED_ROLE", formatted: "PROTECTED_ROLE" }}
                icon={Shield}
                subtext="Informasi dibatasi untuk peran Supervisor"
              />
              <SemanticMetric
                label="Zona Belum Memiliki Penjualan"
                metric={{ data_status: "NO_DATA", formatted: "NO_DATA" }}
                icon={Calendar}
                subtext="Belum ada transaksi di sesi ini"
              />
              <SemanticMetric
                label="Valid Nilai Nol (Zero Preservation)"
                metric={{ value: 0, formatted: "0 Pelanggaran" }}
                icon={CheckCircle2}
                badge="BERSIH"
                badgeVariant="success"
                subtext="Nol pelanggaran jalan protokol"
              />
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 5: CONTAINERS, PANELS & CARDS
           ========================================================================== */}
        <TabsContent value="containers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel
              title="Standard Enterprise Panel"
              description="Struktur panel utama dengan header, deskripsi, action toolbar, dan footer."
              actions={
                <Button size="sm" variant="outline" leftIcon={Download}>
                  Ekspor Data
                </Button>
              }
              footer="Terakhir disinkronkan dengan PostgreSQL: 2 menit yang lalu"
            >
              <p className="text-xs text-slate-600 leading-relaxed">
                Panel ini merupakan blok penyusun utama halaman operasional seperti Manajemen Zona, POI, Katalog, dan Pelaporan. Border halus 1px (border-slate-200) memberikan pemisahan visual yang tajam, profesional, dan nyaman dibaca.
              </p>
            </Panel>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Enterprise Card Component</CardTitle>
                  <Badge variant="primary">CARD</Badge>
                </div>
                <CardDescription>
                  Wadah konten modular dengan header terpisah dan footer aksi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-600">
                  Kartu ini cocok untuk unit armada gerobak, ringkasan profil rider, atau ringkasan katalog produk menu kopi.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="success">AVAILABLE</Badge>
                  <span className="text-xs font-bold text-slate-900">Rp 15.000 / cup</span>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-slate-500">ID: PRD-KOPI-001</span>
                <Button size="sm" variant="primary">
                  Detail Menu
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Weather Intelligence & Hourly Timeline Widget */}
          <Panel
            title="Weather Intelligence & Hourly Timeline Forecast"
            description="Perkiraan cuaca per jam (Open-Meteo) yang dipairingkan ke slot waktu operasional (Pagi, Siang, Sore, Malam) untuk evaluasi DSS Kriteria C4."
          >
            <div className="space-y-4">
              <HubWeatherControlCard
                hubName="Sidoarjo Central Hub"
                hubCountry="Indonesia"
                temperature="32.5°C"
                weatherCondition="Cerah Berawan"
                feelsLike="36.0°C"
                rainProb="10%"
                humidity="60%"
                dewPoint="22.0°C"
                visibility="10.0km"
                activeZonesCount={4}
                activeFleetCount={12}
              />
              <WeatherTimelineWidget
                zoneId="826f1099-510d-4b48-bf76-a80777ce6dd6"
                zoneName="Zona Alun-Alun Sidoarjo"
                initialDate="today"
                initialSlot="pagi"
              />
            </div>
          </Panel>

          {/* Skeletons Showcase */}
          <Panel
            title="Animated Loading Skeleton Placeholders"
            description="Placeholder animasi untuk mencegah layout shift saat query TanStack Query sedang fetching data."
          >
            <div className="space-y-4">
              <MetricSkeleton count={4} />
              <PanelSkeleton height="h-28" />
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 6: FEEDBACK, ALERTS & TOASTS
           ========================================================================== */}
        <TabsContent value="feedback" className="space-y-6">
          <Panel
            title="Alert Banners, Toasts & System Feedback"
            description="Banner notifikasi, trigger toast mengambang, dan radar loading animation khas MOVA."
          >
            <div className="space-y-6">
              {/* Alert Banners */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  1. Alert Notification Banners
                </h4>
                {showAlert && (
                  <Alert
                    variant="info"
                    title="Informasi Operasional Shift Pagi"
                    onClose={() => setShowAlert(false)}
                  >
                    Antrean rider FIFO dibuka pukul 06:00 WIB. Pastikan seluruh unit armada telah dikalibrasi baterainya.
                  </Alert>
                )}
                <Alert variant="success" title="Check-in Spasial Berhasil">
                  Kehadiran Rider Budi Santoso di Zona Alun-Alun Sidoarjo telah diverifikasi oleh PostGIS ST_Covers.
                </Alert>
                <Alert variant="warning" title="Peringatan Presipitasi Cuaca (C4)">
                  Data Open-Meteo memprediksi potensi hujan 75% di Zona GOR Delta pada pukul 14:00 WIB.
                </Alert>
                <Alert variant="danger" title="Peringatan Pelanggaran Jalan Protokol">
                  Unit GBK-SDA-04 terdeteksi berada di radius 30m dari Jalan Protokol A. Yani (Batas Terlarang).
                </Alert>
              </div>

              {/* Toast Triggers */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  2. Interactive Toast Triggers (Floating Bottom-Right)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => toast.success("Transaksi penjualan 3x Kopi Susu berhasil dicatat!", "Penjualan Berhasil")}
                  >
                    Trigger Success Toast
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => toast.error("Unit armada sedang diklaim oleh rider lain.", "Klaim Ditolak")}
                  >
                    Trigger Error Toast
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.warning("Waktu hold armada tersisa 1 menit lagi.", "Peringatan Waktu")}
                  >
                    Trigger Warning Toast
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Data cuaca zona berhasil diperbarui dari Open-Meteo.", "Sinkronisasi Cuaca")}
                  >
                    Trigger Info Toast
                  </Button>
                </div>
              </div>

              {/* Empty State & Error Banner */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  3. Empty State & Error Fallback
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EmptyState
                    title="Tidak Ada Riwayat Sesi"
                    description="Rider ini belum melakukan check-in operasional pada tanggal yang dipilih."
                    action={
                      <Button size="sm" variant="primary" leftIcon={Plus}>
                        Mulai Sesi Baru
                      </Button>
                    }
                  />
                  <div className="space-y-3">
                    <ErrorFallbackBanner
                      title="Koneksi Redis Terputus"
                      error="Gagal mengambil data posisi live rider dari Redis Geo Index."
                      onRetry={() => toast.info("Mencoba menghubungkan ulang...")}
                    />
                    <div className="p-4 rounded-[6px] bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                      <MovaLoading size="sm" text="Memproses BWM Calculation..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 7: DATA TABLES & DIALOGS
           ========================================================================== */}
        <TabsContent value="tables" className="space-y-6">
          <Panel
            title="Operational Data Grid & Modal Dialogs"
            description="Tabel data operasional armada dengan sticky headers, status tags, action buttons, dan trigger modal."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={Plus}
                  onClick={() => setIsModalOpen(true)}
                >
                  Buka Modal Dialog
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={Layers}
                  onClick={() => {
                    setIsDrawerOpen(true);
                    setDrawerPosition("bottom");
                  }}
                >
                  Buka Bottom Sheet
                </Button>
              </div>
            }
          >
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KODE ARMADA</TableHead>
                    <TableHead>TIPE UNIT</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>RIDER PENUGASAN</TableHead>
                    <TableHead>ZONA TUGAS</TableHead>
                    <TableHead className="text-right">AKSI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-slate-900">GBK-SDA-01</TableCell>
                    <TableCell>Gerobak Kopi Premium</TableCell>
                    <TableCell>
                      <StatusBadge variant="success" withDot size="sm">
                        OPERATING
                      </StatusBadge>
                    </TableCell>
                    <TableCell>Budi Santoso</TableCell>
                    <TableCell>Zona Alun-Alun Sidoarjo</TableCell>
                    <TableCell className="text-right">
                      <Tooltip content="Lihat telemetry LBS">
                        <Button size="icon" variant="ghost">
                          <Eye className="w-3.5 h-3.5 text-[#ea580c]" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-slate-900">MTR-SDA-02</TableCell>
                    <TableCell>Motor Listrik Fleksibel</TableCell>
                    <TableCell>
                      <StatusBadge variant="warning" withDot size="sm">
                        RESERVED
                      </StatusBadge>
                    </TableCell>
                    <TableCell>Ahmad Fauzi (Hold 3m)</TableCell>
                    <TableCell>Zona GOR Delta</TableCell>
                    <TableCell className="text-right">
                      <Tooltip content="Ubah data armada">
                        <Button size="icon" variant="ghost">
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-slate-900">GBK-SDA-03</TableCell>
                    <TableCell>Gerobak Kopi Premium</TableCell>
                    <TableCell>
                      <StatusBadge variant="danger" withDot size="sm">
                        MAINTENANCE
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-slate-400 italic">-</TableCell>
                    <TableCell className="text-slate-400 italic">-</TableCell>
                    <TableCell className="text-right">
                      <Tooltip content="Hapus armada">
                        <Button size="icon" variant="ghost">
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 8: DESIGN TOKENS & PALETTE
           ========================================================================== */}
        <TabsContent value="tokens" className="space-y-6">
          <Panel
            title="MOVA Design Tokens & Color Palette (Light Enterprise SSOT)"
            description="Palet warna SSOT yang diselaraskan dengan Multi-Tenant Theme, tipografi Inter, dan geometri angular enterprise 4-8px."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Core Colors */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Brand & Canvas Colors
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-[6px] bg-[#ea580c] text-white shadow-xs">
                    <span className="text-xs font-bold block">Primary Signature</span>
                    <span className="text-[10px] opacity-90">#ea580c (Orange-600)</span>
                  </div>
                  <div className="p-3 rounded-[6px] bg-[#f97316] text-white shadow-xs">
                    <span className="text-xs font-bold block">Primary Hover</span>
                    <span className="text-[10px] opacity-90">#f97316 (Orange-500)</span>
                  </div>
                  <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-900 shadow-2xs">
                    <span className="text-xs font-bold block">Canvas Background</span>
                    <span className="text-[10px] text-slate-500">#F8FAFC (Slate-50)</span>
                  </div>
                  <div className="p-3 rounded-[6px] bg-white border border-slate-200 text-slate-900 shadow-xs">
                    <span className="text-xs font-bold block">Card & Panel Surface</span>
                    <span className="text-[10px] text-slate-500">#FFFFFF (Pure White)</span>
                  </div>
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Semantic Status Colors
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-[6px] bg-emerald-600 text-white shadow-xs">
                    <span className="text-xs font-bold block">Success</span>
                    <span className="text-[10px] opacity-90">#059669 (Emerald)</span>
                  </div>
                  <div className="p-3 rounded-[6px] bg-amber-500 text-white shadow-xs">
                    <span className="text-xs font-bold block">Warning</span>
                    <span className="text-[10px] opacity-90">#D97706 (Amber)</span>
                  </div>
                  <div className="p-3 rounded-[6px] bg-rose-600 text-white shadow-xs">
                    <span className="text-xs font-bold block">Danger</span>
                    <span className="text-[10px] opacity-90">#E11D48 (Rose)</span>
                  </div>
                  <div className="p-3 rounded-[6px] bg-blue-600 text-white shadow-xs">
                    <span className="text-xs font-bold block">Info</span>
                    <span className="text-[10px] opacity-90">#2563EB (Blue)</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

      {/* ==========================================================================
          INTERACTIVE MODAL DIALOG DEMO
         ========================================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Konfirmasi Penugasan Armada"
        description="Pastikan rider telah memverifikasi unit fisik gerobak di Hub sebelum mengonfirmasi."
      >
        <div className="space-y-4">
          <Alert variant="warning" title="Kunci Reservasi 5 Menit">
            Unit GBK-SDA-01 saat ini sedang ditahan. Setelah konfirmasi, status akan menjadi IN_USE.
          </Alert>
          <Input label="Catatan Tambahan Supervisor" placeholder="Misal: Baterai 100%, siap operasi..." />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                toast.success("Armada GBK-SDA-01 resmi ditugaskan ke Rider!");
              }}
            >
              Konfirmasi Penugasan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ==========================================================================
          INTERACTIVE DRAWER / BOTTOM SHEET DEMO
         ========================================================================== */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position={drawerPosition}
        title="Detail Spasial & Informasi Zona"
        description="Data analitik real-time PostGIS ST_Covers & bobot C1-C6 TOPSIS."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Zona Terpilih</span>
            <h4 className="text-sm font-bold text-slate-900">Zona Alun-Alun Sidoarjo</h4>
            <p className="text-xs text-slate-500">Luas Poligon: 1.42 km² | Kapasitas Maksimal: 8 Rider</p>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-800">Kriteria Rekomendasi TOPSIS</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-[4px] bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Densitas POI (C1)</span>
                <span className="font-bold text-slate-900">42 Titik</span>
              </div>
              <div className="p-2.5 rounded-[4px] bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Diversitas POI (C2)</span>
                <span className="font-bold text-slate-900">18 Kategori</span>
              </div>
              <div className="p-2.5 rounded-[4px] bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Skor Waktu C3</span>
                <span className="font-bold text-emerald-600">0.88 (Sangat Ramai)</span>
              </div>
              <div className="p-2.5 rounded-[4px] bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Risiko Cuaca C4</span>
                <span className="font-bold text-blue-600">12% (Aman)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Tutup Drawer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsDrawerOpen(false);
                toast.info("Membuka tampilan peta ops untuk Zona Alun-Alun...");
              }}
            >
              Buka di Peta
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
