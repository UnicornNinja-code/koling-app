import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../services/authService.js";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button, Input, Alert, Card, MovaLogo } from "../../components/ui";

const resetPasswordSchema = z
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

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    async function verifyToken() {
      if (!tokenFromUrl) {
        setErrorMsg("Token reset kata sandi tidak ditemukan pada URL.");
        setVerifying(false);
        return;
      }
      try {
        await authService.verifyResetToken(tokenFromUrl);
        setTokenValid(true);
      } catch (err) {
        setErrorMsg(
          err?.response?.data?.msg ||
            "Token reset kata sandi tidak valid atau sudah kedaluwarsa."
        );
      } finally {
        setVerifying(false);
      }
    }
    verifyToken();
  }, [tokenFromUrl]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.resetPassword({ token: tokenFromUrl, password: data.password });
      setSuccessMsg("Kata sandi Anda berhasil diperbarui. Mengarahkan ke halaman login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memperbarui kata sandi."
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans select-none overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute -top-16 -right-16 text-[220px] font-black text-slate-200/40 select-none pointer-events-none tracking-tighter leading-none hidden md:block">
        Mova.
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <MovaLogo size="xl" showSubtitle subtitle="Setel Ulang Kata Sandi Akun" className="items-center" />
        </div>

        {/* Card Form Container */}
        <Card className="bg-white py-8 px-6 sm:px-8 rounded-[8px] border border-[#E2E8F0] shadow-sm space-y-5">
          {successMsg && (
            <Alert variant="success" title="Pembaruan Berhasil">
              {successMsg}
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="danger" title="Kendala Validasi">
              {errorMsg}
            </Alert>
          )}

          {tokenValid && !successMsg && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Kata Sandi Baru (Minimal 8 karakter)"
                type="password"
                leftIcon={Lock}
                placeholder="••••••••"
                required
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Konfirmasi Kata Sandi Baru"
                type="password"
                leftIcon={Lock}
                placeholder="••••••••"
                required
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isPending={loading}
                className="w-full py-2.5 font-bold"
                rightIcon={ArrowRight}
              >
                {loading ? "Menyimpan Kata Sandi..." : "Perbarui Kata Sandi"}
              </Button>
            </form>
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

export default ResetPasswordPage;
