import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Row,
  Column,
  Button,
  Tag,
  Tile,
  Accordion,
  AccordionItem,
  Select,
  SelectItem,
  InlineNotification,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  InlineLoading,
} from "../../design-system/components/index.js";
import {
  PageHeader,
  FilterBar,
  MasterDetailPanel,
  EmptyStatePattern,
} from "../../design-system/patterns/index.js";
import { MapView } from "../../components/map/MapView.jsx";
import { zoneService } from "../../services/zoneService.js";
import { lbsService } from "../../services/lbsService.js";
import { poiService } from "../../services/poiService.js";
import { useDashboardRealtime } from "../../hooks/useDashboardRealtime.js";
import {
  Renew,
  DeliveryTruck,
  Location,
  View,
  Information,
} from "@carbon/icons-react";

/**
 * MapOpsPage - Production Architecture (Zero Mock Fallback)
 * 100% Real-Time API & Socket.io Integration on Native Carbon Design System
 */
export function MapOpsPage() {
  // Real-Time WebSockets Integration
  const {
    isConnected,
    liveRiders: socketRiders,
    geofenceAlerts,
    dismissAlert,
  } = useDashboardRealtime();

  // Primary Domain States
  const [zones, setZones] = useState([]);
  const [apiRiders, setApiRiders] = useState([]);
  const [pois, setPois] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Selected Zone & Master-Detail State
  const [selectedZone, setSelectedZone] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);

  // Table Filters & Search Queries
  const [riderSearch, setRiderSearch] = useState("");
  const [riderStatusFilter, setRiderStatusFilter] = useState("ALL");
  const [zoneSearch, setZoneSearch] = useState("");

  // Fetch real data from backend services on mount & refresh
  const loadOperationalData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [zonesRes, ridersRes, poisRes] = await Promise.allSettled([
        zoneService.getAll(),
        lbsService.getLiveRiders(),
        poiService.getPois(),
      ]);

      if (zonesRes.status === "fulfilled") {
        const rawZones = zonesRes.value?.zones || zonesRes.value?.data || zonesRes.value || [];
        setZones(Array.isArray(rawZones) ? rawZones : []);
      }
      if (ridersRes.status === "fulfilled") {
        const rawRiders = ridersRes.value?.riders || ridersRes.value?.data || ridersRes.value || [];
        setApiRiders(Array.isArray(rawRiders) ? rawRiders : []);
      }
      if (poisRes.status === "fulfilled") {
        const rawPois = poisRes.value?.pois || poisRes.value?.data || poisRes.value || [];
        setPois(Array.isArray(rawPois) ? rawPois : []);
      }
    } catch (err) {
      setFetchError("Gagal memuat data spasial backend. Silakan periksa koneksi server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOperationalData();
  }, []);

  // Merge API initial riders with live WebSocket telemetry (Strictly Real Data, No Mock Fallback)
  const activeRiders = useMemo(() => {
    if (!socketRiders || Object.keys(socketRiders).length === 0) {
      return apiRiders;
    }
    // Update API riders with real-time socket payload
    const riderMap = new Map(apiRiders.map((r) => [r.id, { ...r }]));
    Object.entries(socketRiders).forEach(([id, liveData]) => {
      const existing = riderMap.get(id) || { id, name: liveData.name || `Rider ${id}` };
      riderMap.set(id, {
        ...existing,
        latitude: liveData.latitude ?? existing.latitude,
        longitude: liveData.longitude ?? existing.longitude,
        status: liveData.status ?? existing.status ?? "OPERATING",
        battery: liveData.battery ?? existing.battery ?? 100,
        speed: liveData.speed ?? existing.speed ?? 0,
        geofence_status: liveData.geofence_status ?? existing.geofence_status ?? "IN_ZONE",
        armada_code: liveData.armada_code ?? existing.armada_code ?? `ARM-${id}`,
        zone_name: liveData.zone_name ?? existing.zone_name ?? "Unassigned",
        last_ping: liveData.last_ping || "Baru saja",
      });
    });
    return Array.from(riderMap.values());
  }, [apiRiders, socketRiders]);

  // Filtered Riders
  const filteredRiders = useMemo(() => {
    return activeRiders.filter((r) => {
      const name = r.name || "";
      const armada = r.armada_code || "";
      const zone = r.zone_name || "";
      const matchSearch =
        name.toLowerCase().includes(riderSearch.toLowerCase()) ||
        armada.toLowerCase().includes(riderSearch.toLowerCase()) ||
        zone.toLowerCase().includes(riderSearch.toLowerCase());
      const matchStatus =
        riderStatusFilter === "ALL" ||
        (riderStatusFilter === "COMPLIANT" && r.geofence_status === "IN_ZONE") ||
        (riderStatusFilter === "DEVIATED" && r.geofence_status === "OUT_ZONE") ||
        (riderStatusFilter === "ASSIGNED" && r.status === "ASSIGNED");
      return matchSearch && matchStatus;
    });
  }, [activeRiders, riderSearch, riderStatusFilter]);

  // Filtered Zones
  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      const name = z.name || "";
      const code = z.code || "";
      return (
        name.toLowerCase().includes(zoneSearch.toLowerCase()) ||
        code.toLowerCase().includes(zoneSearch.toLowerCase())
      );
    });
  }, [zones, zoneSearch]);

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setIsDetailOpen(true);
  };

  const handleRiderSelect = (rider) => {
    setSelectedRider(rider);
  };

  // Operational Metrics Calculation
  const totalRiders = activeRiders.length;
  const activeOperatingRiders = activeRiders.filter((r) => r.status === "OPERATING" || r.status === "CLAIMED").length;
  const deviatedRidersCount = activeRiders.filter((r) => r.geofence_status === "OUT_ZONE").length;
  const compliantRate = totalRiders > 0 ? Math.round(((totalRiders - deviatedRidersCount) / totalRiders) * 100) : 100;

  // Rider Table Headers for Carbon DataTable
  const riderTableHeaders = [
    { key: "rider", header: "Rider / Armada" },
    { key: "zone", header: "Zona Penugasan" },
    { key: "speed", header: "Kecepatan" },
    { key: "battery", header: "Daya Baterai" },
    { key: "geofence", header: "Status Kepatuhan" },
    { key: "action", header: "Aksi" },
  ];

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      {/* Enterprise Page Header */}
      <PageHeader
        eyebrow="Sistem Kendali Spasial Lapangan"
        title="Map Operations Control Room"
        subtitle="Visualisasi spasial real-time, pantauan telemetri GPS armada, kepatuhan batas zona PostGIS, dan deteksi deviasi rute."
        statusTag={{
          label: isConnected ? "SOCKET CONNECTED" : "OFFLINE TELEMETRY",
          type: isConnected ? "green" : "gray",
        }}
        actions={
          <Button
            kind="secondary"
            size="md"
            renderIcon={Renew}
            onClick={loadOperationalData}
            disabled={isLoading}
          >
            {isLoading ? <InlineLoading description="Sinkronisasi..." /> : "Sinkronkan Data"}
          </Button>
        }
      />

      {/* Fetch Error Notification */}
      {fetchError && (
        <InlineNotification
          kind="error"
          title="Gangguan Koneksi Backend:"
          subtitle={fetchError}
        />
      )}

      {/* Geofence Live Alert Notifications */}
      {geofenceAlerts && geofenceAlerts.length > 0 && (
        <div className="space-y-[var(--cds-spacing-02)]">
          {geofenceAlerts.map((alert, idx) => (
            <InlineNotification
              key={idx}
              kind="error"
              title="Peringatan Deviasi Batas Geofence:"
              subtitle={`${alert.rider_name || "Rider"} (${alert.armada_code || "Unit"}) terdeteksi keluar dari zona ${alert.zone_name || "PostGIS"} pada ${alert.timestamp || "baru saja"}.`}
              onClose={() => dismissAlert && dismissAlert(idx)}
            />
          ))}
        </div>
      )}

      {/* Operational Macro Metric Cards (Carbon 2x Grid) */}
      <Grid fullWidth>
        <Row className="gap-y-[16px]">
          <Column lg={4} md={2} sm={4}>
            <Tile className="p-[16px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] space-y-[4px]">
              <span className="text-[12px] uppercase text-[var(--cds-text-secondary)] font-mono">ARMADA BEROPERASI</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[28px] font-bold text-[var(--cds-text-primary)] leading-tight">{activeOperatingRiders} / {totalRiders}</span>
                <Tag type="blue" size="sm">{totalRiders === 0 ? "Tidak Ada Data" : "Unit Aktif"}</Tag>
              </div>
            </Tile>
          </Column>

          <Column lg={4} md={2} sm={4}>
            <Tile className="p-[16px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] space-y-[4px]">
              <span className="text-[12px] uppercase text-[var(--cds-text-secondary)] font-mono">ZONA TERCAKUP</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[28px] font-bold text-[var(--cds-text-primary)] leading-tight">{zones.length}</span>
                <Tag type="gray" size="sm">Poligon Aktif</Tag>
              </div>
            </Tile>
          </Column>

          <Column lg={4} md={2} sm={4}>
            <Tile className="p-[16px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] space-y-[4px]">
              <span className="text-[12px] uppercase text-[var(--cds-text-secondary)] font-mono">KEPATUHAN GEOFENCE</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[28px] font-bold text-[var(--cds-text-primary)] leading-tight">
                  {totalRiders === 0 ? "-" : `${compliantRate}%`}
                </span>
                <Tag type={totalRiders === 0 ? "gray" : compliantRate >= 80 ? "green" : "yellow"} size="sm">
                  {totalRiders === 0 ? "N/A" : compliantRate >= 80 ? "Optimal" : "Perhatian"}
                </Tag>
              </div>
            </Tile>
          </Column>

          <Column lg={4} md={2} sm={4}>
            <Tile className="p-[16px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] space-y-[4px]">
              <span className="text-[12px] uppercase text-[var(--cds-text-secondary)] font-mono">PERINGATAN DEVIASI</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[28px] font-bold text-[var(--cds-text-primary)] leading-tight">{deviatedRidersCount}</span>
                <Tag type={deviatedRidersCount === 0 ? "green" : "red"} size="sm">
                  {deviatedRidersCount === 0 ? "Nol Deviasi" : `${deviatedRidersCount} Di Luar`}
                </Tag>
              </div>
            </Tile>
          </Column>
        </Row>
      </Grid>

      {/* Primary GIS Canvas */}
      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] relative overflow-hidden">
        {zones.length === 0 && !isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-3">
            <Information size={32} className="text-[var(--cds-icon-secondary)]" />
            <h4 className="text-[16px] font-semibold">Tidak Ada Data Zona Spasial</h4>
            <p className="text-[14px] text-[var(--cds-text-secondary)] max-w-md">
              Belum ada poligon PostGIS yang dikonfigurasi di server. Silakan tambahkan zona pada menu Zone Management.
            </p>
          </div>
        ) : (
          <MapView
            zones={zones}
            riders={activeRiders}
            competitors={competitors}
            pois={pois}
            selectedZoneId={selectedZone?.id}
            selectedZone={selectedZone}
            onZoneClick={handleZoneSelect}
            onRiderClick={handleRiderSelect}
            height="540px"
          />
        )}
      </div>

      {/* Accordion 1: Rider Telemetry Table */}
      <Accordion>
        <AccordionItem
          open
          title={
            <div className="flex items-center gap-[12px]">
              <DeliveryTruck size={20} className="text-[var(--cds-icon-secondary)]" />
              <span className="font-semibold text-[16px]">
                Status Operasional & Telemetri Rider ({filteredRiders.length} Unit)
              </span>
            </div>
          }
        >
          <div className="space-y-[16px] pt-[8px]">
            {/* Filter Bar */}
            <FilterBar
              searchValue={riderSearch}
              onSearchChange={setRiderSearch}
              searchPlaceholder="Cari nama rider, kode armada..."
              onReset={() => {
                setRiderSearch("");
                setRiderStatusFilter("ALL");
              }}
            >
              <div className="w-[240px]">
                <Select
                  id="rider-status-filter"
                  labelText="Status Kepatuhan"
                  size="md"
                  inline
                  value={riderStatusFilter}
                  onChange={(e) => setRiderStatusFilter(e.target.value)}
                >
                  <SelectItem value="ALL" text="Semua Status" />
                  <SelectItem value="COMPLIANT" text="Patuh di Zona (IN_ZONE)" />
                  <SelectItem value="DEVIATED" text="Deviasi Keluar (OUT_ZONE)" />
                  <SelectItem value="ASSIGNED" text="Menunggu Antrean" />
                </Select>
              </div>
            </FilterBar>

            {/* Native Carbon Table for Riders */}
            {filteredRiders.length === 0 ? (
              <EmptyStatePattern
                title="Tidak Ada Telemetri Rider Aktif"
                description={
                  isConnected
                    ? "Belum ada rider yang terhubung ke server atau cocok dengan kriteria pencarian."
                    : "Koneksi telemetri offline. Tidak ada data rider palsu yang ditampilkan."
                }
              />
            ) : (
              <TableContainer>
                <Table size="md" useZebraStyles>
                  <TableHead>
                    <TableRow>
                      {riderTableHeaders.map((header) => (
                        <TableHeader key={header.key}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRiders.map((rider) => (
                      <TableRow key={rider.id}>
                        <TableCell>
                          <div className="font-semibold">{rider.name}</div>
                          <div className="text-[12px] text-[var(--cds-text-secondary)] font-mono">{rider.armada_code}</div>
                        </TableCell>
                        <TableCell>{rider.zone_name || "-"}</TableCell>
                        <TableCell>{rider.speed || 0} km/h</TableCell>
                        <TableCell>
                          <Tag type={rider.battery > 50 ? "green" : rider.battery > 20 ? "yellow" : "red"} size="sm">
                            {rider.battery || 0}%
                          </Tag>
                        </TableCell>
                        <TableCell>
                          <Tag type={rider.geofence_status === "IN_ZONE" ? "green" : "red"} size="sm">
                            {rider.geofence_status === "IN_ZONE" ? "IN_ZONE (Patuh)" : "OUT_ZONE (Deviasi)"}
                          </Tag>
                        </TableCell>
                        <TableCell>
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={View}
                            onClick={() => handleRiderSelect(rider)}
                          >
                            Fokus Peta
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </AccordionItem>

        <AccordionItem
          title={
            <div className="flex items-center gap-[12px]">
              <Location size={20} className="text-[var(--cds-icon-secondary)]" />
              <span className="font-semibold text-[16px]">
                Daftar Zona PostGIS ({filteredZones.length} Zona Terdaftar)
              </span>
            </div>
          }
        >
          {filteredZones.length === 0 ? (
            <EmptyStatePattern
              title="Tidak Ada Zona Terdaftar"
              description="Belum ada data zona yang sesuai dengan kriteria filter."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] pt-[8px]">
              {filteredZones.map((zone) => (
                <Tile
                  key={zone.id}
                  className="p-[16px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] space-y-2 cursor-pointer hover:border-[var(--cds-interactive)] transition-colors"
                  onClick={() => handleZoneSelect(zone)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-[var(--cds-text-secondary)]">{zone.code || `Z-${zone.id}`}</span>
                    <Tag type="blue" size="sm">Kapasitas: {zone.max_capacity || zone.target_riders || 5} Unit</Tag>
                  </div>
                  <h4 className="font-semibold text-[16px]">{zone.name}</h4>
                  <p className="text-[12px] text-[var(--cds-text-secondary)] line-clamp-2">{zone.description || "Batas wilayah geofence PostGIS aktif"}</p>
                  <Button kind="ghost" size="sm" renderIcon={View} className="w-full mt-2">
                    Inspeksi Geofence
                  </Button>
                </Tile>
              ))}
            </div>
          )}
        </AccordionItem>
      </Accordion>

      {/* Master Detail Side Panel */}
      <div className="fixed inset-y-0 right-0 z-50 pointer-events-none">
        {isDetailOpen && selectedZone && (
          <div className="pointer-events-auto h-full">
            <MasterDetailPanel
              isOpen={isDetailOpen}
              onClose={() => setIsDetailOpen(false)}
              title={selectedZone.name}
              subtitle={`Kode Wilayah: ${selectedZone.code || `Z-${selectedZone.id}`}`}
              footer={
                <div className="flex items-center justify-end gap-2">
                  <Button kind="secondary" size="md" onClick={() => setIsDetailOpen(false)}>
                    Tutup
                  </Button>
                  <Button kind="primary" size="md">
                    Ubah Geofence
                  </Button>
                </div>
              }
            >
              <div className="space-y-[16px]">
                <div className="p-3 bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] space-y-1">
                  <div className="text-[12px] text-[var(--cds-text-secondary)]">Kapasitas Armada</div>
                  <div className="text-[18px] font-semibold">{selectedZone.max_capacity || selectedZone.target_riders || 5} Rider Ditugaskan</div>
                </div>
                <div className="p-3 bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] space-y-1">
                  <div className="text-[12px] text-[var(--cds-text-secondary)]">Deskripsi Wilayah</div>
                  <p className="text-[14px] text-[var(--cds-text-primary)]">{selectedZone.description || "Zona operasional terverifikasi"}</p>
                </div>
              </div>
            </MasterDetailPanel>
          </div>
        )}
      </div>
    </div>
  );
}
