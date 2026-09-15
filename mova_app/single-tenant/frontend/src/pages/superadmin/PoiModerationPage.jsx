import React, { useState } from "react";
import { Search, RefreshCw, Check, X } from "lucide-react";
import {
  Button,
  Input,
  Tag,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableToolbar,
  useToast,
} from "../../components/ui/index.js";
import { MOCK_POIS } from "./mockData.js";

export function PoiModerationPage() {
  const [pois, setPois] = useState(MOCK_POIS);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const filteredPois = pois.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Intelijen Titik Minat (58 Kategori)
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            POI Moderation & OSM Synchronization
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button
            kind="primary"
            size="md"
            icon={RefreshCw}
            onClick={() => toast.success("Sinkronisasi Selesai", "Data POI OpenStreetMap kota Sidoarjo berhasil disinkronkan.")}
          >
            Sync City OSM POI
          </Button>
        </div>
      </div>

      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <TableToolbar
          title="Daftar POI Terpetakan"
          description="Basis data titik POI perkantoran, sekolah, dan komersial sebagai input kriteria C1 & C2."
          actions={
            <div className="w-64">
              <Input
                id="poi-search"
                placeholder="Filter nama/kategori..."
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
              <TableHeader>Nama POI</TableHeader>
              <TableHeader>Kategori</TableHeader>
              <TableHeader>Wilayah Zona</TableHeader>
              <TableHeader className="text-right">Status Moderasi</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPois.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-[var(--cds-text-primary)]">{p.name}</TableCell>
                <TableCell>
                  <Tag type="blue" size="sm">{p.category}</Tag>
                </TableCell>
                <TableCell>{p.zone_name || "Alun-Alun Sidoarjo"}</TableCell>
                <TableCell className="text-right">
                  <Tag type="green" size="sm">APPROVED</Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default PoiModerationPage;
