import React, { useState } from "react";
import {
  Map,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Users,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  StatusBadge,
  Input,
  Select,
  Modal,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  PageHeader,
} from "../../components/ui/index.js";
import { MOCK_ZONES } from "./mockData.js";

export function ZoneManagementPage() {
  const [zones, setZones] = useState(MOCK_ZONES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(searchTerm.toLowerCase()) || z.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <PageHeader
          title="Manajemen Zona Operasional (Geofence)"
          subtitle="Master data poligon wilayah jualan, kapasitas armada, dan batas toleransi spasial PostGIS"
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Tambah Zona Baru
            </Button>
          }
        />

        <Card>
          <CardHeader
            title="Daftar Master Zona Terdaftar"
            subtitle="Seluruh poligon zona operasional di wilayah Kabupaten Sidoarjo"
            action={
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari nama atau kode zona..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Kode Zona</TableHeaderCell>
                  <TableHeaderCell>Nama Wilayah Operasional</TableHeaderCell>
                  <TableHeaderCell>Kapasitas Maksimal</TableHeaderCell>
                  <TableHeaderCell>Jumlah POI</TableHeaderCell>
                  <TableHeaderCell>Ranking TOPSIS</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell align="right">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredZones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {zone.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white">{zone.name}</div>
                      <div className="text-[11px] text-slate-400">4 Titik Simpul Poligon Geofence</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-xs">
                        {zone.maxCapacity} Unit Gerobak
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {zone.poiCount} POI
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" size="sm">
                        Rank #{zone.rank} (Ci: {zone.score})
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="ACTIVE" size="sm" />
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" icon={Edit}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-red-500 hover:text-red-600">
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Modal Tambah Zona */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Tambah Zona Geofence Baru"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" onClick={() => setIsAddModalOpen(false)}>
                Simpan Zona
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Zona Operasional *
              </label>
              <Input placeholder="Contoh: Kawasan Alun-Alun Sidoarjo" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi Wilayah
              </label>
              <Input placeholder="Area komersial dan perkantoran" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kapasitas Maksimal (Rider)
                </label>
                <Input type="number" defaultValue={10} />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <Select
                  options={[
                    { label: "Aktif", value: "ACTIVE" },
                    { label: "Nonaktif", value: "INACTIVE" },
                    { label: "Maintenance", value: "MAINTENANCE" },
                  ]}
                />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300">Tips Menggambar Poligon:</span> Gunakan tool polygon draw pada modul Map Ops untuk menentukan titik batas koordinat spasial PostGIS secara presisi.
            </div>
          </div>
        </Modal>
      </div>
  );
}

export default ZoneManagementPage;
