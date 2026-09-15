/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   ArmadaDetailDrawer.jsx (Slide-over Inspector for Fleet Unit Specifications, Context & Service Log)
 */

import React, { useState } from "react";
import {
  Truck,
  Battery,
  Wrench,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  History,
  Info,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle2,
  X,
  Zap,
} from "lucide-react";
import { Drawer, Badge, Button } from "../ui/index.js";

export function ArmadaDetailDrawer({
  isOpen,
  onClose,
  armada,
  onSetMaintenance,
  onReleaseMaintenance,
  onEdit,
}) {
  const [activeTab, setActiveTab] = useState(0);

  if (!armada) return null;

  const status = armada.status || "ACTIVE";
  const isMaintenance = status === "MAINTENANCE";
  const isInUse = status === "IN_USE";
  const isReserved = status === "RESERVED";
  const isAvailable = status === "ACTIVE" || status === "AVAILABLE";

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Unit {armada.code}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isMaintenance
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-300"
                    : isInUse
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-300"
                    : isReserved
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tipe: {armada.type || "GEROBAK"} • Hub Sidoarjo
            </p>
          </div>
        </div>
      }
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
          <div className="flex items-center gap-2">
            {isMaintenance ? (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => onReleaseMaintenance && onReleaseMaintenance(armada)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Rilis Servis (Siap Pakai)
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={Wrench}
                onClick={() => onSetMaintenance && onSetMaintenance(armada)}
                className="text-amber-600 hover:text-amber-700 border-amber-300 dark:border-amber-700"
              >
                Masuk Perbaikan
              </Button>
            )}
            {onEdit && (
              <Button variant="secondary" size="sm" onClick={() => onEdit(armada)}>
                Edit Unit
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {["Konteks Operasional", "Spesifikasi Teknis", "Riwayat Servis"].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
                activeTab === idx
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Current Operational Context */}
        {activeTab === 0 && (
          <div className="space-y-4 text-xs">
            {/* Status Card Banner */}
            <div
              className={`p-4 rounded-2xl border ${
                isInUse
                  ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                  : isReserved
                  ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                  : isMaintenance
                  ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                  : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {isInUse ? (
                  <>
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900 dark:text-blue-200">Sedang Aktif di Lapangan</span>
                  </>
                ) : isReserved ? (
                  <>
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-900 dark:text-amber-200">Direservasi / 5-Min Hold Lock</span>
                  </>
                ) : isMaintenance ? (
                  <>
                    <Wrench className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-900 dark:text-rose-200">Dalam Penanganan Bengkel Hub</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-900 dark:text-emerald-200">Standby di Central Hub Sidoarjo</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {isInUse
                  ? "Unit sedang dibawa rider beroperasi di zona target sesuai sesi operasional hari ini."
                  : isReserved
                  ? "Unit sedang di-lock oleh rider untuk inspeksi fisik sebelum konfirmasi klaim."
                  : isMaintenance
                  ? "Unit dinonaktifkan sementara dari antrean plotting hingga teknisi selesai melakukan perbaikan."
                  : "Unit dalam kondisi prima, baterai terisi, dan siap dipilih saat konfirmasi tugas di Hub."}
              </p>
            </div>

            {/* Rider & Assignment Info (If Assigned/In Use) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Informasi Penugasan
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Rider Aktif:</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    {armada.current_rider_name || armada.rider_name || "Belum ada rider"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Zona Operasi:</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    {armada.zone_name || "Central Hub Sidoarjo"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Waktu Pemakaian:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {armada.updated_at ? new Date(armada.updated_at).toLocaleTimeString("id-ID") : "08:15 WIB"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status Sensor IoT:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Online (92% Baterai)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Technical Specifications */}
        {activeTab === 1 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Spesifikasi Fisik & IoT
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-400">Nomor Seri / Kode:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{armada.code}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-400">Kategori Armada:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{armada.type || "GEROBAK LISTRIK"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-400">Kapasitas Muatan Kopi:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">120 Cup / 25 Liter Water Tank</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-400">Modul GPS Tracker:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">Quectel L76K GNSS (LBS Enabled)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Tanggal Registrasi:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {armada.created_at ? new Date(armada.created_at).toLocaleDateString("id-ID") : "10 Jan 2026"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Maintenance & Service Log */}
        {activeTab === 2 && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Log Pemeliharaan Terakhir
              </span>
              <Badge variant="primary" size="xs">
                3 Riwayat
              </Badge>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  date: "28 Feb 2026",
                  issue: "Penggantian kampas rem & kalibrasi baterai IoT",
                  cost: "Rp 150.000",
                  mechanic: "Bambang (Hub Tech)",
                  status: "SELESAI",
                },
                {
                  date: "14 Jan 2026",
                  issue: "Servis rutin berkala 500 km & pelumasan roda",
                  cost: "Rp 85.000",
                  mechanic: "Surya (Hub Tech)",
                  status: "SELESAI",
                },
              ].map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{log.issue}</span>
                    <Badge variant="success" size="xs">
                      {log.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {log.date} • {log.mechanic}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{log.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default ArmadaDetailDrawer;
