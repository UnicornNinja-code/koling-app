import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { authService } from "../../services/authService.js";
import { Shield, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button, Alert, Card, MovaLogo, useToast } from "../../components/ui";

export function FirstLoginPage() {
  const navigate = useNavigate();
  const { user, updateUser, getRoleLandingPath } = useAuth();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Password strength calculation
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: "Sangat Lemah", color: "#EF4444" };
    if (score === 2) return { score, label: "Lemah", color: "#F97316" };
    if (score === 3) return { score, label: "Cukup", color: "#EAB308" };
    if (score === 4) return { score, label: "Kuat", color: "#22C55E" };
    return { score: 5, label: "Sangat Kuat", color: "#10B981" };
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.completeFirstLogin({ newPassword });
      
      // Update local auth context
      updateUser({ first_login: false });

      if (showToast) {
        showToast("Kata sandi berhasil diperbarui! Selamat datang di MOVA.", "success");
      }

      // Route to designated landing path
      const landingPath = getRoleLandingPath(user?.role || "SUPERADMIN");
      navigate(landingPath, { replace: true });
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memperbarui password. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-10 font-sans relative overflow-hidden text-neutral-100">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MovaLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">Aktivasi Keamanan Wajib</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Perbarui Kata Sandi Akun
          </h1>
          <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
            Untuk keamanan sistem, Anda wajib mengganti kata sandi sementara sebelum dapat mengakses dashboard operasional.
          </p>
        </div>

        {/* Account identifier badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs text-neutral-400">Akun:</span>
            <span className="text-xs font-semibold text-white">
              {user?.email || user?.username || "Pengguna"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
              {user?.role || "SUPERADMIN"}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-neutral-900/90 backdrop-blur-xl rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/50 flex items-start gap-2.5 text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* New Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="first-login-new-pw" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="first-login-new-pw"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter unik"
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Indicator */}
              {newPassword && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i <= strength.score ? strength.color : "#27272a",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="first-login-confirm-pw" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="first-login-confirm-pw"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  disabled={loading}
                  className={`w-full pl-10 pr-10 py-3 bg-neutral-950 border rounded-2xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all disabled:opacity-50 ${
                    confirmPassword && confirmPassword === newPassword
                      ? "border-emerald-500/50"
                      : "border-neutral-800"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword && confirmPassword === newPassword && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 pl-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Kata sandi cocok
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-900/30 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan Sandi...</span>
                </>
              ) : (
                <>
                  <span>Simpan & Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-neutral-500 mt-5">
          🔒 Verifikasi keamanan wajib sebelum mengakses COZIS DSS.
        </p>
      </div>
    </div>
  );
}
