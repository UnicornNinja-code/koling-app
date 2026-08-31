import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { dssService } from "../../services/dssService.js";
import { zoneService } from "../../services/zoneService.js";
import {
  BrainCircuit,
  Award,
  MapPin,
  Star,
  Info,
  AlertTriangle,
  Clock,
  ShieldCheck,
  History,
  CheckSquare,
  Square,
  Sliders,
  FileSpreadsheet,
  ChevronRight,
  Database
} from "lucide-react";

export function DssManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("evaluation"); // 'evaluation' | 'snapshots'
  const [explainTab, setExplainTab] = useState("rankings"); // 'rankings' | 'raw_matrix' | 'bwm_weights' | 'traceability'

  // Model B Multi-Zone Selection State
  const [selectedZoneIds, setSelectedZoneIds] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("sore");
  const [selectedBwmConfigId, setSelectedBwmConfigId] = useState("");

  // Hybrid DSS Result State
  const [hybridResult, setHybridResult] = useState(null);
  const [evalError, setEvalError] = useState(null);

  // Snapshot Inspection State
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(null);

  // Fetch Active Operational Zones
  const { data: zonesRes, isLoading: isLoadingZones } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneService.getZones,
  });

  const zones = zonesRes?.zones || zonesRes?.data || [];
  const activeZones = zones.filter((z) => z.status === "ACTIVE");

  // Default select all active zones on initial load
  useEffect(() => {
    if (activeZones.length > 0 && selectedZoneIds.length === 0) {
      setSelectedZoneIds(activeZones.map((z) => z.id));
    }
  }, [activeZones, selectedZoneIds]);

  // Fetch Active BWM Configurations
  const { data: bwmConfigRes } = useQuery({
    queryKey: ["activeBwmConfig"],
    queryFn: dssService.getActiveDssConfig,
  });

  // Fetch Evaluation Snapshots History
  const { data: snapshotsRes, refetch: refetchSnapshots } = useQuery({
    queryKey: ["dssSnapshots"],
    queryFn: () => dssService.getDssSnapshots({ limit: 20 }),
  });

  const snapshotsList = snapshotsRes?.data || [];

  // Mutation for Hybrid BWM-TOPSIS Zone Evaluation
  const evaluateHybridMutation = useMutation({
    mutationFn: dssService.evaluateHybridBwmTopsis,
    onSuccess: (res) => {
      setHybridResult(res?.data || res);
      setEvalError(null);
      refetchSnapshots();
    },
    onError: (err) => {
      const errRes = err?.response?.data;
      setEvalError(errRes?.msg || err?.message || "Evaluasi Hybrid BWM-TOPSIS gagal.");
    },
  });

  const handleRunHybridEvaluation = () => {
    if (selectedZoneIds.length === 0) {
      alert("Harap pilih setidaknya 1 Zona Operasional untuk dievaluasi!");
      return;
    }
    setEvalError(null);
    evaluateHybridMutation.mutate({
      zone_ids: selectedZoneIds,
      time_slot: selectedTimeSlot,
      bwm_config_id: selectedBwmConfigId || null,
    });
  };

  const toggleSelectZone = (id) => {
    setSelectedZoneIds((prev) =>
      prev.includes(id) ? prev.filter((zId) => zId !== id) : [...prev, id]
    );
  };

  const selectAllActiveZones = () => {
    setSelectedZoneIds(activeZones.map((z) => z.id));
  };

  const clearZoneSelection = () => {
    setSelectedZoneIds([]);
  };

  // Inspect past snapshot
  const handleInspectSnapshot = async (id) => {
    setSelectedSnapshotId(id);
    try {
      const res = await dssService.getDssSnapshotById(id);
      const data = res?.data?.snapshot_data || res?.snapshot_data || res?.data;
      setActiveTab("evaluation");
      setHybridResult(data);
    } catch (err) {
      alert("Gagal memuat snapshot audit.");
    }
  };

  const topRanking = hybridResult?.topsis_summary?.rankings?.[0] || null;

  return (
    <AppLayout title="Engine SPK, Audit & Explainability" subtitle="Optimasi Pengambilan Keputusan Alokasi Zona Operasional">
      <PageHeader
        title="Sistem Pendukung Keputusan (Hybrid BWM-TOPSIS Engine)"
        description="Pemeringkatan zona operasional berbasis perbandingan multi-kriteria C1–C6, Best-Worst Method (BWM), dan TOPSIS (Model B — Model Evaluasi Zona)."
      />

      {/* Main Mode Navigation Tabs (Clean & Responsive) */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("evaluation")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "evaluation"
              ? "bg-[#FF5052] text-white font-bold shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Award className="w-4 h-4" /> Evaluasi & Explainability DSS
        </button>
        <button
          onClick={() => setActiveTab("snapshots")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "snapshots"
              ? "bg-[#FF5052] text-white font-bold shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <History className="w-4 h-4" /> Audit Snapshot History ({snapshotsList.length})
        </button>
      </div>

      {activeTab === "evaluation" && (
        <div className="space-y-6">
          {/* Phase 4A & 4B: Model B Zone Selection & Evaluation Configuration Panel */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-heading font-extrabold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#FF5052]" />
                  Konfigurasi Evaluasi Zona Operasional (Model B)
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                  Pilih beberapa zona operasional yang akan dibandingkan, tentukan slot waktu operasional dan profil bobot pakar BWM.
                </p>
              </div>

              {/* Evaluation Action Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase">Slot Waktu</label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white min-h-[44px] focus:outline-none focus:border-[#FF5052]"
                  >
                    <option value="pagi">Pagi (06:00 - 11:00)</option>
                    <option value="siang">Siang (11:00 - 15:00)</option>
                    <option value="sore">Sore (15:00 - 18:30)</option>
                    <option value="malam">Malam (18:30 - 22:00)</option>
                  </select>
                </div>

                <Button
                  onClick={handleRunHybridEvaluation}
                  disabled={evaluateHybridMutation.isPending || selectedZoneIds.length === 0}
                  variant="primary"
                  size="md"
                  className="mt-5 px-5 py-2.5 font-bold shrink-0"
                >
                  {evaluateHybridMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin mr-1.5" /> Mengevaluasi...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-1.5" /> Evaluasi Zona Terpilih (Hybrid BWM-TOPSIS)
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Model B Zone Multi-Select Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#FF5052]" /> Pilih Zona untuk Dibandingkan ({selectedZoneIds.length} dari {activeZones.length} dipilih)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllActiveZones}
                    className="text-[11px] font-semibold text-[#FF5052] hover:underline"
                  >
                    Pilih Semua Aktif
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={clearZoneSelection}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                  >
                    Hapus Pilihan
                  </button>
                </div>
              </div>

              {isLoadingZones ? (
                <div className="p-4 bg-slate-50 text-xs text-slate-500 rounded-xl">Memuat zona operasional...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {zones.map((z) => {
                    const isSelected = selectedZoneIds.includes(z.id);
                    const isRestricted = z.status === "RESTRICTED" || z.status === "INACTIVE";
                    return (
                      <div
                        key={z.id}
                        onClick={() => !isRestricted && toggleSelectZone(z.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isRestricted
                            ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#FF5052]/5 border-[#FF5052]/40 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-[#FF5052] shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <div className="text-xs font-bold text-slate-900">{z.name}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>Kapasitas: {z.max_capacity || 5} Rider</span>
                              <span>•</span>
                              <StatusBadge variant={z.status === "ACTIVE" ? "success" : "danger"}>
                                {z.status}
                              </StatusBadge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Error Message Display */}
          {evalError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Evaluasi Zona Gagal
              </div>
              <p>{evalError}</p>
            </div>
          )}

          {/* Phase 4C & 4D: Hybrid BWM-TOPSIS Leaderboard & Explainability Visualizer */}
          {hybridResult && (
            <div className="space-y-6">
              {/* Highlight Banner Top Rank #1 */}
              {topRanking && (
                <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-600" /> REKOMENDASI TERINGGI HASIL HYBRID BWM-TOPSIS
                    </span>
                    <StatusBadge variant="warning">Rank #1 TOPSIS</StatusBadge>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-heading font-extrabold text-slate-900">{topRanking.zone_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {topRanking.zone_id}</p>
                      {hybridResult.snapshot_id && (
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Snapshot Audit ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{hybridResult.snapshot_id}</code></span>
                        </div>
                      )}
                    </div>

                    <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl border md:border-none border-slate-200 flex flex-col md:items-end">
                      <span className="text-xs text-slate-500 font-semibold">Skor Preferensi Relatif (Cᵢ):</span>
                      <div className="text-3xl font-heading font-extrabold text-[#FF5052]">{topRanking.preference_score.toFixed(4)}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">D⁺ = {topRanking.d_pos.toFixed(4)} | D⁻ = {topRanking.d_neg.toFixed(4)}</div>
                      <button
                        onClick={() => navigate("/distribution", { state: { selected_zone_id: topRanking.zone_id } })}
                        className="mt-2.5 px-4 py-2 bg-[#FF5052] hover:bg-[#E03E40] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <span>Plot / Gunakan Zona Ini</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Interpretasi Model B:</strong> Dari {hybridResult.total_evaluated_zones} zona yang dipilih untuk dibandingkan, <strong>{topRanking.zone_name}</strong> memiliki tingkat preferensi relatif tertinggi berdasarkan bobot BWM dan kriteria C1–C6 pada slot waktu <strong>{hybridResult.time_slot.toUpperCase()}</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Explainability Tab Navigation Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50/50 p-2 gap-2 overflow-x-auto">
                  <button
                    onClick={() => setExplainTab("rankings")}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                      explainTab === "rankings" ? "bg-white text-[#FF5052] shadow-xs border border-slate-200 font-bold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Award className="w-4 h-4" /> 1. Leaderboard Ranking (Cᵢ)
                  </button>
                  <button
                    onClick={() => setExplainTab("raw_matrix")}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                      explainTab === "raw_matrix" ? "bg-white text-[#FF5052] shadow-xs border border-slate-200 font-bold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" /> 2. Matriks Mentah (X)
                  </button>
                  <button
                    onClick={() => setExplainTab("bwm_weights")}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                      explainTab === "bwm_weights" ? "bg-white text-[#FF5052] shadow-xs border border-slate-200 font-bold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <BrainCircuit className="w-4 h-4" /> 3. Profil Bobot BWM (W*)
                  </button>
                  <button
                    onClick={() => setExplainTab("traceability")}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                      explainTab === "traceability" ? "bg-white text-[#FF5052] shadow-xs border border-slate-200 font-bold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Database className="w-4 h-4" /> 4. Audit Traceability (X → R → V → Cᵢ)
                  </button>
                </div>

                <div className="p-5 md:p-6">
                  {/* TAB 1: LEADERBOARD RANKING */}
                  {explainTab === "rankings" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-heading font-extrabold text-slate-900">Perangkingan Akhir TOPSIS (Descending Preference Score Cᵢ)</h4>
                        <span className="text-xs text-slate-500">Versi Model: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono">{hybridResult.evaluation_version}</code></span>
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {hybridResult.topsis_summary.rankings.map((rk) => (
                          <div key={rk.zone_id} className="p-4 bg-white hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-extrabold text-sm ${
                                rk.rank === 1 ? "bg-amber-100 text-amber-800 border border-amber-300" :
                                rk.rank === 2 ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-600"
                              }`}>
                                #{rk.rank}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{rk.zone_name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  Distance Positif (D⁺): <strong>{rk.d_pos.toFixed(4)}</strong> | Distance Negatif (D⁻): <strong>{rk.d_neg.toFixed(4)}</strong>
                                </div>
                              </div>
                            </div>

                            <div className="text-right self-end sm:self-auto">
                              <div className="text-xs text-slate-500 font-semibold">Skor Preferensi (Cᵢ)</div>
                              <div className="text-xl font-heading font-extrabold text-slate-900">{rk.preference_score.toFixed(4)}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Excluded Zones Feedback */}
                      {hybridResult.excluded_zones && hybridResult.excluded_zones.length > 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" /> Zona Dieksklusi dari Evaluasi TOPSIS:
                          </span>
                          <ul className="text-xs text-amber-800 space-y-1 pl-2">
                            {hybridResult.excluded_zones.map((ex) => (
                              <li key={ex.zone_id}>
                                • <strong>{ex.zone_name}</strong>: {ex.reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: RAW MATRIX X */}
                  {explainTab === "raw_matrix" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-heading font-extrabold text-slate-900">Matriks Keputusan Mentah (X m×6) Nilai Aktual C1–C6</h4>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-xs text-left text-slate-700">
                          <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">Nama Zona Operasional</th>
                              <th className="p-3 text-center bg-emerald-50 text-emerald-900">C1 Densitas POI (Max)</th>
                              <th className="p-3 text-center bg-emerald-50 text-emerald-900">C2 Diversitas (Max)</th>
                              <th className="p-3 text-center bg-emerald-50 text-emerald-900">C3 Keramaian (Max)</th>
                              <th className="p-3 text-center bg-rose-50 text-rose-900">C4 Hujan % (Min)</th>
                              <th className="p-3 text-center bg-rose-50 text-rose-900">C5 Jarak KM (Min)</th>
                              <th className="p-3 text-center bg-rose-50 text-rose-900">C6 Persaingan (Min)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {hybridResult.topsis_summary.rankings.map((rk) => {
                              const raw = rk.traceability.raw_criteria;
                              return (
                                <tr key={rk.zone_id} className="hover:bg-slate-50">
                                  <td className="p-3 font-bold text-slate-900">{rk.zone_name}</td>
                                  <td className="p-3 text-center font-mono font-semibold">{raw.C1?.raw_value ?? "-"} POI</td>
                                  <td className="p-3 text-center font-mono font-semibold">{raw.C2?.raw_value ?? "-"} Kat</td>
                                  <td className="p-3 text-center font-mono font-semibold">{raw.C3?.raw_value ?? "-"} Poin</td>
                                  <td className="p-3 text-center font-mono font-semibold text-rose-700">{raw.C4?.raw_value ?? 0}%</td>
                                  <td className="p-3 text-center font-mono font-semibold text-rose-700">{raw.C5?.raw_value?.toFixed(2) ?? "-"} KM</td>
                                  <td className="p-3 text-center font-mono font-semibold text-rose-700">{raw.C6?.raw_value ?? "-"} Indeks</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: BWM WEIGHTS W* */}
                  {explainTab === "bwm_weights" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-heading font-extrabold text-slate-900">Profil Bobot Kriteria BWM Optimal (W*)</h4>
                        <StatusBadge variant={hybridResult.bwm_config.is_consistent ? "success" : "danger"}>
                          CR = {hybridResult.bwm_config.consistency_ratio.toFixed(4)} ({hybridResult.bwm_config.is_consistent ? "KONSISTEN" : "TIDAK KONSISTEN"})
                        </StatusBadge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {hybridResult.criteria_specs.map((cs) => {
                          const pct = (cs.weight * 100).toFixed(2);
                          return (
                            <div key={cs.code} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">
                                  [{cs.code}] {cs.name} ({cs.type})
                                </span>
                                <span className="text-sm font-heading font-extrabold text-[#FF5052]">{pct}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#FF5052] h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: MATHEMATICAL TRACEABILITY */}
                  {explainTab === "traceability" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-heading font-extrabold text-slate-900">Penelusuran Tahapan Komputasi Vektor (X → R → V → Cᵢ)</h4>
                      <p className="text-xs text-slate-500">Rincian nilai normalisasi Euclidean R dan matriks terbobot V dengan presisi 64-bit IEEE float penuh.</p>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-xs text-left text-slate-700">
                          <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">Zona Operasional</th>
                              <th className="p-3 text-center">R (C1..C6) Normalisasi</th>
                              <th className="p-3 text-center">V (C1..C6) Terbobot</th>
                              <th className="p-3 text-center">D⁺ (Jarak Ideal)</th>
                              <th className="p-3 text-center">D⁻ (Jarak Negatif)</th>
                              <th className="p-3 text-center font-bold text-[#FF5052]">Ci Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {hybridResult.topsis_summary.rankings.map((rk) => (
                              <tr key={rk.zone_id} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-slate-900">{rk.zone_name}</td>
                                <td className="p-3 text-center font-mono text-[11px]">
                                  {Object.values(rk.traceability.normalized_r).map((n) => n.toFixed(3)).join(", ")}
                                </td>
                                <td className="p-3 text-center font-mono text-[11px]">
                                  {Object.values(rk.traceability.weighted_v).map((v) => v.toFixed(3)).join(", ")}
                                </td>
                                <td className="p-3 text-center font-mono text-xs">{rk.d_pos.toFixed(4)}</td>
                                <td className="p-3 text-center font-mono text-xs">{rk.d_neg.toFixed(4)}</td>
                                <td className="p-3 text-center font-mono font-bold text-[#FF5052] text-sm">{rk.preference_score.toFixed(4)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 4E: Evaluation Snapshot History Mode */}
      {activeTab === "snapshots" && (
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-heading font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-[#FF5052]" />
              Riwayat Snapshot Audit Evaluasi DSS
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Daftar rekam jejak evaluasi masa lalu yang tersimpan di PostgreSQL untuk auditabilitas dan reproduksibilitas skripsi.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {snapshotsList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">Belum ada riwayat snapshot evaluasi tersimpan.</div>
            ) : (
              snapshotsList.map((snp) => (
                <div key={snp.id} className="p-4 bg-white hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>Snapshot ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{snp.id}</code></span>
                      <StatusBadge variant={snp.status === "COMPLETED" ? "success" : "warning"}>
                        {snp.status}
                      </StatusBadge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Waktu: {new Date(snp.created_at).toLocaleString("id-ID")}</span>
                      <span>•</span>
                      <span>Slot: <strong>{snp.time_slot.toUpperCase()}</strong></span>
                      <span>•</span>
                      <span>Zona Evaluasi: <strong>{snp.total_evaluated_zones} Zona</strong></span>
                      <span>•</span>
                      <span>Rank #1: <strong>{snp.top_ranking_zone}</strong></span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleInspectSnapshot(snp.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-[#FF5052] border-[#FF5052]/30 hover:bg-[#FF5052]/5 self-start sm:self-auto"
                  >
                    Buka Snapshot Audit <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
