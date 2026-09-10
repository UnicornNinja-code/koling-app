import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA Table Component — Design System v3.0 SSOT
 * Matches exact UI table pattern in assets/img/operational rider.png (Daftar Rider):
 * - Clean enterprise font (Inter), no vertical borders
 * - Subtle neutral header background (#FAFAFA / dark: #18202F)
 * - Row height 44-48px with subtle row divider border
 */
export function TableContainer({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] bg-white dark:bg-[#131822] shadow-2xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Table({ className, children, ...props }) {
  return (
    <table
      className={cn("w-full text-left border-collapse text-xs md:text-sm font-sans", className)}
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead
      className={cn(
        "bg-[#FAFAFA] dark:bg-[#18202F] border-b border-[#E5E5E5] dark:border-[#1E293B] text-[#737373] dark:text-[#94A3B8] font-semibold text-[11px] uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody
      className={cn("divide-y divide-[#F0F0F0] dark:divide-[#1E293B] font-normal text-[#171717] dark:text-white", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ className, isSelected = false, children, ...props }) {
  return (
    <tr
      className={cn(
        "h-12 hover:bg-[#F9FAFB] dark:hover:bg-[#18202F]/60 transition-colors cursor-default",
        isSelected && "bg-blue-50/40 dark:bg-blue-950/30",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn("px-4 py-3 font-semibold text-[#737373] dark:text-[#94A3B8] select-none text-[11px]", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={cn("px-4 py-3 text-xs md:text-sm text-[#171717] dark:text-[#E2E8F0] align-middle", className)}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan = 5, message = "Tidak ada data tersedia", className = "", ...props }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn("px-4 py-12 text-center text-xs text-[#737373] dark:text-[#94A3B8]", className)}
        {...props}
      >
        {message}
      </td>
    </tr>
  );
}

export default {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
};
