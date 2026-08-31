import React from "react";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { useQuery } from "@tanstack/react-query";
import { salesService } from "../../services/salesService.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { formatCurrency, formatDate } from "../../lib/utils.js";
import { BarChart3, TrendingUp, Calendar, DollarSign } from "lucide-react";

export function ReportsPage() {
  const { data: salesOverviewRes, isLoading } = useQuery({
    queryKey: queryKeys.sales.overview(),
    queryFn: () => salesService.getOverview(),
  });

  const overview = salesOverviewRes?.data || salesOverviewRes || {};
  const summary = overview.summary || {};
  const salesByProduct = overview.sales_by_product || [];
  const salesByZone = overview.sales_by_zone || [];

  return (
    <AppLayout title="Laporan & Rekapitulasi" subtitle="Analitik Penjualan & Kinerja Operasional">
      <PageHeader
        title="Laporan Penjualan & Kinerja Zona"
        description="Ringkasan rekapitulasi performa penjualan produk dan kontribusi revenue per zona operasional."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan</span>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {formatCurrency(summary.total_revenue || 0)}
          </div>
          <p className="text-[11px] text-slate-500">{summary.total_cups || 0} Cangkir Terjual</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transaksi</span>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {summary.total_transactions || 0} Log POS
          </div>
          <p className="text-[11px] text-slate-500">Rata-rata: {formatCurrency(summary.average_transaction_value || 0)}/transaksi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Product */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-heading font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#FF5052]" />
            Performa Penjualan per Produk
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Produk</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {salesByProduct.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center text-slate-400">Belum ada data penjualan.</td></tr>
                ) : (
                  salesByProduct.map((p, idx) => (
                    <tr key={p.product_id || idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{p.product_name || p.name}</td>
                      <td className="p-3 text-center">{p.total_qty || p.qty || 0}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(p.total_revenue || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Zone */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-heading font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Kontribusi Revenue per Zona
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Nama Zona</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {salesByZone.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center text-slate-400">Belum ada data penjualan per zona.</td></tr>
                ) : (
                  salesByZone.map((z, idx) => (
                    <tr key={z.zone_id || idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{z.zone_name || z.name}</td>
                      <td className="p-3 text-center">{z.total_qty || z.qty || 0}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(z.total_revenue || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
