# FRONTEND PART 03 — FLEET & BATTERY MANAGEMENT (COMPREHENSIVE MULTI-PANEL)

## 1. Objective
Menyediakan modul manajemen armada komprehensif: Panel Metrik Utilisasi, Panel Pemantauan Kesehatan Baterai & Siklus Cas, Panel Odometer & Estimasi Servis, Grid/Tabel Unit Interaktif, serta Panel Log Pemeliharaan (*Maintenance History*).

---

## 2. Blueprint 5 Panel Utama Halaman Fleet Management

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Fleet & Armada Management | [ + Tambah Armada Baru ] [ 📱 Scan QR Unit ] [ 📥 Unduh Laporan ]  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 1] 4 KPI SUMMARY CARDS KESEHATAN ARMADA                                                         │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ 🚲 TOTAL ARMADA      │ 🟢 SIAP PAKAI (READY)│ 🛵 SEDANG BERTUGAS   │ 🛠️ DALAM PERAWATAN / SERVIS   │ │
│ │ 14 Unit Terdaftar    │ 3 Unit Tersedia      │ 10 Unit (71.4%)      │ 1 Unit (Armada #003)          │ │
│ │ 100% Motor Listrik   │ Siap di-assign       │ GPS Aktif            │ Estimasi Selesai: Besok 14:00 │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 2 & 3] ROW: MONITORING BATERAI & JADWAL PEMELIHARAAN (12 Kolom: 6 + 6)                          │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 2] 🔋 BATTERY HEALTH & CHARGING STATUS (6 Kolom)│ [PANEL 3] ⏱️ ODOMETER & SERVICE SCHEDULE │ │
│ │ • Rata-rata Baterai: 82%                               │ • Total Jarak Seluruh Armada: 14.820 km   │ │
│ │ • Status Baterai Rendah (<25%): 1 Unit (#008 - 18%)    │ • Unit Melewati Batas Servis (>1.000 km): │ │
│ │ • Distribusi Daya: 11 Hijau (>50%) · 2 Kuning · 1 Merah│   ↳ Armada #003 (1.240 km) ── [ Servis ]  │ │
│ │ • Estimasi Jarak Tempuh Gabungan Tersisa: 420 km       │ • Rata-rata Jarak Harian per Rider: 24 km │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 4] 📋 INTERACTIVE FLEET GRID & TABLE VIEW (Toggle Mode: Cards / Table)                          │
│ Kartu Unit #001: Plat W 4521 OA • Rider: Fajar • Baterai 85% • Odo 850 km • [ 🟢 IN_USE ] • [ Detail ] │
│ Kartu Unit #002: Plat W 4522 OB • Rider: Andi  • Baterai 92% • Odo 420 km • [ 🟢 IN_USE ] • [ Detail ] │
│ Kartu Unit #003: Plat W 4523 OC • Servis Rutin • Biaya Rp 150.000 • [ 🛠️ MAINTENANCE ] • [ Lepas ]    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 5] 📜 RIWAYAT SERVIS & LOG BIAYA PERAWATAN (Maintenance Log Table dengan Nota & Spareparts)     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Konfirmasi Khusus Fleet Management
1. **Modal Pengalihan ke Maintenance (Danger/Warning):**
   - Jika unit sedang digunakan oleh rider, sistem memunculkan peringatan bahwa penugasan rider harus dialihkan.
   - Input: Catatan kerusakan, estimasi biaya, dan tanggal target selesai.
2. **Modal Pelepasan Servis (*Release to Available*):**
   - Checklist konfirmasi kelaikan operasional (Pengereman, Kondisi Baterai, Lampu, Tekanan Ban).
