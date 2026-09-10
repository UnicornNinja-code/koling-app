# FRONTEND PART 13 — END-TO-END ACCEPTANCE CRITERIA & PRODUCTION BUILD VERIFICATION

## 1. Objective
Menetapkan kriteria penerimaan akhir (*Final Acceptance Criteria*), verifikasi bebas error pada *Production Build* (`npm run build` / `bun run build`), validasi *Confirmation Modal* di seluruh modul, dan matriks pengujian lintas peran (*Super Admin, Management, Supervisor, Rider*).

---

## 2. Comprehensive Quality Checklist

### A. Confirmation Modal & UX Friendly Standards
- [ ] **Auth & Onboarding**: Force change password & aktivasi akun ber-token terkonfirmasi jelas.
- [ ] **User Management**: Deaktivasi, perubahan role, dan kirim ulang invite wajib konfirmasi modal.
- [ ] **Armada & Servis**: Pengalihan status ke *MAINTENANCE* dan pelepasan armada terkonfirmasi.
- [ ] **Zonasi & Geometri**: Validasi overlap dan jalan tol memblokir save jika invalid.
- [ ] **Spatial Data & POI**: Trigger Overpass Sync & pemetaan anomali terkonfirmasi.
- [ ] **DSS Engine**: Kalibrasi bobot BWM & simulasi TOPSIS menampilkan perbandingan sebelum diaktifkan.
- [ ] **Distribusi & Plotting**: Batch auto-assign dan Supervisor Override mewajibkan modal alasan.
- [ ] **Kasir & Sales**: Konfirmasi pembayaran kas/QRIS dan cetak struk.
- [ ] **Laporan & Ekspor**: Konfirmasi rentang tanggal saat mengunduh CSV atau mencetak PDF.

### B. Production Build & Lint Resilience
- [ ] `npm run build` menghasilkan bundle asset tanpa error / missing icon exports.
- [ ] `npm run test:onboarding` lulus 10/10 skenario.
- [ ] `npm run test:reports` lulus 19/19 skenario.
- [ ] Tidak ada layout shift (CLS), broken responsive breakpoints, atau missing translation keys.

---

## 3. Role-Based Verification Matrix

| Modul | Super Admin | Management | Supervisor | Rider |
|:---|:---:|:---:|:---:|:---:|
| **Dashboard Executive** | ✅ Full + Day-0 | ✅ Business KPI | ✅ Live Ops | ❌ |
| **User Management** | ✅ All Roles | ✅ Spv & Rider | ❌ | ❌ |
| **Armada & Unit** | ✅ Full | ✅ Full | 👁️ View/Claim | 👁️ Claim Unit |
| **Zonasi Spasial** | ✅ Full | 👁️ View Map | ✅ Edit & Status | 👁️ Assigned Zone |
| **Spatial QA & POI** | ✅ Full | 👁️ View Stats | ❌ | ❌ |
| **DSS Engine (BWM)** | ✅ Full | ❌ | ❌ | ❌ |
| **Plotting & Override** | ✅ Full | 👁️ View | ✅ Full | ❌ |
| **Rider Operations (LBS)**| ❌ | ❌ | 👁️ Monitor | ✅ Full Execution |
| **POS & Kasir Kopi** | ❌ | ❌ | ❌ | ✅ Full POS |
| **Pusat Laporan 6-Tab** | ✅ 6 Tab | ✅ 4 Tab Bisnis | ✅ 3 Tab Lapangan | 👁️ Personal Sales |
| **Audit Log & Settings** | ✅ Full | ❌ | ❌ | ❌ |

---

## 4. Final Sign-off
Setelah seluruh poin checklist terpenuhi, aplikasi Single-Tenant MOVA dinyatakan **Production-Ready & Academically Robust**.
