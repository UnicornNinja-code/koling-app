import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Button } from "../ui/Button.jsx";

export function ZoneFormModal({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  initialData = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    target_riders: 3,
    daily_quota: 150,
    status: "ACTIVE",
    description: "",
    center_lat: -7.4726,
    center_lng: 112.6675,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || initialData.id || "",
        name: initialData.name || initialData.zone_name || "",
        target_riders: initialData.target_riders || 3,
        daily_quota: initialData.daily_quota || 150,
        status: initialData.status || "ACTIVE",
        description: initialData.description || "",
        center_lat: initialData.lat || -7.4726,
        center_lng: initialData.lng || 112.6675,
      });
    } else {
      setFormData({
        code: `ZON-SDA-${Math.floor(Math.random() * 90 + 10)}`,
        name: "",
        target_riders: 3,
        daily_quota: 150,
        status: "ACTIVE",
        description: "",
        center_lat: -7.4726,
        center_lng: 112.6675,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Zona Operasional" : "Tambah Zona Operasional Baru"}
      subtitle="Definisikan batasan wilayah, target rider, dan kuota harian."
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="accent" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? "Simpan Perubahan" : "Buat Zona"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-['Inter']">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Kode Zona (Unik)"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="misal: ZON-SDA-05"
            required
          />
          <Select
            label="Status Operasional"
            value={formData.status}
            onChange={(val) => setFormData({ ...formData, status: val })}
            options={[
              { value: "ACTIVE", label: "Aktif (Beroperasi)" },
              { value: "INACTIVE", label: "Nonaktif / Ditutup" },
              { value: "WASPADA_HUJAN", label: "Waspada Cuaca / Hujan" },
            ]}
          />
        </div>

        <Input
          label="Nama Wilayah / Zona"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="misal: Alun-Alun Sidoarjo & GOR"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Target Rider Ideal"
            type="number"
            value={formData.target_riders}
            onChange={(e) => setFormData({ ...formData, target_riders: parseInt(e.target.value) || 1 })}
            min={1}
            max={20}
          />
          <Input
            label="Target Kuota Harian (Cup)"
            type="number"
            value={formData.daily_quota}
            onChange={(e) => setFormData({ ...formData, daily_quota: parseInt(e.target.value) || 50 })}
            min={10}
            step={10}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Latitude Titik Pusat"
            type="number"
            step="any"
            value={formData.center_lat}
            onChange={(e) => setFormData({ ...formData, center_lat: parseFloat(e.target.value) })}
          />
          <Input
            label="Longitude Titik Pusat"
            type="number"
            step="any"
            value={formData.center_lng}
            onChange={(e) => setFormData({ ...formData, center_lng: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Catatan / Deskripsi Wilayah
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Deskripsi potensi POI, jam ramai, atau catatan operasional lapangan..."
            rows={3}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
}

export default ZoneFormModal;
