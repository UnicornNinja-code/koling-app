import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { auditService } from "../../services/auditService.js";
import { cronService } from "../../services/cronService.js";
import { operationalRuleService } from "../../services/operationalRuleService.js";
import { FileText, RefreshCw, Play, Power, ShieldAlert, AlertTriangle, CheckCircle, SlidersHorizontal, X } from "lucide-react";

export function AuditCronPage() {
  const queryClient = useQueryClient();

  // Modal State for Rule Change Confirmation
  const [pendingRuleChange, setPendingRuleChange] = useState(null); // { settingKey, targetValue, title, description }

  // 1. Fetch Audit Logs
  const { data: auditRes, isLoading: loadingAudit } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: auditService.getAuditLogs,
  });

  // 2. Fetch Cron Configs & Logs
  const { data: cronConfigsRes, isLoading: loadingCron } = useQuery({
    queryKey: ["cronConfigs"],
    queryFn: cronService.getCronConfigs,
  });

  const { data: cronLogsRes } = useQuery({
    queryKey: ["cronLogs"],
    queryFn: cronService.getCronLogs,
  });

  // 3. Fetch Operational Rules Config
  const { data: rulesRes, isLoading: loadingRules } = useQuery({
    queryKey: ["operationalRules"],
    queryFn: operationalRuleService.getOperationalRules,
  });

  const auditLogs = auditRes?.logs || auditRes?.data || [];
  const cronConfigs = cronConfigsRes?.configs || cronConfigsRes?.data || [];
  const operationalRules = rulesRes?.data || { protocol_road_prohibited: true, toll_road_prohibited: true };

  // Mutations
  const updateRuleMutation = useMutation({
    mutationFn: (payload) => operationalRuleService.updateOperationalRules(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["operationalRules"]);
      queryClient.invalidateQueries(["auditLogs"]);
      queryClient.invalidateQueries(["zones"]);
      setPendingRuleChange(null);
      
      const summary = data?.affected_zones_summary || {};
      alert(
        `[Aturan Operasional Berhasil Diperbarui]\n` +
        `• Zona di-reevaluasi: ${summary.total_reevaluated || 0}\n` +
        `• Menjadi RESTRICTED: ${summary.newly_restricted || 0}\n` +
        `• Dipulihkan ke ACTIVE: ${summary.restored_active || 0}`
      );
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal memperbarui aturan operasional.");
    },
  });

  const triggerCronMutation = useMutation({
    mutationFn: cronService.triggerCronManually,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cronLogs"]);
      alert(`[Trigger Berhasil] ${data?.msg || "Cron job manual berhasil dijalankan."}`);
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal menjalankan cron job.");
    },
  });

  const toggleCronMutation = useMutation({
    mutationFn: (cronKey) => cronService.toggleCronActive(cronKey),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cronConfigs"]);
      alert(data?.msg || "Status cron job diperbarui.");
    },
  });

  const handleToggleRuleClick = (ruleKey, currentValue) => {
    const targetValue = !currentValue;
    const isProtocol = ruleKey === "protocol_road_prohibited";
    const ruleTitle = isProtocol ? "Aturan Jalan Protokol" : "Aturan Jalan Tol";

    let message = "";
    if (targetValue) {
      // Enabling rule (OFF -> ON)
      message = `Aturan larangan ${ruleTitle} akan DIAKTIFKAN (BLOCKING).\nZona yang saat ini beririsan dengan area ini akan diubah menjadi status RESTRICTED dan dilarang beroperasi.`;
    } else {
      // Disabling rule (ON -> OFF)
      message = `Aturan larangan ${ruleTitle} akan DINONAKTIFKAN (ADVISORY ONLY).\nZona yang beririsan tetap dapat digunakan secara operasional, tetapi sistem akan menampilkan peringatan ADVISORY.`;
    }

    setPendingRuleChange({
      ruleKey,
      targetValue,
      ruleTitle,
      message,
    });
  };

  const confirmRuleChange = () => {
    if (!pendingRuleChange) return;
    updateRuleMutation.mutate({
      [pendingRuleChange.ruleKey]: pendingRuleChange.targetValue,
    });
  };

  return (
    <AppLayout title="Audit Log & Settings" subtitle="Monitoring Log Aktivitas, System Settings & Operational Rules">
      <PageHeader
        title="Audit Logging & Operational Rules Management"
        description="Kelola aturan penegakan terlarang (Blocking vs Advisory), monitor histori audit, dan kontrol scheduler backend."
      />

      {/* Operational Rules Configuration Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-red-600" />
              Aturan Operasional Spasial (Operational Rule Configuration)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Atur apakah area terlarang jalan protokol dan jalan tol memblokir pembuatan zona (BLOCKING) atau hanya memberi peringatan (ADVISORY).
            </p>
          </div>
          <StatusBadge variant="info">Single Source of Truth: PostgreSQL</StatusBadge>
        </div>

        {loadingRules ? (
          <p className="text-xs text-slate-400">Memuat konfigurasi aturan operasional...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocol Road Rule Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              operationalRules.protocol_road_prohibited
                ? "bg-rose-50/40 border-rose-200"
                : "bg-amber-50/40 border-amber-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-5 h-5 ${operationalRules.protocol_road_prohibited ? "text-rose-600" : "text-amber-600"}`} />
                  <span className="font-bold text-slate-900 text-sm">Jalan Protokol</span>
                </div>
                <button
                  onClick={() => handleToggleRuleClick("protocol_road_prohibited", operationalRules.protocol_road_prohibited)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    operationalRules.protocol_road_prohibited
                      ? "bg-rose-600 text-white shadow-xs hover:bg-rose-700"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {operationalRules.protocol_road_prohibited ? "BLOCKING (ON)" : "ADVISORY (OFF)"}
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {operationalRules.protocol_road_prohibited
                  ? "🔴 BLOCKING: Zona yang memasuki area jalan protokol ditolak (HTTP 409 Conflict)."
                  : "🟡 ADVISORY ONLY: Zona yang memasuki jalan protokol diizinkan, tetapi menampilkan peringatan spasial."}
              </p>
            </div>

            {/* Toll Road Rule Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              operationalRules.toll_road_prohibited
                ? "bg-red-950/10 border-red-900/30"
                : "bg-amber-50/40 border-amber-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-5 h-5 ${operationalRules.toll_road_prohibited ? "text-red-900" : "text-amber-600"}`} />
                  <span className="font-bold text-slate-900 text-sm">Jalan Tol</span>
                </div>
                <button
                  onClick={() => handleToggleRuleClick("toll_road_prohibited", operationalRules.toll_road_prohibited)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    operationalRules.toll_road_prohibited
                      ? "bg-red-900 text-white shadow-xs hover:bg-red-950"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {operationalRules.toll_road_prohibited ? "BLOCKING (ON)" : "ADVISORY (OFF)"}
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {operationalRules.toll_road_prohibited
                  ? "🔴 BLOCKING: Zona yang memasuki area jalan tol ditolak (HTTP 409 Conflict)."
                  : "🟡 ADVISORY ONLY: Zona yang memasuki jalan tol diizinkan, tetapi menampilkan peringatan spasial."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {pendingRuleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Konfirmasi Perubahan Aturan Operasional</span>
              </div>
              <button onClick={() => setPendingRuleChange(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
              {pendingRuleChange.message}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button onClick={() => setPendingRuleChange(null)} variant="outline" size="sm">
                Batal
              </Button>
              <Button
                onClick={confirmRuleChange}
                disabled={updateRuleMutation.isPending}
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-500"
              >
                {updateRuleMutation.isPending ? "Memproses Re-evaluasi..." : "Ya, Terapkan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cron Scheduler Control Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-red-600" />
          Status Scheduler & Redis Distributed Lock
        </h3>
        <p className="text-xs text-slate-500">
          Pekerjaan scheduler terlindungi dari duplicate execution antar backend instances dengan background heartbeat renewal timer (TTL 60s).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loadingCron ? (
            <p className="text-xs text-slate-400">Memuat konfigurasi cron job...</p>
          ) : cronConfigs.length === 0 ? (
            <p className="text-xs text-slate-400">Tidak ada cron job aktif.</p>
          ) : (
            cronConfigs.map((config) => (
              <div key={config.cron_key || config.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs">{config.cron_key || config.name}</div>
                  <StatusBadge variant={config.is_active ? "success" : "secondary"}>
                    {config.is_active ? "ACTIVE" : "DISABLED"}
                  </StatusBadge>
                </div>
                <div className="text-[11px] text-slate-500">{config.description || `Cron Schedule: ${config.schedule_cron}`}</div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() => triggerCronMutation.mutate(config.cron_key)}
                    variant="primary"
                    size="sm"
                    className="text-xs py-1"
                  >
                    <Play className="w-3.5 h-3.5" /> Trigger Manual
                  </Button>
                  <Button
                    onClick={() => toggleCronMutation.mutate(config.cron_key)}
                    variant="outline"
                    size="sm"
                    className="text-xs py-1"
                  >
                    <Power className="w-3.5 h-3.5" /> Toggle Active
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" /> Histori Audit Activity Logs
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-4">Waktu</th>
              <th className="p-4">Action</th>
              <th className="p-4">User ID</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {loadingAudit ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-400">Memuat log audit...</td></tr>
            ) : auditLogs.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-400">Belum ada catatan aktivitas log.</td></tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="p-4 text-slate-500">{new Date(log.created_at || log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-bold text-slate-900">{log.action}</td>
                  <td className="p-4 text-slate-600">User #{log.user_id || "System"}</td>
                  <td className="p-4 text-center">
                    <StatusBadge variant="success">{log.status || "SUCCESS"}</StatusBadge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
