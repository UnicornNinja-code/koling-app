<script lang="ts">
  import { onMount } from 'svelte';
  import BwmCalibrationTab from '../../components/dss/BwmCalibrationTab.svelte';
  import C3TimeCrowdTab from '../../components/dss/C3TimeCrowdTab.svelte';
  import C6CompetitorTab from '../../components/dss/C6CompetitorTab.svelte';
  import TopsisSimulationTab from '../../components/dss/TopsisSimulationTab.svelte';
  import { 
    Compass, 
    Clock, 
    Users, 
    Play, 
    Layers, 
    ArrowLeft, 
    Sparkles, 
    Calculator, 
    Sliders,
    Award
  } from 'lucide-svelte';

  interface Props {
    onNavigate: (route: string) => void;
  }

  let { onNavigate }: Props = $props();

  let activeTab = $state<'bwm' | 'c3' | 'c6' | 'topsis'>('bwm');
</script>

<div class="space-y-6 pb-12 font-outfit-400">
  <!-- TOP TOOLBAR: Breadcrumbs & Page Title -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#24242A]">
    <div>
      <div class="text-[11px] font-outfit-600 text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
        <span>Super Admin Workspace</span>
        <span>•</span>
        <span class="text-[#FF634A]">DSS Engine Command</span>
      </div>
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-outfit-600 text-white tracking-tight leading-tight mt-0.5">
        Konfigurasi & Master DSS BWM-TOPSIS
      </h2>
    </div>

    <!-- Quick Navigation Pills -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        onclick={() => onNavigate('/zones')}
        class="pill-btn-dark text-xs font-outfit-600"
      >
        <span class="px-3.5 py-1.5 flex items-center gap-1.5">
          <i class="ri-road-map-line text-sm text-[#FF634A]"></i>
          <span>Kelola Zona Wilayah</span>
        </span>
      </button>

      <button
        onclick={() => onNavigate('/map')}
        class="pill-btn-white text-xs font-outfit-600"
      >
        <span class="px-3.5 py-1.5 flex items-center gap-1.5 text-[#09090B]">
          <i class="ri-map-pin-2-fill text-sm text-[#FF634A]"></i>
          <span>Live Map Spasial</span>
        </span>
      </button>
    </div>
  </div>

  <!-- MAIN 4-TAB NAVIGATION BAR -->
  <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#24242A]">
    <!-- Tab 1: BWM Calibration -->
    <button
      type="button"
      onclick={() => (activeTab = 'bwm')}
      class="px-4 py-3 rounded-2xl text-xs sm:text-sm font-outfit-600 transition-all cursor-pointer flex items-center gap-2 shrink-0 border
      {activeTab === 'bwm'
        ? 'bg-white text-[#09090B] font-extrabold border-white shadow-lg shadow-white/10'
        : 'bg-[#131316] text-[#A1A1AA] hover:text-white border-[#24242A] hover:border-[#383842]'}"
    >
      <Compass class="w-4 h-4 {activeTab === 'bwm' ? 'text-[#FF634A]' : 'text-purple-400'}" />
      <span>1. Kalibrasi Bobot BWM</span>
    </button>

    <!-- Tab 2: C3 Time Crowd -->
    <button
      type="button"
      onclick={() => (activeTab = 'c3')}
      class="px-4 py-3 rounded-2xl text-xs sm:text-sm font-outfit-600 transition-all cursor-pointer flex items-center gap-2 shrink-0 border
      {activeTab === 'c3'
        ? 'bg-white text-[#09090B] font-extrabold border-white shadow-lg shadow-white/10'
        : 'bg-[#131316] text-[#A1A1AA] hover:text-white border-[#24242A] hover:border-[#383842]'}"
    >
      <Clock class="w-4 h-4 {activeTab === 'c3' ? 'text-[#FF634A]' : 'text-amber-400'}" />
      <span>2. Kriteria C3 (Keramaian Waktu)</span>
    </button>

    <!-- Tab 3: C6 Competitor Survey -->
    <button
      type="button"
      onclick={() => (activeTab = 'c6')}
      class="px-4 py-3 rounded-2xl text-xs sm:text-sm font-outfit-600 transition-all cursor-pointer flex items-center gap-2 shrink-0 border
      {activeTab === 'c6'
        ? 'bg-white text-[#09090B] font-extrabold border-white shadow-lg shadow-white/10'
        : 'bg-[#131316] text-[#A1A1AA] hover:text-white border-[#24242A] hover:border-[#383842]'}"
    >
      <Users class="w-4 h-4 {activeTab === 'c6' ? 'text-[#FF634A]' : 'text-rose-400'}" />
      <span>3. Kriteria C6 (Survei Kompetitor)</span>
    </button>

    <!-- Tab 4: TOPSIS Simulation & Snapshots -->
    <button
      type="button"
      onclick={() => (activeTab = 'topsis')}
      class="px-4 py-3 rounded-2xl text-xs sm:text-sm font-outfit-600 transition-all cursor-pointer flex items-center gap-2 shrink-0 border
      {activeTab === 'topsis'
        ? 'bg-white text-[#09090B] font-extrabold border-white shadow-lg shadow-white/10'
        : 'bg-[#131316] text-[#A1A1AA] hover:text-white border-[#24242A] hover:border-[#383842]'}"
    >
      <Play class="w-4 h-4 {activeTab === 'topsis' ? 'text-[#FF634A]' : 'text-emerald-400'} fill-current" />
      <span>4. Simulasi TOPSIS & Snapshot</span>
    </button>
  </div>

  <!-- TAB CONTENT DISPLAY -->
  <div>
    {#if activeTab === 'bwm'}
      <BwmCalibrationTab />
    {:else if activeTab === 'c3'}
      <C3TimeCrowdTab />
    {:else if activeTab === 'c6'}
      <C6CompetitorTab />
    {:else if activeTab === 'topsis'}
      <TopsisSimulationTab />
    {/if}
  </div>
</div>
