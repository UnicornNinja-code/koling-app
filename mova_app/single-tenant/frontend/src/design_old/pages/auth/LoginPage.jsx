import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Compass,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { authService } from "../../services/authService.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { AuthLayout } from "../../components/layout/AuthLayout.jsx";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getRoleLandingPath } = useAuth();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Mohon masukkan email/username dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({ identifier, password });
      const user = res.user || res.data?.user || res;
      const token = res.token || res.data?.token || "mock-jwt-token";

      login(user, token);
      toast.success("Login Berhasil", `Selamat datang, ${user.full_name || user.username || "Pengguna"}!`);

      const targetPath = from || getRoleLandingPath(user.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Kombinasi email/username dan kata sandi tidak valid.";
      setErrorMessage(msg);
      toast.danger("Gagal Masuk", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Right Side Clean White Form Panel */}
      <div className="w-full max-w-md mx-auto my-auto py-2">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 border border-blue-100 dark:border-blue-900">
            <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Portal Masuk Sistem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Selamat Datang di Mova
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Sistem Pendukung Keputusan Lokasi Penjualan Usaha Keliling — Cabang Sidoarjo
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email atau Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="nama@email.com atau username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kata Sandi
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">Ingat sesi saya</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 font-bold py-3 text-sm rounded-xl shadow-md shadow-blue-500/20"
            isLoading={isLoading}
            icon={ArrowRight}
          >
            Masuk ke Akun
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Belum memiliki akun atau butuh aktivasi?{" "}
            <Link
              to="/register"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Aktivasi / Buat Akun
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

export default LoginPage;
