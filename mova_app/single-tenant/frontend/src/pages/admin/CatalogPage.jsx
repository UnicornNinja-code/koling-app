import React, { useState } from "react";
import {
  Card,
  Button,
  Table,
  Badge,
  Input,
  Select,
  Modal,
  PageHeader,
  MetricCard,
} from "../../components/ui/index.js";
import {
  Coffee,
  Plus,
  Search,
  SlidersHorizontal,
  Package,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Edit2,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import { MOCK_PRODUCTS } from "./mockData.js";

export default function CatalogPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Signature Coffee",
    price: "",
    status: "AVAILABLE",
    description: "",
  });

  const categories = ["ALL", "Signature Coffee", "Black Coffee", "Milk Coffee", "Non-Coffee", "Tea Series"];

  const filteredProducts = products.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "ALL" || item.category === categoryFilter;
    const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Signature Coffee",
      price: "",
      status: "AVAILABLE",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      status: prod.status,
      description: prod.description || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "AVAILABLE" ? "OUT_OF_STOCK" : "AVAILABLE" }
          : p
      )
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...formData, price: Number(formData.price) }
            : p
        )
      );
    } else {
      const newProd = {
        id: `PRD-00${products.length + 1}`,
        ...formData,
        price: Number(formData.price) || 15000,
        salesCount: 0,
      };
      setProducts((prev) => [...prev, newProd]);
    }
    setIsModalOpen(false);
  };

  const activeCount = products.filter((p) => p.status === "AVAILABLE").length;
  const outOfStockCount = products.filter((p) => p.status === "OUT_OF_STOCK").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Katalog Produk Minuman"
          subtitle="Manajemen menu kopi keliling, kategori, penetapan harga, dan ketersediaan stok."
        />
        <Button onClick={handleOpenAdd} className="flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Menu"
          value={products.length}
          icon={<Coffee className="w-5 h-5 text-brand-500" />}
          trend={`${categories.length - 1} Kategori Aktif`}
          trendDirection="neutral"
        />
        <MetricCard
          title="Stok Tersedia"
          value={activeCount}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          trend="Siap dijual rider"
          trendDirection="up"
        />
        <MetricCard
          title="Stok Habis"
          value={outOfStockCount}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          trend="Perlu restock hub"
          trendDirection={outOfStockCount > 0 ? "down" : "neutral"}
        />
        <MetricCard
          title="Total Penjualan Hari Ini"
          value={products.reduce((acc, p) => acc + (p.salesCount || 0), 0)}
          icon={<Package className="w-5 h-5 text-indigo-500" />}
          trend="Cup terjual"
          trendDirection="up"
        />
      </div>

      {/* Filter & View Controls */}
      <Card className="p-4 bg-surface border-theme">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Cari nama produk / ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-text-muted hidden sm:block" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "Semua Kategori" : c}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="AVAILABLE">Tersedia</option>
                <option value="OUT_OF_STOCK">Stok Habis</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant={viewMode === "table" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Tabel
            </Button>
            <Button
              variant={viewMode === "grid" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              Grid Menu
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content: Table or Grid */}
      {viewMode === "table" ? (
        <Card className="p-0 overflow-hidden border-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-subtle border-b border-theme text-text-secondary uppercase text-xs">
                <tr>
                  <th className="px-6 py-3.5">Kode</th>
                  <th className="px-6 py-3.5">Nama Produk</th>
                  <th className="px-6 py-3.5">Kategori</th>
                  <th className="px-6 py-3.5">Harga Jual</th>
                  <th className="px-6 py-3.5">Status Ketersediaan</th>
                  <th className="px-6 py-3.5">Terjual Hari Ini</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-text-primary">{prod.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary">{prod.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{prod.category}</Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-text-primary">
                      Rp {prod.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(prod.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          prod.status === "AVAILABLE"
                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${prod.status === "AVAILABLE" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {prod.status === "AVAILABLE" ? "Tersedia" : "Stok Habis"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-text-primary">{prod.salesCount || 0}</span>
                      <span className="text-xs text-text-muted ml-1">cup</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(prod)}
                          title="Edit Produk"
                        >
                          <Edit2 className="w-4 h-4 text-text-muted hover:text-brand-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(prod.id)}
                          title="Ubah Status"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-text-muted hover:text-brand-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-text-muted">
                      Tidak ada produk yang cocok dengan pencarian / filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => (
            <Card key={prod.id} className="p-4 flex flex-col justify-between border-theme hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline">{prod.category}</Badge>
                  <button
                    onClick={() => handleToggleStatus(prod.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                      prod.status === "AVAILABLE"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {prod.status === "AVAILABLE" ? "Tersedia" : "Habis"}
                  </button>
                </div>
                <h4 className="font-bold text-text-primary text-base mb-1">{prod.name}</h4>
                <p className="font-mono text-xs text-text-muted mb-3">{prod.id}</p>
              </div>

              <div className="pt-3 border-t border-theme flex items-center justify-between">
                <div>
                  <div className="text-xs text-text-muted">Harga Jual</div>
                  <div className="font-bold text-brand-500 text-lg">
                    Rp {prod.price.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(prod)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Produk Minuman" : "Tambah Menu Produk Baru"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Nama Produk
            </label>
            <Input
              required
              placeholder="Contoh: Kopi Susu Aren Spesial"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
              >
                {categories.filter((c) => c !== "ALL").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Harga (Rp)
              </label>
              <Input
                type="number"
                required
                placeholder="15000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Status Ketersediaan
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none"
            >
              <option value="AVAILABLE">Tersedia (Ready to Sell)</option>
              <option value="OUT_OF_STOCK">Stok Habis (Out of Stock)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Deskripsi Menu / Varian (Opsional)
            </label>
            <textarea
              rows="3"
              placeholder="Deskripsi singkat racikan atau takaran bahan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border border-theme text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-theme">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? "Simpan Perubahan" : "Tambahkan Produk"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
