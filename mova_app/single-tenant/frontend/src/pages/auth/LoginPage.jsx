import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Lock, User } from "lucide-react";
import { Button, Input, useToast } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";

export function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("superadmin@kopikeliling.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {}

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Validasi Input", "Email/Username dan Password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      if (auth?.login) {
        const result = await auth.login({ identifier, password });
        toast.success(
          "Autentikasi Berhasil",
          `Selamat datang, ${result.user?.name || result.user?.username || "Superadmin"}.`
        );
        const landingPath = auth.getRoleLandingPath(result.user?.role);
        navigate(landingPath);
      } else {
        toast.success("Autentikasi Berhasil", "Selamat datang di MOVA Control Room.");
        navigate("/dashboard");
      }
    } catch (err) {
      if (err?.response?.status === 429) {
        const warningMsg =
          err?.response?.data?.ui_notice?.message ||
          err?.response?.data?.msg ||
          "Batas percobaan login gagal terlampaui. Harap tunggu 1 menit sebelum mencoba kembali.";
        toast.warning("Batas Login Terlampaui", warningMsg);
      } else {
        const errorMsg =
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Kombinasi email/username dan password tidak sesuai.";
        toast.error("Autentikasi Gagal", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cds-background)] text-[var(--cds-text-primary)] flex items-center justify-center p-[24px]">
      <div className="w-full max-w-[420px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] shadow-[var(--cds-shadow-overlay)]">
        {/* Header */}
        <div className="p-[24px] border-b border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)]">
          <h1 className="cds-heading-03 text-[var(--cds-text-primary)] font-bold mt-1">
            MOVA App
          </h1>
          <p className="cds-body-compact-01 text-[var(--cds-text-secondary)] mt-1">
            Masuk dengan kredensial terdaftar untuk mengakses konsol operasional.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-[24px] space-y-[var(--cds-spacing-05)]">
          <Input
            id="login-id"
            label="Email / Username"
            type="text"
            icon={User}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
          />

          <Input
            id="login-pw"
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {/* Navigation Links: Forgot Password & Account Activation */}
          <div className="flex items-center justify-between cds-label-01 text-[12px] pt-[var(--cds-spacing-01)]">
            <Link
              to="/forgot-password"
              className="text-[var(--cds-interactive)] hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)]"
            >
              Lupa Password?
            </Link>
            <Link
              to="/activate"
              className="text-[var(--cds-text-secondary)] hover:text-[var(--cds-text-primary)] hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--cds-focus)]"
            >
              Aktivasi Akun
            </Link>
          </div>

          <div className="pt-[var(--cds-spacing-02)]">
            <Button
              kind="primary"
              size="lg"
              type="submit"
              loading={loading}
              icon={ArrowRight}
              className="w-full justify-between"
            >
              Masuk ke Sistem
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-[16px] border-t border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)] flex items-center justify-between cds-label-01 text-[var(--cds-text-secondary)]">
          <span>Sejuta Jiwa HUB Sidoarjo</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;


