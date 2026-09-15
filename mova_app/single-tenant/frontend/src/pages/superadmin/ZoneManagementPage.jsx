import React, { useState } from "react";
import { MapPin, Plus, Search, RefreshCw, Trash2, Edit } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Tag,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableToolbar,
  Modal,
  Drawer,
  useToast,
} from "../../components/ui/index.js";
import { MOCK_ZONES } from "./mockData.js";

export function ZoneManagementPage() {
  const [zones, setZones] = useState(MOCK_ZONES);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const toast = useToast();

  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    z.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Manajemen Topologi Wilayah Spasial
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            Zone Geofence Management (PostGIS)
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="primary" size="md" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Tambah Zona Baru
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <TableToolbar
          title="Daftar Poligon Wilayah Terdaftar"
          description="Konfigurasi poligon batas geofence, kapasitas maksimum armada, dan parameter area."
          actions={
            <div className="w-64">
              <Input
                id="zone-search-input"
                placeholder="Filter nama/kode..."
                icon={Search}
                size="sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          }
        />
        <Table>
          <TableHead>
            <TableRow isHeader>
              <TableHeader>Kode Zona</TableHeader>
              <TableHeader>Nama Wilayah</TableHeader>
              <TableHeader>Kapasitas Maksimal</TableHeader>
              <TableHeader>Luas Area</TableHeader>
              <TableHeader>Titik POI</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader className="text-right">Aksi</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredZones.map((z) => (
              <TableRow key={z.id}>
                <TableCell className="font-mono text-[12px] font-semibold text-[var(--cds-text-primary)]">
                  {z.code}
                </TableCell>
                <TableCell className="font-medium">{z.name}</TableCell>
                <TableCell>{z.max_capacity || 4} Gerobak</TableCell>
                <TableCell className="font-mono">{z.area_km2 || 1.85} km²</TableCell>
                <TableCell>{z.total_pois || 38} POI</TableCell>
                <TableCell>
                  <Tag type={z.status === "ACTIVE" ? "green" : "gray"} size="sm">
                    {z.status || "ACTIVE"}
                  </Tag>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button kind="ghost" size="sm" onClick={() => setSelectedZone(z)}>
                      Edit
                    </Button>
                    <Button
                      kind="danger-ghost"
                      size="sm"
                      onClick={() => toast.warning("Penghapusan Diblokir", "Zona memiliki relasi data historis aktif.")}
                    >
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrasi Poligon Zona Baru"
        label="POSTGIS SPATIAL TOPOLOGY"
        primaryButtonText="Simpan Zona"
        secondaryButtonText="Batal"
        onPrimarySubmit={() => {
          toast.success("Zona Dibuat", "Data poligon wilayah berhasil disimpan ke PostgreSQL PostGIS.");
          setIsCreateModalOpen(false);
        }}
      >
        <div className="space-y-[var(--cds-spacing-04)]">
          <Input id="new-zone-name" label="Nama Wilayah Zona" placeholder="e.g. Kawasan GOR Sidoarjo" />
          <Input id="new-zone-code" label="Kode Unik Zona" placeholder="e.g. Z-GOR-05" />
          <Input id="new-zone-cap" label="Kapasitas Maksimal Armada (Unit)" type="number" defaultValue="4" />
          <Select
            id="new-zone-status"
            label="Status Operasional"
            options={[
              { value: "ACTIVE", label: "Aktif (Tersedia untuk Alokasi FIFO)" },
              { value: "INACTIVE", label: "Non-Aktif (Ditutup Sementara)" },
            ]}
          />
        </div>
      </Modal>

      {/* Edit Drawer */}
      {selectedZone && (
        <Drawer
          isOpen={Boolean(selectedZone)}
          onClose={() => setSelectedZone(null)}
          title={`Edit Zona: ${selectedZone.name}`}
          subtitle={`Kode: ${selectedZone.code}`}
          footer={
            <div className="p-[16px] flex items-center justify-end gap-[var(--cds-spacing-03)]">
              <Button kind="secondary" size="md" onClick={() => setSelectedZone(null)}>
                Tutup
              </Button>
              <Button
                kind="primary"
                size="md"
                onClick={() => {
                  toast.success("Perubahan Disimpan", "Kapasitas dan parameter zona diperbarui.");
                  setSelectedZone(null);
                }}
              >
                Simpan
              </Button>
            </div>
          }
        >
          <div className="space-y-[var(--cds-spacing-04)]">
            <Input id="edit-name" label="Nama Wilayah" defaultValue={selectedZone.name} />
            <Input id="edit-cap" label="Kapasitas Maksimal" defaultValue={selectedZone.max_capacity} />
            <Select
              id="edit-status"
              label="Status Operasional"
              defaultValue={selectedZone.status || "ACTIVE"}
              options={[
                { value: "ACTIVE", label: "Aktif" },
                { value: "INACTIVE", label: "Non-Aktif" },
              ]}
            />
          </div>
        </Drawer>
      )}
    </div>
  );
}

export default ZoneManagementPage;
