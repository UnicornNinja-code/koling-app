# FRONTEND PART 08 — RIDER OPERATIONAL EXECUTION, ATTENDANCE & LOCATION-BASED SERVICES (LBS)

## 1. Objective
Menyediakan antarmuka mobile-first bagi Rider lapangan untuk presensi harian (*Check-in / Check-out*), klaim unit armada, pemantauan koordinat GPS real-time (LBS), navigasi ke zona penugasan, dan penguncian titik penjualan terbaik (*Best Selling Spot Lock*).

---

## 2. Target React Components & Pages
- `src/pages/rider/RiderOperationalPage.jsx`
- `src/components/rider/RiderAttendanceCard.jsx`
- `src/components/rider/RiderMapNavigation.jsx`
- `src/components/rider/SpotLockDrawer.jsx`
- `src/components/rider/CheckoutSummaryModal.jsx`
- `src/services/riderService.js`

---

## 3. API Contract Binding
- `POST /api/rider/check-in` $\rightarrow$ `{ latitude, longitude, armada_id? }` $\rightarrow$ `{ success: true, check_in_time, queue_position }`
- `GET /api/rider/my-assignment` $\rightarrow$ `{ assignment: { id, zone_name, polygon, target_revenue, candidate_spots: [] } }`
- `POST /api/rider/ping-location` $\rightarrow$ `{ latitude, longitude, speed_kmh?, battery_level? }` $\rightarrow$ `{ success: true, inside_zone: boolean }`
- `POST /api/rider/lock-spot` $\rightarrow$ `{ spot_id, latitude, longitude }` $\rightarrow$ `{ success: true, spot_name }`
- `POST /api/rider/check-out` $\rightarrow$ `{ final_odometer, cash_collected, return_notes? }` $\rightarrow$ `{ success: true, shift_summary }`

---

## 4. UI/UX Interaction & Confirmation Standards
1. **Mobile-First Responsive Layout:**
   - Dioptimalkan untuk layar ponsel dengan tombol sentuh besar (*touch-friendly*).
2. **Attendance Check-in Confirmation:**
   - Menampilkan konfirmasi posisi GPS awal dan pemilihan unit motor keliling.
3. **Spot Lock & Geofence Notification:**
   - Menampilkan notifikasi visual hijau jika rider berada dalam batas zona aman.
   - Peringatan instan jika rider mendekati atau memasuki jalur terlarang (Jalan Tol atau Jalan Protokol tanpa izin).
4. **End-of-Day Check-out Summary Modal:**
   - Menampilkan ringkasan jam kerja, total cup terjual, omzet terkumpul, dan modal konfirmasi penyerahan setoran kas.

---

## 5. Verification Criteria
- [x] GPS Watcher mengirimkan koordinat berkala ke server.
- [x] Check-in mencatat timestamp ke tabel `zone_assignments` (`check_in_time`).
- [x] Check-out mengunci sesi hari ini dan mencatat `check_out_time`.
