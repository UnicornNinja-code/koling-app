<script lang="ts">
  import { onMount } from 'svelte';
  import { armadaService, type ArmadaItem } from '../../services/armadaService';
  import ArmadaFormModal from '../../components/fleet/ArmadaFormModal.svelte';
  import { 
    Bike, 
    Plus, 
    Search, 
    Filter, 
    CheckCircle2, 
    AlertTriangle, 
    Wrench, 
    Trash2, 
    Edit2, 
    Layers, 
    User,
    Clock,
    RefreshCw
  } from 'lucide-svelte';
  import Alert from '../../components/ui/Alert.svelte';

  interface Props {
    onNavigate: (route: string) => void;
  }

  let { onNavigate }: Props = $props();

  let loading = $state(true);
  let armadas = $state<ArmadaItem[]>([]);
  let errorMsg = $state<string | null>(null);
  let successMsg = $state<string | null>(null);

  // Filters
  let searchQuery = $state('');
  let selectedType = $state('ALL');
  let selectedStatus = $state('ALL');

  // Modals state
  let formModalOpen = $state(false);
  let selectedArmada = $state<ArmadaItem | null>(null);

  const loadArmadas = async () => {
    loading = true;
    errorMsg = null;
    try {
      const data = await armadaService.getAllArmadas();
      armadas = data;
    } catch (err: any) {
      errorMsg = err?.response?.data?.msg || err?.message || 'Gagal memuat data armada gerobak.';
    } finally {
      loading = false;
    }
  };

  const handleToggleMaintenance = async (item: ArmadaItem) => {
    const isMaintenance = item.status === 'MAINTENANCE';
    const nextStatus = isMaintenance ? 'ACTIVE' : 'MAINTENANCE';

    try {
      await armadaService.updateArmada(item.id, { status: nextStatus });
      armadas = armadas.map((a) => (a.id === item.id ? { ...a, status: nextStatus } : a));
      successMsg = `Status unit ${item.code} diubah menjadi ${nextStatus}.`;
      setTimeout(() => (successMsg = null), 3000);
    } catch (err: any) {
      errorMsg = err?.response?.data?.msg || 'Gagal mengubah status pemeliharaan armada.';
    }
  };

  const handleDeleteArmada = async (item: ArmadaItem) => {
    if (item.status === 'IN_USE') {
      errorMsg = `Unit ${item.code} sedang bertugas di lapangan (IN_USE) dan tidak dapat dihapus.`;
      setTimeout(() => (errorMsg = null), 3500);
      return;
    }

    if (!confirm(`Hapus unit armada "${item.code}" dari sistem?`)) return;

    try {
      await armadaService.deleteArmada(item.id);
      armadas = armadas.filter((a) => a.id !== item.id);
      successMsg = `Unit armada ${item.code} berhasil dihapus.`;
      setTimeout(() => (successMsg = null), 3000);
    } catch (err: any) {
      errorMsg = err?.response?.data?.msg || 'Gagal menghapus unit armada.';
    }
  };

  const openCreateModal = () => {
    selectedArmada = null;
    formModalOpen = true;
  };

  const openEditModal = (item: ArmadaItem) => {
    selectedArmada = item;
    formModalOpen = true;
  };

  const filteredArmadas = $derived(
    armadas.filter((a) => {
      const matchSearch =
        (a.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.current_rider_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'ALL' || a.type === selectedType;
      const matchStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
      return matchSearch && matchType && matchStatus;
    })
  );

  onMount(() => {
    loadArmadas();
  });
</script>

<div class="space-y-6 pb-12 font-outfit-400">
  <!-- TOP TOOLBAR: Breadcrumbs & Page Title -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#24242A]">
    <div>
      <div class="text-[11px] font-outfit-600 text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
        <span>Master Data</span>
        <span>•</span>
        <span class="text-[#FF634A]">Armada Gerobak Kopi</span>
      </div>
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-outfit-600 text-white tracking-tight leading-tight mt-0.5">
        Manajemen Master Armada & Unit Operasional
      </h2>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        onclick={openCreateModal}
        class="pill-btn-orange text-xs font-outfit-600 cursor-pointer"
      >
        <span class="px-4 py-2 flex items-center gap-1.5 text-white font-bold">
          <Plus class="w-4 h-4" />
          <span>Registrasi Armada</span>
        </span>
      </button>

      <button
        onclick={() => onNavigate('/dashboard')}
        class="pill-btn-white text-xs font-outfit-600"
      >
        <span class="px-3.5 py-1.5 flex items-center gap-1.5 text-[#09090B]">
          <i class="ri-dashboard-line text-sm text-[#FF634A]"></i>
          <span>Kembali ke Dashboard</span>
        </span>
      </button>
    </div>
  </div>

  <!-- QUICK STATS CARDS -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
    <div class="p-4 rounded-3xl bg-[#131316] border border-[#24242A] space-y-1 shadow-md">
      <div class="flex items-center justify-between text-xs font-outfit-600 text-[#71717A] uppercase">
        <span>Total Armada</span>
        <Bike class="w-4 h-4 text-white" />
      </div>
      <div class="text-2xl font-outfit-600 text-white font-mono">{armadas.length} <span class="text-xs text-[#A1A1AA] font-normal">Unit</span></div>
      <span class="text-[11px] text-[#A1A1AA]">Seluruh Inventaris</span>
    </div>

    <div class="p-4 rounded-3xl bg-[#131316] border border-[#24242A] space-y-1 shadow-md">
      <div class="flex items-center justify-between text-xs font-outfit-600 text-[#71717A] uppercase">
        <span>Bertugas (In-Use)</span>
        <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
      </div>
      <div class="text-2xl font-outfit-600 text-blue-400 font-mono">
        {armadas.filter((a) => a.status === 'IN_USE').length} <span class="text-xs text-blue-400/70 font-normal">Unit</span>
      </div>
      <span class="text-[11px] text-blue-400/80">Aktif di Lapangan</span>
    </div>

    <div class="p-4 rounded-3xl bg-[#131316] border border-[#24242A] space-y-1 shadow-md">
      <div class="flex items-center justify-between text-xs font-outfit-600 text-[#71717A] uppercase">
        <span>Tersedia (Ready)</span>
        <CheckCircle2 class="w-4 h-4 text-emerald-400" />
      </div>
      <div class="text-2xl font-outfit-600 text-emerald-400 font-mono">
        {armadas.filter((a) => a.status === 'ACTIVE' || a.status === 'AVAILABLE').length} <span class="text-xs text-emerald-400/70 font-normal">Unit</span>
      </div>
      <span class="text-[11px] text-emerald-400/80">Standby di Hub</span>
    </div>

    <div class="p-4 rounded-3xl bg-[#131316] border border-[#24242A] space-y-1 shadow-md">
      <div class="flex items-center justify-between text-xs font-outfit-600 text-[#71717A] uppercase">
        <span>Servis / Bengkel</span>
        <Wrench class="w-4 h-4 text-rose-400" />
      </div>
      <div class="text-2xl font-outfit-600 text-rose-400 font-mono">
        {armadas.filter((a) => a.status === 'MAINTENANCE').length} <span class="text-xs text-rose-400/70 font-normal">Unit</span>
      </div>
      <span class="text-[11px] text-rose-400/80">Dalam Perbaikan</span>
    </div>
  </div>

  <!-- Feedback Alerts -->
  {#if errorMsg}
    <Alert variant="danger" title="Kendala">{errorMsg}</Alert>
  {/if}

  {#if successMsg}
    <Alert variant="success" title="Berhasil">{successMsg}</Alert>
  {/if}

  <!-- MAIN ARMADAS TABLE CONTAINER -->
  <div class="p-5 sm:p-6 rounded-3xl bg-[#131316] border border-[#24242A] shadow-xl space-y-5">
    <!-- Filter Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-sm">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
        <input
          type="text"
          placeholder="Cari nomor seri, rider..."
          bind:value={searchQuery}
          class="w-full pl-9 pr-4 py-2 text-xs bg-[#1A1A1F] border border-[#2E2E38] rounded-xl text-white placeholder-[#71717A] focus:border-[#FF634A] focus:outline-none"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Type Filter -->
        <select
          bind:value={selectedType}
          class="px-3 py-2 rounded-xl bg-[#1A1A1F] border border-[#2E2E38] text-white text-xs font-outfit-600 focus:border-[#FF634A] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Semua Tipe</option>
          <option value="GEROBAK">Gerobak Manual</option>
          <option value="MOTOR_LISTRIK">Motor Listrik (E-Bike)</option>
          <option value="LAINNYA">Lainnya</option>
        </select>

        <!-- Status Filter -->
        <select
          bind:value={selectedStatus}
          class="px-3 py-2 rounded-xl bg-[#1A1A1F] border border-[#2E2E38] text-white text-xs font-outfit-600 focus:border-[#FF634A] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">ACTIVE / AVAILABLE</option>
          <option value="IN_USE">IN_USE (Bertugas)</option>
          <option value="MAINTENANCE">MAINTENANCE (Servis)</option>
          <option value="RESERVED">RESERVED</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-2xl border border-[#24242A] overflow-hidden bg-[#16161A]">
      <table class="w-full text-xs text-left">
        <thead class="bg-[#1C1C22] text-[#71717A] uppercase text-[10px] font-outfit-600 border-b border-[#24242A]">
          <tr>
            <th class="py-3 px-4">Nomor Seri / Kode Unit</th>
            <th class="py-3 px-4">Tipe Armada</th>
            <th class="py-3 px-3 text-center">Status Operasional</th>
            <th class="py-3 px-4">Rider Bertugas</th>
            <th class="py-3 px-4">Waktu Terdaftar</th>
            <th class="py-3 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#24242A]">
          {#if loading}
            <tr>
              <td colspan="6" class="py-8 text-center text-xs text-[#A1A1AA]">
                <div class="inline-block w-6 h-6 border-2 border-[#FF634A] border-t-transparent rounded-full animate-spin mb-2"></div>
                <div>Memuat data master armada gerobak...</div>
              </td>
            </tr>
          {:else if filteredArmadas.length === 0}
            <tr>
              <td colspan="6" class="py-8 text-center text-xs text-[#71717A]">
                Tidak ada data unit armada yang sesuai filter pencarian.
              </td>
            </tr>
          {:else}
            {#each filteredArmadas as item}
              <tr class="hover:bg-[#1D1D24] transition-colors">
                <td class="py-3 px-4 font-outfit-600 text-white flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-[#24242C] text-[#FF634A] flex items-center justify-center font-mono font-bold text-xs border border-[#33333E]">
                    <Bike class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="font-bold text-sm tracking-wide font-mono">{item.code}</div>
                    <div class="text-[10px] text-[#71717A]">ID Unit #{item.id}</div>
                  </div>
                </td>

                <td class="py-3 px-4 text-zinc-300">
                  {#if item.type === 'MOTOR_LISTRIK'}
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-outfit-600 bg-purple-950/40 text-purple-300 border border-purple-800/40">
                      Motor Listrik / E-Bike
                    </span>
                  {:else if item.type === 'GEROBAK'}
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-outfit-600 bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Gerobak Manual
                    </span>
                  {:else}
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-outfit-600 bg-amber-950/40 text-amber-300 border border-amber-800/40">
                      Unit Khusus
                    </span>
                  {/if}
                </td>

                <td class="py-3 px-3 text-center">
                  {#if item.status === 'ACTIVE' || item.status === 'AVAILABLE'}
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-outfit-600 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                      AVAILABLE
                    </span>
                  {:else if item.status === 'IN_USE'}
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-outfit-600 bg-blue-950/40 text-blue-400 border border-blue-800/40">
                      IN_USE
                    </span>
                  {:else if item.status === 'MAINTENANCE'}
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-outfit-600 bg-rose-950/40 text-rose-400 border border-rose-800/40">
                      SERVIS / BENGKEL
                    </span>
                  {:else}
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-outfit-600 bg-amber-950/40 text-amber-400 border border-amber-800/40">
                      {item.status}
                    </span>
                  {/if}
                </td>

                <td class="py-3 px-4">
                  {#if item.current_rider_name}
                    <div class="flex items-center gap-1.5 font-outfit-600 text-white text-xs">
                      <User class="w-3.5 h-3.5 text-[#FF634A]" />
                      <span>{item.current_rider_name}</span>
                    </div>
                  {:else}
                    <span class="text-[11px] text-[#71717A] italic">— Tersedia di Hub</span>
                  {/if}
                </td>

                <td class="py-3 px-4 font-mono text-[11px] text-[#71717A]">
                  {new Date(item.created_at || '').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>

                <!-- Contextual Actions -->
                <td class="py-3 px-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onclick={() => openEditModal(item)}
                      class="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-[#24242C] transition-colors cursor-pointer"
                      title="Edit Data Armada"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onclick={() => handleToggleMaintenance(item)}
                      class="p-1.5 rounded-lg transition-colors cursor-pointer
                      {item.status === 'MAINTENANCE' ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-amber-400 hover:bg-amber-950/40'}"
                      title={item.status === 'MAINTENANCE' ? 'Selesai Servis (Set Ready)' : 'Set Masuk Bengkel'}
                    >
                      <Wrench class="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onclick={() => handleDeleteArmada(item)}
                      disabled={item.status === 'IN_USE'}
                      class="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Hapus Unit Armada"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- MODALS -->
<ArmadaFormModal
  open={formModalOpen}
  onClose={() => (formModalOpen = false)}
  armadaToEdit={selectedArmada}
  onSuccess={loadArmadas}
/>
