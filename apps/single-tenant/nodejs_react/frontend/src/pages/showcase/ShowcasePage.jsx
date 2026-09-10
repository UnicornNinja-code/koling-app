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
  Sun,
  Moon,
  Info,
  ShieldAlert,
  Check,
  Compass,
  Bike,
  RefreshCw,
  Clock,
  Printer,
  DollarSign,
  Cpu,
} from "../../components/common/icons.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { HubWeatherControlCard, WeatherTimelineWidget } from "../../components/dashboard/index.js";

export function ShowcasePage() {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  const { confirm } = useConfirm();
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

  // Confirmation modal demonstration triggers
  const handleTestDangerConfirm = async () => {
    const ok = await confirm({
      title: "Nonaktifkan Akun Pengguna?",
      message: "Akun Rider Fajar Nugraha (ID: RDR-004) akan dinonaktifkan. Sesi operasional dan klaim armada aktif akan dibatalkan.",
      confirmText: "Ya, Nonaktifkan Akun",
      cancelText: "Batal",
      type: "danger",
      entityDetails: {
        "Nama Pengguna": "Fajar Nugraha",
        "Role": "RIDER",
        "Zona Bertugas": "Zona 02 (Alun-Alun Sidoarjo)",
        "Dampak": "Sesi GPS & Klaim Armada #001 Dicabut",
      },
    });
    if (ok) {
      toast.showToast("Akun pengguna berhasil dinonaktifkan!", "danger");
    } else {
      toast.showToast("Tindakan dibatalkan oleh pengguna", "info");
    }
  };

  const handleTestWarningConfirm = async () => {
    const ok = await confirm({
      title: "Supervisor Override DSS Recommendation?",
      message: "Anda akan mengubah alokasi zona yang direkomendasikan DSS BWM-TOPSIS. Tindakan ini akan dicatat ke dalam Laporan Akurasi DSS.",
      confirmText: "Terapkan Override",
      cancelText: "Batal",
      type: "warning",
      entityDetails: {
        "Rider": "Budi Santoso (RDR-002)",
        "Zona Asal (DSS)": "Zona 01 (Skor TOPSIS: 0.892)",
        "Zona Baru (Manual)": "Zona 08 (Stasiun Sidoarjo)",
        "Alasan": "Permintaan Event Bazar Pemda",
      },
    });
    if (ok) {
      toast.showToast("Override penugasan berhasil diterapkan & dicatat!", "warning");
    }
  };

  const handleTestPrimaryConfirm = async () => {
    const ok = await confirm({
      title: "Terapkan Kalibrasi Bobot BWM Baru?",
      message: "Konfigurasi bobot kriteria SPK baru akan diaktifkan untuk seluruh perhitungan TOPSIS dan rekomendasi harian.",
      confirmText: "Aktifkan Bobot BWM",
      cancelText: "Batal",
      type: "primary",
      entityDetails: {
        "Nama Profil": "Kalibrasi Bobot Sidoarjo v2.1",
        "Kriteria Terbaik": "POTENSI_PASAR (w = 0.382)",
        "Kriteria Terburuk": "JARAK_HUB (w = 0.041)",
        "Rasio Konsistensi": "ξ* = 0.042 (Konsisten ≤ 0.10)",
      },
    });
    if (ok) {
      toast.showToast("Konfigurasi bobot BWM aktif berhasil diperbarui!", "success");
    }
  };

  const handleSimulateAction = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      toast.showToast("Aksi simulasi berhasil dieksekusi!", "success");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-[#0F172A] dark:text-slate-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans transition-colors duration-200 select-none">
      {/* =========================================================================
          STICKY TOP THEME TOGGLE & INTERACTIVE CONTROL BAR
         ========================================================================= */}
      <div className="bg-white/90 dark:bg-[#131822]/90 backdrop-blur-md border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-2 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center text-[#ea580c] font-bold shadow-2xs">
            <Sparkles className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-base md:text-lg text-[#0F172A] dark:text-white leading-tight">
                Design System & Interactive Component Showcase
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SSOT v2.0
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Pratinjau antarmuka dual-theme (Terang & Gelap) dengan token warna Signature Orange, font Inter/Outfit, dan Confirmation Modal.
            </p>
          </div>
        </div>

        {/* Theme Switcher Controls */}
        <div className="flex items-center gap-2 bg-[#F1F5F9] dark:bg-[#0B0F17] p-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
          <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] px-2">
            Tema Tampilan:
          </span>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isDark
                ? "bg-white text-[#0F172A] shadow-xs border border-[#E2E8F0]"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Terang (Light)</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? "bg-[#1E293B] text-white shadow-xs border border-[#334155]"
                : "text-[#64748B] hover:text-white"
            }`}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span>Gelap (Dark)</span>
          </button>
        </div>
      </div>

      {/* Main Showcase Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] p-1.5 rounded-2xl flex-wrap shadow-2xs gap-1">
          <TabsTrigger value="buttons" leftIcon={MousePointerClick}>
            Buttons & Actions
          </TabsTrigger>
          <TabsTrigger value="forms" leftIcon={SlidersHorizontal}>
            Form Controls
          </TabsTrigger>
          <TabsTrigger value="badges" leftIcon={Tag}>
            Badges & Quality Gate
          </TabsTrigger>
          <TabsTrigger value="metrics" leftIcon={BarChart3}>
            Metrics & StatCards
          </TabsTrigger>
          <TabsTrigger value="confirmation" leftIcon={ShieldAlert}>
            Confirmation Modals
          </TabsTrigger>
          <TabsTrigger value="containers" leftIcon={LayoutGrid}>
            Cards & Widgets
          </TabsTrigger>
          <TabsTrigger value="feedback" leftIcon={BellRing}>
            Alerts & Toasts
          </TabsTrigger>
          <TabsTrigger value="tables" leftIcon={Table2}>
            Data Tables
          </TabsTrigger>
          <TabsTrigger value="spatial" leftIcon={Compass}>
            Spatial & Weather
          </TabsTrigger>
        </TabsList>

        {/* ==========================================================================
            TAB 1: BUTTONS & ACTION TRIGGERS
           ========================================================================== */}
        <TabsContent value="buttons" className="space-y-6 pt-2">
          <Panel
            title="Button Variants & Semantic Actions"
            description="Semua tombol mendukung tema terang & gelap dengan Signature Orange (#ea580c), font Inter/Outfit, dan border radius 8px."
          >
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h4 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-3">
                  1. Visual Variants (Medium 36px)
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

              {/* Split-Pill Design Buttons (Executive Bar) */}
              <div>
                <h4 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-3">
                  2. Executive Split-Pill Actions (Toolbar Standard)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="px-4 py-2 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-white hover:border-[#ea580c] transition-all flex items-center gap-2 shadow-2xs cursor-pointer">
                    <CloudSun className="w-4 h-4 text-amber-400" />
                    <span>Sync Cuaca</span>
                  </button>
                  <button className="px-4 py-2 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-white hover:border-blue-500 transition-all flex items-center gap-2 shadow-2xs cursor-pointer">
                    <Compass className="w-4 h-4 text-blue-400" />
                    <span>DSS Engine</span>
                  </button>
                  <button className="px-4 py-2 rounded-full bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm shadow-orange-500/20 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span>Tambah User Baru</span>
                  </button>
                </div>
              </div>

              {/* Dynamic States */}
              <div>
                <h4 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-3">
                  3. Dynamic States (Loading & Disabled)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" loading={btnLoading} onClick={handleSimulateAction}>
                    {btnLoading ? "Memproses Data..." : "Klik untuk Loading State"}
                  </Button>
                  <Button variant="secondary" loading>
                    Loading Secondary
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled Primary
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
        <TabsContent value="forms" className="space-y-6 pt-2">
          <Panel
            title="Form Controls, Text Inputs & Switches"
            description="Komponen input dengan border kontras, ikon kiri/kanan, validasi visual, dan dark mode compatibility."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                    Nama Zona Operasional
                  </label>
                  <Input
                    placeholder="Contoh: Zona Alun-Alun Sidoarjo"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    leftIcon={MapPin}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                    Pencarian Cepat
                  </label>
                  <Input
                    placeholder="Cari armada, rider, jalan protokol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={Search}
                    clearable
                    onClear={() => setSearchQuery("")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                    Pilihan Role Pengguna
                  </label>
                  <Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    options={[
                      { value: "SUPERADMIN", label: "Super Admin (Root Custodian)" },
                      { value: "MANAGEMENT", label: "Management (Executive Portal)" },
                      { value: "SUPERVISOR", label: "Supervisor (Operational Field)" },
                      { value: "RIDER", label: "Rider (Field Operations)" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
                  <h4 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                    Toggle Switches & Checkboxes
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                      Larangan Melintasi Jalan Tol
                    </span>
                    <Switch checked={switch1} onCheckedChange={setSwitch1} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                      Auto Re-clustering POI Midnight
                    </span>
                    <Switch checked={switch2} onCheckedChange={setSwitch2} />
                  </div>
                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A] dark:text-slate-200 cursor-pointer">
                      <Checkbox checked={checkbox1} onCheckedChange={setCheckbox1} />
                      <span>Aktifkan GPS Realtime</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A] dark:text-slate-200 cursor-pointer">
                      <Checkbox checked={checkbox2} onCheckedChange={setCheckbox2} />
                      <span>Notifikasi Suara</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 3: BADGES & QUALITY GATE
           ========================================================================== */}
        <TabsContent value="badges" className="space-y-6 pt-2">
          <Panel
            title="Badges, Status Indicators & Automated Quality Gate"
            description="Status visual untuk Quality Gate Spasial, Bobot Likert 1-5, Role User, dan Status Armada."
          >
            <div className="space-y-6">
              {/* Quality Gate Badges */}
              <div>
                <h4 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-3">
                  1. Spatial Dataset Quality Gate (Automated Pipeline)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>🟢 VALID (Auto-Promoted to SSOT)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>🟡 DEGRADED (32 Anomaly - Action Optional)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800/60 text-xs font-bold text-red-700 dark:text-red-400">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span>🔴 INVALID (Sync Required)</span>
                  </span>
                </div>
              </div>

              {/* Role Badges */}
              <div>
                <h4 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-3">
                  2. User Role Hierarchy Badges
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="danger" size="md">
                    SUPERADMIN
                  </Badge>
                  <Badge variant="primary" size="md">
                    MANAGEMENT
                  </Badge>
                  <Badge variant="warning" size="md">
                    SUPERVISOR
                  </Badge>
                  <Badge variant="success" size="md">
                    RIDER
                  </Badge>
                </div>
              </div>

              {/* Likert Scale Badges */}
              <div>
                <h4 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-3">
                  3. POI Likert 1-5 Priority Weights
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold">
                    Likert 5 (Sangat Tinggi - Perkantoran)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500 text-white text-xs font-bold">
                    Likert 4 (Tinggi - Kampus & Mall)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-xs font-bold">
                    Likert 3 (Sedang - Faskes & Taman)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold">
                    Likert 2 (Rendah - Pemukiman)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-500 text-white text-xs font-bold">
                    Likert 1 (Sangat Rendah)
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 4: METRICS & STATCARDS
           ========================================================================== */}
        <TabsContent value="metrics" className="space-y-6 pt-2">
          <Panel
            title="Executive & Operational KPI StatCards"
            description="Kartu metrik responsif dengan indikator pertumbuhan (delta %), live GPS pulse, dan format Rupiah."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Penjualan Hari Ini"
                value="Rp 2.450.000"
                subtitle="163 Cup (82 Transaksi)"
                trendBadge="+12.4% vs Kemarin"
                trendType="success"
                iconClass="bx bx-shopping-bag"
                iconColor="text-[#FF634A] bg-[#FF634A]/10 border border-[#FF634A]/20"
              />

              <StatCard
                title="Bobot BWM (CR)"
                value="ξ* 0.042"
                subtitle="Best: POTENSI_PASAR (w=0.382)"
                trendBadge="Konsisten ✓"
                trendType="success"
                pulseBadge
                iconClass="bx bx-compass"
                iconColor="text-purple-400 bg-purple-950/40 border border-purple-800/40"
              />

              <StatCard
                title="Rider Bertugas"
                value="10 / 12 Rider"
                subtitle="Sinyal GPS Terverifikasi"
                trendBadge="● LIVE"
                trendType="success"
                pulseBadge
                iconClass="bx bx-map-pin"
                iconColor="text-emerald-400 bg-emerald-950/40 border border-emerald-800/40"
              />

              <StatCard
                title="Armada Digunakan"
                value="10 / 14 Unit"
                subtitle="Utilisasi Armada (71.4%)"
                trendBadge="1 Servis ⚠"
                trendType="warning"
                iconClass="bx bx-cycling"
                iconColor="text-amber-400 bg-amber-950/40 border border-amber-800/40"
              />
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 5: UNIVERSAL CONFIRMATION MODAL DEMONSTRATION
           ========================================================================== */}
        <TabsContent value="confirmation" className="space-y-6 pt-2">
          <Panel
            title="Universal Confirmation Modal Testing Suite (useConfirm Hook)"
            description="Standar keamanan interaksi: Setiap aksi mutasi penting wajib memicu modal konfirmasi kontekstual dengan detail dampak operasional."
          >
            <div className="space-y-4">
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Klik tombol di bawah untuk menguji variasi dialog konfirmasi (*Promise-based*):
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="danger" leftIcon={Trash2} onClick={handleTestDangerConfirm}>
                  Uji Modal Bahaya (Deaktivasi User / Hapus Zona)
                </Button>
                <Button variant="secondary" leftIcon={AlertTriangle} onClick={handleTestWarningConfirm}>
                  Uji Modal Peringatan (Supervisor Override DSS)
                </Button>
                <Button variant="primary" leftIcon={CheckCircle2} onClick={handleTestPrimaryConfirm}>
                  Uji Modal Utama (Terapkan Bobot BWM Baru)
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#1E293B] text-xs space-y-2">
                <h5 className="font-bold text-[#0F172A] dark:text-white">
                  Spesifikasi Universal Confirmation Modal:
                </h5>
                <ul className="list-disc list-inside space-y-1 text-[#64748B] dark:text-[#94A3B8]">
                  <li>Menggantikan <code className="text-orange-500 font-mono">window.confirm()</code> browser bawaan.</li>
                  <li>Mendukung <code className="text-orange-500 font-mono">entityDetails</code> untuk transparansi data yang terdampak.</li>
                  <li>Dapat dipanggil dari komponen mana saja via <code className="text-orange-500 font-mono">const &#123; confirm &#125; = useConfirm()</code>.</li>
                </ul>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 6: CARDS & WIDGETS
           ========================================================================== */}
        <TabsContent value="containers" className="space-y-6 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Sales Trend Chart Preview</CardTitle>
                  <CardDescription>Zero-filled time-series visualization across hourly and daily buckets.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <div className="text-center space-y-2">
                      <BarChart3 className="w-8 h-8 text-[#ea580c] mx-auto animate-pulse" />
                      <p className="font-bold text-[#0F172A] dark:text-white">Sales Chart Interactive Area</p>
                      <p className="text-[11px]">Garis tren omzet harian berkelanjutan tanpa titik kosong.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Leaderboard menu kopi terlaris hari ini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F172A] dark:text-white">1. Kopi Susu Gula Aren</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">84 Cup (Rp 1.26M)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#1E293B] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#ea580c] to-[#f97316] w-[75%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="font-bold text-[#0F172A] dark:text-white">2. Americano Cold Brew</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">42 Cup (Rp 630k)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#1E293B] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#ea580c] to-[#f97316] w-[45%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="font-bold text-[#0F172A] dark:text-white">3. Matcha Latte Cream</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">28 Cup (Rp 420k)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#1E293B] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#ea580c] to-[#f97316] w-[30%]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ==========================================================================
            TAB 7: FEEDBACK, ALERTS & TOASTS
           ========================================================================== */}
        <TabsContent value="feedback" className="space-y-6 pt-2">
          <Panel
            title="Alerts, Banners & Toast Feedback"
            description="Komponen notifikasi pesan sistem untuk memberikan umpan balik instan kepada pengguna."
          >
            <div className="space-y-4">
              <Alert variant="info" title="Informasi Sistem">
                Pipeline data spasial Sidoarjo telah tersinkronisasi penuh dengan satelit OpenStreetMap & Open-Meteo.
              </Alert>

              <Alert variant="success" title="Operasi Berhasil">
                Rekomendasi penugasan harian DSS BWM-TOPSIS telah berhasil dihitung dan siap di-plotting.
              </Alert>

              <Alert variant="warning" title="Peringatan Operasional">
                Armada #003 telah melewati batas 1.000 km dan dijadwalkan untuk servis rutin.
              </Alert>

              <Alert variant="danger" title="Pelanggaran Batas Terdeteksi">
                Rider Dani Pratama terdeteksi berada di dekat jalur terlarang Jalan Tol Surabaya-Gempol.
              </Alert>
            </div>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 8: DATA TABLES
           ========================================================================== */}
        <TabsContent value="tables" className="space-y-6 pt-2">
          <Panel
            title="Enterprise Data Tables"
            description="Tabel responsif dengan status badges, format rupiah, dan aksi kontekstual."
          >
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Unit</TableHead>
                    <TableHead>Tipe Armada</TableHead>
                    <TableHead>Rider Bertugas</TableHead>
                    <TableHead>Baterai</TableHead>
                    <TableHead>Status Operasional</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-[#0F172A] dark:text-white">ARM-SDA-001</TableCell>
                    <TableCell>Motor Listrik Gerobak</TableCell>
                    <TableCell>Fajar Nugraha (R-004)</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">85%</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-[#1E293B]">
                          <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" size="sm" withDot>
                        IN_USE
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" leftIcon={Eye}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-mono font-bold text-[#0F172A] dark:text-white">ARM-SDA-002</TableCell>
                    <TableCell>Motor Listrik Gerobak</TableCell>
                    <TableCell>Budi Santoso (R-002)</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-[#1E293B]">
                          <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" size="sm" withDot>
                        IN_USE
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" leftIcon={Eye}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-mono font-bold text-[#0F172A] dark:text-white">ARM-SDA-003</TableCell>
                    <TableCell>Motor Listrik Gerobak</TableCell>
                    <TableCell className="text-[#64748B] dark:text-[#94A3B8] italic">Bengkel Resmi Sidoarjo</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-500">40%</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-[#1E293B]">
                          <div className="h-full bg-amber-500 rounded-full w-[40%]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning" size="sm" withDot>
                        MAINTENANCE
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" leftIcon={CheckCircle2}>
                        Lepas Servis
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Panel>
        </TabsContent>

        {/* ==========================================================================
            TAB 9: SPATIAL & WEATHER
           ========================================================================== */}
        <TabsContent value="spatial" className="space-y-6 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <Panel
                title="Hub Atmospheric Radar"
                description="Widget pemantauan meteorologi real-time dari satelit Open-Meteo."
              >
                <div className="p-4 rounded-xl bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-500">
                        <CloudSun className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-[#0F172A] dark:text-white">Sidoarjo Hub Central</h4>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Koordinat: -7.4478, 112.7183</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      🟢 KONDISI AMAN
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#1E293B]">
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Suhu Udara</span>
                      <p className="text-base font-bold text-[#0F172A] dark:text-white mt-0.5">29.4°C</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#1E293B]">
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Kelembaban</span>
                      <p className="text-base font-bold text-[#0F172A] dark:text-white mt-0.5">68%</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#1E293B]">
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Curah Hujan</span>
                      <p className="text-base font-bold text-[#0F172A] dark:text-white mt-0.5">0.0 mm</p>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="lg:col-span-6">
              <Panel
                title="Spatial Geometry Rules & Restrictions"
                description="Validasi batas poligon zona dan proteksi jalan tol di PostGIS."
              >
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0F172A] dark:text-white">Proteksi Jalur Jalan Tol</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Hard-block jika poligon bersinggungan dengan jalan tol.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-800/40">
                      TERKUNCI
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0F172A] dark:text-white">Buffer 10m Jalan Protokol</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Titik jual dilarang berada di badan jalan protokol.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800/40">
                      BUFFER 10M
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#131822] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0F172A] dark:text-white">Batas Luas Zona Operasional</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Minimal 0.1 Hektar (1.000 m²) s/d Maksimal 500 Hektar.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40">
                      ST_Area VALID
                    </span>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
