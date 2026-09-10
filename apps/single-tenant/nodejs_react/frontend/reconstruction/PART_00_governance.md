# FRONTEND PART 00 — GOVERNANCE, ARCHITECTURE BASELINE & CONFIRMATION MODAL STANDARD

## 1. Objective
Menetapkan standar tata kelola (*governance*) arsitektur frontend Single-Tenant (React 18 + Vite + TailwindCSS + Axios), penanganan *Global Response Envelope*, protokol penanganan error (RFC 7807 / JSend), **Centralized Confirmation Modal System** untuk setiap aksi mutasi, dan sistem notifikasi global yang *UX-friendly*.

---

## 2. Target React Components & Infrastructure
- `src/services/api.js` (Axios Client & Interceptor)
- `src/context/AuthContext.jsx` (Centralized Session & Role Guard)
- `src/context/ConfirmContext.jsx` / `src/components/ui/ConfirmModal.jsx` (Global Verification & Confirmation Modal)
- `src/components/ui/Toast.jsx` & `src/context/ToastContext.jsx` (Feedback Alert Engine)
- `src/components/layout/AppLayout.jsx` & `src/components/layout/Sidebar.jsx` (Role-tailored Navigation)

---

## 3. API Contract Binding & Global Response Envelope
Seluruh pertukaran data frontend-backend mengadopsi standar envelope:
- **Success Single Envelope:**
  ```json
  {
    "success": true,
    "message": "Operasi berhasil",
    "data": { ... },
    "meta": { "timestamp": "2026-09-10T...", "request_id": "req-..." }
  }
  ```
- **Success Paginated Envelope:**
  ```json
  {
    "success": true,
    "message": "Daftar data berhasil diambil",
    "data": [ ... ],
    "pagination": { "page": 1, "limit": 10, "total_records": 100, "total_pages": 10, "has_next": true, "has_prev": false },
    "meta": { "timestamp": "2026-09-10T...", "request_id": "req-..." }
  }
  ```
- **Standard Error Contract (RFC 7807):**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Validasi gagal",
      "details": [{ "field": "email", "issue": "Format email tidak valid" }]
    }
  }
  ```

---

## 4. Centralized Confirmation Modal Protocol (UX-Friendly)
Untuk menjaga keamanan data operasional, **setiap tindakan mutasi** (tambah, edit penting, hapus, aktivasi/deaktivasi, kalibrasi DSS, plotting, checkout armada) **WAJIB memicu Confirmation Modal** dengan spesifikasi:
1. **Konfirmasi Deskriptif:** Tidak hanya menampilkan teks generic "Apakah Anda yakin?", melainkan merinci:
   - Nama entitas yang akan dimodifikasi (misal: `"Rider Fajar (ID: R-012)"` atau `"Zona Sidoarjo Kota"`).
   - Dampak operasional (misal: *"Menonaktifkan user akan membatalkan seluruh sesi aktif rider."*).
2. **Kategori Intent & Aksen Visual:**
   - 🔴 **DANGER (Destructive):** Tombol merah menyala dengan icon peringatan (Delete, Deactivate, Reset).
   - 🟡 **WARNING (High Impact):** Tombol amber (Override DSS, Re-clustering POI, Force Check-out).
   - 🔵 **INFO / PRIMARY (Creation & Modification):** Tombol oranye/biru (Simpan Perubahan, Plotting Rider, Trigger Sync).
3. **Promise-based Execution Hook (`useConfirm`):**
   ```javascript
   const { confirm } = useConfirm();
   const handleDelete = async (user) => {
     const confirmed = await confirm({
       title: "Nonaktifkan Pengguna?",
       message: `Anda akan menonaktifkan akun ${user.name} (${user.role}). Pengguna tidak akan dapat masuk ke aplikasi.`,
       confirmText: "Ya, Nonaktifkan",
       cancelText: "Batal",
       type: "danger"
     });
     if (confirmed) {
       await userService.deactivate(user.id);
       showToast("Pengguna berhasil dinonaktifkan", "success");
     }
   };
   ```

---

## 5. Role-Based Navigation & Menu Access Guard
Sistem Single-Tenant menerapkan pembagian hak akses menu yang tegas:
- **SUPERADMIN:**
  - Full Command Center: Dashboard $\rightarrow$ Setup Wizard $\rightarrow$ User Management (Semua Role) $\rightarrow$ Armada $\rightarrow$ Katalog $\rightarrow$ Zonasi Spasial $\rightarrow$ Spatial Quality Gate $\rightarrow$ DSS BWM Engine $\rightarrow$ Seluruh Laporan (6-Tab) $\rightarrow$ Audit Log & System Settings.
- **MANAGEMENT:**
  - Business Portal: Dashboard Bisnis $\rightarrow$ User Management (Supervisor & Rider) $\rightarrow$ Armada $\rightarrow$ Katalog Produk $\rightarrow$ Monitoring Peta Bisnis $\rightarrow$ Laporan Eksekutif & Finansial.
- **SUPERVISOR:**
  - Operational Command: Dashboard Operasional $\rightarrow$ Monitoring Peta Live & Cuaca $\rightarrow$ Plotting & Distribusi Rider $\rightarrow$ DSS TOPSIS Recommendation & Override $\rightarrow$ Laporan Operasional Lapangan.
- **RIDER:**
  - Mobile Field View: Beranda Tugas $\rightarrow$ Presensi (Check-in/Out) $\rightarrow$ Peta Penugasan & Rekomendasi Titik Jual Terbaik $\rightarrow$ POS Penjualan Kopi $\rightarrow$ Riwayat Penjualan.

---

## 6. Verification & Acceptance Criteria
- [x] Axios Interceptor otomatis menangani unwrapping data dan auto-refresh token (mutex queue).
- [x] Setiap aksi hapus / mutasi di seluruh halaman menggunakan `ConfirmModal` terstandarisasi.
- [x] Role hierarchy guard mencegah eskalasi wewenang secara visual maupun pada network request.
- [x] Toast notification otomatis menampilkan pesan sukses / error RFC 7807 yang mudah dipahami manusia.
