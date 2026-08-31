<script lang="ts">
  import { Eye, EyeOff } from 'lucide-svelte';

  interface Props {
    label?: string;
    type?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string | null;
    helperText?: string;
    leftIcon?: any;
    class?: string;
    name?: string;
    id?: string;
    autocomplete?: string;
  }

  let {
    label = '',
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    required = false,
    disabled = false,
    error = null,
    helperText = '',
    leftIcon: LeftIcon,
    class: className = '',
    name = '',
    id = '',
    autocomplete = 'off',
  }: Props = $props();

  const inputId = $derived(id || (name ? `input-${name}` : (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined)));
  let showPassword = $state(false);
  let isPassword = $derived(type === 'password');
  let currentType = $derived(isPassword ? (showPassword ? 'text' : 'password') : type);
</script>

<div class="space-y-1.5 w-full {className}">
  {#if label}
    <label for={inputId} class="block text-xs font-semibold text-[#18181B]">
      {label}
      {#if required}
        <span class="text-[#FF634A]">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative flex items-center">
    {#if LeftIcon}
      <div class="absolute left-3 text-[#8E8E93] pointer-events-none flex items-center justify-center">
        <LeftIcon class="w-4 h-4" />
      </div>
    {/if}

    <input
      id={inputId}
      type={currentType}
      bind:value={value}
      {placeholder}
      {disabled}
      {required}
      {name}
      autocomplete={autocomplete as any}
      class="w-full bg-white text-[#18181B] text-xs sm:text-sm rounded-xl border transition-colors duration-150 py-2.5 
      {LeftIcon ? 'pl-9' : 'pl-3.5'} 
      {isPassword ? 'pr-10' : 'pr-3.5'}
      {error ? 'border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] focus:border-[#EF4444]' : 'border-[#D2D2D4] focus:border-[#FF634A] focus:ring-1 focus:ring-[#FF634A]'}
      focus:outline-none placeholder:text-[#8E8E93] disabled:bg-[#F4F4F6] disabled:text-[#8E8E93]"
    />

    {#if isPassword}
      <button
        type="button"
        onclick={() => showPassword = !showPassword}
        class="absolute right-3 text-[#8E8E93] hover:text-[#18181B] transition-colors p-0.5 cursor-pointer"
        tabindex="-1"
      >
        {#if showPassword}
          <EyeOff class="w-4 h-4" />
        {:else}
          <Eye class="w-4 h-4" />
        {/if}
      </button>
    {/if}
  </div>

  {#if error}
    <p class="text-[11px] font-medium text-[#EF4444]">{error}</p>
  {:else if helperText}
    <p class="text-[11px] text-[#8E8E93]">{helperText}</p>
  {/if}
</div>
