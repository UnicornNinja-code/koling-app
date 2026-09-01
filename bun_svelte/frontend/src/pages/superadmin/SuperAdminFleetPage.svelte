<script lang="ts">
  import { onMount } from 'svelte';
  import { armadaService, type ArmadaItem, type FleetIssueItem } from '../../services/armadaService';
  import ArmadaFormModal from '../../components/fleet/ArmadaFormModal.svelte';
  import ArmadaHistoryModal from '../../components/fleet/ArmadaHistoryModal.svelte';
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
    RefreshCw,
    History,
    ShieldAlert,
    Check,
    Tag,
    Inbox
  } from 'lucide-svelte';
  import Alert from '../../components/ui/Alert.svelte';

  interface Props {
    onNavigate: (route: string) => void;
  }

  let { onNavigate }: Props = $props();

  let activeTab = $state<'INVENTARIS' | 'ISSUES'>('INVENTARIS');

  let loading = $state(true);
  let armadas = $state<ArmadaItem[]>([]);
  let issues = $state<FleetIssueItem[]>([]);
  let errorMsg = $state<string | null>(null);
  let successMsg = $state<string | null>(null);

  // Filters
  let searchQuery = $state('');
  let selectedType = $state('ALL');
  let selectedStatus = $state('ALL');
  let selectedReservation = $state('ALL');

  // Modals state
  let formModalOpen = $state(false);
  let historyModalOpen = $state(false);
  let selectedArmada = $state<ArmadaItem | null>(null);

  const loadData = async () => {
    loading = true;
    errorMsg = null;
    try {
      const [armadaData, issueData] = await Promise.all([
        armadaService.getAllArmadas(),
        armadaService.getAllIssueReports(),
      ]);
      armadas = armadaData;
      issues = issueData;
    } catch (err: any) {
      errorMsg = err?.response?.data?.msg || err?.message || 'Gagal memuat data armada gerobak.';
    } finally {
      loading = false;
    }
  };

  const handleToggleMaintenance = async (item: ArmadaItem) => {
    const isMaintenance = item.status === 'MAINTENANCE';
    const nextStatus = isMaintenance ? 'ACTIVE' : 'MAINTENANCE';

    if (!isMaintenance && item.current_rider_id) {
      errorMsg = `Unit ${item.code} sedang bertugas di lapangan. Pengembalian harus diselesaikan terlebih dahulu.`;
      setTimeout(() => (errorMsg = null), 4000);
      return;
    }

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
    if (item.current_rider_id || item.status === 'IN_USE') {
      errorMsg = `Unit ${item.code} sedang bertugas di lapangan dan tidak dapat dihapus.`;
      setTimeout(() => (errorMsg = null), 3500);
      return;
    }

    if (!confirm(`Hapus permanen unit armada "${item.code}" dari sistem?`)) return;

    try {
      await armadaService.deleteArmada(item.id);
      armadas = armadas.filter((a) => a.id !== item.id);
      successMsg = `Unit armada ${item.code} berhasil dihapus.`;
      setTimeout(() => (successMsg = null), 3000);
    } catch (err: any) {
      errorMsg = err?.response?.data?.msg || 'Gagal menghapus unit armada.';
    }
  };

  const handleResolveIssue = async (issueId: string, action: 'RESOLVED' | 'SENT_TO_MAINTENANCE') => {
    try {
      await armadaService.resolveIssueReport(issueId, {
        status: action,
        resolution_notes: action === 'SENT_TO_MAINTENANCE' ? 'Unit dipindahkan ke bengkel perbaikan oleh admin.' : 'Masalah telah selesai ditangani.',
      });
      successMsg = action === 'SENT_TO_MAINTENANCE' ? 'Unit armada dipindahkan ke status MAINTENANCE.' : 'Kendala ditandai telah selesai.';
      setTimeout(() => (successMsg = null), 3000);
      loadData();
    } catch (err: any) {
      errorMsg = err?.response?.data?.msg || 'Gagal memproses laporan kendala.';
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

  const openHistoryModal = (item: ArmadaItem) => {
    selectedArmada = item;
    historyModalOpen = true;
  };

  const filteredArmadas = $derived(
    armadas.filter((a) => {
      const matchSearch =
        (a.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.current_rider_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'ALL' || a.type === selectedType;
      const matchStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
      const matchRes = selectedReservation === 'ALL' || a.reservation_state === selectedReservation;
      return matchSearch && matchType && matchStatus && matchRes;
    })
  );

  onMount(() => {
    loadData();
  });
</script>

<div class="space-y-6 pb-12 font-outfit-400">
  <!-- TOP TOOLBAR: Breadcrumbs & Page Title -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#24242A]">
    <div>
      <div class="text-[11px] font-outfit-600 text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
        <span>Master Data</span>
        <span>•</span>
        <span class="text-[#FF634A]">Manajemen Armada 3-Dimensi</span>
      </div>
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-outfit-600 text-white tracking-tight leading-tight mt-0.5">
        Master Armada, Status 3-Dimensi & Bengkel
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

  <!-- QUICK STATS CARDS: 3-DIMENSION METRICS -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
    <div class="p-4 rounded-3xl bg-[#131316] border border-[#24242A] space-y-1 shadow-md">
      <div class="flex items-center justify-between text-xs font-outfit-600 text-[#71717A] uppercase">
        <span>Total Unit</span>
        <Bike class="w-4 h-4 text-white" />
      </div>
      <div class="text-2xl font-outfit-600 text-white font-mono">{armadas.length} <span class="text-xs text-[#A1A1AA] font-normal">Unit</span></div>
      <span class="text-[11px] text-[#A1A1AA]">Seluruh Inventaris</span>
    </div>

    <div class="p-4 rounded-3xl bg-[#131316] border border-[#24242A] space-y-1 shadow-md">
      <div class="flex items-center justify-between text-xs font-outfit-600 text-[#71717A] uppercase">
        <span>Aktif di Lapangan</span>
        <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
      </div>
      <div class="text-2xl font-outfit-600 text-blue-400 font-mono">
        {armadas.filter((a) => a.current_rider_id || a.assignment_state === 'IN_USE').length} <span class="text-xs text-blue-400/70 font-normal">Unit</span>
      </div>
      <span class="text-[11px] text-blue-400/80">Penugasan Bertugas</span>
    </div>

    <div class="p-4 rounded-3xl bg-[#131316] border border-[#24242A] space-y-1 shadow-md">
      <div class="flex items-center justify-between text-xs font-outfit-600 text-[#71717A] uppercase">
        <span>Standby di Hub</span>
        <CheckCircle2 class="w-4 h-4 text-emerald-400" />
      </div>
      <div class="text-2xl font-outfit-600 text-emerald-400 font-mono">
        {armadas.filter((a) => a.status === 'ACTIVE' && !a.current_rider_id && a.reservation_state !== 'HELD').length} <span class="text-xs text-emerald-400/70 font-normal">Unit</span>
      </div>
      <span class="text-[11px] text-emerald-400/80">Siap Ditugaskan</span>
    </div>

    <div class="p-4 rounded-3xl bg-[#131316] border border-[#24242A] space-y-1 shadow-md">
      <div class="flex items-center justify-between text-xs font-outfit-600 text-[#71717A] uppercase">
        <span>Perawatan / Bengkel</span>
        <Wrench class="w-4 h-4 text-rose-400" />
      </div>
      <div class="text-2xl font-outfit-600 text-rose-400 font-mono">
        {armadas.filter((a) => a.status === 'MAINTENANCE').length} <span class="text-xs text-rose-400/70 font-normal">Unit</span>
      </div>
      <span class="text-[11px] text-rose-400/80">Dalam Perbaikan</span>
    </div>
  </div>

  <!-- TAB NAVIGATION -->
  <div class="flex items-center gap-2 border-b border-[#24242A] pb-2">
    <button
      type="button"
      onclick={() => (activeTab = 'INVENTARIS')}
      class="px-4 py-2 rounded-xl text-xs font-outfit-600 transition-all cursor-pointer flex items-center gap-2
      {activeTab === 'INVENTARIS' ? 'bg-[#FF634A] text-[#09090B] font-bold shadow-md shadow-[#FF634A]/20' : 'bg-[#18181D] text-zinc-400 hover:text-white'}"
    >
      <Bike class="w-4 h-4" />
      <span>Daftar Inventaris Armada</span>
      <span class="px-1.5 py-0.2 rounded-md text-[10px] {activeTab === 'INVENTARIS' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'} font-mono">
        {armadas.length}
      </span>
    </button>

    <button
      type="button"
      onclick={() => (activeTab = 'ISSUES')}
      class="px-4 py-2 rounded-xl text-xs font-outfit-600 transition-all cursor-pointer flex items-center gap-2
      {activeTab === 'ISSUES' ? 'bg-[#FF634A] text-[#09090B] font-bold shadow-md shadow-[#FF634A]/20' : 'bg-[#18181D] text-zinc-400 hover:text-white'}"
    >
      <ShieldAlert class="w-4 h-4" />
      <span>Laporan Kerusakan & Bengkel</span>
      {#if issues.filter(i => i.status === 'REPORTED').length > 0}
        <span class="px-1.5 py-0.2 rounded-md bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse">
          {issues.filter(i => i.status === 'REPORTED').length}
        </span>
      {/if}
    </button>
  </div>

  <!-- Feedback Alerts -->
  {#if errorMsg}
    <Alert variant="danger" title="Kendala">{errorMsg}</Alert>
  {/if}

  {#if successMsg}
    <Alert variant="success" title="Berhasil">{successMsg}</Alert>
  {/if}

  {#if activeTab === 'INVENTARIS'}
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

          <!-- Status Lifecycle Filter -->
          <select
            bind:value={selectedStatus}
            class="px-3 py-2 rounded-xl bg-[#1A1A1F] border border-[#2E2E38] text-white text-xs font-outfit-600 focus:border-[#FF634A] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Lifecycle</option>
            <option value="ACTIVE">ACTIVE (Layak Operasi)</option>
            <option value="MAINTENANCE">MAINTENANCE (Perbaikan)</option>
            <option value="RETIRED">RETIRED (Pensiun)</option>
          </select>

          <!-- Reservation State Filter -->
          <select
            bind:value={selectedReservation}
            class="px-3 py-2 rounded-xl bg-[#1A1A1F] border border-[#2E2E38] text-white text-xs font-outfit-600 focus:border-[#FF634A] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Reservasi</option>
            <option value="AVAILABLE">AVAILABLE (Bebas)</option>
            <option value="HELD">HELD (Di-Hold 5 Mnt)</option>
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
              <th class="py-3 px-3 text-center">Status Lifecycle</th>
              <th class="py-3 px-3 text-center">Reservasi 5-Mnt</th>
              <th class="py-3 px-4">Penugasan Rider</th>
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
                <tr class="hover:bg-[#1D1D24] transition-colors {item.status === 'RETIRED' ? 'opacity-50' : ''}">
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
                        Motor Listrik (E-Bike)
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

                  <!-- 1. Fleet Lifecycle Status -->
                  <td class="py-3 px-3 text-center">
                    {#if item.status === 'ACTIVE'}
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-outfit-600 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                        ACTIVE
                      </span>
                    {:else if item.status === 'MAINTENANCE'}
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-outfit-600 bg-rose-950/40 text-rose-400 border border-rose-800/40">
                        MAINTENANCE
                      </span>
                    {:else}
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-outfit-600 bg-zinc-800 text-zinc-400 border border-zinc-700">
                        RETIRED
                      </span>
                    {/if}
                  </td>

                  <!-- 2. Reservation State -->
                  <td class="py-3 px-3 text-center">
                    {#if item.reservation_state === 'HELD'}
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-outfit-600 bg-amber-950/40 text-amber-300 border border-amber-800/40 flex items-center justify-center gap-1 mx-auto w-fit" title={item.reserved_by_rider_name ? `Di-Hold oleh ${item.reserved_by_rider_name}` : 'Di-Hold'}>
                        <Clock class="w-3 h-3 text-amber-400" />
                        <span>HELD</span>
                      </span>
                    {:else}
                      <span class="px-2 py-0.5 text-[10px] font-mono text-zinc-500">
                        AVAILABLE
                      </span>
                    {/if}
                  </td>

                  <!-- 3. Assignment State -->
                  <td class="py-3 px-4">
                    {#if item.current_rider_name}
                      <div class="flex items-center gap-1.5 font-outfit-600 text-blue-400 text-xs">
                        <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        <User class="w-3.5 h-3.5" />
                        <span>{item.current_rider_name}</span>
                      </div>
                    {:else}
                      <span class="text-[11px] text-[#71717A] italic">— Standby di Hub</span>
                    {/if}
                  </td>

                  <!-- Contextual Actions -->
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onclick={() => openHistoryModal(item)}
                        class="p-1.5 rounded-lg text-blue-400 hover:bg-blue-950/40 transition-colors cursor-pointer"
                        title="Lihat Riwayat Penugasan"
                      >
                        <History class="w-3.5 h-3.5" />
                      </button>

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
                        title={item.status === 'MAINTENANCE' ? 'Selesai Servis (Set ACTIVE)' : 'Set Masuk Bengkel (MAINTENANCE)'}
                      >
                        <Wrench class="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onclick={() => handleDeleteArmada(item)}
                        disabled={!!item.current_rider_id || item.status === 'IN_USE'}
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
  {:else}
    <!-- ISSUES & MAINTENANCE TAB -->
    <div class="p-5 sm:p-6 rounded-3xl bg-[#131316] border border-[#24242A] shadow-xl space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-[#24242A]">
        <div>
          <h3 class="text-base font-outfit-600 text-white">Daftar Laporan Kerusakan & Bengkel</h3>
          <p class="text-xs text-[#A1A1AA]">Laporan insiden / kendala unit dari rider saat bertugas di lapangan</p>
        </div>
        <button
          onclick={loadData}
          class="px-3 py-1.5 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A32] text-xs text-white font-outfit-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Refresh Laporan</span>
        </button>
      </div>

      {#if issues.length === 0}
        <div class="py-12 text-center text-xs text-zinc-500 space-y-2">
          <CheckCircle2 class="w-8 h-8 text-emerald-400/60 mx-auto" />
          <div>Semua unit armada dalam kondisi prima. Tidak ada laporan kendala aktif.</div>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each issues as issue}
            <div class="p-4 bg-[#18181D] border border-[#26262E] rounded-2xl space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-white text-sm">#{issue.armada_code}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-outfit-600
                  {issue.severity === 'CRITICAL' ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40' : 'bg-amber-950/50 text-amber-400 border border-amber-800/40'}">
                    {issue.severity}
                  </span>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono">
                  {new Date(issue.reported_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div class="text-xs space-y-1">
                <div class="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Tag class="w-3.5 h-3.5 text-[#FF634A]" />
                  <span>Komponen: {issue.issue_type}</span>
                </div>
                <p class="text-zinc-400 leading-relaxed bg-[#121215] p-2.5 rounded-xl border border-[#222228]">
                  "{issue.description}"
                </p>
                <div class="text-[11px] text-zinc-500 pt-1">
                  Dilaporkan oleh: <strong class="text-zinc-300">{issue.rider_name}</strong>
                </div>
              </div>

              <!-- Issue Action Buttons -->
              {#if issue.status === 'REPORTED'}
                <div class="pt-2 border-t border-[#24242A] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onclick={() => handleResolveIssue(issue.id, 'SENT_TO_MAINTENANCE')}
                    class="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wrench class="w-3.5 h-3.5" />
                    <span>Kirim ke Bengkel (Maintenance)</span>
                  </button>

                  <button
                    type="button"
                    onclick={() => handleResolveIssue(issue.id, 'RESOLVED')}
                    class="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check class="w-3.5 h-3.5" />
                    <span>Selesaikan Kendala</span>
                  </button>
                </div>
              {:else}
                <div class="pt-2 border-t border-[#24242A] flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Status: <strong class="text-emerald-400">{issue.status}</strong></span>
                  {#if issue.resolution_notes}
                    <span class="italic">"{issue.resolution_notes}"</span>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- MODALS -->
<ArmadaFormModal
  open={formModalOpen}
  onClose={() => (formModalOpen = false)}
  armadaToEdit={selectedArmada}
  onSuccess={loadData}
/>

<ArmadaHistoryModal
  open={historyModalOpen}
  onClose={() => (historyModalOpen = false)}
  armada={selectedArmada}
/>
