# Spesifikasi UI/UX: Supervisor - Peta Komando Operasional Real-time

Dokumen ini merancang antarmuka **Operational Command Map** untuk Supervisor. Peta ini berfokus pada pengawasan taktikal pergerakan rider, geofence compliance, dan titik POI di zona tugas.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Live Rider GPS** | WebSocket `rider:location_updated` & `POST /api/lbs/track` |
| **Zone Geofences** | `GET /api/zones/config` |
| **POI & Kompetitor** | `GET /api/pois` |
| **Restricted Roads** | `GET /api/roads` |
| **DSS Zone Ranks** | `GET /api/dss/recommendations` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend (RBAC: `SUPERVISOR`, `SUPERADMIN`) |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Peta Komando > Live Tactical Map                        | [Avatar: SPV]  |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | PETA KOMANDO OPERASIONAL LAPANGAN (REAL-TIME)                                      |
|              |                                                                                   |
| [ ] Dashboard| +-------------------------------------------------------------------------------+ |
| [ ] Zona Ops | | [LAYER CONTROL: (v) Posisi Rider (v) Geofence Zona (v) Jalan Larangan (v) POI]| |
| [ ] DSS TOPSIS| |                                                                               | |
| [ ] Plotting | |                [ZONA 1: SUDIRMAN CBD - Kuota 6/6]                             | |
| [ ] Armada   | |                +-------------------------------------------------+             | |
| [ ] Katalog  | |                | [● Rider Budi: CHECKED-IN (GPS 4m)]             |             | |
| [•] Peta Ops | |                | [● Rider Dimas: OTW MENUJU ZONA]                |             | |
| [ ] Laporan  | |                | --------------------------------- (Jalan Merah) |             | |
|              | |                +-------------------------------------------------+             | |
|              | |                                                                               | |
|              | +-------------------------------------------------------------------------------+ |
|              | | STATUS LAPANGAN: 42 Rider Online | 38 Checked-In | 0 Pelanggaran Geofence     | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
