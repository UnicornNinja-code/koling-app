import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Button } from "../ui/Button.jsx";

export function UserFormModal({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  initialData = null,
  zones = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "RIDER",
    assigned_zone_id: "",
    status: "ACTIVE",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        role: initialData.role || "RIDER",
        assigned_zone_id: initialData.assigned_zone_id || initialData.zone_id || "",
        status: initialData.status || "ACTIVE",
        password: "",
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        role: "RIDER",
        assigned_zone_id: "",
        status: "ACTIVE",
        password: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const zoneOptions = [
    { value: "", label: "-- Pilih Zona Penugasan --" },
    ...zones.map((z) => ({ value: z.id || z.code, label: `${z.code || z.id} - ${z.name || z.zone_name}` })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
      subtitle="Kelola akun Superadmin, Operator, Area Manager, atau Rider."
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="accent" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-['Inter']">
        <Input
          label="Nama Lengkap"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="misal: Ahmad Fauzi"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="fauzi@koling.id"
            required
          />
          <Input
            label="Nomor WhatsApp / HP"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="081234567890"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Hak Akses (Role)"
            value={formData.role}
            onChange={(val) => setFormData({ ...formData, role: val })}
            options={[
              { value: "RIDER", label: "Rider Lapangan" },
              { value: "OPERATOR", label: "Operator / Dispatcher" },
              { value: "AREA_MANAGER", label: "Area Manager / Supervisor" },
              { value: "SUPERADMIN", label: "Super Admin (HQ)" },
            ]}
          />
          <Select
            label="Status Akun"
            value={formData.status}
            onChange={(val) => setFormData({ ...formData, status: val })}
            options={[
              { value: "ACTIVE", label: "Aktif" },
              { value: "INACTIVE", label: "Nonaktif / Ditangguhkan" },
            ]}
          />
        </div>

        {formData.role === "RIDER" && (
          <Select
            label="Zona Penugasan Rider"
            value={formData.assigned_zone_id}
            onChange={(val) => setFormData({ ...formData, assigned_zone_id: val })}
            options={zoneOptions}
          />
        )}

        <div>
          <Input
            label={initialData ? "Kata Sandi Baru (Opsional)" : "Kata Sandi Awal"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={initialData ? "Biarkan kosong jika tidak diubah" : "Minimal 6 karakter"}
            required={!initialData}
          />
        </div>
      </form>
    </Modal>
  );
}

export default UserFormModal;
