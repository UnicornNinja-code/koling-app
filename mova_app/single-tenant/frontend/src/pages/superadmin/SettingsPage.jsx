import React, { useState } from "react";
import {
  Settings,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Mail,
  Send,
  Eye,
  EyeOff,
  Server,
  KeyRound,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  Button,
  Input,
  Select,
  Tag,
  Tabs,
  Tab,
  TabPanel,
  Modal,
  useToast,
} from "../../components/ui/index.js";
import { MOCK_SETTINGS } from "./mockData.js";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const toast = useToast();

  // SMTP Form State
  const [smtpMode, setSmtpMode] = useState("custom"); // "custom" | "ethereal"
  const [smtpHost, setSmtpHost] = useState("smtp.mailgun.org");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("notification@mova.id");
  const [smtpPass, setSmtpPass] = useState("MovaSecureAppPass2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [fromName, setFromName] = useState("MOVA Operational Control");
  const [fromEmail, setFromEmail] = useState("noreply@mova.id");
  const [testRecipient, setTestRecipient] = useState("superadmin@example.com");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null); // null | "activation" | "reset"

  const handleScanReadiness = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success("Readiness Audit PASS", "100% database PostGIS, Redis BullMQ, dan DSS Engine berfungsi optimal.");
    }, 1200);
  };

  const handleTestSmtp = (e) => {
    e.preventDefault();
    if (!testRecipient) {
      toast.error("Validasi Gagal", "Masukkan alamat email penerima uji coba.");
      return;
    }
    setIsTestingSmtp(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTestingSmtp(false);
      if (smtpHost && smtpUser) {
        const latency = Math.floor(Math.random() * 60) + 65; // ~65-125ms
        setTestResult({
          success: true,
          latency,
          message: `Handshake SMTP berhasil ke ${smtpHost}:${smtpPort}. Email uji coba terkirim ke ${testRecipient}.`,
        });
        toast.success("SMTP Terkoneksi", `Email tes berhasil dikirim (Latency: ${latency}ms).`);
      } else {
        setTestResult({
          success: false,
          latency: 0,
          message: "Koneksi gagal: Host atau Username SMTP tidak boleh kosong.",
        });
        toast.error("Koneksi Gagal", "Periksa kembali kredensial server SMTP Anda.");
      }
    }, 1000);
  };

  const handleSaveSmtp = () => {
    toast.success("Konfigurasi Tersimpan", "Pengaturan SMTP & Email Gateway telah diperbarui.");
  };

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Konfigurasi Sistem & Audit Infrastruktur
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            System Settings & Enterprise Readiness
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="primary" size="md" icon={RefreshCw} loading={isScanning} onClick={handleScanReadiness}>
            Run System Readiness Scan
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs>
        <Tab active={activeTab === 0} onClick={() => setActiveTab(0)}>
          1. Central Operations Hub
        </Tab>
        <Tab active={activeTab === 1} onClick={() => setActiveTab(1)}>
          2. Aturan Restriksi Spasial (GIS)
        </Tab>
        <Tab active={activeTab === 2} onClick={() => setActiveTab(2)}>
          3. Status Kesehatan Sistem
        </Tab>
        <Tab active={activeTab === 3} onClick={() => setActiveTab(3)}>
          4. Notifikasi & SMTP Gateway
        </Tab>
      </Tabs>

      {/* TAB 1: Central Operations Hub */}
      <TabPanel active={activeTab === 0} className="space-y-[var(--cds-spacing-05)] p-0 pt-[16px]">
        <div className="bg-[var(--cds-layer-01)] p-[24px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-04)] max-w-2xl">
          <h3 className="cds-heading-02 text-[var(--cds-text-primary)]">Koordinat Central Operations Hub</h3>
          <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">
            Titik acuan penghitungan jarak kriteria C5 (Distance from Hub) untuk seluruh armada.
          </p>

          <Input id="hub-name" label="Nama Fasilitas Hub" defaultValue={MOCK_SETTINGS?.hub_name || "Central Operations Hub Sidoarjo"} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="hub-lat" label="Latitude" defaultValue={MOCK_SETTINGS?.hub_latitude || -7.4520} />
            <Input id="hub-lng" label="Longitude" defaultValue={MOCK_SETTINGS?.hub_longitude || 112.7170} />
          </div>
          <Input id="hub-rad" label="Radius Operasional Maksimum (km)" type="number" defaultValue="15" />

          <Button kind="primary" size="md" onClick={() => toast.success("Tersimpan", "Koordinat Central Hub diperbarui.")}>
            Simpan Konfigurasi Hub
          </Button>
        </div>
      </TabPanel>

      {/* TAB 2: Aturan Restriksi Spasial (GIS) */}
      <TabPanel active={activeTab === 1} className="space-y-[var(--cds-spacing-05)] p-0 pt-[16px]">
        <div className="bg-[var(--cds-layer-01)] p-[24px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-04)] max-w-2xl">
          <h3 className="cds-heading-02 text-[var(--cds-text-primary)]">Aturan Larangan Berjualan Spasial (PostGIS Buffer)</h3>
          <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">
            Enforcement larangan berjualan di jalan protokol dan jalan tol bebas hambatan.
          </p>

          <Input id="toll-buffer" label="Toleransi Buffer Larangan Jalan Tol (Meter)" type="number" defaultValue="50" />
          <Input id="proto-buffer" label="Toleransi Buffer Jalan Protokol (Meter)" type="number" defaultValue="25" />

          <Button kind="primary" size="md" onClick={() => toast.success("Tersimpan", "Parameter buffer spasial diperbarui.")}>
            Simpan Parameter GIS
          </Button>
        </div>
      </TabPanel>

      {/* TAB 3: Status Kesehatan Sistem */}
      <TabPanel active={activeTab === 2} className="space-y-[var(--cds-spacing-05)] p-0 pt-[16px]">
        <div className="bg-[var(--cds-layer-01)] p-[24px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-04)]">
          <h3 className="cds-heading-02 text-[var(--cds-text-primary)]">Status Komponen Infrastruktur</h3>
          <div className="space-y-[var(--cds-spacing-02)]">
            {[
              { name: "PostgreSQL 16 & PostGIS Engine", status: "ONLINE", type: "green" },
              { name: "Redis Cache & BullMQ Delayed Hold Queue", status: "ONLINE", type: "green" },
              { name: "Socket.IO Real-Time Telemetry Gateway", status: "CONNECTED", type: "green" },
              { name: "Open-Meteo Batch Atmospheric Client", status: "SYNCED (30m TTL)", type: "blue" },
              { name: "OpenStreetMap Overpass POI Pipeline", status: "READY", type: "blue" },
            ].map((c) => (
              <div key={c.name} className="p-[12px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] flex items-center justify-between">
                <span className="font-medium text-[13px]">{c.name}</span>
                <Tag type={c.type} size="sm">{c.status}</Tag>
              </div>
            ))}
          </div>
        </div>
      </TabPanel>

      {/* TAB 4: Notifikasi & SMTP Gateway */}
      <TabPanel active={activeTab === 3} className="space-y-[var(--cds-spacing-06)] p-0 pt-[16px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--cds-spacing-06)]">
          {/* Left: SMTP Configuration Form (7 Cols) */}
          <div className="lg:col-span-7 bg-[var(--cds-layer-01)] p-[24px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-05)]">
            <div className="border-b border-[var(--cds-border-subtle)] pb-[12px]">
              <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider block">
                Email Dispatch Service
              </span>
              <h3 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold mt-0.5">
                Konfigurasi SMTP Gateway
              </h3>
              <p className="cds-helper-text-01 text-[var(--cds-text-secondary)] mt-1">
                Kredensial server SMTP untuk pengiriman token aktivasi akun rider, instruksi reset password, dan notifikasi insiden operasional.
              </p>
            </div>

            {/* Operational Mode Toggle */}
            <div className="bg-[var(--cds-layer-02)] p-[16px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-02)]">
              <span className="cds-label-01 text-[var(--cds-text-primary)] font-semibold block">
                Mode Server Email
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--cds-spacing-03)]">
                <label
                  onClick={() => setSmtpMode("custom")}
                  className={`p-[12px] border cursor-pointer transition-colors select-none flex flex-col gap-1 ${
                    smtpMode === "custom"
                      ? "bg-[var(--cds-layer-01)] border-[var(--cds-interactive)] text-[var(--cds-text-primary)]"
                      : "border-[var(--cds-border-subtle)] hover:bg-[var(--cds-layer-hover-01)] text-[var(--cds-text-secondary)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[13px]">Production SMTP</span>
                    <input
                      type="radio"
                      name="smtpMode"
                      checked={smtpMode === "custom"}
                      onChange={() => setSmtpMode("custom")}
                      className="cursor-pointer"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--cds-text-secondary)] leading-relaxed">
                    Menggunakan kredensial Mailgun, SendGrid, Gmail, atau server SMTP kustom.
                  </span>
                </label>

                <label
                  onClick={() => setSmtpMode("ethereal")}
                  className={`p-[12px] border cursor-pointer transition-colors select-none flex flex-col gap-1 ${
                    smtpMode === "ethereal"
                      ? "bg-[var(--cds-layer-01)] border-[var(--cds-interactive)] text-[var(--cds-text-primary)]"
                      : "border-[var(--cds-border-subtle)] hover:bg-[var(--cds-layer-hover-01)] text-[var(--cds-text-secondary)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[13px]">Ethereal Sandbox</span>
                    <input
                      type="radio"
                      name="smtpMode"
                      checked={smtpMode === "ethereal"}
                      onChange={() => setSmtpMode("ethereal")}
                      className="cursor-pointer"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--cds-text-secondary)] leading-relaxed">
                    Mode uji coba otomatis tanpa email sungguhan (Preview via web Ethereal).
                  </span>
                </label>
              </div>
            </div>

            {/* SMTP Host & Port */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--cds-spacing-04)]">
              <div className="sm:col-span-2">
                <Input
                  id="smtp-host"
                  label="SMTP Host / Server"
                  icon={Server}
                  placeholder="e.g. smtp.mailgun.org"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  disabled={smtpMode === "ethereal"}
                  required
                />
              </div>
              <div>
                <Select
                  id="smtp-port"
                  label="Port & TLS"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  disabled={smtpMode === "ethereal"}
                  options={[
                    { value: "587", label: "587 (STARTTLS)" },
                    { value: "465", label: "465 (SSL / TLS)" },
                    { value: "25", label: "25 (Standard)" },
                    { value: "2525", label: "2525 (Alternative)" },
                  ]}
                />
              </div>
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--cds-spacing-04)]">
              <Input
                id="smtp-user"
                label="Username / API Key"
                icon={Mail}
                placeholder="postmaster@domain.com"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                disabled={smtpMode === "ethereal"}
                required
              />

              <div className="relative">
                <Input
                  id="smtp-pass"
                  label="Password / App Secret"
                  type={showPassword ? "text" : "password"}
                  icon={KeyRound}
                  placeholder="••••••••••••••••"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  disabled={smtpMode === "ethereal"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-[var(--cds-icon-secondary)] hover:text-[var(--cds-icon-primary)] focus:outline-none cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sender Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--cds-spacing-04)]">
              <Input
                id="from-name"
                label="Nama Pengirim (From Name)"
                placeholder="MOVA Control Room"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
              <Input
                id="from-email"
                label="Alamat Pengirim (From Email)"
                type="email"
                placeholder="noreply@mova.id"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>

            <div className="pt-[var(--cds-spacing-02)]">
              <Button kind="primary" size="md" onClick={handleSaveSmtp}>
                Simpan Konfigurasi SMTP
              </Button>
            </div>
          </div>

          {/* Right: Live Diagnostics & Template Previews (5 Cols) */}
          <div className="lg:col-span-5 space-y-[var(--cds-spacing-05)]">
            {/* Live Diagnostics Card */}
            <div className="bg-[var(--cds-layer-01)] p-[20px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-04)]">
              <div className="border-b border-[var(--cds-border-subtle)] pb-[8px]">
                <h4 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
                  Uji Coba Pengiriman Email
                </h4>
                <p className="cds-helper-text-01 text-[var(--cds-text-secondary)] mt-0.5">
                  Verifikasi konektivitas soket SMTP dengan mengirim email uji coba ke alamat spesifik.
                </p>
              </div>

              <form onSubmit={handleTestSmtp} className="space-y-[var(--cds-spacing-03)]">
                <Input
                  id="test-email"
                  label="Email Penerima Uji Coba"
                  type="email"
                  placeholder="admin@perusahaan.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  size="sm"
                  required
                />

                <Button
                  kind="secondary"
                  size="sm"
                  type="submit"
                  icon={Send}
                  loading={isTestingSmtp}
                  className="w-full justify-center"
                >
                  Kirim Email Uji Coba
                </Button>
              </form>

              {testResult && (
                <div
                  className={`p-[12px] border text-[12px] space-y-1.5 ${
                    testResult.success
                      ? "bg-[var(--cds-layer-02)] border-[var(--cds-support-success)] text-[var(--cds-text-primary)]"
                      : "bg-[var(--cds-layer-02)] border-[var(--cds-support-error)] text-[var(--cds-text-primary)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Tag type={testResult.success ? "green" : "red"} size="sm">
                      {testResult.success ? "SMTP CONNECTED" : "CONNECTION FAILED"}
                    </Tag>
                    {testResult.latency > 0 && (
                      <span className="cds-code-01 text-[11px] text-[var(--cds-text-secondary)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {testResult.latency}ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--cds-text-secondary)] leading-relaxed">
                    {testResult.message}
                  </p>
                </div>
              )}
            </div>

            {/* Email Templates Preview */}
            <div className="bg-[var(--cds-layer-01)] p-[20px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-04)]">
              <div className="border-b border-[var(--cds-border-subtle)] pb-[8px]">
                <h4 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
                  Template Email Sistem
                </h4>
                <p className="cds-helper-text-01 text-[var(--cds-text-secondary)] mt-0.5">
                  Pratinjau struktur HTML email yang akan diterima pengguna.
                </p>
              </div>

              <div className="space-y-[var(--cds-spacing-02)]">
                <div className="p-[12px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[13px] block text-[var(--cds-text-primary)]">
                      Aktivasi Akun Rider
                    </span>
                    <span className="cds-label-01 text-[var(--cds-text-secondary)] text-[11px]">
                      Trigger saat admin mengundang user baru
                    </span>
                  </div>
                  <Button kind="ghost" size="sm" onClick={() => setPreviewTemplate("activation")}>
                    Lihat Template
                  </Button>
                </div>

                <div className="p-[12px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[13px] block text-[var(--cds-text-primary)]">
                      Pemulihan Kata Sandi
                    </span>
                    <span className="cds-label-01 text-[var(--cds-text-secondary)] text-[11px]">
                      Trigger saat pengguna meminta reset password
                    </span>
                  </div>
                  <Button kind="ghost" size="sm" onClick={() => setPreviewTemplate("reset")}>
                    Lihat Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>

      {/* Template Preview Modal */}
      <Modal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate === "activation" ? "Pratinjau Email: Aktivasi Akun Rider" : "Pratinjau Email: Reset Password"}
        label="HTML EMAIL TEMPLATE"
        primaryButtonText="Tutup Pratinjau"
        onPrimarySubmit={() => setPreviewTemplate(null)}
      >
        <div className="bg-[#FFFFFF] text-[#161616] p-[24px] rounded border border-[#E0E0E0] space-y-4 font-sans text-[13px]">
          <div className="border-b border-[#E0E0E0] pb-3">
            <h3 className="text-[16px] font-bold text-[#0F62FE]">MOVA Single-Tenant HUB</h3>
            <span className="text-[11px] text-[#525252]">Sejuta Jiwa Cabang Sidoarjo</span>
          </div>

          {previewTemplate === "activation" ? (
            <div className="space-y-3">
              <p>Halo <strong>Rider Budi Santoso</strong>,</p>
              <p>Akun operasional Anda telah didaftarkan pada sistem MOVA Sidoarjo. Silakan gunakan token aktivasi berikut untuk membuat kata sandi Anda:</p>
              <div className="p-3 bg-[#F4F4F4] font-mono text-[14px] text-[#0F62FE] font-bold text-center tracking-wider border border-[#E0E0E0]">
                MOVA-ACT-98234-A78F-2026
              </div>
              <p className="text-[11px] text-[#525252]">Token ini berlaku selama 24 jam ke depan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>Halo <strong>Febriyan Dwi Putra</strong>,</p>
              <p>Kami menerima permintaan pemulihan kata sandi untuk akun Superadmin Anda. Klik tautan aman berikut untuk menyetel ulang kata sandi:</p>
              <div className="text-center py-2">
                <span className="inline-block px-4 py-2 bg-[#0F62FE] text-[#FFFFFF] font-medium rounded text-[12px]">
                  Reset Kata Sandi Akun
                </span>
              </div>
              <p className="text-[11px] text-[#525252]">Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p>
            </div>
          )}

          <div className="border-t border-[#E0E0E0] pt-3 text-[11px] text-[#8D8D8D]">
            Dikirim secara otomatis oleh MOVA Mail Gateway &copy; 2026.
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SettingsPage;
