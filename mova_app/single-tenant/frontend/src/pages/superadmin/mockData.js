/**
 * Master Mock Data for Single-Tenant Sidoarjo Operations
 * Aligns 1:1 with UI_API_REQUIREMENTS_BY_PAGE.md and Swagger Contracts
 */

export const MOCK_KPI = {
  activeZones: { value: 12, total: 17, trend: "+2 zona", trendDirection: "up" },
  activeRiders: { value: 8, total: 12, trend: "+1 rider", trendDirection: "up" },
  availableFleets: { value: 5, total: 8, trend: "0 unit", trendDirection: "neutral" },
  complianceRate: { value: "87%", subtext: "berdasarkan GPS & geofence", trend: "+5%", trendDirection: "up" },
  todaySales: { value: "Rp 2.450.000", totalTrans: 163, trend: "+12%", trendDirection: "up" },
};

export const MOCK_WEATHER = {
  temp: 31,
  condition: "Cerah Berawan",
  rainProb: "20%",
  humidity: "65%",
  windSpeed: "12.5 km/j",
  visibility: "10.0 km",
  city: "Sidoarjo Hub",
};

export const MOCK_ZONES = [
  {
    id: "ZON-SDA-01",
    name: "Alun-Alun Sidoarjo",
    status: "ACTIVE",
    rank: 1,
    score: 0.823,
    scoreTrend: "+12.4%",
    poiCount: 182,
    riderCount: 12,
    maxCapacity: 15,
    capacityPct: 80,
    c1: 0.87,
    c2: 0.76,
    c3: 0.69,
    c4: 0.82,
    c5: 0.88,
    c6: 0.65,
    coordinates: [
      [-7.4478, 112.7123],
      [-7.4485, 112.721],
      [-7.456, 112.7205],
      [-7.4552, 112.7118],
    ],
  },
  {
    id: "ZON-SDA-02",
    name: "Delta Plaza & GOR Sidoarjo",
    status: "ACTIVE",
    rank: 2,
    score: 0.745,
    scoreTrend: "+6.1%",
    poiCount: 145,
    riderCount: 8,
    maxCapacity: 10,
    capacityPct: 80,
    c1: 0.81,
    c2: 0.72,
    c3: 0.75,
    c4: 0.79,
    c5: 0.82,
    c6: 0.58,
    coordinates: [
      [-7.456, 112.711],
      [-7.457, 112.722],
      [-7.465, 112.721],
      [-7.464, 112.71],
    ],
  },
  {
    id: "ZON-SDA-03",
    name: "Kawasan RS Siti Hajar",
    status: "ACTIVE",
    rank: 3,
    score: 0.698,
    scoreTrend: "+4.3%",
    poiCount: 112,
    riderCount: 6,
    maxCapacity: 8,
    capacityPct: 75,
    c1: 0.74,
    c2: 0.68,
    c3: 0.65,
    c4: 0.71,
    c5: 0.77,
    c6: 0.62,
    coordinates: [
      [-7.441, 112.705],
      [-7.442, 112.715],
      [-7.448, 112.714],
      [-7.447, 112.704],
    ],
  },
  {
    id: "ZON-SDA-04",
    name: "Kawasan Industri Gedangan",
    status: "ACTIVE",
    rank: 4,
    score: 0.642,
    scoreTrend: "-1.2%",
    poiCount: 98,
    riderCount: 5,
    maxCapacity: 10,
    capacityPct: 50,
    c1: 0.69,
    c2: 0.61,
    c3: 0.82,
    c4: 0.68,
    c5: 0.72,
    c6: 0.45,
    coordinates: [
      [-7.382, 112.721],
      [-7.383, 112.735],
      [-7.395, 112.734],
      [-7.394, 112.72],
    ],
  },
  {
    id: "ZON-SDA-05",
    name: "Pasar Larangan & Stasiun",
    status: "ACTIVE",
    rank: 5,
    score: 0.587,
    scoreTrend: "+2.0%",
    poiCount: 120,
    riderCount: 4,
    maxCapacity: 8,
    capacityPct: 50,
    c1: 0.78,
    c2: 0.55,
    c3: 0.71,
    c4: 0.64,
    c5: 0.68,
    c6: 0.72,
    coordinates: [
      [-7.465, 112.708],
      [-7.466, 112.718],
      [-7.474, 112.717],
      [-7.473, 112.707],
    ],
  },
];

export const MOCK_RIDERS = [
  {
    id: "R-001",
    name: "Budi Santoso",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    phone: "081234567890",
    zoneId: "ZON-SDA-01",
    zoneName: "Alun-Alun Sidoarjo",
    armadaCode: "ARM-001",
    status: "ON_TIME", // Active / Selling (Green)
    battery: 88,
    speed: 4.2,
    lat: -7.4512,
    lng: 112.7156,
    checkInTime: "07:30 WIB",
    salesToday: 42,
    revenue: "Rp 630.000",
  },
  {
    id: "R-002",
    name: "Ahmad Fauzi",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    phone: "081298765432",
    zoneId: "ZON-SDA-01",
    zoneName: "Alun-Alun Sidoarjo",
    armadaCode: "ARM-002",
    status: "ON_TIME", // Active / Selling (Green)
    battery: 92,
    speed: 0.0,
    lat: -7.4525,
    lng: 112.7168,
    checkInTime: "07:45 WIB",
    salesToday: 38,
    revenue: "Rp 570.000",
  },
  {
    id: "R-003",
    name: "Rian Hidayat",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    phone: "085612345678",
    zoneId: "ZON-SDA-02",
    zoneName: "Delta Plaza",
    armadaCode: "ARM-003",
    status: "DEVIATION", // Deviation / Warning (Red)
    deviationMeters: 120,
    battery: 64,
    speed: 8.5,
    lat: -7.4615,
    lng: 112.7192,
    checkInTime: "08:10 WIB",
    salesToday: 29,
    revenue: "Rp 435.000",
  },
  {
    id: "R-004",
    name: "Dedi Kurniawan",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    phone: "087711223344",
    zoneId: "ZON-SDA-03",
    zoneName: "RS Siti Hajar",
    armadaCode: "ARM-004",
    status: "MOVING", // Transit / Moving (Yellow)
    battery: 78,
    speed: 14.1,
    lat: -7.4445,
    lng: 112.7095,
    checkInTime: "08:35 WIB",
    salesToday: 21,
    revenue: "Rp 315.000",
  },
  {
    id: "R-005",
    name: "Eko Prasetyo",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
    phone: "081344556677",
    zoneId: "ZON-SDA-04",
    zoneName: "Kawasan Industri",
    armadaCode: "ARM-005",
    status: "ON_TIME", // Active / Selling (Green)
    battery: 85,
    speed: 0.0,
    lat: -7.3885,
    lng: 112.7265,
    checkInTime: "07:20 WIB",
    salesToday: 33,
    revenue: "Rp 495.000",
  },
  {
    id: "R-006",
    name: "Fajar Nugraha",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    phone: "085799887766",
    zoneId: "ZON-SDA-05",
    zoneName: "Pasar Larangan",
    armadaCode: "ARM-006",
    status: "OFFLINE", // Offline (Red)
    battery: 12,
    speed: 0.0,
    lat: -7.4695,
    lng: 112.7125,
    checkInTime: "07:50 WIB",
    salesToday: 18,
    revenue: "Rp 270.000",
  },
];

export const MOCK_FLEETS = [
  { id: "1", code: "ARM-001", name: "Gerobak Jiwa 01", type: "GEROBAK_LISTRIK", status: "ACTIVE", riderName: "Budi Santoso", batteryPct: 88 },
  { id: "2", code: "ARM-002", name: "Gerobak Jiwa 02", type: "GEROBAK_LISTRIK", status: "ACTIVE", riderName: "Ahmad Fauzi", batteryPct: 92 },
  { id: "3", code: "ARM-003", name: "Gerobak Jiwa 03", type: "GEROBAK_LISTRIK", status: "ACTIVE", riderName: "Rian Hidayat", batteryPct: 64 },
  { id: "4", code: "ARM-004", name: "Gerobak Jiwa 04", type: "GEROBAK_LISTRIK", status: "ACTIVE", riderName: "Dedi Kurniawan", batteryPct: 78 },
  { id: "5", code: "ARM-005", name: "Gerobak Jiwa 05", type: "GEROBAK_MANUAL", status: "ACTIVE", riderName: "Eko Prasetyo", batteryPct: 85 },
  { id: "6", code: "ARM-006", name: "Gerobak Jiwa 06", type: "GEROBAK_MANUAL", status: "AVAILABLE", riderName: "-", batteryPct: 100 },
  { id: "7", code: "ARM-007", name: "Gerobak Jiwa 07", type: "GEROBAK_LISTRIK", status: "MAINTENANCE", riderName: "-", batteryPct: 30 },
  { id: "8", code: "ARM-008", name: "Gerobak Jiwa 08", type: "GEROBAK_LISTRIK", status: "AVAILABLE", riderName: "-", batteryPct: 100 },
];

export const MOCK_USERS = [
  { id: "USR-001", username: "superadmin", full_name: "Febriyan Dwi Putra", email: "febriyan@mova.id", role: "SUPERADMIN", phone: "081234567890", is_active: true },
  { id: "USR-002", username: "manajer_sda", full_name: "Hendro Wibowo", email: "hendro@mova.id", role: "MANAGEMENT", phone: "081298765431", is_active: true },
  { id: "USR-003", username: "spv_sidoarjo", full_name: "Siti Rahmawati", email: "siti@mova.id", role: "SUPERVISOR", phone: "085612345679", is_active: true },
  { id: "USR-004", username: "rider_budi", full_name: "Budi Santoso", email: "budi@mova.id", role: "RIDER", phone: "081234567890", is_active: true },
  { id: "USR-005", username: "rider_ahmad", full_name: "Ahmad Fauzi", email: "ahmad@mova.id", role: "RIDER", phone: "081298765432", is_active: true },
];

export const MOCK_PRODUCTS = [
  { id: "PRD-001", name: "Kopi Susu Sejuta Jiwa", category: "Signature Coffee", price: 15000, status: "AVAILABLE", salesCount: 84 },
  { id: "PRD-002", name: "Americano Arabica", category: "Black Coffee", price: 12000, status: "AVAILABLE", salesCount: 42 },
  { id: "PRD-003", name: "Caramel Macchiato", category: "Milk Coffee", price: 18000, status: "AVAILABLE", salesCount: 28 },
  { id: "PRD-004", name: "Matcha Latte", category: "Non-Coffee", price: 17000, status: "AVAILABLE", salesCount: 21 },
  { id: "PRD-005", name: "Earl Grey Tea", category: "Tea Series", price: 10000, status: "OUT_OF_STOCK", salesCount: 5 },
];

export const MOCK_POIS = [
  { id: "POI-001", name: "Kantor BPN Sidoarjo", category: "Perkantoran", zoneName: "Alun-Alun Sidoarjo", status: "APPROVED", lat: -7.451, lng: 112.714 },
  { id: "POI-002", name: "SMA Negeri 1 Sidoarjo", category: "Pendidikan", zoneName: "Alun-Alun Sidoarjo", status: "APPROVED", lat: -7.453, lng: 112.718 },
  { id: "POI-003", name: "Warung Kopi Pujasera", category: "Kuliner", zoneName: "Delta Plaza", status: "PENDING", lat: -7.462, lng: 112.715 },
  { id: "POI-004", name: "Indomaret Point GOR", category: "Minimarket", zoneName: "Delta Plaza", status: "APPROVED", lat: -7.458, lng: 112.721 },
];

export const MOCK_CRITERIA = [
  { code: "C1", name: "Densitas POI", type: "BENEFIT", weight: 0.24, desc: "Kerapatan fasilitas umum dan titik keramaian per km²" },
  { code: "C2", name: "Diversitas POI", type: "BENEFIT", weight: 0.18, desc: "Variasi kategori penunjang (perkantoran, sekolah, retail)" },
  { code: "C3", name: "Keramaian Berbasis Waktu", type: "BENEFIT", weight: 0.22, desc: "Jam sibuk pagi/siang/sore berdasarkan tipologi POI" },
  { code: "C4", name: "Kondisi Cuaca Real-Time", type: "BENEFIT", weight: 0.12, desc: "Probabilitas hujan dan suhu kondusif bagi gerobak" },
  { code: "C5", name: "Aksesibilitas Jalan", type: "BENEFIT", weight: 0.14, desc: "Kedekatan dengan jalan protokol dan shelter" },
  { code: "C6", name: "Kepadatan Kompetitor", type: "COST", weight: 0.10, desc: "Jumlah gerai kopi sejenis di radius 300m" },
];

export const MOCK_AUDIT_LOGS = [
  { id: "LOG-101", user: "Febriyan Dwi Putra", action: "UPDATE_BWM_WEIGHTS", target: "DSS Config v1.0.0", timestamp: "10 Sep 2026, 21:15 WIB", ip: "192.168.1.10" },
  { id: "LOG-102", user: "Siti Rahmawati", action: "APPROVE_POI", target: "Indomaret Point GOR", timestamp: "10 Sep 2026, 20:45 WIB", ip: "192.168.1.24" },
  { id: "LOG-103", user: "Febriyan Dwi Putra", action: "TRIGGER_DISTRIBUTION", target: "Shift Pagi 12 Rider", timestamp: "10 Sep 2026, 07:15 WIB", ip: "192.168.1.10" },
  { id: "LOG-104", user: "System Worker", action: "SYNC_WEATHER", target: "Open-Meteo Sidoarjo", timestamp: "10 Sep 2026, 07:00 WIB", ip: "127.0.0.1" },
];

export const MOCK_COMPETITORS = [
  { id: "COMP-001", name: "Kopi Kenangan Alun-Alun", brand: "Kopi Kenangan", zoneId: "ZON-SDA-01", zoneName: "Alun-Alun Sidoarjo", type: "CHAIN_CAFE", priceRange: "Rp 18.000 - Rp 35.000", lat: -7.4495, lng: 112.7142, distanceMeters: 140, c6Score: 0.85, status: "ACTIVE" },
  { id: "COMP-002", name: "Point Coffee Indomaret Diponegoro", brand: "Point Coffee", zoneId: "ZON-SDA-01", zoneName: "Alun-Alun Sidoarjo", type: "CONVENIENCE_STORE", priceRange: "Rp 15.000 - Rp 25.000", lat: -7.452, lng: 112.717, distanceMeters: 210, c6Score: 0.72, status: "ACTIVE" },
  { id: "COMP-003", name: "Janji Jiwa GOR Delta", brand: "Janji Jiwa", zoneId: "ZON-SDA-02", zoneName: "Delta Plaza & GOR", type: "CHAIN_CAFE", priceRange: "Rp 18.000 - Rp 30.000", lat: -7.459, lng: 112.718, distanceMeters: 95, c6Score: 0.90, status: "ACTIVE" },
  { id: "COMP-004", name: "Warkop Cak Gundul (Tradisional)", brand: "Independent Warkop", zoneId: "ZON-SDA-05", zoneName: "Pasar Larangan & Stasiun", type: "TRADITIONAL_WARKOP", priceRange: "Rp 4.000 - Rp 8.000", lat: -7.468, lng: 112.711, distanceMeters: 50, c6Score: 0.40, status: "ACTIVE" },
  { id: "COMP-005", name: "Tomoro Coffee Sidoarjo Kota", brand: "Tomoro Coffee", zoneId: "ZON-SDA-01", zoneName: "Alun-Alun Sidoarjo", type: "CHAIN_CAFE", priceRange: "Rp 15.000 - Rp 28.000", lat: -7.4505, lng: 112.7135, distanceMeters: 180, c6Score: 0.78, status: "ACTIVE" },
];

export const MOCK_POI_CATEGORIES = [
  { id: "CAT-01", name: "Perkantoran & BUMN", code: "OFFICE", baseScore: 90, peakHour: "08:00 - 10:00 & 12:00 - 13:00", description: "Potensi pesanan coffee delivery pagi & jam makan siang" },
  { id: "CAT-02", name: "Pendidikan & Kampus", code: "CAMPUS", baseScore: 85, peakHour: "09:00 - 15:00", description: "Segmentasi mahasiswa & pelajar dengan volume tinggi" },
  { id: "CAT-03", name: "Kesehatan & Rumah Sakit", code: "HOSPITAL", baseScore: 80, peakHour: "07:00 - 14:00", description: "Kebutuhan kafein tenaga medis dan penunggu pasien" },
  { id: "CAT-04", name: "Pusat Keramaian & Taman Publik", code: "PUBLIC_PARK", baseScore: 95, peakHour: "06:00 - 09:00 & 16:00 - 19:00", description: "Traffic olahraga pagi dan rekreasi sore/malam" },
  { id: "CAT-05", name: "Transportasi & Transit (Stasiun/Terminal)", code: "TRANSIT", baseScore: 88, peakHour: "06:30 - 09:00 & 16:30 - 19:30", description: "Arus commuter harian butuh grab-and-go instan" },
  { id: "CAT-06", name: "Kawasan Industri & Pergudangan", code: "INDUSTRIAL", baseScore: 70, peakHour: "11:30 - 13:00", description: "Istirahat pergantian shift pekerja pabrik" },
];

export const MOCK_CRON_JOBS = [
  { id: "JOB-01", name: "Open-Meteo Weather Sync", schedule: "0 */1 * * *", lastRun: "10 Sep 2026, 21:00 WIB", nextRun: "10 Sep 2026, 22:00 WIB", status: "SUCCESS", duration: "1.2s", target: "C4 Criteria Dynamic Cache" },
  { id: "JOB-02", name: "OSM Overpass POI Ingestion", schedule: "0 2 * * 0", lastRun: "07 Sep 2026, 02:00 WIB", nextRun: "14 Sep 2026, 02:00 WIB", status: "SUCCESS", duration: "14.8s", target: "C1 & C2 Zone Spatial Index" },
  { id: "JOB-03", name: "Morning Shift Auto-Distribution (TOPSIS)", schedule: "0 6 * * *", lastRun: "10 Sep 2026, 06:00 WIB", nextRun: "11 Sep 2026, 06:00 WIB", status: "SUCCESS", duration: "340ms", target: "Zone Assignment & Rider Allocation" },
  { id: "JOB-04", name: "Afternoon Shift Redistribution", schedule: "0 14 * * *", lastRun: "10 Sep 2026, 14:00 WIB", nextRun: "11 Sep 2026, 14:00 WIB", status: "SUCCESS", duration: "290ms", target: "Zone Assignment Shift 2" },
  { id: "JOB-05", name: "Geofence Compliance Audit Stream", schedule: "*/5 * * * *", lastRun: "10 Sep 2026, 21:45 WIB", nextRun: "10 Sep 2026, 21:50 WIB", status: "RUNNING", duration: "68ms", target: "Rider Telemetry Alerts" },
  { id: "JOB-06", name: "Hourly Snapshot & Analytics Archive", schedule: "0 * * * *", lastRun: "10 Sep 2026, 21:00 WIB", nextRun: "10 Sep 2026, 22:00 WIB", status: "SUCCESS", duration: "850ms", target: "DSS Flashback Engine" },
];

export const MOCK_SETTINGS = {
  hubCoordinates: {
    lat: -7.4478,
    lng: 112.7183,
    address: "Jl. Pahlawan No. 42, Sidokumpul, Kec. Sidoarjo, Kabupaten Sidoarjo, Jawa Timur 61212",
  },
  geofenceRadiusDefault: 300,
  deviationThresholdMeters: 100,
  gpsPingIntervalSec: 15,
  bwmConsistencyThreshold: 0.10,
  topsisMinThreshold: 0.40,
  autoDistributeEnabled: true,
  weatherSyncIntervalMinutes: 60,
  overpassSyncRadiusKm: 5.0,
};

export const MOCK_REPORTS_SUMMARY = {
  operational: {
    totalShifts: 342,
    avgComplianceRate: "91.4%",
    avgDistancePerRiderKm: 14.8,
    totalDeviations: 18,
    avgResponseTimeMinutes: 4.2,
  },
  dss: {
    totalRankingsGenerated: 720,
    topZoneStabilityPct: "89.2%",
    avgBwmXi: 0.042,
    accuracyVsSalesCorr: "+0.84",
  },
  sales: {
    grossRevenue: "Rp 74.850.000",
    totalCupsSold: 4990,
    avgCupPerRiderDay: 41.5,
    topSellingZone: "Alun-Alun Sidoarjo (38%)",
    topSellingProduct: "Kopi Susu Sejuta Jiwa (54%)",
  },
};

