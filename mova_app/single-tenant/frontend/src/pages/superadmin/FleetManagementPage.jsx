import React, { useState } from "react";
import { Truck, Plus, Search, RefreshCw, Key } from "lucide-react";
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
  useToast,
} from "../../components/ui/index.js";
import { MOCK_FLEETS } from "./mockData.js";

export function FleetManagementPage() {
  const [armadas, setArmadas] = useState(MOCK_FLEETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleReleaseArmada = (id) => {
    setArmadas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "ACTIVE", current_rider: "-" } : a))
    );
    toast.success("Armada Dilepas", "Status unit dikembalikan menjadi ACTIVE dan dapat dipasangkan kembali.");
  };

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Inventori Aset & Status Telemetri
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            Armada & Fleet Management
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="primary" size="md" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Registrasi Armada
          </Button>
        </div>
      </div>

      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <TableToolbar
          title="Daftar Unit Armada Operasional"
          description="Status ketersediaan unit gerobak dan motor listrik untuk penugasan rider."
        />
        <Table>
          <TableHead>
            <TableRow isHeader>
              <TableHeader>Kode Armada</TableHeader>
              <TableHeader>Tipe Kendaraan</TableHeader>
              <TableHeader>Rider Saat Ini</TableHeader>
              <TableHeader>Status Aset</TableHeader>
              <TableHeader className="text-right">Aksi</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {armadas.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono font-bold text-[13px] text-[var(--cds-text-primary)]">
                  {a.code}
                </TableCell>
                <TableCell>{a.type || "Gerobak Manual"}</TableCell>
                <TableCell className="font-medium">{a.current_rider || "-"}</TableCell>
                <TableCell>
                  <Tag
                    type={
                      a.status === "ACTIVE"
                        ? "green"
                        : a.status === "IN_USE"
                        ? "blue"
                        : a.status === "HOLD"
                        ? "yellow"
                        : "gray"
                    }
                    size="sm"
                  >
                    {a.status}
                  </Tag>
                </TableCell>
                <TableCell className="text-right">
                  {a.status !== "ACTIVE" && (
                    <Button kind="ghost" size="sm" onClick={() => handleReleaseArmada(a.id)}>
                      Rilis Unit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrasi Unit Armada Baru"
        label="ASSET REGISTRATION"
        primaryButtonText="Simpan Armada"
        secondaryButtonText="Batal"
        onPrimarySubmit={() => {
          toast.success("Armada Terdaftar", "Unit baru berhasil ditambahkan ke inventori.");
          setIsModalOpen(false);
        }}
      >
        <div className="space-y-[var(--cds-spacing-04)]">
          <Input id="new-armada-code" label="Kode Unik Armada" placeholder="e.g. GEROBAK-SDA-09" />
          <Select
            id="new-armada-type"
            label="Tipe Kendaraan"
            options={[
              { value: "gerobak", label: "Gerobak Dorong Manual" },
              { value: "motor_listrik", label: "Motor Listrik Kopi Keliling" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}

export default FleetManagementPage;
