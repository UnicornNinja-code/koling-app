import React, { useState } from "react";
import { GitPullRequest, Users, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import {
  Button,
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
import { MOCK_ZONES, MOCK_RIDERS } from "./mockData.js";

export function DistributionPage() {
  const [riders, setRiders] = useState(MOCK_RIDERS);
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const toast = useToast();

  const waitingQueue = riders.filter((r) => r.status === "ASSIGNED" || r.status === "WAITING");
  const assignedRiders = riders.filter((r) => r.status === "OPERATING" || r.status === "CLAIMED");

  const handleExecuteAutoAssign = () => {
    toast.success("Distribusi Berhasil", "Seluruh rider dalam antrean FIFO telah dipasangkan dengan zona TOPSIS.");
    setIsAutoAssignModalOpen(false);
  };

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Alokasi Tugas & Antrean Lapangan
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            FIFO Fleet Distribution & Zone Assignment
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="primary" size="md" icon={GitPullRequest} onClick={() => setIsAutoAssignModalOpen(true)}>
            Auto-Assign Antrean FIFO
          </Button>
        </div>
      </div>

      {/* Grid: FIFO Queue (Left) vs Active Assignments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--cds-spacing-05)]">
        {/* Waiting Queue (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] flex flex-col">
          <div className="p-[16px] border-b border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)] flex items-center justify-between">
            <div>
              <h3 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
                Antrean Tugas FIFO ({waitingQueue.length} Rider)
              </h3>
              <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">Urutan kedatangan check-in tugas shift.</p>
            </div>
            <Tag type="yellow" size="sm">Menunggu</Tag>
          </div>

          <div className="p-[16px] flex-1 space-y-[var(--cds-spacing-03)] overflow-y-auto">
            {waitingQueue.length === 0 ? (
              <p className="cds-body-compact-01 text-[var(--cds-text-secondary)] text-center py-8">
                Tidak ada rider dalam antrean tunggu.
              </p>
            ) : (
              waitingQueue.map((r, i) => (
                <div key={r.id} className="p-[12px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-[var(--cds-spacing-03)]">
                    <span className="w-6 h-6 flex items-center justify-center font-mono font-bold text-[12px] bg-[var(--cds-layer-03)] text-[var(--cds-text-primary)]">
                      #{i + 1}
                    </span>
                    <div>
                      <h5 className="cds-heading-compact-01 text-[var(--cds-text-primary)] font-semibold text-[13px]">{r.name}</h5>
                      <span className="cds-label-01 font-mono text-[var(--cds-text-secondary)] text-[11px]">{r.armada_code}</span>
                    </div>
                  </div>
                  <Tag type="blue" size="sm">FIFO #{i + 1}</Tag>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Assignments Table (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] flex flex-col">
          <div className="p-[16px] border-b border-[var(--cds-border-subtle)] bg-[var(--cds-layer-02)] flex items-center justify-between">
            <div>
              <h3 className="cds-heading-02 text-[var(--cds-text-primary)] font-semibold">
                Penugasan Aktif Lapangan ({assignedRiders.length} Pasangan)
              </h3>
              <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">Rider yang sedang mengunci armada dan beroperasi di zona.</p>
            </div>
            <Tag type="green" size="sm">Aktif</Tag>
          </div>

          <Table>
            <TableHead>
              <TableRow isHeader>
                <TableHeader>Rider</TableHeader>
                <TableHeader>Armada</TableHeader>
                <TableHeader>Zona Terpilih</TableHeader>
                <TableHeader>Status Sesi</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedRiders.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-[var(--cds-text-primary)]">{r.name}</TableCell>
                  <TableCell className="font-mono text-[12px]">{r.armada_code}</TableCell>
                  <TableCell className="font-medium">{r.zone_name || "Alun-Alun Sidoarjo"}</TableCell>
                  <TableCell>
                    <Tag type={r.status === "OPERATING" ? "green" : "blue"} size="sm">
                      {r.status}
                    </Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Auto Assign Confirmation Modal */}
      <Modal
        isOpen={isAutoAssignModalOpen}
        onClose={() => setIsAutoAssignModalOpen(false)}
        title="Konfirmasi Eksekusi Algoritma Distribusi FIFO"
        label="DISPATCH ORCHESTRATION"
        primaryButtonText="Jalankan Distribusi"
        secondaryButtonText="Batal"
        onPrimarySubmit={handleExecuteAutoAssign}
      >
        <div className="space-y-[var(--cds-spacing-03)]">
          <p className="cds-body-compact-01 text-[var(--cds-text-primary)]">
            Sistem akan secara otomatis memasangkan {waitingQueue.length} rider antrean terdepan dengan zona-zona peringkat teratas hasil komputasi model <strong>BWM-TOPSIS</strong> saat ini.
          </p>
          <div className="p-[12px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] cds-label-01 text-[var(--cds-text-secondary)]">
            Aturan: Maksimal kuota per zona tidak boleh dilanggar (Kapasitas PostGIS Enforcement).
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DistributionPage;
