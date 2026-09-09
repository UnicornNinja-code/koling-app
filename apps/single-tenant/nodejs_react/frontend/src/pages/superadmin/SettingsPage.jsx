import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { systemSettingService } from "../../services/systemSettingService.js";
import { syncService } from "../../services/syncService.js";
import { auditService } from "../../services/auditService.js";
import { cronService } from "../../services/cronService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { useMapPreferences } from "../../lib/mapPreferences.js";
import {
  Settings,
  Building2,
  MapPin,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Layers,
  Compass,
  Navigation,
  Lock,
  Key,
  Users,
  Activity,
  Check,
  Power,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  CloudSun,
  Database,
} from "lucide-react";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { prefs, activeProvider, providers, hasMapTilerKey, setBasemapId, setBufferMeters, resetDefaults } = useMapPreferences();

  // Active Tab: 'hub' | 'rules' | 'map' | 'readiness' | 'sync' | 'audit'
  const [activeTab, setActiveTab] = useState("hub");

  // Feedback Messages
  const [feedback, setFeedback] = useState({ error: null, success: null });

  // Hub Form State
  const [hubForm, setHubForm] = useState({
    hub_name: "Central Hub Sidoarjo",
    hub_city_name: "Sidoarjo",
    hub_address: "Jl. Pahlawan No. 1, Sidoarjo, Jawa Timur",
    hub_latitude: -7.4478,
    hub_longitude: 112.7183,
    operational_radius_km: 12,
  });

  // Modal State for Rule Change Confirmation
  const [pendingRuleChange, setPendingRuleChange] = useState(null);

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hubMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const tileLayerRef = useRef(null);

  // 1. Fetch System Readiness Report
  const { data: readinessRes, isLoading: loadingReadiness } = useQuery({
    queryKey: queryKeys.settings.readiness(),
    queryFn: systemSettingService.getReadiness,
  });

  // 2. Fetch Operational Rules
  const { data: rulesRes, isLoading: loadingRules } = useQuery({
    queryKey: queryKeys.settings.operationalRules(),
    queryFn: systemSettingService.getOperationalRules,
  });

  // 3. Fetch Data Freshness & Sync Runs
  const { data: syncStatusRes } = useQuery({
    queryKey: queryKeys.sync.status(),
    queryFn: syncService.getStatus,
  });

  const { data: syncRunsRes } = useQuery({
    queryKey: queryKeys.sync.runs(),
    queryFn: syncService.getRuns,
  });

  // 4. Fetch Audit Logs & Cron Configs
  const { data: auditRes, isLoading: loadingAudit } = useQuery({
    queryKey: queryKeys.audit.logs(),
    queryFn: auditService.getAuditLogs,
  });

  const { data: cronConfigsRes, isLoading: loadingCron } = useQuery({
    queryKey: queryKeys.cron.jobs(),
    queryFn: cronService.getCronConfigs,
  });

  const readiness = readinessRes?.data || readinessRes || null;
  const operationalRules = rulesRes?.data || rulesRes || { protocol_road_prohibited: true, toll_road_prohibited: true };
  const syncStatus = syncStatusRes?.data || syncStatusRes || null;
  const syncRuns = syncRunsRes?.runs || syncRunsRes?.data || [];
  const auditLogs = auditRes?.logs || auditRes?.data || [];
  const cronConfigs = cronConfigsRes?.configs || cronConfigsRes?.data || [];

  // Populate Hub Form from Readiness Data once loaded
  useEffect(() => {
    if (readiness?.hub_config) {
      setHubForm({
        hub_name: readiness.hub_config.name || "Central Hub Sidoarjo",
        hub_city_name: readiness.hub_config.city_name || "Sidoarjo",
        hub_address: readiness.hub_config.address || "",
        hub_latitude: Number(readiness.hub_config.latitude) || -7.4478,
        hub_longitude: Number(readiness.hub_config.longitude) || 112.7183,
        operational_radius_km: Number(readiness.hub_config.radius_km) || 12,
      });
    }
  }, [readiness?.hub_config]);

  // Mutations
  const updateHubMutation = useMutation({
    mutationFn: (payload) => systemSettingService.updateHubConfig(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      setFeedback({ error: null, success: "Konfigurasi Central Hub & parameter spasial berhasil disimpan." });
      setTimeout(() => setFeedback((f) => ({ ...f, success: null })), 4000);
    },
    onError: (err) => {
      setFeedback({ error: err?.response?.data?.msg || err?.message || "Gagal menyimpan konfigurasi hub.", success: null });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: (payload) => systemSettingService.updateOperationalRules(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.operationalRules() });
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      setPendingRuleChange(null);
      const summary = data?.affected_zones_summary || {};
      alert(
        `[Aturan Operasional Berhasil Diperbarui]\n` +
        `• Total Zona dievaluasi: ${summary.total_reevaluated || 0}\n` +
        `• Menjadi RESTRICTED: ${summary.newly_restricted || 0}\n` +
        `• Dipulihkan ke ACTIVE: ${summary.restored_active || 0}`
      );
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal memperbarui aturan operasional.");
    },
  });

  const triggerPoiSyncMutation = useMutation({
    mutationFn: () => syncService.triggerPoiSync({ city: hubForm.hub_city_name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pois.all });
      alert("Sinkronisasi POI Overpass OSM berhasil dipicu.");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal sinkronisasi POI.");
    },
  });

  const triggerWeatherSyncMutation = useMutation({
    mutationFn: () => syncService.triggerWeatherSync({ city: hubForm.hub_city_name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.weather.all });
      alert("Sinkronisasi Cuaca Open-Meteo berhasil dipicu.");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal sinkronisasi cuaca.");
    },
  });

  const triggerCronMutation = useMutation({
    mutationFn: cronService.triggerCronManually,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cron.jobs() });
      alert(`[Trigger Berhasil] ${data?.msg || "Cron job manual berhasil dijalankan."}`);
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal menjalankan cron job.");
    },
  });

  const toggleCronMutation = useMutation({
    mutationFn: (cronKey) => cronService.toggleCronActive(cronKey),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cron.jobs() });
      alert(data?.msg || "Status cron job berhasil diperbarui.");
    },
  });

  // Initialize Interactive Central Hub Leaflet Map
  useEffect(() => {
    if (activeTab !== "hub" || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch (e) {}
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    const lat = Number(hubForm.hub_latitude) || -7.4478;
    const lng = Number(hubForm.hub_longitude) || 112.7183;
    const radiusMeters = (Number(hubForm.operational_radius_km) || 12) * 1000;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    });

    tileLayerRef.current = L.tileLayer(activeProvider.url, {
      maxZoom: activeProvider.maxZoom || 19,
      subdomains: activeProvider.subdomains || ["a", "b", "c"],
      attribution: activeProvider.attribution,
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 8,
      crossOrigin: true,
    }).addTo(map);

    // Draggable Hub Marker
    const hubIcon = L.divIcon({
      className: "custom-hub-pin",
      html: `
        <div style="background-color: #2563EB; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4); cursor: grab;">
          <svg style="width: 18px; height: 18px; fill: white;" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const marker = L.marker([lat, lng], { icon: hubIcon, draggable: true }).addTo(map);
    marker.bindPopup(`<b>${hubForm.hub_name}</b><br>Tarik pin untuk mengubah koordinat markas.`);

    marker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      setHubForm((prev) => ({
        ...prev,
        hub_latitude: parseFloat(pos.lat.toFixed(6)),
        hub_longitude: parseFloat(pos.lng.toFixed(6)),
      }));
    });

    // Radius Circle Overlay
    const circle = L.circle([lat, lng], {
      radius: radiusMeters,
      color: "#2563EB",
      fillColor: "#2563EB",
      fillOpacity: 0.08,
      weight: 2,
      dashArray: "6, 6",
    }).addTo(map);

    map.on("click", (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      setHubForm((prev) => ({
        ...prev,
        hub_latitude: parseFloat(clickLat.toFixed(6)),
        hub_longitude: parseFloat(clickLng.toFixed(6)),
      }));
    });

    mapInstanceRef.current = map;
    hubMarkerRef.current = marker;
    radiusCircleRef.current = circle;

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, activeProvider.url]);

  // Synchronize Marker & Radius when form coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !hubMarkerRef.current || !radiusCircleRef.current) return;
    const lat = Number(hubForm.hub_latitude) || -7.4478;
    const lng = Number(hubForm.hub_longitude) || 112.7183;
    const radiusMeters = (Number(hubForm.operational_radius_km) || 12) * 1000;

    hubMarkerRef.current.setLatLng([lat, lng]);
    radiusCircleRef.current.setLatLng([lat, lng]);
    radiusCircleRef.current.setRadius(radiusMeters);
  }, [hubForm.hub_latitude, hubForm.hub_longitude, hubForm.operational_radius_km]);

  const handleUseCurrentGps = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setHubForm((prev) => ({
            ...prev,
            hub_latitude: parseFloat(pos.coords.latitude.toFixed(6)),
            hub_longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          }));
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([pos.coords.latitude, pos.coords.longitude]);
          }
          setFeedback({ error: null, success: "Koordinat GPS perangkat berhasil disinkronkan ke markas Hub." });
          setTimeout(() => setFeedback((f) => ({ ...f, success: null })), 3000);
        },
        (err) => {
          setFeedback({ error: `Gagal membaca sensor GPS: ${err.message}`, success: null });
        }
      );
    }
  };

  const handleSaveHub = (e) => {
    e.preventDefault();
    updateHubMutation.mutate(hubForm);
  };

  const handleToggleRule = (ruleKey, currentValue) => {
    const targetValue = !currentValue;
    const isProtocol = ruleKey === "protocol_road_prohibited";
    const ruleTitle = isProtocol ? "Aturan Jalan Protokol" : "Aturan Jalan Tol";

    setPendingRuleChange({
      ruleKey,
      targetValue,
      ruleTitle,
      message: targetValue
        ? `Aturan ${ruleTitle} akan DIAKTIFKAN (BLOCKING). Zona yang beririsan akan diubah menjadi status RESTRICTED.`
        : `Aturan ${ruleTitle} akan DINONAKTIFKAN (ADVISORY ONLY). Zona yang beririsan tetap aktif dengan peringatan.`,
    });
  };

  return (
    <AppLayout title="Settings & Configuration" subtitle="Central Hub, GIS Spatial Restrictions, Map Tiles & System Readiness">
      <PageHeader
        title="Pengaturan Sistem & Administrasi Operasional"
        description="Kelola koordinat markas Central Hub, aturan pembatasan spasial, preferensi map tiles Leaflet, serta pantau audit kesiapan sistem."
      />

      {/* Top Banner: System Readiness Score & Overall Status */}
      <div className="bg-white rounded-lg border border-neutral-200 p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">Fondasi Operasional COZIS</h2>
              {readiness && (
                <StatusBadge variant={readiness.overall_status === "READY" ? "success" : "warning"}>
                  {readiness.overall_status === "READY" ? "SISTEM SIAP OPERASIONAL" : "PERLU KONFIGURASI"}
                </StatusBadge>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Single Source of Truth: PostgreSQL & PostGIS Spatial Datastore.
            </p>
          </div>
        </div>

        {/* Readiness Progress Meter */}
        {readiness && (
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-neutral-200 pt-3 md:pt-0 md:pl-5 shrink-0">
            <div className="text-right">
              <div className="text-xs text-neutral-500 font-medium">Tingkat Kesiapan</div>
              <div className="text-lg font-bold text-neutral-900 font-mono">
                {readiness.readiness_percentage}%
              </div>
            </div>
            <div className="w-32 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  readiness.readiness_percentage >= 80 ? "bg-emerald-600" : "bg-amber-500"
                }`}
                style={{ width: `${readiness.readiness_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Feedback Alerts */}
      {feedback.error && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{feedback.error}</span>
        </div>
      )}
      {feedback.success && (
        <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.success}</span>
        </div>
      )}

      {/* Workspace Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2 mb-6 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab("hub")}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            activeTab === "hub"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
              : "bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. Central Hub & Wilayah Spasial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            activeTab === "rules"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
              : "bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>2. Aturan Pembatasan GIS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("map")}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            activeTab === "map"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
              : "bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. Preferensi Map Tiles Leaflet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("readiness")}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            activeTab === "readiness"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
              : "bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>4. Audit Kesiapan Sistem</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sync")}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            activeTab === "sync"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
              : "bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <CloudSun className="w-3.5 h-3.5" />
          <span>5. Data Freshness & Sync</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            activeTab === "audit"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
              : "bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>6. Audit Log & Scheduler</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CENTRAL HUB & WILAYAH SPASIAL */}
      {/* ========================================================================= */}
      {activeTab === "hub" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: 5 Cols */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-neutral-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Parameter Markas Hub</h3>
                <p className="text-[11px] text-neutral-500">Titik acuan radius pembuatan zona operasional</p>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentGps}
                className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-300"
                title="Gunakan posisi GPS saat ini"
              >
                <Navigation className="w-3 h-3 text-primary-600" />
                <span>GPS</span>
              </button>
            </div>

            <form onSubmit={handleSaveHub} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nama Markas Central Hub <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={hubForm.hub_name}
                  onChange={(e) => setHubForm({ ...hubForm, hub_name: e.target.value })}
                  placeholder="Contoh: Central Hub Sidoarjo"
                  className="w-full px-3 py-2 rounded border border-neutral-300 text-neutral-900 text-xs focus:border-primary-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Kota Wilayah Operasional <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={hubForm.hub_city_name}
                  onChange={(e) => setHubForm({ ...hubForm, hub_city_name: e.target.value })}
                  placeholder="Contoh: Sidoarjo"
                  className="w-full px-3 py-2 rounded border border-neutral-300 text-neutral-900 text-xs focus:border-primary-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Alamat Fisik Markas <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={hubForm.hub_address}
                  onChange={(e) => setHubForm({ ...hubForm, hub_address: e.target.value })}
                  rows={2}
                  placeholder="Alamat lengkap markas..."
                  className="w-full px-3 py-2 rounded border border-neutral-300 text-neutral-900 text-xs focus:border-primary-600 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Latitude <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={hubForm.hub_latitude}
                    onChange={(e) => setHubForm({ ...hubForm, hub_latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded border border-neutral-300 text-neutral-900 text-xs font-mono focus:border-primary-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Longitude <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={hubForm.hub_longitude}
                    onChange={(e) => setHubForm({ ...hubForm, hub_longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded border border-neutral-300 text-neutral-900 text-xs font-mono focus:border-primary-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700">Radius Jangkauan Wilayah</label>
                  <span className="font-mono font-bold text-primary-600">{hubForm.operational_radius_km} KM</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={hubForm.operational_radius_km}
                  onChange={(e) => setHubForm({ ...hubForm, operational_radius_km: Number(e.target.value) })}
                  className="w-full accent-primary-600 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={updateHubMutation.isPending}
                  className="w-full justify-center bg-primary-600 text-white hover:bg-primary-700"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>{updateHubMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan Hub"}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Right Map Canvas: 7 Cols */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs flex flex-col h-[480px]">
            <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between text-xs bg-neutral-50 shrink-0">
              <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-600" />
                Peta Penentuan Lokasi Markas & Lingkaran Buffer Radius
              </span>
              <span className="text-[11px] text-neutral-500">Tarik pin atau klik peta</span>
            </div>
            <div ref={mapContainerRef} className="w-full flex-1 isolate z-0 overflow-hidden" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ATURAN PEMBATASAN GIS */}
      {/* ========================================================================= */}
      {activeTab === "rules" && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs max-w-3xl space-y-5">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              Penegakan Aturan Spasial (GIS Spatial Rule Configuration)
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Atur apakah penetrasi area terlarang jalan protokol dan jalan tol memblokir pembuatan zona (BLOCKING) atau hanya menampilkan peringatan (ADVISORY).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Protocol Road Card */}
            <div className={`p-4 rounded-lg border transition-all ${
              operationalRules.protocol_road_prohibited
                ? "bg-rose-50/50 border-rose-200"
                : "bg-amber-50/50 border-amber-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs">Jalan Protokol</span>
                <button
                  type="button"
                  onClick={() => handleToggleRule("protocol_road_prohibited", operationalRules.protocol_road_prohibited)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    operationalRules.protocol_road_prohibited
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {operationalRules.protocol_road_prohibited ? "BLOCKING (ON)" : "ADVISORY (OFF)"}
                </button>
              </div>
              <p className="text-[11px] text-neutral-600 mt-2.5 leading-relaxed">
                {operationalRules.protocol_road_prohibited
                  ? "🔴 BLOCKING: Poligon zona yang beririsan dengan jalan protokol ditolak (HTTP 409 Conflict)."
                  : "🟡 ADVISORY ONLY: Zona yang beririsan diizinkan, tetapi sistem menampilkan peringatan spasial."}
              </p>
            </div>

            {/* Toll Road Card */}
            <div className={`p-4 rounded-lg border transition-all ${
              operationalRules.toll_road_prohibited
                ? "bg-rose-50/50 border-rose-200"
                : "bg-amber-50/50 border-amber-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs">Jalan Tol</span>
                <button
                  type="button"
                  onClick={() => handleToggleRule("toll_road_prohibited", operationalRules.toll_road_prohibited)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    operationalRules.toll_road_prohibited
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {operationalRules.toll_road_prohibited ? "BLOCKING (ON)" : "ADVISORY (OFF)"}
                </button>
              </div>
              <p className="text-[11px] text-neutral-600 mt-2.5 leading-relaxed">
                {operationalRules.toll_road_prohibited
                  ? "🔴 BLOCKING: Poligon zona yang beririsan dengan jalan tol ditolak (HTTP 409 Conflict)."
                  : "🟡 ADVISORY ONLY: Zona yang beririsan diizinkan, tetapi sistem menampilkan peringatan spasial."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PREFERENSI MAP TILES LEAFLET */}
      {/* ========================================================================= */}
      {activeTab === "map" && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs max-w-4xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Preferensi Basemap Tiles & Toleransi Geofence</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Pilih gaya peta dasar yang akan digunakan secara konsisten pada seluruh peta kontrol operasional.</p>
            </div>
            <button
              type="button"
              onClick={resetDefaults}
              className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold border border-neutral-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Bawaan</span>
            </button>
          </div>

          {/* Tile Source & API Key Status Banner */}
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasMapTilerKey ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {hasMapTilerKey
                    ? "MapTiler API Key Terdeteksi & Terhubung (VITE_MAPTILER_KEY)"
                    : "Mode Bebas / Free Basemap Aktif (OpenStreetMap Standard)"}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {hasMapTilerKey
                    ? "Tiles MapTiler aktif. Jika koneksi atau key bermasalah, aplikasi otomatis beralih ke OSM Standard tanpa error/watermark."
                    : "Menggunakan OpenStreetMap Standard 100% gratis, cepat, ringan, tanpa watermark Carto, dan tanpa kuota API key."}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold shrink-0 ${
                hasMapTilerKey
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
            >
              {hasMapTilerKey ? "MAPTILER KEY READY" : "FREE OSM READY"}
            </span>
          </div>

          {/* Provider Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-700 block">Pilihan Gaya Peta Dasar (Basemap Provider):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {providers.map((p) => {
                const isSelected = prefs.basemapId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBasemapId(p.id)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                      isSelected
                        ? "bg-blue-50/60 border-primary-600 shadow-xs"
                        : "bg-neutral-50 border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-neutral-900 block truncate">{p.name}</span>
                        {p.isFree && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shrink-0">
                            FREE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{p.id}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/50">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600">
                        MAX ZOOM {p.maxZoom}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Geofence Tolerance Buffer */}
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Toleransi Penyangga Geofence (PostGIS Buffer)</h4>
                <p className="text-[11px] text-neutral-500">Batas toleransi deviasi sinyal GPS rider sebelum dinyatakan keluar dari zona poligon.</p>
              </div>
              <span className="text-xs font-mono font-bold text-primary-600">±{prefs.geofenceBufferMeters} Meter</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={prefs.geofenceBufferMeters}
              onChange={(e) => setBufferMeters(Number(e.target.value))}
              className="w-full accent-primary-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>Ketat (±10m)</span>
              <span>Standar Sidoarjo (±50m)</span>
              <span>Longgar (±150m)</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT KESIAPAN SISTEM */}
      {/* ========================================================================= */}
      {activeTab === "readiness" && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Audit Kesiapan Fondasi Operasional</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Evaluasi menyeluruh terhadap kelengkapan markas, zona, DSS, dan armada.</p>
            </div>
            <button
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.settings.readiness() })}
              className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold border border-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Pindai Ulang</span>
            </button>
          </div>

          {loadingReadiness ? (
            <p className="text-xs text-neutral-400 py-4">Memuat data kesiapan sistem...</p>
          ) : (
            <div className="space-y-2.5">
              {readiness?.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {item.status === "READY" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{item.title}</span>
                        <StatusBadge variant={item.is_mandatory ? "danger" : "default"}>
                          {item.is_mandatory ? "Wajib" : "Disarankan"}
                        </StatusBadge>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    {item.current_value && (
                      <span className="font-mono text-[11px] bg-white border border-neutral-200 px-2 py-0.5 rounded text-neutral-700">
                        {typeof item.current_value === "object" ? JSON.stringify(item.current_value) : item.current_value}
                      </span>
                    )}
                    <a
                      href={item.route}
                      className="px-2.5 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-medium transition-colors"
                    >
                      {item.action_label}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DATA FRESHNESS & SINKRONISASI */}
      {/* ========================================================================= */}
      {activeTab === "sync" && (
        <div className="space-y-5 max-w-4xl">
          {/* Quick Triggers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-primary-600" />
                  Overpass OpenStreetMap (POI Sync)
                </span>
                <StatusBadge variant="info">OSM ELT Pipeline</StatusBadge>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Sinkronisasi point of interest perkotaan (sekolah, stasiun, pasar, perkantoran) dari OpenStreetMap ke database lokal.
              </p>
              <Button
                type="button"
                onClick={() => triggerPoiSyncMutation.mutate()}
                disabled={triggerPoiSyncMutation.isPending}
                className="w-full justify-center bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${triggerPoiSyncMutation.isPending ? "animate-spin" : ""}`} />
                <span>{triggerPoiSyncMutation.isPending ? "Menyinkronkan..." : "Sinkronisasi POI Sekarang"}</span>
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-500" />
                  Open-Meteo API (Weather Sync)
                </span>
                <StatusBadge variant="info">Hourly Forecast</StatusBadge>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Pembaruan data telemetri cuaca, peluang hujan, dan suhu per zona untuk kriteria C4 Hybrid BWM-TOPSIS.
              </p>
              <Button
                type="button"
                onClick={() => triggerWeatherSyncMutation.mutate()}
                disabled={triggerWeatherSyncMutation.isPending}
                className="w-full justify-center bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${triggerWeatherSyncMutation.isPending ? "animate-spin" : ""}`} />
                <span>{triggerWeatherSyncMutation.isPending ? "Menyinkronkan..." : "Sinkronisasi Cuaca Sekarang"}</span>
              </Button>
            </div>
          </div>

          {/* Sync Runs History */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-neutral-900 mb-3">Riwayat Eksekusi Sinkronisasi Terakhir</h4>
            {syncRuns.length === 0 ? (
              <p className="text-xs text-neutral-400 py-3">Belum ada riwayat sinkronisasi tercatat.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 text-[11px]">
                      <th className="py-2">Tipe Data</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Waktu Eksekusi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncRuns.map((r, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-2 font-mono font-medium text-neutral-800">{r.data_type || r.type || "SYNC"}</td>
                        <td className="py-2">
                          <StatusBadge variant={r.status === "SUCCESS" ? "success" : "warning"}>
                            {r.status || "COMPLETED"}
                          </StatusBadge>
                        </td>
                        <td className="py-2 text-neutral-500 font-mono text-[11px]">
                          {r.created_at || r.executed_at || "Just now"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDIT LOG & CRON SCHEDULER */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Cron Scheduler Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs">
            <div className="border-b border-neutral-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-600" />
                  Scheduler Cron Jobs & Background Workers
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Kelola otomasi berkala untuk sinkronisasi cuaca dan monitoring geofence.</p>
              </div>
            </div>

            {loadingCron ? (
              <p className="text-xs text-neutral-400">Memuat konfigurasi cron...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {cronConfigs.map((cron) => (
                  <div key={cron.id || cron.cron_key} className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">{cron.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono block">{cron.cron_expression}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCronMutation.mutate(cron.cron_key)}
                        className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                          cron.is_active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {cron.is_active ? "AKTIF" : "NONAKTIF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerCronMutation.mutate(cron.cron_key)}
                        className="p-1 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-700 cursor-pointer"
                        title="Picu secara manual"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-neutral-700" />
              Log Audit Aktivitas Sistem
            </h4>

            {loadingAudit ? (
              <p className="text-xs text-neutral-400">Memuat log audit...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-neutral-400 py-3">Belum ada catatan aktivitas audit.</p>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-neutral-100 border-b border-neutral-200 text-neutral-600 text-[11px]">
                    <tr>
                      <th className="p-2">Aksi</th>
                      <th className="p-2">Entitas</th>
                      <th className="p-2">Role</th>
                      <th className="p-2">Waktu</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50 text-[11px]">
                        <td className="p-2 font-mono font-bold text-neutral-900">{log.action}</td>
                        <td className="p-2 text-neutral-600 font-mono">{log.entity_type || "-"}</td>
                        <td className="p-2">
                          <StatusBadge variant="default">{log.user_role || "SYSTEM"}</StatusBadge>
                        </td>
                        <td className="p-2 text-neutral-500 font-mono">
                          {new Date(log.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="p-2">
                          <StatusBadge variant={log.status === "SUCCESS" ? "success" : "danger"}>
                            {log.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for GIS Spatial Rules */}
      {pendingRuleChange && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-neutral-200 max-w-md w-full p-5 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
              Konfirmasi Perubahan Aturan Spasial
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
              {pendingRuleChange.message}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingRuleChange(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={() =>
                  updateRuleMutation.mutate({
                    [pendingRuleChange.ruleKey]: pendingRuleChange.targetValue,
                  })
                }
                disabled={updateRuleMutation.isPending}
                className="bg-primary-600 text-white hover:bg-primary-700 text-xs"
              >
                {updateRuleMutation.isPending ? "Memperbarui..." : "Ya, Terapkan Aturan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
