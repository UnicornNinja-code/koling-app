# Diagram Aktivitas Sistem MOVA (Activity & Workflow Diagrams)

Dokumen ini memetakan seluruh alur aktivitas (*activity diagrams*) untuk sistem **MOVA**, menghubungkan interaksi antara pengguna, antarmuka frontend Svelte 5, backend Bun Hono, dan basis data PostgreSQL/PostGIS.

---

## 1. Alur Aktivitas: Autentikasi & Manajemen Sesi (Auth Lifecycle)

Diagram aktivitas ini menggambarkan siklus masuk sistem, eskalasi CAPTCHA saat brute-force terdeteksi, penegakan ganti password pada login perdana (*first login*), hingga aktivasi akun berbasis token undangan.

```mermaid
stateDiagram-v2
    [*] --> Showcase_Landing
    Showcase_Landing --> LoginPage : Klik "Get Started" / "Masuk"
    
    state LoginPage {
        [*] --> InputCredentials
        InputCredentials --> CheckRiskStatus : Submit (identifier, password)
        CheckRiskStatus --> VerifyCaptcha : Jika percobaan gagal >= 3
        CheckRiskStatus --> DirectLogin : Percobaan normal
        VerifyCaptcha --> DirectLogin : Kode CAPTCHA Valid
        VerifyCaptcha --> InputCredentials : CAPTCHA Salah / Refresh SVG
    }

    DirectLogin --> EvaluateFirstLogin : Backend Otorisasi JWT (200 OK)
    
    state EvaluateFirstLogin <<choice>>
    EvaluateFirstLogin --> FirstLoginPage : flag first_login == true
    EvaluateFirstLogin --> RBAC_Router : flag first_login == false

    state FirstLoginPage {
        [*] --> InputNewPassword
        InputNewPassword --> UpdatePasswordAPI : Validasi 8+ Karakter
        UpdatePasswordAPI --> SetupTransition : PATCH /users/me/complete-first-login
    }

    SetupTransition --> RBAC_Router : first_login dinonaktifkan

    state RBAC_Router <<choice>>
    RBAC_Router --> SuperAdminDashboard : Role SUPERADMIN
    RBAC_Router --> ManagementDashboard : Role MANAGEMENT
    RBAC_Router --> SupervisorDashboard : Role SUPERVISOR
    RBAC_Router --> RiderMobileHub : Role RIDER

    state InvitationActivation {
        [*] --> ReceiveInviteEmail : Email / WhatsApp Token
        ReceiveInviteEmail --> RegisterPage : Buka /register?token=XXX
        RegisterPage --> ValidateBirthDate : Isi nama, password, birth_date
        ValidateBirthDate --> ActivateAccountAPI : POST /auth/reset-password
        ActivateAccountAPI --> LoginPage : Akun Siap / Redirect Login
    }
```

---

## 2. Alur Aktivitas: Map Ops & Komando Spasial GIS (Spatial Monitoring)

Diagram aktivitas ini menggambarkan cara kerja halaman **Map Ops** yang terintegrasi dengan WebSocket LBS, PostGIS Geofence, dan deteksi jarak batas jalan protokol ($\pm 50\text{m}$).

```mermaid
sequenceDiagram
    autonumber
    actor User as SuperAdmin / Supervisor / Rider
    participant UI as Map Ops UI (Leaflet Canvas)
    participant Socket as Socket.IO Client
    participant API as Backend Hono API
    participant PostGIS as PostgreSQL / PostGIS DB
    participant Redis as Redis LBS Store

    User->>UI: Buka /map (Map Ops Command Center)
    UI->>API: GET /api/map/zones
    API->>PostGIS: ST_AsGeoJSON(polygon), buffer_radius
    PostGIS-->>API: GeoJSON FeatureCollection
    API-->>UI: Render Poligon Zona Operasional Surabaya

    UI->>API: GET /api/map/weather-overview
    API-->>UI: Render Telemetri Cuaca per Zona

    UI->>Socket: emit("subscribe_zone", { role, user_id })
    Socket-->>UI: Event "subscribed_ok"

    loop Real-Time Telemetry Loop (Setiap 10-30 Detik)
        RiderGPS->>Socket: emit("rider_location_update", { lat, lng, speed, battery })
        Socket->>Redis: GEOADD rider_positions lng lat rider_id
        Socket->>PostGIS: ST_Distance(rider_point, protocol_roads.geom)
        alt Jarak Jalan Protokol <= 50 meter
            PostGIS-->>Socket: Terdeteksi Mendekati Jalan Protokol (Restricted)
            Socket-->>UI: Event "proximity_warning" (Badge Kuning/Merah)
        else Berada dalam Geofence Zona
            PostGIS-->>Socket: Status CHECKED_IN Valid
            Socket-->>UI: Marker Hijau Berdenyut (ONLINE)
        end
        Socket-->>UI: Event "fleet_telemetry_batch"
        UI->>UI: Update Posisi Marker Rider & Gerobak di Peta
    end

    opt Broadcast Komando Operasional
        User->>UI: Klik "Broadcast Alert" -> Pilih Zona/Rider
        UI->>API: POST /api/map/broadcast-alert { message, severity }
        API->>Socket: emit("emergency_broadcast", payload)
        Socket-->>User: Notifikasi Muncul Real-Time di Dynamic Island Rider
    end
```

---

## 3. Alur Aktivitas: Manajemen DSS (BWM & TOPSIS Optimization)

Memisahkan kewenangan Super Admin (konfigurasi master bobot BWM) dengan Supervisor (eksekusi perhitungan TOPSIS dan alokasi rekomendasi zona harian).

```mermaid
stateDiagram-v2
    [*] --> SuperAdmin_BWM_Config : Akses Super Admin (/dss)
    
    state SuperAdmin_BWM_Config {
        [*] --> SelectBestWorstCriteria
        SelectBestWorstCriteria --> InputPairwiseComparisons : Skala Saaty 1-9
        InputPairwiseComparisons --> RunBWM_Solver : POST /api/dss/bwm/calculate
        RunBWM_Solver --> CheckConsistencyRatio : Evaluasi Nilai Ksi (ξ*)
        
        state CheckConsistencyRatio <<choice>>
        CheckConsistencyRatio --> WeightsApproved : CR <= 0.10 (Konsisten)
        CheckConsistencyRatio --> InputPairwiseComparisons : CR > 0.10 (Wajib Kalibrasi Ulang)
        
        WeightsApproved --> SaveMasterWeights : Lock Bobot Kriteria di Database
    }

    SaveMasterWeights --> Supervisor_TOPSIS_Run : Masuk Jam Operasional Pagi

    state Supervisor_TOPSIS_Run {
        [*] --> FetchCriteriaAndWeights : GET /api/dss/config
        FetchCriteriaAndWeights --> RetrieveZoneLiveTelemetry : Matriks Keputusan (Cuaca, POI, Kompetitor, Historis)
        RetrieveZoneLiveTelemetry --> ExecuteTopsisAlgorithm : POST /api/dss/topsis/calculate
        ExecuteTopsisAlgorithm --> CalculateNormalizedMatrix : Normalisasi Vektor R_ij
        CalculateNormalizedMatrix --> CalculateIdealSolutions : Tentukan A+ (Ideal Positif) & A- (Ideal Negatif)
        CalculateIdealSolutions --> CalculateRelativeCloseness : Nilai Preferensi C_i (0.00 - 1.00)
        CalculateRelativeCloseness --> DisplayZoneRanking : Urutkan Zona Berdasarkan Nilai C_i Tertinggi
    }

    DisplayZoneRanking --> ReviewRecommendations : Supervisor Meninjau Ranking
    ReviewRecommendations --> CommitPlotting : Klik "Commit DSS Allocation"
    CommitPlotting --> [*] : Penugasan Terdistribusi ke Antrean Rider
```

---

## 4. Alur Aktivitas: Manajemen Armada & Kunci Sementara 180s (Fleet Claim)

Menjamin integritas fisik gerobak melalui penguncian anti-balap (*concurrency lock*) 180 detik berbasis *absolute timestamp* dan inspeksi 6-poin sebelum penggunaan.

```mermaid
stateDiagram-v2
    [*] --> ViewAvailableHubFleet : Rider Buka Halaman Klaim Armada (/rider/armada)
    ViewAvailableHubFleet --> RequestHoldArmada : Klik "Kunci 3-Min" pada Unit
    
    state HoldArmadaLock {
        [*] --> BackendLockPostgreSQL : POST /api/armada/:id/hold
        BackendLockPostgreSQL --> ScheduleAutoReleaseJob : BullMQ Delayed Job (180s)
        ScheduleAutoReleaseJob --> StartClientAbsoluteTimer : status = 'HOLD', hold_expires_at
        
        state TimerEvaluation <<choice>>
        TimerEvaluation --> FormInspeksiFisik : Timer Aktif (expiresAt - now > 0)
        TimerEvaluation --> ExpiredRelease : Timer Habis (0s)
    }

    ExpiredRelease --> BackendReleaseArmada : BullMQ Worker ubah status -> AVAILABLE
    BackendReleaseArmada --> ViewAvailableHubFleet : Unit Terlepas ke Hub

    state FormInspeksiFisik {
        [*] --> Checklist6Points
        Checklist6Points --> CheckBatteryLevel : 1. Baterai >= 80%
        CheckBatteryLevel --> CheckBrakes : 2. Rem Depan/Belakang Pakem
        CheckBrakes --> CheckTires : 3. Tekanan Angin & Roda
        CheckTires --> CheckCooler : 4. Insulasi Box Es
        CheckCooler --> CheckStove : 5. Kompor / Pemanas
        CheckStove --> CheckCleanliness : 6. Standar Higienitas
        CheckCleanliness --> SubmitClaimAction : Seluruh Poin Tercentang
    }

    SubmitClaimAction --> ClaimConfirmedAPI : POST /api/armada/:id/claim
    ClaimConfirmedAPI --> CancelAutoReleaseJob : Batalkan Delayed Job BullMQ
    CancelAutoReleaseJob --> ArmadaInUse : Status Menjadi 'IN_USE'
    ArmadaInUse --> [*] : Lanjut ke Validasi Geofence GPS (/rider/checkin)
```

---

## 5. Alur Aktivitas: Siklus Harian Rider Lapangan (Rider Mobile PWA)

Langkah terstruktur 1 sampai 5 yang dikemas dalam *Full-Screen Step Pages* untuk kenyamanan di lapangan tanpa modal pop-up yang mudah tertutup.

```mermaid
stateDiagram-v2
    [*] --> Langkah1_Presensi : Buka /rider/duty (Apel Pagi)
    
    state Langkah1_Presensi {
        [*] --> TekanPresensiHadir : Klik "Konfirmasi Hadir Siap Bertugas"
        TekanPresensiHadir --> MasukAntreanFIFO : Status 'QUEUED'
        MasukAntreanFIFO --> MenungguKomandoSupervisor : Supervisor Commit DSS TOPSIS
        MenungguKomandoSupervisor --> NotifikasiPlottingZona : Status 'ASSIGNED' (Zona Ditugaskan)
    }

    Langkah1_Presensi --> Langkah2_KlaimArmada : Buka /rider/armada
    
    state Langkah2_KlaimArmada {
        [*] --> PilihGerobakHub : Kunci Unit 180s
        PilihGerobakHub --> InspeksiFisik6Poin : Baterai, Rem, Higienitas
        InspeksiFisik6Poin --> KlaimResmiInUse : Status 'IN_USE'
    }

    Langkah2_KlaimArmada --> Langkah3_GeofenceCheckIn : Perjalanan ke Zona Penugasan (/rider/checkin)

    state Langkah3_GeofenceCheckIn {
        [*] --> BacaKoordinatGPS : navigator.geolocation (High Accuracy)
        BacaKoordinatGPS --> EvaluasiPoligonPostGIS : ST_DWithin(gps_point, zone_geom, 50m)
        
        state GeofenceCheck <<choice>>
        GeofenceCheck --> DiDalamZona : Jarak <= Buffer 50m
        GeofenceCheck --> DiLuarZona : Jarak > 50m

        DiLuarZona --> TampilkanDistanceGauge : "Kurang ±X meter lagi ke batas zona"
        TampilkanDistanceGauge --> BacaKoordinatGPS : Bergerak Mendekat

        DiDalamZona --> CheckInApproved : Status 'CHECKED_IN' (Tercatat di Sistem)
    }

    Langkah3_GeofenceCheckIn --> Langkah4_KasirPOS : Gerobak Mulai Buka (/rider/pos)

    state Langkah4_KasirPOS {
        [*] --> PilihMenuKopi : Tambah Item ke Keranjang
        PilihMenuKopi --> GenerateIdempotencyKey : UUIDv4 Idempotency Key
        GenerateIdempotencyKey --> PilihMetodeBayar

        state BayarChoice <<choice>>
        BayarChoice --> BayarTunai : Metode CASH
        BayarChoice --> BayarQRIS : Metode QRIS

        BayarTunai --> HitungUangKembalian : Input Uang Fisik Diterima
        BayarQRIS --> TampilkanDynamicQRIS : Countdown 180 Detik

        HitungUangKembalian --> SimpanTransaksiAPI : POST /api/rider/sales
        TampilkanDynamicQRIS --> SimpanTransaksiAPI : Pembayaran Terkonfirmasi
        SimpanTransaksiAPI --> UpdateKasHarian : Akumulasi Pendapatan Shift
    }

    Langkah4_KasirPOS --> Langkah5_SettlementSore : Jam Shift Berakhir (/rider/settlement)

    state Langkah5_SettlementSore {
        [*] --> InputSisaBaterai : Penggeser Slider Baterai (%)
        InputSisaBaterai --> EvaluasiAmbangBaterai
        
        state BateraiThreshold <<choice>>
        BateraiThreshold --> StatusCharging : Baterai < 30% (Wajib Cas di Hub)
        BateraiThreshold --> StatusActive : Baterai >= 30% (Unit Siap Shift Berikutnya)

        StatusCharging --> RekonsiliasiKas : Hitung Sisa Cup Fisik
        StatusActive --> RekonsiliasiKas : Hitung Sisa Cup Fisik

        RekonsiliasiKas --> EvaluasiSelisihKas
        state SelisihKas <<choice>>
        SelisihKas --> KasPas : Selisih == Rp 0
        SelisihKas --> AdaSelisih : Selisih != Rp 0 (Wajib Isi Alasan)

        AdaSelisih --> KirimSettlementAPI : POST /api/rider/session/checkout
        KasPas --> KirimSettlementAPI : POST /api/rider/session/checkout

        KirimSettlementAPI --> SelesaiShift : LBS Radar Dibersihkan & Logout
    }

    Langkah5_SettlementSore --> [*] : Shift Selesai
```

---

## 6. Alur Aktivitas: Manajemen User Hierarkis (SuperAdmin vs Management)

Mematuhi batasan bahwa **Management berhak membuat akun secara berjenjang, namun dilarang keras membuat akun Super Admin**.

```mermaid
stateDiagram-v2
    [*] --> IdentifikasiPeranPembuat
    
    state IdentifikasiPeranPembuat <<choice>>
    IdentifikasiPeranPembuat --> SuperAdminUserSuite : Role SUPERADMIN
    IdentifikasiPeranPembuat --> ManagementUserSuite : Role MANAGEMENT
    IdentifikasiPeranPembuat --> AksesDitolak : Role Supervisor / Rider

    state SuperAdminUserSuite {
        [*] --> OpsiSemuaRole
        OpsiSemuaRole --> BuatSuperAdmin : Dapat membuat SUPERADMIN
        OpsiSemuaRole --> BuatManagement : Dapat membuat MANAGEMENT
        OpsiSemuaRole --> BuatSupervisor : Dapat membuat SUPERVISOR
        OpsiSemuaRole --> BuatRider : Dapat membuat RIDER
        OpsiSemuaRole --> NonaktifkanAkun : Banned / Deactivate / Reset Sandi
    }

    state ManagementUserSuite {
        [*] --> OpsiTerbatas
        OpsiTerbatas --> BikinManagement : Buat Akun Rekan Management
        OpsiTerbatas --> BikinSupervisor : Buat Akun Supervisor Hub
        OpsiTerbatas --> BikinRider : Buat Akun Rider Lapangan
        OpsiTerbatas --> BlokirSuperAdmin : Blokir Pembuatan Role SUPERADMIN (403 Forbidden)
    }

    SuperAdminUserSuite --> KirimTokenUndangan : Generate Secure Activation Token
    ManagementUserSuite --> KirimTokenUndangan : Generate Secure Activation Token
    KirimTokenUndangan --> [*] : Email / WA Aktivasi Terkirim
```
