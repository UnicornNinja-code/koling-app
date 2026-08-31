import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { userService } from "../../services/userService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { queryKeys } from "../../lib/queryKeys.js";
import { User, Mail, Shield, Calendar, KeyRound, CheckCircle2, Lock, ShieldCheck } from "lucide-react";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar (A-Z)")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil (a-z)")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka (0-9)"),
    confirmPassword: z.string().min(1, "Konfirmasi password baru wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok dengan password baru",
    path: ["confirmPassword"],
  });

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();

  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const { data: profileRes, isLoading } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: userService.getProfile,
  });

  const profileUser = profileRes?.user || profileRes?.data || authUser;

  // React Hook Form for Change Password
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) =>
      userService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: (res) => {
      setPasswordSuccess(res?.msg || "Password Anda berhasil diperbarui.");
      setPasswordError(null);
      resetPasswordForm();
    },
    onError: (err) => {
      setPasswordError(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memperbarui password."
      );
      setPasswordSuccess(null);
    },
  });

  const onSubmitPassword = (data) => {
    changePasswordMutation.mutate(data);
  };

  const getRoleVariant = (r) => {
    switch (r) {
      case "SUPERADMIN":
        return "danger";
      case "MANAGEMENT":
        return "primary";
      case "SUPERVISOR":
        return "info";
      case "RIDER":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <AppLayout title="Profil Akun" subtitle="Informasi Kredensial & Pengaturan Keamanan">
      <PageHeader
        title="Profil Pengguna & Keamanan"
        description="Kelola informasi akun terdaftar, hak akses sistem, dan perbarui kata sandi secara berkala."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Kartu Identitas Akun */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-[#FF5052]/10 border-2 border-[#FF5052]/20 text-[#FF5052] flex items-center justify-center font-black text-2xl mx-auto shadow-xs">
                {profileUser?.name?.[0] || profileUser?.username?.[0] || "U"}
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900 leading-tight">
                  {profileUser?.name || profileUser?.username || "Pengguna"}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">@{profileUser?.username}</p>
              </div>

              <div className="pt-2 flex justify-center">
                <StatusBadge variant={getRoleVariant(profileUser?.role)} size="md" withDot>
                  {profileUser?.role || "GUEST"}
                </StatusBadge>
              </div>
            </CardContent>

            <CardFooter className="flex-col items-start gap-2.5 bg-slate-50/70 p-4 text-xs">
              <div className="w-full flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status Akun:</span>
                <StatusBadge variant={profileUser?.is_active !== false ? "success" : "danger"} size="sm">
                  {profileUser?.is_active !== false ? "AKTIF" : "NONAKTIF"}
                </StatusBadge>
              </div>

              <div className="w-full flex items-center justify-between">
                <span className="text-slate-500 font-medium">Terdaftar Sejak:</span>
                <span className="text-slate-700 font-mono text-[11px]">
                  {profileUser?.created_at ? new Date(profileUser.created_at).toLocaleDateString("id-ID") : "-"}
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Kolom Kanan: Rincian Akun & Ganti Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Rincian Akun */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kredensial</CardTitle>
              <CardDescription>Rincian data identitas yang terdaftar pada sistem COZIS</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nama Lengkap</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900">
                    {profileUser?.name || "-"}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Username</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900 font-mono">
                    {profileUser?.username || "-"}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-medium mb-1">Alamat Email</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900">
                    {profileUser?.email || "-"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Ganti Password */}
          <Card>
            <CardHeader>
              <CardTitle>Perbarui Kata Sandi</CardTitle>
              <CardDescription>
                Gunakan kombinasi minimal 8 karakter dengan huruf besar, huruf kecil, dan angka
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {passwordSuccess && (
                <Alert variant="success" title="Kata Sandi Diperbarui">
                  {passwordSuccess}
                </Alert>
              )}

              {passwordError && (
                <Alert variant="danger" title="Gagal Memperbarui">
                  {passwordError}
                </Alert>
              )}

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <Input
                  label="Kata Sandi Saat Ini"
                  type="password"
                  leftIcon={Lock}
                  placeholder="••••••••"
                  required
                  error={passwordErrors.oldPassword?.message}
                  {...registerPassword("oldPassword")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Kata Sandi Baru"
                    type="password"
                    leftIcon={KeyRound}
                    placeholder="••••••••"
                    required
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword("newPassword")}
                  />

                  <Input
                    label="Konfirmasi Kata Sandi Baru"
                    type="password"
                    leftIcon={KeyRound}
                    placeholder="••••••••"
                    required
                    error={passwordErrors.confirmPassword?.message}
                    {...registerPassword("confirmPassword")}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isPending={changePasswordMutation.isPending}
                    className="shadow-xs font-bold"
                    leftIcon={ShieldCheck}
                  >
                    {changePasswordMutation.isPending ? "Menyimpan Perubahan..." : "Perbarui Kata Sandi"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
