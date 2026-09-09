import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "../../components/ui/Table.jsx";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs.jsx";
import { TableSkeleton, PanelSkeleton } from "../../components/ui/LoadingSkeleton.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ErrorFallbackBanner } from "../../components/ui/ErrorFallbackBanner.jsx";
import { dssService } from "../../services/dssService.js";
import { poiService } from "../../services/poiService.js";
import { weatherService } from "../../services/weatherService.js";
import { analyticsService } from "../../services/analyticsService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  BrainCircuit,
  Award,
  Clock,
  CloudSun,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Save,
  Info,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Flame,
  Wind,
  Droplets,
  Layers,
  Sparkles,
} from "lucide-react";

export function DssManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState("recommendations");

  // --- TAB 1: DSS RECOMMENDATION STATES ---
  const [selectedZoneDetail, setSelectedZoneDetail] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- TAB 2: C3 CROWD SCORE STATES ---
  const [c3Search, setC3Search] = useState("");
  const [editedScores, setEditedScores] = useState({});
  const [c3Feedback, setC3Feedback] = useState(null);

  // --- TAB 4: PLAN VS ACTUAL STATES ---
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ============================================================================
  // 1. QUERY: DSS RECOMMENDATIONS (SSOT)
  // ============================================================================
  const {
    data: dssRes,
    isLoading: isLoadingDss,
    isError: isErrorDss,
    error: dssError,
    refetch: refetchDss,
  } = useQuery({
    queryKey: queryKeys.dss.recommendations(),
    queryFn: () => dssService.getTopsisRecommendations(),
  });

  const dssData = dssRes || {};
  const dssRankings = dssData.rankings || [];
  const dssWarnings = dssData.warnings || [];

  // ============================================================================
  // 2. QUERY: C3 CROWD SCORES (SSOT)
  // ============================================================================
  const {
    data: c3Res,
    isLoading: isLoadingC3,
    isError: isErrorC3,
    error: c3Error,
    refetch: refetchC3,
  } = useQuery({
    queryKey: queryKeys.dss.c3CrowdScores(),
    queryFn: () => poiService.getCrowdScores(),
  });

  const c3Categories = c3Res?.categories || c3Res?.data || (Array.isArray(c3Res) ? c3Res : []);

  // Mutation for Single Category C3 Update
  const updateSingleC3Mutation = useMutation({
    mutationFn: ({ id, payload }) => poiService.updateSingleCrowdScores(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dss.c3CrowdScores() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dss.recommendations() });
      setC3Feedback({
        type: "success",
        message: res?.msg || "Skor keramaian kategori berhasil diperbarui.",
      });
    },
    onError: (err) => {
      setC3Feedback({
        type: "error",
        message: err?.response?.data?.msg || err?.message || "Gagal memperbarui skor.",
      });
    },
  });

  // Mutation for Bulk C3 Update
  const updateBulkC3Mutation = useMutation({
    mutationFn: (payload) => poiService.updateBulkCrowdScores(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dss.c3CrowdScores() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dss.recommendations() });
      setEditedScores({});
      setC3Feedback({
        type: "success",
        message: res?.msg || "Semua skor keramaian berhasil diperbarui secara massal.",
      });
    },
    onError: (err) => {
      setC3Feedback({
        type: "error",
        message: err?.response?.data?.msg || err?.message || "Gagal memperbarui skor massal.",
      });
    },
  });

  // ============================================================================
  // 3. QUERY: WEATHER INTELLIGENCE (SSOT)
  // ============================================================================
  const {
    data: weatherRes,
    isLoading: isLoadingWeather,
    isError: isErrorWeather,
    error: weatherError,
    refetch: refetchWeather,
  } = useQuery({
    queryKey: queryKeys.weather.byHub("Sidoarjo"),
    queryFn: () => weatherService.getHubWeatherInfo("Sidoarjo"),
  });

  const weatherData = weatherRes?.data || weatherRes || {};

  const syncWeatherMutation = useMutation({
    mutationFn: () => weatherService.syncWeather(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weather.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dss.recommendations() });
    },
  });

  // ============================================================================
  // 4. QUERY: PLAN VS ACTUAL ANALYTICS (SSOT)
  // ============================================================================
  const {
    data: planVsActualRes,
    isLoading: isLoadingPvA,
    isError: isErrorPvA,
    error: pvaError,
    refetch: refetchPvA,
  } = useQuery({
    queryKey: queryKeys.analytics.dssPerformance({ date: selectedDate }),
    queryFn: () => analyticsService.getDssPerformance({ date: selectedDate }),
  });

  const pvaData = planVsActualRes?.data || planVsActualRes || {};
  const pvaRanks = pvaData.ranks_breakdown || [];
  const pvaInsights = pvaData.insights || {};

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleOpenDetail = (zoneItem) => {
    setSelectedZoneDetail(zoneItem);
    setIsDrawerOpen(true);
  };

  const handleScoreChange = (categoryId, slot, value) => {
    const numericVal = Math.min(5, Math.max(1, parseInt(value, 10) || 1));
    setEditedScores((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [slot]: numericVal,
      },
    }));
  };

  const handleSaveSingleRow = (cat) => {
    const currentEdits = editedScores[cat.id] || {};
    const payload = {
      score_pagi: currentEdits.score_pagi ?? cat.scores?.pagi ?? cat.score_pagi ?? 1,
      score_siang: currentEdits.score_siang ?? cat.scores?.siang ?? cat.score_siang ?? 1,
      score_sore: currentEdits.score_sore ?? cat.scores?.sore ?? cat.score_sore ?? 1,
      score_malam: currentEdits.score_malam ?? cat.scores?.malam ?? cat.score_malam ?? 1,
    };
    updateSingleC3Mutation.mutate({ id: cat.id, payload });
  };

  const handleSaveBulk = () => {
    const scoresArray = Object.entries(editedScores).map(([id, scores]) => {
      const cat = c3Categories.find((c) => c.id === id) || {};
      return {
        id,
        score_pagi: scores.score_pagi ?? cat.scores?.pagi ?? cat.score_pagi ?? 1,
        score_siang: scores.score_siang ?? cat.scores?.siang ?? cat.score_siang ?? 1,
        score_sore: scores.score_sore ?? cat.scores?.sore ?? cat.score_sore ?? 1,
        score_malam: scores.score_malam ?? cat.scores?.malam ?? cat.score_malam ?? 1,
      };
    });

    if (scoresArray.length === 0) {
      alert("Belum ada perubahan skor keramaian yang dilakukan.");
      return;
    }

    updateBulkC3Mutation.mutate({ scores: scoresArray });
  };

  const filteredCategories = c3Categories.filter((cat) => {
    if (!c3Search.trim()) return true;
    const query = c3Search.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(query) ||
      cat.id?.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout
      title="Intelligence Workspace"
      subtitle="DSS Decision Engine, Weather Intelligence, and Plan-vs-Actual Validation"
    >
      <div className="space-y-4">
        {/* Workspace Page Header */}
        <PageHeader
          title="Intelligence & Decision Workspace"
          description="Prescriptive BWM-TOPSIS recommendation engine, C3 time-based crowd configuration, weather microclimate context, and empirical plan-vs-actual validation."
        />

        {/* Primary Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger
              value="recommendations"
              leftIcon={BrainCircuit}
            >
              DSS Recommendations
            </TabsTrigger>
            <TabsTrigger
              value="c3_config"
              leftIcon={Sliders}
            >
              C3 Crowd Score Config
            </TabsTrigger>
            <TabsTrigger
              value="weather"
              leftIcon={CloudSun}
            >
              Weather Intelligence
            </TabsTrigger>
            <TabsTrigger
              value="plan_vs_actual"
              leftIcon={BarChart3}
            >
              Plan vs Actual Analytics
            </TabsTrigger>
          </TabsList>

          {/* =================================================================== */}
          {/* TAB 1: DSS RECOMMENDATIONS                                         */}
          {/* =================================================================== */}
          <TabsContent value="recommendations" className="space-y-4">
            {isLoadingDss ? (
              <PanelSkeleton height="h-40" />
            ) : isErrorDss ? (
              <ErrorFallbackBanner
                title="Gagal memuat rekomendasi DSS"
                message={dssError?.response?.data?.msg || dssError?.message}
                onRetry={refetchDss}
              />
            ) : (
              <>
                {/* Operational Evaluation Metadata Banner */}
                <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-[#737373] text-[10px] uppercase font-bold block">
                        Model Version
                      </span>
                      <span className="font-mono font-semibold text-[#111111]">
                        {dssData.model_version || "BWM-TOPSIS-v1.0"}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-[#E5E5E5] hidden sm:block" />

                    <div>
                      <span className="text-[#737373] text-[10px] uppercase font-bold block">
                        Evaluation Version
                      </span>
                      <span className="font-mono font-semibold text-[#111111]">
                        {dssData.evaluation_version || "DSS-CRITERIA-v1.0"}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-[#E5E5E5] hidden sm:block" />

                    <div>
                      <span className="text-[#737373] text-[10px] uppercase font-bold block">
                        Evaluated Time Slot
                      </span>
                      <span className="font-semibold text-[#111111] uppercase">
                        {dssData.time_slot || "SORE"}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-[#E5E5E5] hidden sm:block" />

                    <div>
                      <span className="text-[#737373] text-[10px] uppercase font-bold block">
                        Weight Source
                      </span>
                      <span className="font-semibold text-[#111111]">
                        {dssData.weight_source || "Active BWM DB Config"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge
                      variant={dssData.data_status === "VALID" ? "success" : "warning"}
                    >
                      {dssData.data_status === "VALID" ? "DATA VALID" : "DATA DEGRADED"}
                    </StatusBadge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchDss()}
                      className="h-7 px-2.5 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Warnings Banner */}
                {dssWarnings.length > 0 && (
                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] p-3 text-xs text-[#B45309] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                      <span>Catatan / Peringatan Kualitas Data DSS:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1 text-[#92400E]">
                      {dssWarnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ranking First Presentation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                      Peringkat Rekomendasi Zona Operasional ({dssRankings.length} Zona Terdaftar)
                    </h3>
                  </div>

                  {dssRankings.length === 0 ? (
                    <EmptyState
                      title="Tidak ada hasil evaluasi"
                      description="Belum ada data evaluasi rekomendasi TOPSIS yang dihasilkan."
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {dssRankings.map((rankItem) => {
                        const pref = parseFloat(rankItem.preference_score) || 0;
                        const isTop = rankItem.rank === 1;

                        return (
                          <div
                            key={rankItem.zone_id || rankItem.rank}
                            className={`bg-white border rounded-[6px] p-3.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              isTop
                                ? "border-[#2563EB] ring-1 ring-[#2563EB]/20"
                                : "border-[#E5E5E5] hover:border-[#D4D4D4]"
                            }`}
                          >
                            {/* Left: Rank & Zone Name */}
                            <div className="flex items-start gap-3 min-w-[220px]">
                              <div
                                className={`w-8 h-8 rounded-[4px] flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                  isTop
                                    ? "bg-[#2563EB] text-white"
                                    : "bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]"
                                }`}
                              >
                                #{rankItem.rank}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-sm text-[#111111]">
                                    {rankItem.zone_name}
                                  </span>
                                  {isTop && (
                                    <StatusBadge variant="primary" size="sm">
                                      RECOMMENDED #1
                                    </StatusBadge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-[#737373]">
                                  <span>ID: {rankItem.zone_id?.slice(0, 8)}...</span>
                                  <span>•</span>
                                  <StatusBadge
                                    variant={
                                      rankItem.data_quality === "VALID" ? "success" : "warning"
                                    }
                                    size="sm"
                                  >
                                    {rankItem.data_quality || "VALID"}
                                  </StatusBadge>
                                </div>
                              </div>
                            </div>

                            {/* Middle: Preference Score Bar & Reasoning */}
                            <div className="flex-1 max-w-md space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#525252]">
                                  TOPSIS Preference Score (C<sub>i</sub>)
                                </span>
                                <span className="font-mono font-bold text-[#111111]">
                                  {pref.toFixed(4)} ({(pref * 100).toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-[#F5F5F5] h-2 rounded-[2px] overflow-hidden border border-[#E5E5E5]">
                                <div
                                  className={`h-full transition-all ${
                                    isTop ? "bg-[#2563EB]" : "bg-[#525252]"
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, pref * 100))}%` }}
                                />
                              </div>
                              {rankItem.reasoning?.summary && (
                                <p className="text-[11px] text-[#737373] line-clamp-1 italic">
                                  {rankItem.reasoning.summary}
                                </p>
                              )}
                            </div>

                            {/* Right: Inspection CTA */}
                            <div className="flex items-center gap-2 self-end md:self-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDetail(rankItem)}
                                className="text-xs h-7 px-2.5"
                              >
                                Inspeksi Kriteria
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* =================================================================== */}
          {/* TAB 2: C3 CROWD SCORE CONFIGURATION                               */}
          {/* =================================================================== */}
          <TabsContent value="c3_config" className="space-y-4">
            {isLoadingC3 ? (
              <TableSkeleton rows={6} cols={7} />
            ) : isErrorC3 ? (
              <ErrorFallbackBanner
                title="Gagal memuat matriks skor keramaian C3"
                message={c3Error?.response?.data?.msg || c3Error?.message}
                onRetry={refetchC3}
              />
            ) : (
              <div className="space-y-3">
                {/* Feedback Notification */}
                {c3Feedback && (
                  <div
                    className={`p-3 rounded-[6px] text-xs flex items-center justify-between border ${
                      c3Feedback.type === "success"
                        ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                        : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                    }`}
                  >
                    <span>{c3Feedback.message}</span>
                    <button
                      type="button"
                      onClick={() => setC3Feedback(null)}
                      className="font-bold underline ml-3"
                    >
                      Tutup
                    </button>
                  </div>
                )}

                {/* Search & Bulk Save Toolbar */}
                <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
                    <Input
                      type="text"
                      placeholder="Cari kategori POI..."
                      value={c3Search}
                      onChange={(e) => setC3Search(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchC3()}
                      className="h-8 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Reset
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveBulk}
                      disabled={
                        Object.keys(editedScores).length === 0 ||
                        updateBulkC3Mutation.isPending
                      }
                      className="h-8 text-xs"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      {updateBulkC3Mutation.isPending
                        ? "Menyimpan..."
                        : `Simpan Semua (${Object.keys(editedScores).length})`}
                    </Button>
                  </div>
                </div>

                {/* C3 Compact Table */}
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Kategori POI (58 Master)</TableHead>
                        <TableHead className="w-24 text-center">Pagi (06-11)</TableHead>
                        <TableHead className="w-24 text-center">Siang (11-15)</TableHead>
                        <TableHead className="w-24 text-center">Sore (15-18)</TableHead>
                        <TableHead className="w-24 text-center">Malam (18-22)</TableHead>
                        <TableHead className="w-24 text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length === 0 ? (
                        <TableEmpty
                          colSpan={7}
                          message="Tidak ada kategori POI yang sesuai kriteria pencarian."
                        />
                      ) : (
                        filteredCategories.map((cat, idx) => {
                          const currentEdits = editedScores[cat.id] || {};
                          const scorePagi = currentEdits.score_pagi ?? cat.scores?.pagi ?? cat.score_pagi ?? 1;
                          const scoreSiang = currentEdits.score_siang ?? cat.scores?.siang ?? cat.score_siang ?? 1;
                          const scoreSore = currentEdits.score_sore ?? cat.scores?.sore ?? cat.score_sore ?? 1;
                          const scoreMalam = currentEdits.score_malam ?? cat.scores?.malam ?? cat.score_malam ?? 1;
                          const isEdited = Boolean(editedScores[cat.id]);

                          return (
                            <TableRow key={cat.id || idx}>
                              <TableCell className="text-center font-mono text-[#737373]">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="font-medium text-[#111111]">
                                <div className="flex items-center gap-2">
                                  <span>{cat.name}</span>
                                  {isEdited && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                                  )}
                                </div>
                              </TableCell>

                              {/* Pagi */}
                              <TableCell className="text-center">
                                <select
                                  value={scorePagi}
                                  onChange={(e) =>
                                    handleScoreChange(cat.id, "score_pagi", e.target.value)
                                  }
                                  className="h-7 px-1 text-xs border border-[#E5E5E5] rounded-[4px] bg-white font-mono font-bold text-center focus:outline-none focus:border-[#2563EB]"
                                >
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>

                              {/* Siang */}
                              <TableCell className="text-center">
                                <select
                                  value={scoreSiang}
                                  onChange={(e) =>
                                    handleScoreChange(cat.id, "score_siang", e.target.value)
                                  }
                                  className="h-7 px-1 text-xs border border-[#E5E5E5] rounded-[4px] bg-white font-mono font-bold text-center focus:outline-none focus:border-[#2563EB]"
                                >
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>

                              {/* Sore */}
                              <TableCell className="text-center">
                                <select
                                  value={scoreSore}
                                  onChange={(e) =>
                                    handleScoreChange(cat.id, "score_sore", e.target.value)
                                  }
                                  className="h-7 px-1 text-xs border border-[#E5E5E5] rounded-[4px] bg-white font-mono font-bold text-center focus:outline-none focus:border-[#2563EB]"
                                >
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>

                              {/* Malam */}
                              <TableCell className="text-center">
                                <select
                                  value={scoreMalam}
                                  onChange={(e) =>
                                    handleScoreChange(cat.id, "score_malam", e.target.value)
                                  }
                                  className="h-7 px-1 text-xs border border-[#E5E5E5] rounded-[4px] bg-white font-mono font-bold text-center focus:outline-none focus:border-[#2563EB]"
                                >
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>

                              {/* Row Action */}
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSaveSingleRow(cat)}
                                  disabled={updateSingleC3Mutation.isPending}
                                  className="h-7 px-2 text-[11px]"
                                >
                                  Simpan
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
          </TabsContent>

          {/* =================================================================== */}
          {/* TAB 3: WEATHER INTELLIGENCE                                       */}
          {/* =================================================================== */}
          <TabsContent value="weather" className="space-y-4">
            {isLoadingWeather ? (
              <PanelSkeleton height="h-44" />
            ) : isErrorWeather ? (
              <ErrorFallbackBanner
                title="Gagal memuat status cuaca Hub Sidoarjo"
                message={weatherError?.response?.data?.msg || weatherError?.message}
                onRetry={refetchWeather}
              />
            ) : (
              <div className="space-y-4">
                {/* Weather Context Operational Card */}
                <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <CloudSun className="w-5 h-5 text-[#2563EB]" />
                        <h3 className="font-bold text-sm text-[#111111]">
                          Pusat Operasional: Hub {weatherData.hub_city_name || weatherData.city || "SIDOARJO"}
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#737373]">
                        Kondisi mikroklimat cuaca aktual yang memengaruhi penalti kriteria C4 pada DSS TOPSIS.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge
                        variant={weatherData.freshness === "FRESH" || !weatherData.freshness ? "success" : "neutral"}
                      >
                        {weatherData.freshness || "FRESH"}
                      </StatusBadge>
                      <StatusBadge
                        variant={weatherData.quality === "VALID" || !weatherData.quality ? "success" : "warning"}
                      >
                        {weatherData.quality || "VALID"}
                      </StatusBadge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncWeatherMutation.mutate()}
                        disabled={syncWeatherMutation.isPending}
                        className="h-7 text-xs"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 mr-1 ${
                            syncWeatherMutation.isPending ? "animate-spin" : ""
                          }`}
                        />
                        Sync Weather
                      </Button>
                    </div>
                  </div>

                  {/* Weather Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#FAFAFA] p-3 rounded-[4px] border border-[#E5E5E5] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#737373]">
                        Kondisi Cuaca
                      </span>
                      <div className="font-bold text-sm text-[#111111]">
                        {weatherData.hub_overview?.weather_condition ||
                          weatherData.condition ||
                          "Cerah Berawan"}
                      </div>
                      <span className="text-[10px] text-[#737373] block">
                        Status Open-Meteo
                      </span>
                    </div>

                    <div className="bg-[#FAFAFA] p-3 rounded-[4px] border border-[#E5E5E5] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#737373]">
                        Peluang Hujan (C4)
                      </span>
                      <div className="font-bold text-sm text-[#111111] flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-[#2563EB]" />
                        {weatherData.hub_overview?.max_rain_probability_percent !== undefined
                          ? `${weatherData.hub_overview.max_rain_probability_percent}%`
                          : weatherData.precipitation_probability !== undefined
                          ? `${weatherData.precipitation_probability}%`
                          : "0%"}
                      </div>
                      <span className="text-[10px] text-[#737373] block">
                        Presipitasi Lapangan
                      </span>
                    </div>

                    <div className="bg-[#FAFAFA] p-3 rounded-[4px] border border-[#E5E5E5] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#737373]">
                        Temperatur Rata-rata
                      </span>
                      <div className="font-bold text-sm text-[#111111]">
                        {weatherData.hub_overview?.avg_temperature_c !== undefined
                          ? `${weatherData.hub_overview.avg_temperature_c}°C`
                          : weatherData.temperature !== undefined
                          ? `${weatherData.temperature}°C`
                          : "N/A"}
                      </div>
                      <span className="text-[10px] text-[#737373] block">
                        Suhu Lingkungan
                      </span>
                    </div>

                    <div className="bg-[#FAFAFA] p-3 rounded-[4px] border border-[#E5E5E5] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#737373]">
                        Slot Operasional
                      </span>
                      <div className="font-bold text-sm text-[#111111] uppercase flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#737373]" />
                        {weatherData.hub_overview?.active_time_slot || "OPERASIONAL"}
                      </div>
                      <span className="text-[10px] text-[#737373] block">
                        {weatherData.hub_overview?.operational_hours || "06:00 - 21:00"}
                      </span>
                    </div>
                  </div>

                  {/* Provenance Footer */}
                  <div className="bg-[#F5F5F5] rounded-[4px] p-2.5 text-[11px] text-[#525252] flex items-center justify-between">
                    <span>
                      Sumber Data:{" "}
                      <strong>{weatherData.source || "Open-Meteo REST API & PostgreSQL Cache"}</strong>
                    </span>
                    <span>
                      Total Zona Terpantau:{" "}
                      <strong>{weatherData.total_zones || weatherData.zones_weather_list?.length || 2} Zona</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* =================================================================== */}
          {/* TAB 4: PLAN VS ACTUAL ANALYTICS                                   */}
          {/* =================================================================== */}
          <TabsContent value="plan_vs_actual" className="space-y-4">
            {isLoadingPvA ? (
              <TableSkeleton rows={5} cols={8} />
            ) : isErrorPvA ? (
              <ErrorFallbackBanner
                title="Gagal memuat efektivitas DSS Plan-vs-Actual"
                message={pvaError?.response?.data?.msg || pvaError?.message}
                onRetry={refetchPvA}
              />
            ) : (
              <div className="space-y-3">
                {/* Date Filter Toolbar */}
                <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#737373]">Tanggal Evaluasi:</span>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-8 text-xs w-40"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge
                      variant={
                        pvaInsights.rank_order_alignment === "STRONG_ALIGNMENT"
                          ? "success"
                          : pvaInsights.rank_order_alignment === "MODERATE_OR_MIXED_ALIGNMENT"
                          ? "primary"
                          : "neutral"
                      }
                    >
                      {pvaInsights.rank_order_alignment || "INSUFFICIENT_DATA"}
                    </StatusBadge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchPvA()}
                      className="h-8 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Refresh Analisis
                    </Button>
                  </div>
                </div>

                {/* Insight Summary Alert */}
                {pvaInsights.summary && (
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] p-3 text-xs text-[#1E40AF] flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Hasil Validasi Empiris Lapangan:</span>
                      <p className="text-[11px] text-[#1E3A8A] mt-0.5 leading-relaxed">
                        {pvaInsights.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Plan vs Actual Comparison Table */}
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center">TOPSIS Rank</TableHead>
                        <TableHead>Nama Zona</TableHead>
                        <TableHead className="text-right">Skor Prediksi (C<sub>i</sub>)</TableHead>
                        <TableHead className="text-right">Omzet Aktual</TableHead>
                        <TableHead className="text-right">Omzet / Rider</TableHead>
                        <TableHead className="text-center">Kepatuhan Geofence</TableHead>
                        <TableHead className="text-center">Durasi Operasi</TableHead>
                        <TableHead className="text-center">Rank Realisasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pvaRanks.length === 0 ? (
                        <TableEmpty
                          colSpan={8}
                          message="Belum ada data penugasan atau log penjualan pada tanggal ini."
                        />
                      ) : (
                        pvaRanks.map((item, idx) => {
                          const isRankOne = item.topsis_rank === 1;
                          const actual = item.actual_execution || {};
                          const dssPred = item.dss_prediction || {};

                          return (
                            <TableRow key={item.zone_id || idx}>
                              <TableCell className="text-center font-mono font-bold text-xs">
                                <span
                                  className={`inline-block w-6 h-6 rounded-[3px] text-center leading-6 ${
                                    isRankOne
                                      ? "bg-[#2563EB] text-white"
                                      : "bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]"
                                  }`}
                                >
                                  #{item.topsis_rank}
                                </span>
                              </TableCell>
                              <TableCell className="font-bold text-[#111111]">
                                {item.zone_name}
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold text-[#525252]">
                                {dssPred.preference_score_formatted ||
                                  (dssPred.preference_score !== undefined
                                    ? `${(dssPred.preference_score * 100).toFixed(2)}%`
                                    : "N/A")}
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold text-[#16A34A]">
                                {actual.formatted_revenue ||
                                  (actual.actual_revenue !== undefined
                                    ? `Rp ${Math.round(actual.actual_revenue).toLocaleString("id-ID")}`
                                    : "N/A")}
                              </TableCell>
                              <TableCell className="text-right font-mono text-[#525252]">
                                {actual.formatted_revenue_per_rider || "N/A"}
                              </TableCell>
                              <TableCell className="text-center font-mono">
                                <StatusBadge
                                  variant={
                                    actual.actual_compliance_rate_pct !== "N/A"
                                      ? "success"
                                      : "neutral"
                                  }
                                  size="sm"
                                >
                                  {actual.actual_compliance_rate_pct || "N/A"}
                                </StatusBadge>
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs text-[#525252]">
                                {actual.avg_operating_duration_minutes !== undefined
                                  ? `${actual.avg_operating_duration_minutes} min`
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-center font-mono font-bold text-xs">
                                #{actual.realized_revenue_rank || idx + 1}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* =================================================================== */}
        {/* CRITERIA & PROVENANCE INSPECTION DRAWER (TAB 1)                     */}
        {/* =================================================================== */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Inspeksi Kriteria DSS: ${selectedZoneDetail?.zone_name || "Zona"}`}
          description={`Peringkat #${selectedZoneDetail?.rank || 1} • Skor Preferensi TOPSIS: ${(parseFloat(selectedZoneDetail?.preference_score || 0) * 100).toFixed(2)}%`}
          position="right"
        >
          {selectedZoneDetail && (
            <div className="space-y-4">
              {/* TOPSIS Distance Vector Details */}
              <div className="bg-[#F5F5F5] p-3 rounded-[6px] border border-[#E5E5E5] space-y-1.5 text-xs">
                <span className="font-bold text-[10px] uppercase text-[#737373] block">
                  Metrik Jarak Euklidian TOPSIS
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-[#737373] text-[10px] block">D+ (Jarak Solusi Ideal Positif):</span>
                    <span className="font-bold text-[#111111]">
                      {selectedZoneDetail.d_plus !== undefined
                        ? selectedZoneDetail.d_plus.toFixed(4)
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] text-[10px] block">D- (Jarak Solusi Ideal Negatif):</span>
                    <span className="font-bold text-[#111111]">
                      {selectedZoneDetail.d_minus !== undefined
                        ? selectedZoneDetail.d_minus.toFixed(4)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reasoning Summary */}
              {selectedZoneDetail.reasoning && (
                <div className="space-y-2">
                  <span className="font-bold text-xs text-[#111111] block">
                    Penjelasan Preskriptif (Deterministic Explainability)
                  </span>
                  <div className="p-3 bg-white border border-[#E5E5E5] rounded-[6px] space-y-2 text-xs">
                    {selectedZoneDetail.reasoning.strong_factors?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-[#16A34A] uppercase block">
                          Faktor Keunggulan Komparatif:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-[#15803D] pl-1">
                          {selectedZoneDetail.reasoning.strong_factors.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedZoneDetail.reasoning.weak_factors?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-[#D97706] uppercase block">
                          Faktor Hambatan / Biaya:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-[#B45309] pl-1">
                          {selectedZoneDetail.reasoning.weak_factors.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw Criteria & Provenance Table */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-[#111111] block">
                  Nilai Mentah Kriteria (C1-C6) & Provenance Data
                </span>
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Kriteria</TableHead>
                        <TableHead className="text-right">Nilai Mentah</TableHead>
                        <TableHead>Sumber Data</TableHead>
                        <TableHead className="text-center">Kualitas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { code: "C1", name: "Densitas POI", type: "BENEFIT", unit: "poi" },
                        { code: "C2", name: "Diversitas POI", type: "BENEFIT", unit: "kategori" },
                        { code: "C3", name: "Keramaian Waktu", type: "BENEFIT", unit: "skor" },
                        { code: "C4", name: "Risiko Cuaca", type: "COST", unit: "%" },
                        { code: "C5", name: "Jarak Hub", type: "COST", unit: "km" },
                        { code: "C6", name: "Kompetitor", type: "COST", unit: "pesaing" },
                      ].map((crit) => {
                        const rawVal = selectedZoneDetail.raw_scores?.[crit.code];
                        const prov = selectedZoneDetail.provenance?.[crit.code] || {};

                        return (
                          <TableRow key={crit.code}>
                            <TableCell className="font-mono font-bold text-[#2563EB]">
                              {crit.code}
                            </TableCell>
                            <TableCell className="font-medium text-[#111111]">
                              {crit.name}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">
                              {rawVal !== undefined ? rawVal : "N/A"} {crit.unit}
                            </TableCell>
                            <TableCell className="text-[11px] text-[#737373]">
                              {prov.source || "Database SSOT"}
                            </TableCell>
                            <TableCell className="text-center">
                              <StatusBadge
                                variant={prov.quality === "VALID" ? "success" : "warning"}
                                size="sm"
                              >
                                {prov.quality || "VALID"}
                              </StatusBadge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </AppLayout>
  );
}
