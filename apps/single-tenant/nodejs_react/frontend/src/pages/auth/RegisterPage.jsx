import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Key,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { authService } from "../../services/authService.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { AuthLayout } from "../../components/layout/AuthLayout.jsx";

export function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    birth_date: "",
    password: "",
    confirmPassword: "",
    token: "",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMessage("Mohon lengkapi kolom nama, email, dan kata sandi.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Kata sandi harus memiliki minimal 6 karakter.");
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage("Anda harus menyetujui Kebijakan Operasional Mova Sejuta Jiwa.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        username: formData.username || formData.email.split("@")[0],
        email: formData.email,
        phone: formData.phone || undefined,
        birth_date: formData.birth_date || undefined,
        password: formData.password,
        token: formData.token ? formData.token.trim() : undefined,
      };

      const res = await authService.register(payload);
      const msg = res.msg || "Akun berhasil didaftarkan! Silakan masuk.";
      setSuccessMessage(msg);
      toast.success("Registrasi Berhasil", msg);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Gagal melakukan registrasi. Silakan periksa kembali data Anda.";
      setErrorMessage(msg);
      toast.danger("Registrasi Gagal", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Right Side Clean White Form */}
      <div className="w-full max-w-lg mx-auto my-auto py-2">
        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 border border-blue-100 dark:border-blue-900">
            <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Pendaftaran Akun</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Buat Akun Baru Mova
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftarkan akun operasional Anda untuk Sejuta Jiwa Cabang Sidoarjo.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage} Mengalihkan ke halaman masuk...</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ahmad Fauzi"
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="fauzi@email.com"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / HP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Konfirmasi Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* Activation Token (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Token Aktivasi Undangan (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.token}
                onChange={(e) => handleChange("token", e.target.value)}
                placeholder="Isi jika menerima token undangan aktivasi dari admin"
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Saya menyetujui Ketentuan Layanan, Kebijakan Privasi, dan Standar Operasi Mova Sejuta Jiwa.
            </span>
          </label>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 font-bold py-3 text-sm rounded-xl shadow-md shadow-blue-500/20"
            isLoading={isLoading}
            icon={ArrowRight}
          >
            Daftarkan Akun
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-5 text-center space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Sudah memiliki akun terdaftar?{" "}
            <Link
              to="/login"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Masuk ke Akun
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

export default RegisterPage;
