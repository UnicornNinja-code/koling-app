<script lang="ts">
  import { Coffee, Edit2, Trash2, CheckCircle2, XCircle, Tag, TrendingUp } from 'lucide-svelte';
  import type { ProductItem } from '../../services/productService';
  import Badge from '../ui/Badge.svelte';

  interface Props {
    product: ProductItem;
    readOnly?: boolean;
    onEdit?: (product: ProductItem) => void;
    onToggleStatus?: (product: ProductItem) => void;
    onDelete?: (product: ProductItem) => void;
  }

  let { product, readOnly = false, onEdit, onToggleStatus, onDelete }: Props = $props();

  const margin = $derived(
    product.price > 0 && product.base_price > 0
      ? (((product.price - product.base_price) / product.price) * 100).toFixed(1)
      : '0.0'
  );

  const isAvailable = $derived(product.status === 'AVAILABLE');
</script>

<div class="bg-white rounded-2xl border border-[#D2D2D4] p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden">
  <div>
    <!-- Top Image Container -->
    <div class="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-[#F4F4F6] border border-zinc-100 flex items-center justify-center mb-3">
      {#if product.image_url}
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      {:else}
        <div class="flex flex-col items-center justify-center text-zinc-400 gap-1">
          <Coffee class="w-10 h-10 stroke-1" />
          <span class="text-[10px] font-bold">Tanpa Foto</span>
        </div>
      {/if}

      <!-- Floating Status Badge (Top Right) -->
      <div class="absolute top-2 right-2 shadow-xs">
        <Badge variant={isAvailable ? 'success' : 'danger'}>
          {isAvailable ? 'TERSEDIA' : 'NONAKTIF'}
        </Badge>
      </div>

      <!-- Category Tag (Bottom Left) -->
      <div class="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#D2D2D4] shadow-xs text-[10px] font-bold text-[#18181B] flex items-center gap-1">
        <Tag class="w-3 h-3 text-[#FF634A]" />
        <span>{product.category || 'KOPI'}</span>
      </div>
    </div>

    <!-- Product Title & SKU -->
    <div class="space-y-0.5">
      <div class="text-[10px] font-mono font-bold text-[#8E8E93] uppercase tracking-wider">
        {product.sku || 'COZ-PROD-000'}
      </div>
      <h4 class="text-sm font-extrabold text-[#18181B] tracking-tight leading-snug line-clamp-1" title={product.name}>
        {product.name}
      </h4>
      {#if product.description}
        <p class="text-[11px] text-[#52525B] line-clamp-1 leading-tight">{product.description}</p>
      {/if}
    </div>

    <!-- Pricing Breakdown & Gross Margin -->
    <div class="mt-3 pt-2.5 border-t border-zinc-100 space-y-1 text-xs">
      <div class="flex items-center justify-between">
        <span class="text-[11px] text-[#8E8E93]">HPP (Modal):</span>
        <span class="font-bold text-[#52525B]">Rp {product.base_price ? product.base_price.toLocaleString('id-ID') : '-'}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[11px] text-[#8E8E93]">Harga Jual:</span>
        <span class="font-extrabold text-[#FF634A] text-sm">Rp {product.price.toLocaleString('id-ID')}</span>
      </div>
      <div class="flex items-center justify-between pt-1 border-t border-dashed border-zinc-200">
        <span class="text-[10px] font-bold text-[#52525B] flex items-center gap-0.5">
          <TrendingUp class="w-3 h-3 text-emerald-600" />
          Gross Margin:
        </span>
        <span class="text-[11px] font-extrabold text-emerald-600">+{margin}%</span>
      </div>
    </div>
  </div>

  <!-- Footer Actions (Superadmin Only) -->
  {#if !readOnly}
    <div class="mt-3.5 pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
      <!-- Toggle Availability Switch -->
      <button
        onclick={() => onToggleStatus && onToggleStatus(product)}
        class="text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer px-2 py-1 rounded-lg border
        {isAvailable 
          ? 'bg-zinc-50 border-zinc-200 text-[#52525B] hover:bg-zinc-100' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}"
        title="Ubah Ketersediaan Menu"
      >
        <span>{isAvailable ? 'Nonaktifkan' : 'Aktifkan'}</span>
      </button>

      <!-- Edit & Delete Buttons -->
      <div class="flex items-center gap-1">
        <button
          onclick={() => onEdit && onEdit(product)}
          class="p-1.5 rounded-lg bg-zinc-100 text-[#18181B] hover:bg-[#FFF2EF] hover:text-[#FF634A] transition-all cursor-pointer"
          title="Edit Menu"
        >
          <Edit2 class="w-3.5 h-3.5" />
        </button>

        <button
          onclick={() => onDelete && onDelete(product)}
          class="p-1.5 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
          title="Hapus Menu"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  {/if}
</div>
