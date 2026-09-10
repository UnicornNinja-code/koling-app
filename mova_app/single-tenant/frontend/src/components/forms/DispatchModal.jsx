import React, { useState } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Select } from "../ui/Select.jsx";
import { Input } from "../ui/Input.jsx";
import { Button } from "../ui/Button.jsx";

export function DispatchModal({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  rider = null,
  zones = [],
  spots = [],
  isLoading = false,
}) {
  const [targetZone, setTargetZone] = useState("");
  const [targetSpot, setTargetSpot] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rider_id: rider?.id,
      target_zone_id: targetZone,
      target_spot_id: targetSpot,
      instructions,
    });
  };

  const zoneOptions = [
    { value: "", label: "-- Pilih Zona Tujuan --" },
    ...zones.map((z) => ({ value: z.id || z.code, label: `${z.code || z.id} - ${z.name || z.zone_name}` })),
  ];

  const spotOptions = [
    { value: "", label: "-- Rekomendasi Titik Spot (Opsional) --" },
    ...spots.map((s) => ({ value: s.id, label: `${s.name} (Skor DSS: ${s.score || s.ci_score || "0.85"})` })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Penugasan & Reallokasi Rider"
      subtitle={`Tugaskan lokasi atau pindahkan ${rider?.name || "Rider"} ke zona operasional baru.`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="accent" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Kirim Penugasan
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-['Inter']">
        <div className="p-3 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-400">Rider yang dipilih:</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{rider?.name || "Ahmad Fauzi"}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400">Zona Saat Ini:</div>
            <div className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{rider?.zone || rider?.zone_name || "ZON-SDA-01"}</div>
          </div>
        </div>

        <Select
          label="Zona Operasi Tujuan"
          value={targetZone}
          onChange={setTargetZone}
          options={zoneOptions}
          required
        />

        <Select
          label="Titik Spot Rekomendasi DSS (Opsional)"
          value={targetSpot}
          onChange={setTargetSpot}
          options={spotOptions}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Instruksi / Catatan Khusus untuk Rider
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="misal: Geser ke pintu barat GOR Sidoarjo, antrian pengunjung car free day padat."
            rows={3}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
}

export default DispatchModal;
