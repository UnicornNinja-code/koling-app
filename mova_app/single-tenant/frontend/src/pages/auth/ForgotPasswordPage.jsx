import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  Key,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Coffee,
} from "lucide-react";
import { authService } from "../../services/authService.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { AuthLayout } from "../../components/layout/AuthLayout.jsx";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const urlToken = searchParams.get("token") || "";

  // Step 1: Request Reset Token via Email | Step 2: Reset Password with Token
  const [step, setStep] = useState(urlToken ? 2 : 1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Verify token if present
  useEffect(() => {
    if (token) {
      async function verify() {
        setIsVerifyingToken(true);
        try {
          const res = await authService.verifyResetToken(token);
          if (res.valid !== false) {
            setIsTokenValid(true);
          } else {
            setIsTokenValid(false);
            setErrorMessage("Token reset tidak valid atau telah kedaluwarsa.");
          }
        } catch (err) {
          setIsTokenValid(false);
          setErrorMessage("Token reset tidak valid atau telah kedaluwarsa.");
        } finally {
          setIsVerifyingToken(false);
        }
      }
      verify();
    }
  }, [token]);

  // Handle Step 1: Request Email Reset Token
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Mohon masukkan alamat email Anda.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      const msg = res.msg || "Tautan dan instruksi reset kata sandi telah dikirim ke email Anda.";
      setSuccessMessage(msg);
      toast.success("Permintaan Terkirim", msg);

      if (res.token) {
        setToken(res.token);
      }

      setStep(2);
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Gagal memproses permintaan. Pastikan email terdaftar di sistem.";
      setErrorMessage(msg);
      toast.danger("Gagal", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token.trim()) {
      setErrorMessage("Mohon isi token reset kata sandi.");
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({ token, password: newPassword });
      const msg = res.msg || "Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.";
      setSuccessMessage(msg);
      toast.success("Berhasil", msg);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Gagal mereset kata sandi. Token mungkin salah atau kedaluwarsa.";
      setErrorMessage(msg);
      toast.danger("Gagal", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Pemulihan Keamanan Akun"
      subtitle="Reset kata sandi terverifikasi aman melalui protokol token terenkripsi."
    >
      {/* Right Side Crisp White Form */}
      <div className="w-full max-w-md mx-auto my-auto py-2">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 border border-blue-100 dark:border-blue-900">
            <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Reset Kredensial Akun</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {step === 1 ? "Lupa Kata Sandi" : "Atur Sandi Baru"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 1
              ? "Masukkan email terdaftar Anda untuk menerima token verifikasi."
              : "Masukkan token reset dan buat kata sandi baru yang aman."}
          </p>
        </div>

        {/* Success Notification */}
        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Request Email */}
        {step === 1 && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@kopikeliling.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold py-3 text-sm rounded-xl shadow-md shadow-blue-500/20"
              isLoading={isLoading}
              icon={ArrowRight}
            >
              Kirim Tautan Reset
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Sudah memiliki token reset? Masukkan di sini →
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Set New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Token Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Token Reset Kata Sandi
                </label>
                {isVerifyingToken && (
                  <span className="text-[10px] text-blue-500 flex items-center gap-1 font-semibold">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Memeriksa token...
                  </span>
                )}
                {isTokenValid === true && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Token Valid
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Salin token reset dari email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold py-3 text-sm rounded-xl shadow-md shadow-blue-500/20"
              isLoading={isLoading}
              icon={ArrowRight}
            >
              Simpan Kata Sandi Baru
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                ← Kembali ke Permintaan Email
              </button>
            </div>
          </form>
        )}

        {/* Back to Login Footer */}
        <div className="mt-6 text-center space-y-2">
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Halaman Masuk
            </Link>
          </div>
          <div className="text-[11px] text-slate-400">
            Dibuat untuk operasional <span className="font-semibold text-slate-600 dark:text-slate-300">Sejuta Jiwa Cabang Sidoarjo</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
