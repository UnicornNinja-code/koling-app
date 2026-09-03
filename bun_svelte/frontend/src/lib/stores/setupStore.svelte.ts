/*
 * setupStore.svelte.ts
 * Svelte 5 Reactive Store for MOVA 7-Step First-Run Onboarding & Initialization Wizard
 */

import { setupService, type SetupStatusResponse, type InitialFleetUnit } from '../../services/setupService';

export interface SyncTaskItem {
  id: string;
  label: string;
  desc: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  error?: string;
}

class SetupStore {
  status = $state<'REQUIRED' | 'IN_PROGRESS' | 'APPLYING' | 'COMPLETED'>('COMPLETED');
  loading = $state(false);
  currentStep = $state<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // STEP 01: Identitas Operasional
  identity = $state({
    businessName: '',
    hubCityName: '',
    centralHubName: '',
    centralHubAddress: '',
    centralHubLat: 0,
    centralHubLng: 0,
    timezone: 'Asia/Jakarta',
  });

  // STEP 02: Kebijakan Operasional
  operationalPolicy = $state({
    operatingHoursStart: '07:00',
    operatingHoursEnd: '21:00',
    operationalRadiusKm: 12,
  });

  // STEP 03: Armada Awal (Minimal 1 unit)
  fleets = $state<InitialFleetUnit[]>([
    {
      code: 'M-001',
      name: 'Armada Perdana M-001',
      type: 'MOTOR',
      status: 'ACTIVE',
    },
  ]);

  // STEP 04: Preferensi Peta
  mapPreferences = $state({
    basemapId: 'openmaptiles-dark',
    defaultZoom: 13,
    showHubRadius: true,
    showProtocolRoads: true,
    showPoi: false, // Default OFF to prevent clutter
    showWeather: true,
  });

  // STEP 05: Model DSS (BWM)
  dss = $state({
    bestCriteriaId: '1', // C1 Densitas POI
    worstCriteriaId: '5', // C5 Jarak Aksesibilitas
    bestToOthers: <Record<string, number>>{
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 7,
      '6': 5,
    },
    othersToWorst: <Record<string, number>>{
      '1': 7,
      '2': 5,
      '3': 4,
      '4': 3,
      '5': 1,
      '6': 2,
    },
    weights: <Record<string, number>>{},
    cr: 0,
    isConsistent: false,
    calibrated: false,
    details: <any[]>[],
  });

  // STEP 06: Sinkronisasi Data Pipeline Checklist
  sync = $state<{
    status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    tasks: SyncTaskItem[];
  }>({
    status: 'IDLE',
    tasks: [
      {
        id: 'conn',
        label: 'Inisialisasi Koneksi Geospasial',
        desc: 'Verifikasi integrasi PostGIS dan aksesibilitas peta Leaflet',
        status: 'PENDING',
      },
      {
        id: 'poi',
        label: 'Ekstraksi & Pemetaan POI Utama',
        desc: 'Mengambil titik POI (Edukasi, Kuliner, Kantor, Pasar, dll.)',
        status: 'PENDING',
      },
      {
        id: 'roads',
        label: 'Pemetaan Arteri & Jalan Protokol',
        desc: 'Memvalidasi koridor jalur operasional dan regulasi jalan bebas hambatan',
        status: 'PENDING',
      },
      {
        id: 'geom',
        label: 'Validasi Geometri & Proyeksi Spasial',
        desc: 'Normalisasi koordinat WGS84 ke sistem referensi PostGIS (SRID 4326)',
        status: 'PENDING',
      },
      {
        id: 'cache',
        label: 'Penyimpanan & Indeksasi Spasial',
        desc: 'Membangun index spasial R-Tree dan cache agregasi data',
        status: 'PENDING',
      },
    ],
  });

  // Derived Helpers
  isCompleted = $derived(this.status === 'COMPLETED');
  isSetupRequired = $derived(this.status === 'REQUIRED' || this.status === 'IN_PROGRESS');

  /**
   * Fetch initialization status from PostgreSQL backend
   */
  async checkStatus(): Promise<SetupStatusResponse | null> {
    this.loading = true;
    try {
      const data = await setupService.getSetupStatus();
      this.status = data.status;

      if (data.hub_config) {
        if (data.hub_config.system_name) this.identity.businessName = data.hub_config.system_name;
        if (data.hub_config.hub_city_name) this.identity.hubCityName = data.hub_config.hub_city_name;
        if (data.hub_config.central_hub_name) this.identity.centralHubName = data.hub_config.central_hub_name;
        if (data.hub_config.central_hub_address) this.identity.centralHubAddress = data.hub_config.central_hub_address;
        if (data.hub_config.central_hub_lat) this.identity.centralHubLat = data.hub_config.central_hub_lat;
        if (data.hub_config.central_hub_lng) this.identity.centralHubLng = data.hub_config.central_hub_lng;
        if (data.hub_config.timezone) this.identity.timezone = data.hub_config.timezone;
      }

      // Step mapping
      const stepMap: Record<string, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
        IDENTITY: 1,
        OPERATIONS: 2,
        FLEET: 3,
        MAP: 4,
        DSS: 5,
        SYNC: 6,
        REVIEW: 7,
        COMPLETED: 7,
      };

      if (data.current_step && stepMap[data.current_step]) {
        this.currentStep = stepMap[data.current_step];
      } else if (this.status === 'COMPLETED') {
        this.currentStep = 7;
      } else {
        this.currentStep = 1;
      }

      return data;
    } catch (err) {
      console.warn('[SetupStore] Gagal mengecek status setup sistem:', err);
      return null;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Save progress of a step
   */
  async saveStep(step: 1 | 2 | 3 | 4 | 5 | 6 | 7): Promise<boolean> {
    const stepNames: Record<number, string> = {
      1: 'IDENTITY',
      2: 'OPERATIONS',
      3: 'FLEET',
      4: 'MAP',
      5: 'DSS',
      6: 'SYNC',
      7: 'REVIEW',
    };

    const payload = {
      step_id: stepNames[step] || 'IDENTITY',
      data: {
        system_name: this.identity.businessName.trim() || 'MOVA',
        business_name: this.identity.businessName.trim() || 'MOVA',
        hub_city_name: this.identity.hubCityName.trim(),
        central_hub_name: this.identity.centralHubName.trim(),
        central_hub_address: this.identity.centralHubAddress.trim(),
        central_hub_lat: Number(this.identity.centralHubLat) || 0,
        central_hub_lng: Number(this.identity.centralHubLng) || 0,
        timezone: this.identity.timezone || 'Asia/Jakarta',
        operational_radius_km: Number(this.operationalPolicy.operationalRadiusKm) || 12,
        operating_hours_start: this.operationalPolicy.operatingHoursStart,
        operating_hours_end: this.operationalPolicy.operatingHoursEnd,
        initial_fleets: this.fleets,
        default_basemap: this.mapPreferences.basemapId,
        default_zoom: this.mapPreferences.defaultZoom,
        show_hub_radius: this.mapPreferences.showHubRadius,
        show_protocol_roads: this.mapPreferences.showProtocolRoads,
        show_poi: this.mapPreferences.showPoi,
        show_weather: this.mapPreferences.showWeather,
      },
    };

    try {
      await setupService.saveSetupStep(payload);
      return true;
    } catch (err) {
      console.error('[SetupStore] Gagal menyimpan progress step:', err);
      return false;
    }
  }

  /**
   * Final apply configuration to backend
   */
  async applyConfiguration(): Promise<boolean> {
    this.status = 'APPLYING';
    try {
      const payload = {
        system_name: this.identity.businessName || 'MOVA',
        business_name: this.identity.businessName || 'MOVA',
        hub_city_name: this.identity.hubCityName,
        central_hub_name: this.identity.centralHubName,
        central_hub_address: this.identity.centralHubAddress,
        central_hub_lat: this.identity.centralHubLat,
        central_hub_lng: this.identity.centralHubLng,
        timezone: this.identity.timezone,
        operational_radius_km: this.operationalPolicy.operationalRadiusKm,
        operating_hours_start: this.operationalPolicy.operatingHoursStart,
        operating_hours_end: this.operationalPolicy.operatingHoursEnd,
        initial_fleets: this.fleets,
        default_basemap: this.mapPreferences.basemapId,
        default_zoom: this.mapPreferences.defaultZoom,
        show_hub_radius: this.mapPreferences.showHubRadius,
        show_protocol_roads: this.mapPreferences.showProtocolRoads,
        show_poi: this.mapPreferences.showPoi,
        show_weather: this.mapPreferences.showWeather,
        dss_best_id: this.dss.bestCriteriaId,
        dss_worst_id: this.dss.worstCriteriaId,
        dss_weights: this.dss.weights,
        dss_baseline_accepted: true,
      };

      await setupService.applySetup(payload);
      this.status = 'COMPLETED';
      return true;
    } catch (err) {
      console.error('[SetupStore] Gagal menerapkan konfigurasi sistem:', err);
      this.status = 'IN_PROGRESS';
      return false;
    }
  }
}

export const setupStore = new SetupStore();
