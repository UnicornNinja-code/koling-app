import React from "react";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { useQuery } from "@tanstack/react-query";
import { distributionService } from "../../services/distributionService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Users, Sparkles, MapPin, CheckCircle2 } from "lucide-react";

export function DistributionPage() {
  const { data: overviewRes, isLoading } = useQuery({
    queryKey: queryKeys.distribution.overview(),
    queryFn: distributionService.getOverview,
  });

  const overview = overviewRes?.data || overviewRes || {};
  const waitingRiders = overview.waiting_riders || [];
  const assignedRiders = overview.assigned_riders || [];

  return (
    <AppLayout title="Distribusi Penugasan Rider" subtitle="Plotting Spasial & Rekomendasi TOPSIS">
      <PageHeader
        title="Workspace Distribusi & Plotting Penugasan"
        description="Kelola antrean kehadiran rider (WAITING), alokasi zona otomatis berbasis DSS TOPSIS, dan manual override."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Antrean Kehadiran (WAITING) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Antrean Kehadiran Rider (WAITING)
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {waitingRiders.length} Rider
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {waitingRiders.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">Tidak ada rider dalam antrean konfirmasi kehadiran.</p>
            ) : (
              waitingRiders.map((r, idx) => (
                <div key={r.id || idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{r.name || r.rider_name || r.username}</p>
                    <span className="text-[10px] text-slate-400">Terkonfirmasi: {r.confirmed_at ? new Date(r.confirmed_at).toLocaleTimeString("id-ID") : "-"}</span>
                  </div>
                  <StatusBadge variant="warning">WAITING</StatusBadge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Penugasan (ASSIGNED / PLOTTED) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Rider Terploting di Zona (ASSIGNED)
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {assignedRiders.length} Penugasan
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {assignedRiders.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">Belum ada penugasan aktif hari ini.</p>
            ) : (
              assignedRiders.map((a, idx) => (
                <div key={a.id || idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{a.rider_name || "Rider"}</p>
                    <span className="text-[11px] text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF5052]" /> {a.zone_name || "Zona"}
                    </span>
                  </div>
                  <StatusBadge variant="success">{a.status || "ASSIGNED"}</StatusBadge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
