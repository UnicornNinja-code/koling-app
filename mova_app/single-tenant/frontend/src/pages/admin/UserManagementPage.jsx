import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  StatusBadge,
  Input,
  Select,
  Modal,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  PageHeader,
} from "../../components/ui/index.js";
import { MOCK_USERS } from "./mockData.js";

export function UserManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
        <PageHeader
          title="Manajemen Pengguna & Hak Akses"
          subtitle="Pengaturan akun operasional Sejuta Jiwa Sidoarjo dengan kontrol hierarki peran (Superadmin, Management, Supervisor, Rider)"
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Tambah Pengguna Baru
            </Button>
          }
        />

        <Card>
          <CardHeader
            title="Daftar Pengguna Sistem"
            subtitle="Seluruh akun aktif dan hak akses peran"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari nama/email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { label: "Semua Peran", value: "ALL" },
                    { label: "Super Admin", value: "SUPERADMIN" },
                    { label: "Management", value: "MANAGEMENT" },
                    { label: "Supervisor", value: "SUPERVISOR" },
                    { label: "Rider", value: "RIDER" },
                  ]}
                  className="w-36 text-xs h-8"
                />
              </div>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Pengguna</TableHeaderCell>
                  <TableHeaderCell>Username</TableHeaderCell>
                  <TableHeaderCell>Peran (Role)</TableHeaderCell>
                  <TableHeaderCell>Kontak</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell align="right">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar role={user.role} name={user.full_name} size="sm" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{user.full_name}</div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        @{user.username}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "SUPERADMIN"
                            ? "primary"
                            : user.role === "MANAGEMENT"
                            ? "accent"
                            : user.role === "SUPERVISOR"
                            ? "success"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {user.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.is_active ? "ACTIVE" : "INACTIVE"} size="sm" />
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" icon={Edit}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-red-500 hover:text-red-600">
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Modal Tambah Pengguna */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Tambah Pengguna Baru"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" onClick={() => setIsAddModalOpen(false)}>
                Simpan & Kirim Undangan
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap *
              </label>
              <Input placeholder="Contoh: Pratama Arhan" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Username *
                </label>
                <Input placeholder="rider_arhan" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role *
                </label>
                <Select
                  options={[
                    { label: "Rider", value: "RIDER" },
                    { label: "Supervisor", value: "SUPERVISOR" },
                    { label: "Management", value: "MANAGEMENT" },
                  ]}
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Aktif *
              </label>
              <Input placeholder="arhan@mova.id" type="email" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / HP
              </label>
              <Input placeholder="08123456789" />
            </div>
          </div>
        </Modal>
      </div>
  );
}

export default UserManagementPage;
