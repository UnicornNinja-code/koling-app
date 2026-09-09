import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../services/authService.js";
import { Coffee, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Alert } from "../../components/ui/Alert.jsx";

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
        <div className="w-8 h-8 border-4 border-[#FF5052] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-[#FF5052] rounded-xl flex items-center justify-center text-white mx-auto shadow-md shadow-red-200 shrink-0">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Setel Ulang Kata Sandi
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Buat kata sandi baru yang kuat untuk akun Anda
          </p>
        </div>

        {/* Card Form Container */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200 shadow-xl space-y-5">
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
                className="w-full py-3 shadow-xs font-bold"
                rightIcon={ArrowRight}
              >
                {loading ? "Menyimpan Kata Sandi..." : "Perbarui Kata Sandi"}
              </Button>
            </form>
          )}

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="text-xs text-slate-600 hover:text-[#FF5052] font-bold"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
