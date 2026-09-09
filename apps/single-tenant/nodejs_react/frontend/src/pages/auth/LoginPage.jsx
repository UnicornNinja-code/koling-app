import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, getRoleLandingPath } from "../../context/AuthContext.jsx";
import { authService } from "../../services/authService.js";
import { Lock, User, Shield, ArrowRight, KeyRound } from "lucide-react";
import { Button, Input, Alert, Card, MovaLogo } from "../../components/ui";

const loginSchema = z.object({
  identifier: z.string().min(3, "Username atau Email minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get("expired") === "1";

  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.login({
        identifier: data.identifier,
        password: data.password,
      });

      const userObj = res?.user || res?.data?.user || res?.data;
      const token = res?.token || res?.accessToken || res?.data?.token;

      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan pada respon server.");
      }

      // Check if user account is deactivated
      if (userObj?.is_active === false) {
        login(userObj, token);
        navigate("/inactive", { replace: true });
        return;
      }

      const safeUser = login(userObj, token);
      const userRole = safeUser?.role || userObj?.role || "RIDER";

      // If user was navigating to a protected route before redirect, redirect back there
      const fromPath = location.state?.from?.pathname;
      if (fromPath && fromPath !== "/login" && fromPath !== "/forbidden" && fromPath !== "/inactive") {
        navigate(fromPath, { replace: true });
      } else {
        navigate(getRoleLandingPath(userRole), { replace: true });
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Autentikasi gagal. Periksa username/email dan kata sandi Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans overflow-hidden select-none">
      {/* Background Watermark */}
      <div className="absolute -top-16 -right-16 text-[220px] font-black text-slate-200/40 select-none pointer-events-none tracking-tighter leading-none hidden md:block">
        Mova.
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <MovaLogo size="xl" showSubtitle subtitle="Coffee Operational Zone Intelligence System" className="items-center" />
        </div>

        {/* Card Form Container */}
        <Card className="py-8 px-6 sm:px-8 bg-white border border-[#E2E8F0] shadow-sm rounded-[8px] space-y-5">
          {/* Session Expired Notification */}
          {isExpired && !errorMsg && (
            <Alert variant="warning" title="Sesi Berakhir">
              Sesi login Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.
            </Alert>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <Alert variant="danger" title="Gagal Masuk">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username atau Alamat Email"
              leftIcon={User}
              placeholder="Masukkan username atau email"
              required
              error={errors.identifier?.message}
              {...register("identifier")}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Kata Sandi <span className="text-[#DC2626]">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              <Input
                type="password"
                leftIcon={Lock}
                placeholder="••••••••"
                required
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isPending={loading}
              className="w-full py-2.5 font-bold"
              rightIcon={ArrowRight}
            >
              {loading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}
            </Button>
          </form>

          {/* Activation Prompt */}
          <div className="p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Menerima undangan akun baru?{" "}
            <Link to="/activate" className="text-[#2563EB] hover:underline font-bold inline-flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Aktivasi Akun
            </Link>
          </div>

          {/* Enterprise Restricted Notice Footer */}
          <div className="pt-4 border-t border-[#E2E8F0] text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#64748B] font-medium">
              <Shield className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Akses Terbatas: Sistem Internal Perusahaan</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Akun pengguna hanya diterbitkan oleh Tim Administrator MOVA.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
