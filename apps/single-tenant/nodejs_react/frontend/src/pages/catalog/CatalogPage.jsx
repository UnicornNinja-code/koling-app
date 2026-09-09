import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { Table, TableContainer } from "../../components/ui/Table.jsx";
import { productService } from "../../services/productService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { formatCurrency } from "../../lib/utils.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Coffee,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Tag,
  TrendingUp,
  SlidersHorizontal,
  X,
  Lock,
} from "lucide-react";

export function CatalogPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperAdminOrManagement = user?.role === "SUPERADMIN" || user?.role === "MANAGEMENT";

  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name"); // 'name' | 'price'
  const [sortOrder, setSortOrder] = useState("ASC");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    status: "AVAILABLE",
  });

  // 1. Fetch Product Catalog Query
  const {
    data: productsRes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => productService.getAll(),
  });

  const products = useMemo(() => {
    return Array.isArray(productsRes)
      ? productsRes
      : productsRes?.data || productsRes?.products || [];
  }, [productsRes]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      return matchSearch && matchStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "price") {
        return sortOrder === "ASC" ? a.price - b.price : b.price - a.price;
      }
      return sortOrder === "ASC"
        ? (a.name || "").localeCompare(b.name || "")
        : (b.name || "").localeCompare(a.name || "");
    });

    return result;
  }, [products, searchQuery, statusFilter, sortBy, sortOrder]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.status === "AVAILABLE").length;
    const discontinued = total - available;
    const avgPrice = total > 0 ? products.reduce((acc, p) => acc + (Number(p.price) || 0), 0) / total : 0;
    return { total, available, discontinued, avgPrice };
  }, [products]);

  // 2. Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingProduct) {
        return await productService.update(editingProduct.id, payload);
      }
      return await productService.create(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      setModalOpen(false);
      setEditingProduct(null);
      setFormError(null);
      setActionAlert({
        type: "success",
        msg: data?.msg || `Produk berhasil ${editingProduct ? "diperbarui" : "ditambahkan"}.`,
      });
    },
    onError: (err) => {
      setFormError(err?.response?.data?.msg || "Gagal menyimpan data produk.");
    },
  });

  // 3. Status Toggle Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      return await productService.toggleStatus(id, newStatus);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      setActionAlert({
        type: "success",
        msg: data?.msg || "Status ketersediaan produk berhasil diubah.",
      });
    },
    onError: (err) => {
      setActionAlert({
        type: "error",
        msg: err?.response?.data?.msg || "Gagal memperbarui status produk.",
      });
    },
  });

  // 4. Delete Mutation (with Sales History Guard)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await productService.delete(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      setActionAlert({
        type: "success",
        msg: data?.msg || "Produk berhasil dihapus dari katalog.",
      });
    },
    onError: (err) => {
      setActionAlert({
        type: "error",
        msg: err?.response?.data?.msg || "Gagal menghapus produk. Produk mungkin memiliki riwayat penjualan.",
      });
    },
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: "", status: "AVAILABLE" });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      status: product.status || "AVAILABLE",
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Submit Modal Form
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Nama produk wajib diisi.");
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Harga produk harus berupa angka positif lebih dari 0.");
      return;
    }

    saveMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: priceNum,
      status: formData.status,
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#FAFAFA] text-[#171717] font-sans">
        {/* Workspace Top Header */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                  COMMERCIAL MASTER DATA
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  LIVE POS CATALOG
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#171717] mt-1 tracking-tight">
                Product Catalog & Pricing Workspace
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Master katalog menu minuman kopi keliling, konfigurasi harga jual satuan, dan status ketersediaan unit armada.
              </p>
            </div>

            {/* Top Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-8.5 px-3 border-[#E5E5E5] bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-md shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                Refresh
              </Button>

              {isSuperAdminOrManagement && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreate}
                  className="h-8.5 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-md shadow-2xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Tambah Produk Baru
                </Button>
              )}
            </div>
          </div>

          {/* Action Alert Banner */}
          {actionAlert && (
            <div className="mt-3">
              <Alert
                variant={actionAlert.type === "success" ? "success" : "danger"}
                title={actionAlert.type === "success" ? "Operasi Berhasil" : "Operasi Gagal"}
                onClose={() => setActionAlert(null)}
              >
                {actionAlert.msg}
              </Alert>
            </div>
          )}

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-100">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Total Produk
                </div>
                <div className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {isLoading ? "..." : stats.total}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Coffee className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Tersedia / Aktif
                </div>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">
                  {isLoading ? "..." : stats.available}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Nonaktif / Discontinued
                </div>
                <div className="text-lg font-bold text-neutral-600 mt-0.5">
                  {isLoading ? "..." : stats.discontinued}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-neutral-100 text-neutral-600 flex items-center justify-center border border-neutral-200">
                <XCircle className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Rata-rata Harga
                </div>
                <div className="text-lg font-bold text-neutral-900 font-mono mt-0.5">
                  {isLoading ? "..." : formatCurrency(stats.avgPrice)}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-3.5 rounded-md border border-[#E5E5E5] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search Box */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari nama produk atau deskripsi menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="AVAILABLE">Tersedia (AVAILABLE)</option>
                  <option value="DISCONTINUED">Nonaktif (DISCONTINUED)</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="min-w-[150px]">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sb, so] = e.target.value.split("-");
                    setSortBy(sb);
                    setSortOrder(so);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="name-ASC">Nama (A - Z)</option>
                  <option value="name-DESC">Nama (Z - A)</option>
                  <option value="price-ASC">Harga (Termurah)</option>
                  <option value="price-DESC">Harga (Termahal)</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-neutral-500 font-medium">
              Menampilkan <strong className="text-neutral-900">{filteredProducts.length}</strong> dari {products.length} menu
            </div>
          </div>

          {/* Catalog Data Table */}
          <div className="bg-white rounded-md border border-[#E5E5E5] shadow-2xs overflow-hidden">
            <TableContainer>
              <Table>
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-left">
                    <th className="py-2.5 px-3.5 w-12 text-center">#</th>
                    <th className="py-2.5 px-3.5">Nama Menu Minuman</th>
                    <th className="py-2.5 px-3.5">Deskripsi Produk</th>
                    <th className="py-2.5 px-3.5 text-right">Harga Jual Satuan</th>
                    <th className="py-2.5 px-3.5 text-center">Status Menu</th>
                    <th className="py-2.5 px-3.5 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                          <span>Memuat data katalog produk...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <ShoppingBag className="w-6 h-6 text-neutral-300" />
                          <span className="font-semibold text-neutral-700">Katalog Produk Kosong</span>
                          <span className="text-[11px] text-neutral-400">Belum ada menu minuman yang terdaftar pada sistem.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3.5 text-center text-neutral-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-neutral-900">
                          <div className="flex items-center gap-2">
                            <Coffee className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 text-neutral-600 max-w-md truncate">
                          {p.description || <span className="text-neutral-300 italic">-</span>}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-neutral-900">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          {p.status === "AVAILABLE" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              TERSEDIA
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                              NONAKTIF
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Status Button */}
                            {isSuperAdminOrManagement && (
                              <button
                                onClick={() =>
                                  toggleStatusMutation.mutate({
                                    id: p.id,
                                    newStatus: p.status === "AVAILABLE" ? "DISCONTINUED" : "AVAILABLE",
                                  })
                                }
                                disabled={toggleStatusMutation.isPending}
                                className={`inline-flex items-center px-2 py-1 text-[11px] font-medium rounded border shadow-2xs transition-colors ${
                                  p.status === "AVAILABLE"
                                    ? "text-neutral-700 bg-white hover:bg-neutral-100 border-neutral-200"
                                    : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                }`}
                              >
                                {p.status === "AVAILABLE" ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            )}

                            {/* Edit Button */}
                            {isSuperAdminOrManagement && (
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1 text-neutral-500 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded shadow-2xs transition-colors"
                                title="Edit Produk"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Button */}
                            {isSuperAdminOrManagement && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus produk "${p.name}" dari katalog?`)) {
                                    deleteMutation.mutate(p.id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="p-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded shadow-2xs transition-colors"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-bold text-sm text-[#171717]">
                    {editingProduct ? "Edit Data Menu Produk" : "Tambah Menu Produk Baru"}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <Alert variant="danger" title="Validasi Gagal">
                  {formError}
                </Alert>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nama Menu Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Kopi Susu Aren Spesial"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Harga Jual Satuan (IDR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Contoh: 15000"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Status Ketersediaan Awal
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="AVAILABLE">AVAILABLE (Tersedia untuk Penjualan)</option>
                    <option value="DISCONTINUED">DISCONTINUED (Nonaktif)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Deskripsi Menu Minuman
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Catatan bahan, takaran, atau spesifikasi menu..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E5E5] rounded-md text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                    className="px-3 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={saveMutation.isPending}
                    className="px-4 text-xs font-semibold"
                  >
                    {editingProduct ? "Simpan Perubahan" : "Tambahkan Produk"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
