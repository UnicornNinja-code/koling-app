import React, { useState, useEffect } from "react";
import {
  Bike,
  Clock,
  MapPin,
  ShoppingCart,
  CheckCircle2,
  Plus,
  Minus,
  AlertTriangle,
  Lock,
  LogOut,
} from "lucide-react";
import {
  Button,
  Tag,
  Input,
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

export function OperationalRiderPage() {
  const [sessionState, setSessionState] = useState("OPERATING"); // ASSIGNED | HOLD | OPERATING | COMPLETED
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(240);
  const [cart, setCart] = useState({});
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (sessionState === "HOLD" && holdSecondsLeft > 0) {
      const timer = setInterval(() => setHoldSecondsLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [sessionState, holdSecondsLeft]);

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const totalSalesAmount = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = MOCK_PRODUCTS.find((p) => p.id === pId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const handleRecordSale = () => {
    if (Object.keys(cart).length === 0) {
      toast.warning("Keranjang Kosong", "Pilih minimal 1 produk kopi untuk dicatat.");
      return;
    }
    toast.success("Transaksi Dicatat", `Penjualan sebesar Rp ${totalSalesAmount.toLocaleString("id-ID")} berhasil direkam.`);
    setCart({});
  };

  const handleCheckoutSession = () => {
    setSessionState("COMPLETED");
    setIsCheckoutModalOpen(false);
    toast.success("Shift Selesai", "Sesi operasional ditutup, armada G-01 dilepaskan kembali ke status ACTIVE.");
  };

  return (
    <div className="space-y-[var(--cds-spacing-06)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--cds-border-subtle)] pb-[16px] gap-[var(--cds-spacing-04)]">
        <div>
          <span className="cds-label-01 text-[var(--cds-text-secondary)] uppercase tracking-wider">
            Terminal Lapangan & Mobile POS
          </span>
          <h2 className="cds-heading-03 text-[var(--cds-text-primary)] font-semibold mt-[2px]">
            Rider Operational Workspace (HUD)
          </h2>
        </div>

        <div className="flex items-center gap-[var(--cds-spacing-03)]">
          <Tag type={sessionState === "OPERATING" ? "green" : "yellow"}>
            STATUS SESI: {sessionState}
          </Tag>
          {sessionState === "OPERATING" && (
            <Button kind="danger" size="md" icon={LogOut} onClick={() => setIsCheckoutModalOpen(true)}>
              Tutup Shift & Checkout
            </Button>
          )}
        </div>
      </div>

      {/* Operational State Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--cds-spacing-04)]">
        <div className="bg-[var(--cds-layer-01)] p-[16px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-01)]">
          <span className="cds-label-01 text-[var(--cds-text-secondary)]">ZONA PENUGASAN AKTIF</span>
          <div className="flex items-center gap-[var(--cds-spacing-02)]">
            <MapPin className="w-4 h-4 text-[var(--cds-interactive)]" />
            <h4 className="cds-heading-02 font-semibold text-[var(--cds-text-primary)]">Alun-Alun Sidoarjo (Z-SDA-01)</h4>
          </div>
          <p className="cds-helper-text-01 text-[var(--cds-support-success)]">Check-In Spasial Valid (ST_Covers True)</p>
        </div>

        <div className="bg-[var(--cds-layer-01)] p-[16px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-01)]">
          <span className="cds-label-01 text-[var(--cds-text-secondary)]">ARMADA DIKUNCI</span>
          <div className="flex items-center gap-[var(--cds-spacing-02)]">
            <Bike className="w-4 h-4 text-[var(--cds-icon-secondary)]" />
            <h4 className="cds-heading-02 font-semibold font-mono text-[var(--cds-text-primary)]">GEROBAK-SDA-01</h4>
          </div>
          <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">Status: IN_USE (Terkunci Sesi Ini)</p>
        </div>

        <div className="bg-[var(--cds-layer-01)] p-[16px] border border-[var(--cds-border-subtle)] space-y-[var(--cds-spacing-01)]">
          <span className="cds-label-01 text-[var(--cds-text-secondary)]">OMZET SHIFT BERJALAN</span>
          <div className="cds-heading-04 font-mono font-bold text-[var(--cds-interactive)]">
            Rp 425.000
          </div>
          <p className="cds-helper-text-01 text-[var(--cds-text-secondary)]">28 Cup Terjual Hari Ini</p>
        </div>
      </div>

      {/* Mobile POS Commercial Sales Entry */}
      <div className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)]">
        <TableToolbar
          title="Entri Penjualan Kasir Lapangan (Mobile POS)"
          description="Pilih kuantitas produk yang terjual untuk mencatat transaksi langsung ke PostgreSQL sales logs."
          actions={
            <Button kind="primary" size="md" icon={ShoppingCart} onClick={handleRecordSale}>
              Rekam Transaksi (Rp {totalSalesAmount.toLocaleString("id-ID")})
            </Button>
          }
        />
        <Table>
          <TableHead>
            <TableRow isHeader>
              <TableHeader>Produk SKU</TableHeader>
              <TableHeader>Kategori</TableHeader>
              <TableHeader>Harga Satuan</TableHeader>
              <TableHeader className="text-center">Kuantitas</TableHeader>
              <TableHeader className="text-right">Subtotal</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_PRODUCTS.map((p) => {
              const qty = cart[p.id] || 0;
              const subtotal = qty * p.price;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-[var(--cds-text-primary)]">
                    {p.name}
                  </TableCell>
                  <TableCell>
                    <Tag type="gray" size="sm">{p.category || "Beverage"}</Tag>
                  </TableCell>
                  <TableCell className="font-mono">Rp {p.price.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-[var(--cds-spacing-02)] bg-[var(--cds-layer-02)] p-1 border border-[var(--cds-border-subtle)]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(p.id, -1)}
                        className="p-1 hover:bg-[var(--cds-layer-hover-02)] text-[var(--cds-icon-primary)] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-[13px]">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(p.id, 1)}
                        className="p-1 hover:bg-[var(--cds-layer-hover-02)] text-[var(--cds-icon-primary)] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-[var(--cds-text-primary)]">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Checkout Shift Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Konfirmasi Penutupan Shift & Serah Terima Armada"
        label="SESSION RECONCILIATION"
        primaryButtonText="Konfirmasi Checkout"
        secondaryButtonText="Batal"
        danger
        onPrimarySubmit={handleCheckoutSession}
      >
        <div className="space-y-[var(--cds-spacing-03)]">
          <p className="cds-body-compact-01 text-[var(--cds-text-primary)]">
            Apakah Anda yakin ingin menyelesaikan shift kerja hari ini? Transaksi baru akan dinonaktifkan dan armada akan dilepaskan kembali ke gudang operasional.
          </p>
          <div className="p-[12px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] space-y-1 text-[12px] font-mono">
            <div>Total Omzet Shift: Rp 425.000</div>
            <div>Total Cup Terjual: 28 Cup</div>
            <div>Status Kepatuhan: 100% Compliant</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default OperationalRiderPage;
