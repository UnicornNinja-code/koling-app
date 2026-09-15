import React, { useState } from "react";
import { Users, Plus, ShieldCheck } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Tag,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableToolbar,
  Modal,
  useToast,
} from "../../components/ui/index.js";
import { MOCK_USERS } from "./mockData.js";

export function UserManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Direktori Pengguna & Otorisasi Hak Akses
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            User Management & RBAC Directory
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="primary" size="md" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Undang User Baru
          </Button>
        </div>
      </div>

      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <TableToolbar
          title="Daftar Akun Terdaftar"
          description="Pengaturan peran (SuperAdmin, Management, Supervisor, Rider) dan status aktif."
        />
        <Table>
          <TableHead>
            <TableRow isHeader>
              <TableHeader>Nama Lengkap</TableHeader>
              <TableHeader>Email / Username</TableHeader>
              <TableHeader>Role RBAC</TableHeader>
              <TableHeader className="text-right">Status Akun</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-[var(--cds-text-primary)]">{u.name}</TableCell>
                <TableCell className="font-mono text-[12px]">{u.email}</TableCell>
                <TableCell>
                  <Tag
                    type={
                      u.role === "SUPERADMIN"
                        ? "purple"
                        : u.role === "MANAGEMENT"
                        ? "blue"
                        : u.role === "SUPERVISOR"
                        ? "cyan"
                        : "green"
                    }
                    size="sm"
                  >
                    {u.role}
                  </Tag>
                </TableCell>
                <TableCell className="text-right">
                  <Tag type={u.status === "ACTIVE" ? "green" : "gray"} size="sm">
                    {u.status}
                  </Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrasi Pengguna Baru"
        label="IDENTITY & ACCESS"
        primaryButtonText="Kirim Undangan"
        secondaryButtonText="Batal"
        onPrimarySubmit={() => {
          toast.success("Undangan Terkirim", "Token aktivasi akun telah dibuat.");
          setIsModalOpen(false);
        }}
      >
        <div className="space-y-[var(--cds-spacing-04)]">
          <Input id="user-name" label="Nama Lengkap" placeholder="e.g. Budi Santoso" />
          <Input id="user-email" label="Alamat Email" type="email" placeholder="budi@example.com" />
          <Select
            id="user-role"
            label="Peran Akun (RBAC)"
            options={[
              { value: "SUPERADMIN", label: "Superadmin" },
              { value: "MANAGEMENT", label: "Management" },
              { value: "SUPERVISOR", label: "Supervisor" },
              { value: "RIDER", label: "Field Rider" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}

export default UserManagementPage;
