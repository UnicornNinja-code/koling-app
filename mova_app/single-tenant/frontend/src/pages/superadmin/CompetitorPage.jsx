import React, { useState } from "react";
import { Crosshair, Plus, Trash2 } from "lucide-react";
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
import { MOCK_COMPETITORS } from "./mockData.js";

export function CompetitorPage() {
  const [competitors, setCompetitors] = useState(MOCK_COMPETITORS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Survei Lapangan & Skor Kriteria C6
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            Competitor Geo-Surveys & Density Index
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="primary" size="md" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Catat Survei Kompetitor
          </Button>
        </div>
      </div>

      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <TableToolbar
          title="Daftar Entitas Kompetitor Lapangan"
          description="Titik kompetitor (Kopi Kenangan, Tomoro, Point Coffee, dll.) yang mempengaruhi skor kriteria C6."
        />
        <Table>
          <TableHead>
            <TableRow isHeader>
              <TableHeader>Nama Brand / Outlet</TableHeader>
              <TableHeader>Kategori</TableHeader>
              <TableHeader>Bobot Tekanan (1-3)</TableHeader>
              <TableHeader>Zona Terkait</TableHeader>
              <TableHeader className="text-right">Aksi</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {competitors.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-[var(--cds-text-primary)]">{c.name}</TableCell>
                <TableCell>
                  <Tag type="yellow" size="sm">{c.brand || "Coffee Chain"}</Tag>
                </TableCell>
                <TableCell className="font-mono font-bold">Bobot {c.weight || 2}</TableCell>
                <TableCell>{c.zone_name || "Alun-Alun Sidoarjo"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    kind="danger-ghost"
                    size="sm"
                    onClick={() => {
                      setCompetitors((prev) => prev.filter((item) => item.id !== c.id));
                      toast.success("Dihapus", "Titik kompetitor dihapus dari kalkulasi C6.");
                    }}
                  >
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Titik Temuan Kompetitor"
        label="FIELD COMPETITOR SURVEY"
        primaryButtonText="Simpan Titik"
        secondaryButtonText="Batal"
        onPrimarySubmit={() => {
          toast.success("Survei Disimpan", "Titik kompetitor berhasil ditambahkan ke PostGIS.");
          setIsModalOpen(false);
        }}
      >
        <div className="space-y-[var(--cds-spacing-04)]">
          <Input id="comp-name" label="Nama Outlet / Gerai" placeholder="e.g. Tomoro Coffee Taman Pinang" />
          <Select
            id="comp-brand"
            label="Kategori Brand"
            options={[
              { value: "chain", label: "Modern Coffee Chain (Bobot 3)" },
              { value: "minimarket", label: "Minimarket Ready-to-Drink (Bobot 2)" },
              { value: "warkop", label: "Warkop Tradisional (Bobot 1)" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}

export default CompetitorPage;
