import React, { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Compass,
  Layers,
  CloudRain,
  Users,
} from "lucide-react";
import { ArmadaIcon } from "../ui/ArmadaIcon.jsx";
import { WeatherIcon } from "../ui/WeatherIcon.jsx";
import { DssMapVisual, WeatherStationVisual, FleetDispatchVisual } from "./hero-visuals/index.js";

/**
 * AuthLayout Component
 * Brand: Mova
 * Created by Febriyan Dwi Putra 2026
 * Description: Aplikasi sistem pendukung keputusan lokasi penjualan usaha yang memiliki basis keliling.
 * Dibuat untuk operasional Sejuta Jiwa Cabang Sidoarjo.
 */
export function AuthLayout({ children }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: "dss",
      badge: "Sistem Pendukung Keputusan (DSS)",
      title: "Optimasi Lokasi Penjualan Berbasis BWM-TOPSIS",
      description:
        "Menganalisis multi-kriteria secara ilmiah (densitas POI, keramaian jam kerja, aksesibilitas jalan) untuk merekomendasikan zona dan titik penjualan paling potensial.",
      visual: <DssMapVisual />,
      floatingTop: {
        icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
        label: "Skor Preferensi DSS",
        value: "0.823 (Peringkat #1)",
        color: "text-emerald-600 dark:text-emerald-400",
      },
      floatingBottom: {
        icon: <Compass className="w-3.5 h-3.5 text-blue-500" />,
        label: "Akurasi Rekomendasi",
        value: "94.8% Akurasi Penempatan",
        color: "text-blue-600 dark:text-blue-400",
      },
    },
    {
      id: "weather",
      badge: "Intelijen Cuaca & Operasi",
      title: "Integrasi Prediksi Cuaca & Mitigasi Risiko Lapangan",
      description:
        "Pemantauan cuaca otomatis real-time untuk mengarahkan armada gerobak keliling ke shelter aman atau gedung perkantoran saat terjadi potensi hujan.",
      visual: <WeatherStationVisual />,
      floatingTop: {
        icon: <WeatherIcon condition="Cerah" size={24} />,
        label: "Prakiraan Cuaca",
        value: "32°C Cerah • Kondisi Ideal",
        color: "text-amber-600 dark:text-amber-400",
      },
      floatingBottom: {
        icon: <CloudRain className="w-3.5 h-3.5 text-teal-500" />,
        label: "Peluang Hujan BMKG",
        value: "10% Rendah • Siap Operasi",
        color: "text-emerald-600 dark:text-emerald-400",
      },
    },
    {
      id: "distribution",
      badge: "Manajemen Armada & Rider",
      title: "Distribusi & Penyeimbangan Beban Rider Real-Time",
      description:
        "Rebalancing penugasan rider antar zona secara presisi untuk menghindari penumpukan armada di satu titik dan memaksimalkan omset harian.",
      visual: <FleetDispatchVisual />,
      floatingTop: {
        icon: <Users className="w-3.5 h-3.5 text-blue-500" />,
        label: "Rebalancing Dinamis",
        value: "Transfer +2 Rider Surplus",
        color: "text-blue-600 dark:text-blue-400",
      },
      floatingBottom: {
        icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
        label: "Proyeksi Dampak",
        value: "+18% Estimasi Kenaikan Omset",
        color: "text-emerald-600 dark:text-emerald-400",
      },
    },
  ];

  // Auto-rotating timer for slides
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const currentSlide = slides[activeSlide];

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-['Inter']">
      {/* Outer Main Container */}
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[36px] shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">

        {/* LEFT SIDE: Primary Blue Showcase Hero Section with Carousel */}
        <div
          className="lg:col-span-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 sm:p-10 text-white relative flex flex-col justify-between overflow-hidden select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-28 -left-28 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          {/* Top Header: Brand Name & Subtitle */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                Mova
              </h1>
              <p className="text-[11px] text-blue-100/90 font-medium mt-0.5 leading-snug">
                Sistem Pendukung Keputusan Lokasi Penjualan Usaha Keliling
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sidoarjo Hub</span>
            </div>
          </div>

          {/* Center Stage: Interactive Isometric Visual with Floating Badges */}
          <div className="relative z-10 my-4 sm:my-6 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl w-full max-w-sm overflow-visible">

              {/* Isometric 3D Component */}
              <div className="w-full flex items-center justify-center min-h-[190px]">
                {currentSlide.visual}
              </div>

              {/* Floating Top Badge */}
              <div className="absolute -top-3 -right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white px-3 py-1.5 rounded-xl shadow-lg border border-white/30 dark:border-slate-700 flex items-center gap-2 transition-all duration-300">
                <div className="shrink-0">{currentSlide.floatingTop.icon}</div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentSlide.floatingTop.label}</div>
                  <div className={`text-[10px] font-bold ${currentSlide.floatingTop.color}`}>
                    {currentSlide.floatingTop.value}
                  </div>
                </div>
              </div>

              {/* Floating Bottom Badge */}
              <div className="absolute -bottom-3 -left-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white px-3 py-1.5 rounded-xl shadow-lg border border-white/30 dark:border-slate-700 flex items-center gap-2 transition-all duration-300">
                <div className="shrink-0">{currentSlide.floatingBottom.icon}</div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentSlide.floatingBottom.label}</div>
                  <div className={`text-[10px] font-bold ${currentSlide.floatingBottom.color}`}>
                    {currentSlide.floatingBottom.value}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Slide Info & Controls */}
          <div className="relative z-10">
            {/* Tag Badge */}
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-400/30 mb-2">
              {currentSlide.badge}
            </span>

            {/* Slide Title */}
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
              {currentSlide.title}
            </h2>

            {/* Slide Description */}
            <p className="text-xs text-blue-100/90 mt-1 leading-relaxed min-h-[36px]">
              {currentSlide.description}
            </p>

            {/* Slide Navigation Dots & Arrows */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    title={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? "w-6 bg-orange-400" : "w-1.5 bg-white/30 hover:bg-white/60"
                      }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Keunggulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Keunggulan Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Creator Attribution */}
            <div className="text-[10px] text-blue-200/70 mt-3 flex items-center">
              <span>Created by <strong className="text-white">Febriyan Dwi Putra 2026</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Crisp White Clean Form Panel */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
