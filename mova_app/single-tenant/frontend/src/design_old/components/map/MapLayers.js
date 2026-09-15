import L from "leaflet";

/**
 * Creates custom styled Leaflet DivIcons and datasets for Map Operations
 */

// 1. Custom Central Hub Marker Icon
export function createHubMarkerIcon(hubName = "Central Hub Sidoarjo") {
  return L.divIcon({
    className: "mova-hub-marker-pin",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <!-- Pulsing Aura Ring -->
        <div style="position: absolute; top: 0; width: 44px; height: 44px; border-radius: 50%; background: #2563EB; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- Hub Icon Box with Badge -->
        <div style="width: 40px; height: 40px; border-radius: 12px; background: #0F172A; border: 2.5px solid #3B82F6; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45); position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; color: #FFFFFF;">
          <span style="font-size: 18px;">🏢</span>
        </div>

        <!-- Mini Title Label -->
        <div style="position: absolute; top: -14px; background: #2563EB; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 6px; border: 1px solid #FFFFFF; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25); z-index: 3;">
          HUB PUSAT
        </div>
        
        <!-- Triangle Pointer -->
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #0F172A; margin-top: -1px; z-index: 1;"></div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
  });
}

// 2. Custom Rider Map Pin (Realistic Circular Photo Avatar with Colored Status Ring)
export function createRiderMarkerIcon(rider = {}) {
  const status = String(rider.status || "ON_TIME").toUpperCase();

  let statusColor = "#10B981"; // Green default (Aktif / Jualan)
  if (status.includes("DEVIATION") || status.includes("DANGER") || status.includes("OFFLINE")) {
    statusColor = "#EF4444"; // Red
  } else if (status.includes("MOVING") || status.includes("TRANSIT") || status.includes("LATE") || status.includes("IDLE")) {
    statusColor = "#F59E0B"; // Yellow / Amber
  }

  const name = rider.name || rider.full_name || "Rider";
  const initial = name.charAt(0).toUpperCase();
  const avatarUrl = rider.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=fff&bold=true`;

  return L.divIcon({
    className: "mova-rider-avatar-pin",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <!-- Pulsing Aura for active / warning riders -->
        <div style="position: absolute; top: 0; width: 40px; height: 40px; border-radius: 50%; background: ${statusColor}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- Avatar Container with Solid Ring -->
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #0F172A; border: 3px solid ${statusColor}; box-shadow: 0 4px 14px rgba(0,0,0,0.35); position: relative; z-index: 2; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <img src="${avatarUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
          <div style="display: none; width: 100%; height: 100%; background: #0F172A; color: #FFFFFF; font-weight: 800; font-size: 13px; font-family: 'Inter', sans-serif; align-items: center; justify-content: center;">
            ${initial}
          </div>
        </div>

        <!-- Small Status Indicator Dot on corner -->
        <div style="position: absolute; top: 1px; right: 1px; z-index: 3; width: 10px; height: 10px; border-radius: 50%; background: ${statusColor}; border: 2px solid #FFFFFF;"></div>
        
        <!-- Triangle Pointer -->
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${statusColor}; margin-top: -1px; z-index: 1;"></div>
      </div>
    `,
    iconSize: [40, 46],
    iconAnchor: [20, 46],
  });
}

// 3. Custom Competitor Map Pin
export function createCompetitorMarkerIcon(competitor = {}) {
  const brand = (competitor.brand || competitor.name || "").toLowerCase();
  let brandColor = "#DC2626"; // Red default
  let brandBadge = "☕";

  if (brand.includes("kenangan")) {
    brandColor = "#9333EA"; // Purple
  } else if (brand.includes("tomoro")) {
    brandColor = "#EA580C"; // Orange
  } else if (brand.includes("point")) {
    brandColor = "#059669"; // Emerald
  } else if (brand.includes("janji")) {
    brandColor = "#2563EB"; // Blue
  } else if (brand.includes("warkop")) {
    brandColor = "#78716C"; // Stone / Brown
  }

  return L.divIcon({
    className: "mova-competitor-pin",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="width: 30px; height: 30px; border-radius: 8px; background: ${brandColor}; border: 2px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 13px;">
          ${brandBadge}
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${brandColor}; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [30, 36],
    iconAnchor: [15, 36],
  });
}

// 4. Custom POI Hotspot Marker Pin (Time-Based Peak Crowd Predictor)
export function createHotspotMarkerIcon(hotspot = {}) {
  const crowdLevel = hotspot.crowdLevel || "HIGH";
  const score = hotspot.crowdScore || hotspot.score || 92;
  const isHigh = crowdLevel === "HIGH" || score >= 80;

  const bgGrad = isHigh
    ? "linear-gradient(135deg, #EF4444 0%, #F97316 100%)"
    : "linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)";

  return L.divIcon({
    className: "mova-hotspot-pin",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <!-- Pulsing heat wave -->
        <div style="position: absolute; top: 0; width: 36px; height: 36px; border-radius: 50%; background: #EF4444; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>

        <!-- Hotspot badge -->
        <div style="padding: 3px 7px; background: ${bgGrad}; border: 2px solid #FFFFFF; border-radius: 12px; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 3px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45); z-index: 2;">
          <span>🔥</span>
          <span>${hotspot.peakTime || "Peak"}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #EF4444; margin-top: -1px; z-index: 1;"></div>
      </div>
    `,
    iconSize: [60, 32],
    iconAnchor: [30, 32],
  });
}

// 5. Custom POI Map Pin
export function createPoiMarkerIcon(poi = {}) {
  const cat = String(poi.category || poi.tipe || "general").toLowerCase();

  let bgColor = "#3B82F6";
  let symbol = "📍";

  if (cat.includes("kantor") || cat.includes("office") || cat.includes("bpn") || cat.includes("pemerintah")) {
    bgColor = "#2563EB";
    symbol = "🏢";
  } else if (cat.includes("sekolah") || cat.includes("school") || cat.includes("sma") || cat.includes("kampus") || cat.includes("pendidikan")) {
    bgColor = "#8B5CF6";
    symbol = "🎓";
  } else if (cat.includes("rs") || cat.includes("hospital") || cat.includes("klinik") || cat.includes("hajar")) {
    bgColor = "#EF4444";
    symbol = "🏥";
  } else if (cat.includes("mall") || cat.includes("pasar") || cat.includes("market") || cat.includes("indomaret") || cat.includes("plaza")) {
    bgColor = "#F59E0B";
    symbol = "🛍️";
  } else if (cat.includes("taman") || cat.includes("park") || cat.includes("kuliner") || cat.includes("warung")) {
    bgColor = "#10B981";
    symbol = "🌳";
  }

  return L.divIcon({
    className: "mova-poi-pin-custom",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: ${bgColor}; border: 2px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center;">
          <span style="transform: rotate(45deg); font-size: 13px; line-height: 1;">${symbol}</span>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

// 6. Custom Candidate Selling Spot Marker
export function createCandidateLocationIcon(spot = {}) {
  const score = spot.score ? spot.score.toFixed(2) : spot.ci_score ? spot.ci_score.toFixed(2) : "0.85";

  return L.divIcon({
    className: "mova-candidate-spot-pin",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="padding: 3px 8px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); border: 2px solid #FFFFFF; border-radius: 12px; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 3px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.45);">
          <span>★</span>
          <span>${score}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #EA580C; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [44, 28],
    iconAnchor: [22, 28],
  });
}

// 7. Spatial Road Polylines Dataset for Sidoarjo
export const TOLL_ROADS_COORDINATES = [
  // Jalan Tol Waru - Sidoarjo - Porong Corridor
  [
    [-7.3600, 112.7240], // Simpang Waru
    [-7.3850, 112.7260], // Tol Gedangan
    [-7.4200, 112.7290], // Tol Buduran
    [-7.4450, 112.7310], // Gerbang Tol Sidoarjo Kota
    [-7.4750, 112.7300], // Tol Candi
    [-7.5100, 112.7260], // Tol Tanggulangin
    [-7.5450, 112.7150], // Tol Porong / Gempol
  ],
];

export const PROTOCOL_ROADS_COORDINATES = [
  // 1. Jl. Ahmad Yani - Jl. Gajah Mada (Arteri Utama Sidoarjo)
  [
    [-7.4250, 112.7180], // Jembatan Layang Waru Selatan
    [-7.4380, 112.7175], // Jl. Raya Buduran
    [-7.4478, 112.7183], // Depan Alun-Alun Sidoarjo (Jl. Ahmad Yani)
    [-7.4580, 112.7160], // Jl. Gajah Mada
    [-7.4700, 112.7140], // Jl. Mojopahit / Larangan
    [-7.4900, 112.7150], // Jl. Raya Candi
  ],
  // 2. Jl. Pahlawan (Koridor Barat - Timur Pusat Kota & GOR Delta)
  [
    [-7.4520, 112.6950], // Akses Tol Sidoarjo
    [-7.4525, 112.7050], // Kawasan Perkantoran Jl. Pahlawan
    [-7.4530, 112.7170], // Pertigaan Alun-Alun & Jl. Pahlawan
    [-7.4550, 112.7250], // Menuju Lingkar Timur
  ],
];

// 8. Mock POI Hotspots with Time-Based Peaks
export const MOCK_POI_HOTSPOTS = [
  {
    id: "HOT-01",
    name: "Kompleks Pendidikan SMAN 1 & SMPN 1 Sidoarjo",
    category: "Pendidikan",
    lat: -7.4535,
    lng: 112.7185,
    peakTime: "07:00",
    crowdLevel: "HIGH",
    crowdScore: 95,
    description: "Prediksi keramaian tinggi jam masuk sekolah (06:30 - 07:30)",
  },
  {
    id: "HOT-02",
    name: "Kawasan Perkantoran Jl. Pahlawan & BPN",
    category: "Perkantoran",
    lat: -7.4515,
    lng: 112.7140,
    peakTime: "12:00",
    crowdLevel: "HIGH",
    crowdScore: 92,
    description: "Prediksi keramaian jam makan siang & istirahat kantor (11:45 - 13:15)",
  },
  {
    id: "HOT-03",
    name: "Pujasera & GOR Delta Sidoarjo",
    category: "Kuliner",
    lat: -7.4610,
    lng: 112.7165,
    peakTime: "16:30",
    crowdLevel: "HIGH",
    crowdScore: 88,
    description: "Prediksi keramaian aktivitas olahraga & kuliner sore (16:00 - 18:30)",
  },
  {
    id: "HOT-04",
    name: "Sentra Pasar Larangan & Stasiun Sidoarjo",
    category: "Transportasi",
    lat: -7.4685,
    lng: 112.7115,
    peakTime: "18:00",
    crowdLevel: "HIGH",
    crowdScore: 90,
    description: "Prediksi keramaian commuter sore pulang kerja (17:30 - 19:30)",
  },
];

