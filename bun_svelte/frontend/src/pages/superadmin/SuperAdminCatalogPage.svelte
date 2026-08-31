<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    Search, 
    LayoutGrid, 
    List, 
    Tag, 
    Coffee, 
    TrendingUp, 
    RefreshCw,
    Edit2,
    Trash2,
    CheckCircle2
  } from 'lucide-svelte';
  import { productService, type ProductItem } from '../../services/productService';
  import ProductCard from '../../components/catalog/ProductCard.svelte';
  import ProductModal from '../../components/catalog/ProductModal.svelte';
  import DeleteGuardModal from '../../components/catalog/DeleteGuardModal.svelte';
  import Badge from '../../components/ui/Badge.svelte';

  interface Props {
    onNavigate: (route: string) => void;
  }

  let { onNavigate }: Props = $props();

  let products = $state<ProductItem[]>([]);
  let loading = $state(true);
  let searchQuery = $state('');
  let selectedCategory = $state('ALL');
  let selectedStatus = $state('ALL');
  let viewMode = $state<'GRID' | 'LIST'>('GRID');

  // Modals state
  let formModalOpen = $state(false);
  let selectedProductForEdit = $state<ProductItem | null>(null);
  let deleteModalOpen = $state(false);
  let selectedProductForDelete = $state<ProductItem | null>(null);

  const loadProducts = async () => {
    loading = true;
    try {
      const res = await productService.getProducts({
        status: selectedStatus,
        category: selectedCategory,
        search: searchQuery,
        limit: 100,
      });
      products = res.products;
    } catch (err) {
      console.warn('Gagal memuat produk:', err);
    } finally {
      loading = false;
    }
  };

  const handleOpenAdd = () => {
    selectedProductForEdit = null;
    formModalOpen = true;
  };

  const handleOpenEdit = (p: ProductItem) => {
    selectedProductForEdit = p;
    formModalOpen = true;
  };

  const handleOpenDelete = (p: ProductItem) => {
    selectedProductForDelete = p;
    deleteModalOpen = true;
  };

  const handleToggleStatus = async (p: ProductItem) => {
    const nextStatus = p.status === 'AVAILABLE' ? 'DISCONTINUED' : 'AVAILABLE';
    try {
      await productService.updateStatus(p.id, nextStatus);
      await loadProducts();
    } catch (e) {
      console.warn('Gagal toggle status produk:', e);
    }
  };

  // Aggregated Stats
  let totalKopi = $derived(products.filter((p) => (p.category || 'KOPI') === 'KOPI').length);
  let totalNonKopi = $derived(products.filter((p) => (p.category || '') === 'NON_KOPI').length);
  let avgMargin = $derived(
    products.length > 0
      ? (
          products.reduce((sum, p) => {
            if (p.price > 0 && p.base_price > 0) {
              return sum + ((p.price - p.base_price) / p.price) * 100;
            }
            return sum;
          }, 0) / products.length
        ).toFixed(1)
      : '0.0'
  );

  onMount(() => {
    loadProducts();
  });
</script>

<div class="space-y-5 pb-8">
  <!-- TOP TOOLBAR & BREADCRUMB -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D2D2D4]">
    <div>
      <div class="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">Master Data & Produk</div>
      <h2 class="text-xl sm:text-2xl font-extrabold text-[#18181B] tracking-tight leading-tight">
        Katalog Produk & Pricing
      </h2>
    </div>

    <!-- Top Action & Metric Summary -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D2D2D4] text-xs font-bold text-[#52525B]">
        <span>Kopi: <strong class="text-[#18181B]">{totalKopi}</strong></span>
        <span class="text-zinc-300">|</span>
        <span>Non-Kopi: <strong class="text-[#18181B]">{totalNonKopi}</strong></span>
        <span class="text-zinc-300">|</span>
        <span class="text-emerald-700 flex items-center gap-0.5">
          <TrendingUp class="w-3.5 h-3.5 text-emerald-600" />
          Margin Avg: +{avgMargin}%
        </span>
      </div>

      <button
        onclick={handleOpenAdd}
        class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF634A] hover:bg-[#E54E36] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>+ Tambah Menu</span>
      </button>
    </div>
  </div>

  <!-- TOOLBAR FILTERS & SEARCH -->
  <div class="bg-white rounded-2xl border border-[#D2D2D4] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
    <!-- Search Input -->
    <div class="relative w-full md:w-80">
      <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
      <input
        type="text"
        bind:value={searchQuery}
        oninput={() => loadProducts()}
        placeholder="Cari nama menu, SKU..."
        class="w-full pl-9 pr-3 py-2 text-xs bg-[#F4F4F6] border border-[#D2D2D4] rounded-xl focus:outline-none focus:border-[#FF634A] text-[#18181B] font-medium"
      />
    </div>

    <!-- Category Pills -->
    <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
      {#each [
        { label: 'Semua', value: 'ALL' },
        { label: 'Kopi', value: 'KOPI' },
        { label: 'Non-Kopi', value: 'NON_KOPI' },
        { label: 'Makanan', value: 'MAKANAN' }
      ] as cat}
        <button
          onclick={() => { selectedCategory = cat.value; loadProducts(); }}
          class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border
          {selectedCategory === cat.value 
            ? 'bg-[#FF634A] border-[#FF634A] text-white shadow-xs' 
            : 'bg-[#F4F4F6] border-[#D2D2D4] text-[#52525B] hover:text-[#18181B] hover:bg-white'}"
        >
          {cat.label}
        </button>
      {/each}
    </div>

    <!-- Status Filter & View Toggle -->
    <div class="flex items-center gap-2 w-full md:w-auto justify-end">
      <select
        bind:value={selectedStatus}
        onchange={() => loadProducts()}
        class="px-3 py-2 text-xs bg-[#F4F4F6] border border-[#D2D2D4] rounded-xl font-bold text-[#18181B] focus:outline-none focus:border-[#FF634A] cursor-pointer"
      >
        <option value="ALL">Semua Status</option>
        <option value="AVAILABLE">Tersedia</option>
        <option value="DISCONTINUED">Nonaktif</option>
      </select>

      <!-- View Switcher -->
      <div class="inline-flex rounded-xl bg-[#F4F4F6] p-1 border border-[#D2D2D4]">
        <button
          onclick={() => viewMode = 'GRID'}
          class="p-1.5 rounded-lg transition-all cursor-pointer {viewMode === 'GRID' ? 'bg-white text-[#FF634A] shadow-xs' : 'text-[#8E8E93] hover:text-[#18181B]'}"
          title="Tampilan Grid"
        >
          <LayoutGrid class="w-4 h-4" />
        </button>
        <button
          onclick={() => viewMode = 'LIST'}
          class="p-1.5 rounded-lg transition-all cursor-pointer {viewMode === 'LIST' ? 'bg-white text-[#FF634A] shadow-xs' : 'text-[#8E8E93] hover:text-[#18181B]'}"
          title="Tampilan Tabel"
        >
          <List class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>

  <!-- PRODUCT LIST VIEWPORT -->
  {#if loading}
    <div class="py-16 text-center text-xs text-[#8E8E93] flex flex-col items-center justify-center gap-2">
      <RefreshCw class="w-6 h-6 text-[#FF634A] animate-spin" />
      <span>Memuat data katalog produk real...</span>
    </div>
  {:else if products.length === 0}
    <div class="py-16 text-center text-xs text-[#8E8E93] bg-white rounded-2xl border border-[#D2D2D4] p-8 flex flex-col items-center justify-center gap-2">
      <Coffee class="w-10 h-10 text-zinc-300 stroke-1" />
      <span class="font-bold text-sm text-[#18181B]">Tidak ada menu ditemukan</span>
      <p class="text-[#52525B] max-w-sm">Coba ubah kata kunci pencarian atau filter kategori untuk menemukan produk.</p>
    </div>
  {:else if viewMode === 'GRID'}
    <!-- Grid Layout (4 columns on Desktop) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each products as product (product.id)}
        <ProductCard
          {product}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleOpenDelete}
        />
      {/each}
    </div>
  {:else}
    <!-- Table List Layout -->
    <div class="bg-white rounded-2xl border border-[#D2D2D4] shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-[#18181B]">
          <thead class="bg-[#F4F4F6] text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider border-b border-[#D2D2D4]">
            <tr>
              <th class="py-3 px-4">Menu & Foto</th>
              <th class="py-3 px-4">SKU</th>
              <th class="py-3 px-4">Kategori</th>
              <th class="py-3 px-4 text-right">HPP (Modal)</th>
              <th class="py-3 px-4 text-right">Harga Jual</th>
              <th class="py-3 px-4 text-right">Margin Laba</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 font-medium">
            {#each products as p (p.id)}
              {@const isAvail = p.status === 'AVAILABLE'}
              {@const margin = p.price > 0 && p.base_price > 0 ? (((p.price - p.base_price) / p.price) * 100).toFixed(1) : '0.0'}
              <tr class="hover:bg-zinc-50 transition-colors">
                <td class="py-3 px-4 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-[#F4F4F6] overflow-hidden border border-zinc-200 shrink-0 flex items-center justify-center">
                    {#if p.image_url}
                      <img src={p.image_url} alt={p.name} class="w-full h-full object-cover" />
                    {:else}
                      <Coffee class="w-5 h-5 text-zinc-300" />
                    {/if}
                  </div>
                  <div>
                    <div class="font-extrabold text-[#18181B]">{p.name}</div>
                    {#if p.description}
                      <div class="text-[10px] text-[#8E8E93] line-clamp-1 max-w-xs">{p.description}</div>
                    {/if}
                  </div>
                </td>
                <td class="py-3 px-4 font-mono font-bold text-[#8E8E93]">{p.sku || '-'}</td>
                <td class="py-3 px-4 font-bold text-[#52525B]">{p.category || 'KOPI'}</td>
                <td class="py-3 px-4 text-right font-bold text-[#52525B]">Rp {p.base_price ? p.base_price.toLocaleString('id-ID') : '-'}</td>
                <td class="py-3 px-4 text-right font-extrabold text-[#FF634A]">Rp {p.price.toLocaleString('id-ID')}</td>
                <td class="py-3 px-4 text-right font-extrabold text-emerald-600">+{margin}%</td>
                <td class="py-3 px-4 text-center">
                  <Badge variant={isAvail ? 'success' : 'danger'}>
                    {isAvail ? 'TERSEDIA' : 'NONAKTIF'}
                  </Badge>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      onclick={() => handleOpenEdit(p)}
                      class="p-1.5 rounded-lg bg-zinc-100 text-[#18181B] hover:bg-[#FFF2EF] hover:text-[#FF634A] transition-all cursor-pointer"
                      title="Edit Menu"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      onclick={() => handleOpenDelete(p)}
                      class="p-1.5 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                      title="Hapus / Nonaktifkan"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<!-- Form Modal Add / Edit -->
<ProductModal
  isOpen={formModalOpen}
  productToEdit={selectedProductForEdit}
  onClose={() => formModalOpen = false}
  onSuccess={loadProducts}
/>

<!-- Delete Guard Modal -->
<DeleteGuardModal
  isOpen={deleteModalOpen}
  product={selectedProductForDelete}
  onClose={() => deleteModalOpen = false}
  onSuccess={loadProducts}
/>
