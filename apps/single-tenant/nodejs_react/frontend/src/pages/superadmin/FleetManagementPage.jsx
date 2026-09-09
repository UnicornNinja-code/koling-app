import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { armadaService } from "../../services/armadaService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { Bike, Plus, Trash2, X } from "lucide-react";

export function FleetManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: fleetRes, isLoading } = useQuery({
    queryKey: queryKeys.armadas.all,
    queryFn: armadaService.getAll,
  });

  const fleets = fleetRes?.fleets || fleetRes?.data || [];

  const { register, handleSubmit, reset } = useForm();

  const addFleetMutation = useMutation({
    mutationFn: armadaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      setIsModalOpen(false);
      reset();
      alert("Armada baru berhasil ditambahkan!");
    },
    onError: (err) => {
      alert(`Gagal menambah armada: ${err.response?.data?.msg || err.message}`);
    },
  });

  const deleteFleetMutation = useMutation({
    mutationFn: armadaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armadas.all });
      alert("Armada berhasil dihapus!");
    },
    onError: (err) => {
      alert(`Gagal menghapus armada: ${err.response?.data?.msg || err.message}`);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      code: data.code || data.name,
      type: data.type || "MOTOR_LISTRIK",
      status: data.status || "ACTIVE",
    };
    addFleetMutation.mutate(payload);
  };

  return (
    <AppLayout title="Manajemen Armada" subtitle="Mobile Coffee Bicycles & Status Unit">
      <PageHeader
        title="Manajemen Unit Armada Sepeda"
        description="Kelola inventaris armada sepeda jualan kopi keliling dan status ketersediaannya."
        actionLabel="Tambah Unit Armada"
        actionIcon={Plus}
        onActionClick={() => setIsModalOpen(true)}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="p-4">Kode / Nama Unit</th>
                <th className="p-4">Tipe Armada</th>
                <th className="p-4 text-center">Status Operasional</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {isLoading ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-400">Memuat data armada...</td></tr>
              ) : fleets.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-400">Belum ada unit armada terdaftar.</td></tr>
              ) : (
                fleets.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FF5052]/10 text-[#FF5052] flex items-center justify-center font-bold shrink-0">
                        <Bike className="w-4 h-4" />
                      </div>
                      <span>{f.code || f.name || `Bike #${f.id}`}</span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {f.type === "MOTOR_LISTRIK" ? "Motor Listrik (E-Bike)" : f.type === "GEROBAK" ? "Gerobak / Bicycle Cart" : (f.type || "Gerobak")}
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge variant={f.status === "READY" || f.status === "ACTIVE" ? "success" : "warning"}>
                        {f.status || "ACTIVE"}
                      </StatusBadge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { if (confirm(`Hapus armada #${f.code || f.id}?`)) deleteFleetMutation.mutate(f.id); }}
                        className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Bottom Sheet Mobile Friendly */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md p-5 sm:p-6 rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-heading font-extrabold text-slate-900">Tambah Armada Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode / Nomor Seri Unit</label>
                <input {...register("code")} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl min-h-[44px] focus:outline-none focus:border-[#FF5052]" placeholder="SJ-001" required />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Armada</label>
                <select {...register("type")} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl min-h-[44px] bg-white focus:outline-none focus:border-[#FF5052]">
                  <option value="MOTOR_LISTRIK">Motor Listrik (E-Bike / Electric)</option>
                  <option value="GEROBAK_MOTOR">Gerobak Motor (Standard Cart)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Operasional</label>
                <select {...register("status")} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl min-h-[44px] bg-white focus:outline-none focus:border-[#FF5052]">
                  <option value="ACTIVE">ACTIVE (Ready)</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" variant="primary">Simpan Armada</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
