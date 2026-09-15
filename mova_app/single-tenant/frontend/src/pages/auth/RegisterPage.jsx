import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, KeyRound, Lock, User } from "lucide-react";
import { Button, Input, useToast } from "../../components/ui/index.js";
import { authService } from "../../services/authService.js";

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Automatically read token and email from query params if coming from invitation email link
  useEffect(() => {
    const queryToken = searchParams.get("token") || searchParams.get("t");
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Validasi Input", "Token aktivasi wajib diisi.");
      return;
    }
    if (password.length < 6) {
      toast.error("Validasi Input", "Password minimal harus 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Validasi Gagal", "Konfirmasi password baru tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.activateAccount({ token, password });
      toast.success(
        "Aktivasi Berhasil",
        res?.msg || "Akun berhasil diaktifkan. Silakan masuk dengan kata sandi baru Anda."
      );
      navigate("/login");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Token aktivasi tidak valid atau telah kedaluwarsa.";
      toast.error("Aktivasi Gagal", errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
            Aktivasi Akun
          </h1>
          <p className="cds-body-compact-01 text-[var(--cds-text-secondary)] mt-1">
            Masukkan token aktivasi yang dikirimkan melalui email.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleActivate} className="p-[24px] space-y-[var(--cds-spacing-04)]">
          <Input
            id="activation-token"
            label="Token Undangan / Aktivasi"
            icon={KeyRound}
            placeholder="Masukkan token 32 karakter..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />

          <Input
            id="new-password"
            label="Buat Password Baru"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            id="confirm-password"
            label="Konfirmasi Password Baru"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="pt-[var(--cds-spacing-02)] space-y-[var(--cds-spacing-03)]">
            <Button
              kind="primary"
              size="lg"
              type="submit"
              loading={loading}
              icon={ArrowRight}
              className="w-full justify-between"
            >
              Aktivasi & Masuk ke Sistem
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-[16px] border-t border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)] flex items-center justify-between cds-label-01 text-[var(--cds-text-secondary)]">
          <span>Sejuta Jiwa Sidoarjo HUB</span>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
