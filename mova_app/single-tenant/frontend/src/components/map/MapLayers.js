import L from "leaflet";

/**
 * Creates custom styled Leaflet DivIcons for Map Operations
 */

// Custom Rider Map Pin (Realistic Circular Photo Avatar with Colored Status Ring)
export function createRiderMarkerIcon(rider = {}) {
  const status = String(rider.status || "ON_TIME").toUpperCase();
  
  // Status Ring Logic:
  // Green: Active / Selling
  // Yellow: Moving / Transit / Idle
  // Red: Deviation / Danger / Offline
  let statusColor = "#10B981"; // Green default (Aktif / Jualan)
  let ringLabel = "Aktif";

  if (status.includes("DEVIATION") || status.includes("DANGER") || status.includes("OFFLINE")) {
    statusColor = "#EF4444"; // Red
    ringLabel = "Deviasi / Bahaya";
  } else if (status.includes("MOVING") || status.includes("TRANSIT") || status.includes("LATE") || status.includes("IDLE")) {
    statusColor = "#F59E0B"; // Yellow / Amber
    ringLabel = "Perjalanan";
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

// Custom POI Map Pin
export function createPoiMarkerIcon(poi = {}) {
  const cat = String(poi.category || poi.tipe || "general").toLowerCase();

  let bgColor = "#3B82F6";
  let symbol = "📍";

  if (cat.includes("kantor") || cat.includes("office")) {
    bgColor = "#2563EB";
    symbol = "🏢";
  } else if (cat.includes("sekolah") || cat.includes("school") || cat.includes("kampus")) {
    bgColor = "#8B5CF6";
    symbol = "🎓";
  } else if (cat.includes("rs") || cat.includes("hospital") || cat.includes("klinik")) {
    bgColor = "#EF4444";
    symbol = "🏥";
  } else if (cat.includes("mall") || cat.includes("pasar") || cat.includes("market")) {
    bgColor = "#F59E0B";
    symbol = "🛍️";
  } else if (cat.includes("taman") || cat.includes("park") || cat.includes("kuliner")) {
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

// Custom Candidate Selling Spot Marker
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

// Custom Armada Cart Pin
export function createArmadaMarkerIcon(armada = {}) {
  return L.divIcon({
    className: "mova-armada-pin-custom",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="width: 38px; height: 38px; border-radius: 8px; background: #FFFFFF; border: 2px solid #2563EB; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; padding: 2px;">
          <img src="/assets/armada/gerobak-default.svg" alt="Gerobak" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #2563EB; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [38, 44],
    iconAnchor: [19, 44],
  });
}
