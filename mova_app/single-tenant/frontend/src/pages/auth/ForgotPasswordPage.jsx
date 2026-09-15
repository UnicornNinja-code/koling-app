import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Mail, Clock, Lock, KeyRound } from "lucide-react";
import { Button, Input, useToast } from "../../components/ui/index.js";
import { authService } from "../../services/authService.js";
import {
  setForgotPasswordCooldown,
  getRemainingForgotPasswordCooldown,
  formatCooldownTime,
} from "../../utils/cooldown.js";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // Reset Token from query parameter (from Ethereal Email Link)
  const token = searchParams.get("token") || searchParams.get("t");
  const queryEmail = searchParams.get("email") || "";

  // Request Reset Link state
  const [email, setEmail] = useState(queryEmail);
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(() => getRemainingForgotPasswordCooldown());

  // Reset Password form state (when token is present)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Real-time interval countdown for cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (cooldown > 0) {
      toast.warning(
        "Batas Waktu Tunggu",
        `Harap tunggu ${formatCooldownTime(cooldown)} sebelum mengirim ulang permintaan.`
      );
      return;
    }

    if (!email) {
      toast.error("Validasi Input", "Masukkan alamat email Anda.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSentSuccess(true);

      const retryAfter = res?.retryAfter || 120;
      setForgotPasswordCooldown(retryAfter);
      setCooldown(retryAfter);

      toast.success(
        "Permintaan Diproses",
        res?.msg ||
          "Jika email Anda terdaftar dalam sistem, instruksi pemulihan kata sandi telah dikirimkan."
      );
    } catch (err) {
      if (err?.response?.status === 429) {
        const retryAfter =
          err?.response?.data?.retryAfter || getRemainingForgotPasswordCooldown() || 120;
        setForgotPasswordCooldown(retryAfter);
        setCooldown(retryAfter);

        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data?.msg ||
          `Terlalu banyak permintaan. Silakan tunggu ${retryAfter} detik.`;
        toast.warning("Batas Permintaan", errorMsg);
      } else {
        const errorMsg =
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memproses permintaan reset password.";
        toast.error("Permintaan Gagal", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Validasi Input", "Token pemulihan kata sandi tidak valid atau hilang.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Validasi Input", "Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Validasi Gagal", "Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({ token, password: newPassword });
      toast.success(
        "Kata Sandi Diperbarui",
        res?.msg || "Kata sandi berhasil diatur ulang. Silakan masuk dengan kata sandi baru Anda."
      );
      navigate("/login");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Token reset password tidak valid atau telah kedaluwarsa.";
      toast.error("Gagal Reset Password", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || (!token && cooldown > 0);

  return (
    <div className="min-h-screen bg-[var(--cds-background)] text-[var(--cds-text-primary)] flex items-center justify-center p-[24px]">
      <div className="w-full max-w-[420px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] shadow-[var(--cds-shadow-overlay)]">
        {/* Header */}
        <div className="p-[24px] border-b border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)]">
          <Link
            to="/login"
            className="inline-flex items-center gap-[var(--cds-spacing-02)] cds-label-01 text-[var(--cds-text-secondary)] hover:text-[var(--cds-text-primary)] hover:underline mb-[var(--cds-spacing-03)] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Login</span>
          </Link>
          <h1 className="cds-heading-03 text-[var(--cds-text-primary)] font-bold mt-1">
            {token ? "Atur Ulang Kata Sandi" : "Lupa Password"}
          </h1>
          <p className="cds-body-compact-01 text-[var(--cds-text-secondary)] mt-1">
            {token
              ? "Masukkan kata sandi baru untuk akun Anda."
              : "Masukkan alamat email terdaftar untuk menerima tautan pemulihan kata sandi."}
          </p>
        </div>

        {/* Form: Token Reset Mode vs Request Mode */}
        {token ? (
          <form onSubmit={handleSetNewPassword} className="p-[24px] space-y-[var(--cds-spacing-05)]">
            <Input
              id="newPassword"
              label="Kata Sandi Baru"
              type="password"
              icon={Lock}
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Input
              id="confirmPassword"
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              icon={KeyRound}
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <div className="pt-[var(--cds-spacing-02)]">
              <Button
                kind="primary"
                size="lg"
                type="submit"
                loading={loading}
                disabled={isButtonDisabled}
                icon={ArrowRight}
                className="w-full justify-between"
              >
                Simpan Kata Sandi Baru
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="p-[24px] space-y-[var(--cds-spacing-05)]">
            <Input
              id="email"
              label="Alamat Email Terdaftar"
              type="email"
              icon={Mail}
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={cooldown > 0}
            />

            <div className="pt-[var(--cds-spacing-02)]">
              <Button
                kind={cooldown > 0 ? "secondary" : "primary"}
                size="lg"
                type="submit"
                loading={loading}
                disabled={isButtonDisabled}
                icon={cooldown > 0 ? Clock : ArrowRight}
                className="w-full justify-between"
              >
                {cooldown > 0
                  ? `Kirim Ulang (${formatCooldownTime(cooldown)})`
                  : sentSuccess
                  ? "Kirim Ulang Tautan Reset"
                  : "Kirim Tautan Reset"}
              </Button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="p-[16px] border-t border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)] flex items-center justify-between cds-label-01 text-[var(--cds-text-secondary)]">
          <span>Sejuta Jiwa HUB Sidoarjo</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

