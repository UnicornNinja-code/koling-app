import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../services/authService.js";
import { User, Lock, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, KeyRound, Mail, Calendar } from "lucide-react";
import { Button, Input, Alert, Card, MovaLogo } from "../../components/ui";

const tokenActivationSchema = z
  .object({
    name: z.string().optional(),
    birth_date: z.string().min(1, "Tanggal lahir wajib diisi sebagai identitas resmi personel"),
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

  const [step, setStep] = useState(tokenFromUrl ? 2 : 1);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(tokenActivationSchema),
  });

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: requestErrors },
  } = useForm({
    resolver: zodResolver(requestActivationSchema),
  });

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

  const onSetPassword = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.activateAccount({
        token: tokenFromUrl,
        password: data.password,
        name: data.name || tokenUserData?.name,
        birth_date: data.birth_date,
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 sm:px-6 lg:px-8 px-4 font-sans select-none overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute -top-16 -right-16 text-[220px] font-black text-slate-200/40 select-none pointer-events-none tracking-tighter leading-none hidden md:block">
        Mova.
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="text-center space-y-2 mb-6">
          <MovaLogo size="xl" showSubtitle subtitle="Aktivasi Akun & Verifikasi Personel" className="items-center" />
        </div>

        <Card className="bg-white py-8 px-6 sm:px-8 rounded-[8px] border border-[#E2E8F0] shadow-sm space-y-5">
          {errorMsg && <Alert variant="danger" title="Kendala Aktivasi">{errorMsg}</Alert>}
          {successMsg && step !== 3 && <Alert variant="success" title="Instruksi Terkirim">{successMsg}</Alert>}

          {/* STEP 1: REQUEST ACTIVATION LINK */}
          {step === 1 && !successMsg && (
            <form onSubmit={handleSubmitRequest(onRequestActivation)} className="space-y-4">
              <div className="p-3 bg-blue-50/70 rounded-[6px] border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Akun Anda telah didaftarkan oleh Administrator MOVA. Masukkan email terdaftar untuk menerima tautan aktivasi.
                </p>
              </div>

              <Input
                label="Alamat Email Terdaftar"
                leftIcon={Mail}
                type="email"
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
                className="w-full py-2.5 font-bold"
                rightIcon={ArrowRight}
              >
                {loading ? "Memproses Permintaan..." : "Kirim Tautan Aktivasi"}
              </Button>
            </form>
          )}

          {/* STEP 2: SET PASSWORD & BIRTH DATE */}
          {step === 2 && (
            <form onSubmit={handleSubmitPassword(onSetPassword)} className="space-y-4">
              <div className="p-3 bg-emerald-50/80 rounded-[6px] border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold">Tautan aktivasi terverifikasi untuk {tokenUserData?.email || "Personel MOVA"}.</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Lengkapi tanggal lahir dan buat kata sandi baru untuk mengaktifkan akun.</p>
                </div>
              </div>

              <Input
                label="Tanggal Lahir Personel"
                type="date"
                leftIcon={Calendar}
                required
                error={passwordErrors.birth_date?.message}
                {...registerPassword("birth_date")}
              />

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
                className="w-full py-2.5 font-bold"
                rightIcon={ArrowRight}
              >
                {loading ? "Mengaktifkan Akun..." : "Aktifkan Akun Saya"}
              </Button>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-[#111111]">
                  Akun Berhasil Diaktifkan!
                </h3>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                  Kata sandi baru Anda telah aktif. Silakan masuk ke aplikasi MOVA.
                </p>
              </div>

              <Button
                onClick={() => navigate("/login")}
                variant="primary"
                size="md"
                className="w-full py-2.5 font-bold"
                rightIcon={ArrowRight}
              >
                Masuk ke Halaman Login
              </Button>
            </div>
          )}

          <div className="pt-3 border-t border-[#E2E8F0] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#2563EB] font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Masuk
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export const RegisterPage = AccountActivationPage;
export default AccountActivationPage;
