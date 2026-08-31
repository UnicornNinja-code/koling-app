<script lang="ts">
  import { authService } from "../../services/authService";
  import { Coffee, Mail, ArrowLeft, Send } from "lucide-svelte";
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
      emailError = "Masukkan alamat email yang valid";
      return;
    }

    loading = true;
    errorMsg = null;
    successMsg = null;

    try {
      const res = await authService.forgotPassword(email.trim());
      successMsg = res?.msg || "Tautan dan instruksi reset kata sandi telah dikirimkan ke email Anda.";
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

<div class="min-h-screen bg-[#F4F4F6] flex flex-col justify-center py-10 sm:px-6 lg:px-8 px-4 font-sans">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <!-- Brand Header -->
    <div class="text-center space-y-2 mb-6">
      <div class="w-14 h-14 bg-[#FF634A] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-[#FF634A]/30 shrink-0">
        <Coffee class="w-7 h-7" />
      </div>
      <h1 class="text-2xl font-extrabold text-[#18181B] tracking-tight">
        Lupa Kata Sandi
      </h1>
      <p class="text-xs text-[#52525B] font-medium">
        Masukkan email terdaftar untuk menerima instruksi pemulihan akun
      </p>
    </div>

    <!-- Card Container -->
    <div class="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#D2D2D4] shadow-xl space-y-5">
      {#if successMsg}
        <Alert variant="success" title="Permintaan Terkirim">
          {successMsg}
        </Alert>
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
            class="w-full py-3 shadow-xs font-bold"
            rightIcon={Send}
          >
            {loading ? "Mengirim Permintaan..." : "Kirim Tautan Pemulihan"}
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
    </div>
  </div>
</div>
