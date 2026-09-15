import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Button } from "../ui/Button.jsx";

export function ArmadaFormModal({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  initialData = null,
  riders = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    code: "",
    model: "Sepeda Kopi Dorong Standar MOVA",
    plate_number: "",
    status: "AVAILABLE",
    battery_capacity: "100%",
    current_rider_id: "",
    last_service_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || initialData.id || "",
        model: initialData.model || "Sepeda Kopi Dorong Standar MOVA",
        plate_number: initialData.plate_number || "",
        status: initialData.status || "AVAILABLE",
        battery_capacity: initialData.battery_capacity || "100%",
        current_rider_id: initialData.current_rider_id || "",
        last_service_date: initialData.last_service_date || new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        code: `ARM-SDA-${Math.floor(Math.random() * 90 + 10)}`,
        model: "Sepeda Kopi Dorong Standar MOVA",
        plate_number: "",
        status: "AVAILABLE",
        battery_capacity: "100%",
        current_rider_id: "",
        last_service_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const riderOptions = [
    { value: "", label: "-- Belum Ditugaskan / Standby --" },
    ...riders.map((r) => ({ value: r.id, label: `${r.name || r.full_name} (${r.id})` })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Data Armada Gerobak" : "Tambah Armada Gerobak Baru"}
      subtitle="Manajemen unit gerobak kopi keliling, spesifikasi, dan status pemeliharaan."
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="accent" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? "Simpan Unit" : "Tambah Armada"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-['Inter']">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Kode Unit Armada"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="ARM-SDA-01"
            required
          />
          <Select
            label="Status Kesiapan"
            value={formData.status}
            onChange={(val) => setFormData({ ...formData, status: val })}
            options={[
              { value: "AVAILABLE", label: "Tersedia / Siap Digunakan" },
              { value: "IN_USE", label: "Sedang Beroperasi (In Use)" },
              { value: "MAINTENANCE", label: "Pemeliharaan / Servis" },
            ]}
          />
        </div>

        <Input
          label="Model / Tipe Gerobak"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          placeholder="Sepeda Kopi Dorong Standar MOVA"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nomor Plat / Registrasi Rangka"
            value={formData.plate_number}
            onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
            placeholder="W-1044-KLG"
          />
          <Input
            label="Tanggal Servis Terakhir"
            type="date"
            value={formData.last_service_date}
            onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
          />
        </div>

        <Select
          label="Penugasan Rider Pengemudi (Opsional)"
          value={formData.current_rider_id}
          onChange={(val) => setFormData({ ...formData, current_rider_id: val })}
          options={riderOptions}
        />
      </form>
    </Modal>
  );
}

export default ArmadaFormModal;
