<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  interface Props {
    /** Total duration before firing onComplete in ms (default: 1800ms) */
    duration?: number;
    finalDuration?: number;
    /** Callback triggered after duration */
    onComplete?: () => void;
    /** Additional CSS classes for container */
    className?: string;
    word?: string;
    /** Text subtitle */
    subtitle?: string;
  }

  let {
    duration = 1800,
    finalDuration,
    onComplete,
    className = '',
    word = 'Mova',
    subtitle = 'Menyiapkan lingkungan...',
  }: Props = $props();

  let timerId: any = null;

  onMount(() => {
    timerId = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);
  });

  onDestroy(() => {
    if (timerId) clearTimeout(timerId);
  });
</script>

<div
  class="fixed inset-0 z-50 bg-[#09090B] flex flex-col items-center justify-center font-sans select-none overflow-hidden {className}"
  role="status"
  aria-live="polite"
>
  <!-- Ambient subtle backdrop glow -->
  <div class="absolute w-96 h-96 bg-[#FF634A]/10 rounded-full blur-[120px] pointer-events-none"></div>

  <!-- Minimalist Mova... Loading Wave -->
  <div class="relative z-10 flex flex-col items-center space-y-4 text-center">
    <div class="relative">
      <span class="mova-text font-heading text-4xl sm:text-5xl font-light tracking-widest text-white/90">
        Mova<span class="mova-dots text-[#FF634A]">...</span>
      </span>
    </div>

    {#if subtitle}
      <p class="text-xs text-zinc-400 font-light tracking-wide animate-pulse">
        {subtitle}
      </p>
    {/if}
  </div>
</div>

<style>
  .mova-text {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 99, 74, 1) 50%,
      rgba(255, 255, 255, 0.4) 100%
    );
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: sweep-right-to-left 2s linear infinite;
  }

  @keyframes sweep-right-to-left {
    0% {
      background-position: 200% center;
    }
    100% {
      background-position: -200% center;
    }
  }

  .mova-dots {
    animation: dots-fade 1.5s ease-in-out infinite;
  }

  @keyframes dots-fade {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
</style>
