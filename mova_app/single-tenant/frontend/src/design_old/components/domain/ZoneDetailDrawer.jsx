import React, { useState } from "react";
import {
  Layers,
  MapPin,
  Bike,
  Sparkles,
  CloudRain,
  Users,
  Compass,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  Clock,
  ShieldCheck,
  Coffee,
  MessageSquare,
  X,
} from "lucide-react";
import {
  Drawer,
  Badge,
  Button,
} from "../ui/index.js";
import { WeatherIcon } from "../ui/WeatherIcon.jsx";

/**
 * ZoneDetailDrawer
 * 3-Tab Slide-Over Inspector for Map Ops:
 * - Tab 1: Potensi & Cuaca (Skor 0-100 & Prakiraan Cuaca 6 Jam)
 * - Tab 2: Rider di Zona (Daftar & Presensi)
 * - Tab 3: Titik Jual (Ketersediaan Spot Strategis)
 */
export function ZoneDetailDrawer({
  isOpen,
  onClose,
  zone,
  riders = [],
  sellingSpots = [],
  onFlyToRider = () => {},
  onFlyToSpot = () => {},
}) {
  const [activeTab, setActiveTab] = useState("dss"); // "dss" | "riders" | "spots"

  if (!zone) return null;

  // Filter riders belonging to this zone
  const zoneRiders = riders.filter(
    (r) => r.zoneId === zone.id || r.zone_id === zone.id || r.zoneName === zone.name
  );

  // Mock weather timeline if not in zone object
  const weatherTimeline = zone.weatherTimeline || [
    { time: "08:00", temp: 28, condition: "Cerah", icon: "sunny", rain: 0 },
    { time: "10:00", temp: 30, condition: "Cerah", icon: "sunny", rain: 0 },
    { time: "12:00", temp: 32, condition: "Cerah Berawan", icon: "partly_cloudy", rain: 0 },
    { time: "14:00", temp: 31, condition: "Berawan", icon: "cloudy", rain: 10 },
    { time: "16:00", temp: 29, condition: "Siaga Hujan Ringan", icon: "rain_light", rain: 35 },
    { time: "18:00", temp: 27, condition: "Hujan Sedang", icon: "rain_moderate", rain: 60 },
  ];

  // Mock candidate spots if empty
  const spots = sellingSpots.length > 0 ? sellingSpots : [
    {
      id: `${zone.id}-spot-1`,
      name: `Spot Utama Gerbang ${zone.name}`,
      category: "Pusat Keramaian & Kuliner",
      score: 0.94,
      revenuePotential: "Rp 680.000 / shift",
      crowdLevel: "Sangat Padat",
      isLocked: zoneRiders.length > 0,
      assignedRider: zoneRiders[0]?.name || null,
      lat: zone.lat || -7.4478,
      lng: zone.lng || 112.7178,
    },
    {
      id: `${zone.id}-spot-2`,
      name: `Spot Simpang Protokol ${zone.name}`,
      category: "Aksesibilitas Tinggi",
      score: 0.88,
      revenuePotential: "Rp 540.000 / shift",
      crowdLevel: "Padat",
      isLocked: zoneRiders.length > 1,
      assignedRider: zoneRiders[1]?.name || null,
      lat: (zone.lat || -7.4478) + 0.002,
      lng: (zone.lng || 112.7178) + 0.002,
    },
    {
      id: `${zone.id}-spot-3`,
      name: `Spot Area Parkir Timur ${zone.name}`,
      category: "Perkantoran & Sekolah",
      score: 0.81,
      revenuePotential: "Rp 460.000 / shift",
      crowdLevel: "Sedang",
      isLocked: false,
      assignedRider: null,
      lat: (zone.lat || -7.4478) - 0.002,
      lng: (zone.lng || 112.7178) - 0.002,
    },
  ];

  // 6 Criteria normalization
  const c1 = zone.c1 !== undefined ? zone.c1 : 0.85;
  const c2 = zone.c2 !== undefined ? zone.c2 : 0.78;
  const c3 = zone.c3 !== undefined ? zone.c3 : 0.90;
  const c4 = zone.c4 !== undefined ? zone.c4 : 0.82;
  const c5 = zone.c5 !== undefined ? zone.c5 : 0.74;
  const c6 = zone.c6 !== undefined ? zone.c6 : 0.45;

  // Convert decimal score to 0-100 integer score
  const rawScore = parseFloat(zone.score || zone.preference_score) || 0.84;
  const score100 = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Peringkat #{zone.rank || 1}
          </Badge>
          <span className="font-bold text-slate-900 dark:text-white truncate">
            {zone.name}
          </span>
        </div>
      }
      position="right"
      size="lg"
    >
      <div className="flex flex-col h-full">
        {/* Top Tab Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-1 gap-1">
          <button
            onClick={() => setActiveTab("dss")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === "dss"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Potensi & Cuaca</span>
          </button>
          <button
            onClick={() => setActiveTab("riders")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === "riders"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Rider di Zona ({zoneRiders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("spots")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === "spots"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Titik Jual ({spots.length})</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* TAB 1: POTENSI & CUACA */}
          {activeTab === "dss" && (
            <div className="space-y-5 text-xs">
              {/* Score & Capacity Overview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      Skor Potensi Wilayah
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                      <span>{score100}</span>
                      <span className="text-sm font-semibold text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={score100 >= 75 ? "success" : score100 >= 50 ? "primary" : "warning"} size="sm">
                      {score100 >= 80 ? "Sangat Layak" : score100 >= 65 ? "Prioritas Tinggi" : "Standar"}
                    </Badge>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Kapasitas: {zoneRiders.length} / {zone.maxCapacity || zone.max_capacity || 8} Slot
                    </div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          ((zoneRiders.length || 1) / (zone.maxCapacity || zone.max_capacity || 8)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Criteria Breakdown Progress Bars */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Evaluasi Kriteria Wilayah
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Analisis Real-Time</span>
                </div>

                {/* C1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">C1 : Densitas POI</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{(c1 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c1 * 100}%` }} />
                  </div>
                </div>

                {/* C2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">C2 : Diversitas POI</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{(c2 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c2 * 100}%` }} />
                  </div>
                </div>

                {/* C3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">C3 : Skor Keramaian Berbasis Waktu</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{(c3 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${c3 * 100}%` }} />
                  </div>
                </div>

                {/* C4 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">C4 : Peluang Hujan</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{(c4 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${c4 * 100}%` }} />
                  </div>
                </div>

                {/* C5 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">C5 : Jarak dari HUB ke Zona</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{(c5 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${c5 * 100}%` }} />
                  </div>
                </div>

                {/* C6 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">C6 : Kompetitor</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{(c6 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${c6 * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* 6-Hour Spatial Weather Timeline */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span>Prakiraan Cuaca 6 Jam</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Pembaruan Berkala</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {weatherTimeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center space-y-1"
                    >
                      <div className="text-[10px] font-semibold text-slate-400">{item.time}</div>
                      <div className="flex justify-center my-1">
                        <WeatherIcon condition={item.condition} className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{item.temp}°C</div>
                      <div className="text-[9px] text-slate-500 truncate">{item.condition}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIDER DI ZONA */}
          {activeTab === "riders" && (
            <div className="space-y-3 text-xs">
              {zoneRiders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Bike className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <div className="font-bold text-slate-700 dark:text-slate-300">Belum Ada Rider di Zona Ini</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Gunakan Halaman Distribusi untuk menugaskan rider ke {zone.name}.
                  </div>
                </div>
              ) : (
                zoneRiders.map((rider) => {
                  const isDeviated = rider.status === "DEVIATION";
                  return (
                    <div
                      key={rider.id || rider.rider_id}
                      className={`p-3.5 rounded-2xl border transition-colors ${
                        isDeviated
                          ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                          : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                      } flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-black text-xs shrink-0 ${
                          isDeviated
                            ? "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800"
                            : "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                        }`}>
                          {(rider.name || rider.rider_name || "R").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {rider.name || rider.rider_name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span className="font-mono">{rider.armadaCode || rider.armada_code || "ARM-01"}</span>
                            <span>•</span>
                            <span>Presensi: {rider.checkInTime || rider.checked_in_at?.slice(11, 16) || "08:00"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={isDeviated ? "danger" : "success"}
                          size="sm"
                        >
                          {isDeviated ? "⚠️ Keluar Batas" : "🟢 Dalam Rute"}
                        </Badge>
                        {isDeviated && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={MessageSquare}
                            onClick={() => {
                              const phone = (rider.phone || "081234567890").replace(/[^0-9]/g, "");
                              const waUrl = `https://wa.me/${phone.startsWith("0") ? "62" + phone.slice(1) : phone}?text=${encodeURIComponent(
                                `Halo ${rider.name}, terdeteksi armada ${rider.armadaCode || "Anda"} saat ini berada di luar batas zona penugasan (${zone.name}). Mohon segera kembali ke area tugas atau konfirmasi status ke supervisor.`
                              )}`;
                              window.open(waUrl, "_blank");
                            }}
                          >
                            Tegur WA
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Compass}
                          onClick={() => onFlyToRider(rider)}
                        >
                          Lihat di Peta
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: TITIK JUAL */}
          {activeTab === "spots" && (
            <div className="space-y-3 text-xs">
              {spots.map((spot) => (
                <div
                  key={spot.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {spot.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{spot.category}</div>
                    </div>
                    <Badge variant={spot.isLocked ? "warning" : "success"} size="sm">
                      {spot.isLocked ? "Sedang Digunakan" : "Tersedia"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <div>
                      <div className="text-slate-400 text-[10px]">Estimasi Omset:</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{spot.revenuePotential}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Rider Bertugas:</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {spot.assignedRider || "Belum Ada"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Compass}
                      onClick={() => onFlyToSpot(spot)}
                    >
                      Tampilkan Titik
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default ZoneDetailDrawer;

