<script lang="ts">
  import { onMount } from "svelte";
  import { authService, type CaptchaData } from "../../services/authService";
  import { authStore, getRoleLandingPath } from "../../lib/stores/auth.svelte";
  import { Coffee, Lock, User, Shield, ArrowRight, KeyRound, Sparkles, RefreshCw, ShieldCheck } from "lucide-svelte";
  import Button from "../../components/ui/Button.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Alert from "../../components/ui/Alert.svelte";

  interface Props {
    onNavigate: (route: string) => void;
  }

  let { onNavigate }: Props = $props();

  let identifier = $state("");
  let password = $state("");
  let captchaAnswer = $state("");
  let captchaData = $state<CaptchaData | null>(null);
  let captchaLoading = $state(false);
  let errorMsg = $state<string | null>(null);
  let loading = $state(false);
  let activePreset = $state<string | null>(null);

  const errors = $state<{ identifier?: string; password?: string; captcha?: string }>({});

  const loadCaptcha = async () => {
    captchaLoading = true;
    try {
      captchaData = await authService.getCaptcha();
      captchaAnswer = "";
      errors.captcha = undefined;
    } catch (err) {
      console.warn("Gagal memuat CAPTCHA:", err);
    } finally {
      captchaLoading = false;
    }
  };

  onMount(() => {
    loadCaptcha();
  });

  const validate = () => {
    errors.identifier = undefined;
    errors.password = undefined;
    errors.captcha = undefined;
    let valid = true;

    if (!identifier || identifier.trim().length < 3) {
      errors.identifier = "Username atau Email minimal 3 karakter";
      valid = false;
    }
    if (!password || password.length < 6) {
      errors.password = "Password minimal 6 karakter";
      valid = false;
    }
    if (!captchaAnswer || captchaAnswer.trim().length < 3) {
      errors.captcha = "Masukkan 5 kode CAPTCHA keamanan";
      valid = false;
    }
    return valid;
  };

  const handleLogin = async (e?: Event) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    loading = true;
    errorMsg = null;

    try {
      const res = await authService.login({
        identifier: identifier.trim(),
        password,
        captcha_id: captchaData?.captcha_id,
        captcha_answer: captchaAnswer.trim(),
      });

      const userObj = res?.user;
      const token = res?.token;

      if (!token || !userObj) {
        throw new Error("Token autentikasi tidak ditemukan pada respon server.");
      }

      // Check if user account is deactivated
      if (userObj.is_active === false) {
        authStore.login(userObj, token);
        onNavigate("/inactive");
        return;
      }

      authStore.login(userObj, token);
      const landing = getRoleLandingPath(userObj.role);
      onNavigate(landing);
    } catch (err: any) {
      errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Autentikasi gagal. Periksa username/email dan kata sandi Anda.";
      // Refresh captcha on failure
      loadCaptcha();
    } finally {
      loading = false;
    }
  };

  const setPreset = (roleKey: string, user: string, pass: string) => {
    activePreset = roleKey;
    identifier = user;
    password = pass;
    errorMsg = null;
    errors.identifier = undefined;
    errors.password = undefined;
  };
</script>

<div class="min-h-screen bg-[#09090B] pattern-dots-dark relative flex flex-col justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 font-outfit-400 select-none overflow-x-hidden">
  <!-- Ambient Lighting Effects -->
  <div class="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF634A]/10 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="fixed bottom-10 right-10 w-72 h-72 bg-purple-950/20 rounded-full blur-[90px] pointer-events-none"></div>

  <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <!-- Brand Header -->
    <div class="text-center space-y-3 mb-7">
      <div class="w-14 h-14 bg-gradient-to-tr from-[#FF634A] to-[#FF8573] rounded-2xl flex items-center justify-center text-[#09090B] mx-auto shadow-xl shadow-[#FF634A]/25 shrink-0 border border-white/20">
        <Coffee class="w-7 h-7 stroke-[2.5]" />
      </div>
      <div>
        <span class="text-[10px] font-outfit-600 uppercase tracking-widest text-[#71717A] block">COZIS Workspace</span>
        <h1 class="text-2xl sm:text-3xl font-outfit-600 text-white tracking-tight mt-0.5">
          Coffee on Wheels
        </h1>
        <p class="text-xs text-[#A1A1AA] mt-1 max-w-xs mx-auto">
          Operational Command & Spatial Decision Support System
        </p>
      </div>
    </div>

    <!-- Main Card Container -->
    <div class="bg-[#131316]/95 backdrop-blur-xl py-7 px-6 sm:px-8 rounded-3xl border border-[#24242A] shadow-2xl space-y-6">
      <!-- Session Expired Notification -->
      {#if authStore.isExpired && !errorMsg}
        <Alert variant="warning" title="Sesi Berakhir">
          Sesi login Anda telah berakhir demi keamanan. Silakan masuk kembali untuk melanjutkan.
        </Alert>
      {/if}

      <!-- Error Message Alert -->
      {#if errorMsg}
        <Alert variant="danger" title="Gagal Masuk">
          {errorMsg}
        </Alert>
      {/if}

      <form onsubmit={handleLogin} class="space-y-4">
        <Input
          label="Username atau Alamat Email"
          leftIcon={User}
          placeholder="superadmin@kopikeliling.com"
          required
          error={errors.identifier}
          bind:value={identifier}
        />

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="login-password" class="block text-xs font-outfit-600 text-[#D4D4D8]">
              Kata Sandi <span class="text-[#FF634A] font-bold">*</span>
            </label>
            <button
              type="button"
              onclick={() => onNavigate('/forgot-password')}
              class="text-xs text-[#FF634A] hover:text-[#FF8573] font-outfit-600 transition-colors cursor-pointer"
            >
              Lupa kata sandi?
            </button>
          </div>

          <Input
            id="login-password"
            type="password"
            leftIcon={Lock}
            placeholder="••••••••"
            required
            error={errors.password}
            bind:value={password}
          />
        </div>

        <!-- CAPTCHA Verification Block -->
        <div class="space-y-1.5 pt-1">
          <div class="flex items-center justify-between">
            <label for="captcha-input" class="block text-xs font-outfit-600 text-[#D4D4D8]">
              Verifikasi Keamanan (CAPTCHA) <span class="text-[#FF634A] font-bold">*</span>
            </label>
            <button
              type="button"
              onclick={loadCaptcha}
              class="text-[11px] text-[#A1A1AA] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Perbarui Gambar CAPTCHA"
            >
              <RefreshCw class="w-3 h-3 {captchaLoading ? 'animate-spin' : ''}" />
              <span>Ganti Kode</span>
            </button>
          </div>

          <div class="flex items-center gap-2.5">
            <!-- Distorted SVG Container -->
            <div class="relative w-36 sm:w-40 h-10 bg-[#18181D] border border-[#2C2C36] rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {#if captchaLoading}
                <div class="text-[10px] text-zinc-500 animate-pulse">Memuat...</div>
              {:else if captchaData?.svg}
                <img src={captchaData.svg} alt="Kode CAPTCHA" class="w-full h-full object-cover select-none pointer-events-none" />
              {:else}
                <span class="text-[10px] text-zinc-500">Gagal memuat</span>
              {/if}
            </div>

            <!-- Answer Input Field -->
            <div class="flex-1">
              <input
                id="captcha-input"
                type="text"
                maxlength="6"
                placeholder="5 Karakter"
                autocomplete="off"
                bind:value={captchaAnswer}
                class="w-full px-3 py-2 text-xs uppercase tracking-widest font-mono font-bold bg-[#1A1A1F] border {errors.captcha ? 'border-rose-500' : 'border-[#2C2C36]'} rounded-xl focus:outline-none focus:border-[#FF634A] text-white placeholder:text-zinc-600 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal transition-all"
              />
            </div>
          </div>
          {#if errors.captcha}
            <p class="text-[11px] text-rose-400 font-medium">{errors.captcha}</p>
          {/if}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isPending={loading}
          class="w-full py-3.5 mt-2 font-outfit-600"
          rightIcon={ArrowRight}
        >
          {loading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}
        </Button>
      </form>

      <!-- Quick Demo Credentials Selector -->
      <div class="pt-3 border-t border-[#24242A] space-y-2.5">
        <div class="flex items-center justify-between text-[11px] text-[#A1A1AA] font-outfit-600">
          <span class="flex items-center gap-1.5 text-zinc-300">
            <Sparkles class="w-3.5 h-3.5 text-[#FF634A]" /> Demo Quick Access:
          </span>
          <span class="text-[#71717A] text-[10px]">Pass: <code class="text-zinc-400">password123</code></span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            onclick={() => setPreset("superadmin", "superadmin@kopikeliling.com", "password123")}
            class="px-2.5 py-2 text-xs font-outfit-600 rounded-xl border transition-all cursor-pointer text-center flex flex-col items-center gap-0.5
            {activePreset === 'superadmin' 
              ? 'bg-[#FF634A]/15 border-[#FF634A] text-white shadow-sm shadow-[#FF634A]/20' 
              : 'bg-[#1A1A1F] border-[#272730] hover:border-[#383842] text-[#A1A1AA] hover:text-white'}"
          >
            <span class="text-[11px] font-semibold text-purple-400">Executive</span>
            <span class="text-[11px] leading-tight">Superadmin</span>
          </button>

          <button
            type="button"
            onclick={() => setPreset("supervisor", "supervisor@kopikeliling.com", "password123")}
            class="px-2.5 py-2 text-xs font-outfit-600 rounded-xl border transition-all cursor-pointer text-center flex flex-col items-center gap-0.5
            {activePreset === 'supervisor' 
              ? 'bg-[#FF634A]/15 border-[#FF634A] text-white shadow-sm shadow-[#FF634A]/20' 
              : 'bg-[#1A1A1F] border-[#272730] hover:border-[#383842] text-[#A1A1AA] hover:text-white'}"
          >
            <span class="text-[11px] font-semibold text-blue-400">Manager</span>
            <span class="text-[11px] leading-tight">Supervisor</span>
          </button>

          <button
            type="button"
            onclick={() => setPreset("rider", "rider@kopikeliling.com", "password123")}
            class="px-2.5 py-2 text-xs font-outfit-600 rounded-xl border transition-all cursor-pointer text-center flex flex-col items-center gap-0.5
            {activePreset === 'rider' 
              ? 'bg-[#FF634A]/15 border-[#FF634A] text-white shadow-sm shadow-[#FF634A]/20' 
              : 'bg-[#1A1A1F] border-[#272730] hover:border-[#383842] text-[#A1A1AA] hover:text-white'}"
          >
            <span class="text-[11px] font-semibold text-emerald-400">Operasional</span>
            <span class="text-[11px] leading-tight">Rider Armada</span>
          </button>
        </div>
      </div>

      <!-- Activation Prompt -->
      <div class="p-3 bg-[#1A1A1F] rounded-2xl border border-[#272730] text-center text-xs text-[#A1A1AA] flex items-center justify-center gap-1.5 flex-wrap">
        <span>Menerima undangan akun baru?</span>
        <button 
          type="button"
          onclick={() => onNavigate('/register')} 
          class="text-[#FF634A] hover:text-[#FF8573] font-outfit-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <KeyRound class="w-3.5 h-3.5" /> Aktivasi Akun
        </button>
      </div>

      <!-- Enterprise Restricted Notice Footer -->
      <div class="pt-3 border-t border-[#24242A] text-center space-y-1">
        <div class="flex items-center justify-center gap-1.5 text-xs text-[#71717A] font-medium">
          <Shield class="w-3.5 h-3.5 text-[#52525B]" />
          <span>Akses Terbatas: Sistem Internal Perusahaan</span>
        </div>
        <p class="text-[11px] text-[#52525B]">
          Kredensial diterbitkan oleh Administrator MantaKopi COZIS.
        </p>
      </div>
    </div>
  </div>
</div>
