# Spesifikasi UI/UX: Supervisor - Eksekusi DSS & Rekomendasi TOPSIS (`/dss`)

Dokumen ini merancang antarmuka **DSS TOPSIS Execution & Recommendation Workspace** untuk Supervisor. Supervisor dapat melihat bobot kriteria aktif, menjalankan kalkulasi DSS secara real-time, dan mengadopsi rekomendasi perankingan zona untuk plotting rider.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Active Weights** | `GET /api/dss/bwm/active` |
| **Run Hybrid TOPSIS** | `POST /api/dss/evaluate` |
| **Get Recommendations**| `GET /api/dss/recommendations` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `dssRoutes.js` (RBAC: `SUPERVISOR`, `SUPERADMIN`) |
| **Batasan Role** | ❌ Supervisor TIDAK boleh mengubah matriks perbandingan BWM dasar / bobot master |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Decision Support > Eksekusi Rekomendasi Zona TOPSIS     | [Avatar: SPV]  |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | EKSEKUSI & HASIL PERANKINGAN ZONA TOPSIS                                           |
|              |                                                                                   |
| [ ] Dashboard| Bobot Aktif BWM: Pasar (42.8%), Lalu Lintas (22.4%), Kompetitor (16.1%), Cuaca... |
| [ ] Zona Ops +-----------------------------------------------------------------------------------+
| [•] DSS TOPSIS| [▶ JALANKAN PERHITUNGAN TOPSIS REAL-TIME]      Terakhir dihitung: 06:00:15 WIB    |
| [ ] Plotting +-----------------------------------------------------------------------------------+
| [ ] Armada   | TABEL REKOMENDASI PERANKINGAN ZONA (TOPSIS PREFERENCE SCORE V_i)                   |
| [ ] Katalog  | +-------------------------------------------------------------------------------+ |
| [ ] Peta Ops | | Rank | Nama Zona       | Skor (V_i) | Jarak D+ | Jarak D- | Rekomendasi Alokasi | |
| [ ] Laporan  | +-------------------------------------------------------------------------------+ |
|              | | #1   | Sudirman CBD    | 0.842      | 0.045    | 0.241    | Alokasikan 6 Rider  | |
|              | | #2   | Kuningan Mega   | 0.791      | 0.061    | 0.230    | Alokasikan 5 Rider  | |
|              | | #3   | Blok M Square   | 0.730      | 0.078    | 0.210    | Alokasikan 4 Rider  | |
|              | | #4   | Senayan Park    | 0.512      | 0.120    | 0.126    | Alokasikan 2 Rider  | |
|              | +-------------------------------------------------------------------------------+ |
|              | [ ADOPSI KE WORKSPACE PLOTTING RIDER ]                                            |
+---------------------------------------------------------------------------------------------------+
```
