import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * MOVA Design System v3.0 Table Components
 */
export function TableContainer({ children, className = "" }) {
  return (
    <div
      className={`w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] shadow-xs ${className}`}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children, className = "" }) {
  return (
    <table className={`w-full text-left border-collapse text-xs font-['Inter'] ${className}`}>
      {children}
    </table>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <thead
      className={`bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }) {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/60 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  selected = false,
  hoverable = true,
  onClick,
}) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-150 ${
        selected
          ? "bg-blue-50/60 dark:bg-blue-950/20"
          : hoverable
          ? "hover:bg-slate-50/80 dark:hover:bg-slate-850/50"
          : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className = "", width }) {
  return (
    <th
      style={width ? { width } : undefined}
      className={`px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300 select-none ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", width }) {
  return (
    <td
      style={width ? { width } : undefined}
      className={`px-4 py-3 text-slate-700 dark:text-slate-200 align-middle ${className}`}
    >
      {children}
    </td>
  );
}

export function TablePagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  className = "",
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-['Inter'] ${className}`}
    >
      <div className="flex items-center gap-2">
        <span>Tampilkan</span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[6px] px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        )}
        <span>
          Menampilkan <strong className="font-semibold text-slate-700 dark:text-slate-200">{startItem}-{endItem}</strong> dari{" "}
          <strong className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</strong> data
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="p-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 font-medium">
          Halaman {currentPage} dari {totalPages || 1}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="p-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
