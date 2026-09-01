/*
 * swagger.ts
 * Comprehensive OpenAPI 3.0.3 Specification for MantaKopi COZIS DSS Backend
 * Runtime: Bun 1.4 + TypeScript + Express 5
 */

export const swaggerSpec: any = {
  openapi: "3.0.3",
  info: {
    title: "MantaKopi COZIS DSS API Documentation",
    version: "2.5.0",
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
    { name: "System & Health", description: "Pemeriksaan kesehatan sistem & konfigurasi fondasi" },
    { name: "Auth & Identity", description: "Otentikasi, registrasi staf, verifikasi token & logout" },
    { name: "Users", description: "Manajemen data user, peran (RBAC) & status aktif" },
    { name: "Products", description: "Katalog menu minuman & manajemen harga/status" },
    { name: "Armadas & Fleets", description: "Katalog unit armada sepeda listrik, siklus klaim & kendala" },
    { name: "Spatial & Roads", description: "Layer PostGIS jalan protokol & jalan tol pembatas operasional" },
    { name: "Zones", description: "Poligon zona operasional, kapasitas rider & validasi spasial" },
    { name: "POIs", description: "Point of Interest pemantik keramaian, klasterisasi & sinkronisasi OSM" },
    { name: "POI Categories", description: "Kategori waktu aktif POI (Pagi/Siang/Sore/Malam)" },
    { name: "Weather", description: "Integrasi cuaca realtime per zona & Central Hub" },
    { name: "Competitors", description: "Data survei lapangan kompetitor per zona operasional" },
    { name: "DSS Engine", description: "Komputasi pembobotan BWM & rekomendasi lokasi TOPSIS" },
    { name: "Distribution", description: "Sesi operasional harian & antrean distribusi rider (FIFO)" },
    { name: "Rider Operations", description: "Operasional harian rider lapangan (klaim armada, check-in, penjualan)" },
    { name: "Dashboard & Analytics", description: "Analisis penjualan, performa zona & tren pendapatan" },
    { name: "Sales", description: "Pencatatan transaksi penjualan produk harian" },
    { name: "LBS & Geofence", description: "Heartbeat koordinat rider & deteksi pelanggaran geofence" },
    { name: "Audit & Notifications", description: "Audit trail log aktivitas & notifikasi in-app" },
    { name: "Cron Automation", description: "Manajemen & pemicu background job terjadwal" },
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
          status: { type: "string", example: "error" },
          statusCode: { type: "integer", example: 400 },
          msg: { type: "string", example: "Deskripsi pesan kesalahan" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "11111111-1111-1111-1111-111111111111" },
          name: { type: "string", example: "Super Admin" },
          email: { type: "string", format: "email", example: "superadmin@kopikeliling.com" },
          role: { type: "string", enum: ["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"], example: "SUPERADMIN" },
          phone: { type: "string", example: "081234567890" },
          birth_date: { type: "string", format: "date", example: "1990-01-01" },
          is_active: { type: "boolean", example: true },
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
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "ACTIVE" },
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
    },
  },
  paths: {
    // -------------------------------------------------------------------------
    // 1. SYSTEM & HEALTH
    // -------------------------------------------------------------------------
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
        description: "Mengevaluasi checklist mandatory Central Hub, radius operasional, zona aktif, pembobotan DSS, dan armada.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Laporan kesiapan operasional",
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/system/settings": {
      get: {
        tags: ["System & Health"],
        summary: "Ambil pengaturan Central Hub & radius wilayah",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Konfigurasi sistem" } },
      },
      put: {
        tags: ["System & Health"],
        summary: "Perbarui koordinat Central Hub & aturan spasial",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
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
            },
          },
        },
        responses: { 200: { description: "Pengaturan berhasil diperbarui" } },
      },
    },

    // -------------------------------------------------------------------------
    // 2. AUTHENTICATION & IDENTITY
    // -------------------------------------------------------------------------
    "/api/auth/login": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Login pengguna (Email/Phone + Sandi)",
        description: "Mendukung login Super Admin, Management, Supervisor, dan Rider. Mengembalikan JWT Access Token dan Refresh Token Cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["identifier", "password"],
                properties: {
                  identifier: { type: "string", example: "superadmin@kopikeliling.com" },
                  password: { type: "string", example: "password123" },
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
                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Kredensial login tidak valid" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth & Identity"],
        summary: "Ambil profil user aktif dari JWT Token",
        description: "Digunakan oleh frontend Svelte store saat inisialisasi / reload halaman.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Data sesi user terotentikasi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Token tidak valid atau kadaluarsa" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Perpanjang JWT Access Token via Refresh Token Cookie",
        responses: {
          200: { description: "Token baru berhasil dirotasi" },
          401: { description: "Refresh token tidak valid" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Keluar dari sesi dan hapus refresh cookie",
        responses: { 200: { description: "Logout berhasil" } },
      },
    },
    "/api/auth/invite": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Kirim email undangan aktivasi staf baru",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "name", "role"],
                properties: {
                  email: { type: "string", example: "manager.baru@kopikeliling.com" },
                  name: { type: "string", example: "Budi Santoso" },
                  role: { type: "string", enum: ["MANAGEMENT", "SUPERVISOR", "RIDER"], example: "MANAGEMENT" },
                  phone: { type: "string", example: "081299887766" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Undangan aktivasi akun berhasil dikirim" },
          403: { description: "RBAC Forbidden: Hanya Superadmin yang berhak mengundang Management" },
        },
      },
    },
    "/api/auth/verify-token": {
      get: {
        tags: ["Auth & Identity"],
        summary: "Verifikasi validitas token aktivasi akun",
        parameters: [
          { in: "query", name: "token", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Token undangan sah" },
          400: { description: "Token tidak valid atau telah digunakan" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth & Identity"],
        summary: "Aktivasi mandiri akun staf (Input sandi & tanggal lahir)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "password", "birth_date"],
                properties: {
                  token: { type: "string" },
                  password: { type: "string", example: "PasswordBaru123!" },
                  birth_date: { type: "string", format: "date", example: "1995-08-17" },
                  phone: { type: "string", example: "081299887766" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Akun berhasil diaktifkan" },
        },
      },
    },

    // -------------------------------------------------------------------------
    // 3. USER MANAGEMENT
    // -------------------------------------------------------------------------
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Daftar seluruh staf & pengguna sistem",
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
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Detail pengguna berdasarkan ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Detail pengguna" } },
      },
      put: {
        tags: ["Users"],
        summary: "Perbarui profil pengguna",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Pengguna berhasil diperbarui" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Hapus pengguna",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Pengguna dihapus" } },
      },
    },
    "/api/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Ubah status aktif pengguna (Aktifkan / Nonaktifkan)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { is_active: { type: "boolean" } },
              },
            },
          },
        },
        responses: { 200: { description: "Status berhasil diubah" } },
      },
    },

    // -------------------------------------------------------------------------
    // 4. PRODUCT CATALOG
    // -------------------------------------------------------------------------
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Katalog produk minuman & bahan baku",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "status", schema: { type: "string" } },
          { in: "query", name: "search", schema: { type: "string" } },
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
                },
              },
            },
          },
        },
        responses: { 201: { description: "Produk berhasil ditambahkan" } },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Detail produk",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Detail produk" } },
      },
      put: {
        tags: ["Products"],
        summary: "Perbarui produk",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Produk diperbarui" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Hapus produk (dengan penjagaan riwayat penjualan)",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Produk dihapus / di-arsip" } },
      },
    },

    // -------------------------------------------------------------------------
    // 5. ARMADA & FLEET MANAGEMENT
    // -------------------------------------------------------------------------
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
        summary: "Registrasi unit armada baru",
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: "Armada didaftarkan" } },
      },
    },
    "/api/armadas/{id}": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Detail status dan riwayat armada",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Detail armada" } },
      },
    },
    "/api/armadas/{id}/issues": {
      get: {
        tags: ["Armadas & Fleets"],
        summary: "Riwayat kendala / laporan kerusakan armada",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Daftar kendala armada" } },
      },
      post: {
        tags: ["Armadas & Fleets"],
        summary: "Laporkan kendala fisik armada",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["category", "description"],
                properties: {
                  category: { type: "string", example: "TIRE_PUNCTURE" },
                  description: { type: "string", example: "Ban belakang bocor halus" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Laporan kendala dicatat" } },
      },
    },

    // -------------------------------------------------------------------------
    // 6. SPATIAL RESTRICTION & ROADS
    // -------------------------------------------------------------------------
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
        responses: { 200: { description: "GeoJSON FeatureCollection jalan tol" } },
      },
    },

    // -------------------------------------------------------------------------
    // 7. ZONES & OPERATIONAL POLYGONS
    // -------------------------------------------------------------------------
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
        summary: "Buat poligon zona baru dengan validasi spasial PostGIS",
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: "Zona berhasil dibuat" } },
      },
    },
    "/api/zones/validate": {
      post: {
        tags: ["Zones"],
        summary: "Validasi pra-simpan poligon zona (Cek interseksi jalan protokol/tol)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  polygon: { type: "object", description: "GeoJSON Polygon" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Hasil validasi interseksi spasial" },
        },
      },
    },

    // -------------------------------------------------------------------------
    // 8. POI (POINTS OF INTEREST)
    // -------------------------------------------------------------------------
    "/api/pois/operational-area": {
      get: {
        tags: ["POIs"],
        summary: "Titik POI yang disetujui di dalam wilayah operasional",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar titik POI disetujui" } },
      },
    },
    "/api/poi-categories": {
      get: {
        tags: ["POI Categories"],
        summary: "Daftar kategori POI beserta slot waktu aktifnya",
        responses: { 200: { description: "Daftar kategori POI (Pagi, Siang, Sore, Malam)" } },
      },
    },

    // -------------------------------------------------------------------------
    // 9. WEATHER & ENVIRONMENT
    // -------------------------------------------------------------------------
    "/api/weathers/hub/{city_name}": {
      get: {
        tags: ["Weather"],
        summary: "Kondisi cuaca terkini Central Hub",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "city_name", required: true, schema: { type: "string", example: "sidoarjo" } }],
        responses: { 200: { description: "Data suhu, kelembaban & kondisi cuaca" } },
      },
    },
    "/api/weathers/zone/{zone_id}": {
      get: {
        tags: ["Weather"],
        summary: "Kondisi cuaca per poligon zona operasional",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "zone_id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Data cuaca zona" } },
      },
    },

    // -------------------------------------------------------------------------
    // 10. COMPETITOR SURVEY
    // -------------------------------------------------------------------------
    "/api/competitors": {
      get: {
        tags: ["Competitors"],
        summary: "Daftar data survei kompetitor kopi keliling",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar titik kompetitor" } },
      },
      post: {
        tags: ["Competitors"],
        summary: "Catat titik temuan kompetitor baru",
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: "Data kompetitor tersimpan" } },
      },
    },

    // -------------------------------------------------------------------------
    // 11. DECISION SUPPORT SYSTEM (BWM & TOPSIS)
    // -------------------------------------------------------------------------
    "/api/dss/bwm/active": {
      get: {
        tags: ["DSS Engine"],
        summary: "Ambil konfigurasi pembobotan BWM (Best-Worst Method) yang sedang aktif",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Konfigurasi BWM aktif",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    config: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string", example: "Konfigurasi Standar Sidoarjo (BWM-TOPSIS)" },
                        consistency_ratio: { type: "number", example: 0.0211 },
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
    "/api/dss/bwm/calculate": {
      post: {
        tags: ["DSS Engine"],
        summary: "Hitung bobot optimal BWM via Linear Programming Solver",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["best_criteria_id", "worst_criteria_id", "best_to_others", "worst_to_others"],
                properties: {
                  best_criteria_id: { type: "string" },
                  worst_criteria_id: { type: "string" },
                  best_to_others: { type: "object" },
                  worst_to_others: { type: "object" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Bobot BWM optimal & rasio konsistensi (CR)" } },
      },
    },
    "/api/dss/recommendations": {
      get: {
        tags: ["DSS Engine"],
        summary: "Rekomendasi Pemeringkatan Zona TOPSIS (Multi-Attribute Decision)",
        description: "Menghitung matriks ternormalisasi, matriks terbobot BWM, solusi ideal positif/negatif, dan skor kedekatan relatif (Ci) seluruh zona operasional.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "timeSlot", schema: { type: "string", enum: ["PAGI", "SIANG", "SORE", "MALAM"] } },
          { in: "query", name: "riderLat", schema: { type: "number" } },
          { in: "query", name: "riderLon", schema: { type: "number" } },
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

    // -------------------------------------------------------------------------
    // 12. OPERATIONAL SESSIONS & DISTRIBUTION
    // -------------------------------------------------------------------------
    "/api/distribution/overview": {
      get: {
        tags: ["Distribution"],
        summary: "Overview sesi operasional shift, kapasitas zona & antrean tugas",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Overview distribusi" } },
      },
    },
    "/api/distribution/duty-confirm": {
      post: {
        tags: ["Distribution"],
        summary: "Pendaftaran rider ke antrean tugas (FIFO Shift Check-in)",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Rider terdaftar ke antrean tugas" } },
      },
    },
    "/api/distribution/auto": {
      post: {
        tags: ["Distribution"],
        summary: "Jalankan engine distribusi penugasan otomatis berbasis ranking TOPSIS & kapasitas",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Distribusi rider ke zona berhasil dijalankan" } },
      },
    },

    // -------------------------------------------------------------------------
    // 13. RIDER DAILY OPERATIONS
    // -------------------------------------------------------------------------
    "/api/rider/active-session": {
      get: {
        tags: ["Rider Operations"],
        summary: "Cek sesi aktif dan penugasan zona rider yang sedang login",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Status penugasan & armada rider" } },
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
                properties: { armada_id: { type: "string" } },
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
                  armada_id: { type: "string" },
                  checklist: {
                    type: "object",
                    properties: {
                      brakes: { type: "boolean" },
                      tires: { type: "boolean" },
                      battery: { type: "boolean" },
                      cleanliness: { type: "boolean" },
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
                      properties: {
                        product_id: { type: "string" },
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
    "/api/rider/checkout": {
      post: {
        tags: ["Rider Operations"],
        summary: "Selesaikan shift tugas & kembalikan armada ke Central Hub",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Shift selesai, armada dikembalikan (Status: AVAILABLE)" } },
      },
    },

    // -------------------------------------------------------------------------
    // 14. DASHBOARD & REPORTING
    // -------------------------------------------------------------------------
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard & Analytics"],
        summary: "Ringkasan metrik pendapatan, unit aktif, dan total penjualan harian",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Metrik dashboard utama" } },
      },
    },
    "/api/dashboard/sales-trend": {
      get: {
        tags: ["Dashboard & Analytics"],
        summary: "Tren penjualan 30 hari terakhir",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Grafik tren omzet harian" } },
      },
    },
    "/api/dashboard/zone-performance": {
      get: {
        tags: ["Dashboard & Analytics"],
        summary: "Performa penjualan & produktivitas per zona operasional",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Peringkat omzet per zona" } },
      },
    },

    // -------------------------------------------------------------------------
    // 15. AUDIT LOGS & NOTIFICATIONS
    // -------------------------------------------------------------------------
    "/api/audit-logs": {
      get: {
        tags: ["Audit & Notifications"],
        summary: "Daftar log audit integritas sistem & keamanan",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "action", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Riwayat jejak audit sistem" } },
      },
    },
    "/api/notifications": {
      get: {
        tags: ["Audit & Notifications"],
        summary: "Daftar notifikasi in-app untuk pengguna yang login",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar notifikasi" } },
      },
    },
    "/api/notifications/read-all": {
      patch: {
        tags: ["Audit & Notifications"],
        summary: "Tandai seluruh notifikasi telah dibaca",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Semua notifikasi ditandai dibaca" } },
      },
    },

    // -------------------------------------------------------------------------
    // 16. LBS & GEOFENCE MONITORING
    // -------------------------------------------------------------------------
    "/api/lbs/heartbeat": {
      post: {
        tags: ["LBS & Geofence"],
        summary: "Kirim update koordinat GPS rider secara berkala (Heartbeat)",
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
    "/api/lbs/geofence-check": {
      post: {
        tags: ["LBS & Geofence"],
        summary: "Verifikasi pelanggaran batas geofence poligon zona",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Hasil cek geofence" } },
      },
    },
    "/api/lbs/active-riders": {
      get: {
        tags: ["LBS & Geofence"],
        summary: "Ambil seluruh posisi GPS rider aktif di peta live",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar koordinat rider aktif" } },
      },
    },

    // -------------------------------------------------------------------------
    // 17. SALES & TRANSACTIONS
    // -------------------------------------------------------------------------
    "/api/sales/history": {
      get: {
        tags: ["Sales"],
        summary: "Riwayat transaksi penjualan produk harian",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "date_from", schema: { type: "string", format: "date" } },
          { in: "query", name: "date_to", schema: { type: "string", format: "date" } },
          { in: "query", name: "zone_id", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Daftar riwayat penjualan" } },
      },
    },
    "/api/sales/zone-sales": {
      get: {
        tags: ["Sales"],
        summary: "Total volume omzet & unit terjual per zona",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Ringkasan penjualan per zona" } },
      },
    },
    "/api/sales/record": {
      post: {
        tags: ["Sales"],
        summary: "Pencatatan manual transaksi kasir / pesanan",
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: "Penjualan dicatat" } },
      },
    },
    "/api/sales/export": {
      get: {
        tags: ["Sales"],
        summary: "Export laporan penjualan ke file CSV / Excel",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "File unduhan laporan penjualan" } },
      },
    },

    // -------------------------------------------------------------------------
    // 18. CANDIDATE SELLING LOCATIONS
    // -------------------------------------------------------------------------
    "/api/candidate-selling-locations": {
      get: {
        tags: ["DSS Engine"],
        summary: "Daftar calon titik lokasi jualan mikro",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar titik kandidat lokasi" } },
      },
      post: {
        tags: ["DSS Engine"],
        summary: "Tambahkan calon titik lokasi jualan baru",
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: "Kandidat lokasi tersimpan" } },
      },
    },
    "/api/candidate-selling-locations/evaluate": {
      post: {
        tags: ["DSS Engine"],
        summary: "Evaluasi perangkingan titik mikro jualan kandidat dengan TOPSIS",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Peringkat kelayakan titik mikro" } },
      },
    },

    // -------------------------------------------------------------------------
    // 19. CRON AUTOMATION
    // -------------------------------------------------------------------------
    "/api/cron-management/jobs": {
      get: {
        tags: ["Cron Automation"],
        summary: "Status pekerjaan background otomatis terjadwal",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Daftar status cron job" } },
      },
    },
    "/api/cron-management/trigger/{jobName}": {
      post: {
        tags: ["Cron Automation"],
        summary: "Memicu eksekusi manual background job",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "jobName", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Job berhasil dipicu" } },
      },
    },
  },
};
