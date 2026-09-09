import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../services/authService.js";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Button, Input, Alert, Card, MovaLogo } from "../../components/ui";

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
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans select-none overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute -top-16 -right-16 text-[220px] font-black text-slate-200/40 select-none pointer-events-none tracking-tighter leading-none hidden md:block">
        Mova.
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <MovaLogo size="xl" showSubtitle subtitle="Pemulihan Akses Akun Personel" className="items-center" />
        </div>

        {/* Card Form Container */}
        <Card className="bg-white py-8 px-6 sm:px-8 rounded-[8px] border border-[#E2E8F0] shadow-sm space-y-5">
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

export default ForgotPasswordPage;
