/*
 * swagger.ts
 * Comprehensive OpenAPI 3.0.3 Specification for MantaKopi COZIS DSS Backend
 * Runtime: Bun 1.4 + TypeScript + Express 5
 *
 * Dokumentasi lengkap seluruh REST API endpoint di 24 route files.
 */

export const swaggerSpec: any = {
  openapi: "3.0.3",
  info: {
    title: "MantaKopi COZIS DSS API Documentation",
    version: "3.0.0",
    description: `
### Decision Support System & Smart Fleet Operations Platform (MantaKopi COZIS)

Dokumentasi lengkap REST API platform MantaKopi Coffee On-The-Go Spatial Decision Support System (COZIS). 
Sistem ini mengintegrasikan:
- **Spatial GIS & Geofencing**: PostGIS SRID 4326 dengan 885 ruas jalan protokol & restriksi jalan tol Sidoarjo.
- **DSS Multi-Kriteria**: Bobot Best-Worst Method (BWM) & Pemeringkatan TOPSIS untuk penempatan armada kopi keliling.
- **Manajemen Armada & Operasional**: Siklus klaim 5-menit (Redis lock), antrean tugas FIFO, dan checkout harian.
- **Monitoring LBS & Cuaca**: Pelacakan GPS real-time rider dan integrasi prakiraan cuaca Open-Meteo.
- **RBAC Multilevel**: SUPERADMIN, MANAGEMENT, SUPERVISOR, dan RIDER.

#### Format Autentikasi
Gunakan format Bearer Token pada HTTP Header:
\`\`\`http
Authorization: Bearer <jwt_access_token>
\`\`\`
    `,
    contact: {
      name: "Engineering Team MantaKopi",
      email: "dev@kopikeliling.com",
    },
  },
  servers: [
    {
      url: "http://localhost:9000",
      description: "Development Server (Local Bun)",
    },
    {
      url: "https://api.kopikeliling.com",
      description: "Production Server",
    },
  ],
  tags: [
    { name: "System & Health", description: "Pemeriksaan kesehatan sistem, konfigurasi fondasi & wizard setup awal" },
    { name: "System Settings", description: "Aturan operasional, pembatasan spasial jalan protokol & tol" },
    { name: "Auth & Identity", description: "Otentikasi, registrasi staf, CAPTCHA, OAuth Google, verifikasi token & logout" },
    { name: "Users", description: "Manajemen data user, peran (RBAC), preferensi & status aktif" },
    { name: "Products", description: "Katalog menu minuman, upload gambar WebP & manajemen harga/status" },
    { name: "Armadas & Fleets", description: "Katalog unit armada sepeda listrik, siklus klaim, kendala & riwayat" },
    { name: "Spatial & Roads", description: "Layer PostGIS jalan protokol & jalan tol pembatas operasional, sinkronisasi OSM" },
    { name: "Zones", description: "Poligon zona operasional, kapasitas rider, validasi spasial & konfigurasi" },
    { name: "POIs", description: "Point of Interest, klasterisasi, sinkronisasi OSM, approval workflow & skor DSS per zona" },
    { name: "POI Categories", description: "Kategori waktu aktif POI (Pagi/Siang/Sore/Malam), toggle & skor C3" },
    { name: "Weather", description: "Integrasi cuaca realtime per zona & Central Hub, sinkronisasi Open-Meteo" },
    { name: "Competitors", description: "Data survei lapangan kompetitor per zona operasional, skor C6" },
    { name: "DSS Engine", description: "Komputasi pembobotan BWM, preview impact, konfigurasi & rekomendasi lokasi TOPSIS" },
    { name: "Candidate Selling Locations", description: "Titik mikro kandidat lokasi jualan, evaluasi TOPSIS & audit snapshot" },
    { name: "Distribution", description: "Sesi operasional harian, antrean distribusi rider (FIFO), emergency swap & riwayat" },
    { name: "Rider Operations", description: "Operasional harian rider (klaim armada, check-in GPS, penjualan, checkout)" },
    { name: "Dashboard & Analytics", description: "Analisis penjualan, performa zona, tren pendapatan & performa produk" },
    { name: "Sales", description: "Agregasi analitik penjualan & riwayat transaksi personal rider" },
    { name: "LBS & Geofence", description: "Pelacakan GPS rider via Redis Geo, proximity search, jarak & posisi individu" },
    { name: "Notifications", description: "Notifikasi in-app, tandai dibaca & hapus" },
    { name: "Audit Logs", description: "Audit trail log aktivitas & keamanan sistem" },
    { name: "Cron Automation", description: "Manajemen, log & pemicu background job terjadwal" },
    { name: "Data Synchronization", description: "Sinkronisasi dataset spasial (POI, jalan tol, jalan protokol), polling job & rollback versi" },
    { name: "Reports", description: "Laporan operasional rider, efektivitas zona, armada, akurasi DSS & ringkasan eksekutif" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan JWT Token dari endpoint /api/auth/login",
      },
    },
    schemas: {
      // ---------- Canonical Response Envelopes ----------
      ApiResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          statusCode: { type: "integer", example: 200 },
          msg: { type: "string", example: "Operasi berhasil dieksekusi" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          status: { type: "string", example: "error" },
          statusCode: { type: "integer", example: 400 },
          msg: { type: "string", example: "Deskripsi pesan kesalahan" },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "BAD_REQUEST" },
              message: { type: "string", example: "Deskripsi pesan kesalahan" },
            },
          },
          meta: {
            type: "object",
            properties: {
              timestamp: { type: "string", format: "date-time" },
              request_id: { type: "string", example: "req-1234567890" },
            },
          },
        },
      },

      // ---------- Domain Models ----------
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "11111111-1111-1111-1111-111111111111" },
          name: { type: "string", example: "Super Admin" },
          email: { type: "string", format: "email", example: "superadmin@kopikeliling.com" },
          username: { type: "string", example: "superadmin" },
          role: { type: "string", enum: ["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"], example: "SUPERADMIN" },
          phone: { type: "string", example: "081234567890" },
          birth_date: { type: "string", format: "date", example: "1990-01-01" },
          is_active: { type: "boolean", example: true },
          must_change_password: { type: "boolean", example: false },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          code: { type: "string", example: "PRD-001" },
          name: { type: "string", example: "Kopi Susu Gula Aren" },
          category: { type: "string", example: "COFFEE" },
          price: { type: "number", example: 15000 },
          image_url: { type: "string", example: "/uploads/products/kopi_aren.webp" },
          description: { type: "string", example: "Espresso robusta dengan sirup aren organik" },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "ACTIVE" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Armada: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          code: { type: "string", example: "ARM-GB-001" },
          name: { type: "string", example: "Gerobak Sepeda Listrik Alpha" },
          type: { type: "string", example: "ELECTRIC_BIKE" },
          status: { type: "string", enum: ["AVAILABLE", "HOLD", "IN_USE", "MAINTENANCE"], example: "AVAILABLE" },
          battery_level: { type: "integer", example: 95 },
          notes: { type: "string", example: "Kondisi rem dan ban prima" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      ArmadaIssue: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          armada_id: { type: "string", format: "uuid" },
          reporter_id: { type: "string", format: "uuid" },
          category: { type: "string", example: "TIRE_PUNCTURE" },
          description: { type: "string", example: "Ban belakang bocor halus" },
          status: { type: "string", enum: ["OPEN", "RESOLVED"], example: "OPEN" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Zone: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Zona Sidoarjo 1 - Alun-Alun" },
          code: { type: "string", example: "ZON-SDA-01" },
          capacity: { type: "integer", example: 4 },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "ACTIVE" },
          polygon: {
            type: "object",
            description: "GeoJSON Polygon Geometri SRID 4326",
          },
          created_at: { type: "string", format: "date-time" },
        },
      },
      POI: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Masjid Agung Sidoarjo" },
          category: { type: "string", example: "place_of_worship" },
          latitude: { type: "number", example: -7.4478 },
          longitude: { type: "number", example: 112.7183 },
          zone_id: { type: "string", format: "uuid" },
          source: { type: "string", enum: ["OSM", "MANUAL"], example: "OSM" },
          status: { type: "string", enum: ["APPROVED", "PENDING", "REJECTED"], example: "APPROVED" },
        },
      },
      POICategory: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          osm_key: { type: "string", example: "place_of_worship" },
          label: { type: "string", example: "Tempat Ibadah" },
          is_active: { type: "boolean", example: true },
          time_scores: {
            type: "object",
            properties: {
              PAGI: { type: "number", example: 0.8 },
              SIANG: { type: "number", example: 0.6 },
              SORE: { type: "number", example: 0.9 },
              MALAM: { type: "number", example: 0.3 },
            },
          },
        },
      },
      Competitor: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Kopi Kenangan" },
          latitude: { type: "number", example: -7.4501 },
          longitude: { type: "number", example: 112.7201 },
          zone_id: { type: "string", format: "uuid" },
          notes: { type: "string", example: "Gerai tetap di depan minimarket" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      DSSConfig: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Konfigurasi Standar Sidoarjo (BWM-TOPSIS)" },
          consistency_ratio: { type: "number", example: 0.0211 },
          is_active: { type: "boolean", example: true },
          weights: {
            type: "object",
            description: "Bobot per-kriteria hasil optimasi BWM",
          },
          created_at: { type: "string", format: "date-time" },
        },
      },
      DSSRecommendation: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Zona Sidoarjo 3 - Pahlawan" },
          rank: { type: "integer", example: 1 },
          preference_score: { type: "number", example: 0.7842 },
          d_pos: { type: "number", example: 0.0521 },
          d_neg: { type: "number", example: 0.1894 },
        },
      },
      DSSSnapshot: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          time_slot: { type: "string", enum: ["PAGI", "SIANG", "SORE", "MALAM"] },
          total_zones: { type: "integer", example: 4 },
          rankings: { type: "array", items: { $ref: "#/components/schemas/DSSRecommendation" } },
          created_at: { type: "string", format: "date-time" },
        },
      },
      CSLCandidate: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Titik Depan Masjid Agung" },
          latitude: { type: "number", example: -7.4478 },
          longitude: { type: "number", example: 112.7183 },
          zone_id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Penugasan Baru" },
          message: { type: "string", example: "Anda ditugaskan ke Zona Alun-Alun." },
          is_read: { type: "boolean", example: false },
          created_at: { type: "string", format: "date-time" },
        },
      },
      CronConfig: {
        type: "object",
        properties: {
          key: { type: "string", example: "weather-sync" },
          name: { type: "string", example: "Sinkronisasi Cuaca" },
          schedule: { type: "string", example: "0 */6 * * *" },
          is_active: { type: "boolean", example: true },
          last_run: { type: "string", format: "date-time" },
        },
      },
      DataSyncJob: {
        type: "object",
        properties: {
          job_id: { type: "string", example: "overpass-poi-12345" },
          dataset_type: { type: "string", enum: ["POI", "TOLL_ROADS", "PROTOCOL_ROADS"] },
          state: { type: "string", enum: ["waiting", "active", "completed", "failed"] },
          progress: { type: "number", example: 75 },
          created_at: { type: "string", format: "date-time" },
        },
      },
      DatasetVersion: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          dataset_type: { type: "string" },
          version: { type: "integer", example: 3 },
          status: { type: "string", enum: ["ACTIVE", "RETIRED", "STAGING", "FAILED"] },
          total_records: { type: "integer", example: 1250 },
          created_at: { type: "string", format: "date-time" },
        },
      },
      DistributionRun: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          type: { type: "string", enum: ["AUTO", "MANUAL"] },
          total_assigned: { type: "integer", example: 8 },
          created_by: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      RiderSession: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          rider_id: { type: "string", format: "uuid" },
          zone_id: { type: "string", format: "uuid" },
          armada_id: { type: "string", format: "uuid" },
          status: { type: "string", enum: ["QUEUED", "ASSIGNED", "CHECKED_IN", "SELLING", "COMPLETED"] },
          check_in_at: { type: "string", format: "date-time" },
          checkout_at: { type: "string", format: "date-time" },
        },
      },
      SystemSettings: {
        type: "object",
        properties: {
          hub_name: { type: "string", example: "Central Hub Sidoarjo" },
          hub_address: { type: "string", example: "Jl. Pahlawan No. 1, Sidoarjo" },
          hub_latitude: { type: "number", example: -7.4478 },
          hub_longitude: { type: "number", example: 112.7183 },
          operational_radius_km: { type: "number", example: 12 },
          protocol_road_prohibited: { type: "boolean", example: true },
          toll_road_prohibited: { type: "boolean", example: true },
        },
      },
      CaptchaChallenge: {
        type: "object",
        properties: {
          captcha_id: { type: "string", example: "cap_abc123" },
          question: { type: "string", example: "Berapa hasil 3 + 5?" },
          image_base64: { type: "string", description: "Base64 encoded captcha image (opsional)" },
        },
      },
    },
  },
  paths: {
    // =========================================================================
    // 1. SYSTEM & HEALTH
    // =========================================================================
    "/api/health": {
      get: {
        tags: ["System & Health"],
        summary: "Pemeriksaan kesehatan sistem backend",
        description: "Mengembalikan status runtime Bun, TypeScript, dan timestamp aktif.",
        responses: {
          200: {
            description: "Server beroperasi normal",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "Koling DSS Backend" },
                    runtime: { type: "string", example: "Bun + TypeScript" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/system/readiness": {
      get: {
        tags: ["System & Health"],
        summary: "Evaluasi kesiapan operasional sistem (Readiness Checklist)",
        description: "Mengevaluasi checklist mandatory: Central Hub, radius operasional, zona aktif, pembobotan DSS, dan armada.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Laporan kesiapan operasional dengan detail setiap checklist item" },
          401: { description: "Unauthorized — Token tidak valid atau tidak disertakan" },
        },
      },
    },
    "/api/system/settings": {
      get: {
        tags: ["System & Health"],
        summary: "Ambil pengaturan Central Hub & radius wilayah",
        description: "Mengembalikan konfigurasi sistem termasuk koordinat hub, radius operasional, dan aturan spasial.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Konfigurasi sistem",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/SystemSettings" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["System & Health"],
        summary: "Perbarui koordinat Central Hub & aturan spasial",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Memperbarui lokasi hub, radius operasional, dan aturan pembatasan jalan.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SystemSettings" },
            },
          },
        },
        responses: {
          200: { description: "Pengaturan berhasil diperbarui" },
          403: { description: "Forbidden — Peran tidak memiliki akses" },
        },
      },
    },
    "/api/system/setup-status": {
      get: {
        tags: ["System & Health"],
        summary: "Cek status wizard setup awal sistem (First-Run Gate)",
        description: "Mengembalikan status penyelesaian langkah-langkah setup awal. Digunakan frontend untuk menentukan apakah pengguna perlu diarahkan ke halaman setup wizard.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Status penyelesaian setup wizard",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    is_setup_complete: { type: "boolean", example: false },
                    completed_steps: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/system/setup-step": {
      post: {
        tags: ["System & Health"],
        summary: "Simpan progres satu langkah wizard setup",
        description: "RBAC: SUPERADMIN. Menyimpan data yang diinput pada langkah tertentu di setup wizard awal.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["step_key", "data"],
                properties: {
                  step_key: { type: "string", example: "hub_location" },
                  data: { type: "object", description: "Data spesifik per langkah setup" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Langkah setup berhasil disimpan" },
          403: { description: "Forbidden — Hanya SUPERADMIN" },
        },
      },
    },
    "/api/system/apply-setup": {
      post: {
        tags: ["System & Health"],
        summary: "Finalisasi & terapkan konfigurasi wizard setup",
        description: "RBAC: SUPERADMIN. Mengaktivasi seluruh konfigurasi setup wizard menjadi konfigurasi live sistem.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Setup wizard berhasil diterapkan, sistem siap operasional" },
          400: { description: "Masih ada langkah setup yang belum diselesaikan" },
          403: { description: "Forbidden — Hanya SUPERADMIN" },
        },
      },
    },

    // =========================================================================
    // 1b. SYSTEM SETTINGS (Operational Rules)
    // =========================================================================
    "/api/system-settings/operational-rules": {
      get: {
        tags: ["System Settings"],
        summary: "Ambil aturan operasional aktif (pembatasan jalan, radius, dll)",
        description: "Mengembalikan konfigurasi aturan operasional termasuk pembatasan jalan protokol dan jalan tol.",
        responses: {
          200: {
            description: "Aturan operasional aktif",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        protocol_road_prohibited: { type: "boolean", example: true },
                        toll_road_prohibited: { type: "boolean", example: true },
                        operational_radius_km: { type: "number", example: 12 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["System Settings"],
        summary: "Perbarui aturan operasional (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Memperbarui satu atau lebih aturan pembatasan operasional spasial.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  protocol_road_prohibited: { type: "boolean" },
                  toll_road_prohibited: { type: "boolean" },
                  operational_radius_km: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Aturan operasional berhasil diperbarui" },
          403: { description: "Forbidden — Hanya SUPERADMIN" },
        },
      },
    },

    // =========================================================================
    // 2. AUTHENTICATION & IDENTITY
    // =========================================================================
    "/api/auth/captcha": {
      get: {
        tags: ["Auth & Identity"],
        summary: "Generate tantangan CAPTCHA baru",
        description: "Mengembalikan ID dan soal CAPTCHA. Opsional: sertakan `old_captcha_id` untuk refresh CAPTCHA sebelumnya.",
        parameters: [
          { in: "query", name: "old_captcha_id", schema: { type: "string" }, description: "ID CAPTCHA lama untuk di-refresh" },
        ],
        responses: {
          200: {
            description: "Tantangan CAPTCHA berhasil dibuat",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CaptchaChallenge" },
              },
            },
          },
        },
      },
    },
    "/api/auth/risk-status": {
      get: {
        tags: ["Auth & Identity"],
        summary: "Cek status risiko IP & pengguna (CAPTCHA threshold)",
        description: "Mengevaluasi jumlah percobaan login gagal berdasarkan IP dan identifier. Digunakan frontend untuk menentukan apakah CAPTCHA perlu ditampilkan.",
        parameters: [
          { in: "query", name: "identifier", schema: { type: "string" }, description: "Email atau username pengguna" },
        ],
        responses: {
          200: {
            description: "Status risiko login",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    requires_captcha: { type: "boolean", example: false },
                    ipFailures: { type: "integer", example: 0 },
                    userFailures: { type: "integer", example: 0 },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/google": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Login via Google OAuth",
        description: "Autentikasi pengguna menggunakan kredensial Google. Membuat akun baru jika belum ada.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "name", "google_id"],
                properties: {
                  email: { type: "string", format: "email", example: "user@gmail.com" },
                  name: { type: "string", example: "John Doe" },
                  google_id: { type: "string", example: "1234567890" },
                  avatar_url: { type: "string", example: "https://lh3.googleusercontent.com/..." },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Google login berhasil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: { type: "string", example: "Google Login successful" },
                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Akun tidak ditemukan atau tidak diizinkan" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Login pengguna (Email/Phone/Username + Sandi)",
        description: "Mendukung login semua role. Mengembalikan JWT Access Token dan set Refresh Token Cookie HttpOnly. Opsional: sertakan CAPTCHA jika threshold risiko terlampaui.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["identifier", "password"],
                properties: {
                  identifier: { type: "string", example: "superadmin@kopikeliling.com", description: "Email, username, atau nomor telepon" },
                  password: { type: "string", example: "password123" },
                  captcha_id: { type: "string", description: "ID CAPTCHA (wajib jika risiko tinggi)" },
                  captcha_answer: { type: "string", description: "Jawaban CAPTCHA" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login berhasil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: { type: "string", example: "Login successful" },
                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: {
            description: "Kredensial login tidak valid",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "error" },
                    msg: { type: "string" },
                    requires_captcha: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Aktivasi mandiri akun staf (Input sandi, username & tanggal lahir)",
        description: "Pengguna yang diundang mengaktifkan akunnya dengan token undangan, sandi baru, dan data profil.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "password", "birth_date"],
                properties: {
                  token: { type: "string", description: "Token undangan yang dikirim via email" },
                  username: { type: "string", example: "budi_s" },
                  name: { type: "string", example: "Budi Santoso" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", example: "PasswordBaru123!" },
                  birth_date: { type: "string", format: "date", example: "1995-08-17" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Akun berhasil diaktifkan" },
          400: { description: "Token tidak valid, email/username sudah terdaftar" },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Kirim email link reset password",
        description: "Mengirimkan email berisi link reset password ke alamat email pengguna terdaftar.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "user@kopikeliling.com" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Link reset password berhasil dikirim (jika email terdaftar)" },
          429: { description: "Rate limit — terlalu banyak permintaan reset" },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Reset password menggunakan token reset",
        description: "Mengatur ulang kata sandi pengguna menggunakan token yang dikirim via email. Memerlukan verifikasi tanggal lahir.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "password", "birth_date"],
                properties: {
                  token: { type: "string", description: "Token reset dari link email" },
                  password: { type: "string", example: "PasswordBaru456!" },
                  birth_date: { type: "string", format: "date", example: "1995-08-17", description: "Verifikasi tanggal lahir sebagai faktor keamanan tambahan" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password berhasil direset" },
          400: { description: "Token tidak valid atau tanggal lahir tidak cocok" },
        },
      },
    },
    "/api/auth/verify-reset-token/{token}": {
      get: {
        tags: ["Auth & Identity"],
        summary: "Verifikasi validitas token reset password",
        description: "Memeriksa apakah token reset masih valid dan belum kadaluarsa. Digunakan halaman reset password sebelum menampilkan form input.",
        parameters: [
          { in: "path", name: "token", required: true, schema: { type: "string" }, description: "Token reset password dari email" },
        ],
        responses: {
          200: { description: "Token reset valid" },
          400: { description: "Token tidak valid atau telah kadaluarsa" },
        },
      },
    },
    "/api/auth/check-invitation": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Cek status undangan akun berdasarkan email/identifier",
        description: "Memeriksa apakah email/identifier memiliki undangan yang belum diaktifkan, sudah aktif, atau belum terdaftar sama sekali.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  identifier: { type: "string", description: "Email atau username" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Status undangan akun",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "PENDING_ACTIVATION" },
                    account_exists: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/check-status": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Alias: Cek status akun (identik dengan /check-invitation)",
        description: "Endpoint alias untuk /check-invitation, menerima parameter yang sama.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  identifier: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Status akun" },
        },
      },
    },
    "/api/auth/refresh-token": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Perpanjang JWT Access Token via Refresh Token Cookie",
        description: "Membaca refresh token dari HttpOnly cookie atau body, lalu mengeluarkan access token baru dengan rotasi refresh token.",
        responses: {
          200: {
            description: "Token baru berhasil dirotasi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    msg: { type: "string", example: "Token refreshed successfully" },
                    token: { type: "string", description: "Access token JWT baru" },
                  },
                },
              },
            },
          },
          401: { description: "Refresh token tidak valid atau kadaluarsa" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Keluar dari sesi dan hapus refresh cookie",
        description: "Menghapus refresh token cookie, invalidasi token di server, dan mengembalikan header anti-cache.",
        responses: {
          200: { description: "Logout berhasil" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth & Identity"],
        summary: "Ambil profil user aktif dari JWT Token",
        description: "Digunakan oleh frontend saat inisialisasi / reload halaman untuk mengambil data user dari token.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Data sesi user terotentikasi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    authenticated: { type: "boolean", example: true },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: {
            description: "Token tidak valid atau kadaluarsa",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    authenticated: { type: "boolean", example: false },
                    msg: { type: "string", example: "Unauthorized" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 3. USER MANAGEMENT
    // =========================================================================
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Daftar seluruh staf & pengguna sistem",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Menampilkan daftar seluruh pengguna terdaftar beserta peran dan statusnya.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar staf",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: { type: "array", items: { $ref: "#/components/schemas/User" } },
                  },
                },
              },
            },
          },
          403: { description: "Forbidden — Peran tidak memiliki akses" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Buat akun pengguna baru (Undang staf via email)",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Membuat akun baru dan mengirimkan email undangan aktivasi.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "name", "role"],
                properties: {
                  email: { type: "string", format: "email", example: "rider.baru@kopikeliling.com" },
                  name: { type: "string", example: "Andi Prasetyo" },
                  role: { type: "string", enum: ["MANAGEMENT", "SUPERVISOR", "RIDER"], example: "RIDER" },
                  phone: { type: "string", example: "081299887766" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Akun dibuat, undangan aktivasi dikirim" },
          400: { description: "Email sudah terdaftar" },
          403: { description: "RBAC Forbidden" },
        },
      },
    },
    "/api/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Ambil profil pengguna yang sedang login",
        description: "Mengembalikan data profil lengkap pengguna yang terautentikasi.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Data profil pengguna",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
    "/api/users/change-password": {
      put: {
        tags: ["Users"],
        summary: "Ganti password pengguna yang sedang login",
        description: "Memerlukan password lama untuk verifikasi sebelum mengatur password baru.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["old_password", "new_password"],
                properties: {
                  old_password: { type: "string", example: "PasswordLama123" },
                  new_password: { type: "string", example: "PasswordBaru456!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password berhasil diganti" },
          400: { description: "Password lama tidak cocok" },
        },
      },
    },
    "/api/users/me/complete-first-login": {
      patch: {
        tags: ["Users"],
        summary: "Selesaikan first-login mandatory password setup",
        description: "Untuk akun yang di-setup oleh admin dengan password default, pengguna wajib mengatur password baru saat login pertama kali.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["new_password"],
                properties: {
                  new_password: { type: "string", example: "PasswordBaru789!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "First-login password setup berhasil" },
        },
      },
    },
    "/api/users/preferences": {
      get: {
        tags: ["Users"],
        summary: "Ambil preferensi pengguna (tema peta, notifikasi, layout)",
        description: "Mengembalikan pengaturan preferensi personal pengguna termasuk tema peta, notifikasi, dan layout dashboard.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Preferensi pengguna",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        map_theme: { type: "string", example: "dark" },
                        notification_enabled: { type: "boolean", example: true },
                        dashboard_layout: { type: "string", example: "default" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Perbarui preferensi pengguna",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  map_theme: { type: "string", example: "dark" },
                  notification_enabled: { type: "boolean" },
                  dashboard_layout: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Preferensi berhasil diperbarui" },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Detail pengguna berdasarkan ID",
        description: "RBAC: SUPERADMIN, MANAGEMENT.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Detail pengguna", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          404: { description: "Pengguna tidak ditemukan" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Perbarui profil pengguna",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  role: { type: "string", enum: ["MANAGEMENT", "SUPERVISOR", "RIDER"] },
                  birth_date: { type: "string", format: "date" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Pengguna berhasil diperbarui" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Hapus pengguna",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Menghapus akun pengguna secara permanen.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Pengguna dihapus" },
          404: { description: "Pengguna tidak ditemukan" },
        },
      },
    },
    "/api/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Ubah status aktif pengguna (Aktifkan / Nonaktifkan)",
        description: "RBAC: SUPERADMIN, MANAGEMENT.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["is_active"],
                properties: { is_active: { type: "boolean" } },
              },
            },
          },
        },
        responses: { 200: { description: "Status berhasil diubah" } },
      },
    },
    "/api/users/{id}/resend-invitation": {
      post: {
        tags: ["Users"],
        summary: "Kirim ulang email undangan aktivasi",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Mengirim ulang link aktivasi ke email staf yang belum mengaktifkan akunnya.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Undangan berhasil dikirim ulang" },
          400: { description: "Akun sudah aktif" },
        },
      },
    },
    "/api/users/{id}/reset-password": {
      post: {
        tags: ["Users"],
        summary: "Reset password pengguna oleh admin",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Mereset password pengguna secara administratif tanpa memerlukan password lama.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  new_password: { type: "string", example: "TempPassword123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password berhasil direset oleh admin" },
        },
      },
    },

    // =========================================================================
    // 4. PRODUCT CATALOG
    // =========================================================================
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Katalog produk minuman & bahan baku",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "category", schema: { type: "string" }, description: "Filter berdasarkan kategori (COFFEE, NON_COFFEE, dll)" },
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] }, description: "Filter berdasarkan status produk" },
          { in: "query", name: "search", schema: { type: "string" }, description: "Pencarian berdasarkan nama/kode produk" },
        ],
        responses: {
          200: {
            description: "Daftar katalog produk",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Buat produk baru (Superadmin & Management)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "name", "price", "category"],
                properties: {
                  code: { type: "string", example: "PRD-AREN-01" },
                  name: { type: "string", example: "Es Kopi Susu Aren" },
                  price: { type: "number", example: 15000 },
                  category: { type: "string", example: "COFFEE" },
                  description: { type: "string", example: "Espresso robusta dengan sirup aren organik" },
                  image_url: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Produk berhasil ditambahkan" } },
      },
    },
    "/api/products/upload-image": {
      post: {
        tags: ["Products"],
        summary: "Upload gambar produk dengan kompresi otomatis WebP",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Menerima file gambar, kompresi otomatis ke format WebP via Sharp, dan mengembalikan URL publik.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary", description: "File gambar (JPEG, PNG, WebP)" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Gambar berhasil diupload",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    image_url: { type: "string", example: "/uploads/products/1234567890.webp" },
                  },
                },
              },
            },
          },
          400: { description: "File tidak valid atau terlalu besar" },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Detail produk",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Detail produk", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } } },
      },
      put: {
        tags: ["Products"],
        summary: "Perbarui produk (SUPERADMIN, MANAGEMENT)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  category: { type: "string" },
                  description: { type: "string" },
                  image_url: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Produk diperbarui" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Hapus produk (dengan penjagaan riwayat penjualan)",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Produk yang memiliki riwayat penjualan akan di-arsip (INACTIVE) alih-alih dihapus permanen.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Produk dihapus / di-arsip" } },
      },
    },
    "/api/products/{id}/status": {
      patch: {
        tags: ["Products"],
        summary: "Toggle status produk (ACTIVE / INACTIVE)",
        description: "RBAC: SUPERADMIN, MANAGEMENT. Mengubah status aktif/nonaktif produk tanpa menghapusnya.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Status produk berhasil diubah" } },
      },
    },

    // =========================================================================
    // 5. ARMADA & FLEET MANAGEMENT
    // =========================================================================
    "/api/armadas": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Daftar unit armada gerobak & sepeda listrik di Hub",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar armada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    armadas: { type: "array", items: { $ref: "#/components/schemas/Armada" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Armadas & Fleets"],
        summary: "Registrasi unit armada baru (SUPERADMIN, MANAGEMENT)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "name", "type"],
                properties: {
                  code: { type: "string", example: "ARM-GB-002" },
                  name: { type: "string", example: "Gerobak Sepeda Listrik Beta" },
                  type: { type: "string", example: "ELECTRIC_BIKE" },
                  battery_level: { type: "integer", example: 100 },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Armada didaftarkan" } },
      },
    },
    "/api/armadas/issues": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Daftar seluruh laporan kendala armada (SUPERADMIN, MANAGEMENT, SUPERVISOR)",
        description: "Menampilkan semua issue report dari seluruh unit armada, baik yang masih OPEN maupun RESOLVED.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar kendala armada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/ArmadaIssue" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/armadas/issues/{id}/resolve": {
      put: {
        tags: ["Armadas & Fleets"],
        summary: "Tandai kendala armada sebagai RESOLVED",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menyelesaikan issue report dan mengembalikan armada ke status operasional.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "ID laporan kendala" }],
        responses: {
          200: { description: "Kendala berhasil diselesaikan" },
          404: { description: "Laporan kendala tidak ditemukan" },
        },
      },
    },
    "/api/armadas/{id}": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Detail status armada",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Detail armada", content: { "application/json": { schema: { $ref: "#/components/schemas/Armada" } } } } },
      },
      put: {
        tags: ["Armadas & Fleets"],
        summary: "Perbarui data armada (SUPERADMIN, MANAGEMENT)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  battery_level: { type: "integer" },
                  status: { type: "string", enum: ["AVAILABLE", "MAINTENANCE"] },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Armada diperbarui" } },
      },
      delete: {
        tags: ["Armadas & Fleets"],
        summary: "Hapus unit armada (SUPERADMIN, MANAGEMENT)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Armada dihapus" } },
      },
    },
    "/api/armadas/{id}/history": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Riwayat penugasan & penggunaan armada",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menampilkan riwayat kronologis klaim, penggunaan, dan pengembalian armada.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Riwayat armada" } },
      },
    },
    "/api/armadas/{id}/report-issue": {
      post: {
        tags: ["Armadas & Fleets"],
        summary: "Laporkan kendala fisik armada (Semua role)",
        description: "Rider atau staf dapat melaporkan masalah fisik pada armada seperti ban bocor, rem blong, dll.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["category", "description"],
                properties: {
                  category: { type: "string", example: "TIRE_PUNCTURE", description: "Kategori kendala: TIRE_PUNCTURE, BRAKE_ISSUE, BATTERY_ISSUE, CLEANLINESS, OTHER" },
                  description: { type: "string", example: "Ban belakang bocor halus" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Laporan kendala dicatat" } },
      },
    },

    // =========================================================================
    // 5b. FLEETS (Canonical Prefix — CONTRA-004 RESOLVED)
    //     /api/armadas tetap sebagai deprecated alias
    // =========================================================================
    "/api/fleets": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Daftar unit armada (canonical prefix /api/fleets — CONTRA-004)",
        description: "Canonical endpoint. Mengembalikan daftar seluruh unit armada. Endpoint /api/armadas tetap tersedia sebagai deprecated alias.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "RESERVED", "IN_USE", "MAINTENANCE", "RETIRED"] }, description: "Filter berdasarkan status armada" },
          { in: "query", name: "type", schema: { type: "string" }, description: "Filter berdasarkan tipe armada" },
        ],
        responses: {
          200: {
            description: "Daftar armada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    armadas: { type: "array", items: { $ref: "#/components/schemas/Armada" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Armadas & Fleets"],
        summary: "Registrasi unit armada baru (canonical /api/fleets — SUPERADMIN, MANAGEMENT)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "name", "type"],
                properties: {
                  code: { type: "string", example: "ARM-GB-002" },
                  name: { type: "string", example: "Gerobak Sepeda Listrik Beta" },
                  type: { type: "string", example: "ELECTRIC_BIKE" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Armada berhasil didaftarkan" } },
      },
    },
    "/api/fleets/{id}": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Detail unit armada (canonical /api/fleets)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Detail armada", content: { "application/json": { schema: { $ref: "#/components/schemas/Armada" } } } } },
      },
      put: {
        tags: ["Armadas & Fleets"],
        summary: "Perbarui data armada (canonical /api/fleets — SUPERADMIN, MANAGEMENT)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  name: { type: "string" },
                  type: { type: "string" },
                  status: { type: "string", enum: ["ACTIVE", "RESERVED", "IN_USE", "MAINTENANCE", "RETIRED"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Armada berhasil diperbarui" } },
      },
      delete: {
        tags: ["Armadas & Fleets"],
        summary: "Hapus/decommission unit armada (canonical /api/fleets — SUPERADMIN, MANAGEMENT)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Armada dihapus/retired" } },
      },
    },
    "/api/fleets/issues": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Daftar seluruh laporan kendala armada (canonical /api/fleets)",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menampilkan semua issue report.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar kendala armada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/ArmadaIssue" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/fleets/issues/{id}/resolve": {
      put: {
        tags: ["Armadas & Fleets"],
        summary: "Tandai kendala armada sebagai RESOLVED (canonical /api/fleets)",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "ID laporan kendala" }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  resolution_notes: { type: "string", description: "Catatan penyelesaian masalah" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Kendala berhasil diselesaikan" },
          404: { description: "Laporan kendala tidak ditemukan" },
        },
      },
    },

    // =========================================================================
    // 6. SPATIAL RESTRICTION & ROADS
    // =========================================================================
    "/api/roads/protocol": {
      get: {
        tags: ["Spatial & Roads"],
        summary: "Layer 885 ruas jalan protokol PostGIS (GeoJSON)",
        description: "Mengembalikan GeoJSON FeatureCollection 885 LineString jalan protokol yang dilarang untuk berjualan gerobak kopi.",
        responses: {
          200: {
            description: "GeoJSON FeatureCollection jalan protokol",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    type: { type: "string", example: "FeatureCollection" },
                    features: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/roads/toll": {
      get: {
        tags: ["Spatial & Roads"],
        summary: "Layer ruas jalan tol PostGIS (GeoJSON)",
        description: "Mengembalikan GeoJSON FeatureCollection ruas jalan tol yang merupakan batas operasional.",
        responses: { 200: { description: "GeoJSON FeatureCollection jalan tol" } },
      },
    },
    "/api/roads/sync-toll": {
      post: {
        tags: ["Spatial & Roads"],
        summary: "Sinkronisasi data jalan tol dari Overpass API (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Memicu sinkronisasi data jalan tol terbaru dari OpenStreetMap Overpass API.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Sinkronisasi jalan tol berhasil dijadwalkan" },
          403: { description: "Forbidden — Hanya SUPERADMIN" },
        },
      },
    },

    // =========================================================================
    // 7. ZONES & OPERATIONAL POLYGONS
    // =========================================================================
    "/api/zones": {
      get: {
        tags: ["Zones"],
        summary: "Daftar poligon zona operasional aktif",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar zona operasional",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    zones: { type: "array", items: { $ref: "#/components/schemas/Zone" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Zones"],
        summary: "Buat poligon zona baru dengan validasi spasial PostGIS (SUPERADMIN)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "code", "capacity", "polygon"],
                properties: {
                  name: { type: "string", example: "Zona Sidoarjo 5 - GOR" },
                  code: { type: "string", example: "ZON-SDA-05" },
                  capacity: { type: "integer", example: 3 },
                  polygon: { type: "object", description: "GeoJSON Polygon geometry" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Zona berhasil dibuat" } },
      },
    },
    "/api/zones/config": {
      get: {
        tags: ["Zones"],
        summary: "Ambil konfigurasi spasial zona (Central Hub, radius)",
        description: "Mengembalikan konfigurasi yang relevan untuk rendering zona pada peta termasuk posisi hub dan batas radius.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Konfigurasi spasial zona" } },
      },
    },
    "/api/zones/validate": {
      post: {
        tags: ["Zones"],
        summary: "Validasi pra-simpan poligon zona (Cek interseksi jalan protokol/tol)",
        description: "Menjalankan validasi spasial PostGIS untuk memeriksa apakah poligon bersinggungan dengan jalan protokol atau jalan tol.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["polygon"],
                properties: {
                  polygon: { type: "object", description: "GeoJSON Polygon geometry" },
                  exclude_zone_id: { type: "string", format: "uuid", description: "ID zona yang dikecualikan (untuk update)" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Hasil validasi interseksi spasial" } },
      },
    },
    "/api/zones/{id}": {
      get: {
        tags: ["Zones"],
        summary: "Detail zona operasional berdasarkan ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Detail zona", content: { "application/json": { schema: { $ref: "#/components/schemas/Zone" } } } } },
      },
      put: {
        tags: ["Zones"],
        summary: "Perbarui zona operasional (SUPERADMIN)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  code: { type: "string" },
                  capacity: { type: "integer" },
                  polygon: { type: "object", description: "GeoJSON Polygon geometry" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Zona berhasil diperbarui" } },
      },
      delete: {
        tags: ["Zones"],
        summary: "Hapus zona operasional (SUPERADMIN)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Zona dihapus" } },
      },
    },
    "/api/zones/{id}/status": {
      patch: {
        tags: ["Zones"],
        summary: "Ubah status zona (ACTIVE / INACTIVE) — SUPERADMIN",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Status zona diperbarui" } },
      },
    },
    "/api/zones/{id}/capacity": {
      patch: {
        tags: ["Zones"],
        summary: "Ubah kapasitas rider zona (SUPERADMIN)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["capacity"],
                properties: {
                  capacity: { type: "integer", example: 5 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Kapasitas zona diperbarui" } },
      },
    },

    // =========================================================================
    // 8. POI (POINTS OF INTEREST)
    // =========================================================================
    "/api/pois": {
      get: {
        tags: ["POIs"],
        summary: "Daftar titik POI di dalam wilayah operasional",
        description: "Menampilkan daftar POI yang sudah disetujui dengan filter opsional berdasarkan kategori, zona, dan pencarian teks.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "category", schema: { type: "string" }, description: "Filter berdasarkan nama kategori POI" },
          { in: "query", name: "search", schema: { type: "string" }, description: "Pencarian berdasarkan nama POI" },
          { in: "query", name: "limit", schema: { type: "integer", default: 100 }, description: "Batas jumlah hasil" },
          { in: "query", name: "zone_id", schema: { type: "string", format: "uuid" }, description: "Filter POI dalam poligon zona tertentu" },
        ],
        responses: {
          200: {
            description: "Daftar titik POI",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    pois: { type: "array", items: { $ref: "#/components/schemas/POI" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/pois/sync-city": {
      post: {
        tags: ["POIs"],
        summary: "Sinkronisasi POI dari Overpass API untuk satu kota (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Memicu sinkronisasi full-city POI dari OpenStreetMap Overpass API. Rate limited.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Sinkronisasi POI dijadwalkan" },
          429: { description: "Rate limit — sinkronisasi terlalu sering" },
        },
      },
    },
    "/api/pois/sync-osm": {
      post: {
        tags: ["POIs"],
        summary: "Alias: Sinkronisasi POI dari OSM (identik /sync-city)",
        description: "RBAC: SUPERADMIN. Endpoint alias untuk /sync-city.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Sinkronisasi POI dijadwalkan" } },
      },
    },
    "/api/pois/reprocess-local": {
      post: {
        tags: ["POIs"],
        summary: "Proses ulang data staging POI lokal dari tabel pois_raw (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Memproses ulang data POI mentah yang sudah ada di tabel staging tanpa mengunduh ulang dari Overpass.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Proses ulang POI berhasil" } },
      },
    },
    "/api/pois/recluster": {
      post: {
        tags: ["POIs"],
        summary: "Klasterisasi ulang POI berdasarkan zona (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Menjalankan ulang algoritma pengelompokan POI ke zona-zona operasional berdasarkan ST_Contains.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Reklasterisasi POI berhasil" } },
      },
    },
    "/api/pois/leakage-report": {
      get: {
        tags: ["POIs"],
        summary: "Laporan kebocoran POI (titik diluar zona) — SUPERADMIN",
        description: "RBAC: SUPERADMIN. Menampilkan daftar POI yang tidak masuk ke dalam poligon zona manapun.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Laporan POI yang belum tercover zona" } },
      },
    },
    "/api/pois/pending": {
      get: {
        tags: ["POIs"],
        summary: "Daftar POI menunggu persetujuan (SUPERADMIN, SUPERVISOR)",
        description: "Menampilkan POI dengan status PENDING yang belum disetujui atau ditolak.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar POI pending approval",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/POI" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/pois/approve": {
      post: {
        tags: ["POIs"],
        summary: "Setujui atau tolak POI (SUPERADMIN, SUPERVISOR)",
        description: "Menyetujui (APPROVED) atau menolak (REJECTED) POI yang berstatus PENDING.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["poi_id", "action"],
                properties: {
                  poi_id: { type: "string", format: "uuid" },
                  action: { type: "string", enum: ["APPROVE", "REJECT"] },
                  reason: { type: "string", description: "Alasan penolakan (opsional)" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "POI berhasil diproses" } },
      },
    },
    "/api/pois/approval-logs": {
      get: {
        tags: ["POIs"],
        summary: "Riwayat log persetujuan/penolakan POI (SUPERADMIN, SUPERVISOR)",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar log approval POI" } },
      },
    },
    "/api/pois/cron/detect": {
      post: {
        tags: ["POIs"],
        summary: "Trigger manual deteksi POI baru via cron (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Memicu secara manual proses deteksi POI baru yang biasanya berjalan otomatis via cron.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Deteksi POI berhasil dijalankan" } },
      },
    },
    "/api/pois/zone/{zone_id}": {
      get: {
        tags: ["POIs"],
        summary: "Daftar POI dalam satu zona operasional",
        description: "Menampilkan semua POI yang berada di dalam poligon zona tertentu menggunakan PostGIS ST_Contains.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Daftar POI per zona" } },
      },
    },
    "/api/pois/scores/c1-c2/{zone_id}": {
      get: {
        tags: ["POIs"],
        summary: "Skor Densitas (C1) & Diversitas (C2) POI per zona",
        description: "Menghitung jumlah total POI (densitas) dan jumlah kategori unik (diversitas) dalam poligon zona.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Skor C1 (densitas) dan C2 (diversitas)" } },
      },
    },
    "/api/pois/scores/c3/{zone_id}": {
      get: {
        tags: ["POIs"],
        summary: "Skor Keramaian Berbasis Waktu (C3) per zona",
        description: "Menghitung skor potensi keramaian berdasarkan slot waktu (PAGI/SIANG/SORE/MALAM) dan time score masing-masing kategori POI.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Skor C3 time-based crowd" } },
      },
    },
    "/api/pois/scores/c4/{zone_id}": {
      get: {
        tags: ["POIs"],
        summary: "Skor Jarak dari Central Hub (C4) per zona",
        description: "Menghitung jarak centroid zona ke Central Hub menggunakan PostGIS ST_Distance.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Skor C4 jarak hub" } },
      },
    },
    "/api/pois/scores/c5/{zone_id}": {
      get: {
        tags: ["POIs"],
        summary: "Skor Kondisi Cuaca (C5) per zona",
        description: "Mengevaluasi pengaruh cuaca terkini terhadap potensi penjualan di zona.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Skor C5 cuaca" } },
      },
    },
    "/api/pois/scores/c6/{zone_id}": {
      get: {
        tags: ["POIs"],
        summary: "Skor Tingkat Kompetisi (C6) per zona",
        description: "Menghitung jumlah kompetitor kopi keliling di dalam poligon zona.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Skor C6 kompetisi" } },
      },
    },

    // =========================================================================
    // 8b. POI CATEGORIES
    // =========================================================================
    "/api/poi-categories": {
      get: {
        tags: ["POI Categories"],
        summary: "Daftar kategori POI beserta slot waktu aktifnya",
        description: "Menampilkan seluruh kategori OSM POI yang digunakan dalam perhitungan DSS, termasuk time score per slot.",
        responses: {
          200: {
            description: "Daftar kategori POI",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/POICategory" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/poi-categories/{id}/toggle": {
      put: {
        tags: ["POI Categories"],
        summary: "Toggle status aktif kategori POI (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Mengaktifkan atau menonaktifkan kategori POI dari perhitungan DSS.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Status kategori diubah" } },
      },
    },
    "/api/poi-categories/{id}/time-scores": {
      put: {
        tags: ["POI Categories"],
        summary: "Perbarui skor waktu (C3 scores) per kategori POI (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Mengatur bobot relevansi kategori POI pada tiap slot waktu (PAGI, SIANG, SORE, MALAM).",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  PAGI: { type: "number", example: 0.8 },
                  SIANG: { type: "number", example: 0.6 },
                  SORE: { type: "number", example: 0.9 },
                  MALAM: { type: "number", example: 0.3 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Skor waktu berhasil diperbarui" } },
      },
    },
    "/api/poi-categories/time-scores/bulk": {
      post: {
        tags: ["POI Categories"],
        summary: "Perbarui skor waktu secara massal untuk banyak kategori sekaligus (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Batch update time scores untuk multiple kategori POI dalam satu request.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  updates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        PAGI: { type: "number" },
                        SIANG: { type: "number" },
                        SORE: { type: "number" },
                        MALAM: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Skor waktu massal berhasil diperbarui" } },
      },
    },

    // =========================================================================
    // 9. WEATHER & ENVIRONMENT
    // =========================================================================
    "/api/weathers/hub": {
      get: {
        tags: ["Weather"],
        summary: "Kondisi cuaca terkini Central Hub",
        description: "Mengembalikan data cuaca terkini untuk kota hub operasional. Nama kota diambil otomatis dari OperationalContextService (system_settings).",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Data suhu, kelembaban & kondisi cuaca hub",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    city_name: { type: "string", example: "Sidoarjo" },
                    weather: {
                      type: "object",
                      properties: {
                        temperature_2m: { type: "number", example: 30.5 },
                        precipitation_probability: { type: "number", example: 25 },
                        rain: { type: "number", example: 0.2 },
                        humidity: { type: "number", example: 78 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/weathers/zone/{zone_id}": {
      get: {
        tags: ["Weather"],
        summary: "Kondisi cuaca per poligon zona operasional",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Data cuaca zona" } },
      },
    },
    "/api/weathers/sync": {
      post: {
        tags: ["Weather"],
        summary: "Sinkronisasi manual data cuaca dari Open-Meteo (SUPERADMIN, SUPERVISOR)",
        description: "Memicu fetch data cuaca terbaru dari Open-Meteo API untuk seluruh zona dan hub.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Sinkronisasi cuaca berhasil" } },
      },
    },

    // =========================================================================
    // 10. COMPETITOR SURVEY
    // =========================================================================
    "/api/competitors": {
      get: {
        tags: ["Competitors"],
        summary: "Daftar data survei kompetitor kopi keliling",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar titik kompetitor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Competitor" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Competitors"],
        summary: "Catat titik temuan kompetitor baru (SUPERADMIN, SUPERVISOR)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "latitude", "longitude"],
                properties: {
                  name: { type: "string", example: "Kopi Kenangan" },
                  latitude: { type: "number", example: -7.4501 },
                  longitude: { type: "number", example: 112.7201 },
                  zone_id: { type: "string", format: "uuid" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Data kompetitor tersimpan" } },
      },
    },
    "/api/competitors/score/{zone_id}": {
      get: {
        tags: ["Competitors"],
        summary: "Skor kompetisi (C6) per zona",
        description: "Menghitung jumlah kompetitor yang berada di dalam poligon zona tertentu.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Skor C6 kompetisi zona" } },
      },
    },
    "/api/competitors/zone/{zone_id}": {
      get: {
        tags: ["Competitors"],
        summary: "Daftar kompetitor per zona operasional",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Daftar kompetitor di zona" } },
      },
    },
    "/api/competitors/{id}": {
      delete: {
        tags: ["Competitors"],
        summary: "Hapus data kompetitor (SUPERADMIN, SUPERVISOR)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Kompetitor dihapus" } },
      },
    },

    // =========================================================================
    // 11. DECISION SUPPORT SYSTEM (BWM & TOPSIS)
    // =========================================================================
    "/api/dss/bwm/active": {
      get: {
        tags: ["DSS Engine"],
        summary: "Ambil konfigurasi pembobotan BWM aktif",
        description: "RBAC: SUPERADMIN, SUPERVISOR, MANAGEMENT. Mengembalikan konfigurasi BWM yang sedang aktif digunakan untuk perhitungan TOPSIS.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Konfigurasi BWM aktif",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    config: { $ref: "#/components/schemas/DSSConfig" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/dss/bwm/configs": {
      get: {
        tags: ["DSS Engine"],
        summary: "Daftar seluruh konfigurasi BWM (aktif & historis)",
        description: "RBAC: SUPERADMIN, SUPERVISOR, MANAGEMENT. Menampilkan semua konfigurasi BWM yang pernah dibuat.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar konfigurasi BWM",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/DSSConfig" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/dss/bwm/calculate": {
      post: {
        tags: ["DSS Engine"],
        summary: "Hitung bobot optimal BWM via Linear Programming Solver (SUPERADMIN)",
        description: "Menerima perbandingan best-to-others dan worst-to-others, menghitung bobot optimal tiap kriteria menggunakan LP Solver, serta Consistency Ratio (CR).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["best_criteria_id", "worst_criteria_id", "best_to_others", "worst_to_others"],
                properties: {
                  name: { type: "string", example: "Konfigurasi BWM Baru" },
                  best_criteria_id: { type: "string", description: "ID kriteria terbaik" },
                  worst_criteria_id: { type: "string", description: "ID kriteria terburuk" },
                  best_to_others: { type: "object", description: "Perbandingan best vs setiap kriteria lain" },
                  worst_to_others: { type: "object", description: "Perbandingan setiap kriteria vs worst" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Bobot BWM optimal & rasio konsistensi (CR)" } },
      },
    },
    "/api/dss/bwm/preview-impact": {
      post: {
        tags: ["DSS Engine"],
        summary: "Preview dampak konfigurasi BWM terhadap ranking zona",
        description: "RBAC: SUPERADMIN, SUPERVISOR, MANAGEMENT. Simulasi preview bagaimana konfigurasi BWM tertentu akan mempengaruhi ranking zona TOPSIS tanpa menyimpannya.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  config_id: { type: "string", format: "uuid", description: "ID konfigurasi BWM yang akan di-preview" },
                  weights: { type: "object", description: "Bobot kustom untuk preview (opsional)" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Preview ranking zona dengan konfigurasi BWM yang dipilih" } },
      },
    },
    "/api/dss/bwm/{id}/activate": {
      post: {
        tags: ["DSS Engine"],
        summary: "Aktifkan konfigurasi BWM tertentu (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Mengaktifkan konfigurasi BWM dan menonaktifkan konfigurasi sebelumnya.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "ID konfigurasi BWM" }],
        responses: { 200: { description: "Konfigurasi BWM berhasil diaktifkan" } },
      },
    },
    "/api/dss/zones/{id}/raw-evaluation": {
      get: {
        tags: ["DSS Engine"],
        summary: "Evaluasi mentah skor per kriteria untuk satu zona",
        description: "RBAC: SUPERADMIN, SUPERVISOR. Mengembalikan skor C1-C6 mentah tanpa normalisasi untuk satu zona tertentu.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "ID zona" }],
        responses: { 200: { description: "Skor evaluasi mentah per kriteria zona" } },
      },
    },
    "/api/dss/evaluate": {
      post: {
        tags: ["DSS Engine"],
        summary: "Jalankan evaluasi hybrid BWM-TOPSIS penuh (SUPERADMIN, SUPERVISOR)",
        description: "Menghitung matriks ternormalisasi, matriks terbobot, solusi ideal positif/negatif, dan skor Ci untuk seluruh zona. Menyimpan snapshot hasil.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  time_slot: { type: "string", enum: ["PAGI", "SIANG", "SORE", "MALAM"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Hasil evaluasi TOPSIS lengkap dengan snapshot" } },
      },
    },
    "/api/dss/snapshots": {
      get: {
        tags: ["DSS Engine"],
        summary: "Daftar snapshot historis evaluasi DSS",
        description: "RBAC: SUPERADMIN, SUPERVISOR. Menampilkan riwayat snapshot evaluasi TOPSIS yang pernah dijalankan.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar snapshot DSS",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/DSSSnapshot" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/dss/snapshots/{id}": {
      get: {
        tags: ["DSS Engine"],
        summary: "Detail snapshot evaluasi DSS berdasarkan ID",
        description: "RBAC: SUPERADMIN, SUPERVISOR.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Detail snapshot DSS", content: { "application/json": { schema: { $ref: "#/components/schemas/DSSSnapshot" } } } } },
      },
    },
    "/api/dss/recommendations": {
      get: {
        tags: ["DSS Engine"],
        summary: "Rekomendasi Pemeringkatan Zona TOPSIS (Multi-Attribute Decision)",
        description: "Menghitung matriks ternormalisasi, matriks terbobot BWM, solusi ideal positif/negatif, dan skor kedekatan relatif (Ci) seluruh zona operasional.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "timeSlot", schema: { type: "string", enum: ["PAGI", "SIANG", "SORE", "MALAM"] }, description: "Slot waktu evaluasi" },
          { in: "query", name: "riderLat", schema: { type: "number" }, description: "Latitude posisi rider (untuk perhitungan C4)" },
          { in: "query", name: "riderLon", schema: { type: "number" }, description: "Longitude posisi rider" },
        ],
        responses: {
          200: {
            description: "Daftar zona terurut dari peringkat terbaik (Rank 1)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    time_slot: { type: "string", example: "SIANG" },
                    total_evaluated_zones: { type: "integer", example: 4 },
                    rankings: {
                      type: "array",
                      items: { $ref: "#/components/schemas/DSSRecommendation" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 11b. CANDIDATE SELLING LOCATIONS
    // =========================================================================
    "/api/candidate-selling-locations": {
      post: {
        tags: ["Candidate Selling Locations"],
        summary: "Tambahkan calon titik lokasi jualan baru (SUPERADMIN, SUPERVISOR)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "latitude", "longitude", "zone_id"],
                properties: {
                  name: { type: "string", example: "Titik Depan Alun-Alun" },
                  latitude: { type: "number", example: -7.4478 },
                  longitude: { type: "number", example: 112.7183 },
                  zone_id: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Kandidat lokasi tersimpan" } },
      },
    },
    "/api/candidate-selling-locations/zone/{zoneId}": {
      get: {
        tags: ["Candidate Selling Locations"],
        summary: "Daftar kandidat lokasi jualan dalam satu zona",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zoneId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Daftar kandidat lokasi per zona",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/CSLCandidate" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/candidate-selling-locations/{id}": {
      get: {
        tags: ["Candidate Selling Locations"],
        summary: "Detail kandidat lokasi jualan berdasarkan ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Detail kandidat lokasi", content: { "application/json": { schema: { $ref: "#/components/schemas/CSLCandidate" } } } } },
      },
    },
    "/api/candidate-selling-locations/generate/zone/{zoneId}": {
      post: {
        tags: ["Candidate Selling Locations"],
        summary: "Generate kandidat lokasi otomatis dari POI zona (SUPERADMIN, SUPERVISOR)",
        description: "Membuat titik-titik kandidat lokasi jualan secara otomatis berdasarkan POI yang ada di dalam zona.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zoneId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Kandidat lokasi berhasil di-generate" } },
      },
    },
    "/api/candidate-selling-locations/{id}/evaluate": {
      post: {
        tags: ["Candidate Selling Locations"],
        summary: "Evaluasi satu kandidat lokasi jualan (SUPERADMIN, SUPERVISOR)",
        description: "Menjalankan evaluasi TOPSIS micro-level untuk satu titik kandidat lokasi.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Hasil evaluasi kandidat lokasi" } },
      },
    },
    "/api/candidate-selling-locations/evaluate/zone/{zoneId}": {
      post: {
        tags: ["Candidate Selling Locations"],
        summary: "Evaluasi seluruh kandidat lokasi jualan dalam zona (SUPERADMIN, SUPERVISOR)",
        description: "Menjalankan evaluasi batch TOPSIS micro-level untuk seluruh kandidat lokasi di zona tertentu.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zoneId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Hasil evaluasi perangkingan seluruh kandidat lokasi" } },
      },
    },
    "/api/candidate-selling-locations/evaluation/{evaluationId}": {
      get: {
        tags: ["Candidate Selling Locations"],
        summary: "Ambil snapshot evaluasi kandidat lokasi",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "evaluationId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Snapshot evaluasi lengkap" } },
      },
    },
    "/api/candidate-selling-locations/evaluation/{evaluationId}/explanation": {
      get: {
        tags: ["Candidate Selling Locations"],
        summary: "Penjelasan naratif evaluasi kandidat lokasi",
        description: "Mengembalikan penjelasan detil mengapa sebuah kandidat lokasi mendapatkan ranking tertentu.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "evaluationId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Penjelasan naratif evaluasi" } },
      },
    },
    "/api/candidate-selling-locations/evaluation/{evaluationId}/audit": {
      get: {
        tags: ["Candidate Selling Locations"],
        summary: "Audit trail evaluasi kandidat lokasi",
        description: "Mengembalikan data audit lengkap proses evaluasi termasuk matriks, normalisasi, dan perhitungan TOPSIS.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "evaluationId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Audit trail evaluasi" } },
      },
    },

    // =========================================================================
    // 12. OPERATIONAL SESSIONS & DISTRIBUTION
    // =========================================================================
    "/api/distribution/overview": {
      get: {
        tags: ["Distribution"],
        summary: "Overview sesi operasional shift, kapasitas zona & antrean tugas",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Overview distribusi operasional" } },
      },
    },
    "/api/distribution/preview": {
      get: {
        tags: ["Distribution"],
        summary: "Preview distribusi sebelum konfirmasi (simulasi penugasan)",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menampilkan simulasi penugasan rider ke zona berdasarkan ranking TOPSIS dan kapasitas tanpa menyimpan.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Preview distribusi penugasan" } },
      },
    },
    "/api/distribution/duty-confirm": {
      post: {
        tags: ["Distribution"],
        summary: "Pendaftaran rider ke antrean tugas (FIFO Shift Check-in)",
        description: "Rider mengkonfirmasi ketersediaan untuk shift harian dan masuk ke antrean distribusi.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Rider terdaftar ke antrean tugas" } },
      },
    },
    "/api/distribution/confirm": {
      post: {
        tags: ["Distribution"],
        summary: "Konfirmasi distribusi penugasan (SUPERADMIN, SUPERVISOR)",
        description: "Mengkonfirmasi dan mengeksekusi distribusi dari hasil preview.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Distribusi dikonfirmasi dan dieksekusi" } },
      },
    },
    "/api/distribution/auto": {
      post: {
        tags: ["Distribution"],
        summary: "Distribusi otomatis berbasis ranking TOPSIS & kapasitas",
        description: "RBAC: SUPERADMIN, SUPERVISOR. Menjalankan engine distribusi penugasan otomatis.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Distribusi rider ke zona berhasil dijalankan" } },
      },
    },
    "/api/distribution/manual": {
      post: {
        tags: ["Distribution"],
        summary: "Distribusi manual (penugasan rider ke zona secara spesifik)",
        description: "RBAC: SUPERADMIN, SUPERVISOR. Menugaskan rider tertentu ke zona tertentu secara manual.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["assignments"],
                properties: {
                  assignments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        rider_id: { type: "string", format: "uuid" },
                        zone_id: { type: "string", format: "uuid" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Penugasan manual berhasil" } },
      },
    },
    "/api/distribution/emergency-swap": {
      post: {
        tags: ["Distribution"],
        summary: "Emergency swap rider antar zona (SUPERADMIN, SUPERVISOR)",
        description: "Memindahkan rider yang sudah ditugaskan ke zona lain secara darurat.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rider_id", "target_zone_id"],
                properties: {
                  rider_id: { type: "string", format: "uuid" },
                  target_zone_id: { type: "string", format: "uuid" },
                  reason: { type: "string", example: "Zona asal mengalami banjir" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Rider berhasil dipindahkan" } },
      },
    },
    "/api/distribution/runs": {
      get: {
        tags: ["Distribution"],
        summary: "Riwayat eksekusi distribusi (auto & manual)",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar riwayat distribusi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/DistributionRun" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/distribution/duty/{id}/status": {
      put: {
        tags: ["Distribution"],
        summary: "Perbarui status duty rider (SUPERADMIN, MANAGEMENT, SUPERVISOR)",
        description: "Mengubah status penugasan rider (misal: CANCELLED, REASSIGNED).",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "ID duty assignment" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", example: "CANCELLED" },
                  reason: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Status duty berhasil diperbarui" } },
      },
    },
    "/api/distribution/my-history": {
      get: {
        tags: ["Distribution"],
        summary: "Riwayat duty pribadi rider yang login",
        description: "Menampilkan riwayat penugasan dan shift harian rider yang sedang terautentikasi.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Riwayat duty rider" } },
      },
    },

    // =========================================================================
    // 13. RIDER DAILY OPERATIONS
    // =========================================================================
    "/api/rider/active-session": {
      get: {
        tags: ["Rider Operations"],
        summary: "Cek sesi aktif dan penugasan zona rider yang sedang login",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Status penugasan & armada rider",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RiderSession" },
              },
            },
          },
        },
      },
    },
    "/api/rider/hub-armadas": {
      get: {
        tags: ["Rider Operations"],
        summary: "Daftar unit armada di Central Hub dengan penanda klaim",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar unit armada yang dapat diklaim" } },
      },
    },
    "/api/rider/hold-armada": {
      post: {
        tags: ["Rider Operations"],
        summary: "Klaim sementara armada 5-menit (Ticket-Booking Lock via Redis)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["armada_id"],
                properties: { armada_id: { type: "string", format: "uuid" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Armada terkunci 5 menit untuk inspeksi rider" },
          409: { description: "Armada sedang di-hold oleh rider lain" },
        },
      },
    },
    "/api/rider/cancel-hold-armada": {
      post: {
        tags: ["Rider Operations"],
        summary: "Batalkan hold armada (kembali ke layar pemilihan)",
        description: "Melepas lock sementara pada armada yang sedang di-hold, mengembalikannya ke status AVAILABLE.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  armada_id: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Hold armada dibatalkan" } },
      },
    },
    "/api/rider/claim-armada": {
      post: {
        tags: ["Rider Operations"],
        summary: "Konfirmasi final klaim armada setelah inspeksi fisik",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["armada_id", "checklist"],
                properties: {
                  armada_id: { type: "string", format: "uuid" },
                  checklist: {
                    type: "object",
                    properties: {
                      brakes: { type: "boolean", description: "Rem berfungsi" },
                      tires: { type: "boolean", description: "Ban dalam kondisi baik" },
                      battery: { type: "boolean", description: "Baterai terisi" },
                      cleanliness: { type: "boolean", description: "Kebersihan terjaga" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Armada resmi diklaim (Status: IN_USE)" } },
      },
    },
    "/api/rider/check-in": {
      post: {
        tags: ["Rider Operations"],
        summary: "Check-in GPS ke poligon zona penugasan (Validasi Spasial PostGIS ST_Contains)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["latitude", "longitude"],
                properties: {
                  latitude: { type: "number", example: -7.4478 },
                  longitude: { type: "number", example: 112.7183 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Rider tiba di dalam poligon zona tugas" } },
      },
    },
    "/api/rider/record-sale": {
      post: {
        tags: ["Rider Operations"],
        summary: "Catat transaksi penjualan kopi keliling oleh rider",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items", "payment_method"],
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["product_id", "quantity"],
                      properties: {
                        product_id: { type: "string", format: "uuid" },
                        quantity: { type: "integer", example: 2 },
                      },
                    },
                  },
                  payment_method: { type: "string", enum: ["CASH", "QRIS"], example: "QRIS" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Penjualan berhasil dicatat" } },
      },
    },
    "/api/rider/my-sales": {
      get: {
        tags: ["Rider Operations"],
        summary: "Riwayat penjualan pribadi rider yang login",
        description: "Menampilkan daftar transaksi penjualan yang dilakukan oleh rider pada sesi aktif.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar riwayat penjualan rider" } },
      },
    },
    "/api/rider/checkout": {
      post: {
        tags: ["Rider Operations"],
        summary: "Selesaikan shift tugas & kembalikan armada ke Central Hub",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Shift selesai, armada dikembalikan (Status: AVAILABLE)" } },
      },
    },

    // =========================================================================
    // 14. DASHBOARD & REPORTING
    // =========================================================================
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard & Analytics"],
        summary: "Ringkasan metrik pendapatan, unit aktif, dan total penjualan harian",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Metrik dashboard utama" } },
      },
    },
    "/api/dashboard/sales-trend": {
      get: {
        tags: ["Dashboard & Analytics"],
        summary: "Tren penjualan 30 hari terakhir",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Grafik tren omzet harian" } },
      },
    },
    "/api/dashboard/zone-performance": {
      get: {
        tags: ["Dashboard & Analytics"],
        summary: "Performa penjualan & produktivitas per zona operasional",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Peringkat omzet per zona" } },
      },
    },
    "/api/dashboard/product-performance": {
      get: {
        tags: ["Dashboard & Analytics"],
        summary: "Performa penjualan per produk (SUPERADMIN, MANAGEMENT)",
        description: "Menampilkan analitik penjualan per produk termasuk total unit terjual, omzet, dan tren.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Analitik performa produk" } },
      },
    },

    // =========================================================================
    // 15. SALES
    // =========================================================================
    "/api/sales/overview": {
      get: {
        tags: ["Sales"],
        summary: "Agregasi analitik penjualan keseluruhan",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menampilkan ringkasan agregat penjualan termasuk total omzet, unit terjual, dan distribusi per zona.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Overview analitik penjualan" } },
      },
    },
    "/api/sales/my-sales": {
      get: {
        tags: ["Sales"],
        summary: "Riwayat penjualan personal rider (ownership-scoped)",
        description: "Menampilkan riwayat penjualan yang dimiliki oleh rider yang sedang login.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Riwayat penjualan pribadi" } },
      },
    },

    // =========================================================================
    // 16. LBS & GEOFENCE MONITORING
    // =========================================================================
    "/api/lbs/track": {
      post: {
        tags: ["LBS & Geofence"],
        summary: "Kirim update koordinat GPS rider (Location Tracking)",
        description: "Menerima dan menyimpan posisi GPS rider terkini ke Redis Geospatial. Digunakan oleh aplikasi rider secara berkala.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["latitude", "longitude"],
                properties: {
                  latitude: { type: "number", example: -7.4478 },
                  longitude: { type: "number", example: 112.7183 },
                  battery_level: { type: "integer", example: 88 },
                  speed: { type: "number", example: 12.5 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Koordinat rider diperbarui" } },
      },
    },
    "/api/lbs/nearby": {
      get: {
        tags: ["LBS & Geofence"],
        summary: "Cari rider terdekat dari titik koordinat (Proximity Search)",
        description: "Menggunakan Redis GEOSEARCH untuk mencari rider dalam radius tertentu dari koordinat yang diberikan.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "latitude", required: true, schema: { type: "number" } },
          { in: "query", name: "longitude", required: true, schema: { type: "number" } },
          { in: "query", name: "radius_km", schema: { type: "number", example: 5 }, description: "Radius pencarian dalam km" },
        ],
        responses: { 200: { description: "Daftar rider terdekat" } },
      },
    },
    "/api/lbs/distance": {
      get: {
        tags: ["LBS & Geofence"],
        summary: "Hitung jarak antara rider dan titik tujuan",
        description: "Menghitung jarak geodesik antara posisi rider terkini dan koordinat tujuan menggunakan Redis GEODIST.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "rider_id", required: true, schema: { type: "string", format: "uuid" } },
          { in: "query", name: "target_lat", required: true, schema: { type: "number" } },
          { in: "query", name: "target_lon", required: true, schema: { type: "number" } },
        ],
        responses: { 200: { description: "Jarak antara rider dan target (meter)" } },
      },
    },
    "/api/lbs/riders/{riderId}": {
      get: {
        tags: ["LBS & Geofence"],
        summary: "Ambil posisi GPS terkini seorang rider",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "riderId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Posisi GPS rider",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rider_id: { type: "string", format: "uuid" },
                    latitude: { type: "number" },
                    longitude: { type: "number" },
                    last_updated: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 17. NOTIFICATIONS
    // =========================================================================
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Daftar notifikasi in-app untuk pengguna yang login",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar notifikasi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Notification" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Tandai seluruh notifikasi telah dibaca",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Semua notifikasi ditandai dibaca" } },
      },
    },
    "/api/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Tandai satu notifikasi sebagai dibaca",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Notifikasi ditandai dibaca" } },
      },
    },
    "/api/notifications/{id}": {
      delete: {
        tags: ["Notifications"],
        summary: "Hapus notifikasi",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Notifikasi dihapus" } },
      },
    },

    // =========================================================================
    // 18. AUDIT LOGS
    // =========================================================================
    "/api/audit-logs": {
      get: {
        tags: ["Audit Logs"],
        summary: "Daftar log audit integritas sistem & keamanan (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Menampilkan jejak audit aktivitas sistem termasuk login, perubahan data, dan operasi administratif.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "user_id", schema: { type: "string", format: "uuid" }, description: "Filter berdasarkan user ID" },
          { in: "query", name: "action", schema: { type: "string" }, description: "Filter berdasarkan jenis aksi" },
          { in: "query", name: "entity_type", schema: { type: "string" }, description: "Filter berdasarkan tipe entitas" },
          { in: "query", name: "status", schema: { type: "string" }, description: "Filter berdasarkan status" },
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "Riwayat jejak audit sistem",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    logs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          user_name: { type: "string" },
                          action: { type: "string" },
                          entity_type: { type: "string" },
                          entity_id: { type: "string" },
                          ip_address: { type: "string" },
                          user_agent: { type: "string" },
                          created_at: { type: "string", format: "date-time" },
                        },
                      },
                    },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/audit-logs/filters": {
      get: {
        tags: ["Audit Logs"],
        summary: "Opsi filter yang tersedia untuk audit log (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Mengembalikan daftar aksi dan tipe entitas yang tersedia untuk digunakan sebagai filter pada GET /api/audit-logs.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar opsi filter audit log",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        actions: {
                          type: "array",
                          items: { type: "string" },
                          example: ["CREATE", "UPDATE", "DELETE", "LOGIN", "OVERRIDE_DISTRIBUTION", "FORCE_RELEASE_LOCK"],
                        },
                        entity_types: {
                          type: "array",
                          items: { type: "string" },
                          example: ["USER", "ZONE", "ARMADA", "DSS_CONFIG", "DISTRIBUTION_RUN", "PRODUCT"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 19. CRON AUTOMATION
    // =========================================================================
    "/api/cron-management/configs": {
      get: {
        tags: ["Cron Automation"],
        summary: "Daftar konfigurasi cron job terdaftar (SUPERADMIN)",
        description: "Menampilkan seluruh cron job beserta jadwal, status aktif, dan waktu eksekusi terakhir.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar konfigurasi cron",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/CronConfig" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/cron-management/logs": {
      get: {
        tags: ["Cron Automation"],
        summary: "Log eksekusi cron job (SUPERADMIN)",
        description: "Menampilkan riwayat log eksekusi cron job termasuk status (success/failed) dan durasi.",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar log eksekusi cron" } },
      },
    },
    "/api/cron-management/toggle/{cronKey}": {
      put: {
        tags: ["Cron Automation"],
        summary: "Aktifkan / Nonaktifkan cron job (SUPERADMIN)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "cronKey", required: true, schema: { type: "string" }, description: "Key unik cron job (misal: 'weather-sync')" }],
        responses: { 200: { description: "Status cron berhasil diubah" } },
      },
    },
    "/api/cron-management/trigger/{cronKey}": {
      post: {
        tags: ["Cron Automation"],
        summary: "Trigger eksekusi manual cron job (SUPERADMIN)",
        description: "Memicu eksekusi manual background job tanpa menunggu jadwal cron.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "cronKey", required: true, schema: { type: "string" }, description: "Key unik cron job" }],
        responses: { 200: { description: "Job berhasil dipicu secara manual" } },
      },
    },

    // =========================================================================
    // 20. DATA SYNCHRONIZATION
    // =========================================================================
    "/api/data-sync/trigger": {
      post: {
        tags: ["Data Synchronization"],
        summary: "Trigger sinkronisasi dataset spasial (POI, Jalan Tol, Jalan Protokol) — SUPERADMIN",
        description: "RBAC: SUPERADMIN. Menjadwalkan job sinkronisasi dataset spasial dari Overpass API ke background queue BullMQ.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["dataset_type"],
                properties: {
                  dataset_type: { type: "string", enum: ["POI", "TOLL_ROADS", "PROTOCOL_ROADS"], example: "POI" },
                  city_name: { type: "string", example: "Sidoarjo" },
                  cities: { type: "array", items: { type: "string" }, description: "Daftar kota untuk sinkronisasi batch" },
                  bbox: { type: "object", description: "Bounding box koordinat area (opsional)" },
                },
              },
            },
          },
        },
        responses: {
          202: {
            description: "Job sinkronisasi diterima dan dijadwalkan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "accepted" },
                    job_id: { type: "string" },
                    dataset_type: { type: "string" },
                    state: { type: "string" },
                    msg: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "Tipe dataset tidak valid" },
        },
      },
    },
    "/api/data-sync/jobs/{jobId}": {
      get: {
        tags: ["Data Synchronization"],
        summary: "Cek status dan progres job sinkronisasi (SUPERADMIN)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "jobId", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Status job sinkronisasi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    job: { $ref: "#/components/schemas/DataSyncJob" },
                  },
                },
              },
            },
          },
          404: { description: "Job ID tidak ditemukan" },
        },
      },
    },
    "/api/data-sync/versions/{datasetType}": {
      get: {
        tags: ["Data Synchronization"],
        summary: "Riwayat versi dataset spasial (SUPERADMIN)",
        description: "Menampilkan riwayat versi dataset (ACTIVE, RETIRED, STAGING, FAILED) untuk tipe dataset tertentu.",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "datasetType", required: true, schema: { type: "string", enum: ["POI", "TOLL_ROADS", "PROTOCOL_ROADS"] } }],
        responses: {
          200: {
            description: "Riwayat versi dataset",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    dataset_type: { type: "string" },
                    active_version: { type: "integer" },
                    total_versions: { type: "integer" },
                    versions: { type: "array", items: { $ref: "#/components/schemas/DatasetVersion" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/data-sync/rollback": {
      post: {
        tags: ["Data Synchronization"],
        summary: "Rollback atomik ke versi dataset historis (SUPERADMIN)",
        description: "RBAC: SUPERADMIN. Mengembalikan dataset spasial ke versi RETIRED sebelumnya secara atomik.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["version_id"],
                properties: {
                  version_id: { type: "string", format: "uuid", description: "ID versi yang ingin dipulihkan" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Rollback berhasil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    message: { type: "string" },
                    promoted_version: { type: "integer" },
                  },
                },
              },
            },
          },
          400: { description: "Parameter version_id tidak disertakan" },
        },
      },
    },

    // =========================================================================
    // 21. REPORTS
    // =========================================================================
    "/api/reports/riders/performance": {
      get: {
        tags: ["Reports"],
        summary: "Laporan performa operasional rider (kehadiran, produktivitas, penjualan)",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menampilkan laporan detail performa rider termasuk total shift, rata-rata delay check-in, total penjualan, revenue, dan zona favorit.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "start_date", required: true, schema: { type: "string", format: "date" }, description: "Tanggal awal periode" },
          { in: "query", name: "end_date", required: true, schema: { type: "string", format: "date" }, description: "Tanggal akhir periode" },
          { in: "query", name: "rider_id", schema: { type: "string", format: "uuid" }, description: "Filter rider spesifik" },
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
          { in: "query", name: "export", schema: { type: "string", enum: ["csv"] }, description: "Ekspor laporan dalam format CSV" },
        ],
        responses: {
          200: {
            description: "Laporan performa rider",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          rider_id: { type: "string", format: "uuid" },
                          rider_name: { type: "string", example: "Budi Santoso" },
                          total_shifts: { type: "integer", example: 12 },
                          total_check_ins: { type: "integer", example: 12 },
                          avg_check_in_delay_minutes: { type: "number", example: 4.5 },
                          total_sales_units: { type: "integer", example: 184 },
                          total_revenue: { type: "integer", example: 3312000 },
                          avg_shift_duration_hours: { type: "number", example: 7.2 },
                          favorite_zone_name: { type: "string", example: "Zone Central Core" },
                        },
                      },
                    },
                    summary_totals: {
                      type: "object",
                      properties: {
                        total_shifts_all: { type: "integer" },
                        total_revenue_all: { type: "integer" },
                        avg_delay_minutes_overall: { type: "number" },
                      },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total_records: { type: "integer" },
                        total_pages: { type: "integer" },
                        has_next: { type: "boolean" },
                        has_prev: { type: "boolean" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/reports/zones/effectiveness": {
      get: {
        tags: ["Reports"],
        summary: "Laporan efektivitas zona operasional",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Mengevaluasi efektivitas tiap zona berdasarkan omzet, kunjungan, dan perbandingan dengan rekomendasi DSS.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "start_date", schema: { type: "string", format: "date" } },
          { in: "query", name: "end_date", schema: { type: "string", format: "date" } },
          { in: "query", name: "zone_id", schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Laporan efektivitas zona" } },
      },
    },
    "/api/reports/fleet/lifecycle": {
      get: {
        tags: ["Reports"],
        summary: "Laporan siklus hidup & downtime maintenance armada",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menampilkan ringkasan status armada, jumlah issue yang dilaporkan, total downtime maintenance, dan statistik utilisasi.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "start_date", schema: { type: "string", format: "date" } },
          { in: "query", name: "end_date", schema: { type: "string", format: "date" } },
        ],
        responses: {
          200: {
            description: "Laporan fleet lifecycle",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        summary: {
                          type: "object",
                          properties: {
                            total_armadas: { type: "integer", example: 20 },
                            active: { type: "integer", example: 16 },
                            in_use: { type: "integer", example: 3 },
                            maintenance: { type: "integer", example: 1 },
                          },
                        },
                        maintenance_stats: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              armada_code: { type: "string", example: "ARM-004" },
                              total_issues_reported: { type: "integer", example: 4 },
                              total_downtime_days: { type: "integer", example: 3 },
                              current_status: { type: "string", example: "MAINTENANCE" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/reports/dss/accuracy": {
      get: {
        tags: ["Reports"],
        summary: "Laporan akurasi rekomendasi DSS (acceptance vs override rate)",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menganalisis tingkat penerimaan rekomendasi DSS vs manual override oleh supervisor, termasuk alasan override terbanyak.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "start_date", required: true, schema: { type: "string", format: "date" } },
          { in: "query", name: "end_date", required: true, schema: { type: "string", format: "date" } },
        ],
        responses: {
          200: {
            description: "Laporan akurasi DSS",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        total_recommendations: { type: "integer", example: 120 },
                        auto_accepted_count: { type: "integer", example: 98 },
                        manual_override_count: { type: "integer", example: 22 },
                        acceptance_rate_percent: { type: "number", example: 81.67 },
                        override_rate_percent: { type: "number", example: 18.33 },
                        top_override_reasons: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              reason: { type: "string", example: "Cuaca mendung mendadak" },
                              count: { type: "integer", example: 10 },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/reports/dss/impact-analysis": {
      get: {
        tags: ["Reports"],
        summary: "Analisis dampak DSS: perbandingan revenue Auto vs Manual Override",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Membandingkan performa revenue dan compliance antara penugasan yang mengikuti rekomendasi DSS (auto/accepted) vs yang di-override manual oleh supervisor.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "start_date", required: true, schema: { type: "string", format: "date" } },
          { in: "query", name: "end_date", required: true, schema: { type: "string", format: "date" } },
        ],
        responses: {
          200: {
            description: "Laporan analisis dampak DSS",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        evaluation_period: {
                          type: "object",
                          properties: {
                            start: { type: "string", format: "date" },
                            end: { type: "string", format: "date" },
                          },
                        },
                        comparison: {
                          type: "object",
                          properties: {
                            accepted_recommendations: {
                              type: "object",
                              properties: {
                                assignments_count: { type: "integer", example: 98 },
                                total_revenue: { type: "integer", example: 44100000 },
                                avg_revenue_per_shift: { type: "integer", example: 450000 },
                                avg_check_in_compliance_pct: { type: "number", example: 95.2 },
                              },
                            },
                            manual_overrides: {
                              type: "object",
                              properties: {
                                assignments_count: { type: "integer", example: 22 },
                                total_revenue: { type: "integer", example: 8360000 },
                                avg_revenue_per_shift: { type: "integer", example: 380000 },
                                avg_check_in_compliance_pct: { type: "number", example: 86.4 },
                              },
                            },
                            impact_metrics: {
                              type: "object",
                              properties: {
                                revenue_lift_percent: { type: "number", example: 18.42 },
                                compliance_lift_percent: { type: "number", example: 8.8 },
                                p_value_significance: { type: "number", example: 0.024 },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/reports/system/sync-history": {
      get: {
        tags: ["Reports"],
        summary: "Riwayat sinkronisasi data eksternal (Overpass POI & Open-Meteo)",
        description: "RBAC: SUPERADMIN. Menampilkan riwayat eksekusi job sinkronisasi data spasial dan cuaca, termasuk jumlah record yang difetch, dideduplikasi, dan durasi proses.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "dataset_type", schema: { type: "string", enum: ["poi", "weather"] }, description: "Filter berdasarkan tipe dataset" },
        ],
        responses: {
          200: {
            description: "Riwayat sinkronisasi data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          job_id: { type: "string", example: "sync-102" },
                          dataset_type: { type: "string", example: "poi" },
                          status: { type: "string", example: "COMPLETED" },
                          records_fetched: { type: "integer", example: 452 },
                          records_deduplicated: { type: "integer", example: 18 },
                          duration_seconds: { type: "number", example: 14.2 },
                          executed_at: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/reports/executive-summary": {
      get: {
        tags: ["Reports"],
        summary: "Ringkasan eksekutif keseluruhan operasi bisnis",
        description: "RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR. Menampilkan ringkasan tingkat tinggi mencakup pendapatan, performa rider, utilisasi armada, efektivitas DSS, dan revenue lift.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Ringkasan eksekutif",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        kpis: {
                          type: "object",
                          properties: {
                            total_revenue: { type: "integer", example: 1850000 },
                            active_riders: { type: "integer", example: 12 },
                            active_zones: { type: "integer", example: 8 },
                            fleet_utilization: { type: "number", example: 75.0 },
                            dss_accuracy: { type: "number", example: 81.67 },
                            dss_revenue_lift_pct: { type: "number", example: 18.42 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
