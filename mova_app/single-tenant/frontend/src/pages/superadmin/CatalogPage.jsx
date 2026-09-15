import React, { useState } from "react";
import { Package, Plus, Search } from "lucide-react";
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
  Modal,
  useToast,
} from "../../components/ui/index.js";
import { MOCK_PRODUCTS } from "./mockData.js";

export function CatalogPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Katalog Produk & Margin Komersial
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            Commercial Product Catalog (SKU)
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Button kind="primary" size="md" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Tambah SKU Produk
          </Button>
        </div>
      </div>

      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <TableToolbar
          title="Daftar Menu & Harga Jual Lapangan"
          description="Konfigurasi harga jual konsumen, HPP/Modal dasar, dan estimasi margin kotor."
        />
        <Table>
          <TableHead>
            <TableRow isHeader>
              <TableHeader>Nama Produk</TableHeader>
              <TableHeader>Kategori</TableHeader>
              <TableHeader>Harga Jual</TableHeader>
              <TableHeader>Harga Pokok (HPP)</TableHeader>
              <TableHeader>Gross Margin</TableHeader>
              <TableHeader className="text-right">Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => {
              const hpp = p.hpp || Math.round(p.price * 0.45);
              const margin = Math.round(((p.price - hpp) / p.price) * 100);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-[var(--cds-text-primary)]">{p.name}</TableCell>
                  <TableCell>
                    <Tag type="gray" size="sm">{p.category || "Beverage"}</Tag>
                  </TableCell>
                  <TableCell className="font-mono font-bold">Rp {p.price.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="font-mono text-[var(--cds-text-secondary)]">Rp {hpp.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="font-mono font-semibold text-[var(--cds-support-success)]">{margin}%</TableCell>
                  <TableCell className="text-right">
                    <Tag type={p.status === "ACTIVE" ? "green" : "gray"} size="sm">
                      {p.status || "ACTIVE"}
                    </Tag>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Produk Baru ke Menu"
        label="COMMERCIAL CATALOG"
        primaryButtonText="Simpan SKU"
        secondaryButtonText="Batal"
        onPrimarySubmit={() => {
          toast.success("Produk Ditambahkan", "Menu baru tersedia di POS kasir rider.");
          setIsModalOpen(false);
        }}
      >
        <div className="space-y-[var(--cds-spacing-04)]">
          <Input id="prod-name" label="Nama Minuman / Produk" placeholder="e.g. Kopi Susu Aren Spesial" />
          <Input id="prod-price" label="Harga Jual Konsumen (Rp)" type="number" defaultValue="15000" />
          <Input id="prod-hpp" label="HPP / Biaya Bahan Baku (Rp)" type="number" defaultValue="7000" />
        </div>
      </Modal>
    </div>
  );
}

export default CatalogPage;
