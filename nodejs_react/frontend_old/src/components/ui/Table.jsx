import React from "react";
import { cn } from "../../lib/utils.js";

export function TableContainer({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs",
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
      className={cn("w-full text-left border-collapse text-xs md:text-sm", className)}
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
        "bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider",
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
      className={cn("divide-y divide-slate-100 font-medium text-slate-800", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={cn("hover:bg-slate-50/80 transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn("px-4 py-3 font-bold text-slate-700 select-none", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={cn("px-4 py-3 text-slate-800 align-middle", className)}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan = 1, message = "Tidak ada data yang tersedia.", className = "" }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn("p-6 text-center text-slate-400 text-xs italic", className)}
      >
        {message}
      </td>
    </tr>
  );
}
