<script lang="ts">
  import { Loader2 } from 'lucide-svelte';

  interface Props {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isPending?: boolean;
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: any;
    rightIcon?: any;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: any;
  }

  let {
    type = 'button',
    variant = 'primary',
    size = 'md',
    isPending = false,
    loading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    class: className = '',
    onclick,
    children,
  }: Props = $props();

  const isSpinning = $derived(isPending || loading);

  const variantStyles = {
    primary: 'bg-[#FF634A] hover:bg-[#E54E36] active:bg-[#B82814] text-white shadow-xs border border-transparent',
    secondary: 'bg-[#E7E7E7] hover:bg-[#D2D2D4] text-[#18181B] border border-[#D2D2D4]',
    outline: 'bg-white hover:bg-[#F4F4F6] text-[#18181B] border border-[#D2D2D4]',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-xs border border-transparent',
    ghost: 'bg-transparent hover:bg-[#E7E7E7] text-[#52525B]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-5 py-3 text-base rounded-xl gap-2.5',
  };
</script>

<button
  {type}
  disabled={disabled || isSpinning}
  {onclick}
  class="inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] {variantStyles[variant]} {sizeStyles[size]} {className}"
>
  {#if isSpinning}
    <Loader2 class="w-4 h-4 animate-spin shrink-0" />
  {:else if LeftIcon}
    <LeftIcon class="w-4 h-4 shrink-0" />
  {/if}

  <span>
    {@render children?.()}
  </span>

  {#if !isSpinning && RightIcon}
    <RightIcon class="w-4 h-4 shrink-0" />
  {/if}
</button>
