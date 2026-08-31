<script lang="ts">
  import { onMount } from "svelte";
  import { authService } from "../../services/authService";
  import { Coffee, User, Lock, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, KeyRound } from "lucide-svelte";
  import Button from "../../components/ui/Button.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Alert from "../../components/ui/Alert.svelte";

  interface Props {
    onNavigate: (route: string) => void;
    tokenParam?: string | null;
  }

  let { onNavigate, tokenParam = null }: Props = $props();

  let token = $state<string | null>(null);
  let verifyingToken = $state(false);
  let tokenValid = $state(false);

  let step = $state(1); // 1: Request Link, 2: Set Password, 3: Success
  let emailOrUsername = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");

  let successMsg = $state<string | null>(null);
  let errorMsg = $state<string | null>(null);
  let loading = $state(false);

  let requestError = $state<string | null>(null);
  let passwordError = $state<string | null>(null);
  let confirmError = $state<string | null>(null);

  onMount(async () => {
    let currentToken = tokenParam;
    if (!currentToken) {
      const urlParams = new URLSearchParams(window.location.search);
      currentToken = urlParams.get("token");
    }

    if (currentToken) {
      token = currentToken;
      verifyingToken = true;
      try {
        await authService.verifyResetToken(currentToken);
        tokenValid = true;
        step = 2;
      } catch (err: any) {
        errorMsg =
          err?.response?.data?.msg ||
          "Tautan aktivasi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.";
        tokenValid = false;
        step = 1;
      } finally {
        verifyingToken = false;
      }
    }
  });

  const handleRequestActivation = async (e?: Event) => {
    if (e) e.preventDefault();
    requestError = null;

    if (!emailOrUsername || emailOrUsername.trim().length < 3) {
      requestError = "Email atau username akun terdaftar wajib diisi";
      return;
    }

    loading = true;
    errorMsg = null;

    try {
      const res = await authService.forgotPassword(emailOrUsername.trim());
      successMsg =
        res?.msg ||
        "Tautan aktivasi telah dikirimkan ke email terdaftar. Silakan periksa kotak masuk email Anda.";
    } catch (err: any) {
      errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memproses permintaan aktivasi. Pastikan email terdaftar pada sistem.";
    } finally {
      loading = false;
    }
  };

  const handleSetPassword = async (e?: Event) => {
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
      errorMsg = "Token aktivasi tidak tersedia.";
      return;
    }

    loading = true;
    errorMsg = null;

    try {
      await authService.resetPassword({
        token,
        password: newPassword,
      });
      successMsg = "Akun berhasil diaktifkan! Silakan masuk menggunakan kata sandi baru.";
      step = 3;
    } catch (err: any) {
      errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengaktifkan akun. Tautan aktivasi mungkin telah kedaluwarsa.";
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
        Aktivasi Akun Internal
      </h1>
      <p class="text-xs text-[#52525B] font-medium">
        Verifikasi identitas & setup kata sandi awal personel COZIS
      </p>
    </div>

    <!-- Card Container -->
    <div class="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#D2D2D4] shadow-xl space-y-5">
      {#if verifyingToken}
        <div class="py-8 flex flex-col items-center justify-center space-y-3">
          <div class="w-8 h-8 border-4 border-[#FF634A] border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs text-[#52525B]">Memverifikasi tautan aktivasi...</span>
        </div>
      {:else}
        {#if errorMsg}
          <Alert variant="danger" title="Kendala Aktivasi">
            {errorMsg}
          </Alert>
        {/if}

        {#if successMsg && step !== 3}
          <Alert variant="success" title="Instruksi Terkirim">
            {successMsg}
          </Alert>
        {/if}

        <!-- STEP 1: REQUEST ACTIVATION LINK -->
        {#if step === 1 && !successMsg}
          <form onsubmit={handleRequestActivation} class="space-y-4">
            <div class="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <ShieldCheck class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p class="leading-relaxed">
                Akun Anda telah diterbitkan oleh Administrator. Masukkan email terdaftar untuk menerima tautan aktivasi akun.
              </p>
            </div>

            <Input
              label="Alamat Email Terdaftar"
              leftIcon={User}
              placeholder="nama@kopikeliling.com"
              required
              error={requestError}
              bind:value={emailOrUsername}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isPending={loading}
              class="w-full py-3 shadow-xs font-bold"
              rightIcon={ArrowRight}
            >
              {loading ? "Memproses Permintaan..." : "Kirim Tautan Aktivasi"}
            </Button>
          </form>
        {/if}

        <!-- STEP 2: SET PASSWORD (VALID TOKEN) -->
        {#if step === 2}
          <form onsubmit={handleSetPassword} class="space-y-4">
            <div class="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p class="leading-relaxed">
                Tautan aktivasi terverifikasi. Silakan buat kata sandi baru untuk mengamankan akun Anda.
              </p>
            </div>

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
              {loading ? "Menyimpan Sandi..." : "Aktifkan Akun Saya"}
            </Button>
          </form>
        {/if}

        <!-- STEP 3: ACTIVATION SUCCESS -->
        {#if step === 3}
          <div class="text-center py-4 space-y-4">
            <div class="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
              <CheckCircle2 class="w-8 h-8" />
            </div>

            <div class="space-y-1">
              <h3 class="font-bold text-lg text-[#18181B]">
                Akun Berhasil Diaktifkan!
              </h3>
              <p class="text-xs text-[#52525B] max-w-xs mx-auto">
                Kata sandi baru Anda telah aktif. Silakan masuk ke aplikasi COZIS.
              </p>
            </div>

            <Button
              type="button"
              onclick={() => onNavigate("/login")}
              variant="primary"
              size="md"
              class="w-full py-3 shadow-xs font-bold"
              rightIcon={ArrowRight}
            >
              Masuk ke Halaman Login
            </Button>
          </div>
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
