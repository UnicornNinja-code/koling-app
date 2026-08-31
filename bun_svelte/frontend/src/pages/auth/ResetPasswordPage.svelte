<script lang="ts">
  import { onMount } from "svelte";
  import { authService } from "../../services/authService";
  import { Coffee, Lock, CheckCircle2, ArrowRight, ArrowLeft, KeyRound } from "lucide-svelte";
  import Button from "../../components/ui/Button.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Alert from "../../components/ui/Alert.svelte";

  interface Props {
    onNavigate: (route: string) => void;
    tokenParam?: string | null;
  }

  let { onNavigate, tokenParam = null }: Props = $props();

  let token = $state<string | null>(null);
  let verifying = $state(true);
  let tokenValid = $state(false);

  let newPassword = $state("");
  let confirmPassword = $state("");

  let successMsg = $state<string | null>(null);
  let errorMsg = $state<string | null>(null);
  let loading = $state(false);

  let passwordError = $state<string | null>(null);
  let confirmError = $state<string | null>(null);

  onMount(async () => {
    let currentToken = tokenParam;
    if (!currentToken) {
      const urlParams = new URLSearchParams(window.location.search);
      currentToken = urlParams.get("token");
    }

    if (!currentToken) {
      errorMsg = "Token reset kata sandi tidak ditemukan pada URL.";
      verifying = false;
      return;
    }

    token = currentToken;
    try {
      await authService.verifyResetToken(currentToken);
      tokenValid = true;
    } catch (err: any) {
      errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        "Token reset kata sandi tidak valid atau sudah kedaluwarsa.";
    } finally {
      verifying = false;
    }
  });

  const handleSubmit = async (e?: Event) => {
    if (e) e.preventDefault();
    passwordError = null;
    confirmError = null;

    if (!newPassword || newPassword.length < 8) {
      passwordError = "Password minimal 8 karakter";
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      passwordError = "Password harus mengandung minimal 1 huruf besar (A-Z)";
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      passwordError = "Password harus mengandung minimal 1 angka (0-9)";
      return;
    }
    if (newPassword !== confirmPassword) {
      confirmError = "Konfirmasi password tidak cocok dengan password baru";
      return;
    }

    if (!token) {
      errorMsg = "Token reset tidak ditemukan.";
      return;
    }

    loading = true;
    errorMsg = null;

    try {
      await authService.resetPassword({ token, password: newPassword });
      successMsg = "Kata sandi Anda berhasil diperbarui. Mengarahkan ke halaman login...";
      setTimeout(() => onNavigate("/login"), 2000);
    } catch (err: any) {
      errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memperbarui kata sandi.";
    } finally {
      loading = false;
    }
  };
</script>

<div class="min-h-screen bg-[#F4F4F6] flex flex-col justify-center py-10 sm:px-6 lg:px-8 px-4 font-sans">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <!-- Brand Header -->
    <div class="text-center space-y-2 mb-6">
      <div class="w-14 h-14 bg-[#FF634A] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-[#FF634A]/30 shrink-0">
        <Coffee class="w-7 h-7" />
      </div>
      <h1 class="text-2xl font-extrabold text-[#18181B] tracking-tight">
        Setel Ulang Kata Sandi
      </h1>
      <p class="text-xs text-[#52525B] font-medium">
        Buat kata sandi baru yang kuat untuk mengamankan akun Anda
      </p>
    </div>

    <!-- Card Container -->
    <div class="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#D2D2D4] shadow-xl space-y-5">
      {#if verifying}
        <div class="py-8 flex flex-col items-center justify-center space-y-3">
          <div class="w-8 h-8 border-4 border-[#FF634A] border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs text-[#52525B]">Memvalidasi token reset kata sandi...</span>
        </div>
      {:else}
        {#if successMsg}
          <Alert variant="success" title="Pembaruan Berhasil">
            {successMsg}
          </Alert>
        {/if}

        {#if errorMsg}
          <Alert variant="danger" title="Kendala Validasi">
            {errorMsg}
          </Alert>
        {/if}

        {#if tokenValid && !successMsg}
          <form onsubmit={handleSubmit} class="space-y-4">
            <Input
              label="Kata Sandi Baru (Min. 8 Karakter)"
              type="password"
              leftIcon={Lock}
              placeholder="••••••••"
              required
              helperText="Mengandung huruf besar (A-Z) dan angka (0-9)"
              error={passwordError}
              bind:value={newPassword}
            />

            <Input
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              leftIcon={KeyRound}
              placeholder="••••••••"
              required
              error={confirmError}
              bind:value={confirmPassword}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isPending={loading}
              class="w-full py-3 shadow-xs font-bold"
              rightIcon={ArrowRight}
            >
              {loading ? "Menyimpan Kata Sandi..." : "Perbarui Kata Sandi"}
            </Button>
          </form>
        {/if}

        <div class="pt-3 border-t border-[#D2D2D4]/50 text-center">
          <button
            type="button"
            onclick={() => onNavigate("/login")}
            class="inline-flex items-center gap-1.5 text-xs text-[#52525B] hover:text-[#FF634A] font-bold cursor-pointer"
          >
            <ArrowLeft class="w-3.5 h-3.5" /> Kembali ke Halaman Masuk
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
