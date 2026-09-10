import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  Button,
  Table,
  Badge,
  Input,
  PageHeader,
  MetricCard,
  Modal,
} from "../../components/ui/index.js";
import {
  Settings,
  Save,
  RefreshCw,
  Play,
  CheckCircle2,
  Clock,
  MapPin,
  Sliders,
  Shield,
  Zap,
  Server,
  Database,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { MOCK_SETTINGS, MOCK_CRON_JOBS } from "./mockData.js";

export default function SettingsPage() {
  const location = useLocation();
  const [settings, setSettings] = useState(MOCK_SETTINGS);
  const [cronJobs, setCronJobs] = useState(MOCK_CRON_JOBS);
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === "/sync") return "scheduler";
    return "general";
  });
  const [saveToast, setSaveToast] = useState(false);
  const [runningJobId, setRunningJobId] = useState(null);

  useEffect(() => {
    if (location.pathname === "/sync") setActiveTab("scheduler");
    else if (location.pathname === "/settings") setActiveTab("general");
  }, [location.pathname]);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleRunJobManually = (jobId) => {
    setRunningJobId(jobId);
    setTimeout(() => {
      setCronJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                lastRun: "Baru saja",
                status: "SUCCESS",
              }
            : j
        )
      );
      setRunningJobId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Pengaturan Sistem & Penjadwal Cron"
          subtitle="Konfigurasi parameter operasional hub, batas toleransi geofence, dan manajemen background scheduler pipeline."
        />
        {saveToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> Pengaturan berhasil disimpan
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-theme pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "general"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          <Settings className="w-4 h-4" /> Parameter Operasional & Geofence
        </button>
        <button
          onClick={() => setActiveTab("dss")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "dss"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          <Sliders className="w-4 h-4" /> Threshold & Algoritma DSS
        </button>
        <button
          onClick={() => setActiveTab("scheduler")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "scheduler"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
          }`}
        >
          <Clock className="w-4 h-4" /> Background Jobs & Sync ({cronJobs.length})
        </button>
      </div>

      {/* TAB 1: GENERAL & GEOFENCE */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hub Profile */}
            <Card className="p-5 border-theme space-y-4">
              <div className="flex items-center gap-2 text-brand-500 font-bold text-base pb-3 border-b border-theme">
                <MapPin className="w-5 h-5" /> Lokasi Pusat Hub Sidoarjo
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Alamat Lengkap Hub
                </label>
                <textarea
                  rows="2"
                  value={settings.hubCoordinates.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hubCoordinates: { ...settings.hubCoordinates, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                    Latitude Hub
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings.hubCoordinates.lat}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hubCoordinates: { ...settings.hubCoordinates, lat: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                    Longitude Hub
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings.hubCoordinates.lng}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hubCoordinates: { ...settings.hubCoordinates, lng: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Geofence & LBS */}
            <Card className="p-5 border-theme space-y-4">
              <div className="flex items-center gap-2 text-brand-500 font-bold text-base pb-3 border-b border-theme">
                <Radio className="w-5 h-5" /> Parameter Telemetri GPS & Geofence
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Radius Buffer Default Zona (Meter)
                </label>
                <Input
                  type="number"
                  value={settings.geofenceRadiusDefault}
                  onChange={(e) =>
                    setSettings({ ...settings, geofenceRadiusDefault: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-text-muted mt-1">
                  Radius toleransi sekeliling poligon zona saat rider melakukan pergerakan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Batas Ambang Peringatan Deviasi (Meter)
                </label>
                <Input
                  type="number"
                  value={settings.deviationThresholdMeters}
                  onChange={(e) =>
                    setSettings({ ...settings, deviationThresholdMeters: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-text-muted mt-1">
                  Jarak keluar dari geofence yang langsung memicu alert merah ke dashboard supervisor.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Interval Ping GPS Rider (Detik)
                </label>
                <Input
                  type="number"
                  value={settings.gpsPingIntervalSec}
                  onChange={(e) =>
                    setSettings({ ...settings, gpsPingIntervalSec: Number(e.target.value) })
                  }
                />
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" className="flex items-center gap-2 shadow-md">
              <Save className="w-4 h-4" /> Simpan Konfigurasi Operasional
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: DSS PARAMETERS */}
      {activeTab === "dss" && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 border-theme space-y-4">
              <div className="flex items-center gap-2 text-brand-500 font-bold text-base pb-3 border-b border-theme">
                <SlidersHorizontal className="w-5 h-5" /> Batas Konsistensi BWM & TOPSIS
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Toleransi Rasio Konsistensi BWM (Maksimal ξ*)
                </label>
                <Input
                  type="number"
                  step="0.001"
                  value={settings.bwmConsistencyThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, bwmConsistencyThreshold: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-text-muted mt-1">
                  Nilai $\xi^* \le 0.10$ menandakan pairwise matrix perbandingan C1–C6 sangat konsisten dan sah secara matematis.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Skor Minimal Kelayakan Zona TOPSIS (Ci+)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.topsisMinThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, topsisMinThreshold: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-text-muted mt-1">
                  Zona dengan skor kedekatan di bawah nilai ini tidak akan direkomendasikan untuk penempatan armada aktif.
                </p>
              </div>
            </Card>

            <Card className="p-5 border-theme space-y-4">
              <div className="flex items-center gap-2 text-brand-500 font-bold text-base pb-3 border-b border-theme">
                <Zap className="w-5 h-5" /> Kebijakan Auto-Distribusi
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-theme">
                <div>
                  <div className="font-semibold text-sm text-text-primary">
                    Aktifkan Auto-Distribution Scheduler
                  </div>
                  <div className="text-xs text-text-muted">
                    Jalankan algoritma alokasi rider otomatis pada pukul 06:00 dan 14:00 WIB.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoDistributeEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, autoDistributeEnabled: e.target.checked })
                  }
                  className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Frekuensi Sinkronisasi Cuaca Open-Meteo (Menit)
                </label>
                <Input
                  type="number"
                  value={settings.weatherSyncIntervalMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weatherSyncIntervalMinutes: Number(e.target.value),
                    })
                  }
                />
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" className="flex items-center gap-2 shadow-md">
              <Save className="w-4 h-4" /> Simpan Parameter DSS
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: CRON SCHEDULER & PIPELINE */}
      {activeTab === "scheduler" && (
        <div className="space-y-4">
          <Card className="p-4 bg-brand-500/5 border border-brand-500/20 text-text-secondary text-sm">
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary">Cron Pipeline Daemon:</span> Semua tugas otomatisasi berjalan di backend background worker secara terjadwal. Anda dapat memicu eksekusi manual kapan saja di bawah ini.
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border-theme">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle border-b border-theme text-text-secondary uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3.5">ID & Nama Job Cron</th>
                    <th className="px-6 py-3.5">Ekspresi Jadwal</th>
                    <th className="px-6 py-3.5">Target Cache / Modul</th>
                    <th className="px-6 py-3.5">Eksekusi Terakhir</th>
                    <th className="px-6 py-3.5">Jadwal Berikutnya</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {cronJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary">{job.name}</div>
                        <div className="font-mono text-xs text-text-muted">{job.id}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-brand-500">
                        {job.schedule}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-text-secondary">
                        {job.target}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">
                        <div>{job.lastRun}</div>
                        <div className="font-mono text-[10px] text-text-muted">dur: {job.duration}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">{job.nextRun}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            job.status === "SUCCESS"
                              ? "success"
                              : job.status === "RUNNING"
                              ? "primary"
                              : "danger"
                          }
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={runningJobId === job.id}
                          onClick={() => handleRunJobManually(job.id)}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <Play className={`w-3.5 h-3.5 ${runningJobId === job.id ? "animate-spin" : ""}`} />
                          {runningJobId === job.id ? "Menjalankan..." : "Trigger Sekarang"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
