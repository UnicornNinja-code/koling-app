# Spesifikasi UI/UX: Super Admin - Konfigurasi DSS BWM-TOPSIS (`/dss`)

Dokumen ini merancang antarmuka **DSS Master Configuration** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Calculate BWM** | `POST /api/dss/bwm/calculate` |
| **Active Config** | `GET /api/dss/bwm/active` |
| **Evaluate TOPSIS** | `POST /api/dss/evaluate` |
| **Snapshots History** | `GET /api/dss/snapshots` & `GET /api/dss/snapshots/:id` |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN`) |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Tabs**: `Tabs.svelte`, `TabItem.svelte`
- **Engine Controls**: `Select.svelte`, `Slider.svelte`, `Button.svelte`
- **Display**: `ProgressBar.svelte`, `DataTable.svelte`, `Badge.svelte`, `Drawer.svelte`, `Modal.svelte`

### 2.2 Token Desain Opaline
- **Slider Track**: `var(--color-primary)` (`#FF634A`), Thumb: `#B82814`
- **Konsistensi Valid ($\xi^* \le 0.1$)**: `#10B981` / `#ECFDF5`
- **Konsistensi Peringatan ($\xi^* > 0.1$)**: `#EF4444` / `#FEF2F2`

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari setting... (Ctrl+K)] | Breadcrumb: DSS > Konfigurasi BWM-TOPSIS | [Avatar SA]           |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | KONFIGURASI DSS BWM & TOPSIS                                                                          |
|                 |                                                                                                       |
| NAVIGATION      | TABS:                                                                                                 |
| [ ] Dashboard   | [• 1. Bobot BWM]                 [ 2. Simulasi TOPSIS ]                 [ 3. Riwayat Snapshot ]       |
| [ ] User        +-------------------------------------------------------------------------------------------------------+
| [ ] Zona        | 1. PILIH KRITERIA BEST & WORST                                                                        |
| [•] DSS         | Kriteria Terbaik (Best) : [ POTENSI_PASAR        v ]                                                  |
| [ ] Armada      | Kriteria Terburuk (Worst): [ JARAK_HUB            v ]                                                 |
| [ ] Katalog     +-------------------------------------------------------------------------------------------------------+
| [ ] Plotting    | 2. MATRIKS PERBANDINGAN SAATY (1 - 9)                                                                 |
| [ ] Map         |                                                                                                       |
| [ ] Laporan     | A. Best-to-Others:                                                                                    |
| [ ] Settings    |    • Potensi Pasar vs Kepadatan Lalu Lintas  : [─────●────────] 3                                     |
|                 |    • Potensi Pasar vs Jumlah Kompetitor      : [───────●──────] 4                                     |
| ENGINE STATUS   |    • Potensi Pasar vs Kondisi Cuaca          : [─────────●────] 5                                     |
| Algoritma: BWM  |    • Potensi Pasar vs Jarak dari Hub         : [─────────────●] 7                                     |
| Konsistensi: OK |                                                                                                       |
| Last: 07:00 WIB | B. Others-to-Worst:                                                                                   |
|                 |    • Kepadatan Lalu Lintas vs Jarak dari Hub : [─────────●────] 5                                     |
|                 |    • Jumlah Kompetitor vs Jarak dari Hub     : [───────●──────] 4                                     |
|                 |    • Kondisi Cuaca vs Jarak dari Hub         : [─────●────────] 3                                     |
|                 |                                                                                                       |
|                 | [ ⚡ Hitung Bobot BWM ]  [ 🔄 Reset ]                                                                 |
|                 +-------------------------------------------------------------------------------------------------------+
|                 | HASIL BOBOT (w_j) & KONSISTENSI                                                                       |
|                 | +---------------------------------------------------------------------------------------------------+ |
|                 | | KRITERIA                | TIPE    | BOBOT (w_j)   | DISTRIBUSI BOBOT                              | |
|                 | +-------------------------+---------+---------------+-----------------------------------------------+ |
|                 | | Potensi Pasar (C1)      | Benefit | 0.428 (42.8%) | [████████████████████░░░░░░░░░░░░░░░░░░░░░░░] | |
|                 | | Kepadatan Lalu Lintas(C2| Benefit | 0.224 (22.4%) | [███████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] | |
|                 | | Jumlah Kompetitor (C3)  | Cost    | 0.161 (16.1%) | [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] | |
|                 | | Kondisi Cuaca (C4)      | Benefit | 0.125 (12.5%) | [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] | |
|                 | | Jarak dari Hub (C5)     | Cost    | 0.062 (6.2%)  | [███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] | |
|                 | +-------------------------+---------+---------------+-----------------------------------------------+ |
|                 | Rasio Konsistensi (ξ*): 0.038   [ BADGE: KONSISTEN (ξ* ≤ 0.1) ]                                       |
|                 |                                                                                                       |
|                 | [ 💾 Terapkan Bobot Resmi ]   [ 📄 Simpan Draf ]                                                      |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog & Drawer

### 4.1 Modal: Terapkan Bobot (`#modal-apply-weights`)
```text
+-----------------------------------------------------------------------+
| TERAPKAN BOBOT RESMI DSS                                  [ X Tutup ] |
+-----------------------------------------------------------------------+
| Bobot baru akan diterapkan langsung ke ranking TOPSIS Supervisor.     |
|                                                                       |
| Ringkasan:                                                            |
| • C1 Potensi Pasar (42.8%)   • C2 Trafik (22.4%)  • C3 Saingan (16.1%)|
| • C4 Cuaca (12.5%)           • C5 Jarak (6.2%)    • Nilai ξ*: 0.038   |
|                                                                       |
| Catatan (Opsional):                                                   |
| [ Update bobot cuaca musim hujan Q4                                 ] |
|                                                                       |
| ───────────────────────────────────────────────────────────────────── |
| [ Batal ]                                           [ YA, TERAPKAN ]  |
+-----------------------------------------------------------------------+
```

### 4.2 Drawer: Detail Solver Linear (`#drawer-bwm-math`)
```text
+-------------------------------------------------------------------+
| AUDIT LINEAR SOLVER BWM                               [ X Tutup ] |
+-------------------------------------------------------------------+
| HASIL OPTIMASI:                                                   |
| • Nilai ξ* : 0.03821                                              |
| • CI Index : 3.73 (a_BW = 7)                                      |
| • CR Ratio : 0.01024 (< 0.1 VALID)                                |
| • Durasi   : 18 ms                                                |
|                                                                   |
| ───────────────────────────────────────────────────────────────── |
| [ 📥 Ekspor LaTeX ]                                     [ Tutup ] |
+-------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Auto Consistency Calc**: Menghitung estimasi $\xi^*$ saat slider digeser.
2. **Lock Protection**: Tombol simpan dinonaktifkan jika $\xi^* > 0.1$.

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: 2 kolom (Slider di kiri, Hasil bobot di kanan).
- **Tablet (768px - 1024px)**: Stacked vertikal.
- **Mobile (375px - 430px)**: Slider layar penuh dengan sentuhan jari lebar.
