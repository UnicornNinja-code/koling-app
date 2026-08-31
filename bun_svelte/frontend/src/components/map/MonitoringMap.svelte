<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    Search, 
    Layers, 
    Maximize2, 
    Plus, 
    Minus, 
    RefreshCw,
    X,
    ArrowRight,
    Compass,
    Cloud,
    Sun,
    CloudRain,
    Wind,
    Droplets,
    Battery,
    Navigation,
    ShieldAlert,
    ShieldCheck,
    MapPin,
    Radio,
    Sparkles,
    Check,
    ArrowLeft,
    Layers3
  } from 'lucide-svelte';
  import { 
    mapService, 
    type NearbyRider, 
    type ZoneFeature, 
    type POIFeature,
    type HubWeatherOverview,
    type GeocodeResult
  } from '../../services/mapService';
  import { 
    createBasemapLayer, 
    getBasemapProviders 
  } from '../../lib/mapProviders';
  import { getSocket } from '../../lib/socket';
  import RiderDetailDrawer from './RiderDetailDrawer.svelte';
  import BroadcastAlertModal from './BroadcastAlertModal.svelte';

  interface Props {
    onNavigate?: (route: string) => void;
  }

  let { onNavigate }: Props = $props();

  let mapElement: HTMLDivElement;
  let mapInstance: any = null;
  let currentTileLayer: any = null;
  let L: any = null;

  // Layer Group References
  let riderLayerGroup: any = null;
  let zoneLayerGroup: any = null;
  let hubLayerGroup: any = null;
  let protocolRoadLayerGroup: any = null;
  let tollRoadLayerGroup: any = null;
  let poiLayerGroup: any = null;
  let searchPinLayerGroup: any = null;

  // State: Basemap Selection
  let selectedBasemapId = $state('openmaptiles-dark');
  let basemapProviders = $derived(getBasemapProviders());

  // State: Layers Checkboxes
  let layerRiders = $state(true);
  let layerZones = $state(true);
  let layerHub = $state(true);
  let layerProtocolRoads = $state(true);
  let layerTollRoads = $state(true);
  let layerPoi = $state(true);
  let zoneConfig = $state<any>(null);

  // Tabbed Vertical Panel State: Only 1 panel is active at a time (mutually exclusive)
  type ActivePanelType = 'search' | 'layers' | 'riders' | 'weather' | 'legend' | 'basemap' | null;
  let activePanel = $state<ActivePanelType>(null);

  const togglePanel = (panel: ActivePanelType) => {
    if (activePanel === panel) {
      activePanel = null;
    } else {
      activePanel = panel;
    }
  };

  // Filter Mode: All vs Only Currently Crowded POIs vs Category Filter
  let poiFilterCategory = $state<'ALL' | 'PEAK_ONLY' | 'EDUKASI' | 'KANTOR' | 'PASAR' | 'KULINER' | 'TRANSIT' | 'KESEHATAN' | 'IBADAH'>('ALL');

  // Time Slot Selection (Defaults to actual current time, but admin can preview other slots)
  const getAutoSlotKey = (): 'pagi' | 'siang' | 'sore' | 'malam' => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'pagi';
    if (hour >= 11 && hour < 15) return 'siang';
    if (hour >= 15 && hour < 19) return 'sore';
    return 'malam';
  };

  let selectedTimeSlotKey = $state<'pagi' | 'siang' | 'sore' | 'malam'>(getAutoSlotKey());

  const timeSlotDefinitions: Record<'pagi' | 'siang' | 'sore' | 'malam', { name: string; timeRange: string; icon: string; desc: string }> = {
    pagi: { name: 'PAGI', timeRange: '06:00 - 10:59', icon: 'ri-sun-cloudy-line', desc: 'Jam masuk sekolah, kantor, & pasar' },
    siang: { name: 'SIANG', timeRange: '11:00 - 14:59', icon: 'ri-sun-fill', desc: 'Istirahat makan siang & pulang sekolah' },
    sore: { name: 'SORE', timeRange: '15:00 - 18:59', icon: 'ri-sunset-line', desc: 'Rush hour pulang kerja & GOR Delta' },
    malam: { name: 'MALAM', timeRange: '19:00 - 23:59', icon: 'ri-moon-clear-line', desc: 'Hangout kuliner malam & alun-alun' },
  };

  let activeTimeSlot = $derived(timeSlotDefinitions[selectedTimeSlotKey]);

  // C3 Crowd Profile Matrix per Category & Time Slot
  interface CategoryCrowdProfile {
    groupKey: 'EDUKASI' | 'KANTOR' | 'PASAR' | 'KULINER' | 'TRANSIT' | 'KESEHATAN' | 'IBADAH' | 'LAINNYA';
    label: string;
    icon: string;
    color: string;
    scores: Record<'pagi' | 'siang' | 'sore' | 'malam', { score: number; level: 'SANGAT_RAMAI' | 'RAMAI' | 'NORMAL' | 'SEPI'; note: string }>;
  }

  const categoryCrowdProfiles: Record<string, CategoryCrowdProfile> = {
    'EDUKASI': {
      groupKey: 'EDUKASI',
      label: 'Sekolah & Perguruan Tinggi',
      icon: 'ri-graduation-cap-line',
      color: '#3B82F6',
      scores: {
        pagi: { score: 0.96, level: 'SANGAT_RAMAI', note: 'Jam masuk sekolah & mahasiswa pagi' },
        siang: { score: 0.85, level: 'RAMAI', note: 'Jam istirahat & pulang sekolah' },
        sore: { score: 0.25, level: 'NORMAL', note: 'Kegiatan ekstrakurikuler' },
        malam: { score: 0.05, level: 'SEPI', note: 'Kampus / sekolah tutup' },
      },
    },
    'KANTOR': {
      groupKey: 'KANTOR',
      label: 'Perkantoran & Layanan Pemkab',
      icon: 'ri-building-line',
      color: '#8B5CF6',
      scores: {
        pagi: { score: 0.94, level: 'SANGAT_RAMAI', note: 'Jam mulai kantor & dinas warga' },
        siang: { score: 0.80, level: 'RAMAI', note: 'Istirahat siang kantor' },
        sore: { score: 0.92, level: 'SANGAT_RAMAI', note: 'Jam bubaran pulang kantor' },
        malam: { score: 0.08, level: 'SEPI', note: 'Kantor tutup' },
      },
    },
    'PASAR': {
      groupKey: 'PASAR',
      label: 'Pasar Tradisional & Supermarket',
      icon: 'ri-store-2-line',
      color: '#F59E0B',
      scores: {
        pagi: { score: 0.95, level: 'SANGAT_RAMAI', note: 'Puncak belanja bahan pagi warga' },
        siang: { score: 0.65, level: 'NORMAL', note: 'Aktivitas toko normal' },
        sore: { score: 0.88, level: 'SANGAT_RAMAI', note: 'Pasar sore & belanja sepulang kerja' },
        malam: { score: 0.45, level: 'NORMAL', note: 'Minimarket & toko malam' },
      },
    },
    'KULINER': {
      groupKey: 'KULINER',
      label: 'Kafe, Kedai Kopi & Kuliner',
      icon: 'ri-cup-line',
      color: '#10B981',
      scores: {
        pagi: { score: 0.45, level: 'NORMAL', note: 'Sarapan kopi pagi' },
        siang: { score: 0.95, level: 'SANGAT_RAMAI', note: 'Puncak jam makan siang' },
        sore: { score: 0.82, level: 'RAMAI', note: 'Ngopi santai sore' },
        malam: { score: 0.98, level: 'SANGAT_RAMAI', note: 'Prime hangout & nongkrong malam' },
      },
    },
    'TRANSIT': {
      groupKey: 'TRANSIT',
      label: 'Stasiun, SPBU & Halte Transit',
      icon: 'ri-gas-station-line',
      color: '#06B6D4',
      scores: {
        pagi: { score: 0.95, level: 'SANGAT_RAMAI', note: 'Rush hour berangkat stasiun & SPBU' },
        siang: { score: 0.70, level: 'NORMAL', note: 'Pengisian bahan bakar & transit' },
        sore: { score: 0.96, level: 'SANGAT_RAMAI', note: 'Rush hour pulang kereta/bus' },
        malam: { score: 0.60, level: 'NORMAL', note: 'Perjalanan antar kota malam' },
      },
    },
    'KESEHATAN': {
      groupKey: 'KESEHATAN',
      label: 'Rumah Sakit, Apotek & Klinik',
      icon: 'ri-hospital-line',
      color: '#EC4899',
      scores: {
        pagi: { score: 0.88, level: 'RAMAI', note: 'Pendaftaran rawat jalan & poliklinik' },
        siang: { score: 0.75, level: 'NORMAL', note: 'Layanan medis siang' },
        sore: { score: 0.80, level: 'RAMAI', note: 'Jam jenguk pasien' },
        malam: { score: 0.40, level: 'NORMAL', note: 'Instalasi Gawat Darurat (IGD)' },
      },
    },
    'IBADAH': {
      groupKey: 'IBADAH',
      label: 'Masjid, Taman & Fasilitas Publik',
      icon: 'ri-community-line',
      color: '#14B8A6',
      scores: {
        pagi: { score: 0.85, level: 'RAMAI', note: 'Sholat Subuh & jogging pagi GOR Delta' },
        siang: { score: 0.88, level: 'RAMAI', note: 'Sholat Dhuhur berjamaah' },
        sore: { score: 0.94, level: 'SANGAT_RAMAI', note: 'Sholat Ashar & rekreasi taman' },
        malam: { score: 0.86, level: 'RAMAI', note: 'Sholat Isya & alun-alun malam' },
      },
    },
  };

  // Helper to categorize raw POI strings from DB
  function mapPoiToGroup(category: string): 'EDUKASI' | 'KANTOR' | 'PASAR' | 'KULINER' | 'TRANSIT' | 'KESEHATAN' | 'IBADAH' | 'LAINNYA' {
    const c = (category || '').toLowerCase();
    if (c.includes('sekolah') || c.includes('perguruan') || c.includes('paud') || c.includes('sd') || c.includes('smp') || c.includes('sma')) return 'EDUKASI';
    if (c.includes('pemerintahan') || c.includes('perkantoran') || c.includes('bank') || c.includes('atm') || c.includes('logistik')) return 'KANTOR';
    if (c.includes('pasar') || c.includes('minimarket') || c.includes('supermarket') || c.includes('mall') || c.includes('retail') || c.includes('toko')) return 'PASAR';
    if (c.includes('kafe') || c.includes('kopi') || c.includes('food') || c.includes('restoran') || c.includes('cepat saji') || c.includes('roti') || c.includes('minuman')) return 'KULINER';
    if (c.includes('spbu') || c.includes('stasiun') || c.includes('halte') || c.includes('transit') || c.includes('parkir') || c.includes('bengkel')) return 'TRANSIT';
    if (c.includes('rumah sakit') || c.includes('apotek') || c.includes('klinik') || c.includes('puskesmas')) return 'KESEHATAN';
    if (c.includes('masjid') || c.includes('mushola') || c.includes('gereja') || c.includes('pura') || c.includes('taman') || c.includes('olahraga') || c.includes('balai') || c.includes('ibadah')) return 'IBADAH';
    return 'PASAR';
  }

  // State: Real Data from Backend
  let realZones = $state<ZoneFeature[]>([]);
  let activeRiders = $state<NearbyRider[]>([]);
  let protocolRoadsGeoJson = $state<any>(null);
  let tollRoadsGeoJson = $state<any>(null);
  let realPois = $state<POIFeature[]>([]);
  let weatherData = $state<HubWeatherOverview | null>(null);

  // Search & Geocoding State
  let searchQuery = $state('');
  let searchResults = $state<Array<{
    type: 'ZONE' | 'ROAD' | 'POI' | 'GEOCODE';
    title: string;
    subtitle: string;
    badge: string;
    color: string;
    lat: number;
    lng: number;
    rawData?: any;
  }>>([]);
  let isSearching = $state(false);
  let activePinnedLocation = $state<{ title: string; lat: number; lng: number } | null>(null);

  // Rider Panel Filtering
  let riderSearchQuery = $state('');
  let filteredRiders = $derived(
    activeRiders.filter(r => {
      if (!riderSearchQuery.trim()) return true;
      const q = riderSearchQuery.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.plateNumber?.toLowerCase().includes(q) ||
        r.zoneName?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
      );
    })
  );

  // Modal / Drawer states
  let selectedRider = $state<NearbyRider | null>(null);
  let drawerOpen = $state(false);
  let broadcastModalOpen = $state(false);
  let loading = $state(true);
  let syncingWeather = $state(false);

  function parsePolygonToLatLngs(polygon: any): [number, number][] {
    if (!polygon) return [];
    try {
      const parsed = typeof polygon === 'string' ? JSON.parse(polygon) : polygon;
      const ring = parsed.coordinates?.[0] || parsed.coordinates || [];
      return ring.map((pt: [number, number]) => [Number(pt[1]), Number(pt[0])]);
    } catch {
      return [];
    }
  }

  const switchBasemap = (providerId: string) => {
    if (!mapInstance || !L) return;
    selectedBasemapId = providerId;

    if (currentTileLayer) {
      mapInstance.removeLayer(currentTileLayer);
    }

    const { layer } = createBasemapLayer(L, providerId);
    currentTileLayer = layer;
    currentTileLayer.addTo(mapInstance);
    currentTileLayer.bringToBack();
  };

  const initMap = async () => {
    if (typeof window === 'undefined' || !mapElement) return;

    L = (await import('leaflet')).default;

    mapInstance = L.map(mapElement, {
      zoomControl: false,
      attributionControl: false,
    }).setView([-7.4450, 112.7150], 13);

    const { layer } = createBasemapLayer(L, selectedBasemapId);
    currentTileLayer = layer;
    currentTileLayer.addTo(mapInstance);

    // Initialize Layer Groups in correct z-order
    zoneLayerGroup = L.layerGroup().addTo(mapInstance);
    hubLayerGroup = L.layerGroup().addTo(mapInstance);
    protocolRoadLayerGroup = L.layerGroup().addTo(mapInstance);
    tollRoadLayerGroup = L.layerGroup().addTo(mapInstance);
    poiLayerGroup = L.layerGroup().addTo(mapInstance);
    searchPinLayerGroup = L.layerGroup().addTo(mapInstance);
    riderLayerGroup = L.layerGroup().addTo(mapInstance);

    await loadAllSpatialData();
    await fetchWeatherData();
    renderHub();

    // Socket.IO live updates
    const socket = getSocket();
    socket.on('rider:location_updated', (data: any) => {
      if (data && data.riderId) {
        updateRiderPosition(data);
      }
    });
  };

  const renderZones = () => {
    if (!zoneLayerGroup || !L) return;
    zoneLayerGroup.clearLayers();

    if (!layerZones) return;

    realZones.forEach((z) => {
      const latLngs = parsePolygonToLatLngs(z.polygon);
      if (latLngs.length > 0) {
        const isActive = z.status === 'ACTIVE';
        const polygon = L.polygon(latLngs, {
          color: isActive ? '#FF634A' : '#71717A',
          fillColor: isActive ? '#FF634A' : '#71717A',
          fillOpacity: isActive ? 0.22 : 0.1,
          weight: 2.5,
        }).addTo(zoneLayerGroup);

        polygon.bindPopup(`
          <div style="font-family: Outfit, sans-serif; min-width: 170px;">
            <div style="font-weight: 700; color: #FF634A; font-size: 13px; margin-bottom: 2px;">${z.name}</div>
            <div style="font-size: 11px; color: #71717A; margin-bottom: 6px;">Kode: ${z.code || '-'}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; border-top: 1px solid #E4E4E7; padding-top: 4px;">
              <span>Kapasitas:</span>
              <strong style="color: #18181B;">${z.current_riders || 0} / ${z.max_capacity} Unit</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
              <span>Status:</span>
              <span style="font-weight: 700; color: ${isActive ? '#10B981' : '#EF4444'};">${z.status}</span>
            </div>
          </div>
        `);

        // Centroid Label
        const centerLat = latLngs.reduce((sum, p) => sum + p[0], 0) / latLngs.length;
        const centerLng = latLngs.reduce((sum, p) => sum + p[1], 0) / latLngs.length;

        const labelIcon = L.divIcon({
          html: `
            <div class="px-2.5 py-1 rounded-xl bg-[#131316]/90 backdrop-blur-md border border-[#2E2E38] shadow-lg text-[10px] font-outfit-600 text-white whitespace-nowrap">
              ${z.name}
            </div>
          `,
          className: 'zone-centroid-label',
          iconAnchor: [40, 12],
        });

        L.marker([centerLat, centerLng], { icon: labelIcon }).addTo(zoneLayerGroup);
      }
    });
  };

  const renderHub = () => {
    if (!hubLayerGroup || !L) return;
    hubLayerGroup.clearLayers();

    if (!layerHub || !zoneConfig) return;

    const hubLat = zoneConfig.hub_latitude || -7.397402;
    const hubLng = zoneConfig.hub_longitude || 112.711958;
    const hubName = zoneConfig.hub_city_name || 'Sidoarjo';

    // 1. Buffer Coverage Circle (12km radius operasional)
    L.circle([hubLat, hubLng], {
      radius: 12000,
      color: '#FF634A',
      fillColor: '#FF634A',
      fillOpacity: 0.04,
      weight: 1.5,
      dashArray: '6, 6',
    }).addTo(hubLayerGroup);

    // 2. Radiant Beacon Pin Icon
    const hubIconHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; width: 36px; height: 36px;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 99, 74, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #FF634A, #FF8573); border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(255, 99, 74, 0.95); z-index: 10;">
          <span style="font-size: 13px; font-weight: bold; color: #09090B;">🏢</span>
        </div>
        <span style="position: absolute; top: -20px; background: #131316; color: #FF634A; font-size: 9px; font-family: Outfit, sans-serif; font-weight: 800; padding: 1px 6px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5); border: 1px solid #FF634A;">
          HUB ${hubName.toUpperCase()}
        </span>
      </div>
    `;

    const hubIcon = L.divIcon({
      html: hubIconHtml,
      className: 'custom-central-hub-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const w = weatherData?.hub_overview;
    const marker = L.marker([hubLat, hubLng], { icon: hubIcon });
    marker.bindPopup(`
      <div style="font-family: Outfit, sans-serif; min-width: 230px; color: #18181B;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E4E4E7; padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="font-size: 12px; color: #FF634A;">🏢 CENTRAL HUB ${hubName.toUpperCase()}</strong>
          <span style="font-size: 9px; background: #ECFDF5; color: #059669; font-weight: 700; padding: 2px 6px; border-radius: 9999px;">PUSAT</span>
        </div>
        <div style="font-size: 11px; color: #71717A; margin-bottom: 6px;">
          Gudang Utama & Pusat Plotting Gerobak
        </div>
        <div style="background: #F4F4F5; border-radius: 8px; padding: 6px; font-size: 10px; line-height: 1.5; color: #27272A;">
          <div>🌡️ Suhu: <strong>${w?.avg_temperature_c ?? 30.5}°C</strong> (Terasa: <strong>${(w as any)?.apparent_temperature_c ?? 32}°C</strong>)</div>
          <div>💧 Kelembaban: <strong>${(w as any)?.relative_humidity_2m ?? 65}%</strong> | Titik Embun: <strong>${(w as any)?.dew_point_2m ?? 23.4}°C</strong></div>
          <div>🌧️ Peluang Hujan (C4): <strong>${w?.max_rain_probability_percent ?? 0}%</strong> | Curah: <strong>${(w as any)?.precipitation_rain_mm ?? 0} mm</strong></div>
          <div>☁️ Kondisi: <strong>${w?.weather_condition ?? 'Cerah Berawan'}</strong> (WMO ${w?.weather_code ?? 2})</div>
        </div>
        <div style="font-size: 9px; color: #A1A1AA; margin-top: 4px; text-align: right;">
          Koordinat: ${Number(hubLat).toFixed(4)}, ${Number(hubLng).toFixed(4)}
        </div>
      </div>
    `);
    marker.addTo(hubLayerGroup);
  };

  const renderProtocolRoads = () => {
    if (!protocolRoadLayerGroup || !L) return;
    protocolRoadLayerGroup.clearLayers();

    if (!layerProtocolRoads || !protocolRoadsGeoJson) return;

    try {
      L.geoJSON(protocolRoadsGeoJson, {
        style: {
          color: '#F59E0B',
          weight: 3.5,
          dashArray: '6, 6',
          opacity: 0.85,
        },
        onEachFeature: (feature: any, layer: any) => {
          const name = feature.properties?.name || 'Jalan Protokol Utama';
          layer.bindPopup(`
            <div style="font-family: Outfit, sans-serif;">
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: #FEF3C7; color: #D97706; font-size: 10px; font-weight: 700;">JALAN PROTOKOL (TERLARANG)</span>
              <div style="font-weight: 700; font-size: 12px; margin-top: 4px; color: #18181B;">${name}</div>
              <div style="font-size: 10px; color: #71717A; margin-top: 2px;">Dilarang berjualan / mangkal kopi keliling di koridor ini.</div>
            </div>
          `);
        },
      }).addTo(protocolRoadLayerGroup);
    } catch (e) {
      console.warn('Gagal render layer jalan protokol:', e);
    }
  };

  const renderTollRoads = () => {
    if (!tollRoadLayerGroup || !L) return;
    tollRoadLayerGroup.clearLayers();

    if (!layerTollRoads || !tollRoadsGeoJson) return;

    try {
      L.geoJSON(tollRoadsGeoJson, {
        style: {
          color: '#EF4444',
          weight: 4.5,
          opacity: 0.9,
        },
        onEachFeature: (feature: any, layer: any) => {
          const name = feature.properties?.name || 'Jalan Tol';
          layer.bindPopup(`
            <div style="font-family: Outfit, sans-serif;">
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: #FEE2E2; color: #DC2626; font-size: 10px; font-weight: 700;">JALAN TOL (AREA MERAH)</span>
              <div style="font-weight: 700; font-size: 12px; margin-top: 4px; color: #18181B;">${name}</div>
              <div style="font-size: 10px; color: #71717A; margin-top: 2px;">Jalan tol dilarang total untuk operasional gerobak kopi keliling.</div>
            </div>
          `);
        },
      }).addTo(tollRoadLayerGroup);
    } catch (e) {
      console.warn('Gagal render layer jalan tol:', e);
    }
  };

  const renderPois = () => {
    if (!poiLayerGroup || !L) return;
    poiLayerGroup.clearLayers();

    if (!layerPoi) return;

    const visiblePois = realPois.filter(p => {
      const groupKey = mapPoiToGroup(p.category);
      const profile = categoryCrowdProfiles[groupKey];
      const slotEval = profile ? profile.scores[selectedTimeSlotKey] : { score: 0.5, level: 'NORMAL' };
      const isPeak = slotEval.level === 'SANGAT_RAMAI';

      if (poiFilterCategory === 'PEAK_ONLY' && !isPeak) return false;
      if (poiFilterCategory !== 'ALL' && poiFilterCategory !== 'PEAK_ONLY' && groupKey !== poiFilterCategory) return false;

      return true;
    });

    // Render up to 250 POIs
    visiblePois.slice(0, 250).forEach((poi) => {
      const groupKey = mapPoiToGroup(poi.category);
      const profile = categoryCrowdProfiles[groupKey] || categoryCrowdProfiles['PASAR'];
      const slotEval = profile.scores[selectedTimeSlotKey];
      const isPeak = slotEval.level === 'SANGAT_RAMAI';
      const isRamai = slotEval.level === 'RAMAI';

      let markerHtml = '';
      if (isPeak) {
        markerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: ${profile.color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: ${profile.color}; width: 11px; height: 11px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 10px ${profile.color}; z-index: 2;"></div>
          </div>
        `;
      } else if (isRamai) {
        markerHtml = `
          <div style="display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="background-color: ${profile.color}; width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid #FFFFFF; box-shadow: 0 0 4px ${profile.color};"></div>
          </div>
        `;
      } else {
        markerHtml = `
          <div style="display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.65;">
            <div style="background-color: ${profile.color}; width: 6px; height: 6px; border-radius: 50%; border: 1px solid #FFFFFF;"></div>
          </div>
        `;
      }

      const poiIcon = L.divIcon({
        html: markerHtml,
        className: 'poi-c3-dot-marker',
        iconSize: [isPeak ? 22 : 10, isPeak ? 22 : 10],
        iconAnchor: [isPeak ? 11 : 5, isPeak ? 11 : 5],
      });

      L.marker([poi.latitude, poi.longitude], { icon: poiIcon })
        .bindPopup(`
          <div style="font-family: Outfit, sans-serif; min-width: 190px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
              <span style="font-size: 9px; font-weight: 700; color: ${profile.color}; text-transform: uppercase;">${profile.label}</span>
              <span style="font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 4px; background: ${isPeak ? '#DC2626' : isRamai ? '#D97706' : '#71717A'}; color: #FFFFFF;">
                ${isPeak ? '🔥 SANGAT RAMAI' : isRamai ? '⚡ RAMAI' : '☕ NORMAL'}
              </span>
            </div>
            <strong style="font-size: 12px; color: #18181B; display: block; margin-bottom: 2px;">${poi.name}</strong>
            <span style="font-size: 10px; color: #71717A;">Kategori: ${poi.category}</span>
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #E4E4E7; font-size: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span>Evaluasi C3 Waktu (${activeTimeSlot.name}):</span>
                <strong style="color: ${profile.color}; font-size: 11px;">Skor ${slotEval.score.toFixed(2)}</strong>
              </div>
              <p style="font-size: 9px; color: #52525B; margin: 0; line-height: 1.3;">${slotEval.note}</p>
            </div>
          </div>
        `)
        .addTo(poiLayerGroup);
    });
  };

  const renderRiders = (riders: NearbyRider[]) => {
    if (!riderLayerGroup || !L) return;
    riderLayerGroup.clearLayers();

    if (!layerRiders) return;

    riders.forEach((r) => {
      const isBreach = r.status === 'BREACH';
      const markerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${isBreach ? '#EF4444' : '#10B981'}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background-color: ${isBreach ? '#EF4444' : '#10B981'}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 2px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 3;">
            <i class="ri-motorbike-line" style="font-size: 12px; color: #FFFFFF;"></i>
          </div>
          <span style="position: absolute; top: -19px; background: #131316; color: #FFFFFF; font-size: 9px; font-family: Outfit, sans-serif; font-weight: 700; padding: 1px 6px; border-radius: 6px; white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,0.35); border: 1px solid #2E2E38;">
            ${r.name ? r.name.split(' ')[0] : 'Rider'}
          </span>
        </div>
      `;

      const riderIcon = L.divIcon({
        html: markerHtml,
        className: 'rider-live-marker',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([r.latitude, r.longitude], { icon: riderIcon });
      marker.on('click', () => {
        focusRider(r);
      });
      marker.addTo(riderLayerGroup);
    });
  };

  const updateRiderPosition = (data: NearbyRider) => {
    const idx = activeRiders.findIndex((r) => r.riderId === data.riderId);
    if (idx !== -1) {
      activeRiders[idx] = { ...activeRiders[idx], ...data };
    } else {
      activeRiders = [...activeRiders, data];
    }
    renderRiders(activeRiders);
  };

  const loadAllSpatialData = async () => {
    loading = true;
    try {
      const [zonesRes, ridersRes, protoRoadsRes, tollRoadsRes, poisRes, configRes] = await Promise.all([
        mapService.getAllZones(),
        mapService.getNearbyRiders(-7.4450, 112.7150, 50000),
        mapService.getProtocolRoads(),
        mapService.getTollRoads(),
        mapService.getPOIs(),
        mapService.getZoneConfig(),
      ]);

      realZones = zonesRes;
      activeRiders = ridersRes;
      protocolRoadsGeoJson = protoRoadsRes;
      tollRoadsGeoJson = tollRoadsRes;
      realPois = poisRes;
      zoneConfig = configRes;

      renderZones();
      renderHub();
      renderProtocolRoads();
      renderTollRoads();
      renderPois();
      renderRiders(activeRiders);
    } catch (err) {
      console.error('💥 Gagal memuat data spasial monitoring:', err);
    } finally {
      loading = false;
    }
  };

  const fetchWeatherData = async () => {
    try {
      const wRes = await mapService.getHubWeather('sidoarjo');
      if (wRes) {
        weatherData = wRes;
      }
    } catch (err) {
      console.warn('Gagal memuat info cuaca Sidoarjo:', err);
    }
  };

  const handleSyncWeather = async () => {
    syncingWeather = true;
    try {
      await mapService.syncWeather();
      await fetchWeatherData();
    } catch (e) {
      console.error('Gagal sync cuaca:', e);
    } finally {
      syncingWeather = false;
    }
  };

  // Focus and FlyTo Rider
  const focusRider = (rider: NearbyRider) => {
    if (!mapInstance || !L) return;
    mapInstance.flyTo([rider.latitude, rider.longitude], 16, { duration: 1.2 });
    selectedRider = rider;
    drawerOpen = true;
  };

  // Perform Location & Object Search
  const handlePerformSearch = async () => {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }

    isSearching = true;
    const q = searchQuery.toLowerCase().trim();
    const results: typeof searchResults = [];

    // 1. Check Zones
    realZones.forEach(z => {
      if (z.name.toLowerCase().includes(q) || (z.code && z.code.toLowerCase().includes(q))) {
        const latLngs = parsePolygonToLatLngs(z.polygon);
        if (latLngs.length > 0) {
          const centerLat = latLngs.reduce((sum, p) => sum + p[0], 0) / latLngs.length;
          const centerLng = latLngs.reduce((sum, p) => sum + p[1], 0) / latLngs.length;
          results.push({
            type: 'ZONE',
            title: z.name,
            subtitle: `Zona Operasional (Kode: ${z.code || '-'}) • Kapasitas ${z.max_capacity} unit`,
            badge: 'Zona',
            color: '#FF634A',
            lat: centerLat,
            lng: centerLng,
            rawData: z,
          });
        }
      }
    });

    // 2. Check Protocol Roads
    if (protocolRoadsGeoJson?.features) {
      protocolRoadsGeoJson.features.forEach((feat: any) => {
        const name = feat.properties?.name || '';
        if (name.toLowerCase().includes(q)) {
          const coords = feat.geometry?.coordinates || [];
          const firstCoord = Array.isArray(coords[0]) ? coords[0] : coords;
          const [lng, lat] = Array.isArray(firstCoord[0]) ? firstCoord[0] : firstCoord;
          if (lat && lng) {
            results.push({
              type: 'ROAD',
              title: name,
              subtitle: 'Jalan Protokol Sidoarjo (Terlarang untuk Kopi Keliling)',
              badge: 'Jalan Protokol',
              color: '#F59E0B',
              lat: Number(lat),
              lng: Number(lng),
              rawData: feat,
            });
          }
        }
      });
    }

    // 3. Check POIs
    realPois.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
        results.push({
          type: 'POI',
          title: p.name,
          subtitle: `Kategori: ${p.category}`,
          badge: 'POI C3',
          color: '#8B5CF6',
          lat: p.latitude,
          lng: p.longitude,
          rawData: p,
        });
      }
    });

    // 4. Geocode Search in Sidoarjo
    try {
      const geoRes = await mapService.searchSidoarjoLocation(searchQuery);
      geoRes.forEach(g => {
        results.push({
          type: 'GEOCODE',
          title: g.display_name.split(',')[0],
          subtitle: g.display_name,
          badge: 'Lokasi Sidoarjo',
          color: '#10B981',
          lat: Number(g.lat),
          lng: Number(g.lon),
          rawData: g,
        });
      });
    } catch (e) {
      console.warn('Geocoding error:', e);
    }

    searchResults = results;
    isSearching = false;

    if (results.length === 1) {
      selectSearchResult(results[0]);
    }
  };

  // Pin & Focus selected Search Result
  const selectSearchResult = (item: typeof searchResults[0]) => {
    if (!mapInstance || !L) return;
    activePinnedLocation = { title: item.title, lat: item.lat, lng: item.lng };

    // Drop temporary search pin
    if (searchPinLayerGroup) {
      searchPinLayerGroup.clearLayers();

      const pinHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${item.color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="background: ${item.color}; color: #FFFFFF; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 5;">
            <i class="ri-map-pin-2-fill" style="font-size: 16px;"></i>
          </div>
          <div style="margin-top: 4px; background: #131316; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 8px; white-space: nowrap; border: 1px solid #2E2E38; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
            ${item.title}
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: 'search-drop-pin',
        iconSize: [32, 48],
        iconAnchor: [16, 24],
      });

      const pinMarker = L.marker([item.lat, item.lng], { icon: pinIcon }).addTo(searchPinLayerGroup);
      pinMarker.bindPopup(`
        <div style="font-family: Outfit, sans-serif; min-width: 180px;">
          <span style="font-size: 9px; font-weight: 700; color: ${item.color}; text-transform: uppercase;">${item.badge}</span>
          <h4 style="font-weight: 700; font-size: 13px; color: #18181B; margin: 2px 0;">${item.title}</h4>
          <p style="font-size: 10px; color: #71717A; margin: 0;">${item.subtitle}</p>
        </div>
      `).openPopup();
    }

    mapInstance.flyTo([item.lat, item.lng], item.type === 'ZONE' ? 15 : 17, { duration: 1.2 });
  };

  const clearSearchPin = () => {
    if (searchPinLayerGroup) {
      searchPinLayerGroup.clearLayers();
    }
    activePinnedLocation = null;
    searchQuery = '';
    searchResults = [];
  };

  // Map Controls
  const handleZoomIn = () => mapInstance?.zoomIn();
  const handleZoomOut = () => mapInstance?.zoomOut();
  const fitAllBounds = () => {
    if (!mapInstance) return;
    mapInstance.setView([-7.4450, 112.7150], 13);
  };

  // Reactive layer toggles
  $effect(() => {
    layerZones;
    renderZones();
  });

  $effect(() => {
    layerProtocolRoads;
    renderProtocolRoads();
  });

  $effect(() => {
    layerTollRoads;
    renderTollRoads();
  });

  $effect(() => {
    layerPoi;
    selectedTimeSlotKey;
    poiFilterCategory;
    renderPois();
  });

  $effect(() => {
    layerRiders;
    renderRiders(activeRiders);
  });

  onMount(() => {
    initMap();
  });

  onDestroy(() => {
    if (mapInstance) {
      mapInstance.remove();
    }
  });
</script>

<div class="relative w-full h-full min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-4.5rem)] overflow-hidden bg-[#09090B] font-outfit-400 select-none">
  <!-- LEAFLET MAP ELEMENT (Edge-to-edge full width & height) -->
  <div bind:this={mapElement} class="w-full h-full z-0"></div>

  <!-- TOP-LEFT: PANEL FILTER TIME SLOTS AT VERY TOP-LEFT, WITH VERTICAL TOOLBAR & SUBPANEL UNDERNEATH -->
  <div class="absolute top-4 left-4 z-30 flex flex-col items-start gap-2.5 max-w-[calc(100vw-2rem)] sm:max-w-none">
    
    <!-- 1. PANEL FILTER TIME SLOTS (C3: PAGI, SIANG, SORE, MALAM) AT VERY TOP-LEFT -->
    <div class="h-11 bg-[#131316]/95 backdrop-blur-xl border border-[#2E2E38] rounded-3xl shadow-2xl px-2 sm:px-3 flex items-center gap-2 text-white shrink-0">
      
      <!-- Time Slot Switcher Pills -->
      <div class="flex items-center gap-1 bg-[#18181D] p-0.5 rounded-2xl border border-[#24242A]">
        {#each (['pagi', 'siang', 'sore', 'malam'] as const) as slotKey}
          {@const def = timeSlotDefinitions[slotKey]}
          {@const isSelected = selectedTimeSlotKey === slotKey}
          <button
            onclick={() => selectedTimeSlotKey = slotKey}
            class="px-2.5 py-1 rounded-xl text-xs font-outfit-600 transition-all cursor-pointer flex items-center gap-1.5
            {isSelected ? 'bg-[#FF634A] text-white shadow-md' : 'text-[#71717A] hover:text-white'}"
          >
            <i class="{def.icon}"></i>
            <span>{def.name}</span>
          </button>
        {/each}
      </div>

      <!-- Operational Context Summary & Peak Toggle -->
      <div class="hidden xl:flex items-center gap-2 text-[11px] text-[#A1A1AA]">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span class="truncate max-w-[170px]">{activeTimeSlot.desc}</span>
      </div>

      <button
        onclick={() => poiFilterCategory = poiFilterCategory === 'PEAK_ONLY' ? 'ALL' : 'PEAK_ONLY'}
        class="px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer
        {poiFilterCategory === 'PEAK_ONLY' 
          ? 'bg-rose-950 text-rose-400 border-rose-800/60' 
          : 'bg-[#18181D] text-zinc-300 border-[#2E2E38] hover:text-white'}"
      >
        {poiFilterCategory === 'PEAK_ONLY' ? '🔥 Hotspots Saja' : '⚡ Filter Hotspots'}
      </button>
    </div>

    <!-- 2. VERTICAL TOOLBAR & ATTACHED DYNAMIC SUB-PANEL (Directly below Time Slots) -->
    <div class="flex items-start gap-2.5">
      <!-- VERTICAL FLOATING TOOLBAR DOCK -->
      <div class="flex flex-col gap-1.5 p-1.5 bg-[#131316]/95 backdrop-blur-xl border border-[#2E2E38] rounded-3xl shadow-2xl text-white shrink-0">
        
        <!-- Pencarian & Lokasi -->
        <button
          onclick={() => togglePanel('search')}
          class="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer
          {activePanel === 'search' 
            ? 'bg-[#FF634A] text-white shadow-lg shadow-orange-950/50' 
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24]'}"
          title="Pencarian & Geocoding Lokasi"
        >
          <Search class="w-4 h-4" />
        </button>

        <!-- Filter & Layer Spasial -->
        <button
          onclick={() => togglePanel('layers')}
          class="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer
          {activePanel === 'layers' 
            ? 'bg-[#FF634A] text-white shadow-lg shadow-orange-950/50' 
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24]'}"
          title="Filter & Layer Spasial"
        >
          <Layers3 class="w-4 h-4" />
        </button>

        <!-- Panel Rider Bertugas -->
        <button
          onclick={() => togglePanel('riders')}
          class="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer
          {activePanel === 'riders' 
            ? 'bg-[#FF634A] text-white shadow-lg shadow-orange-950/50' 
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24]'}"
          title="Daftar Rider Bertugas"
        >
          <Radio class="w-4 h-4" />
          {#if activeRiders.length > 0}
            <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
              {activeRiders.length}
            </span>
          {/if}
        </button>

        <!-- Cuaca Hub Sidoarjo -->
        <button
          onclick={() => togglePanel('weather')}
          class="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer
          {activePanel === 'weather' 
            ? 'bg-[#FF634A] text-white shadow-lg shadow-orange-950/50' 
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24]'}"
          title="Informasi Cuaca Hub Sidoarjo"
        >
          <Cloud class="w-4 h-4 text-sky-400" />
        </button>

        <!-- Legenda Simbol & POI -->
        <button
          onclick={() => togglePanel('legend')}
          class="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer
          {activePanel === 'legend' 
            ? 'bg-[#FF634A] text-white shadow-lg shadow-orange-950/50' 
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24]'}"
          title="Legenda Simbol & Warna POI"
        >
          <i class="ri-information-line text-lg"></i>
        </button>

        <!-- Gaya Peta (OpenMapTiles) -->
        <button
          onclick={() => togglePanel('basemap')}
          class="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer
          {activePanel === 'basemap' 
            ? 'bg-[#FF634A] text-white shadow-lg shadow-orange-950/50' 
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24]'}"
          title="Gaya Peta (OpenMapTiles / Satelit)"
        >
          <i class="ri-earth-line text-lg"></i>
        </button>
      </div>

      <!-- DYNAMIC ACTIVE SUB-PANEL -->
      {#if activePanel !== null}
        <div class="w-80 sm:w-88 bg-[#131316]/98 backdrop-blur-xl border border-[#2E2E38] rounded-3xl shadow-2xl p-3.5 text-white max-h-[calc(100vh-180px)] overflow-y-auto space-y-3 animate-in fade-in slide-in-from-left-3">
          
          <!-- SUB-PANEL: PENCARIAN -->
          {#if activePanel === 'search'}
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-[#24242A] pb-2">
                <div class="flex items-center gap-2">
                  <Search class="w-4 h-4 text-[#FF634A]" />
                  <h4 class="text-xs font-extrabold text-white">Pencarian Spasial Sidoarjo</h4>
                </div>
                <button onclick={() => activePanel = null} class="text-[#71717A] hover:text-white cursor-pointer p-0.5">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <div class="relative flex items-center bg-[#18181D] border border-[#2E2E38] rounded-2xl p-1 focus-within:border-[#FF634A]">
                <Search class="w-3.5 h-3.5 text-[#71717A] ml-2 shrink-0" />
                <input
                  type="text"
                  bind:value={searchQuery}
                  onkeydown={(e) => e.key === 'Enter' && handlePerformSearch()}
                  oninput={() => {
                    if (searchQuery.trim().length >= 2) handlePerformSearch();
                  }}
                  placeholder="Cari zona, jalan, POI, alamat Sidoarjo..."
                  class="w-full px-2 py-1 text-xs bg-transparent border-none focus:outline-none text-white placeholder:text-[#71717A]"
                />
                {#if searchQuery}
                  <button onclick={clearSearchPin} class="p-1 text-[#71717A] hover:text-white cursor-pointer">
                    <X class="w-3.5 h-3.5" />
                  </button>
                {/if}
                <button
                  onclick={handlePerformSearch}
                  class="p-1.5 bg-[#FF634A] hover:bg-[#FF4D30] text-white rounded-xl cursor-pointer"
                  title="Cari"
                >
                  {#if isSearching}
                    <RefreshCw class="w-3.5 h-3.5 animate-spin" />
                  {:else}
                    <ArrowRight class="w-3.5 h-3.5" />
                  {/if}
                </button>
              </div>

              {#if activePinnedLocation}
                <div class="p-2.5 rounded-2xl bg-[#1C1C22] border border-[#2E2E38] flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0">
                    <MapPin class="w-4 h-4 text-[#FF634A] shrink-0" />
                    <div class="min-w-0">
                      <span class="text-[10px] text-[#8E8E93] block">Lokasi Tersorot di Peta</span>
                      <span class="text-xs font-bold text-white truncate block">{activePinnedLocation.title}</span>
                    </div>
                  </div>
                  <button
                    onclick={clearSearchPin}
                    class="px-2 py-1 text-[10px] text-rose-400 bg-rose-950/40 rounded-lg hover:bg-rose-950 cursor-pointer"
                  >
                    Hapus Pin
                  </button>
                </div>
              {/if}

              {#if searchResults.length > 0}
                <div class="space-y-1.5 max-h-64 overflow-y-auto">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">
                    Hasil ({searchResults.length})
                  </span>
                  {#each searchResults as item}
                    <button
                      onclick={() => selectSearchResult(item)}
                      class="w-full p-2 text-left rounded-2xl hover:bg-[#1F1F24] transition-colors flex items-start gap-2.5 cursor-pointer border border-[#24242A] hover:border-[#383846]"
                    >
                      <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background-color: {item.color}20; color: {item.color};">
                        {#if item.type === 'ZONE'}
                          <i class="ri-shape-line text-xs"></i>
                        {:else if item.type === 'ROAD'}
                          <i class="ri-road-map-line text-xs"></i>
                        {:else if item.type === 'POI'}
                          <i class="ri-map-pin-line text-xs"></i>
                        {:else}
                          <i class="ri-navigation-line text-xs"></i>
                        {/if}
                      </div>

                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5">
                          <span class="font-outfit-600 text-xs text-white truncate">{item.title}</span>
                          <span class="px-1.5 py-0.2 rounded text-[9px] font-bold" style="background-color: {item.color}20; color: {item.color};">
                            {item.badge}
                          </span>
                        </div>
                        <p class="text-[10px] text-[#8E8E93] truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          <!-- SUB-PANEL: FILTER & LAYER SPASIAL -->
          {#if activePanel === 'layers'}
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-[#24242A] pb-2">
                <div class="flex items-center gap-2">
                  <Layers3 class="w-4 h-4 text-[#FF634A]" />
                  <h4 class="text-xs font-extrabold text-white">Filter & Layer Spasial</h4>
                </div>
                <button onclick={() => activePanel = null} class="text-[#71717A] hover:text-white cursor-pointer p-0.5">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <div class="space-y-2 text-xs text-[#A1A1AA]">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">Layer Peta Aktif</span>

                <label class="flex items-center justify-between p-2 rounded-xl bg-[#18181D] border border-[#24242A] cursor-pointer hover:text-white">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={layerHub} onchange={renderHub} class="accent-[#FF634A] rounded cursor-pointer" />
                    <span class="text-[#FF634A] font-bold">Central HUB ({zoneConfig?.hub_city_name || 'Sidoarjo'})</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-[#FF634A]/15 text-[#FF634A] text-[10px] font-bold border border-[#FF634A]/40">
                    Pusat Ops
                  </span>
                </label>

                <label class="flex items-center justify-between p-2 rounded-xl bg-[#18181D] border border-[#24242A] cursor-pointer hover:text-white">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={layerRiders} onchange={() => renderRiders(activeRiders)} class="accent-[#10B981] rounded cursor-pointer" />
                    <span>Rider Bertugas</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px] font-bold border border-emerald-800/40">
                    {activeRiders.length} Aktif
                  </span>
                </label>

                <label class="flex items-center justify-between p-2 rounded-xl bg-[#18181D] border border-[#24242A] cursor-pointer hover:text-white">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={layerZones} onchange={renderZones} class="accent-[#FF634A] rounded cursor-pointer" />
                    <span>Poligon Zona</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-[#FF634A]/15 text-[#FF634A] text-[10px] font-bold border border-[#FF634A]/40">
                    {realZones.length} Area
                  </span>
                </label>

                <label class="flex items-center justify-between p-2 rounded-xl bg-[#18181D] border border-[#24242A] cursor-pointer hover:text-white">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={layerProtocolRoads} onchange={renderProtocolRoads} class="accent-[#F59E0B] rounded cursor-pointer" />
                    <span class="text-amber-400">Jalan Protokol</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 text-[10px] font-bold border border-amber-800/40">
                    {protocolRoadsGeoJson?.features?.length || 885} Ruas
                  </span>
                </label>

                <label class="flex items-center justify-between p-2 rounded-xl bg-[#18181D] border border-[#24242A] cursor-pointer hover:text-white">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={layerTollRoads} onchange={renderTollRoads} class="accent-[#EF4444] rounded cursor-pointer" />
                    <span class="text-rose-400">Jalan Tol</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 text-[10px] font-bold border border-rose-800/40">
                    {tollRoadsGeoJson?.features?.length || 692} Ruas
                  </span>
                </label>

                <label class="flex items-center justify-between p-2 rounded-xl bg-[#18181D] border border-[#24242A] cursor-pointer hover:text-white">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={layerPoi} onchange={renderPois} class="accent-purple-500 rounded cursor-pointer" />
                    <span>Titik POI Overpass</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 text-[10px] font-bold border border-purple-800/40">
                    {realPois.length} Titik
                  </span>
                </label>
              </div>

              <!-- POI Category Filter -->
              <div class="space-y-1.5 pt-2 border-t border-[#24242A]">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">Filter Kategori POI C3</span>
                <div class="grid grid-cols-2 gap-1">
                  <button
                    onclick={() => { poiFilterCategory = 'ALL'; renderPois(); }}
                    class="p-1.5 rounded-xl text-[10px] font-outfit-600 text-left cursor-pointer border
                    {poiFilterCategory === 'ALL' ? 'bg-[#FF634A] text-white border-[#FF634A]' : 'bg-[#18181D] text-[#A1A1AA] border-[#24242A] hover:text-white'}"
                  >
                    Semua Kategori
                  </button>
                  <button
                    onclick={() => { poiFilterCategory = 'PEAK_ONLY'; renderPois(); }}
                    class="p-1.5 rounded-xl text-[10px] font-outfit-600 text-left cursor-pointer border
                    {poiFilterCategory === 'PEAK_ONLY' ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-[#18181D] text-[#A1A1AA] border-[#24242A] hover:text-white'}"
                  >
                    🔥 Jam Puncak Saja
                  </button>
                  {#each Object.entries(categoryCrowdProfiles) as [key, prof]}
                    <button
                      onclick={() => { poiFilterCategory = (poiFilterCategory === key ? 'ALL' : key as any); renderPois(); }}
                      class="p-1.5 rounded-xl text-[10px] font-outfit-600 text-left cursor-pointer border truncate flex items-center gap-1.5
                      {poiFilterCategory === key ? 'bg-[#2E2E38] text-white border-blue-500' : 'bg-[#18181D] text-[#A1A1AA] border-[#24242A] hover:text-white'}"
                    >
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: {prof.color};"></span>
                      <span class="truncate">{prof.label.split(' ')[0]}</span>
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- SUB-PANEL: DAFTAR RIDER BERTUGAS -->
          {#if activePanel === 'riders'}
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-[#24242A] pb-2">
                <div class="flex items-center gap-2">
                  <Radio class="w-4 h-4 text-emerald-400 animate-pulse" />
                  <div>
                    <h4 class="text-xs font-extrabold text-white">Rider Bertugas</h4>
                    <span class="text-[10px] text-[#8E8E93]">{activeRiders.length} Unit Armada Terhubung</span>
                  </div>
                </div>
                <button onclick={() => activePanel = null} class="text-[#71717A] hover:text-white cursor-pointer p-0.5">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Search Rider -->
              <div class="relative flex items-center">
                <Search class="w-3.5 h-3.5 text-[#71717A] absolute left-2.5" />
                <input
                  type="text"
                  bind:value={riderSearchQuery}
                  placeholder="Cari rider / plat nomor..."
                  class="w-full pl-8 pr-2.5 py-1 text-xs bg-[#18181D] border border-[#2E2E38] rounded-xl focus:outline-none focus:border-[#FF634A] text-white placeholder:text-[#71717A]"
                />
              </div>

              <!-- Riders List -->
              <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                {#if filteredRiders.length === 0}
                  <div class="py-8 text-center text-xs text-[#71717A] space-y-1">
                    <i class="ri-user-unfollow-line text-2xl text-zinc-600"></i>
                    <p>Tidak ada rider aktif yang sesuai.</p>
                  </div>
                {:else}
                  {#each filteredRiders as r}
                    {@const isBreach = r.status === 'BREACH'}
                    <button
                      onclick={() => focusRider(r)}
                      class="w-full p-2.5 rounded-2xl border transition-all text-left flex flex-col gap-1.5 cursor-pointer
                      {isBreach 
                        ? 'bg-rose-950/20 border-rose-800/40 hover:bg-rose-950/30' 
                        : 'bg-[#18181D] border-[#24242A] hover:border-[#FF634A]/50 hover:bg-[#202027]'}"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 min-w-0">
                          <div class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0
                          {isBreach ? 'bg-rose-600 text-white' : 'bg-[#2E2E38] text-white'}">
                            {r.name ? r.name.charAt(0).toUpperCase() : 'R'}
                          </div>
                          <div class="min-w-0">
                            <span class="font-outfit-600 text-xs text-white truncate block">{r.name}</span>
                            <span class="text-[10px] text-[#71717A] font-mono">{r.plateNumber || 'W 1234 COZ'}</span>
                          </div>
                        </div>

                        <div>
                          {#if isBreach}
                            <span class="px-2 py-0.5 rounded-lg bg-rose-950/80 text-rose-400 text-[9px] font-extrabold border border-rose-800/60 animate-pulse">
                              BREACH
                            </span>
                          {:else}
                            <span class="px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-400 text-[9px] font-extrabold border border-emerald-800/40">
                              ON DUTY
                            </span>
                          {/if}
                        </div>
                      </div>

                      <div class="flex items-center justify-between text-[10px] text-[#A1A1AA] pt-1 border-t border-[#24242A]">
                        <div class="flex items-center gap-1 text-zinc-300 truncate max-w-[130px]">
                          <i class="ri-map-pin-2-line text-[#FF634A]"></i>
                          <span class="truncate">{r.zoneName || 'Zona Sidoarjo'}</span>
                        </div>

                        <div class="flex items-center gap-2 font-mono shrink-0">
                          <span class="text-sky-400">
                            {r.speed || 12} km/h
                          </span>
                          <span class="flex items-center gap-0.5 text-emerald-400">
                            <Battery class="w-3 h-3" /> {r.battery || 90}%
                          </span>
                        </div>
                      </div>
                    </button>
                  {/each}
                {/if}
              </div>

              <!-- Broadcast Button inside Rider Panel -->
              <button
                onclick={() => broadcastModalOpen = true}
                class="w-full py-2 bg-[#FF634A] hover:bg-[#FF4D30] text-white rounded-xl text-xs font-outfit-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <i class="ri-broadcast-line text-sm"></i>
                <span>Kirim Broadcast ke Semua Rider</span>
              </button>
            </div>
          {/if}

          <!-- SUB-PANEL: CUACA HUB SIDOARJO & ATRIBUT LENGKAP WEATHERS -->
          {#if activePanel === 'weather'}
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-[#24242A] pb-2">
                <div class="flex items-center gap-2">
                  <Cloud class="w-4 h-4 text-sky-400" />
                  <div>
                    <h4 class="text-xs font-extrabold text-white">Radar Cuaca HUB {zoneConfig?.hub_city_name || 'Sidoarjo'}</h4>
                    <span class="text-[10px] text-[#8E8E93]">Tabel Weathers Open-Meteo Satelit</span>
                  </div>
                </div>
                <button onclick={() => activePanel = null} class="text-[#71717A] hover:text-white cursor-pointer p-0.5">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- 4 Grid Parameter Atmosferik (from 'weathers' table) -->
              <div class="grid grid-cols-2 gap-2 text-xs">
                <!-- 1. Suhu & Apparent Temp -->
                <div class="p-2.5 bg-[#18181D] rounded-xl border border-[#24242A] space-y-1">
                  <span class="text-[10px] text-[#71717A] uppercase font-bold flex items-center justify-between">
                    <span>Suhu Udara</span>
                    <Sun class="w-3 h-3 text-amber-400" />
                  </span>
                  <div class="text-lg font-bold text-white font-mono">
                    {weatherData?.hub_overview?.avg_temperature_c ?? 30.5}°C
                  </div>
                  <span class="text-[9px] text-[#A1A1AA] block">
                    Terasa: {(weatherData?.hub_overview as any)?.apparent_temperature_c ?? 32}°C
                  </span>
                </div>

                <!-- 2. Peluang Hujan (C4 Cost) -->
                <div class="p-2.5 bg-[#18181D] rounded-xl border border-[#24242A] space-y-1">
                  <span class="text-[10px] text-[#71717A] uppercase font-bold flex items-center justify-between">
                    <span>Peluang Hujan (C4)</span>
                    <CloudRain class="w-3 h-3 text-blue-400" />
                  </span>
                  <div class="text-lg font-bold text-blue-400 font-mono">
                    {weatherData?.hub_overview?.max_rain_probability_percent ?? 0}%
                  </div>
                  <span class="text-[9px] text-blue-400/80 block">
                    Curah: {(weatherData?.hub_overview as any)?.precipitation_rain_mm ?? 0} mm
                  </span>
                </div>

                <!-- 3. Kelembaban & Titik Embun -->
                <div class="p-2.5 bg-[#18181D] rounded-xl border border-[#24242A] space-y-1">
                  <span class="text-[10px] text-[#71717A] uppercase font-bold flex items-center justify-between">
                    <span>Kelembaban Udara</span>
                    <Droplets class="w-3 h-3 text-cyan-400" />
                  </span>
                  <div class="text-lg font-bold text-white font-mono">
                    {(weatherData?.hub_overview as any)?.relative_humidity_2m ?? 65}%
                  </div>
                  <span class="text-[9px] text-[#A1A1AA] block">
                    Titik Embun: {(weatherData?.hub_overview as any)?.dew_point_2m ?? 23.4}°C
                  </span>
                </div>

                <!-- 4. Kondisi Cuaca & WMO Code -->
                <div class="p-2.5 bg-[#18181D] rounded-xl border border-[#24242A] space-y-1">
                  <span class="text-[10px] text-[#71717A] uppercase font-bold flex items-center justify-between">
                    <span>Kondisi WMO</span>
                    <Cloud class="w-3 h-3 text-[#FF634A]" />
                  </span>
                  <div class="text-xs font-bold text-[#FF634A] truncate">
                    {weatherData?.hub_overview?.weather_condition ?? 'Cerah Berawan'}
                  </div>
                  <span class="text-[9px] text-[#A1A1AA] block">
                    Kode WMO: {weatherData?.hub_overview?.weather_code ?? 2}
                  </span>
                </div>
              </div>

              <!-- Daftar Cuaca per Zona Spasial -->
              {#if weatherData?.zones_weather_list && weatherData.zones_weather_list.length > 0}
                <div class="space-y-1.5 pt-2 border-t border-[#24242A]">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">
                    Skor Cuaca C4 per Zona ({weatherData.zones_weather_list.length})
                  </span>
                  <div class="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {#each weatherData.zones_weather_list as zw}
                      <div class="p-2 rounded-xl bg-[#18181D] border border-[#24242A] flex items-center justify-between text-xs">
                        <div>
                          <strong class="text-zinc-200 block text-[11px]">{zw.zone_name}</strong>
                          <span class="text-[10px] text-[#71717A]">{zw.weather_condition} • {zw.temperature_c}°C</span>
                        </div>
                        <div class="text-right">
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold {zw.rain_probability_percent > 50 ? 'bg-rose-950 text-rose-400' : 'bg-blue-950 text-blue-400'}">
                            C4: {zw.rain_probability_percent}%
                          </span>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Sync Button -->
              <button
                onclick={handleSyncWeather}
                disabled={syncingWeather}
                class="w-full py-2 bg-[#262630] hover:bg-[#323240] text-white rounded-xl text-xs font-outfit-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw class="w-3.5 h-3.5 {syncingWeather ? 'animate-spin' : ''}" />
                <span>{syncingWeather ? 'Menyinkronkan...' : 'Sinkronkan Cuaca Open-Meteo'}</span>
              </button>
            </div>
          {/if}

          <!-- SUB-PANEL: LEGENDA SIMBOL & POI C3 -->
          {#if activePanel === 'legend'}
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-[#24242A] pb-2">
                <div class="flex items-center gap-1.5 text-white font-extrabold text-xs">
                  <i class="ri-information-line text-[#FF634A]"></i>
                  <span>Legenda Simbol & POI C3</span>
                </div>
                <button onclick={() => activePanel = null} class="text-[#71717A] hover:text-white cursor-pointer p-0.5">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <div class="space-y-1.5 text-[11px]">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Kategori POI Potensial</span>
                <div class="grid grid-cols-2 gap-1.5">
                  {#each Object.entries(categoryCrowdProfiles) as [key, prof]}
                    <div class="p-1.5 rounded-xl bg-[#18181D] border border-[#24242A] flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: {prof.color};"></span>
                      <span class="text-[10px] font-outfit-600 text-zinc-300 truncate">{prof.label}</span>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="space-y-1.5 pt-2 border-t border-[#24242A] text-[11px]">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Batas & Jalur Larangan</span>
                
                <div class="p-1.5 rounded-xl bg-[#18181D] border border-[#24242A] flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3.5 h-1 border-b-2 border-dashed border-[#F59E0B]"></span>
                    <span class="text-[10px] text-zinc-300">Jalan Protokol</span>
                  </div>
                  <span class="text-[9px] font-bold text-amber-400">Dilarang Mangkal</span>
                </div>

                <div class="p-1.5 rounded-xl bg-[#18181D] border border-[#24242A] flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3.5 h-1 bg-[#EF4444] rounded"></span>
                    <span class="text-[10px] text-zinc-300">Jalan Tol</span>
                  </div>
                  <span class="text-[9px] font-bold text-rose-400">Terlarang Total</span>
                </div>
              </div>
            </div>
          {/if}

          <!-- SUB-PANEL: GAYA PETA -->
          {#if activePanel === 'basemap'}
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-[#24242A] pb-2">
                <div class="flex items-center gap-2">
                  <i class="ri-earth-line text-[#FF634A]"></i>
                  <h4 class="text-xs font-extrabold text-white">Pilih Gaya Peta (Tiles)</h4>
                </div>
                <button onclick={() => activePanel = null} class="text-[#71717A] hover:text-white cursor-pointer p-0.5">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <div class="space-y-1.5">
                {#each basemapProviders as p}
                  {@const isSelected = selectedBasemapId === p.id}
                  <button
                    onclick={() => switchBasemap(p.id)}
                    class="w-full p-2 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer
                    {isSelected ? 'bg-[#FF634A]/15 border-[#FF634A] text-white' : 'bg-[#18181D] border-[#24242A] text-zinc-400 hover:text-white'}"
                  >
                    <span class="text-xs font-outfit-600">{p.name}</span>
                    {#if isSelected}
                      <Check class="w-4 h-4 text-[#FF634A]" />
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

        </div>
      {/if}
    </div>

  </div>

  <!-- TOP-RIGHT: PANEL INFORMASI UTAMA DI SAMPING KIRI TOMBOL KEMBALI KE DASHBOARD -->
  <div class="absolute top-4 right-4 z-30 flex items-center gap-2.5">
    
    <!-- 1. Main Telemetry Info HUD (Positioned to the left of the back button) -->
    <div class="h-11 bg-[#131316]/95 backdrop-blur-xl border border-[#2E2E38] rounded-3xl shadow-2xl px-3.5 sm:px-4 flex items-center gap-3 sm:gap-4 text-xs text-white shrink-0">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-[#A1A1AA]">Rider: <strong class="text-emerald-400 font-outfit-600">{activeRiders.length} Aktif</strong></span>
      </div>

      <div class="hidden sm:block text-[#A1A1AA]">
        <span>Zona: <strong class="text-white font-outfit-600">{realZones.length} Area</strong></span>
      </div>

      <div class="hidden sm:block text-[#A1A1AA]">
        <span>POI: <strong class="text-purple-400 font-outfit-600">{realPois.length}</strong></span>
      </div>

      <div class="hidden md:block text-[#A1A1AA]">
        <span>Jalan Terlarang: <strong class="text-amber-400 font-outfit-600">{protocolRoadsGeoJson?.features?.length || 885}</strong></span>
      </div>
    </div>

    <!-- 2. Floating Back to Dashboard Button (Rightmost element) -->
    {#if onNavigate}
      <button
        onclick={() => onNavigate('/dashboard')}
        class="h-11 px-3.5 sm:px-4 rounded-3xl bg-[#131316]/95 hover:bg-[#1F1F24] text-white border border-[#2E2E38] text-xs font-outfit-600 transition-all cursor-pointer shadow-2xl backdrop-blur-md flex items-center gap-2 hover:border-[#FF634A] shrink-0"
      >
        <ArrowLeft class="w-3.5 h-3.5 text-[#FF634A]" />
        <span>Kembali ke Dashboard</span>
      </button>
    {/if}

  </div>

  <!-- BOTTOM-RIGHT: TOMBOL REFRESH & BROADCAST PERINGATAN (Moved to Bottom-Right) -->
  <div class="absolute bottom-4 right-4 z-30 flex items-center gap-2">
    <button
      onclick={loadAllSpatialData}
      class="px-3.5 py-2.5 rounded-2xl bg-[#131316]/95 hover:bg-[#1F1F24] text-white border border-[#2E2E38] shadow-2xl backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-outfit-600"
      title="Refresh Data Spasial"
    >
      <RefreshCw class="w-3.5 h-3.5 {loading ? 'animate-spin' : ''}" />
      <span class="hidden sm:inline">Refresh Data</span>
    </button>

    <button
      onclick={() => broadcastModalOpen = true}
      class="px-4 py-2.5 rounded-2xl bg-[#FF634A] hover:bg-[#FF4D30] text-white text-xs font-outfit-600 shadow-2xl backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer shadow-orange-950/30"
    >
      <i class="ri-broadcast-line text-sm"></i>
      <span>Broadcast Peringatan</span>
    </button>
  </div>

  <!-- BOTTOM-LEFT: ARAH MATA ANGIN & ZOOM CONTROLS -->
  <div class="absolute bottom-4 left-4 z-20 flex flex-col items-center gap-1.5">
    <!-- Arah Mata Angin (Compass Rose Widget) -->
    <div class="bg-[#131316]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#2E2E38] shadow-2xl text-white flex flex-col items-center">
      <button
        onclick={fitAllBounds}
        class="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#1F1F24] transition-colors cursor-pointer group"
        title="Arah Mata Angin (Klik untuk reset orientasi ke Utara)"
      >
        <div class="w-7 h-7 rounded-full border border-[#3E3E48] flex items-center justify-center relative">
          <div class="w-1 h-3 bg-[#EF4444] rounded-t-sm absolute top-0.5"></div>
          <div class="w-1 h-3 bg-zinc-400 rounded-b-sm absolute bottom-0.5"></div>
          <div class="w-2 h-2 rounded-full bg-white shadow-xs z-10"></div>
          <span class="absolute -top-3.5 text-[8px] font-extrabold text-[#EF4444] tracking-widest font-mono">U</span>
        </div>
      </button>
    </div>

    <!-- Zoom Controls -->
    <div class="bg-[#131316]/95 backdrop-blur-md p-1 rounded-2xl border border-[#2E2E38] shadow-2xl text-white flex flex-col gap-0.5">
      <button onclick={handleZoomIn} class="p-2 text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24] rounded-xl cursor-pointer transition-colors" title="Perbesar Peta">
        <Plus class="w-4 h-4" />
      </button>
      <button onclick={handleZoomOut} class="p-2 text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24] rounded-xl cursor-pointer transition-colors" title="Perkecil Peta">
        <Minus class="w-4 h-4" />
      </button>
      <button onclick={fitAllBounds} class="p-2 text-[#A1A1AA] hover:text-white hover:bg-[#1F1F24] rounded-xl cursor-pointer transition-colors" title="Fokuskan Semua Sidoarjo">
        <Maximize2 class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>

  <!-- Rider Detail Drawer -->
  {#if selectedRider}
    <RiderDetailDrawer
      rider={selectedRider}
      isOpen={drawerOpen}
      onClose={() => {
        drawerOpen = false;
        selectedRider = null;
      }}
    />
  {/if}

  <!-- Broadcast Alert Modal -->
  {#if broadcastModalOpen}
    <BroadcastAlertModal
      isOpen={broadcastModalOpen}
      onClose={() => broadcastModalOpen = false}
    />
  {/if}
</div>
