<script lang="ts">
  import { authService } from "../../services/authService";
  import { authStore, getRoleLandingPath } from "../../lib/stores/auth.svelte";
  import { Coffee, Lock, User, Shield, ArrowRight, KeyRound, Sparkles } from "lucide-svelte";
  import Button from "../../components/ui/Button.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Alert from "../../components/ui/Alert.svelte";

  interface Props {
    onNavigate: (route: string) => void;
  }

  let { onNavigate }: Props = $props();

  let identifier = $state("");
  let password = $state("");
  let errorMsg = $state<string | null>(null);
  let loading = $state(false);

  const errors = $state<{ identifier?: string; password?: string }>({});

  const validate = () => {
    errors.identifier = undefined;
    errors.password = undefined;
    let valid = true;

    if (!identifier || identifier.trim().length < 3) {
      errors.identifier = "Username atau Email minimal 3 karakter";
      valid = false;
    }
    if (!password || password.length < 6) {
      errors.password = "Password minimal 6 karakter";
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
    } finally {
      loading = false;
    }
  };

  const setPreset = (user: string, pass: string) => {
    identifier = user;
    password = pass;
    errorMsg = null;
  };
</script>

<div class="min-h-screen bg-[#F4F4F6] flex flex-col justify-center py-10 sm:px-6 lg:px-8 px-4 font-sans">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <!-- Brand Header -->
    <div class="text-center space-y-2 mb-6">
      <div class="w-14 h-14 bg-[#FF634A] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-[#FF634A]/30 shrink-0">
        <Coffee class="w-7 h-7" />
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
        COZIS
      </h1>
      <p class="text-xs text-[#52525B] font-medium max-w-xs mx-auto">
        Coffee Operational Zone Intelligence System
      </p>
    </div>

    <!-- Card Form Container -->
    <div class="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#D2D2D4] shadow-xl space-y-6">
      <!-- Session Expired Notification -->
      {#if authStore.isExpired && !errorMsg}
        <Alert variant="warning" title="Sesi Berakhir">
          Sesi login Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.
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
            <label for="login-password" class="block text-xs font-semibold text-[#18181B]">
              Kata Sandi <span class="text-[#FF634A]">*</span>
            </label>
            <button
              type="button"
              onclick={() => onNavigate('/forgot-password')}
              class="text-xs text-[#FF634A] hover:text-[#E54E36] font-semibold cursor-pointer"
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

        <Button
          type="submit"
          variant="primary"
          size="md"
          isPending={loading}
          class="w-full py-3 shadow-xs font-bold"
          rightIcon={ArrowRight}
        >
          {loading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}
        </Button>
      </form>

      <!-- Quick Demo Credentials Selector -->
      <div class="pt-2 border-t border-[#F4F4F6] space-y-2">
        <div class="flex items-center justify-between text-[11px] text-[#8E8E93] font-semibold">
          <span class="flex items-center gap-1">
            <Sparkles class="w-3 h-3 text-amber-500" /> Akun Uji Coba Cepat:
          </span>
          <span>Password: <code>password123</code></span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            onclick={() => setPreset("superadmin@kopikeliling.com", "password123")}
            class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-[#D2D2D4] bg-[#F4F4F6] hover:bg-[#E7E7E7] text-[#18181B] transition-colors cursor-pointer text-center truncate"
          >
            Superadmin
          </button>
          <button
            type="button"
            onclick={() => setPreset("supervisor@kopikeliling.com", "password123")}
            class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-[#D2D2D4] bg-[#F4F4F6] hover:bg-[#E7E7E7] text-[#18181B] transition-colors cursor-pointer text-center truncate"
          >
            Supervisor
          </button>
          <button
            type="button"
            onclick={() => setPreset("rider@kopikeliling.com", "password123")}
            class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-[#D2D2D4] bg-[#F4F4F6] hover:bg-[#E7E7E7] text-[#18181B] transition-colors cursor-pointer text-center truncate"
          >
            Rider
          </button>
        </div>
      </div>

      <!-- Activation Prompt -->
      <div class="p-3 bg-[#F4F4F6] rounded-xl border border-[#D2D2D4] text-center text-xs text-[#52525B]">
        Menerima undangan akun baru?{" "}
        <button 
          type="button"
          onclick={() => onNavigate('/register')} 
          class="text-[#FF634A] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          <KeyRound class="w-3.5 h-3.5" /> Aktivasi Akun
        </button>
      </div>

      <!-- Enterprise Restricted Notice Footer -->
      <div class="pt-4 border-t border-[#D2D2D4]/50 text-center space-y-1.5">
        <div class="flex items-center justify-center gap-1.5 text-xs text-[#52525B] font-medium">
          <Shield class="w-3.5 h-3.5 text-[#8E8E93]" />
          <span>Akses Terbatas: Sistem Internal Perusahaan</span>
        </div>
        <p class="text-[11px] text-[#8E8E93]">
          Akun pengguna diterbitkan oleh Tim Administrator COZIS.
        </p>
      </div>
    </div>
  </div>
</div>
