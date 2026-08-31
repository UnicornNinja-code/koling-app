import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableContainer,
  TableEmpty,
} from "../../components/ui/Table.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { userService } from "../../services/userService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { queryKeys } from "../../lib/queryKeys.js";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Power,
  Trash2,
  UserCheck,
  Shield,
  Calendar,
  AlertCircle,
  Filter,
  CheckCircle2,
  Copy,
  Bike,
  UserCog,
  Briefcase,
  KeyRound,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar (A-Z)")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil (a-z)")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka (0-9)"),
  role: z.enum(["RIDER", "SUPERVISOR", "MANAGEMENT", "SUPERADMIN"]),
});

const editUserSchema = z.object({
  name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["RIDER", "SUPERVISOR", "MANAGEMENT", "SUPERADMIN"]),
});

export function UserManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isSuperadmin = currentUser?.role === "SUPERADMIN";

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Active User Selection State
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Role, 2: Identity, 3: Password, 4: Result
  const [provisionedUserResult, setProvisionedUserResult] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch Users List
  const { data: usersRes, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: userService.getUsers,
  });

  const usersList = usersRes?.users || usersRes?.data || [];

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchSearch =
        !searchTerm ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.is_active !== false) ||
        (statusFilter === "INACTIVE" && u.is_active === false);

      return matchSearch && matchRole && matchStatus;
    });
  }, [usersList, searchTerm, roleFilter, statusFilter]);

  // Create User Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors, isSubmitting: isSubmittingCreate },
    reset: resetCreateForm,
    setValue: setCreateValue,
    watch: watchCreate,
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "CozisPassword123",
      role: "RIDER",
    },
  });

  const selectedRoleWatch = watchCreate("role");

  // Edit User Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit },
    reset: resetEditForm,
  } = useForm({
    resolver: zodResolver(editUserSchema),
  });

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      setProvisionedUserResult({
        ...variables,
        id: data?.user?.id || data?.id,
      });
      setWizardStep(4); // Move to final summary step
    },
  });

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => userService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      setShowEditModal(false);
      setSelectedUser(null);
    },
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => userService.setUserStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      setShowStatusModal(false);
      setSelectedUser(null);
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      setShowDeleteModal(false);
      setSelectedUser(null);
    },
  });

  const handleOpenCreateWizard = () => {
    resetCreateForm({
      username: "",
      name: "",
      email: "",
      password: "CozisPassword123",
      role: "RIDER",
    });
    setWizardStep(1);
    setProvisionedUserResult(null);
    setShowCreateWizard(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    resetEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleCopyCredentials = () => {
    if (!provisionedUserResult) return;
    const text = `Kredensial Akun COZIS:\nUsername: ${provisionedUserResult.username}\nEmail: ${provisionedUserResult.email}\nRole: ${provisionedUserResult.role}\nPassword Sementara: ${provisionedUserResult.password}\n\nTautan Masuk: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
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
    <AppLayout
      title="Manajemen Akun"
      subtitle="Provisioning Akun Internal & Pengaturan Akses Personel"
    >
      <PageHeader
        title="Provisioning Akun Pengguna"
        description="Kelola akun pengguna, terbitkan kredensial personel, dan atur status akses karyawan."
        actionLabel="Terbitkan Akun Baru"
        actionIcon={Plus}
        onActionClick={handleOpenCreateWizard}
      />

      {/* Filter & Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              leftIcon={Search}
              placeholder="Cari nama, username, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: "ALL", label: "Semua Peran (Roles)" },
                { value: "SUPERADMIN", label: "SUPERADMIN" },
                { value: "MANAGEMENT", label: "MANAGEMENT" },
                { value: "SUPERVISOR", label: "SUPERVISOR" },
                { value: "RIDER", label: "RIDER" },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "ALL", label: "Semua Status Akun" },
                { value: "ACTIVE", label: "Hanya Akun Aktif" },
                { value: "INACTIVE", label: "Hanya Akun Nonaktif" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Email & Kontak</TableHead>
              <TableHead>Peran (Role)</TableHead>
              <TableHead>Status Akun</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableEmpty colSpan={6} message="Memuat daftar pengguna..." />
            ) : filteredUsers.length === 0 ? (
              <TableEmpty colSpan={6} message="Tidak ada pengguna yang cocok dengan kriteria pencarian." />
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FF634A]/10 text-[#FF634A] font-bold flex items-center justify-center text-xs shrink-0 border border-[#FF634A]/20">
                        {u.name?.[0] || u.username?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">@{u.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{u.email}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={getRoleVariant(u.role)} size="sm">
                      {u.role}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={u.is_active !== false ? "success" : "danger"}
                      size="sm"
                      withDot
                    >
                      {u.is_active !== false ? "AKTIF" : "NONAKTIF"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 font-mono">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowDetailModal(true);
                        }}
                        variant="ghost"
                        size="icon"
                        title="Lihat Rincian"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </Button>

                      <Button
                        onClick={() => handleOpenEdit(u)}
                        variant="ghost"
                        size="icon"
                        title="Ubah Profil / Peran"
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Button>

                      <Button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowStatusModal(true);
                        }}
                        variant="ghost"
                        size="icon"
                        title={u.is_active !== false ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                      >
                        <Power className={`w-4 h-4 ${u.is_active !== false ? "text-amber-600" : "text-emerald-600"}`} />
                      </Button>

                      {isSuperadmin && u.role !== "SUPERADMIN" && (
                        <Button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowDeleteModal(true);
                          }}
                          variant="ghost"
                          size="icon"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================================================ */}
      {/* 4-STEP PROVISIONING WIZARD MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        title="Wizard Penerbitan Akun Internal"
        description={`Langkah ${wizardStep} dari 4: ${
          wizardStep === 1
            ? "Pilih Peran Personel"
            : wizardStep === 2
            ? "Data Identitas Akun"
            : wizardStep === 3
            ? "Kredensial Sementara"
            : "Ringkasan Penerbitan"
        }`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-5">
          {/* Stepper Header Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-[#D2D2D4]/50">
            <span className={wizardStep === 1 ? "text-[#FF634A] font-bold" : ""}>1. Peran</span>
            <span className={wizardStep === 2 ? "text-[#FF634A] font-bold" : ""}>2. Identitas</span>
            <span className={wizardStep === 3 ? "text-[#FF634A] font-bold" : ""}>3. Sandi</span>
            <span className={wizardStep === 4 ? "text-emerald-700 font-bold" : ""}>4. Ringkasan</span>
          </div>

          {/* STEP 1: ROLE SELECTION */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Pilih peran organisasi yang akan diberikan kepada personel ini:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* RIDER */}
                <div
                  onClick={() => setCreateValue("role", "RIDER")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedRoleWatch === "RIDER"
                      ? "border-[#FF634A] bg-orange-50/40 ring-2 ring-[#FF634A]/20"
                      : "border-[#D2D2D4] hover:bg-[#F4F4F6]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Bike className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs">RIDER</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Mitra lapangan penjual kopi keliling, klaim armada & pencatatan POS.
                  </p>
                </div>

                {/* SUPERVISOR */}
                <div
                  onClick={() => setCreateValue("role", "SUPERVISOR")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedRoleWatch === "SUPERVISOR"
                      ? "border-[#FF634A] bg-orange-50/40 ring-2 ring-[#FF634A]/20"
                      : "border-[#D2D2D4] hover:bg-[#F4F4F6]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs">SUPERVISOR</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Pengawas operasional lapangan, eksekusi DSS & plotting rider ke zona.
                  </p>
                </div>

                {/* MANAGEMENT */}
                <div
                  onClick={() => setCreateValue("role", "MANAGEMENT")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedRoleWatch === "MANAGEMENT"
                      ? "border-[#FF634A] bg-orange-50/40 ring-2 ring-[#FF634A]/20"
                      : "border-[#D2D2D4] hover:bg-[#F4F4F6]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <UserCog className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-slate-900 text-xs">MANAGEMENT</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Pengelola armada, katalog produk, dan laporan analitik bisnis.
                  </p>
                </div>

                {/* SUPERADMIN */}
                {isSuperadmin && (
                  <div
                    onClick={() => setCreateValue("role", "SUPERADMIN")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedRoleWatch === "SUPERADMIN"
                        ? "border-[#FF634A] bg-orange-50/40 ring-2 ring-[#FF634A]/20"
                        : "border-[#D2D2D4] hover:bg-[#F4F4F6]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Shield className="w-5 h-5 text-rose-600" />
                      <span className="font-bold text-slate-900 text-xs">SUPERADMIN</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Akses master sistem, konfigurasi DSS, audit logs & automasi cron.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  onClick={() => setWizardStep(2)}
                  variant="primary"
                  size="md"
                  rightIcon={ArrowRight}
                >
                  Lanjut ke Data Identitas
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: IDENTITY */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <Input
                label="Nama Lengkap Personel"
                placeholder="Contoh: Budi Santoso"
                required
                error={createErrors.name?.message}
                {...registerCreate("name")}
              />

              <Input
                label="Username Akun"
                placeholder="budisantoso"
                required
                error={createErrors.username?.message}
                {...registerCreate("username")}
              />

              <Input
                label="Alamat Email Resmi"
                type="email"
                placeholder="budi@manta-kopi.com"
                required
                error={createErrors.email?.message}
                {...registerCreate("email")}
              />

              <div className="pt-3 flex items-center justify-between">
                <Button
                  onClick={() => setWizardStep(1)}
                  variant="outline"
                  size="md"
                  leftIcon={ArrowLeft}
                >
                  Kembali
                </Button>
                <Button
                  onClick={() => setWizardStep(3)}
                  variant="primary"
                  size="md"
                  rightIcon={ArrowRight}
                >
                  Lanjut ke Kredensial
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: TEMPORARY PASSWORD */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <Alert variant="info" title="Kata Sandi Sementara">
                Kata sandi ini akan digunakan personel untuk masuk pertama kali dan dapat diperbarui secara mandiri.
              </Alert>

              <Input
                label="Kata Sandi Awal"
                type="text"
                required
                error={createErrors.password?.message}
                {...registerCreate("password")}
              />

              <div className="pt-3 flex items-center justify-between">
                <Button
                  onClick={() => setWizardStep(2)}
                  variant="outline"
                  size="md"
                  leftIcon={ArrowLeft}
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleSubmitCreate((data) => createUserMutation.mutate(data))}
                  variant="primary"
                  size="md"
                  isPending={createUserMutation.isPending}
                  leftIcon={UserCheck}
                >
                  {createUserMutation.isPending ? "Menerbitkan Akun..." : "Terbitkan Akun"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PROVISIONING RESULT & ACTIVATION SUMMARY */}
          {wizardStep === 4 && provisionedUserResult && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-heading font-extrabold text-base text-slate-900">
                  Akun Berhasil Diterbitkan!
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Akun telah terdaftar dan siap diaktivasi oleh personel bersangkutan.
                </p>
              </div>

              <div className="p-4 bg-[#F4F4F6] rounded-xl border border-[#D2D2D4] text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Nama:</span>
                  <span className="font-bold text-slate-900">{provisionedUserResult.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Username:</span>
                  <span className="font-bold text-slate-900">{provisionedUserResult.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Email:</span>
                  <span className="text-slate-700">{provisionedUserResult.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Peran:</span>
                  <StatusBadge variant={getRoleVariant(provisionedUserResult.role)} size="sm">
                    {provisionedUserResult.role}
                  </StatusBadge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Sandi Awal:</span>
                  <span className="font-bold text-[#FF634A]">{provisionedUserResult.password}</span>
                </div>
              </div>

              {copiedNotification && (
                <Alert variant="success">Kredensial berhasil disalin ke clipboard!</Alert>
              )}

              <div className="pt-2 flex items-center gap-2">
                <Button
                  onClick={handleCopyCredentials}
                  variant="outline"
                  size="md"
                  className="flex-1"
                  leftIcon={Copy}
                >
                  Salin Informasi Akun
                </Button>
                <Button
                  onClick={() => setShowCreateWizard(false)}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  Selesai
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* DETAIL MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Rincian Pengguna"
        description="Informasi profil dan hak akses terdaftar pada sistem"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[#F4F4F6] rounded-xl border border-[#D2D2D4]">
              <div className="w-12 h-12 rounded-xl bg-[#FF634A]/10 text-[#FF634A] font-black text-lg flex items-center justify-center border border-[#FF634A]/20">
                {selectedUser.name?.[0] || selectedUser.username?.[0] || "U"}
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-slate-900 text-sm">{selectedUser.name}</h4>
                <p className="text-xs text-slate-500 font-mono">@{selectedUser.username}</p>
              </div>
            </div>

            <div className="p-4 bg-[#F4F4F6] rounded-xl border border-[#D2D2D4] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Alamat Email:</span>
                <span className="font-semibold text-slate-800">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Peran Akses:</span>
                <StatusBadge variant={getRoleVariant(selectedUser.role)} size="sm">
                  {selectedUser.role}
                </StatusBadge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status Operasional:</span>
                <StatusBadge variant={selectedUser.is_active !== false ? "success" : "danger"} size="sm" withDot>
                  {selectedUser.is_active !== false ? "AKTIF" : "NONAKTIF"}
                </StatusBadge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tanggal Diterbitkan:</span>
                <span className="font-mono text-slate-700">
                  {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString("id-ID") : "-"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => setShowDetailModal(false)} variant="primary" size="md">
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* EDIT MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Ubah Profil Pengguna"
        description="Perbarui nama lengkap, email, atau peran akses pengguna"
      >
        <form
          onSubmit={handleSubmitEdit((data) =>
            updateUserMutation.mutate({ id: selectedUser?.id, payload: data })
          )}
          className="space-y-4"
        >
          <Input
            label="Nama Lengkap"
            required
            error={editErrors.name?.message}
            {...registerEdit("name")}
          />

          <Input
            label="Alamat Email"
            type="email"
            required
            error={editErrors.email?.message}
            {...registerEdit("email")}
          />

          <Select
            label="Peran (Role)"
            error={editErrors.role?.message}
            {...registerEdit("role")}
            options={[
              { value: "RIDER", label: "RIDER" },
              { value: "SUPERVISOR", label: "SUPERVISOR" },
              { value: "MANAGEMENT", label: "MANAGEMENT" },
              ...(isSuperadmin ? [{ value: "SUPERADMIN", label: "SUPERADMIN" }] : []),
            ]}
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button onClick={() => setShowEditModal(false)} variant="outline" size="md">
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isPending={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* STATUS TOGGLE MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={selectedUser?.is_active !== false ? "Nonaktifkan Akun Pengguna" : "Aktifkan Akun Pengguna"}
        description={`Konfirmasi perubahan status akses untuk ${selectedUser?.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {selectedUser?.is_active !== false
              ? `Apakah Anda yakin ingin menonaktifkan akun "${selectedUser?.name}"? Pengguna tidak akan dapat masuk ke sistem COZIS.`
              : `Aktifkan kembali akun "${selectedUser?.name}" untuk memulihkan akses ke platform COZIS.`}
          </p>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button onClick={() => setShowStatusModal(false)} variant="outline" size="md">
              Batal
            </Button>
            <Button
              onClick={() =>
                toggleStatusMutation.mutate({
                  id: selectedUser?.id,
                  is_active: !(selectedUser?.is_active !== false),
                })
              }
              variant={selectedUser?.is_active !== false ? "danger" : "primary"}
              size="md"
              isPending={toggleStatusMutation.isPending}
            >
              {toggleStatusMutation.isPending
                ? "Memproses..."
                : selectedUser?.is_active !== false
                ? "Ya, Nonaktifkan Akun"
                : "Ya, Aktifkan Akun"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* DELETE MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Akun Pengguna"
        description="Tindakan ini bersifat permanen dan tidak dapat dibatalkan"
      >
        <div className="space-y-4">
          <Alert variant="danger" title="Peringatan Penghapusan">
            Akun <b>{selectedUser?.name}</b> (@{selectedUser?.username}) akan dihapus secara permanen dari database.
          </Alert>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button onClick={() => setShowDeleteModal(false)} variant="outline" size="md">
              Batal
            </Button>
            <Button
              onClick={() => deleteUserMutation.mutate(selectedUser?.id)}
              variant="danger"
              size="md"
              isPending={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
