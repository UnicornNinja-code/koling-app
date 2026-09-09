import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import L from "leaflet";
import { useAuth } from "../../context/AuthContext.jsx";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { zoneService } from "../../services/zoneService.js";
import { riderService } from "../../services/riderService.js";
import { MapPin, Navigation, Bike, Clock, CheckCircle } from "lucide-react";

export function RiderMapPage() {
  const { user } = useAuth();
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const { data: zonesRes } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneService.getZones,
  });

  const zones = zonesRes?.zones || zonesRes?.data || [];

  const claimMutation = useMutation({
    mutationFn: riderService.claimZone,
    onSuccess: (data) => {
      alert(`[Klaim Zona Berhasil] ${data?.msg || "Zona dikunci selama 5 menit untuk armada Anda."}`);
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || err?.message || "Gagal mengklaim zona.");
    },
  });

  // Initialize Leaflet Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch (e) {}
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    const map = L.map(mapContainerRef.current).setView([-7.4478, 112.7183], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <AppLayout title="Rider Live Spatial Map" subtitle="Geofence Status & 5-Min Hold Lock Claim">
      <PageHeader
        title="Peta Spasial & Zona Jualan"
        description="Visualisasi geofence, status ketersediaan zona, dan klaim reservasi armada 5-menit."
      />

      {/* Control Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Rider</span>
            <StatusBadge variant="primary">{user?.role}</StatusBadge>
          </div>
          <h3 className="text-base font-semibold text-slate-900">{user?.name || user?.username}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Bike className="w-4 h-4 text-red-600" />
            <span>Mobile Bike Fleet #04 - Ready</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Queue Hold Lock</span>
            <StatusBadge variant="warning">FIFO Lock</StatusBadge>
          </div>
          <h3 className="text-base font-semibold text-slate-900">Reservasi 5-Menit</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Lock Expire Timer Auto Renewal</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Geofence Location</span>
            <StatusBadge variant="success">Di Dalam Zona</StatusBadge>
          </div>
          <h3 className="text-base font-semibold text-slate-900">GPS Signal Strong</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Akurasi: 4.2 meter</span>
          </div>
        </div>
      </div>

      {/* Map View Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-red-600" /> Peta Navigasi Spasial Rider
          </h3>
          {selectedZoneId && (
            <Button
              onClick={() => claimMutation.mutate(selectedZoneId)}
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" /> Klaim Lock Zona #{selectedZoneId}
            </Button>
          )}
        </div>
        <div ref={mapContainerRef} style={{ height: "380px", width: "100%", zIndex: 1 }} className="rounded-xl border border-slate-200" />
      </div>

      {/* Select Zone List for Claim */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Pilih Zona untuk Klaim Lock 5-Menit</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {zones.map((z) => (
            <div
              key={z.id}
              onClick={() => setSelectedZoneId(z.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedZoneId === z.id ? "border-red-600 bg-red-50/50 ring-2 ring-red-200" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="font-bold text-slate-900 text-sm">{z.name}</div>
              <div className="text-xs text-slate-500 mt-1">Kuota: {z.max_capacity} Rider</div>
              <div className="mt-3">
                <Button
                  onClick={(e) => { e.stopPropagation(); claimMutation.mutate(z.id); }}
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                >
                  Klaim Lock Zona Ini
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
