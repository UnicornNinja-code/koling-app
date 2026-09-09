import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../services/authService.js";
import { Coffee, Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Alert } from "../../components/ui/Alert.jsx";

const forgotPasswordSchema = z.object({
  email: z.string().email("Masukkan alamat email yang valid"),
});

export function ForgotPasswordPage() {
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await authService.forgotPassword(data.email);
      setSuccessMsg(res?.msg || "Tautan dan token reset kata sandi telah dikirimkan ke email Anda.");
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Gagal meminta pengaturan ulang kata sandi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-[#2563EB] rounded-[10px] flex items-center justify-center text-white mx-auto shadow-md shadow-blue-200 shrink-0">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-[#111111] tracking-tight">
            Lupa Kata Sandi
          </h1>
          <p className="text-xs text-[#737373] font-normal">
            Masukkan email terdaftar untuk menerima instruksi pemulihan akun
          </p>
        </div>

        {/* Card Form Container */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-[12px] border border-[#E5E5E5] shadow-2xs space-y-5">
          {successMsg && (
            <Alert variant="success" title="Permintaan Terkirim">
              {successMsg}
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="danger" title="Gagal Mengirim">
              {errorMsg}
            </Alert>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Alamat Email Terdaftar"
                type="email"
                leftIcon={Mail}
                placeholder="nama@domain.com"
                required
                error={errors.email?.message}
                {...register("email")}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isPending={loading}
                className="w-full py-2.5 font-bold"
                rightIcon={Send}
              >
                {loading ? "Mengirim Permintaan..." : "Kirim Tautan Pemulihan"}
              </Button>
            </form>
          )}

          <div className="pt-3 border-t border-[#E5E5E5] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#525252] hover:text-[#2563EB] font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
