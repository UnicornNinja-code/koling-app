import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../services/authService.js";
import { Coffee, User, Lock, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Alert } from "../../components/ui/Alert.jsx";

const tokenActivationSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar (A-Z)")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil (a-z)")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka (0-9)"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok dengan password baru",
    path: ["confirmPassword"],
  });

const requestActivationSchema = z.object({
  emailOrUsername: z.string().min(3, "Email atau username akun terdaftar wajib diisi"),
});

export function AccountActivationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [verifyingToken, setVerifyingToken] = useState(!!tokenFromUrl);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenUserData, setTokenUserData] = useState(null);

  const [step, setStep] = useState(tokenFromUrl ? 2 : 1); // 1: Request Link, 2: Set Password, 3: Success
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form for password setup (when token is valid)
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(tokenActivationSchema),
  });

  // Form for requesting activation link (when no token is present)
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: requestErrors },
  } = useForm({
    resolver: zodResolver(requestActivationSchema),
  });

  // Verify token on mount if token is present
  useEffect(() => {
    async function verifyToken() {
      if (!tokenFromUrl) {
        setVerifyingToken(false);
        return;
      }
      try {
        const res = await authService.verifyResetToken(tokenFromUrl);
        setTokenValid(true);
        setTokenUserData(res);
        setStep(2);
      } catch (err) {
        setErrorMsg(
          err?.response?.data?.msg ||
            "Tautan aktivasi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru."
        );
        setTokenValid(false);
        setStep(1);
      } finally {
        setVerifyingToken(false);
      }
    }
    verifyToken();
  }, [tokenFromUrl]);

  // Handle requesting activation link
  const onRequestActivation = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.forgotPassword(data.emailOrUsername);
      setSuccessMsg(
        res?.msg ||
          "Tautan aktivasi telah dikirimkan ke email terdaftar. Silakan periksa kotak masuk email Anda."
      );
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memproses permintaan aktivasi. Pastikan email terdaftar pada sistem."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle setting password with token
  const onSetPassword = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.resetPassword({
        token: tokenFromUrl,
        password: data.password,
      });
      setSuccessMsg("Akun berhasil diaktifkan! Silakan masuk menggunakan kata sandi baru.");
      setStep(3);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Gagal mengaktifkan akun. Tautan aktivasi mungkin telah kedaluwarsa."
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#FF634A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col justify-center py-10 sm:px-6 lg:px-8 px-4 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-[#FF634A] rounded-xl flex items-center justify-center text-white mx-auto shadow-md shadow-orange-200 shrink-0">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Aktivasi Akun Internal
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Verifikasi identitas & setup kata sandi awal personel COZIS
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#D2D2D4] shadow-xl space-y-5">
          {errorMsg && (
            <Alert variant="danger" title="Kendala Aktivasi">
              {errorMsg}
            </Alert>
          )}

          {successMsg && step !== 3 && (
            <Alert variant="success" title="Instruksi Terkirim">
              {successMsg}
            </Alert>
          )}

          {/* STEP 1: REQUEST ACTIVATION LINK (NO TOKEN PRESENT) */}
          {step === 1 && !successMsg && (
            <form onSubmit={handleSubmitRequest(onRequestActivation)} className="space-y-4">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Akun Anda telah diterbitkan oleh Tim Manajemen COZIS. Masukkan email terdaftar untuk menerima tautan aktivasi akun.
                </p>
              </div>

              <Input
                label="Alamat Email Terdaftar"
                leftIcon={User}
                placeholder="nama@domain.com"
                required
                error={requestErrors.emailOrUsername?.message}
                {...registerRequest("emailOrUsername")}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isPending={loading}
                className="w-full py-3 shadow-xs font-bold"
                rightIcon={ArrowRight}
              >
                {loading ? "Memproses Permintaan..." : "Kirim Tautan Aktivasi"}
              </Button>
            </form>
          )}

          {/* STEP 2: SET PASSWORD (VALID TOKEN PRESENT) */}
          {step === 2 && (
            <form onSubmit={handleSubmitPassword(onSetPassword)} className="space-y-4">
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Tautan aktivasi terverifikasi. Silakan buat kata sandi baru untuk mengamankan akun Anda.
                </p>
              </div>

              <Input
                label="Kata Sandi Baru (Min. 8 Karakter)"
                type="password"
                leftIcon={Lock}
                placeholder="••••••••"
                required
                helperText="Mengandung huruf besar, huruf kecil, dan angka"
                error={passwordErrors.password?.message}
                {...registerPassword("password")}
              />

              <Input
                label="Konfirmasi Kata Sandi Baru"
                type="password"
                leftIcon={KeyRound}
                placeholder="••••••••"
                required
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword("confirmPassword")}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isPending={loading}
                className="w-full py-3 shadow-xs font-bold"
                rightIcon={ArrowRight}
              >
                {loading ? "Menyimpan Sandi..." : "Aktifkan Akun Saya"}
              </Button>
            </form>
          )}

          {/* STEP 3: ACTIVATION SUCCESS */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg text-slate-900">
                  Akun Berhasil Diaktifkan!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Kata sandi baru Anda telah aktif. Silakan masuk ke aplikasi COZIS.
                </p>
              </div>

              <Button
                onClick={() => navigate("/login")}
                variant="primary"
                size="md"
                className="w-full py-3 shadow-xs font-bold"
                rightIcon={ArrowRight}
              >
                Masuk ke Halaman Login
              </Button>
            </div>
          )}

          <div className="pt-3 border-t border-[#D2D2D4]/50 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#FF634A] font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const RegisterPage = AccountActivationPage;
