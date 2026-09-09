import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, getRoleLandingPath } from "../../context/AuthContext.jsx";
import { authService } from "../../services/authService.js";
import { Coffee, Lock, User, Shield, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Alert } from "../../components/ui/Alert.jsx";

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
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-[#FF634A] rounded-xl flex items-center justify-center text-white mx-auto shadow-md shadow-orange-200 shrink-0">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            COZIS
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Coffee Operational Zone Intelligence System
          </p>
        </div>

        {/* Card Form Container */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#D2D2D4] shadow-xl space-y-6">
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
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi <span className="text-[#FF634A]">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#FF634A] hover:text-[#E54E36] font-semibold"
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
              className="w-full py-3 shadow-xs font-bold"
              rightIcon={ArrowRight}
            >
              {loading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}
            </Button>
          </form>

          {/* Activation Prompt */}
          <div className="p-3 bg-[#F4F4F6] rounded-xl border border-[#D2D2D4] text-center text-xs text-slate-600">
            Menerima undangan akun baru?{" "}
            <Link to="/activate" className="text-[#FF634A] hover:underline font-bold inline-flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Aktivasi Akun
            </Link>
          </div>

          {/* Enterprise Restricted Notice Footer */}
          <div className="pt-4 border-t border-[#D2D2D4]/50 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Akses Terbatas: Sistem Internal Perusahaan</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Akun pengguna hanya diterbitkan oleh Tim Administrator COZIS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
