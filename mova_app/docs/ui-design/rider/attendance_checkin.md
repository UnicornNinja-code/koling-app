# Spesifikasi UI/UX: Rider - Presensi & Check-in Zona GPS

Dokumen ini merancang antarmuka **GPS-Verified Operational Check-in & Check-out** untuk Rider.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Check-in Zona** | `POST /api/rider/check-in` |
| **Check-out Shift & Return** | `POST /api/rider/checkout` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `riderOperationalRoutes.js` (RBAC: `RIDER`) |
| **PostGIS Spatial Check** | Sistem memverifikasi koordinat GPS latitude/longitude rider berada di dalam poligon zona tugas (toleransi jarak < 50-100 meter). |

### Request Payload (`POST /api/rider/check-in`):
```json
{
  "zoneId": "zn_01",
  "latitude": -6.2235,
  "longitude": 106.8095,
  "accuracyMeters": 4.5,
  "selfieImageUrl": "https://cdn.cozis.id/checkin/selfie_123.jpg"
}
```

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+-------------------------------------------------------------+
|  < KEMBALI                     PRESENSI & CHECK-IN ZONA     |
+-------------------------------------------------------------+
|                                                             |
|  PETA VERIFIKASI GPS (Mini Leaflet Map)                     |
|  +-------------------------------------------------------+  |
|  |  +-----------------------------+                      |  |
|  |  |  Poligon: Sudirman CBD      |  📍 Koordinat Anda   |  |
|  |  |  [ ● Posisi Anda di Sini ]  |  Akurasi: 4.5 meter  |  |
|  |  +-----------------------------+                      |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  STATUS VALIDASI LOKASI:                                    |
|  [✓] Anda berada di dalam Zona Tugas (Sudirman Central)     |
|                                                             |
|  VERIFIKASI FOTO KEHADIRAN (Opsional / Kamera PWA)          |
|  +-------------------------------------------------------+  |
|  |  [ + AMBIL FOTO SELFIE DENGAN ARMADA ]                |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |           [ CHECK-IN & MULAI JUALAN ]                 |  |
|  |     bg: #10B981 (Success) | Teks: #FFF | Tinggi: 50px |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```
