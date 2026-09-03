# Dokumen Audit & Koreksi Pencocokan Kebutuhan UI MOVA

Dokumen ini memvalidasi keselarasan antarmuka pengguna (*UI/UX*) platform **MOVA** dengan tiga sumber kebenaran (*Single Sources of Truth*):
1. [md/fitur.md](file:///f:/project_zero/md/fitur.md) — Matriks Hak Akses (RBAC), Batasan Peran, dan Prinsip Desain UI.
2. [E2E_WORKFLOW_MAP.md](file:///f:/project_zero/E2E_WORKFLOW_MAP.md) — Cetak Biru Operasional End-to-End, *State Machine*, dan Kontrak API.
3. Rekonstruksi Backend & Frontend ([bun_svelte/backend/reconstruction/](file:///f:/project_zero/bun_svelte/backend/reconstruction/) & [bun_svelte/frontend/reconstruction/](file:///f:/project_zero/bun_svelte/frontend/reconstruction/)).

---

## 1. Tabel Matriks Koreksi & Evaluasi Kebutuhan

| Domain Fitur | Spesifikasi `md/fitur.md` | Alur Operasional `E2E_WORKFLOW_MAP.md` | Status UI/UX Saat Ini | Temuan / Koreksi Wajib |
| :--- | :--- | :--- | :--- | :--- |
| **Peta Spasial (Map Ops)** | Seluruh layer (SuperAdmin), Fleet/Rider (Management), Komando Ops (Supervisor), Limited + Peringatan $\le 50$m (Rider) | Integrasi Leaflet, PostGIS GeoJSON polygon, LBS WebSocket, buffer $\pm 50$m jalan protokol | Rute `/map` telah dipulihkan; komponen `MonitoringMap` lengkap | **Wajib**: Implementasi preferensi map tiles (*basemap provider*) yang disimpan ke profil pengguna/localStorage. |
| **Manajemen User** | SuperAdmin (Full CRUD), Management (Hierarchical CRUD - **Dilarang membuat SuperAdmin**), Supervisor (**Hanya Plotting, bukan User Admin**), Rider (Self) | Provisi akun via token undangan, verifikasi tanggal lahir (`birth_date`), penegakan sandi `first_login` | Halaman `/users` saat ini masih berfokus ke SuperAdmin | **Wajib**: Buat antarmuka khusus Management (`ManagementUsersPage`) yang membatasi pembuatan role hanya Management, Supervisor, dan Rider. |
| **DSS BWM-TOPSIS** | SuperAdmin (Konfigurasi Bobot Master BWM), Supervisor (Eksekusi TOPSIS & Rekomendasi), Management (**TIDAK BOLEH AKSES**), Rider (Hanya zona rekomendasi diri) | SuperAdmin kalibrasi bobot Saaty (CR $\le 0.10$); Supervisor hitung TOPSIS jam 06:15 & commit alokasi | Halaman `/dss` menampilkan BWM & TOPSIS | **Wajib**: Sembunyikan modul DSS sepenuhnya dari sidebar navigasi Management. Tampilan Rider hanya menampilkan rekomendasi personal. |
| **Manajemen Armada** | Management (Kelola unit & utilisasi), Supervisor (Monitor status & posisi), Rider (Klaim 180s & Kembalikan) | Hold lock 180 detik (*absolute timestamp*), inspeksi fisik 6 poin, return dengan baterai $<30\% \rightarrow \text{CHARGING}$ | Modul SuperAdmin `/fleet` & Rider `/rider/armada` sudah ada | **Wajib**: Tambahkan antarmuka Management Fleet yang berfokus pada metrik utilisasi dan riwayat pemeliharaan. |
| **Katalog Menu & Harga** | Management (CRUD produk & kelola harga), Supervisor (View operasional), Rider (Kasir POS, dilarang ubah harga) | POS penjualan lapangan, kalkulasi kembalian tunai, dynamic QRIS 180 detik, Idempotency-Key | Halaman `/catalog` dan `/rider/pos` sudah ada | **Wajib**: Pastikan Management memiliki kontrol penuh penyesuaian harga jual, sedangkan Rider hanya memilih kuantitas. |
| **Laporan (Reporting)** | Laporan terpisah menurut peran: SA (Sistem & Audit), Management (Bisnis & Sales), Supervisor (Ops & Shift), Rider (Pribadi) | Rekonsiliasi kas harian, selisih kas fisik (*discrepancy reason*), sisa cup, log audit forensik | Halaman `/reports` saat ini masih menyatu | **Wajib**: Sediakan tab view terpisah pada `/reports` berdasarkan peran pengguna yang sedang login. |
| **Sidebar Navigation** | Navigasi dinamis berbasis peran (*Role-Based Sidebar Navigation*) | Setiap peran hanya melihat menu yang menjadi hak aksesnya | Sidebar sebelumnya masih statis | **Wajib**: Saring `navItems` di `AppShell.svelte` sesuai `authStore.user.role`. |

---

## 2. Rincian Koreksi Teknis & Solusi Implementasi

### A. Konfigurasi Preferensi Map Tiles (Leaflet Basemap User Preference)
- **Persyaratan**: Pengguna dapat memilih gaya peta dasar (*OpenMapTiles Dark, Streets, Satellite, Outdoor, Light, Basic*) dan preferensi tersebut harus disimpan secara reaktif di store Svelte 5 (`mapPreferences.svelte.ts`) serta tersimpan permanen di `localStorage`.
- **Implementasi**:
  1. Buat store [mapPreferences.svelte.ts](file:///f:/project_zero/bun_svelte/frontend/src/lib/stores/mapPreferences.svelte.ts).
  2. Hubungkan dengan [MonitoringMap.svelte](file:///f:/project_zero/bun_svelte/frontend/src/components/map/MonitoringMap.svelte) dan panel `MapBasemapPanel.svelte`.
  3. Sediakan selector preferensi basemap di halaman [SuperAdminSettingsPage.svelte](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminSettingsPage.svelte).

### B. Hierarchical User Management (Larangan Management Membuat SuperAdmin)
- **Persyaratan**: Sesuai [md/fitur.md](file:///f:/project_zero/md/fitur.md) baris 69-80, form pembuatan akun untuk role Management hanya boleh mengizinkan pemilihan:
  - `MANAGEMENT`
  - `SUPERVISOR`
  - `RIDER`
  *(Pilihan `SUPERADMIN` dinonaktifkan / dihilangkan sama sekali).*
- **Implementasi**: Tambahkan validasi peran di form dialog tambah akun pada [SuperAdminUsersPage.svelte](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminUsersPage.svelte) / komponen pengguna yang reaktif terhadap `authStore.user?.role`.

### C. Pemisahan Modul DSS dari Role Management
- **Persyaratan**: Sesuai [md/fitur.md](file:///f:/project_zero/md/fitur.md) baris 182-184:  
  *Management tidak boleh memiliki akses ke modul DSS.*
- **Implementasi**: Di [AppShell.svelte](file:///f:/project_zero/bun_svelte/frontend/src/components/layout/AppShell.svelte), menu `DSS TOPSIS` disaring sehingga **hanya muncul untuk SUPERADMIN dan SUPERVISOR**.

### D. Peta Terbatas & Peringatan Jalan Protokol untuk Rider
- **Persyaratan**: Sesuai [md/fitur.md](file:///f:/project_zero/md/fitur.md) baris 444-466:
  - Rider dapat melihat posisinya, zona yang ditugaskan, dan jalan protokol terlarang.
  - Jika jarak rider ke jalan protokol $\le 50\text{m}$, UI menampilkan status peringatan (*Warning Alert*).
- **Implementasi**: Pastikan layer jalan protokol terpasang dengan visualisasi zona penyangga (*buffer*) merah dan deteksi jarak satelit.

---

## 3. Rencana Eksekusi Bertahap (Execution Plan)

1. **Tahap 1**: Buat store reaktif preferensi peta [mapPreferences.svelte.ts](file:///f:/project_zero/bun_svelte/frontend/src/lib/stores/mapPreferences.svelte.ts) dan hubungkan dengan Leaflet tiles di `MonitoringMap.svelte`.
2. **Tahap 2**: Terapkan penyaringan navigasi dinamis berbasis peran (*RBAC Dynamic Navigation*) di [AppShell.svelte](file:///f:/project_zero/bun_svelte/frontend/src/components/layout/AppShell.svelte).
3. **Tahap 3**: Tambahkan penegakan hierarki pembuatan akun (Role Management dilarang membuat SuperAdmin) pada form manajemen user.
4. **Tahap 4**: Sempurnakan halaman Pengaturan ([SuperAdminSettingsPage.svelte](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminSettingsPage.svelte)) dengan selector preferensi map tiles dan parameter toleransi geofence.
5. **Tahap 5**: Verifikasi kompilasi (`svelte-check`), build (`vite build`), dan uji E2E di browser untuk 4 peran utama (**SuperAdmin**, **Management**, **Supervisor**, **Rider**).
