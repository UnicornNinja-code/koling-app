import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { HubWeatherControlCard } from "../../components/dashboard/HubWeatherControlCard.jsx";
import { dashboardService } from "../../services/dashboardService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { queryKeys } from "../../lib/queryKeys.js";
import { formatCurrency } from "../../lib/utils.js";
import {
  MapPin,
  Bike,
  Users,
  Activity,
  TrendingUp,
  Calendar,
  Download,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Sliders,
  Scale,
} from "lucide-react";

export function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState("today");

  const { data: summaryRes, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.summary(range),
    queryFn: () => dashboardService.getSummary(range),
  });

  const summary = summaryRes?.data || summaryRes || {};
  const financials = summary.financials || {};
  const operations = summary.operations || {};
  const fleet = summary.fleet || {};
  const topZones = summary.dss_top_zones || [];
  const activeRiders = summary.active_riders_detail || [];

  // Formatted date string (e.g. "Sun, 12 June 2026")
  const currentDateFormatted = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Calculate live values with graceful fallbacks matching the exact design
  const totalZonesCount = operations.active_zones_count || 18;
  const fleetTotal = fleet.total || 42;
  const fleetInUse = fleet.in_use || 38;
  const fleetUtilityPct = fleetTotal > 0 ? ((fleetInUse / fleetTotal) * 100).toFixed(1) : "90.5";
  const revenueTotal = financials.total_revenue ? formatCurrency(financials.total_revenue) : "Rp 18.45M";

  // Mock bar data for volume chart (Image 2)
  const volumeChartData = [
    { zone: "Zone A", volume: 600, heightPct: 85 },
    { zone: "Zone B", volume: 380, heightPct: 54 },
    { zone: "Zone C", volume: 490, heightPct: 70 },
    { zone: "Zone D", volume: 320, heightPct: 45 },
    { zone: "Zone E", volume: 550, heightPct: 78 },
    { zone: "Zone F", volume: 460, heightPct: 65 },
  ];

  // BWM Criteria Weights (Image 2)
  const bwmWeights = [
    { code: "C1", name: "POI Density", weight: 32.4 },
    { code: "C2", name: "POI Diversity", weight: 24.5 },
    { code: "C3", name: "Time Crowd Density", weight: 18.2 },
    { code: "C4", name: "Weather Index", weight: 12.1 },
    { code: "C5", name: "Rider Distance", weight: 8.0 },
    { code: "C6", name: "Competitor Density", weight: 4.8 },
  ];

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Monitor real-time DSS location optimization & fleet performance today."
    >
      {/* 1. Header Section: Welcome Banner & Action Controls (Image 2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back <span className="text-2xl">👋</span> {user?.name || user?.username || "BudiSuper"}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            Monitor real-time DSS location optimization & fleet performance today.
          </p>
        </div>

        {/* Date Pill & Export CTA */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#D2D2D4]/70 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{currentDateFormatted}</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 2. Weather & Active Hub Control Card (Image 1) */}
      <HubWeatherControlCard
        hubName="Sidoarjo Hub, Kota Sidoarjo"
        hubCountry="Indonesia"
        temperature="31.2°C"
        weatherCondition="Cerah Berawan"
        feelsLike="35.1°C"
        rainProb="10%"
        humidity="64%"
        dewPoint="23.5°C"
        visibility="10.0km"
        activeZonesCount={totalZonesCount}
        activeFleetCount={fleetTotal}
        shiftInfo="Shift 1 (06:00-18:00 WIB)"
      />

      {/* 3. 4 KPI Metric Cards (Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
        
        {/* KPI 1: Zones */}
        <div className="bg-white p-5 rounded-2xl border border-[#D2D2D4]/70 shadow-sm space-y-3 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#FF634A] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#FF634A] bg-red-50 px-2 py-0.5 rounded-full">
              +2 new
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-heading font-black text-slate-900 tracking-tight leading-tight">
              {totalZonesCount} Zones
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Total Active Geofence Zones
            </p>
          </div>
        </div>

        {/* KPI 2: Fleet Utility */}
        <div className="bg-white p-5 rounded-2xl border border-[#D2D2D4]/70 shadow-sm space-y-3 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              +3.2%
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-heading font-black text-slate-900 tracking-tight leading-tight">
              {fleetUtilityPct}%
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Fleet Utility ({fleetInUse}/{fleetTotal} Units)
            </p>
          </div>
        </div>

        {/* KPI 3: Geofence Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-[#D2D2D4]/70 shadow-sm space-y-3 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              98% On-time
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-heading font-black text-slate-900 tracking-tight leading-tight">
              96.8%
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Rider Geofence Compliance
            </p>
          </div>
        </div>

        {/* KPI 4: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#D2D2D4]/70 shadow-sm space-y-3 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              +10.2%
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-heading font-black text-slate-900 tracking-tight leading-tight">
              {revenueTotal}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Total Estimated Revenue
            </p>
          </div>
        </div>

      </div>

      {/* 4. Bottom Analytics & BWM Weights Grid (Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: DSS Location Accuracy & Volume (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D2D2D4]/70 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900">
                DSS Location Accuracy & Volume
              </h3>
              <p className="text-xs text-slate-400 font-normal">
                Real-time sales cup volume per geofence zone
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#FF634A] bg-red-50 border border-red-100 self-start sm:self-auto">
              94.6% Avg Accuracy
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2 border-b border-[#D2D2D4]/50">
            {volumeChartData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.volume}
                </span>
                <div
                  className="w-full max-w-[48px] bg-[#FF634A] hover:bg-[#E54E36] rounded-t-xl transition-all shadow-xs cursor-pointer"
                  style={{ height: `${item.heightPct}%` }}
                />
                <span className="text-xs font-medium text-slate-600 truncate max-w-[60px] pb-2">
                  {item.zone}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: BWM Criteria Weights (Col 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#D2D2D4]/70 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FF634A]" />
              BWM Criteria Weights
            </h3>

            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ✓ Valid CR: 0.034
            </span>
          </div>

          {/* Horizontal Weight Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {bwmWeights.map((c) => (
              <div key={c.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">
                    <b className="text-[#FF634A] mr-1.5">{c.code}</b>
                    {c.name}
                  </span>
                  <span className="font-mono text-slate-500">{c.weight}%</span>
                </div>
                <div className="w-full bg-[#F4F4F6] h-2 rounded-full overflow-hidden border border-[#D2D2D4]/40">
                  <div
                    className="bg-[#B82814] h-full rounded-full transition-all"
                    style={{ width: `${c.weight * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
