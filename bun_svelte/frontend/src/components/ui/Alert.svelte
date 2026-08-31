<script lang="ts">
  import { 
    AlertCircle, 
    CheckCircle2, 
    AlertTriangle, 
    Info 
  } from 'lucide-svelte';

  interface Props {
    variant?: 'danger' | 'success' | 'warning' | 'info';
    title?: string;
    children?: any;
    class?: string;
  }

  let { 
    variant = 'info', 
    title = '', 
    children, 
    class: className = '' 
  }: Props = $props();

  const variantStyles = {
    danger: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
    success: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]',
    warning: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
    info: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]',
  };
</script>

<div class="p-3.5 rounded-xl border text-xs flex items-start gap-3 shadow-xs {variantStyles[variant]} {className}" role="alert">
  <div class="shrink-0 mt-0.5">
    {#if variant === 'danger'}
      <AlertCircle class="w-4 h-4" />
    {:else if variant === 'success'}
      <CheckCircle2 class="w-4 h-4" />
    {:else if variant === 'warning'}
      <AlertTriangle class="w-4 h-4" />
    {:else}
      <Info class="w-4 h-4" />
    {/if}
  </div>
  <div class="flex-1 space-y-0.5 leading-relaxed">
    {#if title}
      <h4 class="font-bold text-xs">{title}</h4>
    {/if}
    <div class="text-[11px] opacity-95">
      {@render children?.()}
    </div>
  </div>
</div>
