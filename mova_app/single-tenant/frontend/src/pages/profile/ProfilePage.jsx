import React, { useState, useEffect } from "react";
import { User, Lock, Save, KeyRound, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button, Input, Tag, UserAvatar, useToast } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { userService } from "../../services/userService.js";

export function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const toast = useToast();

  // Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    birth_date: "",
    role: "SUPERADMIN",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Load profile from API on mount, with fallback to AuthContext
  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const res = await userService.getProfile();
        const data = res?.data || res?.user || res;
        if (isMounted && data) {
          setFormData({
            name: data.name || "",
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
            birth_date: data.birth_date ? data.birth_date.split("T")[0] : "",
            role: data.role || "SUPERADMIN",
          });
          updateUser({
            name: data.name,
            phone: data.phone,
            birth_date: data.birth_date,
            role: data.role,
          });
        }
      } catch (err) {
        // Fallback to local session
        if (isMounted && authUser) {
          setFormData({
            name: authUser.name || "",
            username: authUser.username || "",
            email: authUser.email || "",
            phone: authUser.phone || "",
            birth_date: authUser.birth_date ? authUser.birth_date.split("T")[0] : "",
            role: authUser.role || "SUPERADMIN",
          });
        }
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setProfileError("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setProfileError("Nama lengkap tidak boleh kosong.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        birth_date: formData.birth_date || null,
      };

      const res = await userService.updateProfile(payload);
      const updated = res?.data || res?.user || res;

      if (updated) {
        updateUser({
          name: updated.name,
          phone: updated.phone,
          birth_date: updated.birth_date,
        });
      }

      toast.success("Profil Tersimpan", "Perubahan informasi pribadi Anda telah berhasil disimpan.");
    } catch (err) {
      const msg =
        err.apiMessage ||
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        "Gagal menyimpan perubahan profil.";
      setProfileError(msg);
      toast.error("Gagal Menyimpan", msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Kata sandi saat ini wajib diisi.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal terdiri dari 8 karakter.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setIsSavingPassword(true);

    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Kata Sandi Diperbarui", "Kata sandi akun Anda telah berhasil diubah.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const msg =
        err.apiMessage ||
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        "Gagal mengubah kata sandi.";
      setPasswordError(msg);
      toast.error("Gagal Mengubah Sandi", msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getRoleTagColor = (role) => {
    switch (String(role).toUpperCase()) {
      case "SUPERADMIN":
        return "blue";
      case "MANAGEMENT":
        return "purple";
      case "SUPERVISOR":
        return "cyan";
      case "RIDER":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      {/* 1. Page Header */}
      <div className="border-b border-[var(--cds-border-subtle)] pb-4">
        <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold">
          Profil Pengguna
        </h2>
        <p className="cds-body-short-01 text-[var(--cds-text-secondary)] mt-1">
          Kelola informasi akun pribadi dan keamanan kata sandi Anda.
        </p>
      </div>

      {/* 2. Account Identity Strip */}
      <div className="flex items-center gap-4 p-4 bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <UserAvatar
          name={formData.name || authUser?.name || "User"}
          role={formData.role}
          avatarUrl={authUser?.avatar_url}
          size="md"
        />
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="cds-heading-compact-01 text-[var(--cds-text-primary)] font-semibold text-sm">
              {formData.name || authUser?.name || "Pengguna"}
            </span>
            <Tag type={getRoleTagColor(formData.role)} size="sm">
              {formData.role}
            </Tag>
          </div>
          <div className="cds-label-01 text-[var(--cds-text-secondary)] font-mono text-xs">
            @{formData.username || authUser?.username || "user"}
          </div>
        </div>
      </div>

      {/* 3. Personal Information Form */}
      <section className="space-y-4">
        <div>
          <h3 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
            Informasi Pribadi
          </h3>
          <p className="cds-label-01 text-[var(--cds-text-secondary)] mt-0.5">
            Perbarui nama lengkap, nomor kontak, dan tanggal lahir akun Anda.
          </p>
        </div>

        {profileError && (
          <div className="p-3 bg-[var(--cds-support-error-inverse)]/10 border-l-4 border-[var(--cds-support-error)] text-[var(--cds-support-error)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] p-5">
          <div className="space-y-1.5">
            <label className="cds-label-01 text-[var(--cds-text-secondary)] block">
              Nama Lengkap <span className="text-[var(--cds-support-error)]">*</span>
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleProfileChange}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="cds-label-01 text-[var(--cds-text-secondary)] block">
                Username
              </label>
              <Input
                value={`@${formData.username || "user"}`}
                disabled
                className="bg-[var(--cds-layer-02)] cursor-not-allowed opacity-80"
              />
            </div>

            <div className="space-y-1.5">
              <label className="cds-label-01 text-[var(--cds-text-secondary)] block">
                Email
              </label>
              <Input
                value={formData.email}
                disabled
                className="bg-[var(--cds-layer-02)] cursor-not-allowed opacity-80"
              />
              <span className="text-[11px] text-[var(--cds-text-secondary)] block">
                Alamat email terdaftar tidak dapat diubah.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="cds-label-01 text-[var(--cds-text-secondary)] block">
                Nomor Telepon
              </label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleProfileChange}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-1.5">
              <label className="cds-label-01 text-[var(--cds-text-secondary)] block">
                Tanggal Lahir
              </label>
              <Input
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--cds-border-subtle)]">
            <Button
              type="submit"
              kind="primary"
              disabled={isSavingProfile}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </Button>
          </div>
        </form>
      </section>

      {/* 4. Security & Password Form */}
      <section className="space-y-4">
        <div>
          <h3 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
            Keamanan Kata Sandi
          </h3>
          <p className="cds-label-01 text-[var(--cds-text-secondary)] mt-0.5">
            Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan sesi.
          </p>
        </div>

        {passwordError && (
          <div className="p-3 bg-[var(--cds-support-error-inverse)]/10 border-l-4 border-[var(--cds-support-error)] text-[var(--cds-support-error)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleSavePassword} className="space-y-4 bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] p-5">
          <div className="space-y-1.5">
            <label className="cds-label-01 text-[var(--cds-text-secondary)] block">
              Kata Sandi Saat Ini <span className="text-[var(--cds-support-error)]">*</span>
            </label>
            <div className="relative">
              <Input
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Masukkan kata sandi saat ini"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cds-icon-secondary)] hover:text-[var(--cds-icon-primary)] cursor-pointer"
                title={showCurrent ? "Sembunyikan" : "Tampilkan"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="cds-label-01 text-[var(--cds-text-secondary)] block">
                Kata Sandi Baru <span className="text-[var(--cds-support-error)]">*</span>
              </label>
              <div className="relative">
                <Input
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Min. 8 karakter"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cds-icon-secondary)] hover:text-[var(--cds-icon-primary)] cursor-pointer"
                  title={showNew ? "Sembunyikan" : "Tampilkan"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="cds-label-01 text-[var(--cds-text-secondary)] block">
                Konfirmasi Kata Sandi Baru <span className="text-[var(--cds-support-error)]">*</span>
              </label>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Ulangi kata sandi baru"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cds-icon-secondary)] hover:text-[var(--cds-icon-primary)] cursor-pointer"
                  title={showConfirm ? "Sembunyikan" : "Tampilkan"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--cds-border-subtle)]">
            <Button
              type="submit"
              kind="primary"
              disabled={isSavingPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
              className="flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSavingPassword ? "Memproses..." : "Perbarui Kata Sandi"}</span>
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
