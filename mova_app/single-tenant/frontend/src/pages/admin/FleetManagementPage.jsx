import React, { useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Battery,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit,
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
import { MOCK_FLEETS } from "./mockData.js";

export function FleetManagementPage() {
  const [fleets, setFleets] = useState(MOCK_FLEETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredFleets = fleets.filter((f) => {
    const matchesSearch = f.code.toLowerCase().includes(searchTerm.toLowerCase()) || f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
        <PageHeader
          title="Manajemen Armada Gerobak & IoT"
          subtitle="Inventaris unit gerobak keliling Sejuta Jiwa, status pemeliharaan, dan pemantauan baterai"
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Tambah Armada Baru
            </Button>
          }
        />

        <Card>
          <CardHeader
            title="Daftar Unit Armada Lapangan"
            subtitle="Status operasional dan penugasan rider"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari kode/nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { label: "Semua Status", value: "ALL" },
                    { label: "Aktif (Bertugas)", value: "ACTIVE" },
                    { label: "Tersedia (Hub)", value: "AVAILABLE" },
                    { label: "Maintenance", value: "MAINTENANCE" },
                  ]}
                  className="w-36 text-xs h-8"
                />
              </div>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Kode Unit</TableHeaderCell>
                  <TableHeaderCell>Nama & Tipe</TableHeaderCell>
                  <TableHeaderCell>Rider Bertugas</TableHeaderCell>
                  <TableHeaderCell>Status Operasi</TableHeaderCell>
                  <TableHeaderCell>Baterai IoT</TableHeaderCell>
                  <TableHeaderCell align="right">Aksi</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFleets.map((fleet) => (
                  <TableRow key={fleet.id}>
                    <TableCell>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {fleet.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{fleet.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {fleet.type === "GEROBAK_LISTRIK" ? "Gerobak Listrik (IoT)" : "Gerobak Manual"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {fleet.riderName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          fleet.status === "ACTIVE"
                            ? "ACTIVE"
                            : fleet.status === "AVAILABLE"
                            ? "SUCCESS"
                            : "WARNING"
                        }
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Battery className={`w-4 h-4 ${fleet.batteryPct > 50 ? "text-emerald-500" : fleet.batteryPct > 20 ? "text-amber-500" : "text-rose-500"}`} />
                        <span>{fleet.batteryPct}%</span>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        {fleet.status === "MAINTENANCE" ? (
                          <Button variant="secondary" size="sm" icon={CheckCircle2}>
                            Rilis Servis
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" icon={Wrench}>
                            Servis
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" icon={Edit}>
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Modal Tambah Armada */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Tambah Armada Baru"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" onClick={() => setIsAddModalOpen(false)}>
                Simpan Armada
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode Armada *
              </label>
              <Input placeholder="Contoh: ARM-009" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Unit
              </label>
              <Input placeholder="Contoh: Gerobak Jiwa 09" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Unit
              </label>
              <Select
                options={[
                  { label: "Gerobak Listrik (IoT Connected)", value: "GEROBAK_LISTRIK" },
                  { label: "Gerobak Manual", value: "GEROBAK_MANUAL" },
                ]}
              />
            </div>
          </div>
        </Modal>
      </div>
  );
}

export default FleetManagementPage;
