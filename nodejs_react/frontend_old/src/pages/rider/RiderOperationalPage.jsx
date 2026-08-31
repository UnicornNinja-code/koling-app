import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { riderService } from "../../services/riderService.js";
import { productService } from "../../services/productService.js";
import { distributionService } from "../../services/distributionService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { formatCurrency } from "../../lib/utils.js";
import {
  DollarSign,
  Coffee,
  CheckCircle2,
  Bike,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  LogOut,
  CalendarCheck,
  ShoppingBag
} from "lucide-react";

export function RiderOperationalPage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      product_id: "",
      quantity: 1,
    },
  });

  // Hold Timer Countdown State (seconds)
  const [holdTimeRemaining, setHoldTimeRemaining] = useState(null);

  // 1. Fetch Rider Active Session
  const { data: activeSessionRes, isLoading: loadingSession } = useQuery({
    queryKey: queryKeys.riders.session(),
    queryFn: riderService.getActiveSession,
  });

  // 2. Fetch Hub Armadas Catalog
  const { data: hubArmadasRes, isLoading: loadingArmadas } = useQuery({
    queryKey: queryKeys.riders.hubArmadas(),
    queryFn: riderService.getHubArmadas,
  });

  // 3. Fetch Active Products Catalog for POS
  const { data: productsRes, isLoading: loadingProducts } = useQuery({
    queryKey: queryKeys.products.list({ status: "AVAILABLE" }),
    queryFn: () => productService.getAll({ status: "AVAILABLE" }),
  });

  const activeSession = activeSessionRes?.data || activeSessionRes?.session || null;
  const hubArmadas = hubArmadasRes?.data || hubArmadasRes?.armadas || [];
  const products = productsRes?.data || productsRes?.products || [];

  const selectedProductId = watch("product_id");
  const selectedQty = watch("quantity") || 1;
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const calculatedEstimatedTotal = selectedProduct ? selectedProduct.price * Number(selectedQty) : 0;

  // Determine Current Rider Shift Lifecycle State
  let currentState = "UNASSIGNED";
  if (activeSession) {
    if (activeSession.status === "CHECKED_IN" || activeSession.checked_in) {
      currentState = "CHECKED_IN";
    } else if (activeSession.armada_id || activeSession.status === "CLAIMED") {
      currentState = "CLAIMED";
    } else if (activeSession.held_armada_id || activeSession.hold_expiry) {
      currentState = "HELD";
    } else {
      currentState = "DUTY_CONFIRMED";
    }
  }

  // Countdown effect for 5-minute hold timer
  useEffect(() => {
    if (activeSession?.hold_expiry) {
      const expiryTime = new Date(activeSession.hold_expiry).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setHoldTimeRemaining(diff);
        if (diff === 0) {
          clearInterval(interval);
          queryClient.invalidateQueries({ queryKey: queryKeys.riders.session() });
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setHoldTimeRemaining(null);
    }
  }, [activeSession?.hold_expiry, queryClient]);

  // Mutations
  const confirmDutyMutation = useMutation({
    mutationFn: () => distributionService.confirmDuty({ is_available: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.session() });
      alert("Kesediaan bertugas hari ini berhasil dikonfirmasi!");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal konfirmasi tugas.");
    },
  });

  const holdArmadaMutation = useMutation({
    mutationFn: (armadaId) => riderService.holdArmada(armadaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.hubArmadas() });
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal mengunci armada.");
    },
  });

  const cancelHoldMutation = useMutation({
    mutationFn: (armadaId) => riderService.cancelHoldArmada(armadaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.hubArmadas() });
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal membatalkan hold.");
    },
  });

  const claimArmadaMutation = useMutation({
    mutationFn: (armadaId) => riderService.claimArmada(armadaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.hubArmadas() });
      alert("Armada berhasil diklaim! Silakan menuju zona operasional untuk Check-in.");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal mengklaim armada.");
    },
  });

  const checkInMutation = useMutation({
    mutationFn: () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          return reject(new Error("Browser tidak mendukung GPS Geolocation."));
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            riderService
              .checkInZone({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              })
              .then(resolve)
              .catch(reject);
          },
          (err) => reject(new Error("Gagal mengambil lokasi GPS: " + err.message)),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.session() });
      alert("Check-in Spasial Berhasil! Shift Anda di zona telah aktif.");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal check-in spasial.");
    },
  });

  const recordSaleMutation = useMutation({
    mutationFn: riderService.recordSale,
    onSuccess: () => {
      reset({ product_id: "", quantity: 1 });
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
      alert("Transaksi Penjualan Berhasil Dicatat!");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal mencatat penjualan.");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => riderService.checkoutSession({ return_status: "ACTIVE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.riders.hubArmadas() });
      alert("Shift Selesai! Armada telah dikembalikan ke Hub.");
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal checkout session.");
    },
  });

  const formatTimer = (secs) => {
    if (secs === null || secs === undefined) return "00:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const onSubmitSales = (data) => {
    if (!data.product_id) {
      alert("Silakan pilih produk terlebih dahulu.");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          recordSaleMutation.mutate({
            product_id: data.product_id,
            quantity: Number(data.quantity),
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Fallback if GPS temporarily unreadable
          recordSaleMutation.mutate({
            product_id: data.product_id,
            quantity: Number(data.quantity),
          });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      recordSaleMutation.mutate({
        product_id: data.product_id,
        quantity: Number(data.quantity),
      });
    }
  };

  return (
    <AppLayout title="Today's Operation" subtitle="Shift Lifecycle & Sales Management">
      <PageHeader
        title="Today's Operation (Shift Lifecycle)"
        description="Kelola alur kerja harian rider: Konfirmasi Duty → Inspeksi & Hold Armada → Klaim Armada → Check-in Spasial → Catat Penjualan."
      />

      {/* Compact Top Operational Stepper Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <div className={`flex items-center gap-1.5 ${currentState !== "UNASSIGNED" ? "text-emerald-600 font-extrabold" : "text-[#FF5052]"}`}>
            <CalendarCheck className="w-4 h-4" /> 1. Duty
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-1.5 ${["HELD", "CLAIMED", "CHECKED_IN"].includes(currentState) ? "text-emerald-600 font-extrabold" : currentState === "DUTY_CONFIRMED" ? "text-[#FF5052]" : "text-slate-400"}`}>
            <Bike className="w-4 h-4" /> 2. Armada
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-1.5 ${currentState === "CHECKED_IN" ? "text-emerald-600 font-extrabold" : "text-slate-400"}`}>
            <MapPin className="w-4 h-4" /> 3. Check-in
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-1.5 ${currentState === "CHECKED_IN" ? "text-[#FF5052] font-extrabold" : "text-slate-400"}`}>
            <ShoppingBag className="w-4 h-4" /> 4. Shift Aktif
          </div>
        </div>
      </div>

      {loadingSession ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          Memuat status operasional shift...
        </div>
      ) : (
        <div className="space-y-6">
          {/* STATE 1: UNASSIGNED */}
          {currentState === "UNASSIGNED" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5052]/10 text-[#FF5052] flex items-center justify-center mx-auto">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-heading font-extrabold text-slate-900">Konfirmasi Kesediaan Bertugas</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Konfirmasikan bahwa Anda siap bertugas hari ini untuk masuk ke dalam antrean alokasi zona operasional FIFO.
                </p>
              </div>
              <Button
                onClick={() => confirmDutyMutation.mutate()}
                disabled={confirmDutyMutation.isPending}
                variant="primary"
                className="px-6 py-3 font-bold shadow-xs mx-auto"
              >
                {confirmDutyMutation.isPending ? "Memproses..." : "Konfirmasi Kesediaan Bertugas Hari Ini"}
              </Button>
            </div>
          )}

          {/* STATE 2: DUTY_CONFIRMED (Select & Hold Armada) */}
          {currentState === "DUTY_CONFIRMED" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-slate-900 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-[#FF5052]" /> Katalog Armada Hub (Pilih & Kunci 5 Mnt)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pilih unit gerobak/motor di Hub untuk diinspeksi. Sistem mengunci unit selama 5 menit.</p>
                </div>
                <StatusBadge variant="info">Penugasan Siap</StatusBadge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {hubArmadas.map((armada) => (
                  <div
                    key={armada.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      armada.status === "ACTIVE"
                        ? "bg-white border-slate-200 hover:border-[#FF5052]/40"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bike className="w-5 h-5 text-[#FF5052]" />
                        <span className="text-xs font-bold text-slate-900">{armada.code || armada.name}</span>
                      </div>
                      <StatusBadge variant={armada.status === "ACTIVE" ? "success" : "warning"}>
                        {armada.status}
                      </StatusBadge>
                    </div>

                    <Button
                      onClick={() => holdArmadaMutation.mutate(armada.id)}
                      disabled={armada.status !== "ACTIVE" || holdArmadaMutation.isPending}
                      variant="primary"
                      size="sm"
                      className="w-full text-xs font-bold py-2"
                    >
                      Kunci Armada (Hold 5 Mnt)
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATE 3: HELD (5-Minute Countdown & Confirm Claim) */}
          {currentState === "HELD" && (
            <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> SISA WAKTU REKRUITMEN / INSPEKSI (HOLD 5 MNT)
                </span>
                <span className="text-xl font-heading font-extrabold font-mono text-amber-900 bg-amber-100 px-3 py-1 rounded-xl border border-amber-300">
                  {formatTimer(holdTimeRemaining)}
                </span>
              </div>

              <div>
                <h4 className="text-base font-heading font-extrabold text-slate-900">
                  Unit Armada Terkunci: <span className="text-[#FF5052]">{activeSession?.armada_code || "Unit Hub"}</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Lakukan inspeksi fisik unit di Hub. Tekan tombol di bawah jika fisik kendaraan baik untuk mengubah status menjadi permanent claim (IN_USE).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => claimArmadaMutation.mutate(activeSession?.held_armada_id || activeSession?.armada_id)}
                  disabled={claimArmadaMutation.isPending}
                  variant="primary"
                  className="flex-1 py-3 font-bold shadow-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  {claimArmadaMutation.isPending ? "Memproses Klaim..." : "Konfirmasi Klaim Armada (Status IN_USE)"}
                </Button>

                <Button
                  onClick={() => cancelHoldMutation.mutate(activeSession?.held_armada_id || activeSession?.armada_id)}
                  disabled={cancelHoldMutation.isPending}
                  variant="outline"
                  className="py-3 text-xs font-semibold text-slate-700"
                >
                  Batal Hold
                </Button>
              </div>
            </div>
          )}

          {/* STATE 4: CLAIMED (Ready for Spatial Check-in) */}
          {currentState === "CLAIMED" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge variant="success">Armada Terklaim (IN_USE)</StatusBadge>
                <span className="text-xs text-slate-500">Zona Tugas: <strong>{activeSession?.zone_name || "Zona Operasional"}</strong></span>
              </div>

              <div>
                <h4 className="text-base font-heading font-extrabold text-slate-900">Siap Menuju Zona Berjual</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Silakan mengendarai armada menuju area poligon zona. Saat sudah berada di lokasi, lakukan Check-in Spasial via GPS.
                </p>
              </div>

              <Button
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
                variant="primary"
                className="w-full py-3 font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {checkInMutation.isPending ? "Memverifikasi GPS Spasial..." : "Check-in Spasial Zona (PostGIS ST_Contains)"}
              </Button>
            </div>
          )}

          {/* STATE 5: CHECKED_IN (Active Shift & Sales Logger) */}
          {currentState === "CHECKED_IN" && (
            <div className="space-y-6">
              {/* Active Shift Header Banner */}
              <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-lg border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Shift Operasional Aktif
                  </div>
                  <h3 className="text-lg font-heading font-extrabold text-white mt-1">
                    {activeSession?.zone_name || "Zona Operasional Aktif"}
                  </h3>
                  <p className="text-xs text-emerald-300 mt-0.5">Armada: <strong>{activeSession?.armada_code || "IN_USE"}</strong></p>
                </div>

                <Button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  variant="outline"
                  className="bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border-emerald-700 text-xs shrink-0 py-2.5 px-4"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" /> Selesai Shift & Checkout
                </Button>
              </div>

              {/* Sales Logger Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-heading font-extrabold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" /> Catat Transaksi Penjualan (POS)
                </h3>

                <form onSubmit={handleSubmit(onSubmitSales)} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 mb-1">Pilih Produk Kopi / Minuman</label>
                      <select
                        {...register("product_id", { required: true })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-[#FF5052] focus:outline-none bg-white"
                        required
                      >
                        <option value="">-- Pilih Produk --</option>
                        {products.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name} ({formatCurrency(prod.price)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">Jumlah Terjual (Qty)</label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        {...register("quantity", { required: true, valueAsNumber: true })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-[#FF5052] focus:outline-none"
                        placeholder="Contoh: 2"
                        required
                      />
                    </div>
                  </div>

                  {selectedProduct && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Estimasi Subtotal:</span>
                      <span className="font-heading font-extrabold text-sm text-emerald-600">
                        {formatCurrency(calculatedEstimatedTotal)}
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={recordSaleMutation.isPending || loadingProducts}
                    variant="primary"
                    className="w-full py-3 shadow-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
                  >
                    {recordSaleMutation.isPending ? "Menyimpan Transaksi POS..." : "Catat Transaksi Penjualan"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
