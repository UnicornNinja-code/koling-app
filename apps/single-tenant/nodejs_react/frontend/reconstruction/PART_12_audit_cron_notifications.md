# FRONTEND PART 12 — AUDIT LOG STREAM, DYNAMIC CRON ENGINE & REALTIME ALERTS

## 1. Objective
Menyediakan visibilitas terhadap rekaman jejak audit sistem (*Audit Trail*), pemantauan jadwal cron engine background (*Weather Fetcher*, *POI Re-clusterer*, *Midnight Reset*), serta sistem alert real-time melalui WebSocket dan polling fallback.

---

## 2. Target React Components & Pages
- `src/pages/settings/SettingsPage.jsx`
- `src/components/audit/AuditTrailTable.jsx`
- `src/components/cron/CronSchedulerCard.jsx`
- `src/components/notifications/NotificationDrawer.jsx`
- `src/services/auditService.js` & `src/services/socketService.js`

---

## 3. API Contract Binding
- `GET /api/audit-logs` $\rightarrow$ Query `action?`, `actor_role?`, `page?` $\rightarrow$ Paginated Audit Logs
- `GET /api/system/cron-jobs` $\rightarrow$ `{ jobs: Array<{ name, schedule, last_run, next_run, status }> }`
- `POST /api/system/cron-jobs/:name/run-now` $\rightarrow$ Manual Force Execution $\rightarrow$ `{ success: true }`
- `GET /api/notifications` $\rightarrow$ `{ notifications: NotificationItem[], unread_count: number }`
- `PATCH /api/notifications/:id/read` $\rightarrow$ `{ success: true }`

---

## 4. UI/UX Interaction & Confirmation Standards
1. **Live Activity Stream:**
   - Menampilkan detail mutasi (Aktor, Aksi, Waktu, IP Address, Metadata Diff JSON) dengan tombol *Inspect Changes*.
2. **Force Run Cron Job Confirmation:**
   - Menjalankan cron job secara manual (misal: *Force POI Reclustering*) wajib melalui modal konfirmasi *Warning* karena mengonsumsi resource server.
3. **Real-time Alert Badge:**
   - Bell icon pada topbar berdenyut (*pulse*) saat ada notifikasi darurat (misal: unit baterai $< 15\%$ atau rider keluar geofence).

---

## 5. Verification Criteria
- [x] Audit log merekam seluruh aksi CRUD penting tanpa terkecuali.
- [x] Status cron job menampilkan waktu eksekusi terakhir dan jadwal berikutnya.
