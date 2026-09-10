import React, { useState } from "react";
import {
  Layers,
  MapPin,
  Bike,
  Truck,
  Compass,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sliders,
  TrendingUp,
  CloudRain,
  Users,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Drawer,
  PageHeader,
} from "../../components/ui/index.js";
import { MapView } from "../../components/map/MapView.jsx";
import { MOCK_ZONES, MOCK_RIDERS, MOCK_POIS } from "./mockData.js";

export function MapOpsPage() {
  const [selectedZone, setSelectedZone] = useState(MOCK_ZONES[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
        {/* Top Header */}
        <PageHeader
          title="Peta Operasi Spasial (Map Ops)"
          subtitle="Monitoring geofence zona, telemetri pergerakan armada, dan detail kriteria multi-dimensi"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Sliders}
                onClick={() => setIsDrawerOpen(true)}
              >
                Panel Detail Zona ({selectedZone?.name})
              </Button>
            </div>
          }
        />

        {/* Map Layout with Integrated Right Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Full GIS Canvas */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <MapView
                height="620px"
                zones={MOCK_ZONES}
                riders={MOCK_RIDERS}
                pois={MOCK_POIS}
                selectedZoneId={selectedZone?.id}
                onZoneClick={handleZoneSelect}
              />
            </Card>
          </div>

          {/* Right Detail & Radar Panel */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader
                title={`Detail ${selectedZone.name}`}
                subtitle={`Kode: ${selectedZone.id}`}
                action={
                  <Badge variant="primary" size="sm">
                    Rank #{selectedZone.rank}
                  </Badge>
                }
              />
              <CardContent className="p-4 space-y-4">
                {/* Score Summary Box */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Skor Preferensi TOPSIS
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedZone.score}
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    {selectedZone.scoreTrend}
                  </Badge>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[10px]">POI Terdata</div>
                    <div className="font-bold text-slate-900 dark:text-white">{selectedZone.poiCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[10px]">Rider Bertugas</div>
                    <div className="font-bold text-slate-900 dark:text-white">{selectedZone.riderCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[10px]">Kapasitas</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{selectedZone.capacityPct}%</div>
                  </div>
                </div>

                {/* 6 Criteria Breakdown Progress Bars */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Breakdown Nilai 6 Kriteria Ilmiah:
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>C1 Densitas POI</span>
                      <span className="font-bold text-emerald-600">{selectedZone.c1}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedZone.c1 * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>C2 Diversitas POI</span>
                      <span className="font-bold text-blue-600">{selectedZone.c2}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedZone.c2 * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>C3 Skor Keramaian Jam Kerja</span>
                      <span className="font-bold text-purple-600">{selectedZone.c3}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${selectedZone.c3 * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>C4 Kesesuaian Cuaca Lapangan</span>
                      <span className="font-bold text-amber-600">{selectedZone.c4}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedZone.c4 * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>C5 Aksesibilitas Jalan Protokol</span>
                      <span className="font-bold text-cyan-600">{selectedZone.c5}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${selectedZone.c5 * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>C6 Kepadatan Kompetitor (Cost)</span>
                      <span className="font-bold text-rose-600">{selectedZone.c6}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${selectedZone.c6 * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="primary" className="w-full" size="sm">
                    Buka Rincian Simulasi DSS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Drawer for Deep Inspection */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Analisis Spasial: ${selectedZone?.name}`}
          position="right"
          size="md"
        >
          <div className="p-4 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
              <div className="font-bold text-slate-900 dark:text-white mb-1">Status Geofence PostGIS</div>
              <div className="text-slate-500">Polygon ST_Covers valid dengan 4 simpul batas terdaftar di database spasial.</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200">Rider Bertugas di Zona Ini:</div>
              {MOCK_RIDERS.filter((r) => r.zoneId === selectedZone?.id).map((r) => (
                <div key={r.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{r.name}</div>
                    <div className="text-slate-400 text-[10px]">{r.armadaCode} • Presensi: {r.checkInTime}</div>
                  </div>
                  <Badge variant="success" size="sm">{r.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Drawer>
      </div>
  );
}

export default MapOpsPage;
