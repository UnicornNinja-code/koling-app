import React from "react";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/productService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { formatCurrency } from "../../lib/utils.js";
import { Coffee, Tag, ShoppingBag, CheckCircle2 } from "lucide-react";

export function CatalogPage() {
  const { data: productsRes, isLoading } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => productService.getAll(),
  });

  const products = productsRes?.data || productsRes?.products || [];

  return (
    <AppLayout title="Katalog Produk" subtitle="Manajemen Menu & Harga Minuman">
      <PageHeader
        title="Daftar Katalog Produk Minuman"
        description="Master data menu kopi dan minuman yang tersedia untuk penjualan keliling oleh Rider."
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-5 md:p-6 mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-heading font-extrabold text-slate-900 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-[#FF5052]" />
            Daftar Produk Aktif ({products.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="p-3">Nama Produk</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {isLoading ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400">Memuat katalog...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400">Belum ada produk terdaftar.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">{formatCurrency(p.price)}</td>
                    <td className="p-3 text-center">
                      <StatusBadge variant={p.status === "AVAILABLE" ? "success" : "neutral"}>
                        {p.status === "AVAILABLE" ? "TERSEDIA" : "NONAKTIF"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
