<script lang="ts">
  import { authService } from "../../services/authService";
  import { Coffee, Mail, ArrowLeft, Send, KeyRound } from "lucide-svelte";
  import Button from "../../components/ui/Button.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Alert from "../../components/ui/Alert.svelte";

  interface Props {
    onNavigate: (route: string) => void;
  }

  let { onNavigate }: Props = $props();

  let email = $state("");
  let emailError = $state<string | null>(null);
  let successMsg = $state<string | null>(null);
  let errorMsg = $state<string | null>(null);
  let loading = $state(false);

  const handleSubmit = async (e?: Event) => {
    if (e) e.preventDefault();
    emailError = null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError = "Masukkan format alamat email yang valid";
      return;
    }

    loading = true;
    errorMsg = null;
    successMsg = null;

    try {
      const res = await authService.forgotPassword(email.trim());
      successMsg = res?.msg || "Tautan dan instruksi reset kata sandi telah dikirimkan ke email terdaftar Anda.";
    } catch (err: any) {
      errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal meminta pengaturan ulang kata sandi. Pastikan email terdaftar.";
    } finally {
      loading = false;
    }
  };
</script>

<div class="min-h-screen bg-[#09090B] pattern-dots-dark relative flex flex-col justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 font-outfit-400 select-none overflow-x-hidden">
  <!-- Ambient Lighting Effects -->
  <div class="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF634A]/10 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="fixed bottom-10 left-10 w-72 h-72 bg-amber-950/20 rounded-full blur-[90px] pointer-events-none"></div>

  <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <!-- Brand Header -->
    <div class="text-center space-y-3 mb-7">
      <div class="w-14 h-14 bg-gradient-to-tr from-[#FF634A] to-[#FF8573] rounded-2xl flex items-center justify-center text-[#09090B] mx-auto shadow-xl shadow-[#FF634A]/25 shrink-0 border border-white/20">
        <Coffee class="w-7 h-7 stroke-[2.5]" />
      </div>
      <div>
        <span class="text-[10px] font-outfit-600 uppercase tracking-widest text-[#71717A] block">Pemulihan Kredensial</span>
        <h1 class="text-2xl sm:text-3xl font-outfit-600 text-white tracking-tight mt-0.5">
          Lupa Kata Sandi
        </h1>
        <p class="text-xs text-[#A1A1AA] mt-1 max-w-xs mx-auto">
          Masukkan email terdaftar untuk menerima tautan pemulihan akses akun Anda
        </p>
      </div>
    </div>

    <!-- Main Card Container -->
    <div class="bg-[#131316]/95 backdrop-blur-xl py-7 px-6 sm:px-8 rounded-3xl border border-[#24242A] shadow-2xl space-y-5">
      {#if successMsg}
        <Alert variant="success" title="Instruksi Terkirim">
          {successMsg}
        </Alert>

        <div class="p-3.5 bg-[#1A1A1F] rounded-2xl border border-[#272730] text-center text-xs text-[#A1A1AA] space-y-1">
          <p>Silakan periksa kotak masuk atau folder spam email Anda.</p>
        </div>

        <Button
          type="button"
          onclick={() => onNavigate("/login")}
          variant="primary"
          size="md"
          class="w-full py-3.5 font-outfit-600"
          rightIcon={ArrowLeft}
        >
          Kembali ke Halaman Masuk
        </Button>
      {/if}

      {#if errorMsg}
        <Alert variant="danger" title="Gagal Mengirim">
          {errorMsg}
        </Alert>
      {/if}

      {#if !successMsg}
        <form onsubmit={handleSubmit} class="space-y-4">
          <Input
            label="Alamat Email Terdaftar"
            type="email"
            leftIcon={Mail}
            placeholder="nama@kopikeliling.com"
            required
            error={emailError}
            bind:value={email}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isPending={loading}
            class="w-full py-3.5 font-outfit-600"
            rightIcon={Send}
          >
            {loading ? "Mengirim Permintaan..." : "Kirim Tautan Pemulihan"}
          </Button>
        </form>
      {/if}

      <div class="pt-2 border-t border-[#24242A] text-center">
        <button
          type="button"
          onclick={() => onNavigate("/login")}
          class="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white font-outfit-600 transition-colors cursor-pointer py-1"
        >
          <ArrowLeft class="w-3.5 h-3.5 text-[#FF634A]" /> Kembali ke Halaman Masuk
        </button>
      </div>
    </div>
  </div>
</div>
