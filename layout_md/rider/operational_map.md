# Spesifikasi UI/UX: Rider - Peta Navigasi & Peringatan Jalan Protokol (`/rider/map`)

Dokumen ini merancang antarmuka **Limited Operational Map with Proximity Protocol Road Warning System** untuk Rider. Sesuai spesifikasi di [fitur.md](file:///f:/project_zero/md/fitur.md), rider mendapatkan peringatan bahaya otomatis jika jarak ke jalan protokol terlarang $\le 50\text{ meter}$.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Track Location & Alert** | `POST /api/lbs/track` |
| **Get My Zone Geofence** | `GET /api/zones/:myZoneId` |
| **Get Restricted Roads** | `GET /api/roads` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `lbsRoutes.js` & `roadRoutes.js` (RBAC: `RIDER`) |
| **Logika Peringatan Proximity**| Jarak $> 50\text{m} \rightarrow$ Normal (Hijau); Jarak $\le 50\text{m} \rightarrow$ Warning Banner & Getar (Merah). |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

### State A: Normal (> 50 meter dari Jalan Protokol)
```text
+-------------------------------------------------------------+
|  < KEMBALI                           PETA NAVIGASI ZONA     |
+-------------------------------------------------------------+
|  +-------------------------------------------------------+  |
|  | [BANNER STATUS: AMAN DI DALAM ZONA SUDIRMAN CENTRAL]  |  |
|  | Background: #ECFDF5 | Teks: #10B981                     |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  PETA INTERAKTIF LAYAR PENUH                                |
|  +-------------------------------------------------------+  |
|  |             +----------------------------+            |  |
|  |             |  [ Poligon Zona Saya ]     |            |  |
|  |             |                            |            |  |
|  |             |      [🛵 Posisi Anda]     |            |  |
|  |             |                            |            |  |
|  |             +----------------------------+            |  |
|  |                                                       |  |
|  |  ==========================================           |  |
|  |  [ JALAN PROTOKOL LARANGAN - Jarak: 250m ]           |  |
|  |  ==========================================           |  |
|  +-------------------------------------------------------+  |
|  [ 🎯 Pusatkan Lokasi Saya ]      [ ⚠️ Laporkan Kendala ]   |
+-------------------------------------------------------------+
```

### State B: PERINGATAN BAHAYA (Jarak $\le 50$ meter)
```text
+-------------------------------------------------------------+
|  +-------------------------------------------------------+  |
|  | 🚨 PERINGATAN! MENDEKATI JALAN PROTOKOL LARANGAN!     |  |
|  | Jarak Anda ke Jl. Jend. Sudirman Utama: 35 METER      |  |
|  | SEGERA BERPUTAR ARAH / TETAP DI JALUR LAMBAT          |  |
|  | Background: #FEF2F2 | Border: #EF4444 | Teks: #B82814  |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [ Peta berkedip dengan border merah dan getaran haptic ]   |
+-------------------------------------------------------------+
```
